"""Synthesizes an original, royalty-free party track + glass clinks for the edit.

usage: python3 make_music.py <out.wav> <total_seconds> <music_off_at> <music_back_at> [style] [continuous]
continuous: "1" = music plays under the whole edit (party video muted), "0" = duck under the party video
style: "rock" (default)  - fast pop-rock: rock drums, distorted power chords, pop lead hook, 152 bpm
       "edm"             - high-energy festival EDM: build-up, drop on the sponsor scene, 128 bpm
       "swing"           - electro-swing lounge: walking bass, jazz e-piano, muted trumpet, 124 bpm
       "dhol"            - festive dhol + tumbi party groove, 100 bpm swing
       "pop"             - mellow pop groove (plucks, pad, four-on-the-floor), 112 bpm
The music plays under the intro/sponsor scenes, ducks out while the party video
(with its own audio) plays, and returns for the outro.
"""
import sys, wave
import numpy as np

SR = 44100
out, TOTAL, OFF_AT, BACK_AT = sys.argv[1], *map(float, sys.argv[2:5])
STYLE = sys.argv[5] if len(sys.argv) > 5 else "rock"
CONTINUOUS = len(sys.argv) > 6 and sys.argv[6] == "1"
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

BPM = {'pop': 112, 'dhol': 100, 'swing': 124, 'edm': 128, 'rock': 152}[STYLE]
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

try:
    from scipy.signal import lfilter as _lfilter
except ImportError:
    _lfilter = None

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    if _lfilter is not None:
        return _lfilter([1 - a], [1, -a], x)
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

def pop_groove():
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


# ---- Dhol / tumbi party groove ------------------------------------------------
def dagga(f0=95):
    """Low dhol head: pitched thump that bends down."""
    t = np.arange(int(0.45 * SR)) / SR
    f = f0 + f0 * 1.1 * np.exp(-t * 22)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    slap = rng.uniform(-1, 1, len(t)) * np.exp(-t * 120)
    return body + 0.25 * (slap - onepole_lp(slap, 400))

def tilli(bright=1.0):
    """High dhol head: dry stick crack."""
    t = np.arange(int(0.12 * SR)) / SR
    n = rng.uniform(-1, 1, len(t)); n = onepole_lp(n, 5000) - onepole_lp(n, 1400)
    ring = np.sin(2 * np.pi * 620 * t) * np.exp(-t * 45)
    return (n * np.exp(-t * 60) * 1.4 + ring * 0.5) * bright

def tumbi(freq, dur=0.32):
    """Bright, snappy single-string pluck with a tiny upward slide."""
    n = int(dur * SR); p0 = SR / (freq * 0.985)
    p = int(p0)
    buf = rng.uniform(-1, 1, p)
    y = np.empty(n)
    for k in range(n):
        y[k] = buf[k % p]
        buf[k % p] = 0.993 * (0.62 * buf[k % p] + 0.38 * buf[(k + 1) % p])
    y = y - onepole_lp(y, 350)
    return y * np.exp(-np.arange(n) / SR * 6)

def brass(freqs, dur=0.28):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.08, 0.08):
            s += 2 * ((f * 2 ** (det / 12) * t) % 1) - 1
    s /= 2 * len(freqs)
    env = np.minimum(1, t / 0.012) * np.exp(-t * 6)
    bright = env ** 1.5
    return (onepole_lp(s, 700) * (1 - bright) + onepole_lp(s, 4200) * bright) * env

def shaker():
    t = np.arange(int(0.06 * SR)) / SR
    n = rng.uniform(-1, 1, len(t)); n = n - onepole_lp(n, 7000)
    return n * np.sin(np.pi * t / t[-1]) ** 2

SWING = 0.64                                   # bhangra skip
def eighth(t0, k): return t0 + (k // 2) * BEAT + (k % 2) * BEAT * SWING
def sixteenth(t0, k):
    beat, sub = divmod(k, 4)
    return t0 + beat * BEAT + [0, .32, SWING, SWING + .2][sub] * BEAT

def dhol_groove():
    # Am  G  F  G   (i - VII - VI - VII)
    chords = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]
    roots = [45, 43, 41, 43]
    # Two-bar tumbi hook in A minor pentatonic (None = rest), eighth notes
    hook = [81, None, 84, 81, 86, None, 84, 81,  79, 81, None, 76, 79, None, 81, None,
            81, None, 84, 86, 88, None, 86, 84,  86, 84, 81, None, 79, 81, None, None]
    for b in range(bars):
        t0 = b * BAR
        if not CONTINUOUS and OFF_AT + 1.2 < t0 and t0 + BAR + 0.6 < BACK_AT: continue   # muted under the party video
        full = b >= 1
        # tumbi hook (a quiet tease in the first bar, full afterwards)
        for k in range(8):
            note = hook[(b % 4) * 8 + k]
            if note: add(tumbi(midi(note)), eighth(t0, k), 0.25 if k % 2 else -0.15, 1.5 if full else 1.0)
        # dhol: 3-3-2 dagga with tilli filling the gaps
        for k in range(8):
            if k in (0, 3, 6):
                if full: add(dagga(), eighth(t0, k), -0.1, 0.8 if k == 0 else 0.65)
            else:
                add(tilli(1.0 if k in (2, 4) else 0.6), eighth(t0, k), 0.2, 0.34)
        # harmonium-style chord bed (reed-like: odd harmonics, slow swell)
        hp = pad([midi(n) for n in chords[b % 4]] + [midi(chords[b % 4][0] + 12)], BAR + 0.25)
        i = int(t0 * SR); seg = hp[: max(0, N - i)]
        wet_L[i:i + len(seg)] += seg * (0.26 if full else 0.18); wet_R[i:i + len(seg)] += seg * (0.26 if full else 0.18)
        if not full: continue
        # extra tilli rolls at the end of every 2nd bar
        if b % 2 == 1:
            for k in (13, 14, 15): add(tilli(0.8), sixteenth(t0, k), 0.3, 0.35)
        # modern kick + clap for punch
        for k in range(4):
            if k in (0, 2): add(kick(), t0 + k * BEAT, 0, 0.5)
            else: add(clap(), t0 + k * BEAT, -0.1, 0.28)
        for k in range(16): add(shaker(), sixteenth(t0, k), 0.45, 0.10 if k % 2 else 0.16)
        # bass follows the dagga
        ch = chords[b % 4]; r = roots[b % 4]
        for k, d in ((0, 1.2), (3, 1.0), (6, 0.8)):
            add(bass(midi(r - 12 + (12 if k == 6 else 0)), BEAT * d), eighth(t0, k), 0, 0.42)
        # brass stabs on 1 and the "and" of 2, a lift on the 4th bar
        for k in ((0, 3) if b % 4 != 3 else (0, 3, 5, 7)):
            st = brass([midi(n) for n in ch] + [midi(ch[0] + 12)])
            i = int(eighth(t0, k) * SR); seg = st[: max(0, N - i)]
            wet_L[i:i + len(seg)] += seg * 0.30; wet_R[i:i + len(seg)] += seg * 0.30

# ---- Electro-swing lounge groove -------------------------------------------------
def epiano(freq, dur=1.2):
    """FM electric piano: bell-like attack that mellows out."""
    t = np.arange(int(dur * SR)) / SR
    idx = 1.6 * np.exp(-t * 7) + 0.25
    y = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * t))
    y += 0.12 * np.sin(2 * np.pi * freq * 7.1 * t) * np.exp(-t * 25)       # tine ping
    return y * np.exp(-t * 2.6) * np.minimum(1, t / 0.004)

def upright(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    y = np.sin(2 * np.pi * freq * t) + 0.45 * np.sin(4 * np.pi * freq * t) + 0.15 * np.sin(6 * np.pi * freq * t)
    thump = rng.uniform(-1, 1, len(t)) * np.exp(-t * 90)
    return onepole_lp(y + 0.3 * thump, 900) * np.exp(-t * 3.2) * np.minimum(1, t / 0.006) * np.minimum(1, (dur - t) / 0.03).clip(0, 1)

def ride(acc=1.0):
    t = np.arange(int(0.9 * SR)) / SR
    y = np.zeros_like(t)
    for f in (3150, 4370, 5230, 6170, 7410, 8830, 10120):
        y += np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    n = rng.uniform(-1, 1, len(t)); n = n - onepole_lp(n, 6000)
    return (y / 7 * np.exp(-t * 4.5) * 0.6 + n * np.exp(-t * 14) * 0.5) * acc

def snap():
    t = np.arange(int(0.07 * SR)) / SR
    n = rng.uniform(-1, 1, len(t)); n = onepole_lp(n, 3800) - onepole_lp(n, 1500)
    return n * np.exp(-t * 70) * 1.6

def trumpet(freq, dur):
    """Harmon-muted trumpet: nasal saw with delayed vibrato."""
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.006 * np.minimum(1, t / 0.25) * np.sin(2 * np.pi * 5.6 * t)
    ph = np.cumsum(freq * vib) / SR
    saw = 2 * (ph % 1) - 1
    nasal = onepole_lp(saw, 2600) - 0.85 * onepole_lp(saw, 650)
    env = np.minimum(1, t / 0.035) * np.minimum(1, (dur - t) / 0.06).clip(0, 1) * (0.85 + 0.15 * np.exp(-t * 8))
    return nasal * env

SW = 0.66                                         # swing ratio for eighths
def sw8(t0, k): return t0 + (k // 2) * BEAT + (k % 2) * BEAT * SW

def swing_groove():
    # I - vi - ii - V in F:  Fmaj9  Dm9  Gm9  C13 (rootless voicings)
    voicings = [[57, 60, 64, 67], [53, 57, 60, 64], [53, 58, 62, 65], [52, 58, 62, 69]]
    walk = [[41, 45, 48, 39], [38, 41, 45, 42], [43, 46, 41, 37], [36, 40, 43, 40]]
    # 4-bar muted-trumpet tune: (eighth, midi, length in eighths)
    tune = [
        [(0, 72, 2), (2, 74, 1), (3, 76, 1), (4, 77, 2), (6, 76, 1), (7, 74, 1)],
        [(0, 72, 3), (3, 69, 1), (4, 72, 3)],
        [(0, 70, 1), (1, 74, 1), (2, 77, 2), (4, 76, 1), (5, 74, 1), (6, 72, 2)],
        [(0, 70, 2), (2, 69, 2), (4, 67, 3), (7, 72, 1)],
        [(0, 77, 2), (2, 76, 1), (3, 74, 1), (4, 72, 2), (6, 69, 1), (7, 72, 1)],
        [(0, 74, 3), (3, 72, 1), (4, 69, 2), (6, 65, 2)],
        [(0, 67, 1), (1, 70, 1), (2, 74, 1), (3, 77, 1), (4, 76, 2), (6, 74, 1), (7, 70, 1)],
        [(0, 72, 6)],
    ]
    for b in range(bars):
        t0 = b * BAR
        if not CONTINUOUS and OFF_AT + 1.2 < t0 and t0 + BAR + 0.6 < BACK_AT: continue   # muted under the party video
        full = b >= 1
        v = voicings[b % 4]
        # walking bass, quarter notes
        for k, note in enumerate(walk[b % 4]):
            add(upright(midi(note), BEAT * 0.95), t0 + k * BEAT, 0, 0.5)
        # e-piano comping: Charleston rhythm, alternating with a push on the "and" of 4
        hits = (0, 3) if b % 2 == 0 else (2, 7)
        for k in hits:
            for j, n in enumerate(v):
                ep = epiano(midi(n), 1.0) * (0.25 if k in (0, 2) else 0.19)
                i = int((sw8(t0, k) + j * 0.006) * SR); seg = ep[: max(0, N - i)]
                wet_L[i:i + len(seg)] += seg * (0.9 if j % 2 else 0.6); wet_R[i:i + len(seg)] += seg * (0.6 if j % 2 else 0.9)
        # ride: spang-a-lang
        for k in (0, 2, 3, 4, 6, 7):
            add(ride(1.0 if k in (2, 6) else 0.7), sw8(t0, k), 0.35, 0.24 if full else 0.15)
        if not full: continue
        # electro side: four-on-the-floor kick, snaps + soft clap on 2 & 4, off-beat hats
        for k in range(4):
            add(kick(), t0 + k * BEAT, 0, 0.4)
            if k in (1, 3):
                add(snap(), t0 + k * BEAT, -0.3, 0.5)
                add(clap(), t0 + k * BEAT, 0.15, 0.2)
        for k in (1, 3, 5, 7): add(hat(), sw8(t0, k), -0.4, 0.12)
        # muted trumpet tune
        for k, note, ln in tune[(b - 1) % 8]:
            tr = trumpet(midi(note), sw8(0, k + ln) - sw8(0, k) - 0.02 if k + ln < 8 else BAR - sw8(0, k) - 0.02)
            i = int(sw8(t0, k) * SR); seg = tr[: max(0, N - i)] * 0.42
            L[i:i + len(seg)] += seg * 0.8; R[i:i + len(seg)] += seg
            wet_L[i:i + len(seg)] += seg * 0.25; wet_R[i:i + len(seg)] += seg * 0.25

# ---- High-energy EDM -------------------------------------------------------------
def lp_var(x, fc):
    """One-pole low-pass with a per-sample cutoff (for filter sweeps)."""
    a = np.exp(-2 * np.pi * np.asarray(fc) / SR)
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)):
        acc = (1 - a[k]) * x[k] + a[k] * acc
        y[k] = acc
    return y

DETUNE = (-0.24, -0.15, -0.06, 0.0, 0.06, 0.15, 0.24)      # semitones
def supersaw(freqs, dur, attack=0.005, decay=None):
    t = np.arange(int(dur * SR)) / SR
    l = np.zeros_like(t); r = np.zeros_like(t)
    for f in freqs:
        for j, d in enumerate(DETUNE):
            w = 2 * ((f * 2 ** (d / 12) * t + rng.uniform()) % 1) - 1
            if j % 2: l += w
            else: r += w
            if d == 0.0: l += w * 0.5; r += w * 0.5
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / 0.02).clip(0, 1)
    if decay: env *= np.exp(-t * decay)
    n = len(freqs) * 4
    return l * env / n, r * env / n

def edm_kick():
    t = np.arange(int(0.42 * SR)) / SR
    f = 48 + 170 * np.exp(-t * 35)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = rng.uniform(-1, 1, len(t)) * np.exp(-t * 400)
    return np.tanh(1.8 * body) + 0.3 * click

def snare(pitch=1.0):
    t = np.arange(int(0.2 * SR)) / SR
    n = rng.uniform(-1, 1, len(t)); n = n - onepole_lp(n, 1200)
    tone = np.sin(2 * np.pi * 190 * pitch * t) * np.exp(-t * 30)
    return n * np.exp(-t * 22) + 0.6 * tone

def crash():
    t = np.arange(int(2.2 * SR)) / SR
    n = rng.uniform(-1, 1, len(t)); n = n - onepole_lp(n, 4500)
    return n * np.exp(-t * 2.2)

def impact(t0, gain=0.9):
    t = np.arange(int(1.8 * SR)) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 50 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.4)
    add(np.tanh(2 * boom), t0, 0, gain)
    add(crash(), t0, -0.3, 0.32); add(crash(), t0 + 0.01, 0.3, 0.32)

def edm_groove():
    # Am - F - C - G (vi - IV - I - V)
    chords = [[57, 60, 64, 69], [57, 60, 65, 69], [55, 60, 64, 67], [55, 59, 62, 67]]
    roots = [45, 41, 48, 43]
    hook = [
        [(0, 76), (3, 76), (6, 74), (8, 72), (10, 74), (12, 76), (14, 79)],
        [(0, 77), (3, 77), (6, 76), (8, 72), (10, 72), (12, 69), (14, 72)],
        [(0, 76), (3, 76), (6, 74), (8, 72), (10, 74), (12, 76), (14, 79)],
        [(0, 79), (3, 79), (6, 81), (8, 83), (10, 81), (12, 79), (14, 74)],
    ]
    S16 = BEAT / 4
    SPON = OFF_AT - 8.3
    G0 = SPON - 4 * BAR                    # grid start: 4-bar build, drop lands on the sponsor scene
    pump_L = np.zeros(N); pump_R = np.zeros(N)
    kicks = []

    def put(buf_l, buf_r, sig, t0, gain):
        i = int(t0 * SR)
        if i >= N or i < 0: return
        l, r = sig; l = l[: N - i] * gain; r = r[: N - i] * gain
        buf_l[i:i + len(l)] += l; buf_r[i:i + len(r)] += r

    # pickup before the grid: a reverse-cymbal swell
    if G0 > 0.05:
        sw = crash()[: int(G0 * SR)][::-1] * np.linspace(0, 1, int(G0 * SR)) ** 2
        add(sw, 0, 0, 0.35)

    nbars = int((TOTAL - G0) / BAR) + 1
    for b in range(nbars):
        t0 = G0 + b * BAR
        if not CONTINUOUS and OFF_AT + 1.2 < t0 and t0 + BAR + 0.6 < BACK_AT: continue   # muted under the party video
        build = b < 4
        ch = chords[b % 4]; root = roots[b % 4]
        # --- chords: sustained, filtered during the build, wide open in the drop
        l, r = supersaw([midi(n) for n in ch] + [midi(ch[0] - 12)], BAR, attack=0.01)
        if build:
            prog = (b + np.arange(len(l)) / len(l)) / 4
            fc = 350 + 7000 * prog ** 2
            l, r = lp_var(l, fc), lp_var(r, fc)
            put(pump_L, pump_R, (l, r), t0, 1.1 + 0.4 * b / 4)
        else:
            l, r = onepole_lp(l, 6500), onepole_lp(r, 6500)
            put(pump_L, pump_R, (l, r), t0, 1.25)
        # --- kick (dropped for the last two beats of the build)
        for k in range(4):
            if build and b == 3 and k >= 2: continue
            add(edm_kick(), t0 + k * BEAT, 0, 0.8); kicks.append(t0 + k * BEAT)
        # --- hats
        for k in range(16):
            if k % 4 == 2: add(hat(open_=True), t0 + k * S16, 0.25, 0.30 if not build else 0.18)
            elif not build or b >= 2: add(hat(), t0 + k * S16, -0.35, 0.10 if k % 2 else 0.15)
        if build:
            # snare roll that speeds up and rises, plus a noise riser in bars 3-4
            if b >= 2:
                steps = 8 if b == 2 else 16
                for k in range(steps):
                    tt = t0 + k * BAR / steps
                    prog = ((b - 2) + k / steps) / 2
                    add(snare(1 + prog), tt, 0, 0.18 + 0.4 * prog)
                if b == 3:
                    for k in range(8): add(snare(2.0), t0 + BAR / 2 + k * BAR / 16, 0, 0.6)
                noise = rng.uniform(-1, 1, int(BAR * SR))
                prog = ((b - 2) + np.arange(len(noise)) / len(noise)) / 2
                rise = lp_var(noise, 400 + 9000 * prog ** 2) * prog ** 1.5
                add(rise, t0, 0, 0.55)
            # light bass pulse
            for k in (2, 6, 10, 14):
                add(bass(midi(root), S16 * 1.8), t0 + k * S16, 0, 0.35 * (b >= 1))
            continue
        # --- DROP
        if (b - 4) % 8 == 0: add(crash(), t0, 0.2, 0.28)
        for k in (1, 3):
            add(clap(), t0 + k * BEAT, -0.1, 0.55); add(snare(), t0 + k * BEAT, 0.1, 0.35)
        # rolling offbeat bass: saw + sub
        for k in range(16):
            if k % 4 == 0: continue
            d = S16 * 0.9
            tb = np.arange(int(d * SR)) / SR
            fb = midi(root - 12)
            saw = 2 * ((fb * tb) % 1) - 1
            sig = onepole_lp(saw, 900) * 0.7 + np.sin(2 * np.pi * fb / 2 * tb) * 0.45
            sig *= np.minimum(1, tb / 0.003) * np.minimum(1, (d - tb) / 0.01).clip(0, 1)
            put(pump_L, pump_R, (sig, sig), t0 + k * S16, 0.55)
        # supersaw lead hook
        notes = hook[(b - 4) % 4]
        for j, (k, n) in enumerate(notes):
            nxt = notes[j + 1][0] if j + 1 < len(notes) else 16
            d = min(nxt - k, 3) * S16 - 0.01
            l, r = supersaw([midi(n), midi(n + 12)], d, attack=0.003, decay=3.5)
            l, r = onepole_lp(l, 7000), onepole_lp(r, 7000)
            put(L, R, (l, r), t0 + k * S16, 1.1)
            put(wet_L, wet_R, (l, r), t0 + k * S16, 0.45)

    impact(SPON, 0.9)                     # the drop
    impact(BACK_AT + 0.15, 0.7)           # outro hit

    # sidechain pump on chords + bass, keyed from the kick
    t = np.arange(N) / SR
    sc = np.ones(N)
    for kt in kicks:
        i0 = int(kt * SR); i1 = min(N, i0 + int(BEAT * SR))
        if i0 >= N: continue
        dt = t[i0:i1] - kt
        sc[i0:i1] = np.minimum(sc[i0:i1], 1 - 0.85 * np.exp(-dt / 0.11))
    L[:] += pump_L * sc; R[:] += pump_R * sc
    wet_L[:] += pump_L * sc * 0.2; wet_R[:] += pump_R * sc * 0.2

# ---- Fast pop-rock ----------------------------------------------------------------
_gtr_cache = {}
def guitar(root, dur, muted=False, seed=0):
    """Distorted power chord (root-5th-octave), returned as a mono signal."""
    key = (root, round(dur, 4), muted, seed)
    if key in _gtr_cache: return _gtr_cache[key]
    t = np.arange(int(dur * SR)) / SR
    r = np.random.default_rng(1000 + root * 7 + seed)
    x = np.zeros_like(t)
    for n in (root, root + 7, root + 12):
        for d in (-0.07, 0.07):
            f = midi(n) * 2 ** (d / 12)
            ph = f * t + r.uniform()
            x += 2 * (ph % 1) - 1 + 0.5 * np.sign(np.sin(2 * np.pi * ph))
    x /= 9
    pick = np.minimum(1, t / 0.004)
    if muted:
        x = onepole_lp(x, 1700) * np.exp(-t * 11) * 1.6
    else:
        x *= np.exp(-t * 0.6)
    y = np.tanh(6 * x * pick)                               # overdrive
    y = onepole_lp(y, 3800) - onepole_lp(y, 110)            # amp cabinet
    y = onepole_lp(y, 5200)
    y *= np.minimum(1, (dur - t) / 0.015).clip(0, 1)
    _gtr_cache[key] = y
    return y

def rock_kick():
    t = np.arange(int(0.3 * SR)) / SR
    f = 55 + 120 * np.exp(-t * 40)
    return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)) + 0.4 * rng.uniform(-1, 1, len(t)) * np.exp(-t * 300)

def tom(f0):
    t = np.arange(int(0.35 * SR)) / SR
    f = f0 * (1 + 0.5 * np.exp(-t * 20))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + 0.15 * rng.uniform(-1, 1, len(t)) * np.exp(-t * 60)

def lead(freq, dur):
    """Bright pop lead: detuned saw + square with delayed vibrato."""
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.007 * np.minimum(1, t / 0.18) * np.sin(2 * np.pi * 6 * t)
    ph = np.cumsum(freq * vib) / SR
    y = (2 * (ph % 1) - 1) + 0.6 * np.sign(np.sin(2 * np.pi * ph * 1.003)) + 0.5 * (2 * ((ph * 2.002) % 1) - 1)
    y = onepole_lp(y, 4200)
    return y * np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.04).clip(0, 1) * (0.8 + 0.2 * np.exp(-t * 6))

def rock_groove():
    # E - B - C#m - A  (I - V - vi - IV)
    groots = [40, 47, 49, 45]                         # guitar power-chord roots
    broots = [40, 47, 37, 45]                         # bass
    triads = [[64, 68, 71], [63, 66, 71], [61, 64, 68], [61, 64, 69]]
    hook = [                                          # chorus lead: (eighth, midi, length)
        [(0, 71, 2), (2, 73, 1), (3, 76, 2), (5, 75, 1), (6, 76, 2)],
        [(0, 78, 3), (3, 76, 1), (4, 75, 2), (6, 71, 2)],
        [(0, 73, 2), (2, 76, 2), (4, 80, 3), (7, 78, 1)],
        [(0, 76, 3), (3, 73, 1), (4, 71, 2), (6, 73, 1), (7, 75, 1)],
    ]
    E8 = BEAT / 2; S16 = BEAT / 4
    SPON = OFF_AT - 8.3
    G0 = SPON - 5 * BAR                               # chorus 1 lands on the sponsor scene
    while G0 < 0: G0 += BAR
    if G0 > 0.05:                                     # cymbal swell into the first downbeat
        sw = crash()[: int(G0 * SR)][::-1] * np.linspace(0, 1, int(G0 * SR)) ** 1.5
        add(sw, 0, 0, 0.5)
        for k, f in enumerate((200, 160, 120)):
            tt = G0 - (3 - k) * BEAT / 4
            if tt >= 0: add(tom(f), tt, (k - 1) * 0.4, 0.45)
    def section(b):
        if b <= 1: return "intro"
        if b <= 3: return "intro2"
        if b == 4: return "build"
        if b <= 12: return "chorus"
        if b <= 20: return "verse"
        if b <= 28: return "chorus"
        if b <= 32: return "bridge"
        if b == 33: return "build"
        if b <= 41: return "chorus"
        if b <= 45: return "verse"
        return "chorus"
    nbars = int((TOTAL - G0) / BAR) + 1
    last = nbars - 1
    for b in range(nbars):
        t0 = G0 + b * BAR
        sec = section(b)
        ci = b % 4
        if b == last or t0 + BAR > TOTAL - 0.2:
            # final hit: big ringing chord + crash, then stop
            add(guitar(groots[0], 2.4), t0, -0.6, 0.55); add(guitar(groots[0], 2.4, seed=1), t0, 0.6, 0.55)
            add(rock_kick(), t0, 0, 1.0); add(crash(), t0, 0, 0.45); add(snare(), t0, 0, 0.6)
            add(bass(midi(broots[0]), 2.0), t0, 0, 0.8)
            break
        new_sec = section(b - 1) != sec if b > 0 else True
        if new_sec and sec in ("chorus", "verse", "intro2"): add(crash(), t0, 0.3, 0.35)
        # ---- drums
        if sec == "intro":
            for k in range(8): add(hat(), t0 + k * E8, -0.3, 0.16)
            for k in (0, 4): add(rock_kick(), t0 + k * E8, 0, 0.8)
        elif sec == "bridge":
            add(rock_kick(), t0, 0, 0.9); add(snare(), t0 + 2 * BEAT, 0, 0.6)
            for k in range(4): add(ride(0.8), t0 + k * BEAT, 0.3, 0.2)
        elif sec == "build":
            for k in range(4): add(rock_kick(), t0 + k * BEAT, 0, 0.85)
            for k in range(16):
                p = k / 16
                add(snare(1 + 0.5 * p), t0 + k * S16, 0, 0.2 + 0.55 * p)
        else:
            kicks = (0, 4) if sec == "intro2" else ((0, 3, 4, 7) if sec == "verse" else (0, 2, 3, 4, 6, 7))
            for k in kicks: add(rock_kick(), t0 + k * E8, 0, 0.75)
            for k in (2, 6):
                add(snare(), t0 + k * E8, 0, 0.75)
                i = int((t0 + k * E8) * SR); sn = snare()[: max(0, N - i)] * 0.35
                wet_L[i:i + len(sn)] += sn; wet_R[i:i + len(sn)] += sn
            if sec == "chorus":
                for k in range(8): add(hat(open_=(k % 2 == 1)), t0 + k * E8, -0.3, 0.17)
            else:
                for k in range(8): add(hat(), t0 + k * E8, -0.3, 0.2 if k % 2 == 0 else 0.13)
            # tom fill every 4th bar
            if b % 4 == 3 and section(b + 1) == sec:
                for k, f in zip(range(12, 16), (180, 150, 120, 95)):
                    add(tom(f), t0 + k * S16, (k - 13.5) / 3, 0.6)
        # ---- guitars (double-tracked, panned hard L/R)
        gr = groots[ci]
        if sec in ("intro", "intro2", "verse", "build"):
            for k in range(8):
                acc = 1.0 if k in (0, 3, 6) else 0.75
                gain = (0.5 if sec == "intro" else 0.8) * acc
                add(guitar(gr, E8 * 0.95, muted=True), t0 + k * E8, -0.75, gain)
                add(guitar(gr, E8 * 0.95, muted=True, seed=1), t0 + k * E8 + 0.008, 0.75, gain)
        elif sec == "chorus":
            # open chords on 1 and the "and" of 2, re-struck on 4
            for k, ln in ((0, 3), (3, 3), (6, 2)):
                add(guitar(gr, E8 * ln - 0.01), t0 + k * E8, -0.75, 0.6)
                add(guitar(gr, E8 * ln - 0.01, seed=1), t0 + k * E8 + 0.01, 0.75, 0.6)
        elif sec == "bridge":
            add(guitar(gr, BAR - 0.02), t0, -0.7, 0.3); add(guitar(gr, BAR - 0.02, seed=1), t0 + 0.01, 0.7, 0.3)
            for k in range(8):                          # clean arpeggio on top
                n = triads[ci][k % 3] + (12 if k >= 4 else 0)
                add(pluck(midi(n), 0.6, 0.7), t0 + k * E8, 0.4 if k % 2 else -0.4, 0.3)
        # ---- bass: driving eighths
        if sec != "intro":
            for k in range(8):
                note = broots[ci] + (12 if sec == "chorus" and k in (3, 7) else 0)
                add(bass(midi(note), E8 * 0.9), t0 + k * E8, 0, 0.36 if sec != "bridge" else 0.28)
        # ---- pop lead hook in the chorus, a lighter counter-line in the verse
        if sec == "chorus":
            for k, n, ln in hook[ci]:
                ld = lead(midi(n), ln * E8 - 0.02)
                add(ld, t0 + k * E8, 0.1, 0.22)
                i = int((t0 + k * E8) * SR); seg = ld[: max(0, N - i)] * 0.06
                wet_L[i:i + len(seg)] += seg; wet_R[i:i + len(seg)] += seg
        elif sec == "verse" and b % 2 == 1:
            for k, n in ((0, triads[ci][2] + 12), (3, triads[ci][1] + 12), (6, triads[ci][0] + 12)):
                add(pluck(midi(n), 0.5, 0.8), t0 + k * E8, 0.35, 0.3)

{"pop": pop_groove, "dhol": dhol_groove, "swing": swing_groove, "edm": edm_groove, "rock": rock_groove}[STYLE]()

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
if not CONTINUOUS:
    env[t >= OFF_AT] = np.clip(1 - (t[t >= OFF_AT] - OFF_AT) / 1.0, 0, 1)
    back = t >= BACK_AT
    env[back] = np.clip((t[back] - BACK_AT) / 0.7, 0, 1)
env *= np.clip((TOTAL - t) / 1.6, 0, 1)            # final fade out
env *= np.clip(t / 0.25, 0, 1)                        # soft start
L *= env; R *= env

# Normalise the music bed to roughly match the party video's loudness, then add SFX on top.
mask = env > 0.9
rms = np.sqrt(np.mean((L[mask] ** 2 + R[mask] ** 2) / 2))
target = 10 ** ({'pop': -17, 'dhol': -18, 'swing': -18, 'edm': -17, 'rock': -16}[STYLE] / 20)
L *= target / rms; R *= target / rms

SPONSOR_AT = OFF_AT - 8.3          # sponsor scene starts one scene (9s - 0.7s xfade) before the video
clink(1.25, 0.32)                  # glasses clink as the intro logo lands
whoosh(SPONSOR_AT - 0.4, 0.8)      # into the sponsor scene
if CONTINUOUS: whoosh(OFF_AT - 0.4, 0.8)   # into the party video
sparkle(SPONSOR_AT + 2.7)          # Mr. KIRAN pops
whoosh(BACK_AT - 0.5, 0.8)         # into the outro
clink(BACK_AT + 1.3, 0.32)         # outro logo lands

L = np.tanh(L * 1.1) / 1.1; R = np.tanh(R * 1.1) / 1.1   # soft-clip drum peaks
peak = max(np.abs(L).max(), np.abs(R).max())
if peak > 0.97:
    L *= 0.97 / peak; R *= 0.97 / peak
pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, f'{TOTAL:.2f}s')
