// Full-size, readable long-answer PDF from the same data as the cut sheets.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const A = require('./answers.js'), Q = require('./questions.js');
let body = `<div class="cover"><h1>MSF – LONG QUESTIONS WITH ANSWERS</h1><p>Units 1–5 · 10 long questions per unit</p><p class="s">Answers transcribed step-by-step from the uploaded solution PDFs. Boxed <span class="nt">NOTE</span> lines mark where a sheet has an error, is missing, or uses different data from the question bank.</p></div>`;
for (let u = 1; u <= 5; u++) {
  body += `<h2>UNIT – ${u}</h2>`;
  for (let q = 1; q <= 10; q++) {
    const a = A[u][q], qq = Q[u][q];
    if (a.full) body += `<div class="qa"><div class="q">Q${q}. ${qq.full}</div><div class="a">${a.full}</div></div>`;
    else body += `<div class="qa"><div class="q">Q${q}. a) ${qq.a}</div><div class="a">${a.a}</div></div><div class="qa"><div class="q">Q${q}. b) ${qq.b}</div><div class="a">${a.b}</div></div>`;
  }
}
const html = `<!doctype html><html><head><meta charset="utf-8"><title>MSF Long Answers</title><style>
@page{size:A4;margin:14mm 13mm}
body{font-family:"Liberation Sans",Arial,sans-serif;font-size:10.5pt;line-height:1.5;color:#000}
.cover{text-align:center;padding-top:60mm;page-break-after:always}.cover h1{color:#1f3a68}.s{font-size:9.5pt}
h2{background:#1f3a68;color:#fff;padding:6px 10px;page-break-before:always}
.qa{margin:10px 0 14px;border-top:1px dashed #bbb;padding-top:8px}
.q{font-weight:bold;color:#1f3a68;margin-bottom:4px}
table{border-collapse:collapse;margin:5px 0;font-size:9.5pt}td{border:1px solid #777;padding:2px 6px;text-align:center}
.nt{display:inline-block;background:#fff4dc;border:1px solid #d9a400;padding:1px 5px;font-style:italic;margin:3px 0}
.tg{display:none}
</style></head><body>${body}</body></html>`;
(async () => {
  const out = path.resolve(__dirname, '../../MSF_Long_Answers');
  const f = path.join(out, 'MSF_Long_Questions_Answers.html');
  fs.writeFileSync(f, html);
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + f);
  await p.pdf({ path: path.join(out, 'MSF_Long_Questions_Answers.pdf'), preferCSSPageSize: true, printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font-size:8px;width:100%;text-align:center">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
  await b.close();
})();
