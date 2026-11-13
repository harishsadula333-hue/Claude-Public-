# Brand Bay promo v2 soundtrack: trap hook -> EDM drops, 120 BPM, A minor
import json
exec(open('music.py').read().split('# ---------------- arrangement')[0])
rng = np.random.default_rng(21)
STEP = BEAT / 4  # 16th = 0.125s

# ---------- upgraded instruments ----------
def kick2(punch=1.0, d=0.5):
    t = tt(d)
    f = 44 + 170 * np.exp(-t * 32)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.0)
    mid = bp(rng.standard_normal(len(t)), 120, 900) * np.exp(-t * 60) * 0.5
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 350) * 0.45
    return np.tanh((sub * 1.2 + mid + click * punch) * 2.0) * 0.85

def snare2(d=0.4):
    t = tt(d)
    body = np.sin(2 * np.pi * (200 + 80 * np.exp(-t * 50)) * t) * np.exp(-t * 22) * 0.6
    noise = bp(rng.standard_normal(len(t)), 1200, 10000) * np.exp(-t * 16)
    c = clap(d)[:len(t)]
    return np.tanh((body + noise * 0.8 + c * 0.9) * 1.4) * 0.6

def hat2(vel=1.0, open_=False):
    return hat(0.05, open_) * vel

def b808(freq, d=0.9, glide_to=None):
    t = tt(d)
    f = np.full(len(t), freq)
    if glide_to:
        g = np.clip((t - d * 0.55) / (d * 0.25), 0, 1)
        f = freq * (glide_to / freq) ** g
    f = f * (1 + 0.6 * np.exp(-t * 60))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.004) * np.exp(-t * 2.2)
    return np.tanh(s * env * 2.6) * 0.7

def stab(notes, d=0.22, bright=7000):
    s = sum(supersaw(note(n), d + 0.05, voices=7, spread=28) for n in notes)
    s = lp(s, bright, 2)
    env = adsr(s.shape[0], 0.003, 0.08, 0.6, 0.06)
    return s * env[:, None] / len(notes) * 2.2

def lead(freq, d=0.2):
    t = tt(d + 0.15)
    s = saw(freq, t) * 0.5 + saw(freq, t, 12) * 0.5 + np.sin(2 * np.pi * freq * 2 * t) * 0.3
    s = bp(s, 600, 5000)
    env = adsr(len(t), 0.003, 0.08, 0.5, 0.12)
    return s * env

def subdrop(d=1.5):
    t = tt(d)
    f = 70 * np.exp(-t * 1.4) + 28
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 2) * 0.8

def glitch(d=0.35):
    t = tt(d)
    out = np.zeros(len(t))
    seg = int(0.03 * SR)
    src = saw(220, tt(0.05)) * 0.6 + rng.standard_normal(int(0.05 * SR)) * 0.4
    src = bp(src, 500, 6000)
    for i in range(0, len(t) - seg, seg * 2):
        out[i:i + seg] = src[:seg] * (1 - i / len(t))
    return out * 0.6

def delay(x, dt, fb=0.35, n=4, pp=True):
    y = x.copy()
    k = int(dt * SR)
    for i in range(1, n + 1):
        sh = np.zeros_like(x)
        sh[k * i:] = x[:-k * i] * fb ** i
        if pp and x.ndim == 2 and i % 2:
            sh = sh[:, ::-1]
        y += sh
    return y

# ---------- arrangement ----------
drums = buf(); music = buf(); fx = buf(); bassb = buf()
CH = [('A', ['A3', 'C4', 'E4', 'A4'], 'A1'), ('F', ['F3', 'A3', 'C4', 'F4'], 'F1'),
      ('C', ['G3', 'C4', 'E4', 'G4'], 'C2'), ('G', ['G3', 'B3', 'D4', 'G4'], 'G1')]
EDM = [(6, 14), (14, 24), (28, 34), (36, 39)]
TRAP = [(0, 4), (24, 28)]
inside = lambda t, secs: any(a <= t < b for a, b in secs)
kicks = []

# trap sections
for a, b in TRAP:
    for bar_t in np.arange(a, b, BAR):
        bi = int(round(bar_t / BAR))
        name, notes, root = CH[bi % 4]
        rf = note(root)
        for st in (0, 6, 10):
            place(drums, kick2(0.8), bar_t + st * STEP, 0.85); kicks.append(bar_t + st * STEP)
        place(bassb, b808(rf, 0.75), bar_t, 0.9)
        place(bassb, b808(rf, 0.5), bar_t + 6 * STEP, 0.75)
        place(bassb, b808(rf * 1.19, 0.75, rf * 1.5 if bi % 2 else None), bar_t + 10 * STEP, 0.8)
        place(drums, snare2(), bar_t + 8 * STEP, 0.9)
        for st in range(0, 12, 2):
            place(drums, hat2(0.7 + 0.3 * (st % 4 == 0)), bar_t + st * STEP, 0.55, 0.2)
        # hat roll (32nds then triplets)
        for k in range(8):
            place(drums, hat2(0.4 + 0.07 * k), bar_t + 12 * STEP + k * STEP / 2, 0.5, -0.2)
        if bi % 2:
            for k in range(6):
                place(drums, hat2(0.6), bar_t + 14 * STEP + k * (STEP * 2 / 6), 0.45, 0.3)
        pad = sum(supersaw(note(n), BAR + 0.2, voices=5, spread=18) for n in notes[:3])
        pad = lp(pad, 1500) * adsr(int((BAR + 0.2) * SR), 0.05, 0.3, 0.8, 0.2)[:, None]
        place(music, pad, bar_t, 0.11)
        # bell melody
        mel = [notes[3], notes[2], notes[3], notes[1]]
        for k, nn in enumerate(mel):
            place(music, sparkle(note(nn) * 2, 0.6), bar_t + k * BEAT, 0.5, (-0.3, 0.3)[k % 2])

# EDM drops
hook = [(0, 'E5'), (2, 'E5'), (3, 'D5'), (5, 'C5'), (6, 'E5'), (8, 'A5'), (10, 'G5'), (11, 'E5'), (13, 'D5'), (14, 'C5')]
for a, b in EDM:
    for bar_t in np.arange(a, b, BAR):
        bi = int(round(bar_t / BAR))
        name, notes, root = CH[bi % 4]
        light = a == 28
        for bt in range(4):
            t = bar_t + bt * BEAT
            if t >= b:
                break
            place(drums, kick2(1.0), t, 1.0); kicks.append(t)
            if bt % 2:
                place(drums, snare2(), t, 0.7, 0.05)
            place(drums, hat2(1.0, open_=True), t + BEAT / 2, 0.42, 0.25)
            if a >= 14 and not light:
                place(drums, hat2(0.6), t + STEP, 0.3, -0.3)
                place(drums, hat2(0.6), t + 3 * STEP, 0.3, -0.3)
            # offbeat bass
            place(bassb, bass_note(note(root) * 2, BEAT / 2 * 0.85), t + BEAT / 2, 0.6)
            place(bassb, bass_note(note(root), BEAT / 2 * 0.6), t, 0.35)
        # chord stabs syncopated
        for st in (0, 3, 6, 10, 12, 14):
            if bar_t + st * STEP < b:
                place(music, stab(notes[:3] + [notes[1].replace('4', '5').replace('3', '4')], 0.2, 4500 if light else 8000), bar_t + st * STEP, 0.30 if not light else 0.2)
        pad = sum(supersaw(note(n), BAR, voices=5, spread=20) for n in notes[:3])
        pad = lp(pad, 2500) * adsr(int(BAR * SR), 0.05, 0.3, 0.8, 0.2)[:, None]
        place(music, pad, bar_t, 0.08)
        if not light:
            for st, nn in hook:
                tt0 = bar_t + st * STEP
                if tt0 < b:
                    place(music, delay(np.stack([lead(note(nn), 0.18)] * 2, 1), 3 * STEP, 0.3, 3), tt0, 0.22)
        else:
            for k in range(8):
                nn = notes[[0, 2, 1, 3, 2, 1, 3, 2][k]]
                place(music, pluck(note(nn) * 2, 0.3, 3000), bar_t + k * BEAT / 2, 0.14, (-0.4, 0.4)[k % 2])

# builds
for a, b2 in ((4.0, 5.5), (34.0, 35.75)):
    t = a
    while t < b2:
        prog_ = (t - a) / (b2 - a)
        place(drums, snare2(0.2), t, 0.18 + 0.5 * prog_)
        t += STEP * 2 if prog_ < 0.4 else (STEP if prog_ < 0.75 else STEP / 2)
    place(fx, riser(b2 - a + 0.4, 11000), a, 0.55)
    pad = sum(supersaw(note(n), b2 - a, voices=5) for n in ['A3', 'C4', 'E4'])
    pad = sweep_filter(pad.mean(1), 300, 6000, 'low', 0.8)
    place(music, pad, a, 0.22)
place(fx, rev_cymbal(0.9), 5.1, 0.8)
place(fx, rev_cymbal(0.9), 35.1, 0.8)

# ---------- FX ----------
# hook glitches & hits
place(fx, impact(1.5), 0.0, 0.7)
for t in (0.05, 0.55, 2.05, 2.55):
    place(fx, glitch(), t, 0.5, (-0.5, 0.5)[int(t * 2) % 2])
place(fx, whoosh(0.4, True), 1.65, 0.4)
place(fx, whoosh(0.4, True), 3.65, 0.4)
# wing strokes
for i, t in enumerate((4.2, 4.55, 4.9)):
    place(fx, whoosh(0.4, True, 1.3), t - 0.2, 0.4)
    place(fx, sparkle(1320 * 1.12 ** i), t, 0.6, (-0.4, 0, 0.4)[i])
# big drops
for t, g in ((6.0, 1.0), (14.0, 0.85), (24.0, 0.9), (28.0, 0.6), (36.0, 1.0)):
    place(fx, impact(), t, g)
    place(fx, subdrop(), t, 0.7 * g)
place(fx, impact(1.0), 39.0, 0.9)
# text slams one-stop
for t in (8.0, 8.5, 9.0, 9.5):
    place(fx, pop(800, 0.1), t, 0.45)
for i in range(9):
    place(fx, pop(1300 + i * 70, 0.07), 10.0 + i * 0.1, 0.25, (i % 3 - 1) * 0.6)
for t in (12.0, 12.667, 13.333):
    place(fx, whoosh(0.35, True), t - 0.3, 0.45)
    place(fx, impact(0.8), t, 0.3)
# services
place(fx, rev_cymbal(0.5), 13.5, 0.5)
for i in range(9):
    t = 14.5 + i
    place(fx, whoosh(0.35, i % 2 == 0, 0.9), t - 0.2, 0.35)
    place(fx, pop(1100 + (i % 3) * 150, 0.1), t + 0.05, 0.3, (-0.4, 0.4)[i % 2])
place(fx, riser(1.0, 8000), 23.0, 0.4)
place(fx, whoosh(0.5, True, 1.1), 23.45, 0.5)
# grow section
for i, t in enumerate((25.5, 26.0, 26.5)):
    place(fx, pop(900 + 200 * i, 0.12), t, 0.5)
place(fx, riser(1.2, 6000), 24.4, 0.25)
place(fx, rev_cymbal(1.0), 27.0, 0.5)
# founders
for i, t in enumerate((28.0, 30.0, 32.0)):
    place(fx, whoosh(0.5, False), t - 0.3, 0.5)
    place(fx, sparkle(1568 * 1.06 ** i), t + 0.15, 0.45)
# end card
for i, t in enumerate((37.0, 37.25, 37.5, 37.75)):
    place(fx, pop(900 + i * 120, 0.09), t, 0.3, i % 2 - 0.5)

# ---------- sidechain ----------
sc = np.ones(N)
for kt in kicks:
    i = int(kt * SR); L = int(0.34 * SR)
    seg = 1 - 0.8 * np.exp(-np.arange(L) / SR / 0.1)
    j = min(N, i + L); sc[i:j] = np.minimum(sc[i:j], seg[:j - i])
music *= sc[:, None]
bassb_sc = bassb * (0.4 + 0.6 * sc)[:, None]

# silence gaps before drops (cut everything except fx)
for g0, g1 in ((5.5, 6.0), (35.75, 36.0)):
    i0, i1 = int(g0 * SR), int(g1 * SR)
    for bus in (drums, music, bassb_sc):
        bus[i0:i1] *= np.linspace(1, 0, i1 - i0)[:, None] ** 3

music_w = music + reverb(music, 0.32, 2.4, 2.5)
fx_w = fx + reverb(fx, 0.18, 2.0, 2.8)
drums_bus = drums + reverb(hp(drums, 400), 0.07, 0.9, 5)
mix = drums_bus * 1.0 + music_w * 1.0 + bassb_sc * 0.95 + fx_w * 0.85

t = np.arange(N) / SR
mix *= np.clip((DUR - t) / 1.0, 0, 1)[:, None]
env = np.sqrt(lp(np.mean(mix ** 2, 1), 8, 1).clip(1e-9))
gain = np.where(env > 0.25, (0.25 / env) ** 0.5, 1.0)
mix *= gain[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix /= np.abs(mix).max() / 0.95
with wave.open('music2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
open('kicks.js', 'w').write('window.KICKT=' + json.dumps(sorted(round(k, 4) for k in kicks)) + ';')
print('ok', len(kicks))
