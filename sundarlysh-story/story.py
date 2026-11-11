"""Sundarlysh Events - "Why couples choose us" story reel (1080x1920, 30fps).

usage: story.py <photo_dir> <logo.jpg> <fonts_dir> <music.mp3> <out.mp4> [--preview t1,t2,...]
Photos are referenced by file stem (e.g. Pexels id). Replace them with the
client's own photos by dropping files with the same names into <photo_dir>,
or edit SHOTS below.
"""
import sys, os, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

PHOTOS, LOGO, FONTS, MUSIC, OUT = sys.argv[1:6]
PREVIEW = None
if "--preview" in sys.argv:
    PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")]

W, H, FPS = 1080, 1920, 30
DUR = 43.5
MUSIC_START = 36.0          # offset into the track (start of a 12 s phrase)
CREAM = (249, 245, 242)
BLUSH = (232, 185, 170)
ROSE = (168, 104, 92)
INK = (52, 38, 34)
WHITE = (255, 255, 255)

def font(name, size, var=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    if var:
        try: f.set_variation_by_axes([var])
        except Exception: pass
    return f
SCRIPT = lambda s: font("GreatVibes-Regular.ttf", s)
TITLE = lambda s: font("Italiana-Regular.ttf.ttf", s)
SERIF_I = lambda s: font("CormorantGaramond-Italic-VF.ttf", s, 500)
SERIF = lambda s: font("CormorantGaramond.ttf", s, 500)
SANS = lambda s: font("Montserrat-VF.ttf", s, 500)

def ease(x):  # smoothstep
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)

# ------------------------------------------------------------------ photos
_cache = {}
def photo(stem):
    if stem not in _cache:
        p = next(os.path.join(PHOTOS, f) for f in os.listdir(PHOTOS) if os.path.splitext(f)[0] == stem)
        _cache[stem] = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    return _cache[stem]

def kb_frame(stem, u, focus=(0.5, 0.5), z=(1.0, 1.10), pan=(0.0, 0.0)):
    """Ken Burns: u in [0,1] across the shot. Crop a 9:16 window around focus."""
    im = photo(stem); iw, ih = im.size
    zoom = z[0] + (z[1] - z[0]) * ease(u * 0.85 + 0.075)
    # largest 9:16 window that fits, then shrink by zoom
    bw = min(iw, ih * W / H); bh = bw * H / W
    cw, ch = bw / zoom, bh / zoom
    cx = focus[0] * iw + pan[0] * (u - 0.5) * cw
    cy = focus[1] * ih + pan[1] * (u - 0.5) * ch
    cx = min(max(cx, cw / 2), iw - cw / 2); cy = min(max(cy, ch / 2), ih - ch / 2)
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=box)

# Shots: (t0, t1, stem, opts). xf = crossfade-in seconds from previous shot.
B = 0.75  # one beat at 80 bpm
SHOTS = [
    # 1. Hook
    (0.0, 3.0, "33195531", dict(focus=(0.5, 0.45), z=(1.12, 1.0), xf=0)),
    (3.0, 6.0, "19733687", dict(focus=(0.5, 0.40), z=(1.0, 1.10), xf=0.5)),
    # 2. Problem montage (hard cuts on the beat)
    (6.0, 6.75, "19905189", dict(focus=(0.5, 0.5), z=(1.05, 1.12), xf=0.25)),
    (6.75, 7.5, "12912123", dict(focus=(0.5, 0.35), z=(1.05, 1.12))),
    (7.5, 8.25, "7034454", dict(focus=(0.5, 0.40), z=(1.05, 1.12))),
    (8.25, 12.0, "7320600", dict(focus=(0.55, 0.5), z=(1.0, 1.16), fx="drain")),
    # 3. Turn - brand card (rendered separately), shots resume at 15.0
    # 4. Reasons
    (15.0, 17.25, "6685153", dict(focus=(0.5, 0.42), z=(1.0, 1.08), xf=0.4)),
    (17.25, 19.5, "31307957", dict(focus=(0.5, 0.5), z=(1.10, 1.0), xf=0.35)),
    (19.5, 21.0, "34079355", dict(focus=(0.5, 0.5), z=(1.0, 1.08), xf=0.35)),
    (21.0, 22.5, "17023110", dict(focus=(0.5, 0.5), z=(1.08, 1.0), xf=0.3)),
    (22.5, 24.0, "12024173", dict(focus=(0.5, 0.45), z=(1.0, 1.08), xf=0.3)),
    (24.0, 25.5, "29703684", dict(focus=(0.5, 0.5), z=(1.0, 1.08), xf=0.35)),
    (25.5, 27.0, "28976228", dict(focus=(0.5, 0.55), z=(1.08, 1.0), xf=0.3)),
    (27.0, 28.5, "7162699", dict(focus=(0.42, 0.45), z=(1.0, 1.08), xf=0.3)),
    (28.5, 30.0, "5038739", dict(focus=(0.5, 0.5), z=(1.0, 1.08), xf=0.35)),
    (30.0, 31.5, "28589007", dict(focus=(0.5, 0.45), z=(1.08, 1.0), xf=0.3)),
    (31.5, 33.0, "17262009", dict(focus=(0.5, 0.5), z=(1.0, 1.08), xf=0.3)),
    (33.0, 34.5, "39797458", dict(focus=(0.5, 0.5), z=(1.0, 1.08), xf=0.35)),
    (34.5, 36.0, "169198", dict(focus=(0.5, 0.5), z=(1.08, 1.0), xf=0.3)),
    (36.0, 37.5, "30655516", dict(focus=(0.45, 0.5), z=(1.0, 1.08), xf=0.3)),
    # 5. Payoff
    (37.5, 40.9, "33608797", dict(focus=(0.5, 0.42), z=(1.0, 1.10), xf=0.4)),
]
BRAND_T = (12.0, 15.0)
END_T = (40.5, DUR)

# ------------------------------------------------------------------ text sprites
def sprite(lines, shadow=True, align="center", pad=40):
    """lines: [(text, font, color, tracking_px, gap_after)] -> RGBA image."""
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    def width(t, f, tr):
        return sum(tmp.textlength(c, font=f) for c in t) + tr * max(len(t) - 1, 0) if tr else tmp.textlength(t, font=f)
    metrics = []
    for t, f, col, tr, gap in lines:
        a, d = f.getmetrics(); metrics.append((width(t, f, tr), a + d, a))
    w = int(max(m[0] for m in metrics)) + pad * 2
    h = int(sum(m[1] + l[4] for m, l in zip(metrics, lines))) + pad * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(img)
    y = pad
    for (t, f, col, tr, gap), (tw, lh, asc) in zip(lines, metrics):
        x = pad + ((w - 2 * pad - tw) / 2 if align == "center" else 0)
        if tr:
            for c in t:
                dr.text((x, y), c, font=f, fill=col); x += tmp.textlength(c, font=f) + tr
        else:
            dr.text((x, y), t, font=f, fill=col)
        y += lh + gap
    if shadow:
        a = img.getchannel("A").filter(ImageFilter.GaussianBlur(10))
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0)); sh.putalpha(a.point(lambda v: int(v * 0.55)))
        img = Image.alpha_composite(sh, img)
    return img

# texts: (t0, t1, sprite, (cx, cy), anim)
TEXTS = []
def add(t0, t1, spr, cy, cx=W // 2, anim="rise"):
    TEXTS.append((t0, t1, spr, (cx, cy), anim))

add(0.5, 3.0, sprite([("Every love story", SCRIPT(128), WHITE, 0, 0)]), 1600)
add(3.3, 6.0, sprite([("deserves a", SERIF_I(66), WHITE, 0, 4), ("BEAUTIFUL BEGINNING", TITLE(78), WHITE, 6, 0)]), 1610)
add(6.0, 8.25, sprite([("But planning it?", SCRIPT(110), WHITE, 0, 0)]), 1130, anim="fade")
for i, word in enumerate(["VENUES.", "VENDORS.", "GUESTS.", "BUDGETS."]):
    add(6.0 + i * B + 0.05, 8.25, sprite([(word, TITLE(84), WHITE, 8, 0)]), 1290 + i * 118, anim="pop")
add(8.7, 12.0, sprite([("It can feel", SERIF_I(70), WHITE, 0, 6), ("OVERWHELMING.", TITLE(92), WHITE, 6, 0)]), 1560)

REASONS = [
    (15.0, 19.5, "01", "PERSONALISED PLANNING", ["Designed around your story,", "your style & your budget"]),
    (19.5, 24.0, "02", "BREATHTAKING DÉCOR", ["Mandaps, florals & lighting", "that wow every guest"]),
    (24.0, 28.5, "03", "TRUSTED VENDORS", ["Venue · Catering · Décor · Invitations", "all handled for you"]),
    (28.5, 33.0, "04", "SEAMLESS EXECUTION", ["Event flow & guest management,", "so you never have to worry"]),
    (33.0, 37.5, "05", "DESTINATION WEDDINGS", ["Bengaluru · Chennai · Hyderabad", "Kerala · Mahabalipuram · Sri Lanka"]),
]
for t0, t1, num, title, sub in REASONS:
    add(t0 + 0.15, t1, sprite([(num, SCRIPT(150), BLUSH, 0, 0)]), 1270, anim="fade")
    add(t0 + 0.3, t1, sprite([(title, TITLE(76), WHITE, 5, 0)]), 1420)
    add(t0 + 0.55, t1, sprite([(s, SERIF_I(58), WHITE, 0, 2) for s in sub]), 1570, anim="fade")
LABEL = sprite([("WHY COUPLES CHOOSE", SANS(30), WHITE, 9, 2), ("Sundarlysh", SCRIPT(92), WHITE, 0, 0)])
add(15.0, 37.5, LABEL, 250, anim="fade")

add(37.8, 40.6, sprite([("You live every moment.", SERIF_I(70), WHITE, 0, 18), ("WE TAKE CARE", TITLE(88), WHITE, 6, 4), ("OF THE REST", TITLE(88), WHITE, 6, 0)]), 1600)

# brand card (12-15s)
BRAND_TXT = sprite([("That's where", SCRIPT(120), ROSE, 0, 0), ("WE COME IN", TITLE(80), INK, 8, 0)], shadow=False)

# ------------------------------------------------------------------ overlays
def vgrad(top_a, bot_a, y0, y1):
    a = np.zeros((H, 1), np.float32)
    ys = np.arange(H)[:, None]
    t = np.clip((ys - y0) / max(y1 - y0, 1), 0, 1)
    a = top_a + (bot_a - top_a) * (t * t * (3 - 2 * t))
    g = np.zeros((H, W, 4), np.uint8); g[..., 3] = (np.repeat(a, W, 1) * 255).astype(np.uint8)
    return Image.fromarray(g, "RGBA")
GRAD_BOTTOM = vgrad(0.0, 0.78, 760, 1920)
GRAD_TOP = vgrad(0.55, 0.0, 0, 520)
GRAD_DARK = vgrad(0.0, 0.45, 600, 1300)
GRAD_MID = Image.alpha_composite(vgrad(0.0, 0.55, 300, 1000), vgrad(0.0, 0.0, 0, 1))

LOGO_IM = Image.open(LOGO).convert("RGB")
def logo_block(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS)
    m = np.ones(size, np.float32); r = max(size // 9, 1); ramp = np.linspace(0, 1, r)
    m[:r] = ramp; m[-r:] = ramp[::-1]
    mask = Image.fromarray((np.minimum.outer(m, m) * 255).astype(np.uint8))
    return lg, mask
LOGO_BRAND = logo_block(820)
LOGO_END = logo_block(900)

END_LINES = [
    (sprite([("Care with Style", SCRIPT(104), ROSE, 0, 0)], shadow=False), 1270, 0.5),
    (sprite([("WEDDING PLANNING  ·  DÉCOR  ·  DESTINATION WEDDINGS", SANS(25), INK, 4, 0)], shadow=False), 1385, 0.8),
]
def button():
    t = sprite([("DM US TO PLAN YOUR DREAM WEDDING", SANS(30), WHITE, 5, 0)], shadow=False, pad=0)
    bw, bh = t.width + 110, t.height + 62
    b = Image.new("RGBA", (bw, bh), (0, 0, 0, 0)); d = ImageDraw.Draw(b)
    d.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=bh // 2, fill=ROSE + (255,))
    b.alpha_composite(t, ((bw - t.width) // 2, (bh - t.height) // 2 - 4)); return b
END_LINES += [(button(), 1530, 1.1),
              (sprite([("@sundarlyshevents", SERIF(52), INK, 1, 0)], shadow=False), 1660, 1.35)]

# ------------------------------------------------------------------ compositing
def paste_alpha(base, spr, xy, alpha):
    if alpha <= 0: return
    if alpha < 1:
        spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * alpha)))
    base.alpha_composite(spr, (int(xy[0]), int(xy[1])))

def shot_frame(t):
    cur = [s for s in SHOTS if s[0] <= t < s[1]]
    if not cur: return None
    t0, t1, stem, o = cur[0]
    kb = {k: o[k] for k in ("focus", "z", "pan") if k in o}
    fr = kb_frame(stem, (t - t0) / (t1 - t0), **kb)
    if o.get("fx") == "drain":   # desaturate + darken towards the end
        k = ease((t - t0 - 0.4) / (t1 - t0 - 0.4))
        g = ImageOps.grayscale(fr).convert("RGB")
        fr = Image.blend(fr, g, 0.85 * k)
        fr = Image.blend(fr, Image.new("RGB", fr.size, (0, 0, 0)), 0.35 * k)
    xf = o.get("xf", 0)
    if xf and t - t0 < xf:
        prev = [s for s in SHOTS if abs(s[1] - t0) < 1e-6]
        if prev:
            p0, p1, ps, po = prev[0]
            pkb = {k: po[k] for k in ("focus", "z", "pan") if k in po}
            pf = kb_frame(ps, min((t - p0) / (p1 - p0), 1.0), **pkb)
            fr = Image.blend(pf, fr, ease((t - t0) / xf))
    return fr

def text_layer(base, t):
    for t0, t1, spr, (cx, cy), anim in TEXTS:
        if not (t0 <= t < t1): continue
        fin, fout = ease((t - t0) / 0.45), ease((t1 - t) / 0.3)
        a = min(fin, fout); dy = 0
        if anim == "rise": dy = (1 - fin) * 40
        if anim == "pop": a = min(ease((t - t0) / 0.18), fout); dy = (1 - ease((t - t0) / 0.18)) * 18
        paste_alpha(base, spr, (cx - spr.width / 2, cy - spr.height / 2 + dy), a)

def brand_frame(t):
    u = t - BRAND_T[0]
    fr = Image.new("RGBA", (W, H), CREAM + (255,))
    lg, m = LOGO_BRAND; s = 1.0 + 0.04 * ease(u / 3)
    sz = int(820 * s); lg2 = lg.resize((sz, sz), Image.BILINEAR); m2 = m.resize((sz, sz), Image.BILINEAR)
    m2 = m2.point(lambda v: int(v * ease((u - 0.9) / 0.6)))
    fr.paste(lg2, ((W - sz) // 2, 900 - sz // 2 + 120), m2)
    a = min(ease((u - 0.15) / 0.5), 1.0)
    paste_alpha(fr, BRAND_TXT, ((W - BRAND_TXT.width) / 2, 330 + (1 - a) * 30), a)
    flash = 1 - ease(u / 0.35)          # white flash in
    if flash > 0: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 255, 255, 255)), flash)
    return fr

def end_frame(t, under):
    u = t - END_T[0]
    fr = Image.new("RGBA", (W, H), CREAM + (255,))
    lg, m = LOGO_END; s = 1.0 + 0.03 * ease(u / 3)
    sz = int(900 * s); lg2 = lg.resize((sz, sz), Image.BILINEAR); m2 = m.resize((sz, sz), Image.BILINEAR)
    fr.paste(lg2, ((W - sz) // 2, 700 - sz // 2), m2)
    for spr, cy, delay in END_LINES:
        a = ease((u - delay) / 0.5)
        paste_alpha(fr, spr, ((W - spr.width) / 2, cy - spr.height / 2 + (1 - a) * 24), a)
    k = ease(u / 0.6)                   # dissolve from the payoff shot
    if k < 1 and under is not None:
        fr = Image.blend(under.convert("RGBA"), fr, k)
    return fr

def render(t):
    if BRAND_T[0] <= t < BRAND_T[1]:
        fr = brand_frame(t)
        # dissolve out of the brand card into reasons is handled by xf of next shot? do it here
        return fr.convert("RGB")
    base = shot_frame(t)
    if END_T[0] <= t:
        return end_frame(t, base).convert("RGB")
    fr = base.convert("RGBA")
    if t >= 15.0 and t < 37.5:
        fr.alpha_composite(GRAD_BOTTOM); fr.alpha_composite(GRAD_TOP)
    elif 6.0 <= t < 12.0:
        fr.alpha_composite(GRAD_DARK); fr.alpha_composite(GRAD_BOTTOM)
    else:
        fr.alpha_composite(GRAD_BOTTOM)
    if 15.0 <= t < 15.45:              # cream -> photo dissolve after brand card
        cream = brand_frame(14.999)
        fr = Image.blend(cream, fr, ease((t - 15.0) / 0.45))
    text_layer(fr, t)
    if t < 0.6:                          # fade in from black
        fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / 0.6))
    return fr.convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for t in PREVIEW:
        render(t).save(os.path.join(OUT, f"p_{t:05.2f}.jpg"), quality=88)
    sys.exit()

n = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-ss", str(MUSIC_START), "-t", str(DUR), "-i", MUSIC,
    "-map", "0:v", "-map", "1:a",
    "-af", f"afade=t=in:d=0.8,afade=t=out:st={DUR-3.2}:d=3.2,loudnorm=I=-15:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for i in range(n):
    ff.stdin.write(render(i / FPS).tobytes())
    if i % 150 == 0: print(f"{i}/{n}", file=sys.stderr, flush=True)
ff.stdin.close(); ff.wait(); print("done", OUT)
