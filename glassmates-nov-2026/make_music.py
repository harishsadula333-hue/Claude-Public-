"""Synthesizes an original, royalty-free party track + glass clinks for the edit.

usage: python3 make_music.py <out.wav> <total_seconds> <music_off_at> <music_back_at>
The music plays under the intro/sponsor scenes, ducks out while the party video
(with its own audio) plays, and returns for the outro.
"""
import sys, wave
import numpy as np

SR = 44100
out, TOTAL, OFF_AT, BACK_AT = sys.argv[1], *map(float, sys.argv[2:5])
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

BPM = 112
BEAT = 60 / BPM
BAR = 4 * BEAT

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

# G  D  Em  C   (I V vi IV)
CHORDS = [[55, 59, 62, 67], [50, 54, 57, 62], [52, 55, 59, 64], [48, 52, 55, 60]]
ROOTS = [43, 38, 40, 36]

L = np.zeros(N); R = np.zeros(N)

def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y

def pluck(freq, dur=0.9, bright=0.5):
    n = int(dur * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    buf = onepole_lp(buf, 2000 + 6000 * bright)
    y = np.empty(n)
    for k in range(n):
        y[k] = buf[k % p]
        buf[k % p] = 0.996 * 0.5 * (buf[k % p] + buf[(k + 1) % p])
    return y * np.linspace(1, 0.0, n) ** 0.6

def pad(freqs, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ph = 2 * np.pi * f * 2 ** (det / 12) * t
            s += (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph))
    env = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4).clip(0, 1)
    return s * env / (len(freqs) * 3)

def kick():
    t = np.arange(int(0.32 * SR)) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) + 0.15 * np.exp(-t * 200) * rng.uniform(-1, 1, len(t))

def clap():
    t = np.arange(int(0.22 * SR)) / SR
    n = rng.uniform(-1, 1, len(t))
    n = n - onepole_lp(n, 900)
    env = np.exp(-t * 18) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return n * env

def hat(open_=False):
    d = 0.18 if open_ else 0.045
    t = np.arange(int(d * SR)) / SR
    n = rng.uniform(-1, 1, len(t)); n = n - onepole_lp(n, 6000)
    return n * np.exp(-t * (14 if open_ else 70))

def bass(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sign(np.sin(2 * np.pi * freq * t))
    s = onepole_lp(s, 500)
    return s * np.exp(-t * 5) * np.minimum(1, t / 0.005)

def clink(t0, gain=0.5):
    t = np.arange(int(1.6 * SR)) / SR
    s = np.zeros_like(t)
    for f, d, a in [(2380, 3.2, 1.0), (3910, 4.5, .55), (5170, 6.0, .4), (6890, 8.0, .25), (8420, 10, .15)]:
        s += a * np.sin(2 * np.pi * f * t) * np.exp(-t * d)
    s *= np.minimum(1, t / 0.002)
    add(s, t0, -0.25, gain); add(s * 0.8, t0 + 0.035, 0.3, gain)

def whoosh(t0, dur=0.7, gain=0.35):
    t = np.arange(int(dur * SR)) / SR
    n = rng.uniform(-1, 1, len(t))
    n = onepole_lp(n, 2500) - onepole_lp(n, 300)
    env = np.sin(np.pi * t / dur) ** 2
    add(n * env, t0, 0, gain)

def sparkle(t0, gain=0.18):
    for k in range(10):
        f = midi(79 + [0, 4, 7, 12, 16, 19, 24, 19, 16, 24][k])
        tt = np.arange(int(0.5 * SR)) / SR
        add(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 9), t0 + k * 0.045, (k % 3 - 1) * 0.5, gain)

# Lay down the groove across the whole timeline (envelope mutes it later).
wet_L = np.zeros(N); wet_R = np.zeros(N)
bars = int(TOTAL / BAR) + 2
for b in range(bars):
    t0 = b * BAR
    ch = CHORDS[b % 4]
    p = pad([midi(n) for n in ch], BAR + 0.3)
    i = int(t0 * SR); seg = p[: max(0, N - i)]
    wet_L[i:i + len(seg)] += seg * 0.22; wet_R[i:i + len(seg)] += seg * 0.22
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 24]
    for k in range(8):
        add(pluck(midi(arp[k]), 0.7, 0.6), t0 + k * BEAT / 2, -0.35 if k % 2 else 0.35, 0.28)
    drums_on = b >= 1
    for k in range(8):
        add(bass(midi(ROOTS[b % 4] + (12 if k in (3, 7) else 0)), BEAT / 2), t0 + k * BEAT / 2, 0, 0.42 if drums_on else 0.2)
    if drums_on:
        for k in range(4):
            add(kick(), t0 + k * BEAT, 0, 0.9)
            if k in (1, 3): add(clap(), t0 + k * BEAT, 0.1, 0.45)
        for k in range(8):
            if k % 2: add(hat(open_=(k == 7)), t0 + k * BEAT / 2, 0.4, 0.22)

# Cheap reverb for the pad
ir_t = np.arange(int(1.4 * SR)) / SR
ir = rng.uniform(-1, 1, len(ir_t)) * np.exp(-ir_t * 4.5); ir /= np.sqrt((ir ** 2).sum())
def conv(x, h):
    n = len(x) + len(h) - 1; F = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(h, F), F)[: len(x)]
L += wet_L + 0.35 * conv(wet_L, ir); R += wet_R + 0.35 * conv(wet_R, ir)

# Music envelope: on for the intro/sponsor, off under the party video, back for the outro.
t = np.arange(N) / SR
env = np.ones(N)
env[t >= OFF_AT] = np.clip(1 - (t[t >= OFF_AT] - OFF_AT) / 1.0, 0, 1)
back = t >= BACK_AT
env[back] = np.clip((t[back] - BACK_AT) / 0.7, 0, 1)
env *= np.clip((TOTAL - t) / 1.6, 0, 1)            # final fade out
env *= np.clip(t / 0.25, 0, 1)                        # soft start
L *= env; R *= env

# Normalise the music bed to roughly match the party video's loudness, then add SFX on top.
mask = env > 0.9
rms = np.sqrt(np.mean((L[mask] ** 2 + R[mask] ** 2) / 2))
target = 10 ** (-17 / 20)
L *= target / rms; R *= target / rms

SPONSOR_AT = OFF_AT - 8.3          # sponsor scene starts one scene (9s - 0.7s xfade) before the video
clink(1.25, 0.32)                  # glasses clink as the intro logo lands
whoosh(SPONSOR_AT - 0.4, 0.8)      # into the sponsor scene
sparkle(SPONSOR_AT + 2.7)          # Mr. KIRAN pops
whoosh(BACK_AT - 0.5, 0.8)         # into the outro
clink(BACK_AT + 1.3, 0.32)         # outro logo lands

peak = max(np.abs(L).max(), np.abs(R).max())
if peak > 0.97:
    L *= 0.97 / peak; R *= 0.97 / peak
pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, f'{TOTAL:.2f}s')
