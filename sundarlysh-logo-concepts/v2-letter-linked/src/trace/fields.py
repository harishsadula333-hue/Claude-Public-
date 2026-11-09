# Recoloured colour fields: 'dark' (wine -> ivory for dark backgrounds)
import numpy as np, json
from PIL import Image
meta = json.load(open('meta.json'))
def clip(x): return np.clip(x, 0, 1)
for k in meta:
    F = np.asarray(Image.open(f'{k}.field.png')).astype(float)
    R, G, B = F[..., 0], F[..., 1], F[..., 2]
    p = clip((R - 150) / 50) * clip((B - G + 10) / 40) * (G < 120)
    g = clip((G - 25) / 50)
    w = 1 - np.maximum(p, g)
    ivory = np.array([250, 238, 222.0])
    D = F + w[..., None] * (ivory - F)
    # lift gold slightly so it sings on dark grounds
    D = D + (g * (1 - p))[..., None] * (np.array([255, 214, 120.0]) - D) * 0.25
    Image.fromarray(np.clip(D, 0, 255).astype(np.uint8)).save(f'{k}.dark.png')
    # solid-gold version weight map not needed; vector fill handles that
print('ok')
