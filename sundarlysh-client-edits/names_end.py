import sys, os, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]; PREV = "--preview" in sys.argv
S = "/tmp/claude-0/-home-user-Claude-Public-/e6dc3aa3-d0dd-5e70-ae91-a743f4ec6241/scratchpad"; FD = S + "/assets/fonts"
W, H, FPS = 1080, 1920, 60; T0 = 6.6; HOLD = 1.5
D0 = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], capture_output=True, text=True).stdout)
END = D0 + HOLD; ODUR = END - T0
def ease(x): x = min(max(x, 0), 1); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def txt(s, font, size, col, glow, gr=22, var=None, tr=0):
    f = ImageFont.truetype(f"{FD}/{font}", size)
    if var:
        try: f.set_variation_by_axes(var)
        except Exception: pass
    d0 = ImageDraw.Draw(Image.new("L", (1, 1)))
    w = sum(d0.textlength(c, font=f) for c in s) + tr * (len(s) - 1) if tr else d0.textlength(s, font=f)
    a, de = f.getmetrics(); pad = 80
    m = Image.new("L", (int(w) + 2 * pad, a + de + 2 * pad), 0); d = ImageDraw.Draw(m); x = pad
    if tr:
        for c in s: d.text((x, pad), c, font=f, fill=255); x += d0.textlength(c, font=f) + tr
    else: d.text((pad, pad), s, font=f, fill=255)
    m = m.crop(m.getbbox()); m2 = Image.new("L", (m.width + 2 * pad, m.height + 2 * pad), 0); m2.paste(m, (pad, pad)); m = m2
    g = Image.new("RGBA", m.size, glow + (0,)); g.putalpha(m.filter(ImageFilter.GaussianBlur(gr)).point(lambda v: min(255, int(v * 1.8))))
    sh = Image.new("RGBA", m.size, (40, 10, 0, 0)); sm = Image.new("L", m.size, 0); sm.paste(m, (0, 6)); sh.putalpha(sm.filter(ImageFilter.GaussianBlur(8)).point(lambda v: int(v * .6)))
    t = Image.new("RGBA", m.size, col + (0,)); t.putalpha(m)
    g.alpha_composite(sh); g.alpha_composite(t); return g
GOLD, CREAM, MAROON = (255, 214, 120), (255, 250, 238), (150, 20, 40)
ROHAN = txt("Rohan", "GreatVibes-Regular.ttf", 230, CREAM, (255, 170, 40))
KAVITA = txt("Kavita", "GreatVibes-Regular.ttf", 230, CREAM, (255, 170, 40))
WEDS = txt("weds", "Cinzel-VF.ttf", 64, GOLD, (200, 90, 10), gr=14, var=[700], tr=18)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H * .40) / (H * .40)) ** 2)
VIG = np.clip(1 - r, 0, 1) ** 1.2
rng = random.Random(5)
PET = [(rng.uniform(0, W), rng.uniform(-H, H * .3), rng.uniform(12, 26), rng.uniform(220, 420), rng.uniform(0, 6.3), rng.choice([(255, 140, 0), (255, 190, 20), (255, 110, 10), (250, 220, 90)])) for _ in range(60)]
def paste(fr, sp, cx, cy, a, s=1.0):
    if a <= 0.004: return
    if abs(s - 1) > .002: sp = sp.resize((int(sp.width * s), int(sp.height * s)), Image.BILINEAR)
    sp = sp.copy(); sp.putalpha(sp.getchannel("A").point(lambda v: int(v * a)))
    fr.alpha_composite(sp, (int(cx - sp.width / 2), int(cy - sp.height / 2)))
def frame(u):  # u = seconds since T0
    fr = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    k = ease(u / .8)
    glow = np.zeros((H, W, 4), np.uint8); glow[..., 0] = 70; glow[..., 1] = 25; glow[..., 2] = 0
    glow[..., 3] = (VIG * 150 * k + 60 * k).clip(0, 255).astype(np.uint8)   # warm soft darkening, stronger at centre
    fr.alpha_composite(Image.fromarray(glow, "RGBA"))
    d = ImageDraw.Draw(fr); lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
    for x0, y0, rr, sp, ph, c in PET:
        y = y0 + u * sp; x = x0 + 40 * math.sin(u * 1.6 + ph); a = u * 2 + ph
        if -60 < y < H + 60:
            pts = [(x + rr * math.cos(a + q) * (1 if i % 2 == 0 else .5), y + rr * math.sin(a + q) * (1 if i % 2 == 0 else .5)) for i, q in enumerate(np.linspace(0, 2 * math.pi, 10, endpoint=False))]
            dl.polygon(pts, fill=c + (int(230 * ease(u / .5)),))
    fr.alpha_composite(lay)
    cy = H * .40
    paste(fr, ROHAN, W / 2, cy - 170 + (1 - eout((u - .25) / .7)) * 40, ease((u - .25) / .6))
    a2 = ease((u - .75) / .5); lw = int(150 * eout((u - .75) / .6))
    if lw > 2:
        for sgn in (-1, 1):
            x1 = W / 2 + sgn * 120; d.line((x1, cy, x1 + sgn * lw, cy), fill=GOLD + (int(230 * a2),), width=3)
        d.ellipse((W / 2 - 150 - lw - 6, cy - 6, W / 2 - 150 - lw + 6, cy + 6), fill=GOLD + (int(230 * a2),)) if False else None
    paste(fr, WEDS, W / 2, cy, a2, s=1.15 - .15 * eout((u - .75) / .5))
    paste(fr, KAVITA, W / 2, cy + 175 + (1 - eout((u - 1.1) / .7)) * 40, ease((u - 1.1) / .6))
    return fr
if PREV:
    os.makedirs(OUT, exist_ok=True)
    for u in (.5, 1.2, 2.0, 3.5):
        base = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(min(T0 + u, D0 - .05)), "-i", SRC, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"], capture_output=True).stdout
        b = Image.frombytes("RGBA", (W, H), base); b.alpha_composite(frame(u)); b.convert("RGB").save(f"{OUT}/p{u}.jpg", quality=88)
    sys.exit()
ov = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "qtrle", OUT + ".ov.mov"], stdin=subprocess.PIPE)
n = int(round(ODUR * FPS))
for i in range(n): ov.stdin.write(frame(i / FPS).tobytes())
ov.stdin.close(); ov.wait()
fc = (f"[0:v]tpad=stop_mode=clone:stop_duration={HOLD},setpts=PTS-STARTPTS[v0];[1:v]setpts=PTS-STARTPTS+{T0}/TB[ov];"
      f"[v0][ov]overlay=0:0:eof_action=pass:enable='gte(t,{T0})',format=yuv420p[v];"
      f"[0:a]apad=pad_dur={HOLD},afade=t=out:st={D0 - .4}:d={HOLD + .4}[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-i", OUT + ".ov.mov", "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", f"{END:.3f}",
                "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-r", "60", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT], check=True)
os.remove(OUT + ".ov.mov"); print("done", OUT, round(END, 2))
