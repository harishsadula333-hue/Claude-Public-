# Extra traced parts for the merged lockups: SUND and Rlysh.
import numpy as np, json
exec(open('prep.py').read().split("lab = np.load('lab.npy')")[0])  # reuse trace()
lab = np.load('lab.npy')
meta = json.load(open('meta.json'))
yy, xx = np.mgrid[0:lab.shape[0], 0:lab.shape[1]]
meta['SUND'] = trace('SUND', 62, 642, 749, 1000, sel=np.isin(lab, [5, 16, 17, 18]))
meta['Rlysh'] = trace('Rlysh', 928, 655, 1495, 1053, sel=((lab == 1) & (xx >= 928) & (yy >= 655)))
json.dump(meta, open('meta.json', 'w'), indent=1)
print(meta['SUND'], meta['Rlysh'])
