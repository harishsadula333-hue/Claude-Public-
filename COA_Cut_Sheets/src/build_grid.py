# COA long-answer cut sheets.
# One sheet per unit: FRONT page = Q1..Q5 (rows, top to bottom), BACK page = Q6..Q10 (same rows).
# After a long-edge flip, row r on the front backs onto row r on the back (Q1<->Q6, Q2<->Q7, ...).
# The original vector content is placed as-is (nothing retyped): every answer is split at natural
# gaps (paragraphs, table rows, figure boxes) and flowed into newspaper columns inside its box.
import sys, json, pymupdf

SRC, MARKS, OUTDIR = sys.argv[1], sys.argv[2], sys.argv[3]
src = pymupdf.open(SRC)
marks = json.load(open(MARKS))

PW, PH = 595.28, 841.89          # A4 portrait (pt)
MX, MY = 14.17, 14.17            # 5 mm page margins
SAFE = 2.5                       # blank gap inside every cut line (pt)
TAGH = 7.0                       # height of the small "UNIT k · Qn" tag line
CX0, CX1 = 40.0, 556.0           # content x-range on the source pages
TOPY, FOOTY = 40.0, 803.0        # content y-range (header/footer excluded)
COLGAP = 2.0                     # gap between columns (pt, output)
MAXGAP = 5.0                     # paragraph gap kept between pieces (pt, source units)

# ---------- 1. where every long answer lives ----------
units, cur = {}, None
seq = [m for m in marks if m[0] in ("UNIT", "LQ", "PART")]
for i, m in enumerate(seq):
    if m[0] == "UNIT": cur = int(m[3].split()[1].rstrip(":")); units[cur] = []
    if m[0] == "LQ": units[cur].append([m[1], m[2], None])
for u, qs in units.items():
    for i, q in enumerate(qs):
        if i + 1 < len(qs): q[2] = (qs[i + 1][0], qs[i + 1][1])
        else:
            nxt = [m for m in seq if m[0] == "UNIT" and int(m[3].split()[1].rstrip(":")) == u + 1]
            q[2] = (nxt[0][1], nxt[0][2]) if nxt else (len(src) - 1, FOOTY)

def segments(start_p, start_y, end):
    ep, ey = end
    out = []
    for p in range(start_p, ep + 1):
        y0 = start_y - 2 if p == start_p else TOPY
        y1 = ey - 2 if p == ep else FOOTY
        if y1 - y0 > 2: out.append((p, y0, y1))
    return out

# ---------- 2. split into atomic pieces at blank horizontal gaps ----------
def atoms_of(p, y0, y1):
    page = src[p]
    iv = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            a, c = l["bbox"][1], l["bbox"][3]
            if c > y0 and a < y1 and "".join(s["text"] for s in l["spans"]).strip(): iv.append((a, c))
    for d in page.get_drawings():
        r = d["rect"]
        if r.height < 700 and r.y1 > y0 and r.y0 < y1 and r.width > 0.5: iv.append((r.y0, r.y1))
    for im in page.get_image_info():
        r = pymupdf.Rect(im["bbox"])
        if r.y1 > y0 and r.y0 < y1: iv.append((r.y0, r.y1))
    iv = sorted((max(a, y0), min(c, y1)) for a, c in iv)
    merged = []
    for a, c in iv:
        if merged and a < merged[-1][1] - 0.3: merged[-1][1] = max(merged[-1][1], c)
        else: merged.append([a, c])
    return [(p, a - 0.6, c + 0.6) for a, c in merged if c - a > 0.5]

def pieces(q):
    p0, y0, end = q
    out = []
    for p, a, b in segments(p0, y0, end): out += atoms_of(p, a, b)
    return out

# ---------- 3. column packing ----------
W0 = CX1 - CX0
def pack(atoms, s, bw, bh):
    """Flow atoms into columns at scale s. Returns placements or None if it doesn't fit."""
    colw = W0 * s
    ncol = int((bw + COLGAP) // (colw + COLGAP))
    if ncol < 1: return None
    gap = (bw - ncol * colw) / max(ncol - 1, 1) if ncol > 1 else 0
    col, y, out, prev = 0, 0.0, [], None
    for (p, a, b) in atoms:
        h = (b - a) * s
        if h > bh: return None
        g = 0.0
        if prev is not None and prev[0] == p and y > 0: g = min(a - prev[2], MAXGAP) * s
        elif y > 0: g = MAXGAP * s * 0.6
        if y + g + h > bh:
            col += 1; y = 0.0; g = 0.0
            if col >= ncol: return None
        x = col * (colw + gap)
        out.append((p, a, b, x, y + g, colw, h))
        y += g + h; prev = (p, a, b)
    return out

def best_fit(atoms, bw, bh):
    lo, hi = 0.05, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        (lo, hi) = (mid, hi) if pack(atoms, mid, bw, bh) else (lo, mid)
    return lo, pack(atoms, lo, bw, bh)

# ---------- 4. grid pages: rows = units, front cols Q1..Q5, back cols Q6..Q10 ----------
import os
ROWH = float(os.environ.get("ROWH", 80.5))      # pt per unit row (80.5pt = 28.4mm -> grid fits in half page)
GX0, GY0 = MX, MY
COLW = (PW - 2 * MX) / 5
TAGH = 4.2
out_front, out_back = pymupdf.open(), pymupdf.open()
pf, pb = out_front.new_page(width=PW, height=PH), out_back.new_page(width=PW, height=PH)
report = []
for side, page, order in (("F", pf, [0, 1, 2, 3, 4]), ("B", pb, [5, 6, 7, 8, 9])):
    for r, u in enumerate(sorted(units)):
        qs = units[u]
        for c, qi in enumerate(order):
            x, y = GX0 + c * COLW, GY0 + r * ROWH
            bx, by, bw, bh = x + SAFE, y + SAFE + TAGH, COLW - 2 * SAFE, ROWH - 2 * SAFE - TAGH
            atoms = pieces(qs[qi])
            sc, pl = best_fit(atoms, bw, bh)
            report.append((side, u, qi + 1, round(sc * 10.5, 2)))
            page.insert_text((x + SAFE, y + SAFE + 3.2), f"U{u} · Q{qi + 1}", fontsize=3.6, fontname="hebo")
            for (p, a_, b_, xx, yy, cw, hh) in pl:
                page.show_pdf_page(pymupdf.Rect(bx + xx, by + yy, bx + xx + cw, by + yy + hh), src, p,
                                   clip=pymupdf.Rect(CX0, a_, CX1, b_), keep_proportion=True)
    for i in range(6):
        page.draw_line((GX0 + i * COLW, GY0 - 8), (GX0 + i * COLW, GY0 + 5 * ROWH + 8), width=0.4)
        page.draw_line((GX0 - 8, GY0 + i * ROWH), (PW - MX + 8, GY0 + i * ROWH), width=0.4)
suf = os.environ.get("SUF", "_Half")
out_front.save(f"{OUTDIR}/COA_Grid_Front_Q1-Q5{suf}.pdf", garbage=4, deflate=True)
out_back.save(f"{OUTDIR}/COA_Grid_Back_Q6-Q10{suf}.pdf", garbage=4, deflate=True)
for r in report: print(*r)
