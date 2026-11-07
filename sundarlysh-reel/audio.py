"""Synthesises the 18 s soundtrack for the Sundarlysh workshop teaser.

Everything is generated from scratch with numpy (no samples, no licensing
issues). It also writes timeline.json so the visuals hit exactly on the beat.

120 BPM -> 1 beat = 0.5 s, 1 bar = 2 s, 16th = 0.125 s.
  0.0 - 4.0   intro: heartbeat, word slams, riser + snare roll, gap
  4.0         DROP 1 (logo reveal)
  4.0 - 12.0  groove (bars 3-6), stabs join at 8.0
 12.0 - 14.0  breakdown: "are you ready?" + 3-2-1 braams, riser, gap
 14.0         DROP 2 (final lockup)
 17.0         final impact, ring-out to 18.0
"""
import json
import sys
import wave

import numpy as np

SR = 44100
DUR = 18.0
N = int(SR * DUR)
BEAT = 0.5
S16 = BEAT / 4
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)
verb_send = np.zeros(N)
duck_src = np.zeros(N)  # kick envelope for side-chain


def tt(d):
    return np.arange(int(SR * d)) / SR


def add(sig, at, gain=1.0, pan=0.0, verb=0.0, duck=False):
    i = int(round(at * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i]
    lg = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    rg = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i : i + len(sig)] += sig * lg
    R[i : i + len(sig)] += sig * rg
    if verb:
        verb_send[i : i + len(sig)] += sig * gain * verb
    if duck:
        env = np.exp(-tt(len(sig) / SR) / 0.12)
        duck_src[i : i + len(sig)] = np.maximum(duck_src[i : i + len(sig)], env)


def fft_filter(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    m = np.ones_like(f)
    if hi:
        m *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        m *= 1 / np.sqrt(1 + (lo / f) ** (2 * order))
    return np.fft.irfft(X * m, len(x))


def sweep_lowpass(x, cut_start, cut_end, win=2048):
    """Time-varying low-pass (exponential cutoff sweep) via overlap-add FFT."""
    hop = win // 2
    w = np.hanning(win + 1)[:-1]
    pad = np.concatenate([np.zeros(win), x, np.zeros(win)])
    out = np.zeros_like(pad)
    f = np.fft.rfftfreq(win, 1 / SR) + 1e-9
    frames = range(0, len(pad) - win, hop)
    total = max(1, len(frames) - 1)
    for k, i in enumerate(frames):
        p = min(1, max(0, (i - win) / max(1, len(x))))
        fc = cut_start * (cut_end / cut_start) ** p
        m = 1 / np.sqrt(1 + (f / fc) ** 8)
        out[i : i + win] += np.fft.irfft(np.fft.rfft(pad[i : i + win] * w) * m, win)
    return out[win : win + len(x)]


def saw(freq, t, detune=0.0):
    ph = (freq * (1 + detune)) * t + rng.random()
    return 2 * (ph % 1) - 1


# ---------------------------------------------------------------- instruments
def kick(punch=1.0):
    t = tt(0.55)
    f = 44 + 120 * np.exp(-t / 0.035) * punch
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.28)
    click = fft_filter(rng.standard_normal(len(t)), lo=2500) * np.exp(-t / 0.004) * 0.5
    return np.tanh(2.2 * (body + click)) * 0.9


def bass808(freq, dur=0.45):
    t = tt(dur + 0.08)
    f = freq * (1 + 1.0 * np.exp(-t / 0.025))
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.004) * np.exp(-t / (dur * 0.6))
    env[int(dur * SR):] *= np.linspace(1, 0, len(env) - int(dur * SR))
    return np.tanh(2.8 * np.sin(ph) * env) * 0.75


def clap():
    t = tt(0.45)
    n = rng.standard_normal(len(t))
    env = np.zeros(len(t))
    for k, off in enumerate([0, 0.009, 0.018]):
        tk = np.clip(t - off, 0, None)
        env += (t >= off) * np.exp(-tk / 0.007) * (0.7 if k < 2 else 1.0)
    env += (t >= 0.018) * np.exp(-np.clip(t - 0.018, 0, None) / 0.11) * 0.55
    noise = fft_filter(n, lo=900, hi=5200) * env
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.5
    return np.tanh(1.6 * (noise * 1.3 + body)) * 0.8


def snare_hit(gain=1.0):
    t = tt(0.18)
    n = fft_filter(rng.standard_normal(len(t)), lo=1200, hi=8000)
    return (n * np.exp(-t / 0.05) + np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.03) * 0.4) * gain


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    n = fft_filter(rng.standard_normal(len(t)), lo=7500)
    return n * np.exp(-t / (0.09 if open_ else 0.014)) * 0.55


def heartbeat():
    t = tt(0.5)
    def thump(f0, at, g):
        tk = np.clip(t - at, 0, None)
        ph = 2 * np.pi * np.cumsum(f0 + 40 * np.exp(-tk / 0.02)) / SR
        return (t >= at) * np.sin(ph) * np.exp(-tk / 0.09) * g
    return np.tanh(2 * (thump(58, 0, 1.0) + thump(52, 0.16, 0.75)))


def tick():
    t = tt(0.03)
    return fft_filter(rng.standard_normal(len(t)), lo=3000, hi=9000) * np.exp(-t / 0.004) * 0.6


def whoosh(dur=0.35, rev=False):
    t = tt(dur)
    n = rng.standard_normal(len(t))
    sig = sweep_lowpass(n, 400, 9000) * np.sin(np.pi * t / dur) ** 2
    return sig[::-1] if rev else sig


def slam(freq=55):
    """Word-slam hit: sub drop + noise crack + metallic ring."""
    t = tt(0.9)
    ph = 2 * np.pi * np.cumsum(freq + 90 * np.exp(-t / 0.05)) / SR
    sub = np.sin(ph) * np.exp(-t / 0.35)
    crack = fft_filter(rng.standard_normal(len(t)), lo=1500) * np.exp(-t / 0.03) * 0.35
    ring = sum(np.sin(2 * np.pi * freq * k * 4.01 * t) for k in (1, 1.5, 2.25)) * np.exp(-t / 0.25) * 0.06
    return np.tanh(1.8 * (sub + crack + ring)) * 0.85


def braam(root=55.0, dur=1.6):
    """Cinematic brass-like hit: detuned saws through a closing low-pass."""
    t = tt(dur)
    sig = np.zeros(len(t))
    for mult in (1, 2, 3, 4.0 / 1.0 * 0.75 * 2):  # root, octave, fifth-ish, colour
        for d in (-0.012, -0.004, 0.004, 0.012):
            sig += saw(root * mult, t, d)
    sig /= 16
    sig = sweep_lowpass(sig, 4000, 250)
    env = np.minimum(1, t / 0.01) * np.exp(-t / (dur * 0.45))
    sub = np.sin(2 * np.pi * root / 2 * t) * np.exp(-t / 0.6)
    return np.tanh(2.5 * (sig * env * 1.4 + sub * 0.6)) * 0.8


def impact(dur=2.6):
    t = tt(dur)
    ph = 2 * np.pi * np.cumsum(30 + 140 * np.exp(-t / 0.08)) / SR
    boom = np.sin(ph) * np.exp(-t / 0.9)
    burst = fft_filter(rng.standard_normal(len(t)), hi=3500) * np.exp(-t / 0.25) * 0.5
    air = fft_filter(rng.standard_normal(len(t)), lo=6000) * np.exp(-t / 0.6) * 0.15
    return np.tanh(1.7 * (boom + burst + air))


def riser(dur):
    t = tt(dur)
    n = rng.standard_normal(len(t))
    noise = sweep_lowpass(n, 250, 14000) * (t / dur) ** 2.2
    f = 110 * (8 ** (t / dur))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (2 * ((ph / (2 * np.pi)) % 1) - 1) * (t / dur) ** 2 * 0.25
    tone = fft_filter(tone, hi=5000)
    return noise * 0.55 + tone


def rev_cymbal(dur=1.0):
    t = tt(dur)
    n = fft_filter(rng.standard_normal(len(t)), lo=4000)
    return (n * np.exp(-t / 0.35))[::-1] * 0.6


def stab(freqs, dur=0.22):
    t = tt(dur)
    sig = sum(saw(f, t, d) for f in freqs for d in (-0.006, 0.006)) / (2 * len(freqs))
    sig = sweep_lowpass(sig, 6000, 900)
    return sig * np.minimum(1, t / 0.003) * np.exp(-t / 0.08) * 1.4


def pad(freqs, dur, cut0=300, cut1=2500):
    t = tt(dur)
    sig = sum(saw(f, t, d) for f in freqs for d in (-0.01, 0, 0.01)) / (3 * len(freqs))
    sig = sweep_lowpass(sig, cut0, cut1)
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.4)
    return sig * env


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- elegant layer (bells, shimmer, plucks, ui sfx)
def bell(freq, dur=1.6):
    """Glassy bell / music-box tone (inharmonic partials)."""
    t = tt(dur)
    sig = np.zeros(len(t))
    for ratio, amp, dec in ((1, 1.0, 0.9), (2.0, 0.35, 0.5), (2.76, 0.25, 0.35), (5.4, 0.12, 0.15), (8.93, 0.06, 0.08)):
        sig += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (dur * dec * 0.5))
    return sig * np.minimum(1, t / 0.002) * 0.45


def shimmer(dur=1.2, lo=72, hi=100):
    """Magic sparkle: a fast cascade of tiny high bells."""
    t = tt(dur + 0.8)
    out = np.zeros(len(t))
    n = int(dur * 28)
    scale = [0, 2, 3, 5, 7, 8, 10]  # natural minor
    for k in range(n):
        at = k / n * dur + rng.random() * 0.02
        m = lo + (hi - lo) * k / n + rng.integers(-3, 4)
        m = 12 * (m // 12) + min(scale, key=lambda x: abs(x - m % 12))
        b = bell(mtof(m), 0.5) * (0.4 + 0.6 * rng.random()) * (1 - 0.5 * k / n)
        i = int(at * SR)
        out[i : i + len(b)] += b[: len(out) - i]
    return out * 0.5


def pluck(freq, dur=0.6):
    t = tt(dur)
    sig = sum(a * np.sin(2 * np.pi * freq * k * t * (1 + d)) * np.exp(-t / (0.22 / k))
              for k, a in ((1, 1.0), (2, 0.5), (3, 0.22), (4, 0.1)) for d in (-0.002, 0.002))
    return sig * np.minimum(1, t / 0.002) * 0.35


def swish(dur=0.4, up=True):
    """Silk-like swoosh (band sweep), returned as (left, right) with a pan sweep."""
    t = tt(dur)
    n = rng.standard_normal(len(t))
    sig = sweep_lowpass(n, 500, 7000) if up else sweep_lowpass(n, 7000, 500)
    sig = fft_filter(sig, lo=300) * np.sin(np.pi * t / dur) ** 1.5 * 0.7
    p = t / dur
    return sig * np.cos(p * np.pi / 2), sig * np.sin(p * np.pi / 2)


def pop():
    t = tt(0.09)
    ph = 2 * np.pi * np.cumsum(260 + 900 * np.exp(-t / 0.012)) / SR
    return np.sin(ph) * np.exp(-t / 0.03) * 0.7


def key_click():
    t = tt(0.025)
    return fft_filter(rng.standard_normal(len(t)), lo=2000, hi=7000) * np.exp(-t / 0.003) * 0.35


def beep(freq=1760, dur=0.12):
    t = tt(dur)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.05) * 0.4


def add_st(pair, at, gain=1.0, verb=0.0):
    sl, sr = pair
    i = int(round(at * SR))
    if i < 0:
        sl, sr, i = sl[-i:], sr[-i:], 0
    m = min(len(sl), N - i)
    L[i : i + m] += sl[:m] * gain
    R[i : i + m] += sr[:m] * gain
    if verb:
        verb_send[i : i + m] += (sl[:m] + sr[:m]) * 0.5 * gain * verb


lead_L = np.zeros(N)
lead_R = np.zeros(N)


def add_lead(sig, at, gain):
    i = int(round(at * SR))
    m = min(len(sig), N - i)
    lead_L[i : i + m] += sig[:m] * gain
    lead_R[i : i + m] += sig[:m] * gain


# ---------------------------------------------------------------- arrangement
events = {"kicks": [], "claps": [], "hats": [], "slams": [], "impacts": [], "braams": [], "ticks": [], "beats": []}

# A minor: Am - F - C - G   (808 roots)
prog_808 = [mtof(33), mtof(29), mtof(36), mtof(31)]   # A1 F1 C2 G1
prog_chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]

# --- intro (0-4 s)
add(pad([mtof(45), mtof(52), mtof(57), mtof(60)], 4.0, 150, 1400), 0.0, 0.35, verb=0.3)
for b in (0.0, 1.0, 2.0):
    add(heartbeat(), b, 0.95)
for at, f in ((0.0, 55), (1.0, 49), (2.0, 55), (3.0, 61.7), (3.5, 65.4)):
    add(slam(f), at, 0.9, verb=0.35)
    add(whoosh(0.25, rev=True), at - 0.25, 0.25, pan=-0.3)
    events["slams"].append(at)
for k in range(16):  # clock ticks 2.0-4.0 on 16ths alternating pan
    at = 2.0 + k * S16
    if at < 3.875:
        add(tick(), at, 0.35, pan=(-0.5 if k % 2 else 0.5))
        events["ticks"].append(at)
add(riser(1.875), 2.0, 0.55, verb=0.2)
# accelerating snare roll 3.0 -> 3.875
roll_t = 3.0
step = 0.125
while roll_t < 3.86:
    g = 0.35 + 0.6 * (roll_t - 3.0) / 0.875
    add(snare_hit(g), roll_t, 0.55, verb=0.15)
    roll_t += step
    step = max(0.03, step * 0.8)
add(rev_cymbal(0.9), 3.875 - 0.9, 0.8)


def groove_bar(start, bar_idx, intense=False, stabs=False):
    root = prog_808[bar_idx % 4]
    kicks = [0, 6, 10] + ([3, 11, 14] if intense else [])
    for s in range(16):
        at = start + s * S16
        if s in kicks:
            add(kick(1.1 if s == 0 else 0.9), at, 1.0, duck=True)
            dur = 0.7 if s == 0 else 0.35
            add(bass808(root, dur), at, 0.85)
            events["kicks"].append(round(at, 4))
        if s in (4, 12):
            add(clap(), at, 0.75, verb=0.35)
            events["claps"].append(round(at, 4))
        if s % 2 == 0:
            add(hat(), at, 0.45 if s % 4 else 0.3, pan=0.25)
            events["hats"].append(round(at, 4))
        if intense and s % 4 == 2:
            add(hat(open_=True), at, 0.25, pan=-0.25)
        if stabs and s in (2, 7, 10, 15):
            add(stab([mtof(n + 12) for n in prog_chords[bar_idx % 4]]), at, 0.5, pan=(0.35 if s % 2 else -0.35), verb=0.4)
    # trap hat roll at the end of every other bar
    if bar_idx % 2 == 1:
        for k in range(6):
            add(hat(), start + 1.75 + k * (0.25 / 6), 0.35, pan=0.25)


# --- DROP 1 at 4.0
add(impact(2.6), 4.0, 1.0, verb=0.5)
events["impacts"].append(4.0)
for i, bar_start in enumerate((4.0, 6.0, 8.0, 10.0)):
    groove_bar(bar_start, i, intense=bar_start >= 8.0, stabs=bar_start >= 8.0)
add(pad([mtof(57), mtof(60), mtof(64)], 8.0, 600, 3000), 4.0, 0.18, verb=0.3)
add(whoosh(0.5, rev=True), 7.5, 0.4)
add(braam(55, 1.4), 8.0, 0.55, verb=0.3)
events["braams"].append(8.0)
add(slam(73.4), 10.0, 0.6, verb=0.3)
events["slams"].append(10.0)

# --- breakdown 12.0 - 14.0
add(pad([mtof(41), mtof(45), mtof(48), mtof(52)], 2.0, 2500, 300), 12.0, 0.4, verb=0.4)
add(slam(49), 12.0, 0.8, verb=0.4)
events["slams"].append(12.0)
for at, root in ((12.5, 55.0), (13.0, 58.27), (13.5, 61.74)):
    add(braam(root, 1.0), at, 0.8, verb=0.35)
    add(kick(1.2), at, 0.9)
    events["braams"].append(at)
add(riser(1.875), 12.0, 0.6, verb=0.2)
roll_t, step = 13.0, 0.125
while roll_t < 13.86:
    g = 0.35 + 0.6 * (roll_t - 13.0) / 0.875
    add(snare_hit(g), roll_t, 0.55, verb=0.15)
    roll_t += step
    step = max(0.03, step * 0.8)
add(rev_cymbal(1.2), 13.875 - 1.2, 0.85)

# --- DROP 2 at 14.0 (bars 8 + half of 9)
add(impact(3.0), 14.0, 1.0, verb=0.5)
add(braam(55, 1.8), 14.0, 0.6, verb=0.4)
events["impacts"].append(14.0)
groove_bar(14.0, 0, intense=True, stabs=True)
groove_bar(16.0, 1, intense=True, stabs=True)  # truncated by the final hit below
add(pad([mtof(57), mtof(60), mtof(64), mtof(69)], 4.0, 800, 4000), 14.0, 0.2, verb=0.3)

# ---------------------------------------------------------------- elegant layer arrangement
# music-box notes on the intro words
for at, m in ((0.0, 88), (1.0, 84), (2.0, 81), (3.0, 83), (3.5, 86)):
    add(bell(mtof(m), 1.4), at, 0.35, pan=0.2, verb=0.6)
for at in (1.0, 2.0, 3.0, 3.5):
    add_st(swish(0.3), at - 0.3, 0.35)

# logo reveal sparkle + bell chord
add(shimmer(1.4, 76, 100), 4.0, 0.55, pan=0.15, verb=0.7)
for m in (69, 72, 76, 81):
    add(bell(mtof(m), 2.2), 4.0, 0.22, verb=0.6)
# typewriter "PRESENTS"
for k in range(12):
    add(key_click(), 6.0 + k * 0.035, 0.5, pan=0.1)

# lead hook (A minor, over Am-F-C-G), ping-pong delay applied below
HOOK = [
    {0: 76, 2: 79, 4: 81, 6: 79, 7: 76, 10: 74, 12: 76},
    {0: 77, 2: 76, 4: 72, 6: 74, 9: 72, 10: 69},
    {0: 76, 2: 79, 4: 84, 6: 83, 7: 79, 10: 76, 12: 79},
    {0: 81, 2: 79, 4: 76, 6: 74, 8: 71, 10: 74, 12: 76},
]
for bar_start, bi, g in ((4.0, 0, 0.55), (6.0, 1, 0.55), (8.0, 2, 0.8), (10.0, 3, 0.8), (14.0, 0, 0.85), (16.0, 1, 0.85)):
    for step, m in HOOK[bi].items():
        add_lead(pluck(mtof(m)), bar_start + step * S16, g)
        if g > 0.7:
            add_lead(pluck(mtof(m + 12)) * 0.25, bar_start + step * S16, g)

# transitions in the kinetic-type section
add_st(swish(0.5), 7.5, 0.5)
for at in (9.0, 9.5, 10.0):
    add_st(swish(0.25, up=at != 9.5), at - 0.25, 0.45)
for k, (at, m) in enumerate(((11.0, 81), (11.25, 84), (11.5, 88), (11.75, 93))):
    add_st(swish(0.18), at - 0.18, 0.3)
    add(bell(mtof(m), 0.8), at, 0.3, pan=(-0.3 if k % 2 else 0.3), verb=0.4)

# countdown beeps
for at, f in ((12.5, 1318.5), (13.0, 1318.5), (13.5, 1760.0)):
    add(beep(f, 0.16), at, 0.55, verb=0.3)

# final card: sparkle, pill reveal, typing, handle pop, notification ding
add(shimmer(1.6, 76, 103), 14.0, 0.6, pan=-0.15, verb=0.7)
add_st(swish(0.35), 14.5, 0.45)
for m in (76, 81, 84, 88):
    add(bell(mtof(m), 1.6), 14.5, 0.16, verb=0.5)
for k in range(24):
    add(key_click(), 15.0 + k * 0.028, 0.4, pan=0.1)
add(pop(), 15.5, 0.6)
add(bell(mtof(88), 0.9), 15.82, 0.4, verb=0.4)
add(bell(mtof(93), 1.2), 15.95, 0.4, verb=0.4)

# ping-pong delay on the lead (dotted 8th), then into the mix
D = int(0.375 * SR)
wetL, wetR = np.zeros(N), np.zeros(N)
src = (lead_L + lead_R) * 0.5
for k in range(1, 6):
    sh = np.zeros(N)
    sh[k * D :] = src[: N - k * D] * (0.45 ** k)
    (wetL if k % 2 else wetR)[:] += sh
L += lead_L + wetL * 0.8
R += lead_R + wetR * 0.8
verb_send += src * 0.35

# --- FINAL hit at 17.0: hard cut everything before it, then ring-out
cut = int(17.0 * SR)
fade = int(0.01 * SR)
for ch in (L, R, verb_send):
    ch[cut - fade : cut] *= np.linspace(1, 0, fade)
    ch[cut:] = 0
add(impact(1.0), 17.0, 1.0, verb=0.9)
add(braam(55, 1.0), 17.0, 0.7, verb=0.8)
add(slam(55), 17.0, 0.6)
events["impacts"].append(17.0)
add(shimmer(2.0, 72, 100), 17.0, 0.6, verb=0.9)
for m in (57, 69, 72, 76, 81):
    add(bell(mtof(m), 2.5), 17.0, 0.2, verb=0.8)

# ---------------------------------------------------------------- mix
# side-chain duck everything except the kick itself (approximation: whole bus, gentle)
duck = 1 - 0.35 * duck_src
L *= duck
R *= duck

# reverb: decaying stereo noise impulse via FFT convolution
ir_t = tt(1.6)
ir_env = np.exp(-ir_t / 0.38)
irL = fft_filter(rng.standard_normal(len(ir_t)), lo=200, hi=7000) * ir_env
irR = fft_filter(rng.standard_normal(len(ir_t)), lo=200, hi=7000) * ir_env
irL /= np.sqrt(np.sum(irL ** 2)) * 6
irR /= np.sqrt(np.sum(irR ** 2)) * 6
nfft = 1 << int(np.ceil(np.log2(N + len(ir_t))))
VS = np.fft.rfft(verb_send, nfft)
L += np.fft.irfft(VS * np.fft.rfft(irL, nfft), nfft)[:N]
R += np.fft.irfft(VS * np.fft.rfft(irR, nfft), nfft)[:N]

# gentle tail fade 17.6-18.0
tail = int(0.4 * SR)
for ch in (L, R):
    ch[-tail:] *= np.linspace(1, 0, tail) ** 2

# master: drive + soft clip + normalise
mix = np.stack([L, R], axis=1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(1.8 * mix) / np.tanh(1.8)
mix *= 10 ** (-1.5 / 20)

out = sys.argv[1] if len(sys.argv) > 1 else "build/soundtrack.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())

events["beats"] = [round(i * BEAT, 4) for i in range(int(DUR / BEAT))]
for k in events:
    events[k] = sorted(set(events[k]))
with open(out.rsplit("/", 1)[0] + "/timeline.json" if "/" in out else "timeline.json", "w") as f:
    json.dump(events, f)
print("wrote", out)
