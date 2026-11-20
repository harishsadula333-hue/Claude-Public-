"""Multi-style reel engine: each video gets its own look + music.
usage: styled_reel.py <spec.json> <out.mp4> [--preview t1,t2,...]
spec: {style, music, start, beat, scenes:[{type:title|photo|duo|video|end, beats, img|imgs|src, top, main, sub}]}
styles: ivory (wedding cinema), fashion (magazine cover), floral (blush + petals), neon (party),
        haldi (marigold polaroid), royal (emerald + gold mandala), scrapbook (kraft + polaroids)"""
import sys, os, json, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance

S = "/tmp/claude-0/-home-user-Claude-Public-/e6dc3aa3-d0dd-5e70-ae91-a743f4ec6241/scratchpad"
SPEC = json.load(open(sys.argv[1])); OUT = sys.argv[2]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30
FD = f"{S}/assets/fonts"; LOGO = f"{S}/v7/logo.jpg"; STYLE = SPEC["style"]; BEAT = SPEC["beat"]
rng = random.Random(7)

# ------------------------------------------------------------------ helpers
def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x, c=1.9): x = min(max(x, 0.0), 1.0); return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
_fc = {}
def font(name, size, var=None):
    k = (name, size, str(var))
    if k not in _fc:
        f = ImageFont.truetype(f"{FD}/{name}", size)
        if var is not None:
            try: f.set_variation_by_axes(var if isinstance(var, list) else [var])
            except Exception: pass
        _fc[k] = f
    return _fc[k]
_tc = {}
def text(s, fname, size, col, var=None, tr=0, shadow=0.0, glow=None, glow_r=18, stroke=0, stroke_col=(0, 0, 0)):
    k = (s, fname, size, col, str(var), tr, shadow, glow, glow_r, stroke, stroke_col)
    if k in _tc: return _tc[k]
    f = font(fname, size, var); d0 = ImageDraw.Draw(Image.new("L", (1, 1)))
    if tr: w = sum(d0.textlength(c, font=f) for c in s) + tr * (len(s) - 1)
    else: w = d0.textlength(s, font=f)
    a, de = f.getmetrics(); pad = 40 + glow_r + stroke; im_w, im_h = int(w) + 2 * pad, a + de + 2 * pad
    m = Image.new("L", (im_w, im_h), 0); d = ImageDraw.Draw(m); x = pad
    if tr:
        for c in s: d.text((x, pad), c, font=f, fill=255, stroke_width=stroke, stroke_fill=255); x += d0.textlength(c, font=f) + tr
    else: d.text((pad, pad), s, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
    bb = m.getbbox() or (0, 0, im_w, im_h); m = m.crop((max(0, bb[0] - pad // 2), max(0, bb[1] - pad // 2), min(im_w, bb[2] + pad // 2), min(im_h, bb[3] + pad // 2)))
    im = Image.new("RGBA", m.size, col + (0,))
    if stroke:
        inner = Image.new("L", (im_w, im_h), 0); di = ImageDraw.Draw(inner); x = pad
        if tr:
            for c in s: di.text((x, pad), c, font=f, fill=255); x += d0.textlength(c, font=f) + tr
        else: di.text((pad, pad), s, font=f, fill=255)
        inner = inner.crop((max(0, bb[0] - pad // 2), max(0, bb[1] - pad // 2), min(im_w, bb[2] + pad // 2), min(im_h, bb[3] + pad // 2)))
        base = Image.new("RGBA", m.size, stroke_col + (0,)); base.putalpha(m); top = Image.new("RGBA", m.size, col + (0,)); top.putalpha(inner)
        im = Image.alpha_composite(base, top)
    else: im.putalpha(m)
    layers = []
    if shadow:
        sh = Image.new("RGBA", m.size, (0, 0, 0, 0)); sm = Image.new("L", m.size, 0); sm.paste(im.getchannel("A"), (0, 6))
        sh.putalpha(sm.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * shadow))); layers.append(sh)
    if glow:
        g = Image.new("RGBA", m.size, glow + (0,)); g.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(glow_r)).point(lambda v: min(255, int(v * 1.6)))); layers.append(g)
    for l in layers: l.alpha_composite(im); im = l
    _tc[k] = im; return im
def fit(s, fname, col, maxw, size=200, **kw):
    while size > 16:
        sp = text(s, fname, size, col, **kw)
        if sp.width <= maxw: return sp
        size = int(size * .94)
    return sp
def paste(fr, sp, cx, cy, a=1.0, s=1.0, rot=0):
    if a <= .004 or sp is None: return
    if abs(s - 1) > .002: sp = sp.resize((max(1, int(sp.width * s)), max(1, int(sp.height * s))), Image.BILINEAR)
    if rot: sp = sp.rotate(rot, expand=True, resample=Image.BICUBIC)
    if a < .996: sp = sp.copy(); sp.putalpha(sp.getchannel("A").point(lambda v: int(v * a)))
    fr.alpha_composite(sp, (int(cx - sp.width / 2), int(cy - sp.height / 2)))
_pc = {}
def photo(p, w, h):
    k = (p, w, h)
    if k not in _pc:
        im = ImageOps.exif_transpose(Image.open(p)).convert("RGB"); _pc[k] = ImageOps.fit(im, (int(w * 1.12), int(h * 1.12)), Image.LANCZOS)
    return _pc[k]
def kb(p, w, h, u, z0=1.0, z1=1.08, dx=0.0):
    if isinstance(p, dict):                        # real video clip: {"src", "in", "dur"}
        z = z0 + (z1 - z0) * ease(u); f = video_frame(p["src"], p.get("in", 0) + u * p.get("dur", 3), int(w * 1.1), int(h * 1.1))
        cw, ch = f.width / z / 1.1 * 1.0, f.height / z / 1.1
        return f.crop((int(f.width / 2 - cw / 2), int(f.height / 2 - ch / 2), int(f.width / 2 + cw / 2), int(f.height / 2 + ch / 2))).resize((w, h), Image.BILINEAR)
    im = photo(p, w, h); z = z0 + (z1 - z0) * ease(u); cw, ch = im.width / 1.12 / z * 1.0, im.height / 1.12 / z
    cx = im.width / 2 + dx * (im.width - cw) / 2 * (u - .5) * 2; cy = im.height / 2
    return im.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2))).resize((w, h), Image.BILINEAR).convert("RGBA")
def round_mask(w, h, r):
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255); return m
def arch_mask(w, h):
    m = Image.new("L", (w, h), 0); d = ImageDraw.Draw(m); d.rectangle((0, w // 2, w, h), fill=255); d.ellipse((0, 0, w - 1, w - 1), fill=255); return m
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def vgrad(c1, c2):
    k = (yy / H)[..., None]; return Image.fromarray((np.array(c1) * (1 - k) + np.array(c2) * k).astype(np.uint8)).convert("RGBA")
def rgrad(c1, c2, cy=.45, sc=1.5):
    k = np.clip(np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * cy) / H) ** 2) * sc, 0, 1)[..., None]
    return Image.fromarray((np.array(c1) * (1 - k) + np.array(c2) * k).astype(np.uint8)).convert("RGBA")
def noise_tex(base, amt, seed=1, blur=0):
    r = np.random.default_rng(seed).normal(0, amt, (H, W)).astype(np.float32)
    if blur: r = np.asarray(Image.fromarray(np.clip(r + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) - 128
    a = np.asarray(base.convert("RGB")).astype(np.float32) + r[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert("RGBA")
LOGO_IM = Image.open(LOGO).convert("RGB")
def logo(size, ring=None):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS).convert("RGBA")
    r = np.sqrt((np.mgrid[0:size, 0:size][1] - size / 2) ** 2 + (np.mgrid[0:size, 0:size][0] - size / 2) ** 2) / (size / 2)
    lg.putalpha(Image.fromarray((np.clip((1 - r) / .06, 0, 1) * 255).astype(np.uint8)))
    if ring:
        out = Image.new("RGBA", (size + 20, size + 20), (0, 0, 0, 0)); ImageDraw.Draw(out).ellipse((0, 0, size + 19, size + 19), fill=ring + (255,))
        out.alpha_composite(lg, (10, 10)); return out
    return lg
_vf = {}
def video_frame(src, t_in, w, h):
    k = (src, round(t_in * FPS))
    if k not in _vf:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t_in:.3f}", "-i", src, "-frames:v", "1", "-vf", f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        _vf[k] = Image.frombytes("RGB", (w, h), raw).convert("RGBA")
    return _vf[k]

# particles
PETALS = [(rng.uniform(0, W), rng.uniform(-H, H), rng.uniform(14, 30), rng.uniform(70, 150), rng.uniform(0, 6.3), rng.choice([(214, 76, 104), (236, 128, 150), (190, 30, 60), (250, 200, 210)])) for _ in range(46)]
def petals(fr, t, amt=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x0, y0, r, sp, ph, c in PETALS:
        y = (y0 + t * sp) % (H + 80) - 40; x = x0 + 40 * math.sin(t * .9 + ph); a = t * 1.5 + ph
        e = [(x + r * math.cos(a + q) * (1 if i % 2 == 0 else .45), y + r * math.sin(a + q) * (1 if i % 2 == 0 else .45)) for i, q in enumerate(np.linspace(0, 2 * math.pi, 12, endpoint=False))]
        d.polygon(e, fill=c + (int(220 * amt),))
    fr.alpha_composite(lay.filter(ImageFilter.GaussianBlur(1)))
SPARK = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(2, 5), rng.uniform(0, 6.3)) for _ in range(90)]
def sparkles(fr, t, col, amt=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x, y, r, ph in SPARK:
        a = max(0, math.sin(t * 4 + ph)) * amt
        if a > .05: d.ellipse((x - r, y - r, x + r, y + r), fill=col + (int(255 * a),))
    fr.alpha_composite(lay.filter(ImageFilter.GaussianBlur(1.5))); fr.alpha_composite(lay)
def burst(fr, u, col, cx=W / 2, cy=H / 2, n=60, seed=3):
    if not 0 <= u < 1: return
    r = random.Random(seed); lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for _ in range(n):
        ang = r.uniform(0, 2 * math.pi); dist = eout(u) * r.uniform(200, 800); s = r.uniform(3, 8) * (1 - u)
        x, y = cx + dist * math.cos(ang), cy + dist * math.sin(ang) + 300 * u * u
        d.ellipse((x - s, y - s, x + s, y + s), fill=col + (int(255 * (1 - u)),))
    fr.alpha_composite(lay)

# ------------------------------------------------------------------ STYLES
# each style: bg(t), scene renderers. common signature render(sc, u, dur, t) where u = seconds into scene
def two_lines(fr, sc, y, top_spec, main_spec, sub_spec, u, delay=0.0, anim="up", maxw=W - 140):
    yy_ = y
    for i, (key, spec) in enumerate((("top", top_spec), ("main", main_spec), ("sub", sub_spec))):
        s = sc.get(key)
        if not s or not spec: continue
        fname, size, col, kw, gap = spec
        lines = s.split("\n")
        for ln in lines:
            sp = fit(ln, fname, col, maxw, size, **kw); d0 = delay + i * .12
            k = eout((u - d0) / .45)
            if anim == "up": paste(fr, sp, W / 2, yy_ + sp.height / 2 + (1 - k) * 40, a=ease((u - d0) / .3))
            elif anim == "pop": paste(fr, sp, W / 2, yy_ + sp.height / 2, a=ease((u - d0) / .1), s=.6 + .4 * back((u - d0) / .35))
            elif anim == "stamp": paste(fr, sp, W / 2, yy_ + sp.height / 2, a=ease((u - d0) / .08), s=1.35 - .35 * eout((u - d0) / .18))
            elif anim == "fade": paste(fr, sp, W / 2, yy_ + sp.height / 2, a=ease((u - d0) / .5))
            yy_ += sp.height + gap
    return yy_

# ---------------- ivory: cinematic wedding editorial
IVORY, BROWN, GOLD = (247, 240, 229), (58, 40, 30), (176, 136, 70)
IV_BG = noise_tex(vgrad((250, 245, 236), (240, 230, 214)), 4, 2)
CORM_I, CORM, MONT = "CormorantGaramond-Italic-VF.ttf", "CormorantGaramond.ttf", "Montserrat-VF.ttf"
def ivory(sc, u, dur, t):
    fr = IV_BG.copy(); d = ImageDraw.Draw(fr)
    paste(fr, text("SUNDARLYSH MEMORIES  ·  WEDDINGS", MONT, 26, GOLD, var=700, tr=6), W / 2, 120)
    if sc["type"] in ("photo", "video"):
        x0, y0, x1, y1 = 70, 190, W - 70, 1430
        pic = kb(sc["img"], x1 - x0, y1 - y0, u / dur, 1.0, 1.07) if sc["type"] == "photo" else video_frame(sc["src"], sc.get("in", 0) + u, x1 - x0, y1 - y0)
        fr.alpha_composite(pic, (x0, y0)); d.rectangle((x0 - 14, y0 - 14, x1 + 13, y1 + 13), outline=GOLD + (255,), width=2)
        two_lines(fr, sc, 1475, (MONT, 28, GOLD, dict(var=700, tr=7), 0), (CORM_I, 104, BROWN, dict(var=600), 0), (CORM_I, 54, BROWN, {}, 0), u)
    elif sc["type"] == "title":
        k = eout(u / .8); d.line((W / 2 - 220 * k, 760, W / 2 + 220 * k, 760), fill=GOLD + (255,), width=2)
        y = two_lines(fr, sc, 800, (MONT, 32, GOLD, dict(var=700, tr=8), 30), (CORM_I, 120, BROWN, dict(var=600), 0), (CORM_I, 58, (110, 80, 60), {}, 0), u, anim="fade")
        d.line((W / 2 - 220 * k, y + 40, W / 2 + 220 * k, y + 40), fill=GOLD + (255,), width=2)
    else:
        paste(fr, logo(420), W / 2, 560, a=ease(u / .5), s=.92 + .08 * eout(u / .8))
        two_lines(fr, sc, 860, (CORM_I, 60, (110, 80, 60), {}, 30), (CORM, 130, BROWN, dict(tr=10), 20), (MONT, 40, GOLD, dict(var=700, tr=3), 0), u, delay=.3, anim="fade")
        if sc.get("foot"): paste(fr, text(sc["foot"], MONT, 28, BROWN, var=600, tr=6), W / 2, 1390, a=ease((u - .9) / .4))
    return fr

# ---------------- fashion: magazine cover
INK, PAPER, RED = (14, 14, 14), (250, 248, 244), (200, 20, 40)
BOD = "BodoniModa[opsz,wght].ttf"
def masthead(fr, col, a=1.0):
    paste(fr, fit("SUNDARLYSH", BOD, col, W - 110, 200, var=[96, 800]), W / 2, 270, a=a)
    paste(fr, text("THE WEDDING ISSUE  ·  NOVEMBER 2026", MONT, 26, col, var=700, tr=6), W / 2, 385, a=a)
def fashion(sc, u, dur, t):
    if sc["type"] == "photo":
        fr = kb(sc["img"], W, H, u / dur, 1.08, 1.0)
        shade = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shade)
        for i in range(520): sd.line((0, i, W, i), fill=(0, 0, 0, int(160 * (1 - i / 520))))
        for i in range(560): sd.line((0, H - i, W, H - i), fill=(0, 0, 0, int(190 * (1 - i / 560))))
        fr.alpha_composite(shade); masthead(fr, (255, 255, 255))
        k = eout(u / .35)
        if sc.get("top"): paste(fr, text(sc["top"], MONT, 34, (255, 255, 255), var=800, tr=5), W / 2 - (1 - k) * 300, 1500, a=k)
        if sc.get("main"):
            sp = fit(sc["main"], BOD, (255, 255, 255), W - 120, 120, var=[96, 700]); paste(fr, sp, W / 2 + (1 - k) * 300, 1610, a=k)
        if sc.get("sub"): paste(fr, text(sc["sub"], BOD, 54, (255, 225, 230), var=[18, 500]), W / 2, 1735, a=ease((u - .25) / .3))
        d = ImageDraw.Draw(fr); d.rectangle((W - 170, H - 120, W - 60, H - 60), fill=(255, 255, 255, 230))
        for i in range(14): d.line((W - 160 + i * 7, H - 112, W - 160 + i * 7, H - 68), fill=INK + (255,), width=1 + i % 3)
        return fr
    if sc["type"] == "duo":
        fr = Image.new("RGBA", (W, H), PAPER + (255,)); k = eout(u / .4)
        a_ = kb(sc["imgs"][0], W // 2 - 6, H, u / dur); b_ = kb(sc["imgs"][1], W // 2 - 6, H, u / dur)
        fr.alpha_composite(a_, (int(-(1 - k) * W / 2), 0)); fr.alpha_composite(b_, (W // 2 + 6 + int((1 - k) * W / 2), 0))
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        for i in range(560): sd.line((0, H - i, W, H - i), fill=(0, 0, 0, int(200 * (1 - i / 560))))
        fr.alpha_composite(sh); masthead(fr, (255, 255, 255))
        paste(fr, text(sc.get("top", ""), MONT, 34, (255, 255, 255), var=800, tr=5), W / 2, 1520, a=ease((u - .3) / .3))
        paste(fr, fit(sc.get("main", ""), BOD, (255, 255, 255), W - 120, 120, var=[96, 700]), W / 2, 1640, a=ease((u - .4) / .3))
        return fr
    fr = Image.new("RGBA", (W, H), PAPER + (255,)); masthead(fr, INK)
    if sc["type"] == "title":
        lines = sc["main"].split("\n"); y = 760
        for i, ln in enumerate(lines):
            sp = fit(ln, BOD, INK if i < len(lines) - 1 else RED, W - 100, 190, var=[96, 800])
            paste(fr, sp, W / 2 + (1 - eout((u - i * .15) / .4)) * (400 if i % 2 else -400), y + sp.height / 2, a=ease((u - i * .15) / .25)); y += sp.height - 10
        if sc.get("top"): paste(fr, text(sc["top"], MONT, 32, RED, var=800, tr=8), W / 2, 640, a=ease(u / .3))
        if sc.get("sub"): paste(fr, text(sc["sub"], BOD, 54, INK, var=[18, 500]), W / 2, y + 80, a=ease((u - .5) / .3))
    else:
        paste(fr, logo(360), W / 2, 700, a=ease(u / .4), s=.9 + .1 * eout(u / .6))
        two_lines(fr, sc, 950, (BOD, 58, INK, dict(var=[18, 500]), 26), (BOD, 150, RED, dict(var=[96, 800]), 10), (MONT, 42, INK, dict(var=800, tr=3), 0), u, delay=.2)
    return fr

# ---------------- floral: blush + petals + arch frame
BLUSH1, BLUSH2, ROSE, GOLDF = (252, 232, 234), (243, 196, 204), (142, 27, 58), (190, 145, 80)
FL_BG = rgrad(BLUSH1, BLUSH2, .4, 1.3); GV = "GreatVibes-Regular.ttf"; PLI = "Playfair-Italic-VF.ttf"
def floral(sc, u, dur, t):
    fr = FL_BG.copy()
    if sc["type"] == "photo":
        aw, ah = 820, 1150; x0, y0 = (W - aw) // 2, 200; pic = kb(sc["img"], aw, ah, u / dur, 1.0, 1.08); pic.putalpha(arch_mask(aw, ah))
        k = ease(u / .6); fr.alpha_composite(pic, (x0, y0))
        d = ImageDraw.Draw(fr); d.arc((x0 - 16, y0 - 16, x0 + aw + 15, y0 + aw + 15), 180, 360, fill=GOLDF + (255,), width=4)
        d.line((x0 - 16, y0 + aw // 2, x0 - 16, y0 + ah + 16), fill=GOLDF + (255,), width=4); d.line((x0 + aw + 15, y0 + aw // 2, x0 + aw + 15, y0 + ah + 16), fill=GOLDF + (255,), width=4)
        d.line((x0 - 16, y0 + ah + 16, x0 + aw + 15, y0 + ah + 16), fill=GOLDF + (255,), width=4)
        two_lines(fr, sc, 1400, (MONT, 30, GOLDF, dict(var=700, tr=7), 0), (GV, 130, ROSE, {}, 0), (PLI, 50, ROSE, dict(var=500), 0), u)
    elif sc["type"] == "title":
        paste(fr, text("✿", "Cormorant.ttf", 90, GOLDF) if False else None, 0, 0)
        two_lines(fr, sc, 700, (MONT, 32, GOLDF, dict(var=700, tr=8), 20), (GV, 170, ROSE, {}, -30), (PLI, 56, ROSE, dict(var=500), 0), u, anim="fade")
    else:
        paste(fr, logo(400), W / 2, 620, a=ease(u / .5)); two_lines(fr, sc, 880, (PLI, 56, ROSE, dict(var=500), 20), (GV, 150, ROSE, {}, 0), (MONT, 42, ROSE, dict(var=800, tr=3), 0), u, delay=.3, anim="fade")
    petals(fr, t, .85)
    return fr

# ---------------- neon party
NAVY, MAG, CYAN = (7, 8, 26), (255, 46, 170), (40, 230, 255)
ANT = "Anton-Regular.ttf"
def neon_bg(t):
    k1 = np.exp(-(((xx - W * (.3 + .2 * math.sin(t * .8))) / 500) ** 2 + ((yy - H * (.3 + .1 * math.cos(t))) / 700) ** 2))
    k2 = np.exp(-(((xx - W * (.7 + .2 * math.cos(t * .7))) / 500) ** 2 + ((yy - H * (.75 + .1 * math.sin(t * 1.1))) / 700) ** 2))
    a = np.array(NAVY, np.float32) + k1[..., None] * np.array([120, 10, 90]) * .55 + k2[..., None] * np.array([10, 90, 130]) * .55
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert("RGBA")
_nb = {}
def neon(sc, u, dur, t):
    key = int(t * 6); fr = (_nb.setdefault(key, neon_bg(key / 6))).copy()
    bp = (u % BEAT) / BEAT; punch = 1 + .04 * math.exp(-bp * 6)
    if sc["type"] == "photo":
        pw, ph = 900, 1260; pic = kb(sc["img"], pw, ph, u / dur, 1.12, 1.0); pic.putalpha(round_mask(pw, ph, 36))
        glow = Image.new("RGBA", (pw + 80, ph + 80), (0, 0, 0, 0)); ImageDraw.Draw(glow).rounded_rectangle((30, 30, pw + 50, ph + 50), 44, outline=MAG + (255,), width=10)
        glow = glow.filter(ImageFilter.GaussianBlur(14)); ImageDraw.Draw(glow).rounded_rectangle((36, 36, pw + 44, ph + 44), 40, outline=(255, 180, 230, 255), width=3)
        comp = Image.new("RGBA", glow.size, (0, 0, 0, 0)); comp.alpha_composite(pic, (40, 40)); comp.alpha_composite(glow)
        paste(fr, comp, W / 2, 820, s=punch)
        if sc.get("top"): paste(fr, text(sc["top"], MONT, 46, (255, 255, 255), var=900, tr=8, glow=CYAN, glow_r=10), W / 2, 1565, a=ease(u / .15), s=1.25 - .25 * eout(u / .2))
        if sc.get("main"): paste(fr, fit(sc["main"], ANT, (255, 255, 255), W - 100, 150, glow=MAG, glow_r=22), W / 2, 1700, a=ease((u - .1) / .15), s=1.25 - .25 * eout((u - .1) / .2))
        burst(fr, u / .7, (255, 230, 160), W / 2, 820)
    elif sc["type"] == "title":
        lines = sc["main"].split("\n"); y = 760
        for i, ln in enumerate(lines):
            sp = fit(ln, ANT, (255, 255, 255), W - 120, 230, glow=MAG if i % 2 == 0 else CYAN, glow_r=26)
            paste(fr, sp, W / 2, y + sp.height / 2, a=ease((u - i * BEAT) / .1), s=(1.4 - .4 * eout((u - i * BEAT) / .2)) * punch); y += sp.height - 30
        if sc.get("top"): paste(fr, text(sc["top"], MONT, 36, (255, 255, 255), var=900, tr=8, glow=CYAN, glow_r=8), W / 2, 620, a=ease(u / .2))
    else:
        paste(fr, logo(380, ring=MAG), W / 2, 620, s=punch, a=ease(u / .2))
        two_lines(fr, sc, 880, (MONT, 46, (255, 255, 255), dict(var=700, glow=CYAN, glow_r=6), 20), (ANT, 190, (255, 255, 255), dict(glow=MAG, glow_r=26), 10), (MONT, 44, (255, 255, 255), dict(var=800), 0), u, anim="stamp")
    sparkles(fr, t, (255, 240, 200), .9)
    if u < 2 / FPS: fr = Image.blend(fr, Image.new("RGBA", (W, H), (255, 255, 255, 255)), .6)
    return fr

# ---------------- haldi: marigold + polaroids
MARI, ORANGE, PINK, HCREAM = (255, 196, 46), (255, 120, 0), (214, 36, 110), (255, 250, 238)
HAL_BG = rgrad((255, 214, 90), MARI, .45, 1.2); CAV = "Caveat[wght].ttf"
FLOWERS = [(x, y, rng.uniform(30, 64), rng.uniform(0, 6.3), rng.choice([ORANGE, PINK, (255, 255, 255)])) for x, y in [(rng.choice([rng.uniform(20, 150), rng.uniform(930, 1060)]), rng.uniform(0, H)) for _ in range(12)] + [(rng.uniform(0, W), rng.choice([rng.uniform(20, 130), rng.uniform(1800, 1900)])) for _ in range(8)]]
def flower(d, x, y, r, a, col):
    for i in range(6):
        q = a + i * math.pi / 3; cx, cy = x + r * .55 * math.cos(q), y + r * .55 * math.sin(q); d.ellipse((cx - r * .45, cy - r * .45, cx + r * .45, cy + r * .45), fill=col + (200,))
    d.ellipse((x - r * .3, y - r * .3, x + r * .3, y + r * .3), fill=(255, 230, 120, 255) if col != (255, 230, 120) else (255, 255, 255, 255))
def haldi(sc, u, dur, t):
    fr = HAL_BG.copy(); d = ImageDraw.Draw(fr)
    for x, y, r, a, col in FLOWERS: flower(d, x, y, r, a + t * .6, col)
    if sc["type"] == "photo":
        pw, ph = 780, 900; pic = kb(sc["img"], pw, ph, u / dur, 1.0, 1.08)
        card = Image.new("RGBA", (pw + 60, ph + 220), HCREAM + (255,)); card.alpha_composite(pic, (30, 30))
        cap = sc.get("sub") or "";
        if cap: c_ = fit(cap, CAV, PINK, pw, 76, var=700); card.alpha_composite(c_, ((card.width - c_.width) // 2, ph + 50))
        sh = Image.new("RGBA", (card.width + 60, card.height + 60), (0, 0, 0, 0)); ImageDraw.Draw(sh).rectangle((30, 40, card.width + 30, card.height + 40), fill=(120, 60, 0, 90))
        sh = sh.filter(ImageFilter.GaussianBlur(14)); sh.alpha_composite(card, (30, 30))
        rot = sc.get("rot", -4); paste(fr, sh, W / 2, 900, s=.5 + .5 * back(u / .45), rot=rot, a=ease(u / .12))
        tape = Image.new("RGBA", (230, 64), (255, 255, 255, 150)); paste(fr, tape, W / 2, 900 - sh.height / 2 + 30, rot=rot + 8, a=ease((u - .3) / .2))
        if sc.get("top"): paste(fr, text(sc["top"], MONT, 50, (255, 255, 255), var=900, stroke=6, stroke_col=ORANGE), W / 2, 260, s=.6 + .4 * back((u - .2) / .35), a=ease((u - .2) / .1))
        if sc.get("main"): paste(fr, fit(sc["main"], CAV, PINK, W - 200, 120, var=700, stroke=6, stroke_col=(255, 255, 255)), W / 2, 1620, a=ease((u - .35) / .2), s=.7 + .3 * back((u - .35) / .35))
    elif sc["type"] == "title":
        two_lines(fr, sc, 640, (MONT, 40, (255, 255, 255), dict(var=900, stroke=5, stroke_col=ORANGE), 20), (CAV, 160, PINK, dict(var=700, stroke=7, stroke_col=(255, 255, 255)), -20), (MONT, 44, ORANGE, dict(var=800), 0), u, anim="pop")
    else:
        paste(fr, logo(380, ring=(255, 255, 255)), W / 2, 620, s=.5 + .5 * back(u / .5), a=ease(u / .15))
        two_lines(fr, sc, 880, (CAV, 70, PINK, dict(var=700), 10), (MONT, 120, (255, 255, 255), dict(var=900, stroke=8, stroke_col=PINK), 20), (MONT, 44, PINK, dict(var=800), 0), u, delay=.3, anim="pop")
    return fr

# ---------------- royal: emerald + gold mandala
EMER, EMER_D, GOLDR, GOLDL = (12, 70, 52), (4, 30, 22), (212, 170, 90), (245, 220, 160)
CIN = "Cinzel-VF.ttf"
def mandala(size, col):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = size / 2
    for r, n, pr in ((size * .48, 32, 22), (size * .38, 24, 26), (size * .28, 16, 30), (size * .18, 12, 26)):
        d.ellipse((c - r, c - r, c + r, c + r), outline=col + (120,), width=2)
        for i in range(n):
            q = i * 2 * math.pi / n; x, y = c + r * math.cos(q), c + r * math.sin(q); d.ellipse((x - pr / 2, y - pr / 2, x + pr / 2, y + pr / 2), outline=col + (150,), width=2)
    return im
MANDALA = mandala(1500, GOLDR); RO_BG = rgrad(EMER, EMER_D, .45, 1.3)
def royal(sc, u, dur, t):
    fr = RO_BG.copy(); m = MANDALA.rotate(t * 6, resample=Image.BILINEAR); paste(fr, m, W / 2, H / 2, a=.55)
    bp = (u % BEAT) / BEAT; thump = 1 + .03 * math.exp(-bp * 7)
    if sc["type"] == "photo":
        pw, ph = 840, 1120; pic = kb(sc["img"], pw, ph, u / dur, 1.1, 1.0)
        fr_ = Image.new("RGBA", (pw + 56, ph + 56), (0, 0, 0, 0)); d = ImageDraw.Draw(fr_)
        d.rectangle((0, 0, pw + 55, ph + 55), outline=GOLDR + (255,), width=6); d.rectangle((14, 14, pw + 41, ph + 41), outline=GOLDL + (255,), width=2); fr_.alpha_composite(pic, (28, 28))
        k = eout(u / .3); paste(fr, fr_, W / 2, 840, s=(1.25 - .25 * k) * thump, a=ease(u / .12))
        two_lines(fr, sc, 1460, (MONT, 32, GOLDL, dict(var=800, tr=8), 6), (CIN, 96, GOLDR, dict(var=800, tr=4, shadow=.6), 0), (PLI, 52, GOLDL, dict(var=500), 0), u, anim="stamp")
    elif sc["type"] == "title":
        two_lines(fr, sc, 700, (MONT, 34, GOLDL, dict(var=800, tr=8), 30), (CIN, 120, GOLDR, dict(var=800, tr=4, shadow=.6), 0), (PLI, 56, GOLDL, dict(var=500), 0), u, anim="stamp")
    else:
        paste(fr, logo(400, ring=GOLDR), W / 2, 620, s=thump * (.9 + .1 * eout(u / .4)), a=ease(u / .2))
        two_lines(fr, sc, 890, (PLI, 56, GOLDL, dict(var=500), 20), (CIN, 140, GOLDR, dict(var=800, tr=6, shadow=.6), 10), (MONT, 42, GOLDL, dict(var=800, tr=2), 0), u, delay=.2, anim="stamp")
    return fr

# ---------------- scrapbook: kraft paper + polaroids
KRAFT = noise_tex(noise_tex(Image.new("RGBA", (W, H), (196, 158, 118, 255)), 10, 4, blur=1), 5, 9)
_kd = ImageDraw.Draw(KRAFT)
for i in range(220):
    x, y = rng.uniform(0, W), rng.uniform(0, H); L = rng.uniform(20, 80); a = rng.uniform(0, 3.14)
    _kd.line((x, y, x + L * math.cos(a), y + L * math.sin(a)), fill=(150, 112, 78, 70), width=1)
SB_INK, SB_RED, SB_GRN = (60, 36, 20), (190, 30, 40), (30, 110, 60)
def washi(w, col1, col2):
    im = Image.new("RGBA", (w, 70), col1 + (210,)); d = ImageDraw.Draw(im)
    for x in range(-70, w, 36): d.polygon([(x, 0), (x + 18, 0), (x + 88, 70), (x + 70, 70)], fill=col2 + (210,))
    return im
def scrapbook(sc, u, dur, t):
    fr = KRAFT.copy()
    if sc["type"] == "photo":
        pw, ph = 800, 860; pic = kb(sc["img"], pw, ph, u / dur, 1.0, 1.08)
        card = Image.new("RGBA", (pw + 56, ph + 200), (252, 250, 244, 255)); card.alpha_composite(pic, (28, 28))
        if sc.get("sub"): c_ = fit(sc["sub"], CAV, SB_INK, pw, 74, var=700); card.alpha_composite(c_, ((card.width - c_.width) // 2, ph + 50))
        sh = Image.new("RGBA", (card.width + 60, card.height + 60), (0, 0, 0, 0)); ImageDraw.Draw(sh).rectangle((30, 42, card.width + 30, card.height + 42), fill=(60, 30, 10, 110))
        sh = sh.filter(ImageFilter.GaussianBlur(12)); sh.alpha_composite(card, (30, 30)); rot = sc.get("rot", 3)
        k = eout(u / .45); paste(fr, sh, W / 2, 880 - (1 - k) * 1300, rot=rot)
        paste(fr, washi(260, SB_RED, (250, 240, 230)), W / 2 - 280, 880 - sh.height / 2 + 40 - (1 - k) * 1300, rot=rot + 30)
        paste(fr, washi(260, SB_GRN, (250, 240, 230)), W / 2 + 280, 880 - sh.height / 2 + 40 - (1 - k) * 1300, rot=rot - 30)
        if sc.get("main"): paste(fr, fit(sc["main"], CAV, SB_RED, W - 120, 120, var=700), W / 2, 1640, a=ease((u - .35) / .25))
        if sc.get("top"): paste(fr, text(sc["top"], MONT, 34, SB_INK, var=800, tr=6), W / 2, 230, a=ease((u - .2) / .25))
    elif sc["type"] == "stamp":
        r = 300; st = Image.new("RGBA", (2 * r + 20, 2 * r + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(st)
        d.ellipse((10, 10, 2 * r + 10, 2 * r + 10), outline=SB_RED + (230,), width=10); d.ellipse((34, 34, 2 * r - 14, 2 * r - 14), outline=SB_RED + (230,), width=4)
        for i, (s_, sz) in enumerate(((sc.get("top", ""), 44), (sc.get("main", ""), 150), (sc.get("sub", ""), 44))):
            sp = fit(s_, CIN if i == 1 else MONT, SB_RED, 2 * r - 120, sz, var=800); st.alpha_composite(sp, ((st.width - sp.width) // 2, int(r + 10 + (i - 1) * 150 - sp.height / 2)))
        paste(fr, st, W / 2, 760, rot=-8, s=1.4 - .4 * eout(u / .2), a=ease(u / .1))
        y = 1180
        for ln in sc.get("lines", []):
            sp = fit(ln, CAV, SB_INK, W - 140, 84, var=700); paste(fr, sp, W / 2, y + sp.height / 2, a=ease((u - .4) / .3)); y += sp.height - 10
    elif sc["type"] == "title":
        two_lines(fr, sc, 640, (MONT, 38, SB_GRN, dict(var=800, tr=8), 20), (CAV, 240, SB_RED, dict(var=700), -40), (CAV, 120, SB_INK, dict(var=600), 0), u, anim="pop")
        paste(fr, washi(500, SB_RED, (250, 240, 230)), W / 2, 560, rot=-3, a=ease(u / .3))
    else:
        paste(fr, logo(380, ring=(252, 250, 244)), W / 2, 620, a=ease(u / .3), rot=-3)
        two_lines(fr, sc, 880, (CAV, 80, SB_INK, dict(var=700), 10), (CAV, 170, SB_RED, dict(var=700), 10), (MONT, 42, SB_GRN, dict(var=800), 0), u, delay=.3, anim="pop")
    return fr

STYLES = dict(ivory=ivory, fashion=fashion, floral=floral, neon=neon, haldi=haldi, royal=royal, scrapbook=scrapbook)
TRANS = dict(ivory=("dissolve", .45), fashion=("push", .28), floral=("dissolve", .55), neon=("flash", .12), haldi=("pop", .25), royal=("iris", .35), scrapbook=("cut", 0))
render_scene = STYLES[STYLE]

# ------------------------------------------------------------------ timeline
scenes = SPEC["scenes"]; t0 = 0.0
for sc in scenes:
    sc["t0"] = t0; sc["dur"] = sc["beats"] * BEAT; t0 += sc["dur"]
    if isinstance(sc.get("img"), dict): sc["img"]["dur"] = sc["dur"]
DUR = t0
_last = {}
def scene_at(t):
    for i, sc in enumerate(scenes):
        if t < sc["t0"] + sc["dur"] or i == len(scenes) - 1: return i, sc
def render(t):
    i, sc = scene_at(t); u = t - sc["t0"]; fr = render_scene(sc, u, sc["dur"], t)
    kind, td = TRANS[STYLE]
    if i > 0 and u < td and kind != "cut":
        p = scenes[i - 1]
        if (i - 1) not in _last: _last[i - 1] = render_scene(p, p["dur"] - .01, p["dur"], sc["t0"] - .01)
        prev = _last[i - 1]; k = ease(u / td)
        if kind == "dissolve": fr = Image.blend(prev, fr, k)
        elif kind == "push":
            c = Image.new("RGBA", (W, H)); c.alpha_composite(prev, (int(-W * k), 0)); c.alpha_composite(fr, (int(W * (1 - k)), 0)); fr = c
        elif kind == "flash": fr = Image.blend(Image.new("RGBA", (W, H), (255, 255, 255, 255)), fr, k)
        elif kind == "pop": fr = Image.blend(prev, fr, k)
        elif kind == "iris":
            m = Image.new("L", (W, H), 0); r = k * 1200; ImageDraw.Draw(m).ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), fill=255)
            prev = prev.copy(); prev.paste(fr, (0, 0), m); fr = prev
            d = ImageDraw.Draw(fr); d.ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), outline=GOLDR + (255,), width=8)
    if t > DUR - .35: fr = Image.blend(fr, Image.new("RGBA", (W, H), (0, 0, 0, 255)), ease((t - (DUR - .35)) / .35) * .0 + 0)
    return fr.convert("RGB")

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for tt in PREVIEW:
        render(tt).save(os.path.join(OUT, f"p_{tt:05.2f}.jpg"), quality=85)
    sys.exit()
nfr = int(round(DUR * FPS)); M0 = SPEC["start"]
af = f"[1:a]atrim=start={M0}:duration={DUR + .05},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={DUR - 1.0}:d=1.0,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=44100[a]"
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", SPEC["music"],
    "-filter_complex", af, "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "192k", "-ar", "44100", "-ac", "2", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for k in range(nfr): ff.stdin.write(render(k / FPS).tobytes())
ff.stdin.close(); ff.wait(); print("done", OUT, round(DUR, 2))
