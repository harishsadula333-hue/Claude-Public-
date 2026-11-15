// Builds front & back cut-sheet PDFs (portrait A4, 5x5 blocks, each block split into a/b halves).
// Front columns: Q1,Q3,Q5,Q7,Q9.  Back columns: Q10,Q8,Q6,Q4,Q2 (mirror, so pieces match on long-edge flip).
// Rows = Unit 1..5. Bottom of the page left empty.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const A = require('./answers.js');

const PAGE_W = 210, MARGIN_X = 4, TOP = 5, COLS = 5, ROWS = 5, ROW_H = 39;
const COL_W = (PAGE_W - 2 * MARGIN_X) / COLS;            // 40.4 mm
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

function cell(unit, q, x, y) {
  const a = A[unit][q];
  const tag = (s) => `<span class="tg">U${ROMAN[unit]}·${s}</span>`;
  let inner;
  if (a.full) {
    inner = `<div class="h" style="top:0;height:${ROW_H}mm"><div class="c">${tag(q)}${a.full}</div></div>`;
  } else {
    const h = ROW_H / 2;
    inner = `<div class="h" style="top:0;height:${h}mm"><div class="c">${tag(q + 'a')}${a.a}</div></div>` +
            `<div class="h split" style="top:${h}mm;height:${h}mm"><div class="c">${tag(q + 'b')}${a.b}</div></div>`;
  }
  return `<div class="blk" style="left:${x}mm;top:${y}mm;width:${COL_W}mm;height:${ROW_H}mm">${inner}</div>`;
}

function page(cols, title) {
  let html = '';
  for (let r = 1; r <= ROWS; r++)
    cols.forEach((q, i) => { html += cell(r, q, MARGIN_X + i * COL_W, TOP + (r - 1) * ROW_H); });
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
@page{size:210mm 297mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:210mm;height:297mm;position:relative;font-family:"Liberation Sans",Arial,sans-serif;color:#000}
.blk{position:absolute;border:0.4pt solid #000}
.h{position:absolute;left:0;width:100%;overflow:hidden;padding:0.45mm 0.6mm}
.split{border-top:0.25pt dashed #000}
.c{line-height:1.13;letter-spacing:-0.01em;word-break:break-word}
.tg{display:inline-block;background:#000;color:#fff;font-weight:bold;padding:0 0.4mm;margin-right:0.6mm;border-radius:0.4mm;font-size:0.95em}
table{border-collapse:collapse;margin:0.2mm 0;width:100%;table-layout:fixed}
td{border:0.25pt solid #000;text-align:center;padding:0 0.1mm;font-size:0.92em}
i{font-style:italic;color:#333}
</style></head><body>${html}</body></html>`;
}

async function fit(p) {
  // Largest font (pt, step 0.05) that lets each half-cell's content fit without overflow.
  return p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.h').forEach(h => {
      const c = h.querySelector('.c');
      const avail = h.clientHeight - 2;            // minus padding slack
      let lo = 1.8, hi = 6.5;
      while (hi - lo > 0.05) {
        const mid = (lo + hi) / 2;
        c.style.fontSize = mid + 'pt';
        (c.scrollHeight <= h.clientHeight - parseFloat(getComputedStyle(h).paddingTop) * 2) ? lo = mid : hi = mid;
      }
      c.style.fontSize = lo + 'pt';
      out.push([h.querySelector('.tg').textContent, +lo.toFixed(2)]);
    });
    return out;
  });
}

(async () => {
  const outDir = path.resolve(__dirname, '..');
  const b = await chromium.launch();
  const report = {};
  for (const [name, cols] of [['Front', [1, 3, 5, 7, 9]], ['Back', [10, 8, 6, 4, 2]]]) {
    const file = path.join(outDir, `MSF_CutSheet_${name}.html`);
    fs.writeFileSync(file, page(cols, `MSF ${name}`));
    const p = await b.newPage();
    await p.goto('file://' + file);
    report[name] = await fit(p);
    fs.writeFileSync(file, await p.content());          // keep fitted version
    await p.pdf({ path: path.join(outDir, `MSF_CutSheet_${name}.pdf`), preferCSSPageSize: true, printBackground: true });
  }
  await b.close();
  for (const k in report) console.log(k, report[k].map(([t, s]) => `${t}:${s}`).join('  '));
})();
