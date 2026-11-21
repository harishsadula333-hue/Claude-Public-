// Sundarlysh Memories — 18 x 24 in Instagram QR standee (PDF + PNG preview).
const fs = require('fs');
const QR = require('qrcode');
const L = require('./lib');
const B = require('./brand');
const { chromium } = require('playwright');

const URL = 'https://www.instagram.com/sundarlyshmemories/';
const HANDLE = '@sundarlyshmemories';
const W = 1728, H = 2304, C = W / 2; // 18x24 in at 96 px/in

(async () => {
  // QR (high error correction so the centre badge does not break scanning)
  const qr = QR.create(URL, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size, data = qr.modules.data;
  const qs = 700, cell = qs / n, qx = C - qs / 2, qy = 966;
  let mods = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (data[r * n + c]) mods += `M${(qx + c * cell).toFixed(2)},${(qy + r * cell).toFixed(2)}h${(cell + 0.3).toFixed(2)}v${(cell + 0.3).toFixed(2)}h${-(cell + 0.3).toFixed(2)}z`;
  const logo = fs.readFileSync('sm_logo.png').toString('base64');
  const gold = 'url(#gd)', ivory = '#4A0A24';
  const T = (fk, s, x, y, size, fill, o = {}) => `<path d="${L.text(fk, s, x, y, size, { ls: o.ls ?? 0, anchor: o.anchor || 'middle' }).d}" fill="${fill}"/>`;
  // Instagram glyph (outline) at x,y size s
  const ig = (x, y, s, fill) => `<g fill="none" stroke="${fill}" stroke-width="${s * 0.09}"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.28}"/><circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.23}"/></g><circle cx="${x + s * 0.76}" cy="${y + s * 0.24}" r="${s * 0.065}" fill="${fill}"/>`;

  let g = '';
  // background + frames
  g += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  g += `<rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="none" stroke="${gold}" stroke-width="6"/>`;
  g += `<rect x="66" y="66" width="${W - 132}" height="${H - 132}" fill="none" stroke="${gold}" stroke-width="2"/>`;
  for (const [x, y] of [[66, 66], [W - 66, 66], [66, H - 66], [W - 66, H - 66]]) g += `<path d="${B.star(x, y, 30, 0.1)}" fill="${gold}"/>`;
  // logo
  g += `<image href="data:image/png;base64,${logo}" x="${C - 240}" y="112" width="480" height="480"/>`;
  g += `<circle cx="${C}" cy="352" r="244" fill="none" stroke="${gold}" stroke-width="4"/>`;
  g += T('jos400', 'EVENTS  ·  WORKSHOPS  ·  BRANDING', C, 670, 34, ivory, { ls: 0.32 });
  // heading
  g += T('vibes', "Let's Stay Connected", C, 784, 108, gold);
  g += T('jos600', 'SCAN TO DM US', C, 880, 72, ivory, { ls: 0.16 });
  // QR card
  const pad = 46;
  g += `<rect x="${qx - pad}" y="${qy - pad}" width="${qs + 2 * pad}" height="${qs + 2 * pad}" rx="36" fill="#FFFDF8" stroke="${gold}" stroke-width="8"/>`;
  g += `<path d="${mods}" fill="#3E0820"/>`;
  // corner brackets around the card
  const br = 70, bx0 = qx - pad - 26, by0 = qy - pad - 26, bx1 = qx + qs + pad + 26, by1 = qy + qs + pad + 26;
  g += `<path d="M${bx0},${by0 + br}V${by0}H${bx0 + br}M${bx1 - br},${by0}H${bx1}V${by0 + br}M${bx1},${by1 - br}V${by1}H${bx1 - br}M${bx0 + br},${by1}H${bx0}V${by1 - br}" fill="none" stroke="${gold}" stroke-width="6"/>`;
  // centre badge: Instagram glyph on wine
  const bs = 150;
  g += `<rect x="${C - bs / 2 - 10}" y="${qy + qs / 2 - bs / 2 - 10}" width="${bs + 20}" height="${bs + 20}" rx="34" fill="#FFFDF8"/>`;
  g += `<rect x="${C - bs / 2}" y="${qy + qs / 2 - bs / 2}" width="${bs}" height="${bs}" rx="30" fill="#4A0A24"/>`;
  g += ig(C - 45, qy + qs / 2 - 45, 90, '#F3D58E');
  // handle + call to action
  const hy = qy + qs + pad + 118;
  const hw = L.text('jos600', HANDLE, 0, 0, 62, { ls: 0.04, anchor: 'start' }).width;
  g += ig(C - hw / 2 - 100, hy - 60, 72, ivory);
  g += T('jos600', HANDLE, C + 50, hy, 62, ivory, { ls: 0.04 });
  g += `<rect x="${C - 300}" y="${hy + 46}" width="600" height="2.4" fill="${gold}"/>`;
  g += T('jos400', 'DM US FOR BOOKINGS & ENQUIRIES', C, hy + 112, 36, ivory, { ls: 0.24 });
  g += T('vibes', 'Follow us for more', C, hy + 214, 84, gold);
  // hearts row
  for (const [i, dx] of [-120, -60, 0, 60, 120].entries()) g += `<path d="${L.heart(C + dx, hy + 290, i === 2 ? 40 : 28)}" fill="${i === 2 ? '#E8275E' : gold}"/>`;

  const defs = `<radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#FCE4EA"/><stop offset="0.6" stop-color="#F8D3DD"/><stop offset="1" stop-color="#F0BFCD"/></radialGradient>` +
    L.goldGrad('gd', 0, 0, W, H, [[0, '#9A6418'], [0.3, '#C9963A'], [0.5, '#A87418'], [0.7, '#D2A24A'], [1, '#9A6418']]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${g}</svg>`;
  fs.mkdirSync('out24', { recursive: true });
  fs.writeFileSync('out24/standee.svg', svg);
  const html = `<!doctype html><html><head><style>@page{size:18in 24in;margin:0}html,body{margin:0;padding:0}svg{display:block;width:18in;height:24in}</style></head><body>${svg}</body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html);
  await p.pdf({ path: 'out24/Sundarlysh-Memories-Instagram-Standee-18x24.pdf', width: '18in', height: '24in', printBackground: true });
  const p2 = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p2.setContent(html);
  await p2.screenshot({ path: 'out24/standee-preview.png' });
  await b.close();
  console.log('done, QR modules', n);
})();
