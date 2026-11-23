"""Music: Hitman (Kevin MacLeod) re-edit from hype_mix.py, 150 bpm grid, ending on bar 12.
Kinetic-typography 'Are you ready?' teaser (1080x1920, 30fps, 48 beats @140bpm = 20.57 s).
usage: kinetic_teaser.py <out.mp4> <music.wav> [--preview b1,b2,...]   (preview times given in BEATS)"""
import sys, os, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance

S = "/tmp/claude-0/-home-user-Claude-Public-/e6dc3aa3-d0dd-5e70-ae91-a743f4ec6241/scratchpad"
OUT = sys.argv[1]; MUSIC = sys.argv[2]
PREVIEW = [float(x) for x in sys.argv[sys.argv.index("--preview") + 1].split(",")] if "--preview" in sys.argv else None
W, H, FPS = 1080, 1920, 30; B = 60 / 150.02; NB = 48; PRE = 4; DUR = (NB + PRE) * B + 1.0   # PRE: 1-bar title intro
FONTS = f"{S}/assets/fonts"; P7, P4 = f"{S}/v7/photos/", f"{S}/v4/photos/"; LOGO = f"{S}/v7/logo.jpg"
BLACK, CREAM, RED, GOLD = (10, 9, 9), (246, 241, 231), (178, 20, 30), (226, 190, 120)
ANTON = lambda s: ImageFont.truetype(f"{FONTS}/Anton-Regular.ttf", s)
def MONT(s, w=700):
    f = ImageFont.truetype(f"{FONTS}/Montserrat-VF.ttf", s)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f
def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3

# ---------------------------------------------------------------- text sprites
_cache = {}
def word(text, size, col, outline=0, tr=0, shadow=False):
    key = (text, size, col, outline, tr, shadow)
    if key in _cache: return _cache[key]
    f = ANTON(size) if not isinstance(size, tuple) else MONT(*size)
    d0 = ImageDraw.Draw(Image.new("L", (1, 1)))
    w = int(sum(d0.textlength(c, font=f) for c in text) + tr * (len(text) - 1)) if tr else int(d0.textlength(text, font=f))
    a, de = f.getmetrics(); pad = 30 + outline; im_w, im_h = w + 2 * pad, a + de + 2 * pad
    def mask(stroke):
        m = Image.new("L", (im_w, im_h), 0); d = ImageDraw.Draw(m); x = pad
        if tr:
            for c in text: d.text((x, pad), c, font=f, fill=255, stroke_width=stroke, stroke_fill=255); x += d0.textlength(c, font=f) + tr
        else: d.text((pad, pad), text, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
        return m
    m = mask(0)
    if outline: m = Image.fromarray(np.clip(np.asarray(mask(outline)).astype(int) - np.asarray(m), 0, 255).astype(np.uint8))
    bb = m.getbbox() or (0, 0, im_w, im_h); m = m.crop((max(0, bb[0] - 8), max(0, bb[1] - 8), min(im_w, bb[2] + 8), min(im_h, bb[3] + 8)))
    im = Image.new("RGBA", m.size, col + (0,)); im.putalpha(m)
    if shadow:
        g = 24; big = Image.new("RGBA", (m.width + 2 * g, m.height + 2 * g), (0, 0, 0, 0))
        sh = Image.new("RGBA", big.size, (0, 0, 0, 0)); sm = Image.new("L", big.size, 0); sm.paste(m, (g, g + 6))
        sh.putalpha(sm.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * .75))); big.alpha_composite(sh); big.alpha_composite(im, (g, g)); im = big
    _cache[key] = im; return im
def fit_word(text, col, maxw=W - 150, maxh=420, outline=0, tr=0, shadow=False):
    size = 520
    while size > 40:
        sp = word(text, size, col, outline, tr, shadow)
        if sp.width <= maxw and sp.height <= maxh: return sp
        size = int(size * .93)
    return word(text, 40, col, outline, tr, shadow)
def paste_c(fr, spr, cx, cy, s=1.0, a=1.0):
    if a <= .003: return
    if abs(s - 1) > 1e-3:
        vw, vh = W / s, H / s; L = spr.width / 2 - (cx) / s; T = spr.height / 2 - cy / s
        if spr.width * s > W * 1.2 or spr.height * s > H * 1.2:      # huge: crop visible part first
            box = (max(0, L), max(0, T), min(spr.width, L + vw), min(spr.height, T + vh))
            if box[2] <= box[0] or box[3] <= box[1]: return
            part = spr.crop(tuple(int(v) for v in box)); ox, oy = (box[0] - L) * s, (box[1] - T) * s
            spr = part.resize((max(1, int(part.width * s)), max(1, int(part.height * s))), Image.BILINEAR)
            x, y = ox, oy
        else:
            spr = spr.resize((max(1, int(spr.width * s)), max(1, int(spr.height * s))), Image.BILINEAR); x, y = cx - spr.width / 2, cy - spr.height / 2
    else: x, y = cx - spr.width / 2, cy - spr.height / 2
    if a < .997: spr = spr.copy(); spr.putalpha(spr.getchannel("A").point(lambda v: int(v * a)))
    fr.alpha_composite(spr, (int(round(x)), int(round(y))))
def solid(col): return Image.new("RGBA", (W, H), col + (255,))

# ---------------------------------------------------------------- photos & fx
_ph = {}
def photo(p, bw=False):
    k = (p, bw)
    if k not in _ph:
        im = ImageOps.fit(ImageOps.exif_transpose(Image.open(p)).convert("RGB"), (int(W * 1.16), int(H * 1.16)), Image.LANCZOS)
        if bw: im = ImageEnhance.Contrast(ImageOps.grayscale(im).convert("RGB")).enhance(1.25)
        else: im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.12)).enhance(1.08)
        _ph[k] = im
    return _ph[k]
def shot(p, u, bw=False, z0=1.14, z1=1.0, dark=1.0):
    im = photo(p, bw); z = z1 + (z0 - z1) * (1 - eout(u / .35)); bw_, bh_ = W * 1.16 / z, H * 1.16 / z
    cx, cy = im.width / 2, im.height / 2
    fr = im.resize((W, H), Image.BILINEAR, box=(cx - bw_ / 2 * (W / (W * 1.16)) * 1.16 / 1.16, cy - bh_ / 2, cx + bw_ / 2, cy + bh_ / 2)) if False else \
         im.crop((int(cx - W / 2 / z * 1.0), int(cy - H / 2 / z), int(cx + W / 2 / z), int(cy + H / 2 / z))).resize((W, H), Image.BILINEAR)
    if dark < 1: fr = ImageEnhance.Brightness(fr).enhance(dark)
    return fr.convert("RGBA")
yy_, xx_ = np.mgrid[0:H, 0:W].astype(np.float32)
DIAG = ((xx_ / W) * .55 + (1 - yy_ / H) * .45)                       # 0 bottom-left .. 1 top-right
VIG = np.clip(1 - .55 * (((xx_ - W / 2) / (W * .75)) ** 2 + ((yy_ - H / 2) / (H * .7)) ** 2), .35, 1)[..., None]
def leak_wipe(prev, nxt, u, dur=.3):
    c = -0.15 + 1.3 * eout(u / dur)
    m = np.clip((c - DIAG) / .06, 0, 1)[..., None]; edge = np.exp(-np.abs(DIAG - c) / .035)[..., None]
    a = np.asarray(prev.convert("RGB")).astype(np.float32); b = np.asarray(nxt.convert("RGB")).astype(np.float32)
    out = a * (1 - m) + b * m + edge * np.array([255, 170, 90]) * .85 * (u < dur)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert("RGBA")
def glitch(fr, amt=14, seed=0):
    a = np.asarray(fr.convert("RGB")).copy(); r = random.Random(seed)
    a[..., 0] = np.roll(a[..., 0], amt, 1); a[..., 2] = np.roll(a[..., 2], -amt, 1)
    for _ in range(7):
        y0 = r.randrange(0, H - 80); h = r.randrange(20, 140); a[y0:y0 + h] = np.roll(a[y0:y0 + h], r.randint(-amt * 4, amt * 4), 1)
    return Image.fromarray(a).convert("RGBA")
def invert(fr): a = np.asarray(fr.convert("RGB")); return Image.fromarray(255 - a).convert("RGBA")
rs = np.random.default_rng(3); GRAIN = [rs.normal(0, 9, (H // 2, W // 2)).astype(np.float32) for _ in range(4)]
def finish(fr, t):
    a = np.asarray(fr.convert("RGB")).astype(np.float32) * VIG
    g = GRAIN[int(t * FPS) % 4]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]
    return Image.fromarray(np.clip(a + g, 0, 255).astype(np.uint8))
def sparkle(fr, t, n=60, seed=1, col=GOLD):
    r = random.Random(seed); lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for _ in range(n):
        x, y, s, ph = r.uniform(0, W), r.uniform(0, H), r.uniform(2, 6), r.uniform(0, 6.3)
        a = max(0, math.sin(t * 9 + ph)); d.ellipse((x - s, y - s, x + s, y + s), fill=col + (int(255 * a),))
    fr.alpha_composite(lay.filter(ImageFilter.GaussianBlur(2))); fr.alpha_composite(lay)

LOGO_IM = Image.open(LOGO).convert("RGB")
def logo(size):
    lg = LOGO_IM.resize((size, size), Image.LANCZOS).convert("RGBA")
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32); r = np.sqrt((xx - size / 2) ** 2 + (yy - size / 2) ** 2) / (size / 2)
    lg.putalpha(Image.fromarray((np.clip((1 - r) / .1, 0, 1) * 255).astype(np.uint8))); return lg
LOGO_S = logo(300)

def tape(text, bg, fg, angle):
    unit = "  " + text + "  •"; f = ANTON(62); d0 = ImageDraw.Draw(Image.new("L", (1, 1))); uw = int(d0.textlength(unit, font=f))
    st = Image.new("RGBA", (uw * 8, 104), bg + (255,)); d = ImageDraw.Draw(st)
    for k in range(8): d.text((k * uw, 10), unit, font=f, fill=fg)
    d.line((0, 4, st.width, 4), fill=fg + (255,), width=3); d.line((0, 99, st.width, 99), fill=fg + (255,), width=3)
    return st, uw, angle
TAPE1 = tape("STAY TUNED", RED, CREAM, -7); TAPE2 = tape("STAY TUNED", CREAM, RED, 6)
def draw_tape(fr, tp, cy, shift):
    st, uw, ang = tp; off = int(shift) % uw; crop = st.crop((off, 0, off + 1500, st.height)).rotate(ang, expand=True, resample=Image.BICUBIC)
    fr.alpha_composite(crop, (int(W / 2 - crop.width / 2), int(cy - crop.height / 2)))

def echo_stack(text, u, fill=RED, outline_col=CREAM, rows=9):
    fr = solid(BLACK); o = fit_word(text, outline_col, maxw=W - 180, maxh=250, outline=4); f_ = fit_word(text, fill, maxw=W - 180, maxh=250)
    step = o.height * .78; scroll = (u * 260) % step
    for k in range(-rows // 2 - 1, rows // 2 + 2):
        cy = H / 2 + k * step - scroll
        is_mid = abs(cy - H / 2) < step / 2
        paste_c(fr, f_ if is_mid else o, W / 2, cy, a=1.0 if is_mid else max(.25, 1 - abs(k) * .12))
    return fr

# ---------------------------------------------------------------- timeline (beats)
def card(bg, text, col, u, punch=True, s_extra=0.0, maxh=420):
    fr = solid(bg); sp = fit_word(text, col, maxh=maxh); s = (1.16 - .16 * eout(u / .12)) if punch else 1.0
    paste_c(fr, sp, W / 2, H / 2, s=s + s_extra); return fr
MONTAGE = [P7 + "a_box.jpg", P7 + "a_friends.jpg", P7 + "a_decor.jpg", P4 + "c1_blank.jpg", P7 + "a_ribbon.jpg", P7 + "a_cocoa.jpg", P7 + "a_board.jpg",
           P7 + "a_group.jpg", P4 + "h_table.jpg", P7 + "a_family.jpg", P7 + "a_props.jpg", P4 + "h_friends.jpg", P7 + "a_cafe.jpg", P7 + "a_open.jpg", P7 + "a_bags.jpg", P4 + "h_cake2.jpg"]
OVER = {24: ("THE", "CHRISTMAS"), 26: ("ADVENT", "CALENDAR"), 28: (None, "WORKSHOP"), 32: ("SUNDAY", "5 – 7 PM"), 34: ("STUFF IDLY INDIA", "KONDAPUR, HYDERABAD")}
def overlay(fr, top, main, u):
    s = 1.12 - .12 * eout(u / .12)
    if main == "KONDAPUR, HYDERABAD":
        paste_c(fr, fit_word(top, CREAM, maxw=W - 140, maxh=230, shadow=True), W / 2, H / 2 - 120, s=s)
        fd = fit_word(main, CREAM, maxw=W - 300, maxh=120); bw_, bh_ = fd.width + 70, fd.height + 30
        band = Image.new("RGBA", (bw_, bh_), RED + (255,)); band.alpha_composite(fd, (35, 15))
        paste_c(fr, band, W / 2, H / 2 + 120, s=s); return
    if top: paste_c(fr, fit_word(top, CREAM, maxw=W - 300, maxh=170, shadow=True), W / 2, H / 2 - 210, s=s)
    paste_c(fr, fit_word(main, CREAM, maxw=W - 120, maxh=360, shadow=True), W / 2, H / 2 + (40 if top else 0), s=s)

def frame(t):
    b = t / B; bi = int(b); u = t - bi * B
    if bi == 0:
        fr = intro(u + PRE * B)
    elif bi == 1: fr = card(CREAM, "ARE", RED, u)
    elif bi == 2: fr = card(BLACK, "YOU", CREAM, u)
    elif bi == 3: fr = card(CREAM, "READY?", RED, u)
    elif bi == 4:
        fr = card(CREAM, "READY?", RED, u, punch=False); k = int(u * FPS)
        if k % 2 == 1: fr = invert(fr)
        fr = glitch(fr, 10 + 6 * (k % 3), seed=k)
    elif bi == 5: fr = echo_stack("READY?", u)
    elif bi == 6: fr = card(BLACK, "SOMETHING", CREAM, u)
    elif bi == 7: fr = card(RED, "WONDERFUL", CREAM, u); sparkle(fr, t, 70, 4)
    elif bi == 8: fr = card(CREAM, "IS", BLACK, u)
    elif bi == 9: fr = card(BLACK, "COMING", RED, u)
    elif bi == 10: fr = card(CREAM, "TO", BLACK, u)
    elif bi in (11, 12):
        uu = t - 11 * B; fr = solid(BLACK); sp = fit_word("HYDERABAD", CREAM, maxw=W - 110)
        s = 1 + 7 * (1 - eout(uu / .32)); paste_c(fr, sp, W / 2, H / 2 + 40, s=s)
        if uu > .4:
            paste_c(fr, fit_word("FIRST TIME EVER IN", RED, maxw=W - 300, maxh=150), W / 2, H / 2 + 40 - sp.height / 2 - 70, s=1.1 - .1 * eout((uu - .4) / .12))
        sparkle(fr, t, 40, 9)
    elif bi in (13, 14, 16, 17):
        imgs = {13: (P7 + "a_bags.jpg", False), 14: (P7 + "a_props.jpg", True), 16: (P7 + "a_open.jpg", False), 17: (P4 + "c1_blank.jpg", True)}
        p, bw = imgs[bi]; cur = shot(p, u, bw)
        if bi in (13, 16):
            prev = frame_cache.get(bi - 1) or solid(BLACK); fr = leak_wipe(prev, cur, u)
        else:
            fr = cur
            if u < 2 / FPS: fr = Image.blend(fr, solid(CREAM), .6)
    elif bi == 15: fr = echo_stack("CHRISTMAS", u)
    elif bi == 18: fr = card(CREAM, "24", RED, u, maxh=700)
    elif bi == 19: fr = card(BLACK, "SURPRISES", CREAM, u)
    elif bi == 20: fr = card(CREAM, "MADE", BLACK, u)
    elif bi == 21: fr = card(BLACK, "BY", CREAM, u)
    elif bi == 22: fr = card(RED, "YOU", CREAM, u, maxh=560)
    elif bi == 23: fr = solid(BLACK)
    elif 24 <= bi < 36 and bi not in (30, 31):
        k = int((t - 24 * B) / (B / 2)); uc = (t - 24 * B) - k * B / 2
        fr = shot(MONTAGE[k % len(MONTAGE)], uc, bw=(k % 3 == 2), z0=1.1, dark=.62)
        if uc < 2 / FPS: fr = Image.blend(fr, solid((255, 250, 240)), .45)
        if uc < 1 / FPS: fr = glitch(fr, 8, seed=k)
        key = bi if bi in OVER else bi - 1
        if key in OVER: overlay(fr, *OVER[key], t - key * B)
        if 29.5 <= b < 29.85: fr = glitch(fr, 16, seed=int(t * FPS))
    elif bi == 30: fr = card(BLACK, "29.11.2026", CREAM, u)
    elif bi == 31: fr = card(CREAM, "DON'T MISS", RED, u)
    elif 36 <= bi < 44:
        uu = t - 36 * B; fr = shot(P7 + "a_friends.jpg", min(uu, 2.5) / 7, z0=1.12, z1=1.0, dark=.5)
        tr = int(150 * (1 - eout(uu / .55))) + 4; a = ease(uu / .3)
        c1 = word("COMING", 300, CREAM, tr=tr, shadow=True); c2 = word("SOON", 300, CREAM, tr=tr, shadow=True)
        sc = min(1.0, (W - 120) / c1.width) if c1.width > W - 120 else 1.0
        paste_c(fr, c1, W / 2, H / 2 - 150, s=sc, a=a); paste_c(fr, c2, W / 2, H / 2 + 160, s=sc, a=a)
        if uu > .5: paste_c(fr, word("SUNDAY 29 NOV  •  STUFF IDLY INDIA  •  KONDAPUR", (30, 700), CREAM, tr=3), W / 2, H / 2 + 400, a=ease((uu - .5) / .3))
        tu = t - 38 * B
        if tu > 0:
            draw_tape(fr, TAPE1, 470, 1500 - eout(tu / .4) * 1500 + tu * 120)
            draw_tape(fr, TAPE2, 1500, -1500 + eout(tu / .4) * 1500 - tu * 120 + 3000)
    else:
        uu = t - 44 * B; fr = solid(BLACK); n = min(4, 1 + int(uu / (B / 4)))
        stay = word("STAY", 330, CREAM); part = word("STAY"[:n], 330, CREAM)
        paste_c(fr, part, W / 2 - (stay.width - part.width) / 2, H / 2 - 60)
        if uu > B:
            filled = uu > 2 * B
            tn = word("TUNED", 230, RED) if filled else word("TUNED", 230, CREAM, outline=4)
            fl = 1.0 if not filled or (uu - 2 * B) > .25 or int((uu - 2 * B) * FPS) % 2 == 0 else .35
            paste_c(fr, tn, W / 2, H / 2 + 230, s=(1.12 - .12 * eout((uu - 2 * B) / .12)) if filled else 1.0, a=fl)
        if uu > 2.5 * B:
            paste_c(fr, LOGO_S, W / 2, 420, s=.9 + .1 * eout((uu - 2.5 * B) / .3), a=ease((uu - 2.5 * B) / .25))
        if uu > 3 * B: paste_c(fr, word("@sundarlyshmemories", (40, 700), CREAM), W / 2, 1480, a=ease((uu - 3 * B) / .3))
        if t > NB * B + .3: fr = Image.blend(fr, solid((0, 0, 0)), ease((t - (NB * B + .3)) / .6))
    # hit shakes
    for hb, amp in ((3, 16), (11, 26), (22, 22), (24, 28), (36, 26), (46, 18)):
        du = t - hb * B
        if 0 <= du < .3:
            a = amp * math.exp(-du / .08); dx, dy = int(a * math.sin(du * 90)), int(a * math.cos(du * 70))
            fr = fr.resize((W + 60, H + 106), Image.BILINEAR).crop((30 + dx, 53 + dy, 30 + dx + W, 53 + dy + H)); break
    return fr

def intro(tt):
    """Bold title card: SUNDARLYSH / MEMORIES / PRESENTS, on screen for the 1-bar intro + first beat (~2 s)."""
    fr = solid(BLACK); z = 1.0 + .04 * (tt / ((PRE + 1) * B))
    l1 = fit_word("SUNDARLYSH", CREAM, maxw=W - 120, maxh=330); l2 = fit_word("MEMORIES", CREAM, maxw=W - 360, maxh=200, tr=14)
    l3 = word("PRESENTS", (72, 900), RED, tr=18)
    k1, k2, k3 = eout(tt / .25), eout((tt - .3) / .25), eout((tt - .65) / .25)
    paste_c(fr, l1, W / 2, H / 2 - 190, s=(1.25 - .25 * k1) * z, a=ease(tt / .12))
    paste_c(fr, l2, W / 2, H / 2 + 20, s=(1.25 - .25 * k2) * z, a=ease((tt - .3) / .12))
    d = ImageDraw.Draw(fr); lw = int(230 * k3)
    if lw > 2: d.line((W / 2 - lw, H / 2 + 150, W / 2 + lw, H / 2 + 150), fill=RED + (255,), width=6)
    paste_c(fr, l3, W / 2, H / 2 + 230, s=(1.2 - .2 * k3) * z, a=ease((tt - .65) / .12))
    sparkle(fr, tt, 40, 2)
    return fr

frame_cache = {}
def render(t):
    if t < PRE * B:
        fr = intro(t)
        if t < .3:   # opening hit shake
            a = 22 * math.exp(-t / .08); dx, dy = int(a * math.sin(t * 90)), int(a * math.cos(t * 70))
            fr = fr.resize((W + 60, H + 106), Image.BILINEAR).crop((30 + dx, 53 + dy, 30 + dx + W, 53 + dy + H))
        return finish(fr, t)
    t0 = t; t = t - PRE * B
    bi = int(t / B)
    fr = frame(t)
    if bi in (12, 15): frame_cache[bi] = fr          # keep last frame before wipes
    return finish(fr, t0)

if PREVIEW:
    os.makedirs(OUT, exist_ok=True)
    for bb in sorted(PREVIEW):
        for pb in (12, 15):                           # warm the wipe cache
            if bb > pb + 1 and pb not in frame_cache: frame_cache[pb] = frame((pb + .9) * B)
        render((bb + PRE) * B).save(os.path.join(OUT, f"b{bb:05.2f}.jpg"), quality=85)
    sys.exit()

nfr = int(round(DUR * FPS))
ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", MUSIC, "-filter_complex", "[1:a]loudnorm=I=-12:TP=-1.0:LRA=9,aresample=44100[a]", "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "192k", "-ar", "44100", "-ac", "2", "-movflags", "+faststart", "-t", f"{DUR:.3f}", OUT], stdin=subprocess.PIPE)
for i in range(nfr): ff.stdin.write(render(i / FPS).tobytes())
ff.stdin.close(); ff.wait(); print("done", OUT, round(DUR, 2))
