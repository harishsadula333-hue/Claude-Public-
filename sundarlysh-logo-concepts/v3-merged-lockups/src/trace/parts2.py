import numpy as np, json
exec(open('prep.py').read().split("lab = np.load('lab.npy')")[0])
lab = np.load('lab.npy')
meta = json.load(open('meta.json'))
yy, xx = np.mgrid[0:lab.shape[0], 0:lab.shape[1]]
sel = (lab == 1) & (xx < 928) & ~((xx > 880) & (yy < 660))
meta['Astar'] = trace('Astar', 190, 515, 928, 1056, sel=sel)
json.dump(meta, open('meta.json', 'w'), indent=1)
print(meta['Astar'])
