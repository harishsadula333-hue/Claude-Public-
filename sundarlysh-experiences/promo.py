"""Sundarlysh Events - Experience Bars & Workshops promo (1080x1920, 30fps, ~41s).

usage: promo.py <img_dir> <logo.jpg> <fonts_dir> <music_main.mp3> <music_xmas.mp3> <out.mp4> [--preview t1,t2,..]
Images are referenced by file stem (see CARDS / HOOK).
"""
import sys, os, subprocess, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

IMG, LOGO, FONTS, M1, M2, OUT = sys.argv[1:7]
PREVIEW = None
if "--preview" in sys.argv:
    PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]

W, H, FPS = 1080, 1920, 30
B1 = 60 / 102.0            # Life of Riley beat
B2 = 60 / 90.0             # Jingle Bells beat
M1_OFF, M2_OFF = 0.570, 0.650   # first beat inside each track
CREAM = (249, 245, 242); INK = (46, 34, 32); WHITE = (255, 255, 255)
GOLD = (222, 186, 110)
CH = {  # chapter palettes: (main, deep, accent)
    "party": ((232, 160, 150), (150, 72, 70), (255, 220, 205)),
    "all":   ((70, 160, 150), (24, 92, 88), (210, 245, 235)),
    "xmas":  ((190, 40, 52), (20, 70, 48), GOLD),
}

def F(name, size, wght=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    if wght is not None:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f
BOLD = lambda s: F("Montserrat-VF.ttf", s, 800)
SEMI = lambda s: F("Montserrat-VF.ttf", s, 600)
SCRIPT = lambda s: F("GreatVibes-Regular.ttf", s)
ITAL = lambda s: F("CormorantGaramond-Italic-VF.ttf", s, 600)

def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x):  # ease-out-back (overshoot)
    x = min(max(x, 0.0), 1.0); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ------------------------------------------------------------- timeline
t = 0.0
def beats1(n): return n * B1
HOOK = ["h_ubtan", "h_glitter", "h_candle", "h_decoden", "h_kundan", "h_bedazzle", "h_cake", "h_pipe"]
T_HOOK = (0.0, beats1(8))
T_BRAND = (beats1(8), beats1(12))
CHAPTERS = []   # (t0, t1, key, script, title, sub)
CARDS = []      # (t0, t1, stem, chapter, title, tagline, tag)
def chapter(t0, dur, key, script, title, sub):
    CHAPTERS.append((t0, t0 + dur, key, script, title, sub)); return t0 + dur
def card(t0, dur, stem, key, title, tag_line, tag, fx=None, focus=(0.5, 0.5)):
    CARDS.append((t0, t0 + dur, stem, key, title, tag_line, tag, fx, focus)); return t0 + dur

t = T_BRAND[1]
t = chapter(t, beats1(2), "party", "for", "WEDDINGS & PARTIES", "")
t = card(t, beats1(5), "ubtan", "party", "THE UBTAN BAR", "A DIY haldi glow ritual for your guests", "WEDDINGS & PARTIES")
t = card(t, beats1(5), "kundan", "party", "KUNDAN MEHENDI ART", "Henna, elevated with kundan sparkle", "FOR THE LADIES")
t = card(t, beats1(5), "glitter", "party", "FRECKLES & GLITTER BAR", "Faux freckles, glitter & instant glam", "FOR THE LADIES", fx="sparkle")
t = chapter(t, beats1(2), "all", "workshops for", "ALL AGES", "")
t = card(t, beats1(4), "candle", "all", "SAND CANDLE MAKING", "Pour, layer & take home your own candle", "ALL AGES")
t = card(t, beats1(4), "bedazzle", "all", "BEDAZZLE WORKSHOPS", "Add sparkle to anything you own", "ALL AGES", fx="sparkle")
t = card(t, beats1(4), "art3d", "all", "3D ART WORKSHOPS", "Textured art sessions made for cafés", "FOR CAFÉS")
t = card(t, beats1(4), "decoden", "all", "DECODEN FROSTING BAR", "Whipped-cream art for cases & keepsakes", "PARTIES & WORKSHOPS")
T_SWITCH = t                                   # music switches to Jingle Bells here
t = chapter(t, 2 * B2, "xmas", "christmas", "SPECIALS", "")
t = card(t, 4 * B2, "cakepaint", "xmas", "CAKE & PAINT", "Paint your own Christmas cake", "ALL AGES", fx="snow")
t = card(t, 4 * B2, "canvastree", "xmas", "MINI CANVAS TREE LIGHTING", "Paint a tree, then light it up", "CHRISTMAS EXCLUSIVE", fx="snow")
t = card(t, 4 * B2, "pipetree", "xmas", "PIPE-CLEANER CHRISTMAS TREES", "Twist, shape & create your own tree", "CHRISTMAS EXCLUSIVE", fx="snow")
T_CTA = (t, t + 6 * B2)
DUR = T_CTA[1]

# ------------------------------------------------------------- images
_c = {}
def photo(stem):
    if stem not in _c:
        p = next(os.path.join(IMG, f) for f in os.listdir(IMG) if os.path.splitext(f)[0] == stem)
        _c[stem] = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    return _c[stem]
def kb(stem, local, dur, focus=(0.5, 0.5), punch=True):
    """zoom punch on the cut (1.14 -> 1.04 in 0.35s) then slow drift to 1.0"""
    im = photo(stem); iw, ih = im.size
    z = 1.04 + 0.10 * (1 - eout(local / 0.35)) if punch else 1.06
    z -= 0.04 * ease(local / max(dur, 0.01))
    bw = min(iw, ih * W / H); bh = bw * H / W; cw, ch = bw / z, bh / z
    cx = min(max(focus[0] * iw, cw / 2), iw - cw / 2); cy = min(max(focus[1] * ih, ch / 2), ih - ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))

# ------------------------------------------------------------- text sprites
_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(text, font, track=0):
    return sum(_d.textlength(c, font=font) for c in text) + track * (len(text) - 1) if track else _d.textlength(text, font=font)
def text_img(text, font, color, track=0, shadow=0.0, pad=30):
    a, d = font.getmetrics()
    w = int(tw(text, font, track)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if track:
        for c in text: dr.text((x, pad), c, font=font, fill=color); x += _d.textlength(c, font=font) + track
    else: dr.text((x, pad), text, font=font, fill=color)
    if shadow:
        al = im.getchannel("A").filter(ImageFilter.GaussianBlur(12))
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.putalpha(al.point(lambda v: int(v * shadow)))
        im = Image.alpha_composite(sh, im)
    return im
def wrap(text, font, maxw, track=0):
    words = text.split(); lines = [""]
    for w_ in words:
        cand = (lines[-1] + " " + w_).strip()
        if tw(cand, font, track) <= maxw or not lines[-1]: lines[-1] = cand
        else: lines.append(w_)
    return lines
def pill(text, bg, fg, size=28):
    t_ = text_img(text, SEMI(size), fg, track=5, pad=0)
    w, h = t_.width + 64, t_.height + 34
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=bg + (235,))
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 3)); return im

def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997:
        spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))

# card text block: title lines (bold), tagline (italic), tag pill, accent bar
CARD_SPR = {}
for c in CARDS:
    t0, t1, stem, key, title, line, tag, fx, focus = c
    main, deep, acc = CH[key]
    size = 92
    lines = wrap(title, BOLD(size), W - 150, 2)
    while len(lines) > 2 or max(tw(l, BOLD(size), 2) for l in lines) > W - 150:
        size -= 4; lines = wrap(title, BOLD(size), W - 150, 2)
    CARD_SPR[stem] = dict(
        title=[text_img(l, BOLD(size), WHITE, track=2, shadow=0.6) for l in lines],
        line=text_img(line, ITAL(58), WHITE, shadow=0.7),
        tag=pill(tag, main, WHITE), acc=main)

def vgrad(a0, a1, y0, y1, color=(0, 0, 0)):
    ys = np.arange(H, dtype=np.float32)[:, None]; k = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1); k = k * k * (3 - 2 * k)
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = color; g[..., 3] = np.repeat((a0 + (a1 - a0) * k) * 255, W, 1).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD = vgrad(0, 0.86, 900, 1920)
GRAD_TOP = vgrad(0.45, 0, 0, 360)

# ------------------------------------------------------------- particles
rng = random.Random(3)
SNOW = [(rng.random() * W, rng.random() * H, rng.uniform(3, 9), rng.uniform(60, 170), rng.uniform(0, 6.28)) for _ in range(140)]
def snow(base, t, amount=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x0, y0, r, sp, ph in SNOW:
        y = (y0 + t * sp) % (H + 40) - 20; x = x0 + 30 * math.sin(t * 0.9 + ph)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(200 * amount)))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(1.2)))
SPARK = [(rng.random() * W, rng.random() * H * 0.85, rng.uniform(14, 34), rng.uniform(0, 6.28), rng.uniform(2.5, 5)) for _ in range(34)]
def star(d, x, y, r, a, col=(255, 255, 255)):
    pts = []
    for i in range(8):
        rr = r if i % 2 == 0 else r * 0.18; ang = i * math.pi / 4
        pts.append((x + rr * math.cos(ang), y + rr * math.sin(ang)))
    d.polygon(pts, fill=col + (int(255 * a),))
def sparkle(base, t, col=(255, 255, 255)):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x, y, r, ph, sp in SPARK:
        a = max(0.0, math.sin(t * sp + ph)) ** 3
        if a > 0.02: star(d, x, y, r * (0.6 + 0.4 * a), a, col)
    glow = lay.filter(ImageFilter.GaussianBlur(6)); base.alpha_composite(glow); base.alpha_composite(lay)

# ------------------------------------------------------------- logo
LOGO_IM = Image.open(LOGO).convert("RGB")
def logo(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS)
    m = np.ones(size, np.float32); r = size // 9; ramp = np.linspace(0, 1, r); m[:r] = ramp; m[-r:] = ramp[::-1]
    return lg, Image.fromarray((np.minimum.outer(m, m) * 255).astype(np.uint8))
LOGO_BIG = logo(860); LOGO_SM = logo(560)

# ------------------------------------------------------------- scenes
HOOK_TXT = [
    (0.0, beats1(4), [text_img("Your guests", SCRIPT(140), WHITE, shadow=0.6), text_img("deserve", SCRIPT(140), WHITE, shadow=0.6)]),
    (beats1(4), beats1(6), [text_img("MORE THAN", BOLD(104), WHITE, 3, 0.6), text_img("A PARTY.", BOLD(104), WHITE, 3, 0.6)]),
    (beats1(6), beats1(8), [text_img("they deserve an", ITAL(72), WHITE, shadow=0.6), text_img("EXPERIENCE", BOLD(112), GOLD, 4, 0.6)]),
]
def hook(t):
    i = min(int(t / B1), len(HOOK) - 1)
    fr = kb(HOOK[i], t - i * B1, B1).convert("RGBA")
    fr.alpha_composite(vgrad(0.15, 0.7, 500, 1500))
    for t0, t1, sprs in HOOK_TXT:
        if t0 <= t < t1:
            u = t - t0; y = 760
            for k, s in enumerate(sprs):
                a = ease((u - 0.08 * k) / 0.25) * ease((t1 - t) / 0.12)
                paste(fr, s, (W - s.width) / 2 + (1 - eout((u - 0.08 * k) / 0.3)) * 90 * (1 if k % 2 else -1), y, a)
                y += s.height - 40
    if t < 0.25: fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / 0.25))
    return fr

BR_PRESENTS = text_img("presents", SCRIPT(110), (168, 104, 92))
BR_L1 = text_img("EXPERIENCE BARS", BOLD(84), INK, 4); BR_L2 = text_img("& WORKSHOPS", BOLD(84), INK, 4)
def brand(t):
    u = t - T_BRAND[0]; fr = Image.new("RGBA", (W, H), CREAM + (255,))
    lg, m = LOGO_BIG; s = 0.86 + 0.14 * back(u / 0.5); sz = int(860 * s)
    fr.paste(lg.resize((sz, sz), Image.BILINEAR), ((W - sz) // 2, 700 - sz // 2), m.resize((sz, sz), Image.BILINEAR))
    paste(fr, BR_PRESENTS, (W - BR_PRESENTS.width) / 2, 1080 + (1 - eout((u - 0.3) / 0.4)) * 40, ease((u - 0.3) / 0.3))
    for k, s in enumerate([BR_L1, BR_L2]):
        uu = u - 0.55 - 0.12 * k
        paste(fr, s, (W - s.width) / 2, 1240 + k * 110 + (1 - eout(uu / 0.4)) * 60, ease(uu / 0.3))
    flash = 1 - ease(u / 0.2)
    if flash > 0: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 255, 255, 255)), flash)
    return fr

CH_SPR = {}
for c in CHAPTERS:
    t0, t1, key, scr, title, sub = c
    main, deep, acc = CH[key]
    sz = 100
    while tw(title, BOLD(sz), 4) > W - 180: sz -= 2
    CH_SPR[key] = (text_img(scr, SCRIPT(150), acc), text_img(title, BOLD(sz), WHITE, 4))
def chapter_frame(c, t):
    t0, t1, key, *_ = c; u = t - t0; main, deep, acc = CH[key]
    # diagonal wipe from the previous frame is approximated by a fast slide-in panel
    g = np.zeros((H, W, 3), np.float32); ys = np.linspace(0, 1, H)[:, None, None]
    g[:] = np.array(main, np.float32) * (1 - ys) + np.array(deep, np.float32) * ys
    fr = Image.fromarray(g.astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(fr)
    for k in range(3):   # concentric rings pulsing on the beat
        r = 300 + k * 170 + 40 * eout(u / 0.5)
        d.ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), outline=acc + (int(70 - 18 * k),), width=4)
    s1, s2 = CH_SPR[key]
    paste(fr, s1, (W - s1.width) / 2, 760 + (1 - eout(u / 0.35)) * -50, ease(u / 0.25))
    paste(fr, s2, (W - s2.width) / 2 + (1 - eout((u - 0.1) / 0.35)) * 160, 930, ease((u - 0.1) / 0.25))
    if key == "xmas":
        snow(fr, t, 0.9)
        dr = ImageDraw.Draw(fr)
        for i, (x, y) in enumerate([(220, 560), (860, 600), (540, 1300)]):
            star(dr, x, y, 34, max(0.0, math.sin(t * 5 + i)) ** 2, GOLD)
    # slide-in from right covering previous scene
    k = eout(u / 0.28)
    if k < 1:
        prev = render_main(t0 - 1e-3, allow_chapter=False).convert("RGBA")
        canvas = prev.copy(); canvas.paste(fr, (int(W * (1 - k)), 0)); fr = canvas
    return fr

def card_frame(c, t):
    t0, t1, stem, key, title, line, tag, fx, focus = c; u = t - t0; dur = t1 - t0
    fr = kb(stem, u, dur, focus).convert("RGBA")
    fr.alpha_composite(GRAD); fr.alpha_composite(GRAD_TOP)
    if fx == "sparkle": sparkle(fr, t)
    if fx == "snow": snow(fr, t, 0.75)
    sp = CARD_SPR[stem]
    out = ease((t1 - t) / 0.12)
    # tag pill
    paste(fr, sp["tag"], 70 + (1 - eout((u - 0.1) / 0.3)) * -80, 1270, ease((u - 0.1) / 0.2) * out)
    y = 1360
    for k, s in enumerate(sp["title"]):
        uu = u - 0.18 - 0.08 * k
        paste(fr, s, 40 + (1 - eout(uu / 0.35)) * 140, y, ease(uu / 0.2) * out); y += s.height - 52
    # accent bar grows
    bar = Image.new("RGBA", (max(1, int(180 * eout((u - 0.35) / 0.4))), 8), sp["acc"] + (255,))
    paste(fr, bar, 70, y + 30, out)
    paste(fr, sp["line"], 40, y + 50 + (1 - eout((u - 0.45) / 0.35)) * 30, ease((u - 0.45) / 0.3) * out)
    # small brand mark
    paste(fr, MARK, (W - MARK.width) / 2, 70, 0.9 * out)
    return fr
MARK = text_img("Sundarlysh Events", SCRIPT(66), WHITE, shadow=0.6)

CTA_L = [
    (text_img("Bring the magic to", ITAL(64), INK), 0.25),
    (text_img("your celebration", SCRIPT(124), (168, 104, 92)), 0.4),
]
CHIPS = [pill("WEDDINGS", CH["party"][1], WHITE, 26), pill("PARTIES", CH["party"][0], WHITE, 26),
         pill("CAFÉS", CH["all"][1], WHITE, 26), pill("CHRISTMAS", CH["xmas"][0], WHITE, 26)]
def btn(text):
    t_ = text_img(text, BOLD(40), WHITE, 5, pad=0); w, h = t_.width + 120, t_.height + 70
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=(168, 104, 92, 255))
    im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 5)); return im
BTN = btn("DM US TO BOOK")
HANDLE = text_img("@sundarlyshevents", SEMI(44), INK, 1)
CITY = text_img("BENGALURU  ·  HYDERABAD", SEMI(30), (120, 100, 95), 6)
def cta(t):
    u = t - T_CTA[0]; fr = Image.new("RGBA", (W, H), CREAM + (255,))
    lg, m = LOGO_SM; s = 0.9 + 0.1 * back(u / 0.5); sz = int(560 * s)
    fr.paste(lg.resize((sz, sz), Image.BILINEAR), ((W - sz) // 2, 420 - sz // 2), m.resize((sz, sz), Image.BILINEAR))
    y = 740
    for spr, dl in CTA_L:
        paste(fr, spr, (W - spr.width) / 2, y + (1 - eout((u - dl) / 0.4)) * 40, ease((u - dl) / 0.3)); y += spr.height - 30
    # chips row (2x2)
    cy = 1090
    for row in (CHIPS[:2], CHIPS[2:]):
        total = sum(c.width for c in row) + 24; x = (W - total) / 2
        for k, c in enumerate(row):
            dl = 0.6 + 0.08 * (CHIPS.index(c))
            paste(fr, c, x, cy + (1 - back((u - dl) / 0.35)) * 30, ease((u - dl) / 0.2)); x += c.width + 24
        cy += row[0].height + 20
    pulse = 1 + 0.035 * max(0.0, math.sin((u - 1.0) / B2 * math.pi)) if u > 1.0 else 1
    b = BTN.resize((int(BTN.width * pulse), int(BTN.height * pulse)), Image.BILINEAR)
    paste(fr, b, (W - b.width) / 2, 1360 - (b.height - BTN.height) / 2 + (1 - eout((u - 0.9) / 0.4)) * 50, ease((u - 0.9) / 0.3))
    paste(fr, HANDLE, (W - HANDLE.width) / 2, 1530, ease((u - 1.1) / 0.3))
    paste(fr, CITY, (W - CITY.width) / 2, 1620, ease((u - 1.25) / 0.3))
    snow_c(fr, t)
    k = ease(u / 0.3)
    if k < 1:
        prev = render_main(T_CTA[0] - 1e-3).convert("RGBA"); fr = Image.blend(prev, fr, k)
    if t > DUR - 0.6: fr = Image.blend(fr, Image.new("RGBA", (W, H), CREAM + (255,)), ease((t - (DUR - 0.6)) / 0.6) * 0.0)
    return fr
def snow_c(fr, t):   # soft pink-gold flakes on cream
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x0, y0, r, sp, ph in SNOW[:60]:
        y = (y0 + t * sp * 0.6) % (H + 40) - 20; x = x0 + 30 * math.sin(t * 0.9 + ph)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(222, 186, 150, 110))
    fr.alpha_composite(lay)

def render_main(t, allow_chapter=True):
    if t < T_HOOK[1]: return hook(t)
    if t < T_BRAND[1]: return brand(t)
    if t >= T_CTA[0]: return cta(t)
    for c in CHAPTERS:
        if c[0] <= t < c[1]:
            if allow_chapter: return chapter_frame(c, t)
    for c in CARDS:
        if c[0] <= t < c[1]: return card_frame(c, t)
    # fall back (t inside a chapter while allow_chapter=False): show previous card's last frame
    prevs = [c for c in CARDS if c[1] <= t]
    if prevs: return card_frame(prevs[-1], prevs[-1][1] - 1e-3)
    return brand(T_BRAND[1] - 1e-3)

def render(t): return render_main(t).convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW: render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=88)
    print(f"DUR={DUR:.2f} switch={T_SWITCH:.2f} cta={T_CTA[0]:.2f}"); sys.exit()

# ------------------------------------------------------------- audio + encode
xf = 0.35
af = (f"[1:a]atrim=start={M1_OFF}:duration={T_SWITCH + xf},asetpts=PTS-STARTPTS,"
      f"afade=t=out:st={T_SWITCH - 0.05}:d={xf}[a1];"
      f"[2:a]atrim=start={M2_OFF}:duration={DUR - T_SWITCH + 0.1},asetpts=PTS-STARTPTS,"
      f"afade=t=in:d=0.12,afade=t=out:st={DUR - T_SWITCH - 1.6}:d=1.6,adelay={int(T_SWITCH * 1000)}:all=1[a2];"
      f"[a1][a2]amix=inputs=2:normalize=0:duration=longest,atrim=duration={DUR},loudnorm=I=-14:TP=-1.5:LRA=11[a]")
n = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", M1, "-i", M2, "-filter_complex", af, "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(n):
    ff.stdin.write(render(i / FPS).tobytes())
    if i % 200 == 0: print(f"{i}/{n}", file=sys.stderr, flush=True)
ff.stdin.close(); ff.wait(); print("done", OUT, f"{DUR:.2f}s")
