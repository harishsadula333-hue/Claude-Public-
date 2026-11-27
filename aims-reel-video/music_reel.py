# Original Indian-fusion / Bhangra-pop track + synced SFX for the AIMS 40 s reel.
# Everything is synthesized here (dhol, sitar via Karplus-Strong, tanpura drone, 808, brass), so it is royalty-free.
import numpy as np, wave, sys

SR = 44100; BPM = 120; BEAT = 60 / BPM; TRIP = BEAT / 3
DUR = 40.0; N = int(SR * (DUR + 1))
rng = np.random.default_rng(11)
M = np.zeros((2, N))        # music bus
X = np.zeros((2, N))        # sfx bus
DUCK = np.ones(N)           # sidechain envelope for music

def hz(n): return 440 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def put(bus, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j <= i: return
    s = sig[:j - i] * gain
    bus[0, i:j] += s * np.sqrt((1 - pan) / 2) * 1.414
    bus[1, i:j] += s * np.sqrt((1 + pan) / 2) * 1.414
def fft_filter(x, lo=None, hi=None):
    X_ = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X_ * g, len(x))
def duck(t, depth=0.55, d=0.22):
    i = int(t * SR); n = int(d * SR); j = min(N, i + n)
    if i >= N: return
    env = 1 - depth * (1 - np.linspace(0, 1, n)) ** 2
    DUCK[i:j] = np.minimum(DUCK[i:j], env[:j - i])

# ---------------- instruments ----------------
def dhol_bass():                       # "dagga": deep thump with pitch drop + skin slap
    t = tt(0.55); f = 62 + 95 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    slap = fft_filter(rng.standard_normal(len(t)), 300, 1800) * np.exp(-t * 60) * 0.5
    return np.tanh((body + slap) * 1.6)
def dhol_treble(accent=1.0):            # "tilli": sharp stick crack with short ring
    t = tt(0.18); ring = np.sin(2 * np.pi * 780 * t) * 0.5 + np.sin(2 * np.pi * 1230 * t) * 0.3
    crack = fft_filter(rng.standard_normal(len(t)), 1500, 7000)
    return (ring * np.exp(-t * 32) + crack * np.exp(-t * 90)) * accent
def clap():
    t = tt(0.28); n = rng.standard_normal(len(t)); e = np.exp(-t * 20)
    for o in (0.0, 0.009, 0.019): e = e + np.where(t >= o, np.exp(-(t - o) * 140), 0) * 0.7
    return fft_filter(n * e, 900, 4000) * 2.2
def shaker(a=1.0):
    t = tt(0.07); return fft_filter(rng.standard_normal(len(t)), 5000, None) * np.sin(np.pi * t / 0.07) ** 2 * a
def b808(note, d):
    t = tt(d); f = hz(note) * (1 + 0.6 * np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR); s = np.tanh(s * 2.2) * 0.8
    env = np.minimum(1, t / 0.005) * np.exp(-t * 1.2) * np.minimum(1, (d - t) / 0.04)
    return s * env
def sitar(note, d=0.9, bend=0.0):      # Karplus-Strong pluck with buzz + optional meend (bend up)
    f0 = hz(note); n = int(d * SR); out = np.zeros(n)
    buf = rng.uniform(-1, 1, int(round(SR / f0 - 0.5))); idx = 0
    for i in range(n):
        if bend and i == int(0.12 * SR):  # meend: shorten delay -> pitch up
            newL = int(round(SR / (f0 * 2 ** (bend / 12)) - 0.5)); buf = np.interp(np.linspace(0, len(buf) - 1, newL), np.arange(len(buf)), np.roll(buf, -(idx % len(buf)))); idx = 0
        L_ = len(buf); v = buf[idx % L_]; nxt = buf[(idx + 1) % L_]
        new = 0.996 * 0.5 * (v + nxt); buf[idx % L_] = new; out[i] = v; idx += 1
    out = out + 0.25 * np.tanh(out * 6)          # jawari buzz
    out = fft_filter(out, 180, 6500)
    return out * np.minimum(1, (d - tt(d)[:n]) / 0.05)
def tanpura(notes, d):
    t = tt(d); s = 0
    for k, nt in enumerate(notes):
        f = hz(nt); s = s + sum(np.sin(2 * np.pi * f * h * t + k) / h ** 1.3 for h in range(1, 9))
    s = fft_filter(s, 60, 2400) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t))
    return s / len(notes) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
def brass(notes, d=0.35):
    t = tt(d); s = 0
    for nt in notes:
        for dt in (-0.006, 0, 0.006):
            ph = (t * hz(nt) * (1 + dt)) % 1; s = s + (2 * ph - 1)
    s = fft_filter(s, 150, 2600) / (3 * len(notes))
    return s * np.minimum(1, t / 0.015) * np.exp(-t * 5)
def pad(notes, d):
    t = tt(d); s = 0
    for nt in notes:
        for dt in (-0.004, 0.004):
            s = s + np.sin(2 * np.pi * hz(nt) * (1 + dt) * t) + 0.3 * np.sin(4 * np.pi * hz(nt) * (1 + dt) * t)
    return s / (2 * len(notes)) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)

# ---------------- SFX ----------------
def boom():
    t = tt(1.4); f = 34 + 70 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    hit = fft_filter(rng.standard_normal(len(t)), 100, 3000) * np.exp(-t * 25) * 0.7
    return np.tanh((sub + hit) * 1.4)
def blip(p=1.0):
    t = tt(0.09); f = 900 * p * (1 + 0.8 * t / 0.09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) + fft_filter(rng.standard_normal(len(t)), 3000, None) * np.exp(-t * 300) * 0.3
def swish(d=0.28):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); seg = int(0.02 * SR)
    for k in range(0, len(n), seg):                        # bandpass sweeping upward
        c = 600 + 5000 * (k / len(n)) ** 1.5
        out[k:k + seg] = fft_filter(n[k:k + seg] if len(n[k:k + seg]) > 8 else np.zeros(8), c * 0.6, c * 1.6)[:len(n[k:k + seg])]
    return out * np.sin(np.pi * t / d) ** 2
def reverse_cymbal(d=0.9):
    t = tt(d); n = fft_filter(rng.standard_normal(len(t)), 4500, None)
    return n * (t / d) ** 3
def jet(d):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); seg = int(0.03 * SR)
    for k in range(0, len(n), seg):
        x = k / len(n); c = 700 + 2600 * np.exp(-((x - 0.55) / 0.22) ** 2)   # doppler-ish centre sweep
        chunk = n[k:k + seg]; out[k:k + seg] = fft_filter(chunk, c * 0.5, c * 1.4) if len(chunk) > 8 else 0
    return out * np.exp(-((t / d - 0.55) / 0.3) ** 2)

# ---------------- arrangement ----------------
D2, D3, D4, A3 = 38, 50, 62, 57
prog = [(38, [62, 65, 69]), (36, [60, 64, 67]), (34, [58, 62, 65]), (36, [60, 64, 67])]   # Dm  C  Bb  C
# sitar hook (beat offsets within a 2-bar phrase, midi note, length, bend)
HOOK = [(0, 74, .45, 0), (.5, 72, .3, 0), (1, 74, .3, 0), (1.5, 77, .5, 2), (2.5, 76, .3, 0), (3, 74, .9, 0),
        (4, 72, .45, 0), (4.5, 70, .3, 0), (5, 72, .3, 0), (5.5, 74, .5, 0), (6.5, 69, .3, 0), (7, 70, .45, 2), (7.5, 69, .9, 0)]
CHAAL = {0: 'B', 2: 'T', 3: 'T', 5: 'B', 6: 'B', 8: 'T', 9: 'T', 10: 'B', 11: 'T'}   # 12 triplet slots per bar

def section(t):
    if t < 4: return 'intro'
    if t < 10: return 'A'
    if t < 14: return 'half'
    if t < 26: return 'B'
    if t < 31: return 'break'
    if t < 35: return 'B'
    return 'end'

# tanpura drone throughout (fades at ends)
put(M, tanpura([D3, A3, D4], 40.5), 0, 0.16)

for bar in range(20):
    t0 = bar * 2.0
    root, chord = prog[bar % 4]
    for slot in range(12):
        ts = t0 + slot * TRIP; sec = section(ts)
        hit = CHAAL.get(slot)
        if sec in ('A', 'B'):
            if hit == 'B': put(M, dhol_bass(), ts, 0.50); duck(ts, 0.45)
            if hit == 'T': put(M, dhol_treble(1.0 if slot % 3 == 0 else 0.7), ts, 0.45, 0.15)
            put(M, shaker(0.9 if slot % 3 == 0 else 0.55), ts, 0.10, -0.3)
            if slot in (3, 9): put(M, clap(), ts, 0.30, 0.05)
        elif sec == 'intro':                        # accelerating dhol roll into the drop
            if ts > 2.0 and (slot % (3 if ts < 3 else 1) == 0): put(M, dhol_treble(0.5 + 0.5 * (ts - 2) / 2), ts, 0.28, 0.2)
        elif sec == 'break':
            if slot % 3 == 0: put(M, shaker(0.8), ts, 0.08, -0.3)
            if slot == 0: put(M, dhol_bass(), ts, 0.35)
        elif sec == 'half':
            if ts >= 13.0 and slot % 1 == 0: put(M, dhol_treble(0.4 + 0.6 * (ts - 13)), ts, 0.30, 0.1)   # roll into B
    sec = section(t0 + 0.01)
    # 808 bass
    if sec in ('A', 'B'):
        put(M, b808(root, 0.9), t0, 0.27); put(M, b808(root, 0.45), t0 + 1.5, 0.22); put(M, b808(root + 12, 0.25), t0 + 1.25, 0.15)
    if sec == 'half': put(M, b808(root, 1.9), t0, 0.32)
    # pads in breakdown / half
    if sec in ('half', 'break'): put(M, pad(chord, 2.2), t0, 0.12)
    # brass stabs in B
    if sec == 'B': put(M, brass(chord), t0, 0.32); put(M, brass(chord), t0 + 1.5, 0.24)
    # sitar hook on 2-bar phrases
    if sec in ('A', 'B', 'break') and bar % 2 == 0:
        for (b, n, d, bend) in HOOK:
            ts = t0 + b * BEAT
            if section(ts) == 'end': continue
            put(M, sitar(n - (12 if sec == 'break' else 0), d + 0.3, bend), ts, 0.55 if sec != 'break' else 0.42, 0.25)
# intro sitar motif
for (b, n, d, bend) in HOOK[:6]: put(M, sitar(n, d + 0.4, bend), 0.5 + b * BEAT * 0.9, 0.45, 0.2)
# group 31-35 groove restart: half bar boundary at 31 handled by section() per slot; add 808 for 31-32
put(M, b808(36, 0.9), 31.0, 0.34)

# ending: big chord + sitar cascade + drone tail
put(M, pad([50, 57, 62, 65, 69, 76], 5.0), 35.0, 0.20)
put(M, brass([62, 65, 69, 74], 1.2), 35.0, 0.30)
for k, n in enumerate([86, 84, 81, 79, 77, 74, 72, 69, 67, 65, 62]): put(M, sitar(n, 1.6), 35.15 + k * 0.17, 0.38, -0.3 + 0.06 * k)
put(M, b808(38, 2.5), 35.0, 0.42)

# ---------------- SFX synced to the visuals ----------------
for t in (0.5, 0.9, 1.5, 21.35, 26.4, 35.6): put(X, boom(), t, 0.55); duck(t, 0.6, 0.5)
for t in (10.05, 11.05, 12.05, 13.05): put(X, boom(), t, 0.65); duck(t, 0.6, 0.5)
for c in (4, 10, 14, 21, 26, 31, 35):
    put(X, reverse_cymbal(0.85), c - 0.85, 0.20); put(X, dhol_bass(), c, 0.35)
pops = [0.15] + [5.0 + 0.7 * i for i in range(5)] + [14.8 + 0.75 * i for i in range(4)] + \
       [28.6 + 0.1 * i for i in range(6)] + [31.6 + 0.25 * i for i in range(4)] + [35.25, 37.7] + [36.3 + 0.15 * i for i in range(4)]
for k, t in enumerate(pops): put(X, blip(1 + 0.12 * (k % 5)), t + 0.05, 0.16, (-0.3, 0.3)[k % 2])
for i in range(5): put(X, swish(), 21.7 + 0.42 * i - 0.05, 0.22, (-0.5, 0.5)[i % 2])
for t in (2.2, 2.45, 2.7, 14.3, 31.15, 4.3, 37.1, 37.3, 37.5): put(X, swish(0.22), t - 0.04, 0.12, 0.4)
for f in (0, .22, .42, .6, .8, 1): put(X, blip(1.6), 26.6 + f * 2.2, 0.13, -0.5 + f)
jt = jet(2.6); put(X, jt, 26.4, 0.34, -0.6); put(X, jt * 0.6, 26.42, 0.0, 0.6)

# ---------------- mix ----------------
def reverb(x, sec=1.3, amt=0.05):
    ir = rng.standard_normal(int(sec * SR)) * np.exp(-tt(sec) * 3.5); n = len(x) + len(ir); F = 1 << int(np.ceil(np.log2(n)))
    return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)] * amt
for ch in range(2):
    M[ch] = (M[ch] + reverb(M[ch], 1.3, 0.010)) * DUCK
    X[ch] = X[ch] + reverb(X[ch], 0.9, 0.012)
out = M + X
for ch in range(2):   # tilt EQ: tame sub, lift presence for phone speakers
    F_ = np.fft.rfft(out[ch]); f = np.fft.rfftfreq(N, 1 / SR)
    g = 1 / np.sqrt(1 + (45 / np.maximum(f, 1)) ** 4) * (1 - 0.35 / (1 + (f / 140) ** 2)) * (1 + 0.6 / (1 + (2500 / np.maximum(f, 1)) ** 2))
    out[ch] = np.fft.irfft(F_ * g, N)
fade = np.ones(N); e = int(DUR * SR); fade[e - int(1.2 * SR):e] = np.linspace(1, 0, int(1.2 * SR)); fade[e:] = 0
out *= fade; out[:, :int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
out /= np.abs(out).max(); out = np.tanh(out * 1.5) / np.tanh(1.5) * 0.9
pcm = (out[:, :int(DUR * SR)].T * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1])
