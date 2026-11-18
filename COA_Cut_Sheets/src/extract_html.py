# Re-typeset every COA long answer from the source PDF: original wording kept, rebuilt as simple black HTML.
#  - text lines -> paragraphs (bold/italic/superscript/subscript kept)
#  - tables     -> real <table>
#  - figures    -> grayscale PNG (diagram images and drawn block diagrams)
import sys, json, re, os, pymupdf
exec(open(os.path.join(os.path.dirname(__file__), 'build.py')).read().split("# ---------- 2.")[0])
OUT = sys.argv[3]; IMG = os.path.join(OUT, "fig"); os.makedirs(IMG, exist_ok=True)

def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def span_html(s, base_size):
    t = esc(s["text"])
    if not t.strip(): return t
    f = s["flags"]; small = s["size"] < base_size * 0.8
    if "Mono" in s["font"] or "mono" in s["font"].lower(): t = f'<code>{t}</code>'
    if f & 16 or "Bold" in s["font"] or "SemiBold" in s["font"]: t = f"<b>{t}</b>"
    if f & 2 or "Italic" in s["font"]: t = f"<i>{t}</i>"
    return t, small

BULLET = re.compile(r"^(\s*[•●▪◦–-]\s|\s*\(?\d{1,2}[.)]\s|\s*\(?[a-z][.)]\s|\s*Step \d)")

def lines_in(page, rect, exclude):
    out = []
    for b in page.get_text("dict", clip=rect)["blocks"]:
        for l in b.get("lines", []):
            bb = pymupdf.Rect(l["bbox"])
            if any(bb.intersects(e) and (bb & e).get_area() > 0.5 * bb.get_area() for e in exclude): continue
            spans = [s for s in l["spans"] if s["text"]]
            if not "".join(s["text"] for s in spans).strip(): continue
            out.append((bb, spans))
    out.sort(key=lambda x: (round(x[0].y0, 0), x[0].x0))
    # merge spans that sit on the same baseline row (Chrome splits lines into fragments)
    rows = []
    for bb, sp in out:
        if rows and abs(rows[-1][0].y0 - bb.y0) < 2.5 and bb.x0 >= rows[-1][0].x1 - 1:
            rows[-1][0] |= bb; rows[-1][1].extend(sp)
        else: rows.append([pymupdf.Rect(bb), list(sp)])
    return rows

def rows_to_html(rows):
    if not rows: return []
    sizes = sorted(s["size"] for _, sp in rows for s in sp)
    base = sizes[len(sizes) // 2]
    paras, cur, prev = [], "", None
    maxx = max(bb.x1 for bb, _ in rows)
    for bb, sp in rows:
        h = ""
        for s in sp:
            r = span_html(s, base)
            if isinstance(r, tuple):
                t, small = r
                if small and prev is not None and s["origin"][1] < bb.y1 - base * 0.45: t = f"<sup>{t}</sup>"
                elif small: t = f"<sub>{t}</sub>"
            else: t = r
            h += t
        plain = "".join(s["text"] for s in sp)
        new_para = (prev is None or BULLET.match(plain) or bb.y0 - prev.y1 > base * 0.9
                    or prev.x1 < maxx - 70 or re.match(r"^\s*(Figure|Table) \d", plain))
        if new_para and cur: paras.append(cur.strip()); cur = ""
        cur += ("" if not cur else " ") + h
        prev = bb
    if cur: paras.append(cur.strip())
    return paras

def table_html(tab, page):
    grid = []
    for r in tab.rows:
        row = []
        for c in r.cells:
            if c is None: row.append(None); continue
            t = page.get_text("text", clip=pymupdf.Rect(c)).strip()
            row.append(re.sub(r"\s+", " ", t))
        grid.append(row)
    ncol = max(len(r) for r in grid)
    keep = [j for j in range(ncol) if any(j < len(r) and r[j] for r in grid)]
    h = "<table>"
    for i, r in enumerate(grid):
        cells = [esc(r[j] or "") if j < len(r) else "" for j in keep]
        h += "<tr>" + "".join(f"<td>{'<b>' + c + '</b>' if i == 0 else c}</td>" for c in cells) + "</tr>"
    return h + "</table>"

figno = 0
def figure_png(page, rect, key):
    global figno; figno += 1
    name = f"{key}_f{figno}.png"
    pix = page.get_pixmap(clip=rect, dpi=330, colorspace=pymupdf.csGRAY)
    pix.save(os.path.join(IMG, name))
    return f'<img class="fig" src="fig/{name}" style="width:{rect.width / 10.5:.2f}em">'

data = []
for u in sorted(units):
    for qi, q in enumerate(units[u]):
        key = f"U{u}Q{qi+1}"; parts = []
        for p, y0, y1 in segments(q[0], q[1], q[2]):
            page = src[p]; seg = pymupdf.Rect(CX0, y0, CX1, y1)
            tabs = [t for t in page.find_tables(clip=seg).tables if t.bbox[1] >= y0 - 2 and t.bbox[3] <= y1 + 2]
            tboxes = [pymupdf.Rect(t.bbox) for t in tabs]
            # figure boxes: wide containers holding an image or a drawn diagram
            figs = []
            imgs = [pymupdf.Rect(i["bbox"]) for i in page.get_image_info() if pymupdf.Rect(i["bbox"]).intersects(seg)]
            conts = [d["rect"] for d in page.get_drawings() if d["rect"].width > 250 and 30 < d["rect"].height < 700 and d["rect"].intersects(seg)]
            for c in conts:
                if any(c.contains(t) or (c & t).get_area() > 0.8 * t.get_area() for t in tboxes) and not any(c.contains(i) for i in imgs):
                    # a container that is really a table/code panel: keep as text unless it holds many shapes
                    inner = [d for d in page.get_drawings() if c.contains(d["rect"]) and d["rect"] != c]
                    if len(inner) < 6: continue
                mono = [s for b in page.get_text("dict", clip=c)["blocks"] for l in b.get("lines", []) for s in l["spans"] if s["text"].strip()]
                if mono and sum("Mono" in s["font"] for s in mono) > 0.6 * len(mono) and not any(c.contains(i) for i in imgs): continue  # code block -> text
                inner = [d for d in page.get_drawings() if c.contains(d["rect"]) and d["rect"] != c]
                if any(c.contains(i) for i in imgs) or len(inner) >= 6:
                    if not any(f.contains(c) for f in figs): figs = [f for f in figs if not c.contains(f)] + [c]
            for i in imgs:
                if not any(f.contains(i) for f in figs): figs.append(i)
            tboxes_kept = [(t, tb) for t, tb in zip(tabs, tboxes) if not any(f.contains(tb) for f in figs)]
            blocks = [("fig", f, None) for f in figs] + [("tab", tb, t) for t, tb in tboxes_kept]
            blocks.sort(key=lambda b: b[1].y0)
            excl = [b[1] for b in blocks]
            cursor = y0
            for kind, r, t in blocks + [("end", pymupdf.Rect(CX0, y1, CX1, y1), None)]:
                if r.y0 > cursor + 1:
                    parts += rows_to_html(lines_in(page, pymupdf.Rect(CX0, cursor, CX1, r.y0), excl))
                if kind == "fig": parts.append(figure_png(page, r & seg, key))
                elif kind == "tab": parts.append(table_html(t, page))
                cursor = max(cursor, r.y1)
        qi_ = next(i for i, p_ in enumerate(parts) if "Long Q" in re.sub(r"<[^>]+>", "", p_))
        qtxt = re.sub(r"<[^>]+>", "", parts[qi_]); qtxt = re.sub(r"^.*?Long Q\d+\.\s*", "", qtxt); qtxt = qtxt.replace("[10 Marks]", "").strip()
        data.append({"u": u, "q": qi + 1, "question": esc(qtxt), "parts": parts[:qi_] + parts[qi_ + 1:]})
json.dump(data, open(os.path.join(OUT, "coa_data.json"), "w"), ensure_ascii=False, indent=0)
print("questions", len(data), "figures", figno, "tables", sum(p.startswith("<table") for d in data for p in d["parts"]))
