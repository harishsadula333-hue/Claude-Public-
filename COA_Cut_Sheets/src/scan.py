# Locate "Long Qn." headings, unit headers, Part headers and footers in the COA PDF.
import sys, re, json, pymupdf
doc = pymupdf.open(sys.argv[1])
marks = []
for pno, page in enumerate(doc):
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            t = "".join(s["text"] for s in l["spans"]).strip()
            y0, y1 = l["bbox"][1], l["bbox"][3]
            if re.match(r"^Long Q\d+\.", t): marks.append(("LQ", pno, y0, t[:70]))
            elif re.match(r"^UNIT \d", t): marks.append(("UNIT", pno, y0, t[:60]))
            elif re.match(r"^Part [AB]", t): marks.append(("PART", pno, y0, t[:60]))
            elif re.search(r"Page \d+ of 97", t): marks.append(("FOOT", pno, y0, t[-14:]))
json.dump(marks, open(sys.argv[2], "w"))
for m in marks:
    if m[0] != "FOOT": print(m)
print("page size", doc[0].rect, "footer y", sorted(set(round(m[2]) for m in marks if m[0]=="FOOT")))
