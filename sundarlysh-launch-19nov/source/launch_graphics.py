"""19 Nov launch graphics: reel cover, 3 stories, table-tent PDF (A4 -> folds to A5 tent).
usage: launch_graphics.py <outdir>"""
import sys, os, math, random
import numpy as np, qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance

S = "/tmp/claude-0/-home-user-Claude-Public-/e6dc3aa3-d0dd-5e70-ae91-a743f4ec6241/scratchpad"
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
FONTS = f"{S}/assets/fonts"; P7, P4 = f"{S}/v7/photos/", f"{S}/v4/photos/"; LOGO = f"{S}/v7/logo.jpg"
PLUM, PLUM_D, GOLD, GOLD_L, CREAM = (118, 22, 70), (30, 0, 16), (201, 165, 94), (240, 216, 160), (255, 244, 236)
IG_URL = "https://instagram.com/sundarlyshmemories"

def F(n, s, w=None):
    f = ImageFont.truetype(os.path.join(FONTS, n), s)
    if w is not None:
        try: f.set_variation_by_axes([w])
        except Exception: pass
    return f
CINZEL = lambda s, w=800: F("Cinzel-VF.ttf", s, w)
SANS = lambda s, w=700: F("Montserrat-VF.ttf", s, w)
PLAYI = lambda s, w=700: F("Playfair-Italic-VF.ttf", s, w)
_d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
def tw(s, f, tr=0): return sum(_d.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else _d.textlength(s, font=f)
def fit(s, mk, size, maxw, tr=0):
    while size > 14 and tw(s, mk(size), tr) > maxw: size -= 2
    return mk(size)
FOIL = [(0, (150, 112, 46)), (.22, (246, 225, 166)), (.42, (196, 154, 76)), (.6, (255, 243, 205)), (.8, (182, 139, 62)), (1, (236, 211, 146))]
def foil(w, h):
    xs = np.linspace(0, 1, w); g = np.zeros((w, 3))
    for (p0, c0), (p1, c1) in zip(FOIL, FOIL[1:]):
        m = (xs >= p0) & (xs <= p1); k = ((xs - p0) / (p1 - p0))[:, None]; g[m] = (np.array(c0) * (1 - k) + np.array(c1) * k)[m]
    return Image.fromarray(np.repeat(g[None], h, 0).astype(np.uint8))
def text_img(s, f, col, tr=0, glow=0.0, pad=40, gold=False, shadow=.6):
    a, d = f.getmetrics(); w = int(tw(s, f, tr)) + 2 * pad; h = a + d + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = pad
    if tr:
        for c in s: dr.text((x, pad), c, font=f, fill=col); x += _d.textlength(c, font=f) + tr
    else: dr.text((x, pad), s, font=f, fill=col)
    if gold: im = Image.merge("RGBA", (*foil(w, h).split(), im.getchannel("A")))
    al = im.getchannel("A"); layers = []
    if shadow:
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.putalpha(al.filter(ImageFilter.GaussianBlur(8)).point(lambda v: int(v * shadow))); layers.append(sh)
    if glow:
        g = Image.new("RGBA", im.size, GOLD_L + (0,)); g.putalpha(al.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * glow))); layers.append(g)
    for l in layers[::-1]: im = Image.alpha_composite(l, im)
    return im
def put(base, spr, cx, y):  # centred at cx, top at y (accounting for pad)
    base.alpha_composite(spr, (int(cx - spr.width / 2), int(y))); return y + spr.height
def pill(txt, size=34, pad_x=90, pad_y=44):
    t_ = text_img(txt, SANS(size, 800), PLUM_D, tr=6, pad=0, shadow=0); w, h = t_.width + pad_x, t_.height + pad_y
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=255)
    im = Image.merge("RGBA", (*foil(w, h).split(), m)); im.alpha_composite(t_, ((w - t_.width) // 2, (h - t_.height) // 2 - 3)); return im
def plum_bg(W, H, cy=.45):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * cy) / H) ** 2)[..., None]; k = np.clip((r - .08) * 1.6, 0, 1)
    return Image.fromarray((np.array(PLUM) * (1 - k) + np.array(PLUM_D) * k).astype(np.uint8)).convert("RGBA")
def sparkles(base, n=140, seed=3, area=None):
    rng = random.Random(seed); W, H = base.size; lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for _ in range(n):
        x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(1.5, 4.5) * W / 1080
        d.ellipse((x - r, y - r, x + r, y + r), fill=GOLD_L + (rng.randint(90, 230),))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(2 * W / 1080))); base.alpha_composite(lay)
def photo_bg(p, W, H, bright=.38, z=1.0):
    im = ImageOps.exif_transpose(Image.open(p)).convert("RGB"); im = ImageOps.fit(im, (int(W * z), int(H * z)), Image.LANCZOS)
    im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
    im = ImageEnhance.Brightness(im).enhance(bright).convert("RGBA")
    y, x = np.mgrid[0:H, 0:W].astype(np.float32); r = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H / 2) / H) ** 2)
    vig = Image.fromarray(np.dstack([np.zeros((H, W, 3)), np.clip((r - .25) * 1.6, 0, 1) * 255]).astype(np.uint8), "RGBA")
    im.alpha_composite(vig); return im
def logo(size):
    lg = Image.open(LOGO).convert("RGB").resize((size, size), Image.LANCZOS).convert("RGBA")
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32); r = np.sqrt((xx - size / 2) ** 2 + (yy - size / 2) ** 2) / (size / 2)
    lg.putalpha(Image.fromarray((np.clip((1 - r) / .14, 0, 1) * 255).astype(np.uint8))); return lg
def handle(base, y, size=40):
    put(base, text_img("@sundarlyshmemories", SANS(size, 700), (255, 255, 255), tr=1, shadow=.5), base.width / 2, y)
def save(im, name): im.convert("RGB").save(os.path.join(OUT, name), quality=93); print("saved", name)

W, H = 1080, 1920
# ---------------------------------------------------------------- 1) Reel cover (key info inside centre 1080x1350 grid crop)
c = photo_bg(P7 + "a_board.jpg", W, H, .36); sparkles(c, 160, 5)
c.alpha_composite(logo(180), ((W - 180) // 2, 250))
y = 470
y = put(c, pill("FIRST TIME EVER IN HYDERABAD", 34), W / 2, y) + 40
y = put(c, text_img("Something", PLAYI(140, 800), GOLD_L, glow=.8), W / 2, y) - 70
y = put(c, text_img("wonderful...", fit("wonderful...", PLAYI, 160, W - 120), GOLD_L, glow=.8), W / 2, y) - 40
y = put(c, text_img("is coming to", PLAYI(80, 600), CREAM, glow=.4), W / 2, y) - 50
y = put(c, text_img("HYDERABAD", fit("HYDERABAD", CINZEL, 150, W - 180, 10), (255, 255, 255), tr=10, glow=.9, gold=True), W / 2, y) - 20
put(c, text_img("29 · 11 · 2026", CINZEL(54, 700), CREAM, tr=10), W / 2, y)
handle(c, 1530, 36)
save(c, "01_reel_cover_1080x1920.jpg")
g = c.crop((0, (H - 1440) // 2, W, (H - 1440) // 2 + 1440)); save(g, "01b_cover_grid_check_3x4.jpg")

# ---------------------------------------------------------------- 2) Story: countdown (sticker goes in the gold frame)
s = photo_bg(P7 + "a_open.jpg", W, H, .34); sparkles(s, 150, 8)
y = 300
y = put(s, text_img("THE COUNTDOWN", CINZEL(84), (255, 255, 255), tr=8, glow=.7, gold=True), W / 2, y) - 60
y = put(s, text_img("BEGINS", CINZEL(84), (255, 255, 255), tr=8, glow=.7, gold=True), W / 2, y) - 10
y = put(s, text_img("Something wonderful is coming", fit("Something wonderful is coming", PLAYI, 62, W - 120), GOLD_L, glow=.4), W / 2, y) - 60
y = put(s, text_img("to Hyderabad", PLAYI(62, 700), GOLD_L, glow=.4), W / 2, y)
d = ImageDraw.Draw(s); d.rounded_rectangle((150, 960, W - 150, 1330), 36, outline=GOLD_L + (200,), width=4)
d.rounded_rectangle((168, 978, W - 168, 1312), 28, outline=GOLD + (120,), width=2)
put(s, text_img("Tap 'Remind me' on the countdown ↑", SANS(34, 600), CREAM, shadow=.6), W / 2, 1360)
handle(s, 1500)
save(s, "02_story_countdown.jpg")

# ---------------------------------------------------------------- 3) Story: poll
s = plum_bg(W, H, .4); sparkles(s, 130, 11)
ph = ImageOps.fit(ImageOps.exif_transpose(Image.open(P7 + "a_bags.jpg")).convert("RGB"), (660, 820), Image.LANCZOS).convert("RGBA")
m = Image.new("L", ph.size, 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 330, 659, 819), 0, fill=255); md.ellipse((0, 0, 659, 660), fill=255)
ph.putalpha(m); px, py = (W - 660) // 2, 250
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow); gd.rounded_rectangle((px - 14, py + 316, px + 674, py + 834), 0, fill=GOLD + (255,)); gd.ellipse((px - 14, py - 14, px + 674, py + 674), fill=GOLD + (255,))
s.alpha_composite(glow.filter(ImageFilter.GaussianBlur(3))); s.alpha_composite(ph, (px, py))
y = 1110
y = put(s, text_img("Ever made an", PLAYI(84, 800), GOLD_L, glow=.6), W / 2, y) - 70
y = put(s, text_img("ADVENT CALENDAR?", fit("ADVENT CALENDAR?", CINZEL, 92, W - 140, 5), (255, 255, 255), tr=5, glow=.7, gold=True), W / 2, y)
handle(s, 1640, 36)
save(s, "03_story_poll.jpg")

# ---------------------------------------------------------------- 4) Story / WhatsApp status: save the date
s = plum_bg(W, H, .47); sparkles(s, 150, 14)
s.alpha_composite(logo(220), ((W - 220) // 2, 260))
y = 520
y = put(s, pill("FIRST TIME EVER IN HYDERABAD", 30), W / 2, y) + 10
y = put(s, text_img("The Christmas", PLAYI(92, 800), GOLD_L, glow=.6), W / 2, y) - 60
y = put(s, text_img("ADVENT CALENDAR", fit("ADVENT CALENDAR", CINZEL, 90, W - 160, 6), (255, 255, 255), tr=6, glow=.7, gold=True), W / 2, y) - 60
y = put(s, text_img("WORKSHOP", CINZEL(116), (255, 255, 255), tr=14, glow=.7, gold=True), W / 2, y) + 10
top = y; yy = top + 20
yy = put(s, text_img("SAVE THE DATE", SANS(34, 800), GOLD_L, tr=9, shadow=0), W / 2, yy) - 50
yy = put(s, text_img("SUNDAY · 29 NOVEMBER", fit("SUNDAY · 29 NOVEMBER", CINZEL, 70, 760, 4), (255, 255, 255), tr=4, glow=.5, gold=True), W / 2, yy) - 55
yy = put(s, text_img("5 PM – 7 PM", CINZEL(56, 700), CREAM, tr=6), W / 2, yy) - 50
yy = put(s, text_img("Van Lavino Café & Patisserie", fit("Van Lavino Café & Patisserie", PLAYI, 60, 720), GOLD_L), W / 2, yy) - 52
yy = put(s, text_img("FINANCIAL DISTRICT, HYDERABAD", fit("FINANCIAL DISTRICT, HYDERABAD", SANS, 34, 680, 3), (255, 255, 255), tr=3, shadow=0), W / 2, yy)
bot = yy + 10; d = ImageDraw.Draw(s)
d.rounded_rectangle((110, top, W - 110, bot), 30, outline=GOLD + (255,), width=4); d.rounded_rectangle((126, top + 16, W - 126, bot - 16), 22, outline=GOLD_L + (130,), width=2)
put(s, text_img("Full details tomorrow", PLAYI(56, 600), CREAM), W / 2, bot + 10)
save(s, "04_story_save_the_date.jpg")

# ---------------------------------------------------------------- 5) Table tent (A4 portrait @300dpi, fold in the middle -> two A5 faces)
AW, AH = 2480, 3508; PH = AH // 2
def tent_face():
    f = plum_bg(AW, PH, .5); sparkles(f, 260, 21)
    d = ImageDraw.Draw(f); d.rounded_rectangle((70, 70, AW - 70, PH - 70), 50, outline=GOLD + (255,), width=10); d.rounded_rectangle((100, 100, AW - 100, PH - 100), 40, outline=GOLD_L + (140,), width=4)
    # left: text, right: QR
    lx = 880; TW_ = 1260; y = 300
    y = put(f, pill("FIRST TIME EVER IN HYDERABAD", 46, 120, 60), lx, y) + 40
    y = put(f, text_img("The Christmas", PLAYI(150, 800), GOLD_L, glow=.5), lx, y) - 100
    y = put(f, text_img("ADVENT CALENDAR", fit("ADVENT CALENDAR", CINZEL, 170, TW_, 10), (255, 255, 255), tr=10, glow=.6, gold=True), lx, y) - 100
    y = put(f, text_img("WORKSHOP", fit("WORKSHOP", CINZEL, 200, TW_ - 100, 24), (255, 255, 255), tr=24, glow=.6, gold=True), lx, y) + 10
    y = put(f, text_img("SUNDAY 29 NOV · 5–7 PM · RIGHT HERE", fit("SUNDAY 29 NOV · 5–7 PM · RIGHT HERE", SANS, 80, TW_, 6), (255, 255, 255), tr=6), lx, y) - 20
    y = put(f, text_img("₹1,399 per person · includes a ₹500 food voucher", fit("₹1,399 per person · includes a ₹500 food voucher", PLAYI, 76, TW_), GOLD_L), lx, y) - 50
    put(f, text_img("24 props & gifts · make your own gift bags or goodies box", fit("24 props & gifts · make your own gift bags or goodies box", SANS, 52, TW_, 1), CREAM, tr=1), lx, y)
    q = qrcode.QRCode(border=2, box_size=20, error_correction=qrcode.constants.ERROR_CORRECT_M); q.add_data(IG_URL); q.make(fit=True)
    qi = q.make_image(fill_color=(30, 0, 16), back_color=(255, 250, 240)).convert("RGBA").resize((540, 540), Image.NEAREST)
    QX = 1950; qx, qy = QX - 270, 420
    d.rounded_rectangle((qx - 26, qy - 26, qx + 566, qy + 566), 30, fill=GOLD + (255,)); f.alpha_composite(qi, (qx, qy))
    put(f, text_img("SCAN TO BOOK", fit("SCAN TO BOOK", CINZEL, 76, 560, 8), (255, 255, 255), tr=8, gold=True, glow=.4), QX, qy + 570)
    put(f, text_img("DM us on Instagram", fit("DM us on Instagram", PLAYI, 58, 560), CREAM), QX, qy + 690)
    put(f, text_img("@sundarlyshmemories", fit("@sundarlyshmemories", SANS, 54, 580, 1), (255, 255, 255), tr=1), QX, qy + 790)
    return f
face = tent_face()
a4 = Image.new("RGB", (AW, AH), (255, 255, 255)); a4.paste(face.rotate(180).convert("RGB"), (0, 0)); a4.paste(face.convert("RGB"), (0, PH))
dd = ImageDraw.Draw(a4)
for x in range(0, AW, 60): dd.line((x, PH, x + 30, PH), fill=(201, 165, 94), width=3)   # fold guide
a4.save(os.path.join(OUT, "05_table_tent_A4_fold_to_A5.pdf"), resolution=300); face.convert("RGB").resize((1240, 877)).save(os.path.join(OUT, "05b_table_tent_preview.jpg"), quality=90)
print("saved tent")
