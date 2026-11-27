import numpy as np
from PIL import Image
U="/root/.claude/uploads/0b3c1eb4-cf1f-5a10-bd16-dacd864cc5e5/"
A="assets/"
def bbox_dark(im, thr=40):
    a=np.asarray(im.convert("RGB")).astype(int)
    m=(a.max(2)<thr)
    rows=np.where(m.mean(1)>0.6)[0]; cols=np.where(m.mean(0)>0.6)[0]
    return cols[0],rows[0],cols[-1],rows[-1]
# Glassmates logo: crop black square, convert black->alpha
lg=Image.open(U+"e979cf21-image.jpg").convert("RGB")
x0,y0,x1,y1=bbox_dark(lg); print("logo black box",x0,y0,x1,y1)
lg=lg.crop((x0+15,y0+15,x1-15,y1-15))
a=np.asarray(lg).astype(np.float32)/255
al=a.max(2); al=np.clip((al-0.06)/0.94,0,1)
rgb=np.where(al[...,None]>0, a/np.maximum(al[...,None],1e-3), 0); rgb=np.clip(rgb,0,1)
out=np.dstack([rgb,al])
im=Image.fromarray((out*255).astype(np.uint8),"RGBA")
im=im.crop(im.getbbox()); im.save(A+"glassmates_logo.png"); print("logo",im.size)
# Bow from the cheers banner: white->alpha
bn=Image.open(U+"6e2cf204-image.jpg").convert("RGB")
bow=bn.crop((230,195,880,255))
a=np.asarray(bow).astype(np.float32)/255
al=np.clip((1-a.min(2)-0.05)/0.95,0,1)
rgb=np.where(al[...,None]>0,(a-(1-al[...,None]))/np.maximum(al[...,None],1e-3),0); rgb=np.clip(rgb,0,1)
im=Image.fromarray((np.dstack([rgb,al])*255).astype(np.uint8),"RGBA"); im=im.crop(im.getbbox())
im.save(A+"bow.png"); print("bow",im.size)
# Visa Tree logo: trim white
vt=Image.open(U+"9e75a799-image.jpg").convert("RGB")
inv=Image.fromarray(255-np.asarray(vt)); bb=inv.point(lambda v:255 if v>25 else 0).getbbox()
vt.crop((bb[0]-10,bb[1]-10,bb[2]+10,bb[3]+10)).save(A+"visatree_logo.png"); print("visatree",bb)
# Photos
p=Image.open(U+"f699a19f-image.jpg").convert("RGB"); p.thumbnail((1800,1800)); p.save(A+"founders.jpg",quality=92); print("founders",p.size)
p=Image.open(U+"fc2ce1cb-image.jpg").convert("RGB"); p.thumbnail((1700,2266)); p.save(A+"sponsor_trio.jpg",quality=92); print("trio",p.size)
