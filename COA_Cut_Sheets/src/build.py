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
SAFE = 4.0                       # blank gap inside every cut line (pt)
TAGH = 7.0                       # height of the small "UNIT k · Qn" tag line
CX0, CX1 = 40.0, 556.0           # content x-range on the source pages
TOPY, FOOTY = 40.0, 803.0        # content y-range (header/footer excluded)
COLGAP = 5.0                     # gap between columns (pt, output)
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

# ---------- 4. pages ----------
def need(atoms):  # area estimate in source units
    return sum(b - a for _, a, b in atoms) * W0

out_front, out_back = pymupdf.open(), pymupdf.open()
report = []
GW, GH = PW - 2 * MX, PH - 2 * MY
for u in sorted(units):
    qs = [pieces(q) for q in units[u]]
    assert len(qs) == 10, (u, len(qs))
    w = [max(need(qs[i]), need(qs[i + 5])) for i in range(5)]
    heights = [GH * wi / sum(w) for wi in w]
    for side, doc, idx in (("FRONT", out_front, range(0, 5)), ("BACK", out_back, range(5, 10))):
        page = doc.new_page(width=PW, height=PH)
        y = MY
        for r, qi in enumerate(idx):
            h = heights[r]
            bx, by, bw, bh = MX + SAFE, y + SAFE + TAGH, GW - 2 * SAFE, h - 2 * SAFE - TAGH
            s, pl = best_fit(qs[qi], bw, bh)
            report.append((u, qi + 1, round(s * 10.5, 2)))   # ~effective body font size (pt), source body ≈10.5pt
            page.insert_text((MX + SAFE, y + SAFE + 5.2), f"UNIT {u} · Long Q{qi + 1}   ({side.lower()}, row {r + 1})",
                             fontsize=5.5, fontname="hebo")
            for (p, a, b, x, yy, cw, hh) in pl:
                rect = pymupdf.Rect(bx + x, by + yy, bx + x + cw, by + yy + hh)
                page.show_pdf_page(rect, src, p, clip=pymupdf.Rect(CX0, a, CX1, b), keep_proportion=True)
            y += h
        # cut lines (single shared lines) + crop marks
        ys = [MY]
        for h in heights: ys.append(ys[-1] + h)
        for yy in ys: page.draw_line((MX - 8, yy), (PW - MX + 8, yy), color=(0, 0, 0), width=0.5)
        for xx in (MX, PW - MX): page.draw_line((xx, MY - 8), (xx, PH - MY + 8), color=(0, 0, 0), width=0.5)
out_front.save(f"{OUTDIR}/COA_Long_Front_Q1-Q5.pdf", garbage=4, deflate=True)
out_back.save(f"{OUTDIR}/COA_Long_Back_Q6-Q10.pdf", garbage=4, deflate=True)
for r in report: print(*r)
