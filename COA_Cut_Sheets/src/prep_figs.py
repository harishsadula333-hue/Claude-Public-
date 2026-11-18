# Main diagram of each answer -> trimmed, high-contrast grayscale PNG for black & white printing.
import os, re, sys
from PIL import Image, ImageOps, ImageEnhance
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
first = {}
for f in os.listdir(src):
    m = re.match(r'(U\dQ\d+)_f(\d+)\.png', f)
    if m and (m.group(1) not in first or int(m.group(2)) < first[m.group(1)][0]): first[m.group(1)] = (int(m.group(2)), f)
for key, (_, f) in sorted(first.items()):
    im = Image.open(os.path.join(src, f)).convert('L')
    w, h = im.size; im = im.crop((int(w * 0.01), int(h * 0.02), int(w * 0.99), int(h * 0.98)))   # drop container border
    bw = im.point(lambda v: 255 if v > 238 else v)            # pastel backgrounds -> white
    bbox = ImageOps.invert(bw).getbbox()
    if bbox: bw = bw.crop(bbox)
    bw = ImageEnhance.Contrast(bw).enhance(1.8)
    bw = bw.point(lambda v: 255 if v > 200 else max(0, int(v * 0.55)))   # darken lines & text
    bw.save(os.path.join(dst, key + '.png'), optimize=True)
print(len(first), 'diagrams')
