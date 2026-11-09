# Build tracing bitmaps + colour fields from the original logo.
import numpy as np, subprocess, json, sys
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
SRC = '/root/.claude/uploads/41a71cf2-5581-53bc-88f3-dbebe345aab3/2fd1b745-image.jpg'
im = np.asarray(Image.open(SRC).convert('RGB')).astype(float)
a = np.max(255 - im, axis=2) / 255.0
a = np.clip((a - 0.04) / 0.96, 0, 1)            # kill faint jpeg haze
F = np.clip((im - (1 - a[..., None]) * 255) / np.maximum(a[..., None], 1e-3), 0, 255)

def trace(name, x0, y0, x1, y1, sel=None):
    pad = 6
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
    aa = a[y0:y1, x0:x1].copy()
    if sel is not None: aa = aa * sel[y0:y1, x0:x1]
    ink = (255 * (1 - aa)).astype(np.uint8)
    Image.fromarray(ink).save(f'{name}.pgm')
    subprocess.run(f'mkbitmap -n -s 4 -t 0.5 {name}.pgm -o {name}.pbm', shell=True, check=True)
    subprocess.run(f'potrace {name}.pbm -b svg -t 12 -a 1.0 -O 0.35 --flat -o {name}.potrace.svg', shell=True, check=True)
    # colour field: colours of solid ink, extended outward by nearest neighbour
    Fr = im[y0:y1, x0:x1]; valid = aa > 0.7
    idx = ndi.distance_transform_edt(~valid, return_distances=False, return_indices=True)
    field = Fr[idx[0], idx[1]]
    field = ndi.gaussian_filter(field, sigma=(1.2, 1.2, 0))
    Image.fromarray(field.astype(np.uint8)).save(f'{name}.field.png')
    return dict(name=name, x0=x0, y0=y0, w=x1 - x0, h=y1 - y0, scale=4)

lab = np.load('lab.npy')
meta = {}
meta['main'] = trace('main', 62, 522, 1495, 1053, sel=(lab == 1) | (lab == 5) | (lab == 16) | (lab == 17) | (lab == 18))
tag = np.isin(lab, [19,20,21,22,23,24,25,26,27,28,29,30,31,35,36])
meta['tag'] = trace('tag', 222, 1045, 1393, 1085, sel=tag)
meta['S'] = trace('S', 62, 642, 314, 1000, sel=(lab == 5))
json.dump(meta, open('meta.json', 'w'), indent=1)
print(meta)
