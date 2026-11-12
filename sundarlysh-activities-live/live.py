"""Sundarlysh Events - "activities in action" reel (1080x1920, 30fps, ~50.7s), cut to Happy Alley (111.5 bpm).

usage: live.py <clips_dir> <stills_dir> <logo.jpg> <fonts_dir> <music.mp3> <out.mp4> [--preview t1,t2,..]
Each scene uses clips_dir/<name>.mp4 (animated) if present, otherwise stills_dir/<name>.* with a slow push-in.
"""
import sys, os, subprocess, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

CLIPS, STILLS, LOGO, FONTS, MUSIC, OUT = sys.argv[1:7]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
B = 60 / 111.5
M0 = 1.40                       # music offset: first chime hit lands at ~0.10 s
def beat(n): return 0.10 + n * B
INK, WHITE, PINK, ROSE, CREAM, GOLD = (34, 26, 24), (255, 255, 255), (246, 196, 206), (196, 98, 112), (249, 245, 242), (226, 188, 108)

def F(n, s, w=None):
    f = ImageFont.truetype(os.path.join(FONTS, n), s)
    if w is not None:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f
BOLD = lambda s: F("Montserrat-VF.ttf", s, 800)
SEMI = lambda s: F("Montserrat-VF.ttf", s, 600)
SCRIPT = lambda s: F("GreatVibes-Regular.ttf", s)
def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x): x = min(max(x, 0.0), 1.0); c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ------------------------------------------------------------------ timeline
ACTS = [
    ("m1_mehendi", "m2_glitter", "MEHENDI & GLITTER BAR", "kundan mehendi + glitter glam"),
    ("u2_ubtan", "u1_ubtan", "THE UBTAN BAR", "a haldi-ready glow, DIY style"),
    ("d1_decoden", "d2_decoden", "DECODEN FROSTING BAR", "whipped-cream art for your phone case"),
    ("b1_bedazzle", "b2_bedazzle", "BEDAZZLE WORKSHOP", "add sparkle to anything"),
    ("s1_candle", "s2_candle", "SAND CANDLE MAKING", "pour it, layer it, take it home"),
    ("k1_cake", "k2_cake", "CAKE & PAINT", "paint it... then eat it"),
    ("t2_art", "t1_art", "3D ART WORKSHOP", "perfect for cafés"),
    ("x2_pipe", "x1_canvas", "CHRISTMAS SPECIALS", "pipe-cleaner trees & glowing mini canvases"),
]
SEG = []   # (t0, t1, clip, kind, payload)
SEG.append((0.0, beat(8), "a_hook", "hook", None))
SEG.append((beat(8), beat(12), "a_setup", "setup", None))
n = 12
for i, (c1, c2, title, sub) in enumerate(ACTS):
    SEG.append((beat(n), beat(n + 4), c1, "act", (i, 0, title, sub, beat(n), beat(n + 8))))
    SEG.append((beat(n + 4), beat(n + 8), c2, "act", (i, 1, title, sub, beat(n), beat(n + 8))))
    n += 8
SEG.append((beat(n), beat(n + 8), "g_group", "group", None)); n += 8
T_CTA = (beat(n), beat(n + 10)); DUR = T_CTA[1]

# ------------------------------------------------------------------ footage
class Clip:
    """Streams a clip (retimed to fill dur, cover-cropped to 1080x1920) frame by frame."""
    def __init__(self, name, dur):
        self.name, self.dur, self.i, self.proc, self.still = name, dur, -1, None, None
        mp4 = os.path.join(CLIPS, name + ".mp4")
        if os.path.exists(mp4):
            src = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4],
                                       capture_output=True, text=True).stdout or 2.0)
            speed = min(1.0, src / dur)          # slow down (never speed up) so the clip covers the scene
            vf = (f"setpts={1/speed:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1,"
                  f"scale=-2:{H}:flags=lanczos,crop={W}:{H},unsharp=5:5:0.6:5:5:0.0,tpad=stop_mode=clone:stop_duration=3")
            self.proc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", mp4, "-vf", vf, "-f", "rawvideo",
                                          "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            self.last = None
        else:
            p = next(os.path.join(STILLS, f) for f in os.listdir(STILLS) if os.path.splitext(f)[0] == name)
            self.still = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    def frame(self, u):
        if self.still is not None:
            im = self.still; iw, ih = im.size; z = 1.02 + 0.06 * ease(u / max(self.dur, 1e-3))
            bw = min(iw, ih * W / H); bh = bw * H / W; cw, ch = bw / z, bh / z
            return im.resize((W, H), Image.BILINEAR, box=(iw / 2 - cw / 2, ih / 2 - ch / 2, iw / 2 + cw / 2, ih / 2 + ch / 2))
        target = int(u * FPS)
        while self.i < target:
            buf = self.proc.stdout.read(W * H * 3)
            if len(buf) < W * H * 3: break
            self.last = Image.frombytes("RGB", (W, H), buf); self.i += 1
        return self.last
    def close(self):
        if self.proc: self.proc.kill()

_open = {}
def footage(name, t0, t1, t):
    key = (name, t0)
    if key not in _open:
        for k in [k for k in _open if k[1] < t0 - 5.0]: _open.pop(k).close()
        _open[key] = Clip(name, t1 - t0 + 0.6)
    return _open[key].frame(max(0.0, t - t0))

# ------------------------------------------------------------------ graphics
_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
def text_img(s, f, col, tr=0, shadow=0.0, pad=24):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if shadow:
        al = im.getchannel("A").filter(ImageFilter.GaussianBlur(10)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(al.point(lambda v: int(v * shadow))); im = Image.alpha_composite(sh, im)
    return im
def sticker(s, font, fg=INK, bg=WHITE, padx=34, pady=18, angle=0.0, radius=None):
    t_ = text_img(s, font, fg, pad=0); w, h = t_.width + 2 * padx, t_.height + 2 * pady
    im = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((20, 26, w + 20, h + 26), radius or h // 3, fill=(0, 0, 0, 90))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    ImageDraw.Draw(im).rounded_rectangle((20, 20, w + 20, h + 20), radius or h // 3, fill=bg + (255,))
    im.alpha_composite(t_, (20 + padx, 20 + pady - 4))
    return im.rotate(angle, resample=Image.BICUBIC, expand=True) if angle else im
def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))
def pop(base, spr, cx, cy, u, a=1.0, dur=0.3):
    s = 0.4 + 0.6 * back(u / dur)
    if s <= 0.02: return
    im = spr.resize((max(1, int(spr.width * s)), max(1, int(spr.height * s))), Image.BILINEAR)
    paste(base, im, cx - im.width / 2, cy - im.height / 2, a * ease(u / 0.12))
def vgrad(a0, a1, y0, y1):
    ys = np.arange(H, dtype=np.float32)[:, None]; k = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1); k = k * k * (3 - 2 * k)
    g = np.zeros((H, W, 4), np.uint8); g[..., 3] = np.repeat((a0 + (a1 - a0) * k) * 255, W, 1).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD = vgrad(0, 0.55, 1100, 1920); GRAD_TOP = vgrad(0.35, 0, 0, 300)
rng = np.random.default_rng(5)
from PIL import ImageChops
GRAIN = [Image.fromarray(np.clip(rng.normal(128, 5, (H // 2, W // 2)), 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR).convert("RGB") for _ in range(6)]
def grain(fr, i):
    return ImageChops.add(fr, GRAIN[i % len(GRAIN)], 1.0, -128)

# sprites
HOOK1 = sticker("Kitty party...", BOLD(70), angle=3)
HOOK2a = text_img("but make it", SCRIPT(160), WHITE, shadow=1.0)
HOOK2b = sticker("CREATIVE", BOLD(128), fg=WHITE, bg=ROSE, angle=-3, padx=44, pady=22)
SET1 = sticker("we bring the kits,", BOLD(58), angle=-2)
SET2 = sticker("the décor & the fun", BOLD(58), fg=WHITE, bg=ROSE, angle=2)
ACT_SPR = []
for c1, c2, title, sub in ACTS:
    size = 74
    while tw(title, BOLD(size)) > W - 220: size -= 2
    ACT_SPR.append((sticker(title, BOLD(size), angle=-2.5), sticker(sub, SEMI(40), fg=INK, bg=PINK, angle=1.5, padx=28, pady=14)))
GRP1 = sticker("everyone goes home with", BOLD(54), angle=-2)
GRP2 = sticker("something they made", BOLD(64), fg=WHITE, bg=ROSE, angle=2)
MARK = text_img("Sundarlysh Events", SCRIPT(64), WHITE, shadow=0.7)

LOGO_IM = Image.open(LOGO).convert("RGB")
def logo(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS)
    m = np.ones(size, np.float32); r = size // 9; ramp = np.linspace(0, 1, r); m[:r] = ramp; m[-r:] = ramp[::-1]
    return lg, Image.fromarray((np.minimum.outer(m, m) * 255).astype(np.uint8))
LOGO_CTA = logo(600)
def pill(s, bg, fg=WHITE, size=28):
    t_ = text_img(s, SEMI(size), fg, 4, pad=0); w, h = t_.width + 56, t_.height + 30
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=bg + (255,))
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 3)); return im
CTA1 = text_img("your next get-together,", SCRIPT(104), ROSE)
CTA2 = text_img("SORTED.", BOLD(110), INK, 6)
CHIPS = [pill("KITTY PARTIES", ROSE), pill("CAFÉS", (70, 150, 140)), pill("CELEBRATIONS", (200, 140, 60)), pill("CHRISTMAS", (180, 40, 52))]
def btn(s):
    t_ = text_img(s, BOLD(42), WHITE, 5, pad=0); w, h = t_.width + 120, t_.height + 70
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=ROSE + (255,))
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 5)); return im
BTN = btn("DM US TO BOOK")
HANDLE = text_img("@sundarlyshevents", SEMI(46), INK, 1)
CITY = text_img("BENGALURU  ·  HYDERABAD", SEMI(30), (120, 100, 95), 6)

# ------------------------------------------------------------------ scenes
def seg_at(t): return next((s for s in SEG if s[0] <= t < s[1]), None)

def scene(t):
    s = seg_at(t)
    t0, t1, name, kind, pay = s
    fr = footage(name, t0, t1, t).convert("RGBA")
    # quick crossfade from previous segment on activity boundaries (cuts inside an activity are hard cuts)
    if kind in ("setup", "group") or (kind == "act" and pay[1] == 0):
        if t - t0 < 0.12:
            prev = seg_at(t0 - 1e-3)
            if prev:
                pf = footage(prev[2], prev[0], prev[1], t).convert("RGBA")
                fr = Image.blend(pf, fr, ease((t - t0) / 0.12))
    fr.alpha_composite(GRAD); fr.alpha_composite(GRAD_TOP)
    u = t - t0
    if kind == "hook":
        if t < beat(6):
            pop(fr, HOOK1, W / 2, 1380, t - 0.15)
        else:
            uu = t - beat(6)
            paste(fr, HOOK2a, (W - HOOK2a.width) / 2, 1150 + (1 - eout(uu / 0.3)) * 30, ease(uu / 0.2))
            pop(fr, HOOK2b, W / 2, 1480, uu - 0.12)
    elif kind == "setup":
        pop(fr, SET1, W / 2 - 40, 1330, u - 0.05); pop(fr, SET2, W / 2 + 40, 1460, u - 0.05 - B)
    elif kind == "act":
        i, part, title, sub, at0, at1 = pay
        tsp, ssp = ACT_SPR[i]; au = t - at0
        out = ease((at1 - t) / 0.1)
        pop(fr, tsp, W / 2, 1420, au - 0.05, out); pop(fr, ssp, W / 2 + 30, 1545, au - 0.05 - B, out)
        if au < 0.16:          # flash on each new activity
            fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 255, 255, 255)), 0.5 * (1 - au / 0.16))
    elif kind == "group":
        pop(fr, GRP1, W / 2 - 30, 1380, u - 0.05); pop(fr, GRP2, W / 2 + 30, 1510, u - 0.05 - B)
    paste(fr, MARK, (W - MARK.width) / 2, 50, 0.9)
    if t < 0.25: fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / 0.25))
    return fr

def cta(t):
    u = t - T_CTA[0]; fr = Image.new("RGBA", (W, H), CREAM + (255,))
    lg, m = LOGO_CTA; s = 0.85 + 0.15 * back(u / 0.5); sz = int(600 * s)
    fr.paste(lg.resize((sz, sz), Image.BILINEAR), ((W - sz) // 2, 440 - sz // 2), m.resize((sz, sz), Image.BILINEAR))
    paste(fr, CTA1, (W - CTA1.width) / 2, 760 + (1 - eout((u - 0.25) / 0.4)) * 30, ease((u - 0.25) / 0.3))
    pop(fr, CTA2, W / 2, 990, u - 0.45)
    rows = [CHIPS[:2], CHIPS[2:]]; y = 1110
    for r_, row in enumerate(rows):
        total = sum(c.width for c in row) + 20; x = (W - total) / 2
        for k, c in enumerate(row):
            pop(fr, c, x + c.width / 2, y + c.height / 2, u - 0.75 - 0.08 * (2 * r_ + k)); x += c.width + 20
        y += row[0].height + 18
    pulse = 1 + 0.04 * max(0.0, math.sin((u - 1.2) / B * math.pi)) if u > 1.2 else 1
    b = BTN.resize((int(BTN.width * pulse), int(BTN.height * pulse)), Image.BILINEAR)
    paste(fr, b, (W - b.width) / 2, 1360 - (b.height - BTN.height) / 2 + (1 - eout((u - 1.1) / 0.4)) * 50, ease((u - 1.1) / 0.3))
    paste(fr, HANDLE, (W - HANDLE.width) / 2, 1540, ease((u - 1.3) / 0.3))
    paste(fr, CITY, (W - CITY.width) / 2, 1630, ease((u - 1.45) / 0.3))
    k = ease(u / 0.3)
    if k < 1: fr = Image.blend(scene(T_CTA[0] - 1e-3), fr, k)
    return fr

def render(t, i=0):
    fr = (cta(t) if t >= T_CTA[0] else scene(t)).convert("RGB")
    return grain(fr, i) if t < T_CTA[0] else fr

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW:
        _open.clear(); render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=88)
    print(f"DUR={DUR:.2f} cta={T_CTA[0]:.2f}", [(round(s[0], 2), s[2]) for s in SEG]); sys.exit()

nfr = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-ss", str(M0), "-t", f"{DUR:.3f}", "-i", MUSIC, "-map", "0:v", "-map", "1:a",
    "-af", f"afade=t=out:st={DUR - 1.6:.3f}:d=1.6,loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(nfr):
    ff.stdin.write(render(i / FPS, i).tobytes())
    if i % 200 == 0: print(f"{i}/{nfr}", file=sys.stderr, flush=True)
ff.stdin.close(); ff.wait(); print("done", OUT, f"{DUR:.2f}s")
