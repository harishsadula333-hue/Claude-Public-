"""Sundarlysh Memories - Christmas Advent Calendar Workshop reel (1080x1920, 30 fps, ~60 s).

usage: advent.py <img_dir> <logo.jpg> <fonts_dir> <music.mp3> <out.mp4> [--preview t1,t2,...]
Cut on the beat of "We Wish You a Merry Christmas" (115 bpm section starting at 46.277 s).
Edit VENUE / DATE lines below.
"""
import sys, os, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

IMG, LOGO, FONTS, MUSIC, OUT = sys.argv[1:6]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
B = 60 / 115.02; M_START = 46.277
PLUM, PLUM_D, GOLD, GOLD_L, CREAM = (69, 1, 40), (30, 0, 16), (201, 165, 94), (240, 216, 160), (251, 244, 238)
DATE_L1, DATE_L2, TIME_L = "SUNDAY", "29 NOVEMBER", "5 PM – 7 PM"
VENUE_L1, VENUE_L2 = "Bakery Café", "Financial District, Hyderabad"
HANDLE = "@sundarlyshmemories"

def F(n, s, w=None):
    f = ImageFont.truetype(os.path.join(FONTS, n), s)
    if w is not None:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f
CINZEL = lambda s, w=600: F("Cinzel-VF.ttf", s, w)
PINYON = lambda s: F("PinyonScript-Regular.ttf", s)
SANS = lambda s, w=600: F("Montserrat-VF.ttf", s, w)
ITAL = lambda s: F("CormorantGaramond-Italic-VF.ttf", s, 500)
def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x): x = min(max(x, 0.0), 1.0); c = 1.6; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------------------------------------------------------------- text
_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
FOIL = [(0, (150, 112, 46)), (.22, (246, 225, 166)), (.42, (196, 154, 76)), (.6, (255, 243, 205)), (.8, (182, 139, 62)), (1, (236, 211, 146))]
def foil(w, h):
    xs = np.linspace(0, 1, w); g = np.zeros((w, 3))
    for (p0, c0), (p1, c1) in zip(FOIL, FOIL[1:]):
        m = (xs >= p0) & (xs <= p1); k = ((xs - p0) / (p1 - p0))[:, None]
        g[m] = (np.array(c0) * (1 - k) + np.array(c1) * k)[m]
    return Image.fromarray(np.repeat(g[None], h, 0).astype(np.uint8))
def text_img(s, f, col, tr=0, shadow=0.0, pad=28, gold=False):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if gold: im = Image.merge("RGBA", (*foil(w, h).split(), im.getchannel("A")))
    if shadow:
        al = im.getchannel("A").filter(ImageFilter.GaussianBlur(13)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(al.point(lambda v: int(v * shadow))); im = Image.alpha_composite(sh, im)
    return im
def fit(s, mk, size, maxw, tr=0):
    while size > 18 and tw(s, mk(size), tr) > maxw: size -= 2
    return mk(size)
def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))
def scaled(spr, s): return spr.resize((max(1, int(spr.width * s)), max(1, int(spr.height * s))), Image.BILINEAR)
def line(w, col=GOLD, h=4): im = Image.new("RGBA", (max(w, 1), h), col + (255,)); return im

# line styles for photo captions
def S_script(t, size=118): return text_img(t, fit(t, PINYON, size, W - 120), GOLD_L, shadow=.95)
def S_cap(t, size=78): return text_img(t, fit(t, CINZEL, size, W - 150, 6), (255, 255, 255), tr=6, shadow=.85, gold=True)
def S_white(t, size=64): return text_img(t, fit(t, ITAL, size, W - 140), (255, 246, 238), shadow=.9)
def S_kick(t, size=32): return text_img(t, fit(t, SANS, size, W - 160, 8), GOLD_L, tr=8, shadow=.85)

# ---------------------------------------------------------------- images
_c = {}
def photo(stem):
    if stem not in _c:
        p = next(os.path.join(IMG, f) for f in os.listdir(IMG) if os.path.splitext(f)[0] == stem)
        _c[stem] = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    return _c[stem]
def kb(stem, u, dur, zin=True, fy=.5):
    im = photo(stem); iw, ih = im.size; k = ease(u / dur)
    z = (1.02 + .10 * k) if zin else (1.12 - .10 * k)
    bw = min(iw, ih * W / H); bh = bw * H / W; cw, ch = bw / z, bh / z
    cx, cy = iw / 2, min(max(ih * fy, ch / 2), ih - ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))

def vgrad(a0, a1, y0, y1, col=(24, 2, 12)):
    ys = np.arange(H, dtype=np.float32)[:, None]; k = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1); k = k * k * (3 - 2 * k)
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = col; g[..., 3] = np.repeat((a0 + (a1 - a0) * k) * 255, W, 1).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD_B = vgrad(0, .82, 1080, 1920); GRAD_T = vgrad(.45, 0, 0, 300); GRAD_MID = vgrad(.15, .72, 500, 1500)

def plum_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32); r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * .4) / H) ** 2)[..., None]
    k = np.clip((r - .15) * 1.5, 0, 1); g = np.array((112, 22, 66)) * (1 - k) + np.array(PLUM_D) * k
    return Image.fromarray(g.astype(np.uint8)).convert("RGBA")
PLUMBG = plum_bg()

# snow + sparkles
rng = random.Random(29)
FAR = [(rng.random() * W, rng.random() * H, rng.uniform(2.5, 5), rng.uniform(50, 110), rng.uniform(0, 6.3)) for _ in range(110)]
NEAR = [(rng.random() * W, rng.random() * H, rng.uniform(8, 13), rng.uniform(140, 220), rng.uniform(0, 6.3)) for _ in range(22)]
def snow(base, t, amt=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x0, y0, r, sp, ph in FAR:
        y = (y0 + t * sp) % (H + 30) - 15; x = x0 + 22 * math.sin(t * .8 + ph)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(170 * amt)))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(.8)))
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x0, y0, r, sp, ph in NEAR:
        y = (y0 + t * sp) % (H + 60) - 30; x = x0 + 40 * math.sin(t * .6 + ph)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(110 * amt)))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(4)))
def star(d, x, y, r, a, col=GOLD_L):
    pts = [(x + (r if i % 2 == 0 else r * .2) * math.cos(i * math.pi / 4), y + (r if i % 2 == 0 else r * .2) * math.sin(i * math.pi / 4)) for i in range(8)]
    d.polygon(pts, fill=col + (int(255 * max(0, min(1, a))),))
SPK = [(rng.uniform(60, W - 60), rng.uniform(150, H - 150), rng.uniform(14, 30), rng.uniform(0, 6.3), rng.uniform(2.5, 4.5)) for _ in range(16)]
def sparkles(base, t, amt=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x, y, r, ph, sp in SPK:
        a = max(0.0, math.sin(t * sp + ph)) ** 3 * amt
        if a > .03: star(d, x, y, r * (.6 + .4 * a), a)
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(5))); base.alpha_composite(lay)

# logo
LOGO_IM = Image.open(LOGO).convert("RGB")
def logo_block(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS).convert("RGBA")
    y, x = np.mgrid[0:size, 0:size].astype(np.float32); r = np.sqrt((x - size / 2) ** 2 + (y - size / 2) ** 2) / (size / 2)
    lg.putalpha(Image.fromarray((np.clip((1.0 - r) / .14, 0, 1) * 255).astype(np.uint8))); return lg
LOGO_L, LOGO_M = logo_block(680), logo_block(440)
MARK = text_img("Sundarlysh Memories", PINYON(66), (255, 244, 236), shadow=.75)

# ---------------------------------------------------------------- timeline (beats)
SEG = []
def add(beats, kind, **kw):
    t0 = SEG[-1]["t1"] if SEG else 0.0
    SEG.append(dict(kind=kind, t0=t0, t1=t0 + beats * B, **kw))
add(8, "hook", img="a_bags")
add(8, "photo", img="a_open", lines=[S_white("What if you made"), S_script("every one yourself?", 120)], zin=False)
add(8, "title")
add(8, "photo", img="a_props", lines=[S_cap("24 KINDS", 92), S_white("of props & little gifts")])
add(8, "photo", img="a_fill", lines=[S_kick("STEP 1"), S_script("Pick what goes inside", 112)], zin=False)
add(8, "photo", img="a_decor", lines=[S_kick("STEP 2"), S_script("Decorate your gift bags", 108)])
add(8, "photo", img="a_box", lines=[S_kick("STEP 3"), S_script("…or a goodies box", 116)], zin=False)
add(8, "photo", img="a_friends", lines=[S_white("No pre-packed gifts."), S_cap("JUST YOURS", 86)])
add(8, "photo", img="a_family", lines=[S_kick("PERFECT FOR"), S_cap("FRIENDS · FAMILIES · KIDS", 70)], zin=False)
add(8, "photo", img="a_board", lines=[S_script("One surprise a day", 118), S_white("all the way to Christmas")])
add(6, "photo", img="a_cafe", lines=[S_kick("HYDERABAD'S"), S_cap("FIRST", 110), S_white("advent calendar workshop")], zin=False)
add(12, "details")
add(8, "photo", img="a_group", lines=[S_kick("LIMITED SEATS"), S_cap("BOOK ON INSTAGRAM", 74)])
add(10, "end")
DUR = SEG[-1]["t1"]
XF = .22

# ---------------------------------------------------------------- scene renderers
HOOK_N = text_img("24", CINZEL(430, 700), (255, 255, 255), shadow=.9, gold=True, pad=40)
HOOK_A = S_kick("DAYS · 24 LITTLE SURPRISES", 34)
HOOK_B = S_script("that you make yourself", 104)
def hook(t, s):
    u = t - s["t0"]; fr = kb(s["img"], u, s["t1"] - s["t0"]).convert("RGBA")
    fr.alpha_composite(GRAD_MID); snow(fr, t); sparkles(fr, t, .8)
    sc = .6 + .4 * back(u / .5); n = scaled(HOOK_N, sc)
    paste(fr, n, (W - n.width) / 2, 760 - n.height / 2, ease(u / .25))
    paste(fr, HOOK_A, (W - HOOK_A.width) / 2, 1010 + (1 - eout((u - .6) / .4)) * 26, ease((u - .6) / .3))
    paste(fr, HOOK_B, (W - HOOK_B.width) / 2, 1080 + (1 - eout((u - 1.6) / .5)) * 30, ease((u - 1.6) / .4))
    return fr

def photo_scene(t, s):
    u = t - s["t0"]; dur = s["t1"] - s["t0"]
    fr = kb(s["img"], u, dur, s.get("zin", True)).convert("RGBA")
    fr.alpha_composite(GRAD_B); fr.alpha_composite(GRAD_T); snow(fr, t, .7)
    lines = s["lines"]; total = sum(l.height for l in lines) - 34 * (len(lines) - 1)
    y = 1700 - total; out = ease((s["t1"] - t) / .18)
    for i, sp in enumerate(lines):
        d0 = .12 + i * .28
        paste(fr, sp, (W - sp.width) / 2, y + (1 - eout((u - d0) / .4)) * 34, ease((u - d0) / .3) * out); y += sp.height - 34
    lw = int(240 * eout((u - .3) / .5)); paste(fr, line(lw), (W - lw) / 2, 1722, out)
    paste(fr, MARK, (W - MARK.width) / 2, 46, .92)
    return fr

T_K = S_kick("SUNDARLYSH MEMORIES PRESENTS", 30)
T_1 = text_img("The Christmas", PINYON(140), GOLD_L, shadow=.6)
T_2 = text_img("ADVENT CALENDAR", CINZEL(88), (255, 255, 255), tr=6, shadow=.6, gold=True)
T_3 = text_img("WORKSHOP", CINZEL(112), (255, 255, 255), tr=14, shadow=.6, gold=True)
def title(t, s):
    u = t - s["t0"]; fr = PLUMBG.copy(); snow(fr, t, .85); sparkles(fr, t)
    lg = scaled(LOGO_M, .85 + .15 * back(u / .5)); paste(fr, lg, (W - lg.width) / 2, 520 - lg.height / 2, ease(u / .25))
    y = 800
    for i, (sp, gap) in enumerate(((T_K, -10), (T_1, -30), (T_2, -26), (T_3, 0))):
        d0 = .25 + i * .22; paste(fr, sp, (W - sp.width) / 2, y + (1 - eout((u - d0) / .45)) * 40, ease((u - d0) / .3)); y += sp.height + gap
    lw = int(320 * eout((u - 1.1) / .5)); paste(fr, line(lw), (W - lw) / 2, y + 20)
    return fr

D_K = S_kick("SAVE THE DATE", 34)
D_1 = text_img(DATE_L1, CINZEL(58), (255, 240, 230), tr=12)
D_2 = text_img(DATE_L2, CINZEL(100, 700), (255, 255, 255), tr=6, gold=True)
D_3 = text_img(TIME_L, SANS(54, 600), (255, 255, 255), tr=4)
D_4 = text_img(VENUE_L1, PINYON(96), GOLD_L)
D_5 = text_img(VENUE_L2, SANS(38, 500), (240, 220, 212), tr=2)
D_6 = S_kick("ONE SESSION ONLY", 30)
def details(t, s):
    u = t - s["t0"]
    bg = kb("a_cocoa", u, s["t1"] - s["t0"]).filter(ImageFilter.GaussianBlur(10)).convert("RGBA")
    bg.alpha_composite(Image.new("RGBA", (W, H), PLUM + (190,))); fr = bg; snow(fr, t, .8); sparkles(fr, t, .7)
    # gold double frame
    d = ImageDraw.Draw(fr); k = eout(u / .6)
    m = int(80 + (1 - k) * 40); d.rounded_rectangle((m, 330, W - m, 1590), 28, outline=GOLD + (int(255 * k),), width=4)
    d.rounded_rectangle((m + 16, 346, W - m - 16, 1574), 20, outline=GOLD_L + (int(150 * k),), width=2)
    y = 420
    for i, (sp, gap) in enumerate(((D_K, 30), (D_1, -14), (D_2, 24), (D_3, 70), (D_4, -20), (D_5, 60), (D_6, 0))):
        d0 = .2 + i * .2; paste(fr, sp, (W - sp.width) / 2, y + (1 - eout((u - d0) / .4)) * 30, ease((u - d0) / .3)); y += sp.height + gap
        if i == 3:
            lw = int(260 * eout((u - d0 - .1) / .4)); paste(fr, line(lw), (W - lw) / 2, y - 40)
    paste(fr, MARK, (W - MARK.width) / 2, 46, .92)
    return fr

E_1 = text_img("Make Christmas", ITAL(66), (243, 222, 214))
E_2 = text_img("unforgettable", PINYON(130), GOLD_L)
E_3 = text_img("DM TO BOOK", CINZEL(84), (255, 255, 255), tr=12, gold=True)
E_4 = text_img(HANDLE, SANS(54, 600), (255, 255, 255), tr=1)
E_5 = text_img("29 NOV · 5–7 PM · FINANCIAL DISTRICT, HYDERABAD", SANS(28, 600), (233, 207, 198), tr=4)
def end(t, s):
    u = t - s["t0"]; fr = PLUMBG.copy(); snow(fr, t, .8); sparkles(fr, t, .8)
    lg = scaled(LOGO_L, .8 + .2 * eout(u / .6)); paste(fr, lg, (W - lg.width) / 2, 520 - lg.height / 2, ease(u / .3))
    y = 900
    for i, (sp, gap) in enumerate(((E_1, -20), (E_2, 60), (E_3, 20), (E_4, 50), (E_5, 0))):
        d0 = .35 + i * .22; paste(fr, sp, (W - sp.width) / 2, y + (1 - eout((u - d0) / .4)) * 30, ease((u - d0) / .3)); y += sp.height + gap
        if i == 1:
            lw = int(300 * eout((u - .9) / .4)); paste(fr, line(lw), (W - lw) / 2, y - 34)
    if t > DUR - .6: fr = Image.blend(fr, Image.new("RGBA", (W, H), (0, 0, 0, 255)), ease((t - (DUR - .6)) / .6))
    return fr

R = dict(hook=hook, photo=photo_scene, title=title, details=details, end=end)
def scene(t):
    s = next((x for x in SEG if x["t0"] <= t < x["t1"]), SEG[-1]); fr = R[s["kind"]](t, s)
    i = SEG.index(s); u = t - s["t0"]
    if i > 0 and u < XF:
        p = SEG[i - 1]; pf = R[p["kind"]](p["t1"] - 1e-3, p)
        fr = Image.blend(pf, fr, ease(u / XF))
        if s["kind"] in ("title", "details", "end"):   # soft white flash into the cards
            fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 248, 240, 255)), .35 * (1 - u / XF))
    return fr
def render(t): return scene(t).convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW: render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=88)
    print(f"DUR={DUR:.2f}", [(round(s['t0'], 2), s['kind'], s.get('img', '')) for s in SEG]); sys.exit()

n = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-ss", str(M_START), "-t", f"{DUR:.3f}", "-i", MUSIC, "-map", "0:v", "-map", "1:a",
    "-af", f"afade=t=in:d=0.02,afade=t=out:st={DUR - 2.0:.3f}:d=2.0,loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "9M", "-bufsize", "18M", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "192k", "-ar", "44100", "-ac", "2", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(n):
    ff.stdin.write(render(i / FPS).tobytes())
    if i % 300 == 0: print(f"{i}/{n}", file=sys.stderr, flush=True)
ff.stdin.close(); ff.wait(); print("done", OUT, f"{DUR:.2f}s")
