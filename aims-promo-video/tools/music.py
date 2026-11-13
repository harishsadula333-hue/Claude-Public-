# Original upbeat corporate track, 120 BPM, synthesized from scratch.
import numpy as np, wave, sys
SR = 44100; BPM = 120; BEAT = 60/BPM; BAR = 4*BEAT
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 50.0
N = int(SR*(DUR+0.5))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def note_hz(n): return 440*2**((n-69)/12)
def add(sig, t, pan=0.0, gain=1.0):
    i = int(t*SR); j = min(N, i+len(sig))
    if i >= N: return
    s = sig[:j-i]*gain
    L[i:j] += s*np.sqrt((1-pan)/2)*1.41; R[i:j] += s*np.sqrt((1+pan)/2)*1.41
def env(n, a, d, s, r, hold):
    tot = int((hold+r)*SR); e = np.zeros(tot); A=int(a*SR); D=int(d*SR); H=int(hold*SR)
    e[:A] = np.linspace(0,1,A,endpoint=False) if A else 0
    e[A:A+D] = np.linspace(1,s,D) if D else s
    e[A+D:H] = s; e[H:] = np.linspace(e[H-1] if H>0 else s, 0, tot-H)
    return e
def osc(freq, dur, kind='saw', detune=0.0):
    t = np.arange(int(dur*SR))/SR; out = 0
    for dt in ([0] if detune == 0 else [-detune, 0, detune]):
        f = freq*(1+dt); ph = (t*f) % 1
        if kind == 'saw': out = out + (2*ph-1)
        elif kind == 'sq': out = out + np.sign(np.sin(2*np.pi*ph))
        elif kind == 'tri': out = out + (2*np.abs(2*ph-1)-1)
        else: out = out + np.sin(2*np.pi*f*t)
    return out/(1 if detune == 0 else 3)
def lp(x, cutoff):
    a = np.exp(-2*np.pi*cutoff/SR); y = np.zeros_like(x); p = 0.0
    # vectorised one-pole via lfilter-like recursion in chunks
    from itertools import accumulate
    for i in range(len(x)): p = (1-a)*x[i] + a*p; y[i] = p
    return y
def lp_fast(x, cutoff):
    # FFT brickwall-ish lowpass with soft rolloff
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/SR)
    X *= 1/np.sqrt(1+(f/cutoff)**4); return np.fft.irfft(X, len(x))

def kick():
    d = 0.45; t = np.arange(int(d*SR))/SR
    f = 50 + 110*np.exp(-t*35); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*7.5) + 0.3*np.exp(-t*300)*rng.standard_normal(len(t))*0.3
def clap():
    d = 0.3; t = np.arange(int(d*SR))/SR; n = rng.standard_normal(len(t))
    e = np.exp(-t*22); 
    for off in (0.0, 0.011, 0.022): e += np.where(t >= off, np.exp(-(t-off)*120), 0)*0.6
    s = n*e; S = np.fft.rfft(s); fr = np.fft.rfftfreq(len(s),1/SR)
    S *= np.exp(-((fr-1500)/1200)**2); return np.fft.irfft(S, len(s))*3
def hat(open_=False):
    d = 0.25 if open_ else 0.06; t = np.arange(int(d*SR))/SR; n = rng.standard_normal(len(t))
    S = np.fft.rfft(n); fr = np.fft.rfftfreq(len(n),1/SR); S *= (fr > 7000)
    return np.fft.irfft(S, len(n))*np.exp(-t*(12 if open_ else 70))

# Progression (vi - IV - I - V in C): Am F C G  -> bright & hopeful
prog = [(57,[57,60,64]), (53,[53,57,60]), (48,[48,52,55,60]), (55,[55,59,62])]
bars = int(np.ceil(DUR/BAR))
end_t = DUR - 5.0   # final hit time
CUTS = [9.5, 19.5, 28.5, 33.5, 39.0]
for b in range(bars):
    t0 = b*BAR
    if t0 >= end_t: break
    root, chord = prog[b % 4]
    intro = b < 2
    # Pad
    pad = sum(osc(note_hz(n+12), BAR, 'saw', 0.004) for n in chord)/len(chord)
    pad = lp_fast(pad, 1400 if not intro else 500+400*b) * env(0,0.3,0.4,0.8,0.5,BAR-0.5)[:len(pad)]
    pg = 0.24 if intro else 0.10
    add(pad, t0, -0.2, pg); add(pad, t0+0.01, 0.2, pg)
    # Pluck arpeggio 16ths
    arp = chord + [chord[1]+12, chord[0]+12, chord[1]+12, chord[2]]
    for k in range(16 if not intro else 8):
        step = k if not intro else k*2
        n = arp[k % len(arp)] + 24
        s = osc(note_hz(n), 0.22, 'sq')*0.5 + osc(note_hz(n), 0.22, 'tri')
        s = lp_fast(s, 3500) * np.exp(-np.arange(len(s))/SR*16)
        add(s, t0 + step*BEAT/4, 0.35 if k % 2 else -0.35, 0.10 if intro else 0.06)
    if intro:
        continue
    # Bass: offbeat 8ths octave pump
    for k in range(8):
        n = root - 12 + (12 if k % 2 else 0)
        s = osc(note_hz(n), BEAT/2, 'saw')
        s = lp_fast(s, 600) * env(0, 0.005, 0.1, 0.6, 0.05, BEAT/2-0.05)[:len(s)]
        add(s, t0 + k*BEAT/2, 0, 0.22)
    for q in range(4):
        add(kick(), t0+q*BEAT, 0, 0.75)
        if q in (1, 3): add(clap(), t0+q*BEAT, 0.05, 0.28)
        add(hat(), t0+q*BEAT+BEAT/2, 0.3, 0.16)
        add(hat(), t0+q*BEAT+BEAT/4*3, -0.3, 0.07)
        add(hat(), t0+q*BEAT+BEAT/4, -0.2, 0.05)
    if b % 4 == 3: add(hat(True), t0+3.5*BEAT, 0, 0.12)

# Riser into the drop (bar 2) and into the finale
def riser(d):
    t = np.arange(int(d*SR))/SR; n = rng.standard_normal(len(t))
    S = np.fft.rfft(n); fr = np.fft.rfftfreq(len(n),1/SR); S *= np.exp(-((fr-4000)/3000)**2)
    return np.fft.irfft(S, len(n))*(t/d)**2
add(riser(2*BEAT*2), 2*BAR-4*BEAT, 0, 0.25)
add(riser(2.0), end_t-2.0, 0, 0.2)
# Final hit: big chord + kick + crash
fin = sum(osc(note_hz(n+12), 5.0, 'saw', 0.005) for n in [48,52,55,60,64])/5
fin = lp_fast(fin, 2000)*np.exp(-np.arange(len(fin))/SR*0.9)
add(fin, end_t, -0.1, 0.22); add(fin, end_t+0.012, 0.1, 0.22)
add(kick(), end_t, 0, 0.9); add(hat(True)*np.ones(1), end_t, 0, 0.3)
for n in [72, 76, 79, 84]:
    s = osc(note_hz(n), 3.0, 'tri')*np.exp(-np.arange(int(3.0*SR))/SR*1.8)
    add(s, end_t + 0.02*(n-72)/4, 0, 0.05)

# Whooshes on scene cuts
def whoosh(d=0.7):
    t = np.arange(int(d*SR))/SR; n = rng.standard_normal(len(t))
    S = np.fft.rfft(n); fr = np.fft.rfftfreq(len(n),1/SR); S *= np.exp(-((fr-2500)/2200)**2)
    x = np.fft.irfft(S, len(n)); e = np.sin(np.pi*t/d)**2
    return x*e
for c in CUTS: add(whoosh(), c-0.4, 0, 0.35)
add(whoosh(0.9), end_t-0.55, 0, 0.3)
# Reverb (FFT convolution with decaying noise IR)
ir_len = int(1.6*SR); t = np.arange(ir_len)/SR
irL = rng.standard_normal(ir_len)*np.exp(-t*3.2); irR = rng.standard_normal(ir_len)*np.exp(-t*3.2)
def conv(x, ir):
    n = len(x)+len(ir); F = 1<<int(np.ceil(np.log2(n)))
    return np.fft.irfft(np.fft.rfft(x,F)*np.fft.rfft(ir,F), F)[:len(x)]
wetL = conv(L, irL)*0.012; wetR = conv(R, irR)*0.012
L = L + wetL; R = R + wetR
# Master: fades, soft clip, normalise
fade_in = np.minimum(1, np.arange(N)/(0.05*SR)); L *= fade_in; R *= fade_in
tail = int(DUR*SR); fo = np.ones(N); fo[tail-int(0.6*SR):tail] = np.linspace(1,0,int(0.6*SR)); fo[tail:] = 0
L *= fo; R *= fo
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
L = np.tanh(L*1.6)/np.tanh(1.6)*0.89; R = np.tanh(R*1.6)/np.tanh(1.6)*0.89
out = (np.stack([L, R], 1)[:int(DUR*SR)]*32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('wrote', sys.argv[1], out.shape[0]/SR, 's')
