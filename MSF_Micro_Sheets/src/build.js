// Builds front & back cut-sheet PDFs (portrait A4, 5x5 blocks, each block split into a/b halves).
// Front columns: Q1,Q3,Q5,Q7,Q9.  Back columns: Q10,Q8,Q6,Q4,Q2 (mirror, so pieces match on long-edge flip).
// Rows = Unit 1..5. Bottom of the page left empty.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const SHORT = process.env.SET === 'short';
const A = SHORT ? require('./short.js').A : require('./answers.js');
const Qs = SHORT ? require('./short.js').Q : require('./questions.js');
const BASE = SHORT ? 'MSF_Short_CutSheet' : 'MSF_CutSheet';

const PAGE_W = 210, MARGIN_X = +(process.env.MX || 6), TOP = +(process.env.TOP || 7), SAFE = +(process.env.SAFE || 1.6), MARK = 3, COLS = 5, ROWS = 5, ROW_H = +(process.env.ROW_H || 39);
const SUFFIX = process.env.SUFFIX || '';
const K = 2;   // layout at 2x and print at 50%: hairlines become truly thin (browser rounds lines below 1px up to 1px)
const M = (v) => `${(v * K).toFixed(3)}mm`;
const COL_W = (PAGE_W - 2 * MARGIN_X) / COLS;            // 39.6 mm
// Cut lines are a shared grid; content of every cell sits SAFE mm inside the cut lines.
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

const FM = SHORT ? {} : require('./formulas.js');
const SEP = ' <span class="sp">|</span> ';
// Everything in one straight line: tables become inline rows, every line break becomes a bold "|".
function inlineTables(h) {
  return h.replace(/<table>([\s\S]*?)<\/table>/g, (m, body) => {
    const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map(c => c[1]).filter(c => c !== '').join(', '));
    return SEP + '[' + rows.join(' ; ') + ']' + SEP;
  });
}
function dense(h) {
  return h.replace(/(\s*<br>\s*)+/g, SEP).replace(/(\s*<span class="sp">\|<\/span>\s*){2,}/g, SEP)
    .replace(/<span class="sp">\|<\/span>\s*(<table>)/g, '$1').replace(/(<\/table>)\s*<span class="sp">\|<\/span>/g, '$1')
    .replace(/<span class="sp">\|<\/span>\s*(<span class="nt">)/g, '$1').replace(/(<span class="nt">[^]*?<\/span>)\s*<span class="sp">\|<\/span>/g, '$1')
    .replace(/^\s*<span class="sp">\|<\/span>\s*/, '').replace(/\s*<span class="sp">\|<\/span>\s*$/, '');
}
function cell(unit, q, x, y) {
  const a0 = A[unit][q], qq = Qs[unit][q];
  const fm = (FM[unit] || {})[q] || {};
  const a = Object.fromEntries(Object.entries(a0).map(([k, v]) => [k, (fm[k] ? `<b>Formula:</b> ${fm[k]}` + SEP : '') + dense(v)]));
  const qn = (t) => `<span class="q">Q. ${t}</span>` + SEP + `<b>Ans:</b> `;
  const tag = (s) => `<span class="tg">[U${ROMAN[unit]}·${s}]</span> `;
  let inner;
  const IH = ROW_H - 2 * SAFE;
  if (a.full) {
    inner = `<div class="h" style="top:0;height:${M(IH)}"><div class="c">${tag(q)}${qn(qq.full)}${a.full}</div></div>`;
  } else {
    // a and b share one flowing box; the dashed divider moves to wherever the content needs it (it is not a cut line)
    inner = `<div class="h" style="top:0;height:${M(IH)}"><div class="c"><div>${tag(q + 'a')}${qn(qq.a)}${a.a}</div>` +
            `<div class="split2">${tag(q + 'b')}${qn(qq.b)}${a.b}</div></div></div>`;
  }
  return `<div class="blk" data-q="${unit}-${q}" style="left:${M(x + SAFE)};top:${M(y + SAFE)};width:${M(COL_W - 2 * SAFE)};height:${M(ROW_H - 2 * SAFE)}">${inner}</div>`;
}

function page(cols, title) {
  let html = '';
  for (let r = 1; r <= ROWS; r++)
    cols.forEach((q, i) => { html += cell(r, q, MARGIN_X + i * COL_W, TOP + (r - 1) * ROW_H); });
  const GW = COLS * COL_W, GH = ROWS * ROW_H;
  for (let i = 0; i <= COLS; i++)
    html += `<div class="vl" style="left:${M(MARGIN_X + i * COL_W)};top:${M(TOP - MARK)};height:${M(GH + 2 * MARK)}"></div>`;
  for (let r = 0; r <= ROWS; r++)
    html += `<div class="hl" style="top:${M(TOP + r * ROW_H)};left:${M(MARGIN_X - MARK)};width:${M(GW + 2 * MARK)}"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
@page{margin:0}
@font-face{font-family:RC;font-weight:300;font-style:normal;src:url(fonts/roboto-condensed-latin-300-normal.woff2),url(fonts/roboto-condensed-latin-ext-300-normal.woff2),url(fonts/roboto-condensed-greek-300-normal.woff2)}
@font-face{font-family:RC;font-weight:400;font-style:normal;src:url(fonts/roboto-condensed-latin-400-normal.woff2)}
@font-face{font-family:RC;font-weight:700;font-style:normal;src:url(fonts/roboto-condensed-latin-700-normal.woff2),url(fonts/roboto-condensed-greek-700-normal.woff2)}
@font-face{font-family:RC;font-weight:300;font-style:italic;src:url(fonts/roboto-condensed-latin-300-italic.woff2)}
@font-face{font-family:RC;font-weight:700;font-style:italic;src:url(fonts/roboto-condensed-latin-700-italic.woff2)}
@font-face{font-family:RCg;font-weight:300;src:url(fonts/roboto-condensed-greek-300-normal.woff2)}
@font-face{font-family:RCg;font-weight:700;src:url(fonts/roboto-condensed-greek-700-normal.woff2)}

*{box-sizing:border-box;margin:0;padding:0}
html,body{width:420mm;height:594mm;overflow:hidden}
#root{width:420mm;height:594mm;position:relative;font-family:RC,RCg,"Liberation Sans","DejaVu Sans",sans-serif;font-weight:400;font-synthesis:none;color:#000;-webkit-print-color-adjust:exact}
b,.tg{font-weight:700}
.blk{position:absolute}
.vl,.hl{position:absolute;background:#000}
.vl{width:1pt;margin-left:-0.5pt}
.hl{height:1pt;margin-top:-0.5pt}
.h{position:absolute;left:0;width:100%;overflow:hidden;padding:0.4mm 0}
.split2{border-top:1pt dashed #000;margin-top:0.8mm;padding-top:0.6mm}
.c{line-height:1.06;letter-spacing:0;word-break:break-word}
.sp{color:#000;font-weight:700;font-family:"Liberation Sans",Arial,sans-serif;padding:0 0.05em}
.q{display:inline;font-weight:700;font-style:italic}
.q+b{margin-left:0.6mm}
.tg{font-weight:700;color:#000}
table{border-collapse:collapse;margin:0.5mm 0;width:100%;table-layout:auto;line-height:1.02}
td{border:0.5pt solid #000;text-align:center;padding:0 0.5mm;font-size:0.93em}
i{font-style:italic;color:#000}
.nt{display:block;font-style:italic;border:0.8pt solid #000;padding:0.3mm 0.8mm;margin:0.6mm 0}
</style></head><body><div id="root">${html}</div></body></html>`;
}

async function fit(p) {
  // Largest font (pt, step 0.05) that lets each half-cell's content fit without overflow.
  return p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.h').forEach(h => {
      const c = h.querySelector('.c');
      const avail = h.clientHeight - 2;            // minus padding slack
      let lo = 2.4, hi = 13;
      while (hi - lo > 0.05) {
        const mid = (lo + hi) / 2;
        c.style.fontSize = mid + 'pt';
        (c.scrollHeight <= h.clientHeight - parseFloat(getComputedStyle(h).paddingTop) * 2 && c.scrollWidth <= c.clientWidth + 0.5) ? lo = mid : hi = mid;
      }
      c.style.fontSize = lo + 'pt';
      out.push([h.querySelector('.tg').textContent, +(lo / 2).toFixed(2)]);
    });
    return out;
  });
}

(async () => {
  const outDir = path.resolve(__dirname, '..');
  const b = await chromium.launch();
  const report = {}, rects = {};
  for (const [name, cols] of [['Front', [1, 3, 5, 7, 9]], ['Back', [10, 8, 6, 4, 2]]]) {
    const file = path.join(outDir, `${BASE}_${name}${SUFFIX}.html`);
    fs.writeFileSync(file, page(cols, `MSF ${name}`));
    const p = await b.newPage();
    await p.goto('file://' + file);
    await p.evaluate(() => document.fonts.ready);
    report[name] = await fit(p);
    rects[name] = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.blk')].map(e => {
      const r = e.getBoundingClientRect(); return [e.dataset.q, [r.left, r.top, r.width, r.height]]; })));
    fs.writeFileSync(file, await p.content());          // keep fitted version
    await p.pdf({ path: path.join(outDir, `${BASE}_${name}${SUFFIX}.pdf`), width: '210mm', height: '297mm', scale: 1 / K, margin: { top: 0, right: 0, bottom: 0, left: 0 }, printBackground: true, pageRanges: '1' });
  }
  await b.close();
  // Front Q(2k-1) must sit exactly behind back Q(2k) after a long-edge flip: x_back = pageW - x_front - w, same y.
  const pw = PAGE_W * K * 96 / 25.4; let worst = 0;
  for (let u = 1; u <= ROWS; u++) for (let k = 1; k <= 5; k++) {
    const f = rects.Front[`${u}-${2 * k - 1}`], bk = rects.Back[`${u}-${2 * k}`];
    worst = Math.max(worst, Math.abs(pw - f[0] - f[2] - bk[0]), Math.abs(f[1] - bk[1]), Math.abs(f[2] - bk[2]), Math.abs(f[3] - bk[3]));
  }
  console.log('ALIGNMENT worst mismatch (mm):', (worst * 25.4 / 96 / K).toFixed(4));
  for (const k in report) console.log(k, report[k].map(([t, s]) => `${t}:${s}`).join('  '));
})();
