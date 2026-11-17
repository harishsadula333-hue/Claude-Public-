"""Sundarlysh Memories - real-footage home décor reel (1080x1920, 30 fps).

usage: home_reel.py <edl.json> <out.mp4> [--preview t1,t2,...]

edl.json:
{
  "music": "path.mp3", "music_start": 0.0, "bpm": 102.0, "fonts": "dir", "logo": "logo.jpg",
  "segments": [
    {"type": "video", "src": "clip.mp4", "in": 3.0, "dur": 2.4, "speed": 1.0, "cap": "Floral Entrance Arch", "kicker": "01 · Entrance"},
    {"type": "photo", "src": "photo.jpg", "dur": 2.0, "zoom": [1.0, 1.12], "focus": [0.5, 0.4], "cap": "..."},
    {"type": "hook", "src": "photo.jpg", "dur": 3.0, "focus": [0.5, 0.35]},
    {"type": "end", "dur": 4.5}
  ]
}
Captions appear on the first segment that carries "cap" and stay while following segments repeat the same cap.
"""
import sys, os, json, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

EDL = json.load(open(sys.argv[1])); OUT = sys.argv[2]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
FONTS = EDL["fonts"]
WINE, WINE_D, GOLD, GOLD_L, CREAM, BLUSH = (92, 31, 44), (42, 11, 19), (201, 165, 94), (234, 211, 157), (251, 246, 241), (241, 214, 204)

def F(n, s, w=None):
    f = ImageFont.truetype(os.path.join(FONTS, n), s)
    if w is not None:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f
CINZEL = lambda s: F("Cinzel-VF.ttf", s, 600)
PINYON = lambda s: F("PinyonScript-Regular.ttf", s)
SANS = lambda s: F("Montserrat-VF.ttf", s, 600)
ITAL = lambda s: F("CormorantGaramond-Italic-VF.ttf", s, 500)

def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3

# ---------------------------------------------------------------- timeline
SEG = []; t = 0.0
for s in EDL["segments"]:
    s = dict(s); s["t0"] = t; s["t1"] = t + s["dur"]; t = s["t1"]; SEG.append(s)
DUR = t
XF = 0.28   # crossfade length between segments

# ---------------------------------------------------------------- footage
def cover(im, w=W, h=H, focus=(0.5, 0.5), zoom=1.0):
    iw, ih = im.size; bw = min(iw, ih * w / h); bh = bw * h / w; cw, ch = bw / zoom, bh / zoom
    cx = min(max(focus[0] * iw, cw / 2), iw - cw / 2); cy = min(max(focus[1] * ih, ch / 2), ih - ch / 2)
    return im.resize((w, h), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))

GRADE = "eq=contrast=1.06:saturation=1.12:gamma=1.02,colorbalance=rs=.03:gs=.01:bs=-.03"
class Video:
    def __init__(self, s):
        sp = s.get("speed", 1.0); self.n = -1; self.last = None
        vf = (f"setpts=(PTS-STARTPTS)/{sp},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
              f"crop={W}:{H},{GRADE},unsharp=5:5:0.5:5:5:0.0,tpad=stop_mode=clone:stop_duration=2")
        self.p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-ss", str(s["in"]), "-t", str(s["dur"] * sp + 1.0), "-i", s["src"],
                                   "-an", "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    def frame(self, u):
        k = int(u * FPS + 1e-6)
        while self.n < k:
            b = self.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: break
            self.last = Image.frombytes("RGB", (W, H), b); self.n += 1
        return self.last
    def close(self): self.p.kill()

_photo = {}
def photo(src):
    if src not in _photo:
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        im.thumbnail((2200, 2200), Image.LANCZOS)
        from PIL import ImageEnhance
        im = ImageEnhance.Color(im).enhance(1.1); im = ImageEnhance.Contrast(im).enhance(1.05)
        _photo[src] = im
    return _photo[src]

_open = {}
def seg_frame(s, t):
    u = t - s["t0"]
    if s["type"] == "video":
        key = id(s)
        if key not in _open:
            for k in [k for k, v in _open.items() if v[1] < s["t0"] - 3]: _open.pop(k)[0].close()
            _open[key] = (Video(s), s["t0"])
        return _open[key][0].frame(u)
    if s["type"] in ("photo", "hook"):
        z0, z1 = s.get("zoom", [1.0, 1.10]); z = z0 + (z1 - z0) * ease(u / s["dur"])
        return cover(photo(s["src"]), focus=tuple(s.get("focus", [0.5, 0.5])), zoom=z)
    return None

# ---------------------------------------------------------------- graphics
_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
def text_img(s, f, col, tr=0, shadow=0.0, pad=26, grad=None):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if grad:   # gold-foil gradient fill
        g = np.zeros((h, w, 3), np.float32); xs = np.linspace(0, 1, w)[None, :, None]
        stops = [(0, (148, 112, 47)), (.22, (242, 221, 161)), (.4, (192, 151, 74)), (.58, (252, 240, 200)), (.78, (179, 137, 60)), (1, (233, 208, 143))]
        for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
            m = (xs >= p0) & (xs <= p1); k = (xs - p0) / (p1 - p0)
            g = np.where(m, np.array(c0) * (1 - k) + np.array(c1) * k, g)
        rgb = Image.fromarray(np.repeat(g, h, 0).astype(np.uint8)[:h]) if g.shape[0] == 1 else Image.fromarray(g.astype(np.uint8))
        im = Image.merge("RGBA", (*rgb.split(), im.getchannel("A")))
    if shadow:
        al = im.getchannel("A").filter(ImageFilter.GaussianBlur(12)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(al.point(lambda v: int(v * shadow))); im = Image.alpha_composite(sh, im)
    return im
def fit(s, mk, size, maxw, tr=0):
    while size > 20 and tw(s, mk(size), tr) > maxw: size -= 2
    return mk(size)
def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))
def vgrad(a0, a1, y0, y1, col=(20, 6, 10)):
    ys = np.arange(H, dtype=np.float32)[:, None]; k = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1); k = k * k * (3 - 2 * k)
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = col; g[..., 3] = np.repeat((a0 + (a1 - a0) * k) * 255, W, 1).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD_B = vgrad(0, .78, 1150, 1920); GRAD_T = vgrad(.45, 0, 0, 330)
MARK = text_img("Sundarlysh Memories", PINYON(70), (255, 245, 235), shadow=.7)
def gold_line(w):
    im = Image.new("RGBA", (w, 4), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.rectangle((0, 0, w, 3), fill=GOLD + (255,)); return im

_caps = {}
def cap_sprites(s):
    k = (s.get("kicker", ""), s["cap"])
    if k not in _caps:
        _caps[k] = (text_img(k[0].upper(), SANS(30), GOLD_L, tr=8, shadow=.7) if k[0] else None,
                    text_img(k[1], fit(k[1], CINZEL, 74, W - 210, 6), (255, 255, 255), tr=6, shadow=.75, grad=True))
    return _caps[k]

LOGO = Image.open(EDL["logo"]).convert("RGB")
def badge(size):
    lg = LOGO.resize((int(size * 1.12), int(size * 1.12)), Image.LANCZOS); off = (lg.width - size) // 2
    lg = lg.crop((off, off, off + size, off + size)).convert("RGBA")
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255); lg.putalpha(m)
    out = Image.new("RGBA", (size + 60, size + 60), (0, 0, 0, 0)); d = ImageDraw.Draw(out)
    d.ellipse((4, 4, size + 56, size + 56), outline=GOLD + (255,), width=4); d.ellipse((18, 18, size + 42, size + 42), fill=GOLD + (255,))
    out.alpha_composite(lg, (30, 30)); return out
def logo_block(size):
    lg = LOGO.resize((size, size), Image.LANCZOS).convert("RGBA")
    y, x = np.mgrid[0:size, 0:size].astype(np.float32); r = np.sqrt((x - size / 2) ** 2 + (y - size / 2) ** 2) / (size / 2)
    lg.putalpha(Image.fromarray((np.clip((1.0 - r) / 0.12, 0, 1) * 255).astype(np.uint8))); return lg
BADGE = logo_block(660)

def wine_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32); r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - 500) / H) ** 2)[..., None]
    k = np.clip((r - .28) * 1.6, 0, 1); g = np.array((69, 1, 40)) * (1 - k) + np.array((34, 0, 18)) * k
    return Image.fromarray(g.astype(np.uint8)).convert("RGBA")
WINEBG = wine_bg()

HOOK = [text_img("Shaadi wala ghar?", PINYON(150), GOLD_L, shadow=.9),
        text_img("LET'S MAKE IT", CINZEL(70), (255, 255, 255), tr=8, shadow=.8),
        text_img("LOOK LIKE ONE", CINZEL(96), (255, 255, 255), tr=8, shadow=.8, grad=True)]
END = dict(
    s1=text_img("Your home, dressed for", ITAL(64), (243, 222, 214)),
    s2=text_img("the celebration", PINYON(130), GOLD_L),
    s4=text_img("HALDI · MEHENDI · WEDDING FUNCTIONS", SANS(34), (255, 255, 255), tr=5),
    s5=text_img("DM TO BOOK", CINZEL(70), (255, 255, 255), tr=10, grad=True),
    s6=text_img("@sundarlyshevents", SANS(50), (255, 255, 255), tr=1),
    s7=text_img("BENGALURU  ·  HYDERABAD", SANS(30), (233, 207, 198), tr=8),
)

# ---------------------------------------------------------------- render
def overlay(fr, s, t):
    u = t - s["t0"]
    if s["type"] == "hook" or s.get("hook"):
        fr.alpha_composite(vgrad(.1, .7, 700, 1700))
        y = 1090
        for i, sp in enumerate(HOOK):
            d0 = 0.25 + i * 0.45; a = ease((u - d0) / .35)
            paste(fr, sp, (W - sp.width) / 2, y + (1 - eout((u - d0) / .45)) * 40, a); y += sp.height - (40 if i == 0 else 22)
    elif s["type"] in ("video", "photo") and s.get("cap"):
        # caption block persists across consecutive segments with the same cap
        first = s
        for p in reversed(SEG[:SEG.index(s)]):
            if p.get("cap") == s["cap"]: first = p
            else: break
        last = s
        for n in SEG[SEG.index(s) + 1:]:
            if n.get("cap") == s["cap"]: last = n
            else: break
        cu = t - first["t0"]; out = ease((last["t1"] - t) / .25)
        k_spr, c_spr = cap_sprites(s)
        lw = int(260 * eout((cu - .15) / .5))
        if lw > 2: paste(fr, gold_line(lw), (W - lw) / 2, 1688, out)
        if k_spr: paste(fr, k_spr, (W - k_spr.width) / 2, 1500 + (1 - eout((cu - .1) / .4)) * 20, ease((cu - .1) / .3) * out)
        paste(fr, c_spr, (W - c_spr.width) / 2, 1545 + (1 - eout((cu - .2) / .45)) * 30, ease((cu - .2) / .35) * out)
    if s["type"] != "end":
        paste(fr, MARK, (W - MARK.width) / 2, 46, .92)

def end_card(t, s):
    u = t - s["t0"]; fr = WINEBG.copy()
    sc = .7 + .3 * eout(u / .6); b = BADGE.resize((int(BADGE.width * sc), int(BADGE.height * sc)), Image.BILINEAR)
    paste(fr, b, (W - b.width) / 2, 500 - b.height / 2, ease(u / .3))
    y = 860
    for key, gap, d0 in (("s1", -10, .4), ("s2", 34, .55), ("s4", 56, .9), ("s5", 10, 1.3), ("s6", 10, 1.5), ("s7", 0, 1.65)):
        sp = END[key]; paste(fr, sp, (W - sp.width) / 2, y + (1 - eout((u - d0) / .4)) * 30, ease((u - d0) / .3)); y += sp.height + gap
    pass
    if t > DUR - .5: fr = Image.blend(fr, Image.new("RGBA", (W, H), (0, 0, 0, 255)), ease((t - (DUR - .5)) / .5))
    return fr

def render(t):
    s = next((x for x in SEG if x["t0"] <= t < x["t1"]), SEG[-1])
    if s["type"] == "end":
        fr = end_card(t, s); u = t - s["t0"]
        if u < XF:
            prev = SEG[SEG.index(s) - 1]; pf = seg_frame(prev, min(t, prev["t1"] - 1e-3)).convert("RGBA")
            pf.alpha_composite(GRAD_B); overlay(pf, prev, min(t, prev["t1"] - 1e-3)); fr = Image.blend(pf, fr, ease(u / XF))
        return fr.convert("RGB")
    fr = seg_frame(s, t).convert("RGBA")
    i = SEG.index(s)
    if i > 0 and t - s["t0"] < XF and SEG[i - 1]["type"] != "end":
        prev = SEG[i - 1]; pf = seg_frame(prev, prev["t1"] - 1e-3 + (t - s["t0"]) * 0).convert("RGBA")
        fr = Image.blend(pf, fr, ease((t - s["t0"]) / XF))
    fr.alpha_composite(GRAD_B); fr.alpha_composite(GRAD_T)
    overlay(fr, s, t)
    if t < .3: fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / .3))
    return fr.convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW:
        _open.clear(); render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=88)
    print(f"DUR={DUR:.2f}", [(round(s['t0'], 2), s['type'], s.get('cap', '')) for s in SEG]); sys.exit()

n = int(round(DUR * FPS)); M = EDL["music"]
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-ss", str(EDL.get("music_start", 0)), "-t", f"{DUR:.3f}", "-i", M, "-map", "0:v", "-map", "1:a",
    "-af", f"afade=t=in:d={EDL.get('fade_in', 0.03)},afade=t=out:st={DUR - 2.0:.3f}:d=2.0,loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "9M", "-bufsize", "18M", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(n):
    ff.stdin.write(render(i / FPS).tobytes())
    if i % 300 == 0: print(f"{i}/{n}", file=sys.stderr, flush=True)
ff.stdin.close(); ff.wait(); print("done", OUT, f"{DUR:.2f}s")
