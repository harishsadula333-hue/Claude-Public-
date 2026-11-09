import numpy as np
from PIL import Image
from scipy import ndimage as ndi
im = np.asarray(Image.open('/root/.claude/uploads/41a71cf2-5581-53bc-88f3-dbebe345aab3/2fd1b745-image.jpg').convert('RGB')).astype(float)
a = np.max(255 - im, axis=2) / 255.0
mask = a > 0.35
lab, n = ndi.label(mask)
print('components', n)
objs = ndi.find_objects(lab)
rows = []
for i, sl in enumerate(objs, 1):
    m = lab[sl] == i
    area = m.sum()
    if area < 30: continue
    px = im[sl][m]
    al = a[sl][m][:, None]
    F = np.clip((px - (1 - al) * 255) / np.maximum(al, 1e-3), 0, 255)
    rows.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, area, F.mean(0).astype(int), F.min(0).astype(int), F.max(0).astype(int), i))
rows.sort(key=lambda r: (r[1] > 1030, r[0]))
for r in rows: print(r[8], 'x', r[0], r[2], 'y', r[1], r[3], 'area', r[4], 'mean', r[5])
np.save('lab.npy', lab); np.save('alpha.npy', a)
