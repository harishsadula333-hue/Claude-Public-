"""Sundarlysh Events - Christmas Workshops reel (1080x1920, 30 fps, ~35 s), cut to Jingle Bells (90 bpm).

usage: xmas.py <img_dir> <logo.jpg> <fonts_dir> <jingle_bells.mp3> <out.mp4> [--preview t1,t2,...]
"""
import sys, os, subprocess, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageChops

IMG, LOGO, FONTS, MUSIC, OUT = sys.argv[1:6]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
B = 60 / 90.0; M_OFF = 0.650
GREEN, DGREEN, RED, GOLD, CREAM, WHITE = (24, 82, 56), (10, 40, 28), (180, 32, 46), (226, 188, 108), (249, 245, 242), (255, 255, 255)

def F(n, s, w=None):
    f = ImageFont.truetype(os.path.join(FONTS, n), s)
    if w is not None:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f
BOLD = lambda s: F("Montserrat-VF.ttf", s, 800)
SEMI = lambda s: F("Montserrat-VF.ttf", s, 600)
SCRIPT = lambda s: F("GreatVibes-Regular.ttf", s)
ITAL = lambda s: F("CormorantGaramond-Italic-VF.ttf", s, 600)
def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x): x = min(max(x, 0.0), 1.0); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------------------------------------------------------------- timeline (in beats)
T_HOOK = (0, 8 * B); T_BRAND = (8 * B, 11 * B)
ACTS = [
    dict(num="01", title="CAKE & PAINT", tag="ALL AGES", shots=["c1_blank", "c2_paint", "c3_detail", "c4_final"],
         steps=["start with a blank cake", "paint with edible colours", "add a little sparkle", "a masterpiece you can eat!"]),
    dict(num="02", title="MINI CANVAS TREE LIGHTING", tag="CHRISTMAS EXCLUSIVE", shots=["v1_blank", "v2_paint", "v3_lights", "v4_glow"],
         steps=["set up your mini canvas", "paint your tree", "add the fairy lights", "and... lights on!"]),
    dict(num="03", title="PIPE-CLEANER CHRISTMAS TREES", tag="CHRISTMAS EXCLUSIVE", shots=["p1_supplies", "p2_twist", "p3_decorate", "p4_final"],
         steps=["grab some pipe cleaners", "twist & shape", "add pom-poms & a star", "your very own tree!"]),
]
t = T_BRAND[1]
for a in ACTS:
    a["t0"] = t; a["t1"] = t + 12 * B; t = a["t1"]
T_CTA = (t, t + 6 * B); DUR = T_CTA[1]
HOOK_FINALS = ["h_cake", "h_canvas", "h_pipe", "h_cake2"]

# ---------------------------------------------------------------- images
_c = {}
def photo(stem):
    if stem not in _c:
        p = next(os.path.join(IMG, f) for f in os.listdir(IMG) if os.path.splitext(f)[0] == stem)
        _c[stem] = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    return _c[stem]
def kb(stem, u, dur, punch=True, drift=0.05):
    im = photo(stem); iw, ih = im.size
    z = (1.03 + 0.09 * (1 - eout(u / 0.3))) if punch else 1.03
    z += drift * ease(u / max(dur, 1e-3))
    bw = min(iw, ih * W / H); bh = bw * H / W; cw, ch = bw / z, bh / z
    cx, cy = iw / 2, ih / 2
    return im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))

# ---------------------------------------------------------------- text helpers
_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
def text_img(s, f, col, tr=0, shadow=0.0, pad=30):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if shadow:
        al = im.getchannel("A").filter(ImageFilter.GaussianBlur(12)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(al.point(lambda v: int(v * shadow))); im = Image.alpha_composite(sh, im)
    return im
def wrap(s, f, maxw, tr=0):
    out = [""]
    for w_ in s.split():
        c = (out[-1] + " " + w_).strip()
        if tw(c, f, tr) <= maxw or not out[-1]: out[-1] = c
        else: out.append(w_)
    return out
def pill(s, bg, fg, size=28, alpha=240):
    t_ = text_img(s, SEMI(size), fg, 5, pad=0); w, h = t_.width + 64, t_.height + 34
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=bg + (alpha,))
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 3)); return im
def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))
def vgrad(a0, a1, y0, y1, col=(0, 0, 0)):
    ys = np.arange(H, dtype=np.float32)[:, None]; k = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1); k = k * k * (3 - 2 * k)
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = col; g[..., 3] = np.repeat((a0 + (a1 - a0) * k) * 255, W, 1).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD = vgrad(0, 0.88, 880, 1920, (6, 22, 14)); GRAD_TOP = vgrad(0.5, 0, 0, 380, (6, 22, 14))
def vignette():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32); r = np.sqrt(((x - W / 2) / (W * 0.75)) ** 2 + ((y - H / 2) / (H * 0.75)) ** 2)
    g = np.zeros((H, W, 4), np.uint8); g[..., 3] = (np.clip(r - 0.55, 0, 1) * 1.1 * 255).clip(0, 160).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
VIG = vignette()

# ---------------------------------------------------------------- particles
rng = random.Random(11)
FAR = [(rng.random() * W, rng.random() * H, rng.uniform(2, 4.5), rng.uniform(50, 110), rng.uniform(0, 6.3)) for _ in range(120)]
NEAR = [(rng.random() * W, rng.random() * H, rng.uniform(7, 13), rng.uniform(140, 230), rng.uniform(0, 6.3)) for _ in range(26)]
def snow(base, t, amt=1.0):
    far = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(far)
    for x0, y0, r, sp, ph in FAR:
        y = (y0 + t * sp) % (H + 30) - 15; x = x0 + 22 * math.sin(t * 0.8 + ph)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(190 * amt)))
    base.alpha_composite(far.filter(ImageFilter.GaussianBlur(0.8)))
    near = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(near)
    for x0, y0, r, sp, ph in NEAR:
        y = (y0 + t * sp) % (H + 60) - 30; x = x0 + 40 * math.sin(t * 0.6 + ph)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(120 * amt)))
    base.alpha_composite(near.filter(ImageFilter.GaussianBlur(4)))
def star(d, x, y, r, a, col=WHITE):
    pts = [(x + (r if i % 2 == 0 else r * 0.2) * math.cos(i * math.pi / 4), y + (r if i % 2 == 0 else r * 0.2) * math.sin(i * math.pi / 4)) for i in range(8)]
    d.polygon(pts, fill=col + (int(255 * a),))
BURST = [(rng.uniform(0, 2 * math.pi), rng.uniform(0.35, 1.0), rng.uniform(12, 30), rng.choice([WHITE, GOLD])) for _ in range(28)]
def burst(base, u, cx=W / 2, cy=760):
    if not (0 <= u < 1.1): return
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for ang, dist, r, col in BURST:
        rr = eout(u / 0.9) * 520 * dist; a = (1 - ease(u / 1.1)) * (0.6 + 0.4 * math.sin(u * 20 + ang))
        star(d, cx + rr * math.cos(ang), cy + rr * math.sin(ang) * 1.2, r * (1 - 0.4 * u), max(a, 0), col)
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(5))); base.alpha_composite(lay)

# ---------------------------------------------------------------- logo badge
LOGO_IM = Image.open(LOGO).convert("RGB")
def badge(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS).convert("RGBA")
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255); lg.putalpha(m)
    out = Image.new("RGBA", (size + 80, size + 80), (0, 0, 0, 0))
    ring = Image.new("RGBA", out.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(ring)
    dr.ellipse((26, 30, size + 54, size + 58), fill=(0, 0, 0, 120)); ring = ring.filter(ImageFilter.GaussianBlur(14))
    out.alpha_composite(ring); dr = ImageDraw.Draw(out)
    dr.ellipse((28, 28, size + 52, size + 52), fill=GOLD + (255,)); out.alpha_composite(lg, (40, 40)); return out
BADGE_BIG, BADGE_SM = badge(560), badge(360)

# ---------------------------------------------------------------- sprites
HK1 = text_img("This Christmas,", SCRIPT(150), WHITE, shadow=0.7)
HK2 = text_img("don't just celebrate...", ITAL(70), WHITE, shadow=0.7)
HK3 = text_img("CREATE", BOLD(170), GOLD, 10, 0.7)
HK4 = text_img("something magical", SCRIPT(120), WHITE, shadow=0.7)
BR1 = text_img("presents", SCRIPT(110), GOLD); BR2 = text_img("CHRISTMAS", BOLD(118), WHITE, 8); BR3 = text_img("WORKSHOPS", BOLD(118), WHITE, 8)
BR4 = text_img("fun, festive & for all ages", ITAL(60), (235, 225, 210))
MARK = text_img("Sundarlysh Events", SCRIPT(66), WHITE, shadow=0.6)
for a in ACTS:
    size = 96
    while True:
        lines = wrap(a["title"], BOLD(size), W - 150, 2)
        if len(lines) <= 2 and max(tw(l, BOLD(size), 2) for l in lines) <= W - 150: break
        size -= 4
    a["title_spr"] = [text_img(l, BOLD(size), WHITE, 2, 0.6) for l in lines]
    a["step_spr"] = [text_img(s, SCRIPT(92), GOLD, shadow=0.7) for s in a["steps"]]
    a["tag_spr"] = pill(a["tag"], GOLD, DGREEN)
    a["num_spr"] = text_img(a["num"], SCRIPT(300), GOLD)
    a["count_spr"] = pill(f"{a['num']} / 03", (255, 255, 255), DGREEN, 24, 60)

# ---------------------------------------------------------------- scenes
def hook(t):
    if t < 4 * B:
        fr = kb("h_table", t, 4 * B, punch=False, drift=0.10).convert("RGBA")
    else:
        i = min(int((t - 4 * B) / B), 3); fr = kb(HOOK_FINALS[i], t - 4 * B - i * B, B).convert("RGBA")
    fr.alpha_composite(vgrad(0.1, 0.65, 400, 1500, (6, 22, 14))); fr.alpha_composite(VIG)
    snow(fr, t)
    if t < 4 * B:
        paste(fr, HK1, (W - HK1.width) / 2, 700 + (1 - eout((t - 0.3) / 0.6)) * 50, ease((t - 0.3) / 0.4) * ease((4 * B - t) / 0.15))
        paste(fr, HK2, (W - HK2.width) / 2, 900, ease((t - 1.2) / 0.4) * ease((4 * B - t) / 0.15))
    else:
        u = t - 4 * B; s = 0.7 + 0.3 * back(u / 0.35)
        c3 = HK3.resize((int(HK3.width * s), int(HK3.height * s)), Image.BILINEAR)
        paste(fr, c3, (W - c3.width) / 2, 760 - (c3.height - HK3.height) / 2, ease(u / 0.15))
        paste(fr, HK4, (W - HK4.width) / 2, 960 + (1 - eout((u - 0.35) / 0.4)) * 40, ease((u - 0.35) / 0.3))
        flash = 1 - ease(u / 0.18)
        if flash > 0: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 250, 235, 255)), 0.6 * flash)
    if t < 0.3: fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / 0.3))
    return fr

def green_bg():
    g = np.zeros((H, W, 3), np.float32); ys = np.linspace(0, 1, H)[:, None, None]
    y, x = np.mgrid[0:H, 0:W].astype(np.float32); r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * 0.42) / H) ** 2)[..., None]
    g[:] = np.array(GREEN) * (1 - np.clip(r * 1.6, 0, 1)) + np.array(DGREEN) * np.clip(r * 1.6, 0, 1)
    return Image.fromarray(g.astype(np.uint8)).convert("RGBA")
GREEN_BG = green_bg()

def brand(t):
    u = t - T_BRAND[0]; fr = GREEN_BG.copy(); snow(fr, t, 0.8)
    s = 0.6 + 0.4 * back(u / 0.45); b = BADGE_BIG.resize((int(BADGE_BIG.width * s), int(BADGE_BIG.height * s)), Image.BILINEAR)
    paste(fr, b, (W - b.width) / 2, 640 - b.height / 2, ease(u / 0.2))
    paste(fr, BR1, (W - BR1.width) / 2, 960 + (1 - eout((u - 0.3) / 0.4)) * 30, ease((u - 0.3) / 0.3))
    for k, sp in enumerate([BR2, BR3]):
        uu = u - 0.45 - 0.1 * k; paste(fr, sp, (W - sp.width) / 2 + (1 - eout(uu / 0.35)) * (160 if k else -160), 1110 + k * 140, ease(uu / 0.25))
    paste(fr, BR4, (W - BR4.width) / 2, 1430, ease((u - 0.9) / 0.3))
    d = ImageDraw.Draw(fr)
    for i, (x, y) in enumerate([(170, 300), (910, 360), (160, 1640), (920, 1580)]):
        star(d, x, y, 38, max(0.0, math.sin(t * 4 + i * 1.7)) ** 2, GOLD)
    flash = 1 - ease(u / 0.2)
    if flash > 0: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 255, 255, 255)), flash)
    return fr

def iris(fr_new, prev, u, a):
    """ornament iris: red disc with gold ring + number grows, then opens onto the new scene"""
    if u >= 0.55: return fr_new
    R = math.hypot(W, H) / 2 + 40
    out = prev.copy(); d = ImageDraw.Draw(out)
    if u < 0.3:
        r = eout(u / 0.3) * R
        d.ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), fill=RED + (255,))
        d.ellipse((W / 2 - r * 0.92, H / 2 - r * 0.92, W / 2 + r * 0.92, H / 2 + r * 0.92), outline=GOLD + (255,), width=10)
        n = a["num_spr"]; paste(out, n, (W - n.width) / 2, (H - n.height) / 2, ease(u / 0.2))
        return out
    k = eout((u - 0.3) / 0.25); r = k * R
    red = Image.new("RGBA", (W, H), RED + (255,)); dr = ImageDraw.Draw(red)
    n = a["num_spr"]; paste(red, n, (W - n.width) / 2, (H - n.height) / 2, 1 - k)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), fill=255)
    red.paste(fr_new, (0, 0), m)
    ImageDraw.Draw(red).ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), outline=GOLD + (255,), width=10)
    return red

def act_frame(a, t, with_iris=True):
    u = t - a["t0"]; i = min(int(u / (3 * B)), 3); su = u - i * 3 * B
    stem = a["shots"][i]
    fr = kb(stem, su, 3 * B).convert("RGBA")
    if stem == "v4_glow":                                     # lights-off -> lights-on
        k = ease((su - 0.35) / 0.25)
        dark = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, 0.28)
        glow = fr.filter(ImageFilter.GaussianBlur(28)); glow = ImageChops.screen(fr, glow)
        fr = Image.blend(dark, glow, k)
        if su > 0.35: burst(fr, su - 0.35, cy=820)
    elif i == 3: burst(fr, su - 0.1)
    fr.alpha_composite(GRAD); fr.alpha_composite(GRAD_TOP); fr.alpha_composite(VIG)
    snow(fr, t, 0.75)
    paste(fr, MARK, (W - MARK.width) / 2, 60, 0.9)
    out = ease((a["t1"] - t) / 0.12)
    # header block (stays for the whole activity)
    paste(fr, a["tag_spr"], 70 + (1 - eout((u - 0.4) / 0.3)) * -80, 1230, ease((u - 0.4) / 0.2) * out)
    paste(fr, a["count_spr"], 70 + a["tag_spr"].width + 18, 1230, ease((u - 0.5) / 0.2) * out)
    y = 1320
    for k, sp in enumerate(a["title_spr"]):
        uu = u - 0.5 - 0.08 * k; paste(fr, sp, 40 + (1 - eout(uu / 0.35)) * 140, y, ease(uu / 0.2) * out); y += sp.height - 52
    # step caption changes every shot
    st = a["step_spr"][i]; sa = ease((su - 0.1) / 0.25) * ease((3 * B - su) / 0.12)
    if i == 0: sa *= ease((u - 0.7) / 0.25)
    paste(fr, st, 44, y + 18 + (1 - eout((su - 0.1) / 0.3)) * 26, sa * out)
    # progress dots
    d = ImageDraw.Draw(fr); y_d = y + st.height + 30
    for k in range(4):
        x = 82 + k * 44; r = 11 if k == i else 8
        d.ellipse((x - r, y_d - r, x + r, y_d + r), fill=(GOLD if k <= i else (255, 255, 255)) + ((255 if k <= i else 110),))
    if with_iris and u < 0.55:
        prev = render(a["t0"] - 1e-3, raw=True)
        fr = iris(fr, prev, u, a)
    return fr

CTA1 = text_img("Christmas only", SCRIPT(118), GOLD, shadow=0.6)
CTA2 = text_img("BOOK YOUR SESSION", BOLD(80), WHITE, 5, 0.6)
CHIPS = [pill(s, (255, 255, 255), WHITE, 26, 50) for s in ["ALL AGES", "FAMILIES", "KIDS", "FRIENDS"]]
def btn(s):
    t_ = text_img(s, BOLD(42), DGREEN, 5, pad=0); w, h = t_.width + 120, t_.height + 72
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=GOLD + (255,))
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 5)); return im
BTN = btn("DM US TO BOOK")
HANDLE = text_img("@sundarlyshevents", SEMI(46), WHITE, 1, 0.5)
CITY = text_img("BENGALURU  ·  HYDERABAD", SEMI(30), (230, 220, 205), 6, 0.5)
CTA_BG = None
def cta(t):
    global CTA_BG
    if CTA_BG is None:
        bg = kb("h_friends", 0, 1, punch=False, drift=0).filter(ImageFilter.GaussianBlur(6)).convert("RGBA")
        bg.alpha_composite(Image.new("RGBA", (W, H), DGREEN + (175,))); CTA_BG = bg
    u = t - T_CTA[0]; fr = CTA_BG.copy(); snow(fr, t, 0.9)
    s = 0.6 + 0.4 * back(u / 0.45); b = BADGE_SM.resize((int(BADGE_SM.width * s), int(BADGE_SM.height * s)), Image.BILINEAR)
    paste(fr, b, (W - b.width) / 2, 380 - b.height / 2, ease(u / 0.2))
    paste(fr, CTA1, (W - CTA1.width) / 2, 620 + (1 - eout((u - 0.25) / 0.4)) * 30, ease((u - 0.25) / 0.3))
    paste(fr, CTA2, (W - CTA2.width) / 2, 790 + (1 - eout((u - 0.4) / 0.4)) * 40, ease((u - 0.4) / 0.3))
    total = sum(c.width for c in CHIPS) + 18 * 3; x = (W - total) / 2
    for k, c in enumerate(CHIPS):
        dl = 0.6 + 0.07 * k; paste(fr, c, x, 980 + (1 - back((u - dl) / 0.35)) * 30, ease((u - dl) / 0.2)); x += c.width + 18
    pulse = 1 + 0.04 * max(0.0, math.sin((u - 1.0) / B * math.pi)) if u > 1.0 else 1
    bb = BTN.resize((int(BTN.width * pulse), int(BTN.height * pulse)), Image.BILINEAR)
    paste(fr, bb, (W - bb.width) / 2, 1180 - (bb.height - BTN.height) / 2 + (1 - eout((u - 0.85) / 0.4)) * 50, ease((u - 0.85) / 0.3))
    paste(fr, HANDLE, (W - HANDLE.width) / 2, 1370, ease((u - 1.05) / 0.3))
    paste(fr, CITY, (W - CITY.width) / 2, 1470, ease((u - 1.2) / 0.3))
    d = ImageDraw.Draw(fr)
    for i, (x_, y_) in enumerate([(150, 250), (930, 300), (140, 1700), (940, 1660)]):
        star(d, x_, y_, 36, max(0.0, math.sin(t * 4 + i * 1.7)) ** 2, GOLD)
    k = ease(u / 0.3)
    if k < 1: fr = Image.blend(render(T_CTA[0] - 1e-3, raw=True), fr, k)
    return fr

def render(t, raw=False):
    if t < T_HOOK[1]: fr = hook(t)
    elif t < T_BRAND[1]: fr = brand(t)
    elif t >= T_CTA[0]: fr = cta(t)
    else:
        a = next(a for a in ACTS if a["t0"] <= t < a["t1"]); fr = act_frame(a, t, with_iris=not raw)
    return fr if raw else fr.convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW: render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=88)
    print(f"DUR={DUR:.2f}", [(a['num'], round(a['t0'], 2)) for a in ACTS], f"cta={T_CTA[0]:.2f}"); sys.exit()

n = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-ss", str(M_OFF), "-t", f"{DUR:.3f}", "-i", MUSIC, "-map", "0:v", "-map", "1:a",
    "-af", f"afade=t=in:d=0.3,afade=t=out:st={DUR - 1.8:.3f}:d=1.8,loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(n):
    ff.stdin.write(render(i / FPS).tobytes())
    if i % 200 == 0: print(f"{i}/{n}", file=sys.stderr, flush=True)
ff.stdin.close(); ff.wait(); print("done", OUT, f"{DUR:.2f}s")
