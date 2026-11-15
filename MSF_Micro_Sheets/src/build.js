// Builds front & back cut-sheet PDFs (portrait A4, 5x5 blocks, each block split into a/b halves).
// Front columns: Q1,Q3,Q5,Q7,Q9.  Back columns: Q10,Q8,Q6,Q4,Q2 (mirror, so pieces match on long-edge flip).
// Rows = Unit 1..5. Bottom of the page left empty.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const A = require('./answers.js');
const Qs = require('./questions.js');

const PAGE_W = 210, MARGIN_X = 6, TOP = 7, SAFE = 1.6, MARK = 3, COLS = 5, ROWS = 5, ROW_H = +(process.env.ROW_H || 39);
const SUFFIX = process.env.SUFFIX || '';
const COL_W = (PAGE_W - 2 * MARGIN_X) / COLS;            // 39.6 mm
// Cut lines are a shared grid; content of every cell sits SAFE mm inside the cut lines.
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

function cell(unit, q, x, y) {
  const a = A[unit][q], qq = Qs[unit][q];
  const qn = (t) => `<div class="q">Q. ${t}</div><b>Ans:</b> `;
  const tag = (s) => `<span class="tg">U${ROMAN[unit]}·${s}</span>`;
  let inner;
  const IH = ROW_H - 2 * SAFE;
  if (a.full) {
    inner = `<div class="h" style="top:0;height:${IH}mm"><div class="c">${tag(q)}${qn(qq.full)}${a.full}</div></div>`;
  } else {
    const h = IH / 2;
    inner = `<div class="h" style="top:0;height:${h}mm"><div class="c">${tag(q + 'a')}${qn(qq.a)}${a.a}</div></div>` +
            `<div class="h split" style="top:${h}mm;height:${h}mm"><div class="c">${tag(q + 'b')}${qn(qq.b)}${a.b}</div></div>`;
  }
  return `<div class="blk" data-q="${unit}-${q}" style="left:${x + SAFE}mm;top:${y + SAFE}mm;width:${COL_W - 2 * SAFE}mm;height:${ROW_H - 2 * SAFE}mm">${inner}</div>`;
}

function page(cols, title) {
  let html = '';
  for (let r = 1; r <= ROWS; r++)
    cols.forEach((q, i) => { html += cell(r, q, MARGIN_X + i * COL_W, TOP + (r - 1) * ROW_H); });
  const GW = COLS * COL_W, GH = ROWS * ROW_H;
  for (let i = 0; i <= COLS; i++)
    html += `<div class="vl" style="left:${MARGIN_X + i * COL_W}mm;top:${TOP - MARK}mm;height:${GH + 2 * MARK}mm"></div>`;
  for (let r = 0; r <= ROWS; r++)
    html += `<div class="hl" style="top:${TOP + r * ROW_H}mm;left:${MARGIN_X - MARK}mm;width:${GW + 2 * MARK}mm"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
@page{size:210mm 297mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:210mm;height:297mm;position:relative;font-family:"Liberation Sans",Arial,sans-serif;color:#000}
.blk{position:absolute}
.vl,.hl{position:absolute;background:#000}
.vl{width:0.3pt;margin-left:-0.15pt}
.hl{height:0.3pt;margin-top:-0.15pt}
.h{position:absolute;left:0;width:100%;overflow:hidden;padding:0.2mm 0}
.split{border-top:0.25pt dashed #777}
.c{line-height:1.13;letter-spacing:-0.01em;word-break:break-word}
.q{display:inline;font-weight:bold;font-style:italic;background:#e8e8e8}
.q+b{margin-left:0.3mm}
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
      let lo = 1.2, hi = 6.5;
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
  const report = {}, rects = {};
  for (const [name, cols] of [['Front', [1, 3, 5, 7, 9]], ['Back', [10, 8, 6, 4, 2]]]) {
    const file = path.join(outDir, `MSF_CutSheet_${name}${SUFFIX}.html`);
    fs.writeFileSync(file, page(cols, `MSF ${name}`));
    const p = await b.newPage();
    await p.goto('file://' + file);
    report[name] = await fit(p);
    rects[name] = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.blk')].map(e => {
      const r = e.getBoundingClientRect(); return [e.dataset.q, [r.left, r.top, r.width, r.height]]; })));
    fs.writeFileSync(file, await p.content());          // keep fitted version
    await p.pdf({ path: path.join(outDir, `MSF_CutSheet_${name}${SUFFIX}.pdf`), preferCSSPageSize: true, printBackground: true });
  }
  await b.close();
  // Front Q(2k-1) must sit exactly behind back Q(2k) after a long-edge flip: x_back = pageW - x_front - w, same y.
  const pw = PAGE_W * 96 / 25.4; let worst = 0;
  for (let u = 1; u <= ROWS; u++) for (let k = 1; k <= 5; k++) {
    const f = rects.Front[`${u}-${2 * k - 1}`], bk = rects.Back[`${u}-${2 * k}`];
    worst = Math.max(worst, Math.abs(pw - f[0] - f[2] - bk[0]), Math.abs(f[1] - bk[1]), Math.abs(f[2] - bk[2]), Math.abs(f[3] - bk[3]));
  }
  console.log('ALIGNMENT worst mismatch (mm):', (worst * 25.4 / 96).toFixed(4));
  for (const k in report) console.log(k, report[k].map(([t, s]) => `${t}:${s}`).join('  '));
})();
