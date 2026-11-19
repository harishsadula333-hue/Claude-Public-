"""Original 20 s Christmas EDM track at 120 bpm for the 'Something magical' teaser.
Every hit is placed on the teaser's cut grid (beat = 0.5 s). 'Jingle Bells' melody is public domain.
usage: magic_beat.py out.wav
"""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100; DUR = 20.0; N = int((DUR + 1.0) * SR); B = 0.5
rng = np.random.default_rng(7)
def T(sec): return np.arange(int(sec * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def noise(sec): return rng.standard_normal(int(sec * SR))
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def hz(name): return 440.0 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)

class Bus:
    def __init__(s): s.x = np.zeros((N, 2), np.float64)
    def add(s, sig, at, g=1.0, pan=0.0):
        i = int(round(at * SR))
        if i >= N: return
        sig = sig[:N - i]
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            s.x[i:i + len(sig), 0] += sig * g * l * 1.414; s.x[i:i + len(sig), 1] += sig * g * r * 1.414
        else: s.x[i:i + len(sig)] += sig * g
kick_b, drum_b, bell_b, synth_b, bass_b, lead_b, fx_b, intro_kick = (Bus() for _ in range(8))

# ------------------------------------------------------------- instruments
def kick():
    t = T(.5); f = 46 + 120 * np.exp(-t / .028) + 30 * np.exp(-t / .12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .2) * np.clip(t / .002, 0, 1)
    click = hp(noise(.5), 2000) * np.exp(-t / .004) * .35
    return np.tanh(1.8 * (body + click)) * .95
def clap():
    t = T(.45); n = bp(noise(.45), 900, 4200)
    e = sum(np.exp(-np.clip(t - d, 0, None) / .005) * (t >= d) for d in (0, .011, .023)) * .6 + np.exp(-t / .1) * (t >= .023)
    return n * e * .9
def snare(): t = T(.25); return bp(noise(.25), 1200, 9000) * np.exp(-t / .055) * .7 + np.sin(2 * np.pi * 195 * t) * np.exp(-t / .045) * .5
def hat(open_=False): t = T(.35 if open_ else .08); return hp(noise(len(t) / SR), 7500, 4) * np.exp(-t / (.11 if open_ else .016)) * .55
def crash(sec=2.2): t = T(sec); return (hp(noise(sec), 4000, 2) * .7 + bp(noise(sec), 2500, 7000) * .5) * np.exp(-t / .6) * np.clip(t / .003, 0, 1) * .6
def sleigh():
    t = T(.18); out = np.zeros_like(t)
    for _ in range(5):
        d = int(rng.uniform(0, .012) * SR); f = rng.uniform(4800, 10500)
        out[d:] += np.sin(2 * np.pi * f * t[:len(t) - d]) * np.exp(-t[:len(t) - d] / .045)
    return (out / 5 + hp(noise(.18), 6000) * np.exp(-t / .025) * .5) * .5
def fm_bell(f, sec=1.4, idx=2.5, ratio=3.5, decay=.45):
    t = T(sec); I = idx * np.exp(-t / .18)
    return np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t)) * np.exp(-t / decay) * np.clip(t / .002, 0, 1)
def saw(f, sec, ph=0.0):
    t = T(sec); dt = f / SR; p = (f * t + ph) % 1.0; s = 2 * p - 1
    m = p < dt; x = p[m] / dt; s[m] -= x + x - x * x - 1
    m = p > 1 - dt; x = (p[m] - 1) / dt; s[m] -= x * x + x + x + 1
    return s
def supersaw(notes, sec):
    out = np.zeros((int(sec * SR), 2))
    for nt in notes:
        for k, c in enumerate([-24, -15, -7, 0, 7, 15, 24]):
            s = saw(hz(nt) * 2 ** (c / 1200), sec, rng.random()); pan = (k - 3) / 3 * .8
            out[:, 0] += s * np.cos((pan + 1) * np.pi / 4); out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    return out / (len(notes) * 4.5)
def pluck_lead(f, sec):
    t = T(sec + .5); env = np.exp(-t / .32) * np.clip(t / .003, 0, 1)
    rel = np.clip(1 - (t - sec) / .12, 0, 1) if sec < 1.2 else 1
    body = lp(saw(f, sec + .5) * .6 + saw(f * 1.004, sec + .5) * .4, 3800) * env * rel
    bell = fm_bell(2 * f, sec + .5, idx=1.6, ratio=2.0, decay=.5) * .45
    return body + bell
def riser(sec):
    nz = noise(sec); out = np.zeros_like(nz); blk = 1024; nb = len(nz) // blk + 1
    for b in range(nb):
        k = b / nb; c = 350 * (9000 / 350) ** k
        seg = nz[max(0, b * blk - 2048):(b + 1) * blk]; seg = bp(seg, c * .7, min(c * 1.4, 20000))
        out[b * blk:(b + 1) * blk] = seg[-len(out[b * blk:(b + 1) * blk]):] if len(out[b * blk:(b + 1) * blk]) else seg[:0]
    t = T(sec); tone = np.sin(2 * np.pi * np.cumsum(220 * 6 ** (t / sec)) / SR) * .12
    return (out * .5 + tone) * (t / sec) ** 2.0
def boom():
    t = T(2.0); f = 32 + 70 * np.exp(-t / .09)
    return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .55)) * .9

# ------------------------------------------------------------- arrangement
CH = [(0, "Am"), (2, "F"), (4, "G"), (6, "C"), (8, "Am"), (10, "F"), (11, "G"), (12, "C"), (13, "G"), (14, "C"), (16, "Am"), (18, "G"), (19, "C"), (20.5, None)]
VOICE = {"C": ["C4", "E4", "G4", "C5"], "Am": ["A3", "C4", "E4", "A4"], "F": ["F3", "A3", "C4", "F4"], "G": ["G3", "B3", "D4", "G4"]}
ROOT = {"C": "C2", "Am": "A1", "F": "F2", "G": "G1"}
ARP = {"C": ["C6", "E6", "G6", "E6"], "Am": ["A5", "C6", "E6", "C6"], "F": ["F5", "A5", "C6", "A5"], "G": ["G5", "B5", "D6", "B5"]}
DROPS = [(6.0, 11.0), (12.0, 19.0)]
def in_drop(t): return any(a <= t < b - 1e-9 for a, b in DROPS)
GAPS = [(5.75, 6.0), (11.75, 12.0)]

# melody (eighth-note units = 0.25 s)
J1 = [("E5", 1), ("E5", 1), ("E5", 2), ("E5", 1), ("E5", 1), ("E5", 2), ("E5", 1), ("G5", 1), ("C5", 1.5), ("D5", .5), ("E5", 4)]
J2 = [("F5", 1), ("F5", 1), ("F5", 1.5), ("F5", .5), ("F5", 1), ("E5", 1), ("E5", 1), ("E5", .5), ("E5", .5)]
J3 = [("E5", 1), ("D5", 1), ("D5", 1), ("E5", 1), ("D5", 2), ("G5", 2)]
J4 = [("G5", 1), ("G5", 1), ("F5", 1), ("D5", 1), ("C5", 4)]
t0 = 6.0
for phrase in (J1, J2, J3, J1, J4):
    for nt, d in phrase:
        lead_b.add(pluck_lead(hz(nt), d * .25 * .92), t0, .55, 0); t0 += d * .25

# chords + bass
for (a, c), (b, _) in zip(CH, CH[1:]):
    if c is None: continue
    sec = b - a; ss = supersaw(VOICE[c], sec + .05)
    if a < 6:   # intro: dark filtered pad opening up during the build
        cut = 600 if a < 4 else 1600
        pad = np.stack([lp(ss[:, 0], cut), lp(ss[:, 1], cut)], 1)
        fade = np.clip(T(sec + .05) / .3, 0, 1)[:, None]
        synth_b.add(pad * fade, a, .7 if a < 4 else .6)
    else:
        bright = np.stack([lp(ss[:, 0], 7000), lp(ss[:, 1], 7000)], 1)
        synth_b.add(bright, a, .85)
    # sub (sidechained later) + offbeat bass
    t = T(sec); sub = np.sin(2 * np.pi * hz(ROOT[c]) * t) * np.clip(t / .01, 0, 1) * np.clip((sec - t) / .02, 0, 1)
    bass_b.add(sub, a, .55 if a >= 4 else .25)
    if a >= 6 or a >= 4:
        for k in range(int(sec / B)):
            tt = a + k * B + .25
            if in_drop(tt) or (4 <= tt < 5.5) or (18 <= tt < 19):
                f = hz(ROOT[c]) * 2; n = saw(f, .2) * .5 + saw(f * 1.006, .2) * .5
                bass_b.add(lp(n, 900) * np.exp(-T(.2) / .07), tt, .5)
    # intro bell arpeggio (16ths) for magic
    if a < 6:
        for k in range(int(sec / .125)):
            tt = a + k * .125
            if not (5.75 <= tt < 6.0):
                bell_b.add(fm_bell(hz(ARP[c][k % 4]), .8, idx=1.2, ratio=3.5, decay=.3), tt, .2 + .06 * (k % 4 == 0), pan=[-.4, .4][k % 2])

# drums
KICKS = [k * B for k in range(8)] + [4.0, 4.5] + [6 + k * B for k in range(10)] + [12 + k * B for k in range(14)] + [19.0]
for kt in KICKS:
    (intro_kick if kt < 4 else kick_b).add(kick(), kt, 1.0)
for k in range(80):
    tt = k * B
    if in_drop(tt) and k % 2 == 1: drum_b.add(clap(), tt, .75, .05)
    if 2 <= tt < 4 and k % 2 == 1: drum_b.add(clap(), tt, .35, .1)
drum_b.add(clap(), 13.5, .5, -.2); drum_b.add(clap(), 13.52, .5, .2)          # "hey!" stack
for k in range(160):
    tt = k * .125
    if in_drop(tt) or 18 <= tt < 19:
        drum_b.add(hat(), tt, [.6, .25, .4, .25][k % 4], .25)
        if k % 4 == 2: drum_b.add(hat(True), tt, .4, -.2)
        bell_b.add(sleigh(), tt, [.9, .45, .65, .45][k % 4], -.3)
    elif tt < 5.75 or 6 <= tt < 11.75:
        if k % 2 == 0: bell_b.add(sleigh(), tt, .12 + .25 * min(tt, 5.75) / 5.75, -.3)
        if 2 <= tt < 5 and k % 2 == 0: drum_b.add(hat(), tt, .25, .25)
# snare rolls into each drop
for start in (4.0, 10.0):
    seq = [start + k * .25 for k in range(4)] + [start + 1 + k * .125 for k in range(4)] + [start + 1.5 + k * .0625 for k in range(4)]
    for i, tt in enumerate(seq): drum_b.add(snare(), tt, .3 + .5 * i / len(seq), 0)
for ct, g in ((6, .7), (12, .8), (14, .35), (16, .45), (19, .8), (13.5, .4)): fx_b.add(crash(), ct, g)
for dt in (6.0, 12.0):
    rc = crash(1.6)[::-1] * .55; fx_b.add(rc, dt - 1.6, 1.0)
    fx_b.add(boom(), dt, .9)
    fx_b.add(riser(1.75), dt - 2.0, .6)
fx_b.add(boom(), 19.0, .8); fx_b.add(boom(), 4.0, .35)
for k, nt in enumerate(["C6", "E6", "G6", "C7", "E7", "G7"]):
    fx_b.add(fm_bell(hz(nt), 1.5, 1.0, 3.5, .5), .05 + k * .05, .14, pan=-.5 + k * .2)
    fx_b.add(fm_bell(hz(nt), 1.5, 1.0, 3.5, .5), 19.0 + k * .045, .16, pan=.5 - k * .2)

# ------------------------------------------------------------- mix
t = np.arange(N) / SR
kt = np.array(sorted([k for k in KICKS if k >= 4]))
idx = np.searchsorted(kt, t, "right") - 1; since = np.where(idx >= 0, t - kt[np.clip(idx, 0, None)], 9)
duck = (1 - .8 * np.exp(-since / .11))[:, None]
ir_t = T(1.6); ir = np.stack([lp(noise(1.6), 6000) * np.exp(-ir_t / .38), lp(noise(1.6), 6000) * np.exp(-ir_t / .38)], 1) * .011
send = lead_b.x * .5 + bell_b.x * .35 + drum_b.x * .12 + synth_b.x * .15
verb = np.stack([fftconvolve(send[:, 0], ir[:, 0])[:N], fftconvolve(send[:, 1], ir[:, 1])[:N]], 1)
ik = np.stack([lp(intro_kick.x[:, 0], 220), lp(intro_kick.x[:, 1], 220)], 1) * .55
mix = kick_b.x * 1.0 + ik + bass_b.x * duck * .8 + synth_b.x * duck * 2.3 + lead_b.x * 1.8 + bell_b.x * 1.1 + drum_b.x * 1.15 + fx_b.x * .65 + verb * duck
for a, b in GAPS:   # silence before the drop (risers & reverse crash keep going)
    m = (t >= a) & (t < b); keep = fx_b.x[m] * .65; mix[m] = keep
mix = np.stack([hp(mix[:, 0], 28), hp(mix[:, 1], 28)], 1)
mix = mix / np.percentile(np.abs(mix), 99.9) * .8
mix = np.tanh(1.3 * mix) / np.tanh(1.3)
mix = mix[:int(DUR * SR)]
fo = int(.25 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", sys.argv[1])
