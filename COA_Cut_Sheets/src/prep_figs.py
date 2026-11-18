# Main diagram of each answer -> trimmed, pure black & white, thickened lines for B/W printing.
import os, re, sys
from PIL import Image, ImageOps, ImageFilter
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
first = {}
for f in os.listdir(src):
    m = re.match(r'(U\dQ\d+)_f(\d+)\.png', f)
    if m and (m.group(1) not in first or int(m.group(2)) < first[m.group(1)][0]): first[m.group(1)] = (int(m.group(2)), f)
for key, (_, f) in sorted(first.items()):
    im = Image.open(os.path.join(src, f)).convert('L')
    w, h = im.size; im = im.crop((int(w * 0.012), int(h * 0.015), int(w * 0.988), h))   # drop container border
    im = ImageOps.autocontrast(im, cutoff=1)
    import numpy as np
    g = np.array(im).astype(np.int32)
    # dark filled boxes (white text on dark fill): invert them so text prints black on white
    dark = (g < 200).astype(np.int32); k = 41
    c = np.pad(dark, ((k // 2 + 1, k // 2), (k // 2 + 1, k // 2))).cumsum(0).cumsum(1)
    win = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
    fill = win > 0.80 * k * k
    if fill.any():
        f_ = fill.astype(np.int32)
        c2 = np.pad(f_, ((k // 2 + 1, k // 2), (k // 2 + 1, k // 2))).cumsum(0).cumsum(1)
        fill = (c2[k:, k:] - c2[:-k, k:] - c2[k:, :-k] + c2[:-k, :-k]) > 0
        g = np.where(fill, 255 - g, g)
    im = Image.fromarray(g.clip(0, 255).astype(np.uint8))
    bw = im.point(lambda v: 0 if v < 205 else 255)           # anything not near-white -> black (coloured lines/text)
    bw = bw.filter(ImageFilter.MinFilter(3))                   # thicken strokes ~1 px at 600 dpi
    bbox = ImageOps.invert(bw).getbbox()
    if bbox: bw = bw.crop((max(0, bbox[0] - 4), max(0, bbox[1] - 4), min(bw.width, bbox[2] + 4), min(bw.height, bbox[3] + 4)))
    # drop leftover caption fragments: short text bands at the very bottom separated by white space
    import numpy as np
    for _ in range(3):
        a = np.array(bw) < 128; rows = a.sum(1) > 0
        bands, y = [], 0
        while y < len(rows):
            if rows[y]:
                y0 = y
                while y < len(rows) and rows[y]: y += 1
                bands.append((y0, y))
            else: y += 1
        if len(bands) >= 2:
            last, prev = bands[-1], bands[-2]
            if last[1] - last[0] < 0.09 * bw.height and last[0] - prev[1] > 0.02 * bw.height:
                bw = bw.crop((0, 0, bw.width, prev[1] + 4)); continue
            first_, nxt = bands[0], bands[1]
            if first_[1] - first_[0] < 0.07 * bw.height and nxt[0] - first_[1] > 0.025 * bw.height and first_[0] < 8:
                bw = bw.crop((0, max(0, nxt[0] - 4), bw.width, bw.height))
    bw.convert('1').save(os.path.join(dst, key + '.png'), optimize=True)
print(len(first), 'diagrams')
