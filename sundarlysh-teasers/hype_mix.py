"""Music bed for the kinetic teaser: 'Hitman' (Kevin MacLeod, CC BY 4.0) re-edited on its beat grid + synced SFX.
Track grid: 150.02 bpm, beat k at 0.331 + k*0.39995 s. Video beat b is 0.39995*b s.
  video b0-11  <- track beats 105-116 (tense breakdown)
  video b12-47 <- track beats 17-52 (full groove -> break -> re-entry at track beat 29 = video b24 drop)
usage: hype_mix.py <Hitman.mp3> <out.wav>"""
import sys, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100; BT = 60 / 150.02; PH = 0.331; NB = 48; TAIL = 1.0
L = int((NB * BT + TAIL) * SR)
rng = np.random.default_rng(5)
def T(sec): return np.arange(int(sec * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x, axis=0)
def noise(sec): return rng.standard_normal(int(sec * SR))
def vb(b): return b * BT                      # video beat -> seconds
def tb(k): return PH + k * BT                 # track beat -> seconds

src = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).reshape(-1, 2).astype(np.float64)
def seg(k0, nbeats): a = int(tb(k0) * SR); return src[a:a + int(nbeats * BT * SR)].copy()
A = seg(105, 12) * 2.2; Bc = seg(17, 36 + TAIL / BT + .5)
xf = int(.03 * SR); music = np.zeros((L, 2))
music[:len(A)] = A; fade = np.linspace(0, 1, xf)[:, None]
music[len(A) - xf:len(A)] *= (1 - fade); start = len(A) - xf
bb = Bc[:L - start]; bb[:xf] *= fade; music[start:start + len(bb)] += bb
# outro: muffle the music from b44 (STAY TUNED) and fade the tail
t = np.arange(L) / SR
g_break = 1 + .6 * (np.clip((t - vb(17)) / .1, 0, 1) * np.clip((vb(24) - .02 - t) / .05, 0, 1)); music *= g_break[:, None]
muff = lp(music, 650)
k = np.clip((t - vb(44)) / .25, 0, 1)[:, None]; music = music * (1 - k) + muff * k * .9
music *= np.clip(1 - (t - vb(48)) / TAIL, 0, 1)[:, None] ** 1.5

# ---------------------------------------------------------------- SFX
sfx = np.zeros((L, 2))
def add(sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR)); sig = sig[:max(0, L - i)]
    if i < 0 or not len(sig): return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    sfx[i:i + len(sig), 0] += sig * g * l; sfx[i:i + len(sig), 1] += sig * g * r
def saw(f, sec, ph=0.0):
    tt = T(sec); p = (f * tt + ph) % 1.0; return 2 * p - 1
def whoosh(sec=.3, up=False):
    nz = noise(sec); out = np.zeros_like(nz); blk = 512
    for i in range(0, len(nz), blk):
        q = i / len(nz); q = q if up else 1 - q; c = 300 * (9000 / 300) ** q
        s_ = nz[max(0, i - 2048):i + blk]; out[i:i + blk] = bp(s_, c * .6, min(c * 1.6, 20000))[-len(out[i:i + blk]):]
    return out * np.sin(np.pi * np.clip(T(sec) / sec, 0, 1)) ** 1.5 * .6
def braam(sec=2.0):
    tt = T(sec); s = sum(saw(49 * m * 2 ** (c / 1200), sec, rng.random()) / m for m in (1, 2, 3) for c in (-12, 0, 12))
    s = sosfilt(butter(2, 500, "low", fs=SR, output="sos"), s)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 45 * np.exp(-tt / .1)) / SR)
    return np.tanh(1.5 * (s * .25 + sub)) * np.exp(-tt / .7) * np.clip(tt / .005, 0, 1)
def hit():                                     # short punchy impact for words
    tt = T(.35); f = 50 + 140 * np.exp(-tt / .02)
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .1)) * .8 + hp(noise(.35), 3000) * np.exp(-tt / .01) * .3
def crash(sec=2.0): tt = T(sec); return (hp(noise(sec), 4500) * .7 + bp(noise(sec), 2500, 7000) * .4) * np.exp(-tt / .55) * .55
def glitch(sec=.2):
    tt = T(sec); sq = np.sign(np.sin(2 * np.pi * 170 * tt * (1 + 3 * (np.floor(tt / .025) % 3))))
    gate = np.floor(tt / .0125) % 2; return np.round(sq * 4) / 4 * gate * .3 + hp(noise(sec), 3000) * gate * .15
def click(): tt = T(.04); return hp(noise(.04), 3000) * np.exp(-tt / .004) * .7 + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / .006) * .25
def snare(): tt = T(.2); return bp(noise(.2), 1200, 9000) * np.exp(-tt / .05) * .6 + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / .04) * .45
def riser(sec):
    tt = T(sec); return (whoosh(sec, up=True) * 1.2 + np.sin(2 * np.pi * np.cumsum(220 * 5 ** (tt / sec)) / SR) * .1) * (tt / sec) ** 1.8

WORDS = [1, 2, 3, 6, 7, 8, 9, 10, 18, 19, 20, 21, 22, 30, 31, 32, 34]
for b in WORDS: add(whoosh(.2), vb(b) - .1, .45, rng.uniform(-.4, .4)); add(hit(), vb(b), .35)
for b, g in ((0, .7), (3, .6), (11, .95), (24, 1.0), (36, .9), (46, .85)): add(braam(), vb(b), g)
for b in (11, 24, 36): add(crash(), vb(b), .7)
add(glitch(.2), vb(4), .8); add(glitch(.2), vb(4) + .2, .6); add(glitch(.15), vb(29.5), .55)
for b in (13, 14, 16, 17): add(whoosh(.4, up=True), vb(b) - .2, .45)
roll = [18 + i * .5 for i in range(6)] + [21 + i * .25 for i in range(4)] + [22 + i * .125 for i in range(8)]
for i, b in enumerate(roll): add(snare(), vb(b), .18 + .35 * i / len(roll))
add(riser(vb(5.5)), vb(18.5), .55); add(crash(1.3)[::-1] * .6, vb(24) - 1.3, 1.0, 0)
add(whoosh(.5), vb(38), .6, -.3); add(whoosh(.5), vb(38.5), .6, .3)
for i in range(4): add(click(), vb(44) + i * BT / 4, .8)
add(click(), vb(45), .8)

mix = music * 1.0 + sfx * .55
mix = mix / np.percentile(np.abs(mix), 99.95) * .85; mix = np.tanh(1.2 * mix) / np.tanh(1.2)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
def r(x, a, b): s_ = x[int(a * SR):int(b * SR)]; return 20 * np.log10(np.sqrt((s_ ** 2).mean()) + 1e-9)
print("music vs sfx dB  intro %.0f/%.0f  build %.0f/%.0f  break %.0f/%.0f  drop %.0f/%.0f  end %.0f/%.0f" % (
    r(music, 0, vb(12)), r(sfx * .55, 0, vb(12)), r(music, vb(12), vb(17)), r(sfx * .55, vb(12), vb(17)), r(music, vb(17), vb(24)), r(sfx * .55, vb(17), vb(24)),
    r(music, vb(24), vb(36)), r(sfx * .55, vb(24), vb(36)), r(music, vb(44), vb(48)), r(sfx * .55, vb(44), vb(48))))
print("per-beat:", " ".join("%.0f" % r(mix, vb(b), vb(b + 1)) for b in range(NB)))
