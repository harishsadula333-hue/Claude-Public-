"""Sundarlysh Memories - generic beat-cut teaser renderer (1080x1920, 30 fps).

usage: teaser.py <spec.json> <out.mp4> [--preview t1,t2,...]
spec: {"music","music_start","bpm","fonts","logo","handle",
       "segments":[{"kind":"photo","img":path,"beats":8,"lines":[[style,text,size?],...],"zin":true,"fy":0.5},
                   {"kind":"video","src":path,"in":0,"speed":0.9,"beats":8,"lines":[...]},
                   {"kind":"card","beats":8,"logo":440,"bg":"plum"|"green","lines":[...]} ]}
styles: kick, cap, script, white, sans, big, pill
"""
import sys, os, json, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

SP = json.load(open(sys.argv[1])); OUT = sys.argv[2]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
B = 60 / SP["bpm"]; FONTS = SP["fonts"]
PLUM, PLUM_D, GOLD, GOLD_L = (69, 1, 40), (30, 0, 16), (201, 165, 94), (240, 216, 160)

def F(n, s, w=None):
    f = ImageFont.truetype(os.path.join(FONTS, n), s)
    if w is not None:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f
CINZEL = lambda s, w=800: F("Cinzel-VF.ttf", s, w)
SANS = lambda s, w=800: F("Montserrat-VF.ttf", s, w)
PLAYI = lambda s, w=700: F("Playfair-Italic-VF.ttf", s, w)
def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x): x = min(max(x, 0.0), 1.0); c = 1.6; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
FOIL = [(0, (150, 112, 46)), (.22, (246, 225, 166)), (.42, (196, 154, 76)), (.6, (255, 243, 205)), (.8, (182, 139, 62)), (1, (236, 211, 146))]
def foil(w, h):
    xs = np.linspace(0, 1, w); g = np.zeros((w, 3))
    for (p0, c0), (p1, c1) in zip(FOIL, FOIL[1:]):
        m = (xs >= p0) & (xs <= p1); k = ((xs - p0) / (p1 - p0))[:, None]; g[m] = (np.array(c0) * (1 - k) + np.array(c1) * k)[m]
    return Image.fromarray(np.repeat(g[None], h, 0).astype(np.uint8))
def text_img(s, f, col, tr=0, shadow=0.0, pad=28, gold=False):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if gold: im = Image.merge("RGBA", (*foil(w, h).split(), im.getchannel("A")))
    if shadow:
        al = im.getchannel("A").filter(ImageFilter.GaussianBlur(12)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(al.point(lambda v: int(v * shadow))); im = Image.alpha_composite(sh, im)
    return im
def fit(s, mk, size, maxw, tr=0):
    while size > 18 and tw(s, mk(size), tr) > maxw: size -= 2
    return mk(size)
def pill(txt, size=34):
    t_ = text_img(txt, SANS(size), PLUM_D, tr=6, pad=0); w, h = t_.width + 80, t_.height + 40
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=255)
    im = Image.merge("RGBA", (*foil(w, h).split(), m)); im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 3))
    out = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0)); out.alpha_composite(im, (20, 20)); return out
def style(spec, maxw=W - 200):
    k, t = spec[0], spec[1]; z = spec[2] if len(spec) > 2 else None
    if k == "kick": return text_img(t, fit(t, SANS, z or 32, maxw, 8), GOLD_L, tr=8, shadow=.6)
    if k == "cap": return text_img(t, fit(t, CINZEL, z or 78, maxw, 6), (255, 255, 255), tr=6, shadow=.6, gold=True)
    if k == "script": return text_img(t, fit(t, PLAYI, z or 72, maxw), GOLD_L, shadow=.6)
    if k == "white": return text_img(t, fit(t, lambda s: PLAYI(s, 600), z or 50, maxw), (255, 246, 238), shadow=.6)
    if k == "sans": return text_img(t, fit(t, SANS, z or 44, maxw, 2), (255, 255, 255), tr=2, shadow=.5)
    if k == "big": return text_img(t, fit(t, lambda s: CINZEL(s, 800), z or 200, maxw), (255, 255, 255), shadow=.8, gold=True, pad=36)
    if k == "pill": return pill(t, z or 32)
    if k == "bub": return text_img(t, fit(t, lambda s: PLAYI(s, 800), z or 66, W - 260), PLUM_D)
    if k == "bubk": return text_img(t, fit(t, SANS, z or 30, W - 260, 4), (168, 104, 92), tr=4)
    raise ValueError(k)
def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))
def scaled(spr, s): return spr.resize((max(1, int(spr.width * s)), max(1, int(spr.height * s))), Image.BILINEAR)
def line(w): return Image.new("RGBA", (max(w, 1), 4), GOLD + (255,))
def vgrad(a0, a1, y0, y1, col=(24, 2, 12)):
    ys = np.arange(H, dtype=np.float32)[:, None]; k = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1); k = k * k * (3 - 2 * k)
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = col; g[..., 3] = np.repeat((a0 + (a1 - a0) * k) * 255, W, 1).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD_B = vgrad(0, .8, 1080, 1920); GRAD_T = vgrad(.45, 0, 0, 300)
def radial(c0, c1):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32); r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * .42) / H) ** 2)[..., None]
    k = np.clip((r - .12) * 1.5, 0, 1); g = np.array(c0) * (1 - k) + np.array(c1) * k
    return Image.fromarray(g.astype(np.uint8)).convert("RGBA")
BG = {"plum": radial((112, 22, 66), PLUM_D), "green": radial((30, 110, 74), (6, 34, 22))}

rng = random.Random(7)
SPK = [(rng.uniform(60, W - 60), rng.uniform(150, H - 150), rng.uniform(14, 28), rng.uniform(0, 6.3), rng.uniform(2.5, 4.5)) for _ in range(14)]
def sparkles(base, t, amt=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x, y, r, ph, sp in SPK:
        a = max(0.0, math.sin(t * sp + ph)) ** 3 * amt
        if a > .03:
            pts = [(x + (r if i % 2 == 0 else r * .2) * math.cos(i * math.pi / 4), y + (r if i % 2 == 0 else r * .2) * math.sin(i * math.pi / 4)) for i in range(8)]
            d.polygon(pts, fill=GOLD_L + (int(255 * a),))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(5))); base.alpha_composite(lay)

def _mark():
    t_ = text_img("SUNDARLYSH MEMORIES", CINZEL(34), (255, 255, 255), tr=7, pad=0, gold=True); w, h = t_.width + 70, t_.height + 34
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=PLUM_D + (215,), outline=GOLD + (255,), width=3)
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 2)); return im
MARK = _mark()
LOGO_IM = Image.open(SP["logo"]).convert("RGB")
_logos = {}
def logo(size):
    if size not in _logos:
        lg = LOGO_IM.resize((size, size), Image.LANCZOS).convert("RGBA")
        y, x = np.mgrid[0:size, 0:size].astype(np.float32); r = np.sqrt((x - size / 2) ** 2 + (y - size / 2) ** 2) / (size / 2)
        lg.putalpha(Image.fromarray((np.clip((1 - r) / .14, 0, 1) * 255).astype(np.uint8))); _logos[size] = lg
    return _logos[size]

_ph = {}
def photo(p):
    if p not in _ph: _ph[p] = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    return _ph[p]
def kb(p, u, dur, zin=True, fy=.5):
    im = photo(p); iw, ih = im.size; k = ease(u / dur); z = (1.02 + .1 * k) if zin else (1.12 - .1 * k)
    bw = min(iw, ih * W / H); bh = bw * H / W; cw, ch = bw / z, bh / z
    cx, cy = iw / 2, min(max(ih * fy, ch / 2), ih - ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))
GRADE = "eq=contrast=1.06:saturation=1.12:gamma=1.02"
class Video:
    def __init__(self, s, dur):
        sp = s.get("speed", 1.0); self.n = -1; self.last = None
        vf = (f"setpts=(PTS-STARTPTS)/{sp},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},{GRADE},"
              f"unsharp=5:5:0.5:5:5:0.0,tpad=stop_mode=clone:stop_duration=3")
        self.p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-ss", str(s["in"]), "-t", str(dur * sp + 1.0), "-i", s["src"], "-an", "-vf", vf,
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    def frame(self, u):
        k = int(u * FPS + 1e-6)
        while self.n < k:
            b = self.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: break
            self.last = Image.frombytes("RGB", (W, H), b); self.n += 1
        return self.last

SEG = []; t = 0.0
for s in SP["segments"]:
    s = dict(s); s["t0"] = t; s["t1"] = t + s["beats"] * B; t = s["t1"]
    s["spr"] = [style(l) for l in s.get("lines", [])]; s["bsp"] = [style(l) for l in s.get("bubble", [])]; SEG.append(s)
DUR = t; XF = .2
_vid = {}
def base_frame(s, t):
    u = t - s["t0"]; dur = s["t1"] - s["t0"]
    if s["kind"] == "photo": return kb(s["img"], u, dur, s.get("zin", True), s.get("fy", .5)).convert("RGBA")
    if s["kind"] == "video":
        if id(s) not in _vid: _vid[id(s)] = Video(s, dur)
        return _vid[id(s)].frame(u).convert("RGBA")
    return BG[s.get("bg", "plum")].copy()

def render_seg(s, t):
    u = t - s["t0"]; fr = base_frame(s, t); out = ease((s["t1"] - t) / .15)
    if s["kind"] in ("photo", "video"):
        fr.alpha_composite(GRAD_B); fr.alpha_composite(GRAD_T)
        sp = s["spr"]
        if sp:
            total = sum(x.height for x in sp) - 34 * (len(sp) - 1); y = 1700 - total
            pw = max(x.width for x in sp) + 40; pa = ease((u - .05) / .25) * out
            pan = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(pan).rounded_rectangle(((W - pw) / 2, y - 6, (W + pw) / 2, 1760), 30,
                fill=PLUM_D + (int(205 * pa),), outline=GOLD + (int(230 * pa),), width=3)
            fr.alpha_composite(pan)
            for i, x in enumerate(sp):
                d0 = .1 + i * .22; paste(fr, x, (W - x.width) / 2, y + (1 - eout((u - d0) / .4)) * 30, ease((u - d0) / .3) * out); y += x.height - 34
            lw = int(240 * eout((u - .3) / .5)); paste(fr, line(lw), (W - lw) / 2, 1726, out)
        if s["bsp"]:
            bs = s["bsp"]; bw_ = max(x.width for x in bs) + 60; bh_ = sum(x.height for x in bs) - 30 * (len(bs) - 1) + 30
            by = s.get("bubble_y", 220); tx = s.get("tail_x", .5) * W; a = ease((u - .08) / .2) * out
            sc = .7 + .3 * back((u - .08) / .35)
            up = s.get("tail_up", False); top = 100 if up else 30
            lay = Image.new("RGBA", (bw_ + 60, bh_ + 130), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
            d.rounded_rectangle((30, top, bw_ + 30, bh_ + top), 46, fill=(255, 252, 247, 255), outline=GOLD + (255,), width=5)
            cx = min(max(tx - (W - bw_) / 2 + 30, 110), bw_ - 50)
            if up:
                d.polygon([(cx - 34, top + 4), (cx + 34, top + 4), (cx + 6, top - 70)], fill=(255, 252, 247, 255))
                d.line([(cx - 34, top), (cx + 6, top - 70), (cx + 34, top)], fill=GOLD + (255,), width=5)
            else:
                d.polygon([(cx - 34, bh_ + 26), (cx + 34, bh_ + 26), (cx - 6, bh_ + 100)], fill=(255, 252, 247, 255))
                d.line([(cx - 34, bh_ + 30), (cx - 6, bh_ + 100), (cx + 34, bh_ + 30)], fill=GOLD + (255,), width=5)
            yy = top + 15
            for x in bs: lay.alpha_composite(x, (30 + (bw_ - x.width) // 2, int(yy))); yy += x.height - 30
            sh = Image.new("RGBA", lay.size, (0, 0, 0, 0)); sh.putalpha(lay.getchannel("A").filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * .45)))
            full = Image.new("RGBA", lay.size, (0, 0, 0, 0)); full.alpha_composite(sh, (0, 0)); full.alpha_composite(lay)
            full = scaled(full, sc); paste(fr, full, (W - full.width) / 2, by + (1 - sc) * 60, a)
        paste(fr, MARK, (W - MARK.width) / 2, 60, .97)
    else:
        sparkles(fr, t)
        y = 300
        if s.get("logo"):
            L = s["logo"]; lg = scaled(logo(L), .85 + .15 * back(u / .5)); paste(fr, lg, (W - lg.width) / 2, s.get("logo_y", 470) - lg.height / 2, ease(u / .25))
            y = s.get("logo_y", 470) + L // 2 + 30
        else:
            total = sum(x.height for x in s["spr"]) - 10 * len(s["spr"]); y = (H - total) / 2
        for i, x in enumerate(s["spr"]):
            d0 = .2 + i * .18; paste(fr, x, (W - x.width) / 2, y + (1 - eout((u - d0) / .4)) * 30, ease((u - d0) / .3)); y += x.height - 10
        if s is SEG[-1] and t > DUR - .5: fr = Image.blend(fr, Image.new("RGBA", (W, H), (0, 0, 0, 255)), ease((t - (DUR - .5)) / .5))
    return fr

def render(t):
    s = next((x for x in SEG if x["t0"] <= t < x["t1"]), SEG[-1]); fr = render_seg(s, t); i = SEG.index(s); u = t - s["t0"]
    if i > 0 and u < XF:
        fr = Image.blend(render_seg(SEG[i - 1], SEG[i - 1]["t1"] - 1e-3), fr, ease(u / XF))
        if s["kind"] == "card": fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 248, 240, 255)), .3 * (1 - u / XF))
    if t < .2: fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / .2))
    return fr.convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW: _vid.clear(); render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=86)
    print(f"DUR={DUR:.2f}"); sys.exit()
n = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-ss", str(SP["music_start"]), "-t", f"{DUR:.3f}", "-i", SP["music"], "-map", "0:v", "-map", "1:a",
    "-af", f"afade=t=in:d=0.02,afade=t=out:st={max(DUR - 1.6, 0):.3f}:d=1.6,loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "9M", "-bufsize", "18M", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "192k", "-ar", "44100", "-ac", "2", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(n): ff.stdin.write(render(i / FPS).tobytes())
ff.stdin.close(); ff.wait(); print("done", OUT, f"{DUR:.2f}s")
