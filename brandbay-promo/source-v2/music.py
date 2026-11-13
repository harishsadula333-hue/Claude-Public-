import numpy as np
from scipy import signal
import wave

SR = 44100
DUR = 40.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(7)

def buf():
    return np.zeros((N, 2))

def place(dst, snd, t, gain=1.0, pan=0.0):
    """Add mono or stereo snd at time t."""
    i = int(t * SR)
    if i >= N:
        return
    if snd.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        snd = np.stack([snd * l * 1.414, snd * r * 1.414], 1)
    n = min(len(snd), N - i)
    dst[i:i + n] += snd[:n] * gain

def tt(d):
    return np.arange(int(d * SR)) / SR

def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR / 2 - 100), 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)

def hp(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)

def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)

def sweep_filter(x, f0, f1, kind='low', q=0.9, blocks=200):
    """time-varying SVF filter (vectorised per sample via python loop on blocks of coef)."""
    n = len(x)
    out = np.zeros_like(x)
    fs = np.geomspace(f0, f1, n)
    low = band = 0.0
    g_all = np.tan(np.pi * np.clip(fs, 20, SR / 2.2) / SR)
    k = 1 / q
    for i in range(n):
        g = g_all[i]
        hpv = (x[i] - (k + g) * band - low) / (1 + g * k + g * g) if False else None
        # Chamberlin-ish TPT SVF
        v3 = x[i] - low
        v1 = (band + g * v3) / (1 + g * (g + k))
        v2 = low + g * v1
        band = 2 * v1 - band
        low = 2 * v2 - low
        out[i] = v2 if kind == 'low' else (v1 if kind == 'band' else x[i] - k * v1 - v2)
    return out

def adsr(n, a, d, s, r, sustain_len=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n)
    env = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, r_n)])
    return env[:n] if len(env) >= n else np.pad(env, (0, n - len(env)))

def saw(freq, t, detune_cents=0):
    f = freq * 2 ** (detune_cents / 1200)
    ph = (f * t + rng.random()) % 1.0
    return 2 * ph - 1

def supersaw(freq, d, voices=7, spread=22):
    t = tt(d)
    out = np.zeros((len(t), 2))
    for v in range(voices):
        c = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
        s = saw(freq, t, c)
        pan = (v - (voices - 1) / 2) / ((voices - 1) / 2) * 0.8
        out[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
        out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    return out / voices

def note(n):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    nm, oc = n[:-1], int(n[-1])
    midi = 12 * (oc + 1) + names[nm]
    return 440 * 2 ** ((midi - 69) / 12)

# ---------------- instruments ----------------
def kick(d=0.45, punch=1.0):
    t = tt(d)
    f = 45 + 140 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 300) * 0.35
    k = np.tanh((body + click * punch) * 1.8)
    return k * 0.9

def clap(d=0.35):
    t = tt(d)
    n = rng.standard_normal(len(t))
    env = np.zeros(len(t))
    for off in (0, 0.011, 0.022):
        tt2 = np.clip(t - off, 0, None)
        env += (t >= off) * np.exp(-tt2 * 90) * 0.5
    env += np.exp(-np.clip(t - 0.03, 0, None) * 18) * (t >= 0.03) * 0.6
    s = bp(n, 900, 5000) * env
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.3
    return (s + tone) * 0.8

def hat(d=0.06, open_=False):
    t = tt(0.3 if open_ else d)
    n = rng.standard_normal(len(t))
    env = np.exp(-t * (14 if open_ else 70))
    return hp(n, 7000, 4) * env * 0.35

def snare(d=0.25):
    t = tt(d)
    tone = np.sin(2 * np.pi * (180 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 25)
    n = bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 22)
    return (tone * 0.5 + n * 0.8) * 0.7

def impact(d=3.5):
    t = tt(d)
    f = 30 + 90 * np.exp(-t * 6)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    noise = rng.standard_normal((len(t), 2))
    crash = hp(noise, 3000) * np.exp(-t * 2.2)[:, None] * 0.35
    thud = lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 9) * 0.8
    mono = np.tanh((boom * 1.4 + thud) * 1.3)
    return np.stack([mono, mono], 1) + crash

def whoosh(d=0.8, up=True, bright=1.0):
    t = tt(d)
    n = rng.standard_normal(len(t))
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    if up:
        env = env * (t / d) ** 0.6
    f0, f1 = (300, 6000 * bright) if up else (5000 * bright, 300)
    s = sweep_filter(n, f0, f1, 'band', q=1.4)
    s = s * env
    pan = np.linspace(-0.7, 0.7, len(t))
    return np.stack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)], 1) * 1.6

def riser(d=2.0, f_end=9000):
    t = tt(d)
    n = rng.standard_normal(len(t))
    s = sweep_filter(n, 200, f_end, 'band', q=2.0) * (t / d) ** 2
    pitch = 200 * 2 ** (3 * t / d)
    tone = np.sin(2 * np.pi * np.cumsum(pitch) / SR) * (t / d) ** 2.5 * 0.15
    m = s * 1.4 + tone
    return np.stack([m, m], 1)

def rev_cymbal(d=1.5):
    t = tt(d)
    n = hp(rng.standard_normal((len(t), 2)), 4000)
    env = (t / d) ** 3
    return n * env[:, None] * 0.5

def pop(freq=900, d=0.12):
    t = tt(d)
    f = freq * (1 + 1.5 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35) * 0.5

def sparkle(base=1760, d=0.9):
    out = np.zeros(int(d * SR))
    t = tt(d)
    for k, m in enumerate([1, 1.5, 2, 3]):
        off = int(k * 0.05 * SR)
        s = np.sin(2 * np.pi * base * m * t) * np.exp(-t * 6) * 0.15
        out[off:] += s[:len(out) - off]
    return out

def pluck(freq, d=0.35, bright=4000):
    t = tt(d)
    s = saw(freq, t) * 0.6 + saw(freq * 2, t, 7) * 0.3
    env = np.exp(-t * 9)
    s = lp(s * env, bright)
    return s

def bass_note(freq, d):
    t = tt(d)
    s = np.sin(2 * np.pi * freq * t) * 0.8 + lp(saw(freq, t), 600) * 0.5
    env = adsr(len(t), 0.005, 0.1, 0.8, 0.05)
    return np.tanh(s * env * 1.5) * 0.6

def reverb_ir(d=2.2, decay=3.0):
    t = tt(d)
    ir = rng.standard_normal((len(t), 2)) * np.exp(-t * decay)[:, None]
    ir = lp(ir, 6000)
    ir[0] = 0
    return ir / np.sqrt((ir ** 2).sum(0))

def reverb(x, wet=0.25, d=2.2, decay=3.0):
    ir = reverb_ir(d, decay)
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return y * wet

# ---------------- arrangement ----------------
drums = buf(); music = buf(); fx = buf(); bassb = buf()
prog = [('A', ['A3', 'C4', 'E4', 'A4'], 'A1'),
        ('F', ['F3', 'A3', 'C4', 'F4'], 'F1'),
        ('C', ['G3', 'C4', 'E4', 'G4'], 'C2'),
        ('G', ['G3', 'B3', 'D4', 'G4'], 'G1')]

# sections where full beat plays (start,end)
beat_sections = [(4, 13.5), (15, 23.5), (24, 25.5), (26, 33.5), (34, 38)]
def in_beat(t):
    return any(a <= t < b for a, b in beat_sections)

kick_times = []
nbeats = int(DUR / BEAT)
for b in range(nbeats):
    t = b * BEAT
    if in_beat(t):
        place(drums, kick(), t, 1.0)
        kick_times.append(t)
        if b % 2 == 1:
            place(drums, clap(), t, 0.55, 0.05)
        place(drums, hat(), t + BEAT / 2, 0.5, 0.25)
        if t >= 15:
            place(drums, hat(0.04), t + BEAT * 0.25, 0.22, -0.3)
            place(drums, hat(0.04), t + BEAT * 0.75, 0.22, -0.3)
        if b % 8 == 7:
            place(drums, hat(open_=True), t + BEAT / 2, 0.35, 0.3)

# intro soft heartbeat kicks & snare roll
for t in (2.0, 2.5, 3.0):
    place(drums, kick(punch=0.3), t, 0.45)
roll_t = 3.0
step = 0.125
while roll_t < 4.0:
    g = 0.15 + 0.5 * (roll_t - 3.0)
    place(drums, snare(), roll_t, g, 0.1)
    roll_t += step if roll_t < 3.5 else 0.0625
# build snare roll before final drop 34->36
roll_t = 35.0
while roll_t < 36.0:
    g = 0.15 + 0.45 * (roll_t - 35.0)
    place(drums, snare(), roll_t, g, -0.1)
    roll_t += 0.125 if roll_t < 35.5 else 0.0625

# chords (pads) + plucks + bass
for bar in range(int(DUR / BAR)):
    t0 = bar * BAR
    name, notes, root = prog[bar % 4]
    pad_gain = 0.10 if t0 < 4 else 0.16
    if t0 >= 38:
        pad_gain = 0.0
    pad = sum(supersaw(note(n), BAR + 0.3) for n in notes[:3])
    cutoff = 900 + 1200 * min(t0 / 4, 1) if t0 < 4 else 2600
    pad = lp(pad, cutoff, 2)
    env = adsr(pad.shape[0], 0.04, 0.3, 0.85, 0.3)
    place(music, pad * env[:, None], t0, pad_gain)
    # plucks 16ths arp
    arp = notes + [notes[1].replace('4', '5').replace('3', '4')]
    pluck_gain = 0.05 if t0 < 4 else 0.10
    if t0 >= 38:
        pluck_gain = 0
    for s in range(16):
        nt = arp[[0, 2, 1, 3, 4, 2, 3, 1][s % 8]]
        f = note(nt) * 2
        pan = 0.4 if s % 2 else -0.4
        place(music, pluck(f, 0.25, 2500 if t0 < 4 else 5000), t0 + s * BEAT / 4, pluck_gain, pan)
    # bass offbeat-8ths + root on beat
    if in_beat(t0) or in_beat(t0 + BAR / 2):
        for e in range(8):
            tb = t0 + e * BEAT / 2
            if in_beat(tb):
                place(bassb, bass_note(note(root) * (2 if e % 2 else 1), BEAT / 2 * 0.9), tb, 0.55)

# lead melody in founders section and outro
melody = [('E5', 0, 1), ('D5', 1, 0.5), ('C5', 1.5, 0.5), ('A4', 2, 1.5), ('C5', 3.5, 0.5),
          ('C5', 4, 1), ('D5', 5, 0.5), ('E5', 5.5, 0.5), ('G5', 6, 1), ('E5', 7, 1)]
for start in (26.0, 30.0, 36.0):
    for n, b, l in melody:
        ts = start + b * BEAT
        if ts >= 38:
            continue
        d = l * BEAT
        t = tt(d + 0.2)
        s = supersaw(note(n), d + 0.2, voices=3, spread=10)
        vib = 1
        env = adsr(len(t), 0.01, 0.1, 0.7, 0.18)
        s = lp(s, 4200) * env[:, None]
        place(music, s, ts, 0.16)

# sidechain pumping on music + bass
sc = np.ones(N)
for kt in kick_times:
    i = int(kt * SR)
    L = int(0.32 * SR)
    seg = 1 - 0.75 * np.exp(-np.arange(L) / SR / 0.09)
    j = min(N, i + L)
    sc[i:j] = np.minimum(sc[i:j], seg[:j - i])
music *= sc[:, None]
bassb *= sc[:, None]

# ---------------- FX synced to visuals ----------------
# intro
place(fx, riser(4.0, 10000), 0.0, 0.35)
place(fx, rev_cymbal(1.5), 2.5, 0.7)
for i, t in enumerate((0.8, 1.5, 2.2)):
    place(fx, whoosh(0.6, True, 1.2), t - 0.25, 0.45)
    place(fx, sparkle(1320 * (1.12 ** i)), t + 0.1, 0.6, [-0.4, 0, 0.4][i])
# drops / impacts
for t, g in ((4.0, 1.0), (14.0, 0.9), (26.0, 0.9), (36.0, 1.0)):
    place(fx, impact(), t, g)
place(fx, impact(4.0), 38.0, 0.75)
# tagline pops
for i, t in enumerate((5.0, 5.5, 6.0)):
    place(fx, pop(700 + 200 * i), t, 0.6, [-0.5, 0, 0.5][i])
place(fx, sparkle(2093), 6.5, 0.5)
# word slams
for t in (8.0, 10.0, 12.0):
    place(fx, whoosh(0.45, True, 1.0), t - 0.42, 0.55)
    place(fx, snare(0.3), t, 0.45)
    place(fx, impact(1.2), t, 0.35)
# pre-drop risers and stops
place(fx, riser(1.0, 8000), 13.0, 0.45)
place(fx, rev_cymbal(1.0), 13.0, 0.5)
place(fx, riser(1.5, 8000), 24.0, 0.4)
place(fx, rev_cymbal(1.0), 25.0, 0.55)
place(fx, riser(2.0, 9000), 34.0, 0.45)
place(fx, rev_cymbal(1.5), 34.5, 0.6)
# OUR SERVICES -> cards
for i in range(9):
    t = 15.0 + i * 1.0
    place(fx, whoosh(0.35, i % 2 == 0, 0.9), t - 0.18, 0.35)
    place(fx, pop(1100 + (i % 3) * 150, 0.1), t + 0.05, 0.35, (-0.4, 0.4)[i % 2])
# grid pop-ins
for i in range(9):
    place(fx, pop(1500 + i * 60, 0.07), 24.0 + i * 0.06, 0.2, (i % 3 - 1) * 0.6)
# transitions
for t in (7.75, 33.75):
    place(fx, whoosh(0.5, True, 1.1), t - 0.1, 0.5)
# founders
for i, t in enumerate((27.0, 29.0, 31.0)):
    place(fx, whoosh(0.5, False, 1.0), t - 0.3, 0.5)
    place(fx, sparkle(1568 * (1.06 ** i)), t + 0.15, 0.45)
place(fx, sparkle(1760), 33.0, 0.5)
# outro contacts pops
for i, t in enumerate((37.0, 37.25, 37.5, 37.75)):
    place(fx, pop(900 + i * 120, 0.09), t, 0.3, (i % 2 - 0.5))

# ---------------- mix ----------------
music_w = music + reverb(music, 0.35, 2.5, 2.4)
fx_w = fx + reverb(fx, 0.18, 2.0, 2.8)
drums_bus = drums + reverb(hp(drums, 300), 0.06, 1.0, 5)
mix = drums_bus * 0.95 + music_w * 1.0 + bassb * 0.9 + fx_w * 0.85

# final tail fade
t = np.arange(N) / SR
fade = np.clip((DUR - t) / 1.6, 0, 1)
mix *= fade[:, None]
# fade in very start
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]

# glue: simple compressor
env = np.sqrt(lp(np.mean(mix ** 2, 1), 8, 1).clip(1e-9))
thr = 0.25
gain = np.where(env > thr, (thr / env) ** 0.5, 1.0)
mix *= gain[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.abs(mix).max() / 0.95

pcm = (mix * 32767).astype(np.int16)
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('done')
