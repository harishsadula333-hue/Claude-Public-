// High-resolution PDF of the client's standee design: 300 dpi image + vector QR overlay.
const fs = require('fs');
const QR = require('qrcode');
const { chromium } = require('playwright');
(async () => {
  const { wine } = JSON.parse(fs.readFileSync('out25/meta.json'));
  const q = QR.create('https://www.instagram.com/sundarlyshmemories/', { errorCorrectionLevel: 'H' });
  const n = q.modules.size, d = q.modules.data;
  const x0 = 317, x1 = 780, y0 = 577, y1 = 998, cw = (x1 - x0) / n, ch = (y1 - y0) / n;
  let mods = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (d[r * n + c]) mods += `M${(x0 + c * cw).toFixed(3)},${(y0 + r * ch).toFixed(3)}h${(cw + 0.06).toFixed(3)}v${(ch + 0.06).toFixed(3)}h${-(cw + 0.06).toFixed(3)}z`;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, qw = x1 - x0;
  const k = qw / 700; // same proportions as the original badge
  const bw = 150 * k, wb = 170 * k, s = 90 * k;
  const ig = (x, y, sz, fill) => `<g fill="none" stroke="${fill}" stroke-width="${sz * 0.09}"><rect x="${x}" y="${y}" width="${sz}" height="${sz}" rx="${sz * 0.28}"/><circle cx="${x + sz / 2}" cy="${y + sz / 2}" r="${sz * 0.23}"/></g><circle cx="${x + sz * 0.76}" cy="${y + sz * 0.24}" r="${sz * 0.065}" fill="${fill}"/>`;
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1088 1445" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:18in;height:24in">` +
    `<rect x="${x0 - 7}" y="${y0 - 7}" width="${qw + 14}" height="${y1 - y0 + 14}" fill="#FFFFFF"/>` +
    `<path d="${mods}" fill="${wine}"/>` +
    `<rect x="${cx - wb / 2}" y="${cy - wb / 2}" width="${wb}" height="${wb}" rx="${wb * 0.2}" fill="#FFFFFF"/>` +
    `<rect x="${cx - bw / 2}" y="${cy - bw / 2}" width="${bw}" height="${bw}" rx="${bw * 0.2}" fill="${wine}"/>` +
    ig(cx - s / 2, cy - s / 2, s, '#F1CF7E') + `</svg>`;
  const bg = fs.readFileSync('out25/bg.jpg').toString('base64');
  const html = `<!doctype html><html><head><style>@page{size:18in 24in;margin:0}html,body{margin:0;padding:0}.p{position:relative;width:18in;height:24in;overflow:hidden}img{position:absolute;left:0;top:0;width:18in;height:24in}</style></head><body><div class="p"><img src="data:image/jpeg;base64,${bg}">${overlay}</div></body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1728, height: 2304 } });
  await p.setContent(html); await p.waitForTimeout(500);
  await p.pdf({ path: 'out25/Sundarlysh-Memories-Instagram-Standee-HD-18x24.pdf', width: '18in', height: '24in', printBackground: true });
  const p2 = await b.newPage({ viewport: { width: 1728, height: 2304 }, deviceScaleFactor: 1 });
  await p2.setContent(html); await p2.waitForTimeout(500);
  await p2.screenshot({ path: 'out25/preview.png' });
  await b.close(); console.log('ok');
})();
