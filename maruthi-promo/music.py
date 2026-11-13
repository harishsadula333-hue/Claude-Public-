"""Synthesizes a 40s 120 BPM EDM/corporate promo track + SFX, synced to the video cues."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave, sys

SR = 44100
DUR = 40.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM          # 0.5s
BAR = BEAT * 4           # 2s
rng = np.random.default_rng(7)

music = np.zeros((N, 2))
drums = np.zeros((N, 2))
sfx = np.zeros((N, 2))
send = np.zeros((N, 2))   # reverb send


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def add(buf, start, sig, gain=1.0, pan=0.0, rev=0.0):
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], axis=1) * np.sqrt(2)
    i = int(start * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    seg = sig[: j - i] * gain
    if i < 0:
        seg = seg[-i:]
        i = 0
    buf[i:j] += seg
    if rev:
        send[i:j] += seg * rev


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x, axis=0)


def tv_lowpass(x, fc):
    """time-varying 1-pole lowpass (fc array in Hz), applied twice for 12dB/oct"""
    a = np.exp(-2 * np.pi * np.clip(fc, 20, 18000) / SR)
    for _ in range(2):
        y = np.empty_like(x)
        z = 0.0
        for n in range(len(x)):
            z = (1 - a[n]) * x[n] + a[n] * z
            y[n] = z
        x = y
    return x


def note_hz(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def saw(f, t, maxh=60):
    out = np.zeros_like(t)
    nh = int(min(maxh, (SR / 2.2) / f))
    for k in range(1, nh + 1):
        out += ((-1) ** (k + 1)) * np.sin(2 * np.pi * k * f * t) / k
    return out * (2 / np.pi)


def adsr(t, a, d, s, r, length):
    env = np.ones_like(t) * s
    env[t < a] = t[t < a] / a
    m = (t >= a) & (t < a + d)
    env[m] = 1 - (1 - s) * (t[m] - a) / d
    rm = t > length
    env[rm] = s * np.exp(-(t[rm] - length) / r)
    return env


# ---------------------------------------------------------------- harmony
# A minor: Am - F - C - G   (one chord per bar)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
ROOTS = [33, 29, 36, 31]  # bass roots (A1, F1, C2, G1)


def chord_at(sec):
    return int(sec // BAR) % 4


# sidechain pump envelope (active during drops)
tN = np.arange(N) / SR
phase = np.mod(tN, BEAT)
pump = 1 - 0.75 * np.exp(-phase * 9)
drop_mask = ((tN >= 4) & (tN < 25)) | ((tN >= 27) & (tN < 38))
side = np.where(drop_mask, pump, 1.0)

# ---------------------------------------------------------------- PAD (supersaw)
pad = np.zeros((N, 2))
for bar in range(20):
    st = bar * BAR
    ch = CHORDS[bar % 4]
    t = tt(BAR + 1.2)
    sigL = np.zeros_like(t)
    sigR = np.zeros_like(t)
    for n in ch + [ch[0] + 12]:
        f = note_hz(n)
        for d, (gl, gr) in zip([-0.12, -0.05, 0, 0.05, 0.12], [(1, .3), (.8, .6), (.7, .7), (.6, .8), (.3, 1)]):
            s = saw(f * 2 ** (d / 12), t + rng.random(), maxh=30)
            sigL += s * gl
            sigR += s * gr
    env = adsr(t, 0.08, 0.3, 0.85, 0.5, BAR)
    sig = np.stack([sigL * env, sigR * env], 1) * 0.045
    add(pad, st, sig)
# intro: filter opening; drops: brighter
fc = np.interp(tN, [0, 3.9, 4, 25, 27, 27.01, 38, 40], [300, 2500, 3800, 3800, 1200, 4200, 4200, 900])
pad = np.stack([tv_lowpass(pad[:, 0], fc), tv_lowpass(pad[:, 1], fc)], 1)
pad *= side[:, None]
padvol = np.interp(tN, [0, 2, 4, 38, 39.9], [0.5, 0.9, 1.0, 1.0, 0.0])
music += pad * padvol[:, None]
send += pad * 0.25

# ---------------------------------------------------------------- BASS
bass = np.zeros(N)
for i in range(int(DUR / (BEAT / 2))):
    st = i * BEAT / 2
    if not (4 <= st < 25 or 27 <= st < 38):
        continue
    if i % 2 == 0:
        continue  # offbeat 8ths
    f = note_hz(ROOTS[chord_at(st)] + 12)
    t = tt(0.24)
    s = saw(f, t, 25) * 0.6 + np.sin(2 * np.pi * f / 2 * t) * 0.8
    env = np.exp(-t * 7) * np.minimum(1, t / 0.004)
    s = s * env
    add_to = int(st * SR)
    bass[add_to:add_to + len(s)] += s[: max(0, min(len(s), N - add_to))]
bass = filt(bass, "lowpass", 900)
music += np.stack([bass, bass], 1) * 0.42

# sub layer sustained (ducked)
sub = np.zeros(N)
for bar in range(20):
    st = bar * BAR
    if not (4 <= st < 25 or 27 <= st < 38):
        continue
    t = tt(BAR)
    sub[int(st * SR):int(st * SR) + len(t)] += np.sin(2 * np.pi * note_hz(ROOTS[bar % 4]) * t) * adsr(t, .01, .1, 1, .05, BAR - .06)
music += np.stack([sub, sub], 1) * 0.25 * side[:, None]

# ---------------------------------------------------------------- ARP pluck (16ths) with delay
arp = np.zeros((N, 2))
for i in range(int(DUR / (BEAT / 4))):
    st = i * BEAT / 4
    if st >= 38 or (25 <= st < 26.5):
        continue
    ch = CHORDS[chord_at(st)]
    pattern = [0, 1, 2, 3, 2, 1, 0, 2]
    tones = ch + [ch[0] + 12]
    n = tones[pattern[i % 8] % 4] + 12
    f = note_hz(n)
    t = tt(0.22)
    s = (saw(f, t, 20) * 0.5 + np.sign(np.sin(2 * np.pi * f * t)) * 0.25)
    s = s * np.exp(-t * 18) * np.minimum(1, t / 0.002)
    vel = 0.9 if i % 4 == 0 else 0.6
    add(arp, st, s, vel, pan=0.35 * np.sin(i * 0.7))
fc = np.interp(tN, [0, 4, 4.01, 25, 27, 38], [600, 2600, 3500, 3500, 5000, 5000])
arp = np.stack([tv_lowpass(arp[:, 0], fc), tv_lowpass(arp[:, 1], fc)], 1)
# ping-pong dotted-8th delay
d = int(0.375 * SR)
dl = np.zeros_like(arp)
src = arp.copy()
for k in range(1, 5):
    g = 0.45 ** k
    sh = np.zeros_like(arp)
    sh[d * k:] = src[:-d * k]
    if k % 2:
        sh = sh[:, ::-1]
    dl += sh * g
arp = arp + dl * 0.6
arpvol = np.interp(tN, [0, 1, 4, 27, 38], [0.3, 0.6, 0.75, 0.6, 0.6])
music += arp * 0.16 * arpvol[:, None] * np.where(drop_mask, 0.5 + 0.5 * pump, 1)[:, None]
send += arp * 0.05

# ---------------------------------------------------------------- LEAD melody (27-38)
mel = [  # (beat offset from 27s, midi, length beats)
    (0, 76, 1), (1, 74, .5), (1.5, 72, .5), (2, 76, 1.5), (3.5, 79, .5),
    (4, 77, 1), (5, 76, .5), (5.5, 74, .5), (6, 72, 2),
    (8, 72, 1), (9, 74, .5), (9.5, 76, .5), (10, 79, 1.5), (11.5, 76, .5),
    (12, 74, 1), (13, 76, .5), (13.5, 74, .5), (14, 71, 2),
    (16, 76, 1), (17, 74, .5), (17.5, 72, .5), (18, 76, 1.5), (19.5, 79, .5),
    (20, 81, 2),
]
lead = np.zeros((N, 2))
for b, n, L in mel:
    st = 27 + b * BEAT
    f = note_hz(n)
    t = tt(L * BEAT + 0.3)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3)
    sl = sum(saw(f * 2 ** (dd / 12), t, 25) for dd in (-0.1, 0.0))
    sr = sum(saw(f * 2 ** (dd / 12), t, 25) for dd in (0.0, 0.1))
    env = adsr(t, 0.01, 0.15, 0.6, 0.12, L * BEAT - 0.05)
    add(lead, st, np.stack([sl * env, sr * env], 1) * 0.5, 1.0)
lead = filt(lead, "lowpass", 4500)
music += lead * 0.11
send += lead * 0.06

# ---------------------------------------------------------------- DRUMS
def kick():
    t = tt(0.5)
    f = 45 + 120 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 5.5)
    click = filt(rng.standard_normal(len(t)), "highpass", 3000) * np.exp(-t * 300) * 0.3
    return np.tanh((s + click) * 1.8)


def clap():
    t = tt(0.35)
    n = filt(rng.standard_normal(len(t)), "bandpass", [900, 3500])
    env = np.zeros_like(t)
    for o in (0, 0.011, 0.022):
        m = t >= o
        env[m] += np.exp(-(t[m] - o) * (90 if o < 0.02 else 14))
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return n * env * 0.8 + tone


def hat(open_=False):
    t = tt(0.3 if open_ else 0.06)
    n = filt(rng.standard_normal(len(t)), "highpass", 7500)
    return n * np.exp(-t * (12 if open_ else 70))


def snare():
    t = tt(0.2)
    n = filt(rng.standard_normal(len(t)), "bandpass", [1200, 7000])
    return n * np.exp(-t * 22) + np.sin(2 * np.pi * 210 * t) * np.exp(-t * 35) * 0.5


K = kick()
for i in range(80):
    st = i * BEAT
    if 4 <= st < 25 or 27 <= st < 38:
        add(drums, st, K, 0.95)
        if i % 2 == 1:
            add(drums, st, clap(), 0.42, rev=0.18)
    if 2 <= st < 25 or 27 <= st < 38:
        add(drums, st + BEAT / 2, hat(open_=(st >= 4)), 0.16 if st >= 4 else 0.08, pan=0.2)
        if st >= 4:
            add(drums, st + BEAT / 4, hat(), 0.07, pan=-0.25)
            add(drums, st + 3 * BEAT / 4, hat(), 0.06, pan=-0.25)
# build-up snare roll 25 -> 27 (accelerating)
times = list(np.arange(25, 26, BEAT / 2)) + list(np.arange(26, 26.5, BEAT / 4)) + list(np.arange(26.5, 27, BEAT / 8))
for k, st in enumerate(times):
    add(drums, st, snare(), 0.18 + 0.4 * k / len(times), pan=0, rev=0.15)
# intro text hits (1.0,1.5,2.0,2.5): tom-ish booms
for k, st in enumerate([1.0, 1.5, 2.0, 2.5]):
    t = tt(0.6)
    f = 90 + 80 * np.exp(-t * 20)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
    add(drums, st, np.tanh(s * 1.5), 0.6, rev=0.3)
    add(drums, st, clap(), 0.25, rev=0.4)
music += drums

# ---------------------------------------------------------------- SFX
def whoosh(length=0.9, up=True):
    t = tt(length)
    n = rng.standard_normal(len(t))
    x = t / length
    fc = 300 + 7000 * (np.sin(np.pi * x) ** 2) if up else 6000 * (1 - x) + 300
    s = tv_lowpass(n, fc)
    s = filt(s, "highpass", 200)
    env = np.sin(np.pi * x) ** 1.5
    s = s * env
    pan = np.interp(x, [0, 1], [-0.9, 0.9])
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([s * l, s * r], 1) * 1.6


def riser(length):
    t = tt(length)
    x = t / length
    n = rng.standard_normal(len(t))
    s = tv_lowpass(n, 200 + 9000 * x ** 2.2) * (x ** 1.8)
    f = 200 * 2 ** (3 * x)
    tone = saw(1, t, 1) * 0  # placeholder
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + 0.5 * np.sin(ph * 1.5)) * x ** 2 * 0.25
    return s * 0.8 + tone


def impact(big=1.0):
    t = tt(3.0)
    f = 28 + 60 * np.exp(-t * 5)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    crash = filt(rng.standard_normal(len(t)), "highpass", 2500) * np.exp(-t * 2.2) * 0.35
    body = filt(rng.standard_normal(len(t)), "lowpass", 900) * np.exp(-t * 9) * 0.6
    return np.tanh((boom * 1.4 + crash + body) * big)


def reverse_crash(length=1.0):
    t = tt(length)
    s = filt(rng.standard_normal(len(t)), "highpass", 3000) * np.exp(-t * 3)
    return s[::-1] * 0.5


def pop(pitch=1.0):
    t = tt(0.12)
    f = (1400 * pitch) * np.exp(-t * 18) + 500 * pitch
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
    return s * 0.8


def stamp():
    t = tt(0.5)
    thud = np.sin(2 * np.pi * np.cumsum(60 + 100 * np.exp(-t * 40)) / SR) * np.exp(-t * 12)
    chk = filt(rng.standard_normal(len(t)), "bandpass", [1500, 6000]) * np.exp(-t * 45)
    return np.tanh((thud * 1.5 + chk * 0.8) * 1.5)


def sparkle(length=1.5, count=14):
    out = np.zeros(int(length * SR))
    for k in range(count):
        o = rng.random() * length * 0.6
        f = 2500 + rng.random() * 4500
        t = tt(0.4)
        s = np.sin(2 * np.pi * f * t) * np.exp(-t * 12) * (0.5 + rng.random() * 0.5)
        i = int(o * SR)
        j = min(len(out), i + len(s))
        out[i:j] += s[: j - i]
    return out * 0.25


def tick():
    t = tt(0.05)
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 90) * 0.6


def swoosh_hit():
    return whoosh(0.35)


# intro
add(sfx, 0.0, riser(1.0) * 0.3, 0.6)
add(sfx, 0.0, sparkle(2.0, 10), 0.6, rev=0.5)
add(sfx, 1.2, riser(2.8), 0.55, rev=0.2)
add(sfx, 3.0, reverse_crash(1.0), 0.7)
# drop / logo
add(sfx, 4.0, impact(1.0), 0.95, rev=0.3)
add(sfx, 4.4, sparkle(1.5), 0.6, rev=0.5)
add(sfx, 5.0, whoosh(0.6), 0.25)
add(sfx, 6.0, stamp(), 0.8, rev=0.25)
# pillars
add(sfx, 7.6, whoosh(0.7), 0.35)
for k, st in enumerate([8.0, 8.5, 9.0]):
    add(sfx, st - 0.12, whoosh(0.3), 0.3)
    add(sfx, st, stamp(), 0.45, pan=-0.5 + 0.5 * k)
# full-stack
add(sfx, 10.6, whoosh(0.8), 0.4)
add(sfx, 11.0, impact(0.6), 0.45, rev=0.2)
for k in range(6):
    add(sfx, 12.0 + k * 0.5, pop(1 + k * 0.08), 0.5, pan=-0.6 + k * 0.24, rev=0.15)
# career
add(sfx, 16.6, whoosh(0.8), 0.4)
add(sfx, 17.0, impact(0.6), 0.45, rev=0.2)
for k in range(14):
    add(sfx, 18.0 + k * 0.5, pop(0.9 + k * 0.045), 0.45, pan=np.sin(k), rev=0.15)
    add(sfx, 18.0 + k * 0.5 + 0.1, whoosh(0.3), 0.12)
# build + second drop
add(sfx, 25.0, riser(2.0), 0.55, rev=0.2)
add(sfx, 26.0, reverse_crash(1.0), 0.7)
add(sfx, 27.0, impact(1.1), 0.95, rev=0.3)
add(sfx, 28.0, sparkle(2.0, 18), 0.8, rev=0.6)
# MD
add(sfx, 30.7, whoosh(0.8), 0.45)
add(sfx, 31.1, stamp(), 0.35)
add(sfx, 32.0, sparkle(1.0, 8), 0.4, rev=0.5)
# end card
add(sfx, 34.2, whoosh(0.8), 0.45)
for k in range(4):
    add(sfx, 35.0 + k * 0.5, tick(), 0.6, rev=0.2)
    add(sfx, 35.0 + k * 0.5 - 0.1, whoosh(0.3), 0.15)
add(sfx, 37.0, pop(1.2), 0.5, rev=0.2)
add(sfx, 38.0, impact(1.0), 0.9, rev=0.4)
add(sfx, 38.0, sparkle(2.0, 16), 0.6, rev=0.6)

# ---------------------------------------------------------------- reverb
def make_ir(sec=2.2):
    t = tt(sec)
    irl = rng.standard_normal(len(t)) * np.exp(-t / 0.45)
    irr = rng.standard_normal(len(t)) * np.exp(-t / 0.45)
    irl = filt(irl, "lowpass", 6000)
    irr = filt(irr, "lowpass", 6000)
    return irl / np.abs(irl).sum() * 25, irr / np.abs(irr).sum() * 25


irl, irr = make_ir()
wet = np.stack([fftconvolve(send[:, 0], irl)[:N], fftconvolve(send[:, 1], irr)[:N]], 1)

mix = music * 0.9 + sfx * 0.85 + wet * 0.5
mix = filt(mix, "highpass", 28)
# master glue: gentle compression via tanh, normalize
mix = mix / np.max(np.abs(mix)) * 1.6
mix = np.tanh(mix)
# fade edges
fade = np.ones(N)
fade[:int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 2
mix *= fade[:, None]
mix = mix / np.max(np.abs(mix)) * 0.93

out = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
pcm = (mix * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out)
