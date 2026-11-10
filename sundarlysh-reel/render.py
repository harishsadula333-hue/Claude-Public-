import sys, os, json, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=sys.argv[1]; imgdir=sys.argv[2]; out=sys.argv[3]
A=f"{S}/assets"; W,H,FPS=720,1280,30
TOTAL=297; CUT_END=225  # 7.5s of cuts, then logo
random.seed(7); rng=np.random.default_rng(7)

# ---------- crumpled paper card ----------
CW,CH=346,250; CX,CY=(W-CW)//2,515
def noise(h,w,scale):
    n=rng.random((h//scale+3,w//scale+3)).astype(np.float32)
    im=Image.fromarray((n*255).astype(np.uint8)).resize((w+3*scale,h+3*scale),Image.BICUBIC)
    a=np.asarray(im,np.float32)/255; return a[scale:scale+h,scale:scale+w]
hgt=sum(noise(CH,CW,s)*wt for s,wt in [(90,1.0),(45,0.6),(22,0.35),(10,0.15)])
# sharp creases: abs of noise ridges
cre=sum(np.abs(noise(CH,CW,s)-0.5)*wt for s,wt in [(70,0.9),(35,0.5)])
hgt=hgt-1.6*cre
gy,gx=np.gradient(hgt)
light=(gx*-0.7+gy*-0.7)*9
base=np.array([231,218,196],np.float32)
paper=base[None,None,:]*(1+light[...,None]*0.13)
paper+=rng.normal(0,2.2,(CH,CW,1))
paper=np.clip(paper,0,255).astype(np.uint8)
card=Image.fromarray(paper).filter(ImageFilter.GaussianBlur(0.6)).convert("RGBA")

FONT=f"{A}/fonts/Italiana-Regular.ttf.ttf"
def f(sz): return ImageFont.truetype(FONT,sz)
INK=(74,50,38,255)
# (text, font size, center y within card, appear frame)
lines=[("This is",31,40,30,"L1a"),("your sign",31,40,54,"L1b"),
       ("to share your",19,66,78,None),
       ("Wedding",52,112,102,None),("Moodboard",52,160,102,None),
       ("with",30,210,126,"L5a"),("Us",30,210,150,"L5b")]
def line_x(full,font):
    d=ImageDraw.Draw(Image.new("L",(1,1))); return (CW-d.textlength(full,font=font))/2
def card_at(fr):
    c=card.copy(); d=ImageDraw.Draw(c)
    for txt,sz,cy,t0,key in lines:
        if fr<t0: continue
        fo=f(sz)
        full={"L1a":"This is your sign","L1b":"This is your sign","L5a":"with Us","L5b":"with Us"}.get(key,txt)
        x0=line_x(full,fo)
        if key in("L1b","L5b"):
            pre=full[:len(full)-len(txt)]; x0+=d.textlength(pre,font=fo)
        d.text((x0,cy),txt,font=fo,fill=INK,anchor="ls" if False else "lm")
    return c

# ---------- images ----------
files=sorted(os.path.join(imgdir,x) for x in os.listdir(imgdir) if x.lower().endswith((".jpg",".jpeg",".png")))
def cover(p):
    im=Image.open(p).convert("RGB"); r=max(W/im.width,H/im.height)
    im=im.resize((round(im.width*r+0.5),round(im.height*r+0.5)),Image.LANCZOS)
    l=(im.width-W)//2; t=(im.height-H)//2; return im.crop((l,t,l+W,t+H))
frames_imgs=[cover(p) for p in files]
# cut schedule: alternating 4/3 frames
sched=[]; fr=0; k=0
order=list(range(len(frames_imgs)))
seq=[]
while len(seq)<80:
    random.shuffle(order)
    if seq and order[0]==seq[-1]: order.reverse()
    seq+=order
first=[i for i,p in enumerate(files) if os.path.basename(p).startswith(os.environ.get('FIRST','~'))]
if first:
    j=seq.index(first[0]); seq[0],seq[j]=seq[j],seq[0]
while fr<CUT_END:
    d=4 if k%2==0 else 3; sched.append((fr,min(fr+d,CUT_END),seq[k])); fr+=d; k+=1
print("cuts",len(sched),"images",len(frames_imgs),file=sys.stderr)

# ---------- logo end card ----------
BG=(249,245,242)
logo=Image.open(sys.argv[4]).convert("RGB")
LS=W; logo=logo.resize((LS,LS),Image.LANCZOS)
m=np.ones((LS,),np.float32); ramp=np.linspace(0,1,70); m[:70]=ramp; m[-70:]=ramp[::-1]
mask=Image.fromarray((np.outer(m,np.ones(LS))*255).astype(np.uint8))
end=Image.new("RGB",(W,H),BG); end.paste(logo,(0,(H-LS)//2),mask)

ff=subprocess.Popen(["ffmpeg","-loglevel","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
    "-i",f"{A}/music.m4a","-map","0:v","-map","1:a","-c:v","libx264","-preset","slow","-crf","18","-pix_fmt","yuv420p",
    "-profile:v","high","-c:a","aac","-b:a","160k","-t","9.889","-movflags","+faststart",out],stdin=subprocess.PIPE)
cache={}
for fr in range(TOTAL):
    if fr<CUT_END:
        idx=next(i for a,b,i in sched if a<=fr<b)
        frame=frames_imgs[idx].copy()
        key=sum(1 for l in lines if fr>=l[3])
        if key not in cache: cache[key]=card_at(fr)
        frame.paste(cache[key],(CX,CY),cache[key])
    else:
        frame=end
    ff.stdin.write(frame.tobytes())
ff.stdin.close(); ff.wait(); print("done",out)
