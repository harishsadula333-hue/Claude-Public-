# Original upbeat electronic-pop beat (D major) + synced SFX for the AIMS 40 s reel.
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


# ---------------- beat instruments ----------------
def kick():
    t = tt(0.42); f = 48 + 130 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = fft_filter(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t * 400) * 0.35
    return np.tanh((body + click) * 1.8)
def snare():
    t = tt(0.25); tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.6
    nz = fft_filter(rng.standard_normal(len(t)), 1200, 9000) * np.exp(-t * 16)
    return tone + nz
def hat(open_=False):
    d = 0.28 if open_ else 0.05; t = tt(d)
    return fft_filter(rng.standard_normal(len(t)), 7500, None) * np.exp(-t * (10 if open_ else 80))
def supersaw(notes, d, cutoff=3200):
    t = tt(d); s = 0
    for nt in notes:
        for k, dt in enumerate((-0.012, -0.007, -0.003, 0, 0.003, 0.007, 0.012)):
            ph = (t * hz(nt) * (1 + dt) + k * 0.13) % 1; s = s + (2 * ph - 1)
    s = fft_filter(s, 120, cutoff) / (7 * len(notes))
    return s * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03)
def pluck(note, d=0.35):
    t = tt(d); ph = (t * hz(note)) % 1
    s = (2 * ph - 1) * 0.6 + np.sign(np.sin(2 * np.pi * hz(note) * 2 * t)) * 0.25
    return fft_filter(s, 200, 5200) * np.exp(-t * 9)
def sub(note, d):
    t = tt(d); s = np.sin(2 * np.pi * hz(note) * t) + 0.25 * np.sin(4 * np.pi * hz(note) * t)
    return s * np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.02)
def roll(t0, t1, gain=0.35):
    t = t0; k = 0
    while t < t1:
        p = (t - t0) / (t1 - t0); put(M, snare(), t, gain * (0.35 + 0.65 * p), 0.05)
        step = BEAT / 2 if p < 0.5 else (BEAT / 4 if p < 0.8 else BEAT / 8); t += step

# ---------------- arrangement (D major: D - A - Bm - G) ----------------
prog = [(38, [62, 66, 69, 74]), (45, [61, 64, 69, 73]), (47, [62, 66, 71, 74]), (43, [62, 67, 71, 74])]
LEAD = [(0, 78), (.5, 76), (1, 74), (1.5, 76), (2.5, 78), (3, 81), (3.5, 78),          # 2-bar hook (beat, note)
        (4, 76), (4.5, 74), (5, 73), (5.5, 74), (6.5, 69), (7, 71), (7.5, 74)]
def section(t):
    if t < 4: return 'intro'
    if t < 10: return 'A'
    if t < 14: return 'half'
    if t < 26: return 'B'
    if t < 31: return 'break'
    if t < 35: return 'B'
    return 'end'

for bar in range(20):
    t0 = bar * 2.0; root, chord = prog[bar % 4]
    for q in range(4):                          # beats
        tb = t0 + q * BEAT; sec = section(tb)
        if sec in ('A', 'B'):
            put(M, kick(), tb, 0.52); duck(tb, 0.6, 0.3)
            if q in (1, 3): put(M, snare(), tb, 0.30); put(M, clap(), tb, 0.22, 0.05)
            put(M, hat(), tb + BEAT / 2, 0.16, 0.3)
            put(M, hat(), tb + BEAT / 4, 0.06, -0.3); put(M, hat(), tb + 3 * BEAT / 4, 0.06, -0.3)
            if sec == 'B' and q == 3: put(M, hat(True), tb + BEAT / 2, 0.10)
            put(M, sub(root - 12, BEAT / 2 - 0.02), tb + BEAT / 2, 0.20)     # offbeat bass
        elif sec == 'half':
            if q == 0: put(M, kick(), tb, 0.65); duck(tb, 0.6, 0.6)
            if q == 2: put(M, snare(), tb, 0.32); put(M, clap(), tb, 0.25)
            put(M, hat(), tb + BEAT / 2, 0.08, 0.3)
        elif sec == 'break':
            put(M, hat(), tb + BEAT / 2, 0.08, 0.3)
            if q == 0 and tb < 29.9: put(M, kick(), tb, 0.35); duck(tb, 0.4)
    sec = section(t0 + 0.01)
    # chords: pumping supersaw (sidechained by DUCK), filtered in intro
    if sec == 'intro':
        put(M, supersaw(chord, 2.0, 700 + 900 * bar), t0, 0.20)
    elif sec in ('A', 'B'):
        put(M, supersaw(chord, 2.0, 4200 if sec == 'B' else 3400), t0, 0.34)
    elif sec in ('half', 'break'):
        put(M, supersaw(chord, 2.0, 2000), t0, 0.26); put(M, sub(root - 12, 2.0), t0, 0.18)
    # lead hook on 2-bar phrases
    if sec in ('A', 'B', 'intro', 'break') and bar % 2 == 0:
        up = 12 if sec == 'B' else 0
        for b, n in LEAD:
            ts = t0 + b * BEAT
            if section(ts) in ('end', 'half') or (sec == 'intro' and ts < 0.4): continue
            put(M, pluck(n + up, 0.4), ts, 0.32 if sec != 'intro' else 0.22, 0.15)
            if sec == 'B': put(M, pluck(n, 0.4), ts, 0.16, -0.2)
    # arpeggio in break
    if sec == 'break':
        for k in range(8): put(M, pluck(chord[k % 4] + 12, 0.25), t0 + k * BEAT / 2, 0.10, (-0.4, 0.4)[k % 2])

roll(3.0, 4.0); roll(13.0, 14.0); roll(30.0, 31.0, 0.3)
put(M, kick(), 31.0, 0.7)
# ending: big chord hit + lead arpeggio tail
put(M, supersaw([50, 57, 62, 66, 69, 74], 4.8, 3400) * np.exp(-tt(4.8) * 0.45), 35.0, 0.38)
put(M, kick(), 35.0, 0.6); put(M, sub(38, 3.0) * np.exp(-tt(3.0) * 1.2), 35.0, 0.28)
for k, n in enumerate([86, 81, 78, 74, 69, 66, 62]): put(M, pluck(n, 0.9), 35.2 + k * 0.22, 0.26, -0.3 + 0.1 * k)

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
