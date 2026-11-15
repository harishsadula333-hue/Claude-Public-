"""Synthesize an original background track + sound effects and mix them with the narration.
Inputs : build/voice.wav, build/sfx.json (cue list exported by the animation), build/timeline.json
Output : build/mix.wav (48 kHz stereo)"""
import json, os
import numpy as np
import scipy.io.wavfile as wf
from scipy.signal import butter, sosfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "..", "build")
SR = 48000
rng = np.random.default_rng(42)

def T(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def norm(x, p=1.0): m = np.abs(x).max(); return x / m * p if m > 0 else x
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def fade(x, a=0.003, b=0.01):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def sweep_sine(f0, f1, d, curve="exp"):
    t = T(d)
    f = f0 * (f1 / f0) ** (t / d) if curve == "exp" else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def svf_bp(x, fc, q=0.6):
    """time-varying state-variable band-pass; fc can be an array"""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    f = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    low = band = 0.0; out = np.empty_like(x)
    for i in range(len(x)):
        low += f[i] * band; high = x[i] - low - q * band; band += f[i] * high; out[i] = band
    return out
def bell(f, d, partials=((1, 1), (2.76, 0.4), (5.4, 0.2), (8.9, 0.08)), dec=4.0):
    t = T(d); y = np.zeros_like(t)
    for r, a in partials: y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec * (1 + r * 0.35))
    return fade(y, 0.001, 0.02)
def place(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * g

# ------------------------------------------------------------------ SFX library
def sfx_whoosh(d=0.55, f0=250, f1=3200):
    t = T(d); env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
    fc = f0 * (f1 / f0) ** (t / d)
    return norm(svf_bp(noise(d), fc, 0.5) * env, 0.9)
def sfx_pop(f0=320, f1=980, d=0.11):
    t = T(d); return fade(sweep_sine(f0, f1, d) * np.exp(-t * 34), 0.001, 0.01)
def sfx_click():
    t = T(0.03); c = hp(noise(0.03), 2500) * np.exp(-t * 400) + 0.5 * np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 180)
    return norm(c, 0.9)
def sfx_poof():
    d = 0.55; t = T(d); fc = 4500 * (300 / 4500) ** (t / d)
    return norm(svf_bp(noise(d), fc, 0.9) * np.exp(-t * 7) * (1 - np.exp(-t * 200)), 0.9)
def sfx_boing():
    d = 0.6; t = T(d); f = 260 + 140 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4) + 120 * t
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5), 0.002, 0.03)
def sfx_riser():
    d = 0.55; t = T(d); env = (t / d) ** 2
    y = svf_bp(noise(d), 400 * (5000 / 400) ** (t / d), 0.4) * 0.8 + 0.3 * sweep_sine(150, 900, d)
    return norm(y * env, 0.8)
def sfx_impact(d=1.4):
    t = T(d); f = 40 + 110 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    hit = lp(noise(d), 1800) * np.exp(-t * 22)
    tail = lp(noise(d), 700) * np.exp(-t * 3) * 0.25
    return norm(np.tanh(1.6 * (boom + 0.5 * hit + tail)), 0.95)
def sfx_stamp():
    d = 0.7; t = T(d); f = 48 + 140 * np.exp(-t * 22)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    snap = hp(noise(d), 1200) * np.exp(-t * 60)
    return norm(np.tanh(2.2 * (boom + 0.6 * snap)), 0.95)
def sfx_stampS():
    d = 0.3; t = T(d); f = 80 + 160 * np.exp(-t * 30)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) + 0.4 * hp(noise(d), 1500) * np.exp(-t * 80), 0.9)
def sfx_glitch():
    out = np.zeros(int(0.32 * SR)); i = 0
    while i < len(out):
        n = int(rng.uniform(0.012, 0.035) * SR); f = rng.uniform(180, 2400)
        seg = np.sign(np.sin(2 * np.pi * f * np.arange(n) / SR)) * (rng.random() > 0.25)
        out[i:i + n] = seg[:len(out) - i]; i += n + int(rng.uniform(0, 0.01) * SR)
    return norm(lp(out, 6000) * np.linspace(1, 0.3, len(out)), 0.6)
def sfx_shimmer():
    out = np.zeros(int(0.9 * SR))
    for k, m in enumerate([81, 84, 88, 91, 93, 96]): place(out, bell(mtof(m), 0.5, dec=7) * 0.5, k * 0.06)
    return norm(out, 0.7)
def sfx_data():
    d = 1.5; out = np.zeros(int(d * SR)); tt = 0.0
    while tt < d - 0.05:
        n = 0.026; f = rng.choice([880, 1175, 1318, 1568, 1760, 2093])
        place(out, np.sign(np.sin(2 * np.pi * f * T(n))) * np.exp(-T(n) * 60) * 0.5, tt); tt += rng.uniform(0.035, 0.07)
    return norm(lp(out, 5000) * np.sin(np.pi * np.linspace(0, 1, len(out))) ** 0.5, 0.5)
def keyclick(g=1.0):
    t = T(0.05); return (hp(noise(0.05), 2000) * np.exp(-t * 260) + 0.6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 90)) * g
def sfx_type():
    out = np.zeros(int(0.5 * SR)); tt = 0
    for _ in range(5): place(out, keyclick(rng.uniform(0.6, 1)), tt); tt += rng.uniform(0.07, 0.11)
    return norm(out, 0.8)
def sfx_key():
    t = T(0.12); y = hp(noise(0.12), 1500) * np.exp(-t * 150) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 45)
    return norm(y, 0.9)
def sfx_lid():
    t = T(0.25); return norm(lp(noise(0.25), 900) * np.exp(-t * 16) + 0.5 * np.sin(2 * np.pi * 320 * t) * np.exp(-t * 25), 0.7)
def sfx_drop():
    d = 0.45; t = T(d); thud = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t * 11)
    ring = 0.25 * (np.sin(2 * np.pi * 620 * t) + 0.6 * np.sin(2 * np.pi * 1130 * t)) * np.exp(-t * 9)
    rustle = bp(noise(d), 1500, 6000) * np.exp(-t * 20) * 0.5
    return norm(thud + ring + rustle, 0.9)
def sfx_crumple():
    d = 0.6; t = T(d); am = (rng.random(int(d * 200)) ** 3).repeat(SR // 200 + 1)[:len(t)]
    return norm(bp(noise(d), 1800, 7000) * am * np.exp(-t * 3), 0.8)
def sfx_scribble():
    d = 0.4; t = T(d); am = 0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)
    return norm(bp(noise(d), 2500, 7000) * am * np.sin(np.pi * t / d), 0.6)
def sfx_eraser():
    d = 0.65; t = T(d); am = (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t)) ** 2
    return norm(bp(noise(d), 700, 3000) * am * np.sin(np.pi * t / d) ** 0.5, 0.7)
def sfx_sparkle():
    out = np.zeros(int(1.0 * SR))
    for k in range(9): place(out, bell(rng.uniform(2200, 4800), 0.45, dec=9) * rng.uniform(0.4, 1), k * 0.055 + rng.uniform(0, 0.02))
    return norm(out, 0.6)
def sfx_alarm():
    out = np.zeros(int(1.0 * SR))
    for k in range(3):
        for j, f in enumerate([988, 740]):
            n = 0.12; y = np.tanh(3 * np.sin(2 * np.pi * f * T(n))) * 0.5; place(out, fade(y, 0.004, 0.02), k * 0.3 + j * 0.13)
    return norm(lp(out, 4000), 0.55)
def sfx_scan():
    out = np.zeros(int(1.2 * SR))
    for k in range(9): place(out, fade(np.sin(2 * np.pi * 1320 * T(0.05)), 0.002, 0.02) * 0.35, k * 0.12)
    place(out, sfx_whoosh(1.1, 600, 2400) * 0.25, 0)
    return norm(out, 0.6)
def chord_bells(ms, gap=0.07, d=1.0, dec=3.5):
    out = np.zeros(int((d + gap * len(ms)) * SR))
    for k, m in enumerate(ms): place(out, bell(mtof(m), d, dec=dec), k * gap)
    return norm(out, 0.8)
def sfx_success(): return chord_bells([72, 76, 79, 84], 0.07, 1.0, 3.2)
def sfx_ding(): return norm(bell(mtof(91), 0.9, dec=4), 0.7)
def sfx_check(): return chord_bells([88, 93], 0.08, 0.5, 6)
def sfx_swoosh(): return sfx_whoosh(0.75, 500, 5000)
def sfx_lock():
    out = np.zeros(int(0.3 * SR))
    for k, g in enumerate([0.7, 1.0]):
        t = T(0.08); place(out, (hp(noise(0.08), 3000) * np.exp(-t * 300) + 0.4 * np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 60)) * g, k * 0.07)
    return norm(out, 0.9)
def sfx_down():
    d = 1.0; t = T(d); return norm(sweep_sine(900, 140, d) * np.exp(-t * 1.5) * 0.6 + 0.2 * np.sign(sweep_sine(450, 70, d)) * np.exp(-t * 2), 0.5)
def sfx_buzz():
    d = 0.42; t = T(d); y = np.sign(np.sin(2 * np.pi * 116 * t)) + np.sign(np.sin(2 * np.pi * 122 * t))
    return norm(lp(y, 2200) * fade(np.ones_like(t), 0.005, 0.06), 0.6)
def sfx_tick():
    t = T(0.04); return norm(np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 120) + 0.5 * np.sin(2 * np.pi * 850 * t) * np.exp(-t * 90), 0.8)
def sfx_shred():
    d = 0.9; t = T(d); motor = np.sign(np.sin(2 * np.pi * (85 + 6 * np.sin(2 * np.pi * 7 * t)) * t))
    grind = bp(noise(d), 800, 4000) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t))
    return norm(lp(motor, 1200) * 0.5 + grind * 0.6, 0.6) * fade(np.ones_like(t), 0.03, 0.15)
def sfx_spin():
    d = 0.7; t = T(d); return norm(svf_bp(noise(d), 600 * (3000 / 600) ** (t / d), 0.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d), 0.6)
def sfx_bell():
    out = np.zeros(int(1.2 * SR))
    for k in range(4): place(out, bell(2093, 0.5, dec=6) * 0.6 + bell(2637, 0.5, dec=6) * 0.4, k * 0.11)
    return norm(out, 0.6)
def sfx_confetti():
    out = np.zeros(int(1.0 * SR)); place(out, sfx_pop(200, 600, 0.12), 0)
    for _ in range(14): t = T(0.02); place(out, hp(noise(0.02), 3000) * np.exp(-t * 300) * rng.uniform(0.2, 0.6), rng.uniform(0.05, 0.8))
    return norm(out, 0.8)

LIB = {
    "whoosh": sfx_whoosh(), "whooshS": sfx_whoosh(0.35, 500, 4000), "pop": sfx_pop(), "popLow": sfx_pop(180, 520, 0.12),
    "click": sfx_click(), "poof": sfx_poof(), "boing": sfx_boing(), "riser": sfx_riser(), "impact": sfx_impact(), "stamp": sfx_stamp(),
    "stampS": sfx_stampS(), "glitch": sfx_glitch(), "shimmer": sfx_shimmer(), "data": sfx_data(), "type": sfx_type(), "key": sfx_key(),
    "lid": sfx_lid(), "drop": sfx_drop(), "crumple": sfx_crumple(), "scribble": sfx_scribble(), "eraser": sfx_eraser(),
    "sparkle": sfx_sparkle(), "alarm": sfx_alarm(), "scan": sfx_scan(), "success": sfx_success(), "ding": sfx_ding(),
    "check": sfx_check(), "swoosh": sfx_swoosh(), "lock": sfx_lock(), "down": sfx_down(), "buzz": sfx_buzz(), "tick": sfx_tick(),
    "shred": sfx_shred(), "spin": sfx_spin(), "bell": sfx_bell(), "confetti": sfx_confetti(),
}

# ------------------------------------------------------------------ music (original, A minor, 110 BPM)
def additive(f, t, nh=10, roll=1.0, det=0.0):
    y = np.zeros_like(t)
    for k in range(1, nh + 1):
        if f * k > 9000: break
        y += np.sin(2 * np.pi * f * k * (1 + det) * t + k * 0.7) / k ** roll
    return y
def music(dur, sections):
    bpm = 110; beat = 60 / bpm; bar = beat * 4; s16 = beat / 4
    n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    drums = np.zeros(n); bass = np.zeros(n); padL = np.zeros(n); padR = np.zeros(n); arp = np.zeros(n)
    prog = [([57, 60, 64, 71], 45), ([53, 57, 60, 64], 41), ([48, 52, 55, 62], 48), ([55, 59, 62, 64], 43)]
    # instruments
    def kick():
        t = T(0.42); f = 46 + 120 * np.exp(-t * 28)
        return np.tanh(1.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)) + 0.25 * hp(noise(0.42), 3000) * np.exp(-t * 250)
    def clap():
        out = np.zeros(int(0.3 * SR))
        for k in range(3): t = T(0.02); place(out, bp(noise(0.02), 900, 3500) * np.exp(-t * 120), k * 0.011)
        t = T(0.25); place(out, bp(noise(0.25), 900, 3200) * np.exp(-t * 18) * 0.6, 0.03)
        return out
    def hat(op=False):
        d = 0.3 if op else 0.06; t = T(d); return hp(noise(d), 7000) * np.exp(-t * (9 if op else 70))
    def crash():
        t = T(2.0); return hp(noise(2.0), 3500) * np.exp(-t * 2.2) * 0.7
    K, C, H, HO, CR = kick(), clap(), hat(), hat(True), crash()
    nb = int(np.ceil(dur / bar)) + 1
    kick_times = []
    def active(name, t): return any(a <= t < b for a, b in sections.get(name, []))
    for bi in range(nb):
        t0 = bi * bar
        chord, root = prog[bi % 4]
        # pad (whole bar)
        if t0 < dur:
            t = T(bar + 0.6)
            env = np.minimum(1, t / 0.35) * np.where(t > bar, np.exp(-(t - bar) * 5), 1)
            for m in chord:
                f = mtof(m)
                padL_seg = additive(f, t, 9, 1.25, -0.0035) * env
                padR_seg = additive(f, t, 9, 1.25, 0.0035) * env
                if active("pad", t0): place(padL, padL_seg * 0.11, t0); place(padR, padR_seg * 0.11, t0)
        for s in range(16):
            ts = t0 + s * s16
            if ts >= dur: break
            # drums
            if s % 4 == 0 and active("kick", ts): place(drums, K * 0.9, ts); kick_times.append(ts)
            if s in (4, 12) and active("clap", ts): place(drums, C * 0.55, ts)
            if s % 4 == 2 and active("hat", ts): place(drums, (HO if s == 14 else H) * 0.22, ts)
            if s % 2 == 1 and active("hat2", ts): place(drums, H * 0.1, ts)
            # bass: 8ths with octave pops
            if s % 2 == 0 and active("bass", ts):
                m = root + (12 if s in (6, 14) else 0); tt = T(s16 * 2 * 0.95); f = mtof(m)
                seg = (np.sin(2 * np.pi * f / 2 * tt) * 0.9 + lp(additive(f, tt, 8, 1.0), 900) * 0.45) * np.exp(-tt * 3.5)
                place(bass, fade(seg, 0.003, 0.02) * 0.5, ts)
            # pluck arp (16ths)
            if active("arp", ts):
                pat = [0, 2, 1, 3, 2, 0, 3, 1]
                m = chord[pat[s % 8]] + 12 + (12 if s % 8 == 6 else 0)
                tt = T(0.32); f = mtof(m)
                pl = np.zeros_like(tt)
                for k in range(1, 7): pl += np.sin(2 * np.pi * f * k * tt) / k * np.exp(-tt * (9 + k * 4))
                place(arp, fade(pl, 0.002, 0.02) * (0.13 if s % 4 == 0 else 0.09), ts)
    for a, b in sections.get("crash", []): place(drums, CR, a)
    # sidechain pump from kicks
    pump = np.ones(n)
    for kt in kick_times:
        i = int(kt * SR); m = min(n - i, int(0.3 * SR)); tt = np.arange(m) / SR
        pump[i:i + m] = np.minimum(pump[i:i + m], 1 - 0.45 * np.exp(-tt * 9))
    # intro filter sweep on pad
    tt = np.arange(n) / SR; open_ = np.clip((tt - 0.3) / 3.0, 0, 1)
    def sweep(x): low = lp(x, 500); return low + (x - low) * open_
    padL, padR = sweep(padL) * pump, sweep(padR) * pump
    bass = bass * pump
    # ping-pong delay for arp (dotted 8th)
    dly = int(beat * 0.75 * SR); arpL = arp.copy(); arpR = arp.copy() * 0.6
    for k in range(1, 4):
        g = 0.35 ** k; sh = dly * k
        (arpR if k % 2 else arpL)[sh:] += arp[:-sh] * g
    arpL, arpR = lp(arpL, 6500), lp(arpR, 6500)
    L = drums + bass + padL + arpL; R = drums + bass + padR + arpR
    return L, R

def reverb(x, d=1.6, decay=3.2, seed=1):
    r = np.random.default_rng(seed); t = T(d); ir = r.standard_normal(len(t)) * np.exp(-t * decay); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return fftconvolve(x, ir)[:len(x)]

def main():
    info = json.load(open(os.path.join(B, "sfx.json")))
    tl = json.load(open(os.path.join(B, "timeline.json")))
    dur = info["duration"]; n = int(dur * SR)
    sr, v = wf.read(os.path.join(B, "voice.wav")); assert sr == SR
    voice = np.zeros(n); vv = v.astype(np.float64) / 32768; voice[:min(n, len(vv))] = vv[:n]
    voice = hp(voice, 80)
    # light voice polish: gentle presence + compression
    pres = bp(voice, 2500, 6000); voice = voice + 0.18 * pres
    # gentle voice compression (3:1 above -26 dBFS RMS, 15 ms attack / 120 ms release) + make-up gain
    rms = np.sqrt(np.convolve(voice ** 2, np.ones(720) / 720, mode="same")) + 1e-9
    thr = 10 ** (-26 / 20); g = np.where(rms > thr, (rms / thr) ** (1 / 3 - 1), 1.0)
    a_att, a_rel = np.exp(-1 / (0.015 * SR)), np.exp(-1 / (0.12 * SR))
    from scipy.signal import lfilter
    g_s = lfilter([1 - a_rel], [1, -a_rel], g)          # smooth gain changes
    g = np.minimum(g, g_s * 1.05)
    voice = voice * g
    # transparent peak limiter (5 ms look-around) so the voice can sit louder without clipping
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    voice = voice / np.abs(voice).max()
    pk = uniform_filter1d(maximum_filter1d(np.abs(voice), size=480), size=480) + 1e-9
    voice = voice * np.minimum(1.0, 0.42 / pk); voice = voice / np.abs(voice).max() * 0.9
    S = {s["name"]: s["t"] for s in tl["scenes"]}
    W = [w["t"] for w in tl["words"]]
    no_i = next(i for i, w in enumerate(tl["words"]) if w["text"].startswith("లేదు"))
    brk_a, brk_b = W[no_i] - 0.12, S["storage"] - 0.02       # dramatic stop on "లేదు!"
    full = lambda: [(0, brk_a), (brk_b, dur - 1.4)]
    sections = {
        "kick": [(0.0, brk_a), (brk_b, S["ssd"] - 0.05), (S["ssd"] + 2.18, dur - 1.45)],
        "clap": [(1.9, brk_a), (brk_b, dur - 1.45)],
        "hat": [(0.0, brk_a), (brk_b, dur - 1.45)],
        "hat2": [(brk_b, S["ssd"]), (S["tips"], dur - 1.45)],
        "bass": full(), "pad": [(0, brk_a), (brk_b, dur - 1.2)],
        "arp": [(brk_b, dur - 1.45)],
        "crash": [(brk_b, 0), (S["ssd"] - 0.02, 0), (S["tips"] - 0.02, 0), (S["outro"] - 0.02, 0)],
    }
    mL, mR = music(dur, sections)
    # hard gate for the break, with tiny fades
    t = np.arange(n) / SR
    gate = np.ones(n); gate[(t > brk_a) & (t < brk_b)] = 0
    gate = np.convolve(gate, np.ones(480) / 480, mode="same")
    # final chord hit
    end_hit = np.zeros(n)
    for m in [45, 57, 60, 64, 69]:
        tt = T(1.6); place(end_hit, additive(mtof(m), tt, 8, 1.2) * np.exp(-tt * 2.2) * 0.12, dur - 1.45)
    mL = (mL * gate + end_hit); mR = (mR * gate + end_hit)
    pk = max(np.abs(mL).max(), np.abs(mR).max()); mL /= pk; mR /= pk
    # duck under voice
    env = np.sqrt(np.convolve(voice ** 2, np.ones(2400) / 2400, mode="same"))
    env = env / env.max()
    env_s = np.convolve(np.minimum(1, env * 4), np.ones(9600) / 9600, mode="same")
    duck = 0.30 - 0.215 * env_s
    mL *= duck; mR *= duck
    # fade music tail
    tail = np.clip((dur - t) / 0.35, 0, 1); mL *= tail; mR *= tail
    # sfx bus
    fx = np.zeros(n)
    for c in info["sfx"]:
        place(fx, LIB[c["name"]], c["t"], c["gain"])
    fx *= 0.30
    fxr = reverb(fx, 1.2, 4.5, 3) * 0.35
    mus_rev_L = reverb(mL, 1.8, 2.8, 5) * 0.25; mus_rev_R = reverb(mR, 1.8, 2.8, 6) * 0.25
    voice_rev = reverb(voice, 0.6, 9, 7) * 0.06
    L = voice + voice_rev + mL + mus_rev_L + fx + fxr
    R = voice + voice_rev + mR + mus_rev_R + fx + fxr * 0.9
    np.save(os.path.join(B, "stem_voice.npy"), (voice + voice_rev).astype(np.float32))
    np.save(os.path.join(B, "stem_bed.npy"), ((mL + mR) / 2 + (mus_rev_L + mus_rev_R) / 2 + fx + fxr).astype(np.float32))
    st = np.stack([L, R], 1)
    st = np.tanh(st * 1.15) / np.tanh(1.15)       # soft clip safety
    st = st / np.abs(st).max() * 0.95
    wf.write(os.path.join(B, "mix.wav"), SR, (st * 32767).astype(np.int16))
    # stems for checking
    wf.write(os.path.join(B, "music_only.wav"), SR, (np.stack([mL, mR], 1) / max(1e-9, np.abs(np.stack([mL, mR], 1)).max()) * 0.9 * 32767).astype(np.int16))
    print("mix written", dur, "s;", len(info["sfx"]), "sfx cues")

if __name__ == "__main__":
    main()
