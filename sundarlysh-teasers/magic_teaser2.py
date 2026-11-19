"""Sundarlysh Memories – 'Something magical is coming to Hyderabad' teaser (1080x1920, 30fps, 20 s).
Audio: original 120 bpm Christmas EDM track from magic_beat.py (beat.wav), every hit on the cut grid.
usage: magic_teaser2.py <out.mp4> <beat.wav> [--preview ...]
usage: magic_teaser.py <out.mp4> [--preview t1,t2,...]
"""
import sys, os, math, random, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance

S = "/tmp/claude-0/-home-user-Claude-Public-/e6dc3aa3-d0dd-5e70-ae91-a743f4ec6241/scratchpad"
OUT = sys.argv[1]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
B = 0.5; DUR = 40 * B; M0 = 2.450
MUSIC = f"{S}/v9/music/wish.mp3"; FONTS = f"{S}/assets/fonts"; LOGO = f"{S}/v7/logo.jpg"
P7, P4 = f"{S}/v7/photos/", f"{S}/v4/photos/"
PLUM_D, GOLD, GOLD_L = (30, 0, 16), (201, 165, 94), (240, 216, 160)

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
def back(x): x = min(max(x, 0.0), 1.0); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
FOIL = [(0, (150, 112, 46)), (.22, (246, 225, 166)), (.42, (196, 154, 76)), (.6, (255, 243, 205)), (.8, (182, 139, 62)), (1, (236, 211, 146))]
def foil(w, h):
    xs = np.linspace(0, 1, w); g = np.zeros((w, 3))
    for (p0, c0), (p1, c1) in zip(FOIL, FOIL[1:]):
        m = (xs >= p0) & (xs <= p1); k = ((xs - p0) / (p1 - p0))[:, None]; g[m] = (np.array(c0) * (1 - k) + np.array(c1) * k)[m]
    return Image.fromarray(np.repeat(g[None], h, 0).astype(np.uint8))
def text_img(s, f, col, tr=0, glow=0.0, pad=40, gold=False):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if gold: im = Image.merge("RGBA", (*foil(w, h).split(), im.getchannel("A")))
    if glow:
        al = im.getchannel("A")
        g = Image.new("RGBA", im.size, GOLD_L + (0,)); g.putalpha(al.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * glow)))
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.putalpha(al.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * .6)))
        im = Image.alpha_composite(Image.alpha_composite(sh, g), im)
    return im
def fit(s, mk, size, maxw, tr=0):
    while size > 18 and tw(s, mk(size), tr) > maxw: size -= 2
    return mk(size)
def paste(base, spr, x, y, a=1.0):
    if a <= 0.003: return
    if a < 0.997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    base.alpha_composite(spr, (int(round(x)), int(round(y))))
def scaled(spr, s): return spr.resize((max(1, int(spr.width * s)), max(1, int(spr.height * s))), Image.BILINEAR)
def shimmer(spr, u):
    """light sweep across text, u 0..1"""
    w, h = spr.size; x = np.arange(w)[None, :]; c = (u * 1.6 - .3) * w
    band = np.clip(1 - np.abs(x - c - (np.arange(h)[:, None] * .35)) / (w * .08), 0, 1)
    al = np.asarray(spr.getchannel("A")).astype(np.float32) / 255
    rgb = np.asarray(spr.convert("RGB")).astype(np.float32)
    rgb = rgb + (255 - rgb) * (band * .75)[..., None] * (al[..., None] > .1)
    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).convert("RGBA"); out.putalpha(spr.getchannel("A")); return out
def pill(txt, size=34):
    t_ = text_img(txt, SANS(size), PLUM_D, tr=6, pad=0); w, h = t_.width + 90, t_.height + 44
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=255)
    im = Image.merge("RGBA", (*foil(w, h).split(), m)); im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 3)); return im

# ---------------------------------------------------------------- backgrounds & particles
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
_r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * .45) / H) ** 2)[..., None]
k = np.clip((_r - .08) * 1.6, 0, 1)
PLUMBG = Image.fromarray((np.array((118, 22, 70)) * (1 - k) + np.array(PLUM_D) * k).astype(np.uint8)).convert("RGBA")
VIG = Image.fromarray(np.dstack([np.zeros((H, W, 3)), np.clip((_r[..., 0] - .25) * 1.5, 0, 1) * 255]).astype(np.uint8), "RGBA")
rng = random.Random(4)
DUST = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(1.5, 5), rng.uniform(25, 90), rng.uniform(0, 6.3), rng.uniform(1.5, 4)) for _ in range(150)]
def dust(base, t, amt=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x0, y0, r, sp, ph, tf in DUST:
        yy = (y0 - t * sp) % (H + 20) - 10; xx = x0 + 18 * math.sin(t * .7 + ph)
        a = (.35 + .65 * max(0, math.sin(t * tf + ph))) * amt
        d.ellipse((xx - r, yy - r, xx + r, yy + r), fill=GOLD_L + (int(230 * a),))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(2.5))); base.alpha_composite(lay)
BURST = [(rng.uniform(0, 2 * math.pi), rng.uniform(.3, 1), rng.uniform(3, 9)) for _ in range(90)]
def burst(base, u, cx=W / 2, cy=H * .45):
    if not 0 <= u < 1.4: return
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for ang, dist, r in BURST:
        rr = eout(u / 1.2) * 760 * dist; a = 1 - ease(u / 1.4)
        xx, yy = cx + rr * math.cos(ang), cy + rr * math.sin(ang) + 120 * u * u
        d.ellipse((xx - r, yy - r, xx + r, yy + r), fill=GOLD_L + (int(255 * a),))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(3))); base.alpha_composite(lay)

_ph = {}
def photo(p):
    if p not in _ph: _ph[p] = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    return _ph[p]
def kb(p, z):
    im = photo(p); iw, ih = im.size; bw = min(iw, ih * W / H); bh = bw * H / W; cw, ch = bw / z, bh / z
    return im.resize((W, H), Image.BILINEAR, box=(iw / 2 - cw / 2, ih / 2 - ch / 2, iw / 2 + cw / 2, ih / 2 + ch / 2))

LOGO_IM = Image.open(LOGO).convert("RGB")
def logo(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS).convert("RGBA")
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32); r = np.sqrt((xx - size / 2) ** 2 + (yy - size / 2) ** 2) / (size / 2)
    lg.putalpha(Image.fromarray((np.clip((1 - r) / .14, 0, 1) * 255).astype(np.uint8))); return lg
LOGO_L = logo(620)

# ---------------------------------------------------------------- sprites
M1 = text_img("Something", PLAYI(130, 800), GOLD_L, glow=.8)
M2 = text_img("magical...", PLAYI(150, 800), GOLD_L, glow=.8)
M3 = text_img("is coming to", PLAYI(84, 600), (255, 244, 236), glow=.5)
M4 = text_img("HYDERABAD", fit("HYDERABAD", CINZEL, 150, W - 200, 10), (255, 255, 255), tr=10, glow=.9, gold=True)
NUMS = [24, 21, 18, 15, 12, 9, 6, 3, 2, 1]
NUM_SPR = {n: text_img(str(n), CINZEL(420, 800), (255, 255, 255), glow=1.0, gold=True, pad=60) for n in NUMS}
R1 = pill("FIRST TIME EVER IN HYDERABAD", 34)
R2 = text_img("The Christmas", PLAYI(104, 800), GOLD_L, glow=.6)
R3 = text_img("ADVENT CALENDAR", fit("ADVENT CALENDAR", CINZEL, 98, W - 120, 6), (255, 255, 255), tr=6, glow=.7, gold=True)
R4 = text_img("WORKSHOP", CINZEL(132), (255, 255, 255), tr=16, glow=.7, gold=True)
R5 = text_img("24 little surprises, made by you", PLAYI(56, 600), (255, 244, 236), glow=.3)
D1 = text_img("SAVE THE DATE", SANS(36), GOLD_L, tr=9)
D2 = text_img("SUNDAY", CINZEL(70), (255, 240, 230), tr=14)
D3 = text_img("29 NOVEMBER", CINZEL(118), (255, 255, 255), tr=6, glow=.7, gold=True)
D4 = text_img("Van Lavino Café & Patisserie", fit("Van Lavino Café & Patisserie", PLAYI, 70, W - 160), GOLD_L, glow=.3)
D5 = text_img("FINANCIAL DISTRICT, HYDERABAD", fit("FINANCIAL DISTRICT, HYDERABAD", SANS, 40, W - 160, 3), (255, 255, 255), tr=3)
E1 = text_img("COMING SOON", CINZEL(96), (255, 255, 255), tr=14, glow=.8, gold=True)
E2 = text_img("@sundarlyshmemories", SANS(52, 700), (255, 255, 255), tr=1)
E3 = text_img("Stay tuned", PLAYI(64, 600), GOLD_L)

MONT = [P7 + "a_props.jpg", P7 + "a_fill.jpg", P7 + "a_decor.jpg", P4 + "c2_paint.jpg", P7 + "a_box.jpg", P4 + "v4_glow.jpg", P4 + "p4_final.jpg", P7 + "a_friends.jpg",
        P4 + "c4_final.jpg", P7 + "a_group.jpg"]


# ---------------------------------------------------------------- beat sync
KICKS = [k * B for k in range(8)] + [4.0, 4.5] + [6 + k * B for k in range(10)] + [12 + k * B for k in range(14)] + [19.0]
def pulse(t):
    ks = [k for k in KICKS if k <= t + 1e-6]
    return math.exp(-(t - ks[-1]) / .11) if ks else 0.0
_gy, _gx = np.mgrid[0:H, 0:W].astype(np.float32)
_ga = np.clip(1 - np.sqrt(((_gx - W / 2) / (W * .7)) ** 2 + ((_gy - H * .45) / (H * .45)) ** 2), 0, 1) ** 1.5
GLOW_LV = {}
def glow_at(p):
    q = round(p * 8) / 8
    if q not in GLOW_LV:
        GLOW_LV[q] = Image.fromarray(np.dstack([np.full((H, W), 255), np.full((H, W), 214), np.full((H, W), 160), _ga * 70 * q]).astype(np.uint8), "RGBA")
    return GLOW_LV[q]
HITS = [(4.0, 10), (6.0, 26), (12.0, 30), (13.5, 12), (19.0, 22)]
def shake(fr, t):
    for t0, amp in HITS:
        u = t - t0
        if 0 <= u < .35:
            a = amp * math.exp(-u / .1); dx = int(a * math.sin(u * 95)); dy = int(a * math.cos(u * 77))
            big = fr.resize((W + 64, H + 114), Image.BILINEAR)
            return big.crop((32 + dx, 57 + dy, 32 + dx + W, 57 + dy + H))
    return fr

# ---------------------------------------------------------------- scenes (t in seconds)
def mystery(t):
    if t < 2.0: img, z = P4 + "h_table.jpg", 1.25 - .08 * ease(t / 2)
    elif t < 4.0: img, z = P7 + "a_open.jpg", 1.15 - .06 * ease((t - 2) / 2)
    else: img, z = P7 + "a_board.jpg", 1.20 - .10 * ease((t - 4) / 2)
    p = pulse(t) * (.5 if t < 4 else 1.0)
    fr = kb(img, z * (1 + .03 * p))
    fr = ImageEnhance.Brightness(fr).enhance(.32 + .10 * math.sin(t * 2.2) ** 2 + .16 * p).convert("RGBA")
    fr.alpha_composite(VIG); dust(fr, t, 1.0)
    if t < 2.0:
        u = t
        paste(fr, M1, (W - M1.width) / 2, 760 + (1 - eout(u / .8)) * 30, ease((u - .1) / .6))
        m2 = shimmer(M2, (u - .7) / 1.1) if u > .7 else M2
        paste(fr, m2, (W - M2.width) / 2, 900 + (1 - eout((u - .5) / .8)) * 30, ease((u - .5) / .6))
    elif t < 4.0:
        u = t - 2
        paste(fr, M3, (W - M3.width) / 2, 880 + (1 - eout(u / .8)) * 30, ease(u / .5) * ease((2 - u) / .25))
    else:
        u = t - 4; sc = 1.25 - .25 * eout(u / 1.2)
        m4 = scaled(shimmer(M4, (u - .4) / 1.2) if u > .4 else M4, sc)
        paste(fr, m4, (W - m4.width) / 2, H / 2 - m4.height / 2, ease(u / .1))
    if t < .15: fr = Image.blend(Image.new("RGBA", (W, H), (0, 0, 0, 255)), fr, ease(t / .15))
    return fr

def montage(t):
    u = t - 6.0
    i = int(u / B) if u < 4.0 else 8 + int((u - 4.0) / (2 * B))
    i = min(i, 9); t0 = 6.0 + (i * B if i < 8 else 4.0 + (i - 8) * 2 * B); du = t - t0; dur = B if i < 8 else 2 * B
    fr = kb(MONT[i], 1.03 + .12 * (1 - eout(du / .35))).convert("RGBA")
    fr = Image.alpha_composite(fr, Image.new("RGBA", (W, H), (20, 0, 10, 110))); fr.alpha_composite(VIG); dust(fr, t, .6)
    n = NUM_SPR[NUMS[i]]; s = 1.0 + .35 * (1 - eout(du / .25))
    sp = scaled(n, s); paste(fr, sp, (W - sp.width) / 2, H / 2 - sp.height / 2 - 40, ease(du / .08) * ease((dur - du) / .06 + .3))
    if du < .09: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 248, 235, 255)), .55 * (1 - du / .09))
    return fr

def reveal(t):
    u = t - 12.0; fr = PLUMBG.copy(); dust(fr, t, .9); burst(fr, u)
    yy = 520
    for i, (sp, gap) in enumerate(((R1, 70), (R2, -40), (R3, -30), (R4, 40), (R5, 0))):
        d0 = .05 + i * .18
        if i == 0: sp2 = scaled(sp, .6 + .4 * back((u - d0) / .4)); paste(fr, sp2, (W - sp2.width) / 2, yy + (sp.height - sp2.height) / 2, ease((u - d0) / .15))
        else:
            spx = shimmer(sp, (u - d0 - .4) / 1.2) if i in (2, 3) and u > d0 + .4 else sp
            paste(fr, spx, (W - sp.width) / 2, yy + (1 - eout((u - d0) / .45)) * 50, ease((u - d0) / .3))
        yy += sp.height + gap
    if u < .14: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 250, 240, 255)), .9 * (1 - u / .14))
    return fr

def date_card(t):
    u = t - 16.0; fr = PLUMBG.copy(); dust(fr, t, .8)
    d = ImageDraw.Draw(fr); kk = eout(u / .5); m = int(90 + (1 - kk) * 40)
    d.rounded_rectangle((m, 560, W - m, 1360), 30, outline=GOLD + (int(255 * kk),), width=5)
    d.rounded_rectangle((m + 18, 578, W - m - 18, 1342), 22, outline=GOLD_L + (int(140 * kk),), width=2)
    yy = 620
    for i, (sp, gap) in enumerate(((D1, -10), (D2, -30), (D3, 30), (D4, -24), (D5, 0))):
        d0 = .08 + i * .14; paste(fr, sp, (W - sp.width) / 2, yy + (1 - eout((u - d0) / .4)) * 34, ease((u - d0) / .25)); yy += sp.height + gap
    if u < .12: fr = Image.blend(Image.alpha_composite(reveal(15.999), Image.new("RGBA", (W, H), (0, 0, 0, 0))), fr, ease(u / .12))
    return fr

def end_card(t):
    u = t - 18.0; fr = PLUMBG.copy(); dust(fr, t, .9)
    burst(fr, t - 19.0, cy=640)
    lg = scaled(LOGO_L, (.85 + .15 * back(u / .5)) * (1 + .04 * pulse(t))); paste(fr, lg, (W - lg.width) / 2, 640 - lg.height / 2, ease(u / .2))
    e1 = shimmer(E1, (u - .4) / 1.0) if u > .4 else E1
    paste(fr, e1, (W - E1.width) / 2, 1010 + (1 - eout((u - .15) / .4)) * 40, ease((u - .15) / .25))
    paste(fr, E3, (W - E3.width) / 2, 1160, ease((u - .4) / .3))
    paste(fr, E2, (W - E2.width) / 2, 1290, ease((u - .55) / .3))
    if u < .12: fr = Image.blend(date_card(17.999), fr, ease(u / .12))
    if t > DUR - .35: fr = Image.blend(fr, Image.new("RGBA", (W, H), (0, 0, 0, 255)), ease((t - (DUR - .35)) / .35))
    return fr

def render(t):
    if t < 6.0: fr = mystery(t)
    elif t < 12.0: fr = montage(t)
    elif t < 16.0: fr = reveal(t)
    elif t < 18.0: fr = date_card(t)
    else: fr = end_card(t)
    p = pulse(t)
    if t >= 12 and p > .02:
        fr.alpha_composite(glow_at(p))
    fr = shake(fr, t)
    return fr.convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW: render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=86)
    sys.exit()

# ---------------------------------------------------------------- encode
BEAT = sys.argv[2]
nfr = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", BEAT, "-filter_complex", "[1:a]loudnorm=I=-13:TP=-1.0:LRA=9,aresample=44100[a]", "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "192k", "-ar", "44100", "-ac", "2", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(nfr): ff.stdin.write(render(i / FPS).tobytes())
ff.stdin.close(); ff.wait(); print("done", OUT, DUR)
