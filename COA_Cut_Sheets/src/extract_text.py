import sys, json, pymupdf, re
exec(open('src/build.py').read().split("# ---------- 2.")[0].replace("SRC, MARKS, OUTDIR = sys.argv[1], sys.argv[2], sys.argv[3]", "SRC, MARKS, OUTDIR = sys.argv[1], sys.argv[2], sys.argv[3]"))
for u in sorted(units):
    for i, q in enumerate(units[u]):
        txt = []
        for p, a, b in segments(q[0], q[1], q[2]):
            t = src[p].get_text("text", clip=pymupdf.Rect(CX0, a, CX1, b))
            txt.append(t)
        t = re.sub(r"[ \t]+", " ", "\n".join(txt)); t = re.sub(r"\n\s*\n+", "\n", t)
        open(f"{OUTDIR}/U{u}Q{i+1}.txt", "w").write(t)
