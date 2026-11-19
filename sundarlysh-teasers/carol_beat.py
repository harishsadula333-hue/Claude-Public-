"""Original dark Christmas trap track (3/4, 140 bpm, G minor) for the kinetic-type teaser.
Bell ostinato = 4-note motif of Leontovych's 'Shchedryk' (public domain). Everything else original.
Grid: beat B = 60/140 s, bar = 3 beats, 48 beats total. usage: carol_beat.py out.wav
"""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100; B = 60 / 140; NB = 48; DUR = NB * B; N = int((DUR + 1.5) * SR); S16 = B / 4
rng = np.random.default_rng(11)
def T(sec): return np.arange(int(sec * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def noise(sec): return rng.standard_normal(int(sec * SR))
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
FL = {"Bb": "A#", "Eb": "D#", "Ab": "G#", "Db": "C#", "Gb": "F#"}
def hz(name):
    p, o = name[:-1], int(name[-1]); p = FL.get(p, p)
    return 440.0 * 2 ** ((NOTE[p] + 12 * (o + 1) - 69) / 12)
def bt(b): return b * B

class Bus:
    def __init__(s): s.x = np.zeros((N, 2))
    def add(s, sig, at, g=1.0, pan=0.0):
        i = int(round(at * SR))
        if i >= N or i < 0: return
        sig = sig[:N - i]
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
            s.x[i:i + len(sig), 0] += sig * g * l; s.x[i:i + len(sig), 1] += sig * g * r
        else: s.x[i:i + len(sig)] += sig * g
box_b, drum_b, kick_b, bass_b, pad_b, fx_b, hit_b = (Bus() for _ in range(7))

# ---------------------------------------------------------------- instruments
def kick(punch=1.0):
    t = T(.45); f = 44 + 130 * np.exp(-t / .025) + 25 * np.exp(-t / .1)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16)
    return np.tanh(2.0 * punch * (body + hp(noise(.45), 2500) * np.exp(-t / .004) * .3)) * .9
def b808(f, sec, glide_from=None):
    t = T(sec + .05); ff = np.full_like(t, f)
    if glide_from: ff = f + (glide_from - f) * np.exp(-t / .06)
    s = np.sin(2 * np.pi * np.cumsum(ff) / SR); env = np.clip(t / .004, 0, 1) * np.exp(-t / max(sec * .9, .2)) * np.clip((sec + .05 - t) / .04, 0, 1)
    return np.tanh(1.8 * s * env) * .8
def clap():
    t = T(.5); n = bp(noise(.5), 900, 5000)
    e = sum(np.exp(-np.clip(t - d, 0, None) / .006) * (t >= d) for d in (0, .012, .025)) * .6 + np.exp(-t / .13) * (t >= .025)
    return n * e
def snare(): t = T(.22); return bp(noise(.22), 1200, 9000) * np.exp(-t / .05) * .7 + np.sin(2 * np.pi * 185 * t) * np.exp(-t / .04) * .5
def hat(open_=False): t = T(.3 if open_ else .06); return hp(noise(len(t) / SR), 8000, 4) * np.exp(-t / (.09 if open_ else .014)) * .5
def sleigh():
    t = T(.16); out = np.zeros_like(t)
    for _ in range(5):
        d = int(rng.uniform(0, .01) * SR); f = rng.uniform(5000, 10500)
        out[d:] += np.sin(2 * np.pi * f * t[:len(t) - d]) * np.exp(-t[:len(t) - d] / .04)
    return (out / 5 + hp(noise(.16), 6500) * np.exp(-t / .02) * .5) * .45
def music_box(f, sec=1.6):
    t = T(sec); I = 1.8 * np.exp(-t / .08)
    tine = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * 5.0 * t)) * np.exp(-t / .55)
    tine += .35 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / .25) + .12 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t / .12)
    return tine * np.clip(t / .0015, 0, 1)
def saw(f, sec, ph=0.0):
    t = T(sec); dt = f / SR; p = (f * t + ph) % 1.0; s = 2 * p - 1
    m = p < dt; x = p[m] / dt; s[m] -= x + x - x * x - 1
    m = p > 1 - dt; x = (p[m] - 1) / dt; s[m] -= x * x + x + x + 1
    return s
def pluck(f, sec=.5):
    t = T(sec); s = saw(f, sec) * .6 + saw(f * 1.005, sec) * .4
    return lp(s, 2600) * np.exp(-t / .16)
def pad(notes, sec):
    out = np.zeros((int(sec * SR), 2))
    for nt in notes:
        for k, c in enumerate([-18, -9, 0, 9, 18]):
            s = saw(hz(nt) * 2 ** (c / 1200), sec, rng.random()); pan = (k - 2) / 2 * .8
            out[:, 0] += s * np.cos((pan + 1) * np.pi / 4); out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    out = np.stack([lp(out[:, 0], 2200), lp(out[:, 1], 2200)], 1) / (len(notes) * 3.5)
    t = T(sec)[:, None]; return out * np.clip(t / .15, 0, 1) * np.clip((sec - t) / .1, 0, 1)
def braam(root="G1", sec=2.2):
    t = T(sec); s = np.zeros_like(t)
    for m in (1, 2, 3, 4):
        for c in (-12, 0, 12): s += saw(hz(root) * m * 2 ** (c / 1200), sec, rng.random()) / m
    cut = 300 + 1600 * np.exp(-t / .25)
    blk = 2048; out = np.zeros_like(s)
    for i in range(0, len(s), blk):
        seg = s[max(0, i - 4096):i + blk]; out[i:i + blk] = lp(seg, float(cut[i]))[-len(out[i:i + blk]):]
    sub = np.sin(2 * np.pi * np.cumsum(30 + 40 * np.exp(-t / .1)) / SR)
    return np.tanh(1.6 * (out * .35 + sub * .9)) * np.exp(-t / .9) * np.clip(t / .006, 0, 1)
def whoosh(sec=.35, up=False):
    nz = noise(sec); t = T(sec); out = np.zeros_like(nz); blk = 512
    for i in range(0, len(nz), blk):
        k = i / len(nz); k = k if up else 1 - k; c = 300 * (8000 / 300) ** k
        seg = nz[max(0, i - 2048):i + blk]; out[i:i + blk] = bp(seg, c * .6, min(c * 1.6, 20000))[-len(out[i:i + blk]):]
    env = np.sin(np.pi * np.clip(t / sec, 0, 1)) ** 1.5
    return out * env * .6
def glitch(sec=.2):
    t = T(sec); sq = np.sign(np.sin(2 * np.pi * 180 * t * (1 + 3 * (np.floor(t / .025) % 3))))
    crush = np.round(sq * 4) / 4; gate = (np.floor(t / .0125) % 2)
    return crush * gate * .35 + hp(noise(sec), 3000) * gate * .15
def click(): t = T(.04); return hp(noise(.04), 3000) * np.exp(-t / .004) * .6 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .006) * .25
def crash(sec=2.0): t = T(sec); return (hp(noise(sec), 4000) * .7 + bp(noise(sec), 2500, 7000) * .5) * np.exp(-t / .6) * .6
def riser(sec):
    t = T(sec); w = whoosh(sec, up=True) * 1.3
    tone = np.sin(2 * np.pi * np.cumsum(200 * 5 ** (t / sec)) / SR) * .12
    return (w + tone) * (t / sec) ** 1.8

# ---------------------------------------------------------------- arrangement
BASS = ["G", "F", "Eb", "D"]; PADC = {"G": ["G3", "Bb3", "D4"], "F": ["F3", "A3", "C4"], "Eb": ["Eb3", "G3", "Bb3"], "D": ["D3", "F#3", "A3"]}
MOTIF = [("Bb", 0, 1.0), ("A", 1, .5), ("Bb", 1.5, .5), ("G", 2, 1.0)]       # (note, beat offset in bar, length)
DROP = (24, 42)                                                             # beats
def in_drop(b): return DROP[0] <= b < DROP[1]
for bar in range(NB // 3):
    b0 = bar * 3; root = BASS[bar % 4]
    if b0 == 21: continue                         # bar 8: build (b21-23) -> motif muted for the gap
    for nt, off, ln in MOTIF:
        tt = bt(b0 + off); g = .5 if b0 < 12 else .62
        box_b.add(music_box(hz(nt + "5")), tt, g, -.15)
        if b0 >= 12: box_b.add(music_box(hz(nt + "6"), 1.0), tt, .18, .3)
        if in_drop(b0): box_b.add(pluck(hz(nt + "4"), .45), tt, .55, 0)
    if 12 <= b0 < 42 and b0 != 21:
        pad_b.add(pad(PADC[root], 3 * B + .02), bt(b0), .9 if not in_drop(b0) else 1.15)
    if in_drop(b0):
        r1 = root + "1"; f = hz(r1) if hz(r1) > 40 else hz(root + "2")
        bass_b.add(b808(f, 2 * B), bt(b0), 1.0); bass_b.add(b808(f, .8 * B, glide_from=f * 1.5), bt(b0 + 1.75), .8)
        kick_b.add(kick(), bt(b0)); kick_b.add(kick(.8), bt(b0 + 1.75))
        drum_b.add(clap(), bt(b0 + 2), .8, .05)
        for s in range(12):
            tt = b0 + s * .25; last = (bar % 2 == 1) and s >= 9
            if last:
                for k in range(3): drum_b.add(hat(), bt(tt + k / 12), .35 + .1 * k, .3)
            elif s % 2 == 0: drum_b.add(hat(), bt(tt), .5 if s % 4 == 0 else .35, .3)
            drum_b.add(sleigh(), bt(tt), .5 if s % 4 == 0 else .25, -.35)
        if bar % 2 == 0: drum_b.add(hat(True), bt(b0 + 1.5), .3, -.2)
    elif 12 <= b0 < 21:                             # bars 5-7: light groove
        kick_b.add(kick(.7), bt(b0), .7)
        for s in range(6): drum_b.add(hat(), bt(b0 + s * .5), .25, .3); drum_b.add(sleigh(), bt(b0 + s * .5), .2, -.35)
    elif b0 < 12:                                   # bars 1-4: heartbeat
        kick_b.add(kick(.6), bt(b0), .5)
# build: snare roll over b18-23 (stops at b23 for the gap)
roll = [18 + k * .5 for k in range(6)] + [21 + k * .25 for k in range(4)] + [22 + k * .125 for k in range(8)]
for i, b in enumerate(roll): drum_b.add(snare(), bt(b), .25 + .5 * i / len(roll))
fx_b.add(riser(bt(5)), bt(18), .7)
fx_b.add(crash(1.4)[::-1] * .7, bt(24) - 1.4, 1.0)

# word hits / transitions (match the video timeline)
WORD_WHOOSH = [1, 2, 6, 7, 8, 9, 10, 18, 19, 20, 21, 22, 30, 31, 32, 34]
for b in WORD_WHOOSH: fx_b.add(whoosh(.22), bt(b) - .11, .55, pan=rng.uniform(-.4, .4))
for b in (0, 3, 11, 24, 36, 44): hit_b.add(braam("G1" if b != 11 else "G1"), bt(b), 1.0 if b in (11, 24, 36) else .75)
for b in (11, 24, 36): fx_b.add(crash(), bt(b), .8)
fx_b.add(glitch(.21), bt(4), .9); fx_b.add(glitch(.21), bt(4) + .21, .7); fx_b.add(glitch(.15), bt(29.5), .6)
for b in (13, 14, 16, 17): fx_b.add(whoosh(.4, up=True), bt(b) - .2, .5)            # light-leak wipes
fx_b.add(whoosh(.5), bt(38), .7, -.3); fx_b.add(whoosh(.5), bt(38.5), .7, .3)        # tapes
for k in range(4): fx_b.add(click(), bt(42) + k * S16, .9)                           # S-T-A-Y typewriter
fx_b.add(click(), bt(43), .9)

# ---------------------------------------------------------------- mix
t = np.arange(N) / SR
kt = np.array(sorted({round(bt(b0 + o), 4) for bar in range(NB // 3) for b0 in [bar * 3] if in_drop(b0) for o in (0, 1.75)}))
idx = np.searchsorted(kt, t, "right") - 1; since = np.where(idx >= 0, t - kt[np.clip(idx, 0, None)], 9)
duck = (1 - .65 * np.exp(-since / .12))[:, None]
ir_t = T(2.2); ir = np.stack([lp(noise(2.2), 7000) * np.exp(-ir_t / .55), lp(noise(2.2), 7000) * np.exp(-ir_t / .55)], 1) * .0055
send = box_b.x * .7 + drum_b.x * .1 + pad_b.x * .2 + fx_b.x * .15
verb = np.stack([fftconvolve(send[:, 0], ir[:, 0])[:N], fftconvolve(send[:, 1], ir[:, 1])[:N]], 1)
mix = (kick_b.x * 1.0 + bass_b.x * .85 + drum_b.x * 1.35 + box_b.x * .68 + pad_b.x * duck * 1.0 + fx_b.x * .8 + hit_b.x * .9 + verb)
gap = (t >= bt(23)) & (t < bt(24)); mix[gap] = fx_b.x[gap] * .8 + verb[gap] * .5      # breath before the drop
mix = np.stack([hp(mix[:, 0], 28), hp(mix[:, 1], 28)], 1)
mix = mix / np.percentile(np.abs(mix), 99.9) * .8; mix = np.tanh(1.3 * mix) / np.tanh(1.3)
L = int((DUR + .3) * SR); mix = mix[:L]; fo = int(.6 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
if __name__ == "__main__":
    with wave.open(sys.argv[1], "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
    print("ok", sys.argv[1], round(DUR, 3))
