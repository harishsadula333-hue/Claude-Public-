// Tiara, Moon & Star, Vanity Mirror — each joined to the star of the A in the
// original wordmark.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540, s = 0.56;

function scene(dark, bg, sy, symbol) {
  const v = dark ? 'dark' : 'orig';
  const ox = C - s * 851, oy = sy - s * 560;
  const a = W.place('main', v, s, ox, oy), t = W.place('tag', v, s, ox, oy);
  const star = [C, sy], tip = [C, oy + s * 517];
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const sym = symbol({ star, tip, GF, dark, x0: ox + s * 62, x1: ox + s * 1495, capY: oy + s * 732 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${sym.defs || ''}${a.defs}${t.defs}` +
    `<linearGradient id="wineS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A1446"/><stop offset="1" stop-color="#4A0624"/></linearGradient></defs>` +
    `<rect width="1080" height="1080" fill="${bg}"/>${sym.under || ''}${a.body}${t.body}${sym.svg}</svg>\n`;
}
const pearl = (x, y, r) => `<circle cx="${L.r2(x)}" cy="${L.r2(y)}" r="${r}" fill="url(#pearl)"/>`;

// 25 · Tiara over the whole name; its centre jewel sits on the A's star
function tiara(dark, bg) {
  return scene(dark, bg, 512, ({ star, tip, GF, dark: dk }) => {
    const cy = tip[1] - 6, half = 330;
    const bandY = (x) => cy + 70 * Math.pow((x - C) / half, 2);
    const band = [];
    for (let i = 0; i <= 160; i++) { const x = C - half + (2 * half * i) / 160; band.push([x, bandY(x)]); }
    let g = `<path d="${L.ribbon(band, (t) => 1 + 2.6 * Math.sin(Math.PI * t))}" fill="${GF}"/>`;
    // peaks: pointed arches between band points, tallest at the centre
    const n = 9; let peaks = '', fill = '';
    for (let i = 0; i < n; i++) {
      const xa = C - half + (2 * half * i) / n, xb = C - half + (2 * half * (i + 1)) / n, xm = (xa + xb) / 2;
      const d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
      const h = 34 + 150 * Math.pow(1 - d, 1.6);
      const ya = bandY(xa), yb = bandY(xb), yt = bandY(xm) - h;
      const arch = `M${L.r2(xa)},${L.r2(ya)}C${L.r2(xa + 6)},${L.r2(ya - h * 0.55)} ${L.r2(xm - 4)},${L.r2(yt + h * 0.25)} ${L.r2(xm)},${L.r2(yt)}C${L.r2(xm + 4)},${L.r2(yt + h * 0.25)} ${L.r2(xb - 6)},${L.r2(yb - h * 0.55)} ${L.r2(xb)},${L.r2(yb)}`;
      peaks += arch;
      // inner arch
      const k = 0.62, xa2 = xm - (xm - xa) * k, xb2 = xm + (xb - xm) * k, yt2 = bandY(xm) - h * 0.6;
      peaks += `M${L.r2(xa2)},${L.r2(bandY(xa2) - 1)}Q${L.r2(xm)},${L.r2(yt2 - h * 0.1)} ${L.r2(xb2)},${L.r2(bandY(xb2) - 1)}`;
      fill += i === (n - 1) / 2 ? '' : pearl(xm, yt - 6, 4 + 3 * (1 - d));
    }
    g += `<path d="${peaks}" fill="none" stroke="${GF}" stroke-width="2.6" stroke-linejoin="round"/>`;
    g += fill;
    // pearls along the band
    for (let i = 1; i < 18; i++) { const x = C - half + (2 * half * i) / 18; if (Math.abs(x - C) > 20) g += pearl(x, bandY(x) + 9, 3); }
    // centre jewel: pink heart above the A's star, star on top of the central peak
    g += `<path d="${L.heart(C, cy - 74, 40)}" fill="url(#pink)" stroke="${GF}" stroke-width="2"/>`;
    g += `<path d="${B.star(C, cy - 196, 28, 0.1)}" fill="${GF}"/>`;
    return { svg: g };
  });
}

// 26 · Moon & Star — a crescent arches over the A's star
function moon(dark, bg) {
  return scene(dark, bg, 590, ({ star, GF, dark: dk }) => {
    const ocx = C, ocy = star[1] - 120, R = 175, icx = C, icy = star[1] - 70, r = 165;
    const defs = `<mask id="cres" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><circle cx="${ocx}" cy="${ocy}" r="${R}" fill="#fff"/><circle cx="${icx}" cy="${icy}" r="${r}" fill="#000"/></mask>` +
      `<linearGradient id="moonG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk ? '#F3D58E' : '#7A0A3C'}"/><stop offset="0.7" stop-color="${dk ? '#D9A848' : '#C38A2A'}"/><stop offset="1" stop-color="${dk ? '#B07418' : '#E9BC5E'}"/></linearGradient>`;
    let g = `<g mask="url(#cres)"><circle cx="${ocx}" cy="${ocy}" r="${R}" fill="url(#moonG)"/></g>`;
    // fine gold inner line echoing the crescent
    g += `<g mask="url(#cres)"><circle cx="${ocx}" cy="${ocy + 18}" r="${R - 12}" fill="none" stroke="${dk ? '#FFF1C9' : '#F3D58E'}" stroke-width="1.4"/></g>`;
    // tiny stars and a heart hanging from the moon on a thread above the A's star
    g += `<path d="M${C},${ocy - R + 52}L${C},${star[1] - 140}" stroke="${GF}" stroke-width="1.3"/>`;
    g += `<path d="M${C},${star[1] - 106}L${C},${star[1] - 30}" stroke="${GF}" stroke-width="1.3"/>`;
    g += `<path d="${L.heart(C, star[1] - 122, 36)}" fill="url(#pink)"/>`;
    for (const [dx, dy, sz] of [[-118, -150, 14], [104, -190, 10], [150, -96, 8], [-150, -70, 8]]) g += `<path d="${B.star(C + dx, star[1] + dy, sz, 0.12)}" fill="${GF}"/>`;
    return { svg: g, defs };
  });
}

// 27 · Vanity Mirror — an ornate oval mirror on a thread handle from the star
function mirror(dark, bg) {
  return scene(dark, bg, 586, ({ tip, GF, dark: dk }) => {
    const mcx = C, mcy = tip[1] - 218, rx = 110, ry = 140;
    const defs = `<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dk ? '#6E1F45' : '#FBEFF1'}"/><stop offset="1" stop-color="${dk ? '#3E0820' : '#EBCFD6'}"/></linearGradient>`;
    let g = '';
    // handle: the thread rising from the star, with beads
    const hb = mcy + ry + 10;
    g += `<path d="${L.ribbon(L.cubicPts(tip, [tip[0], tip[1] - 20], [tip[0], hb + 30], [tip[0], hb], 40), (t) => 1.2 + 3.2 * t)}" fill="${GF}"/>`;
    g += pearl(C, tip[1] - 22, 4) + pearl(C, hb + 12, 5);
    // frame
    g += `<ellipse cx="${mcx}" cy="${mcy}" rx="${rx}" ry="${ry}" fill="url(#glass)"/>`;
    const ring = (rrx, rry, w) => { const pts = []; for (let i = 0; i <= 240; i++) { const a = (i / 240) * 2 * Math.PI; pts.push([mcx + rrx * Math.cos(a), mcy + rry * Math.sin(a)]); } return L.ribbon(pts, (t) => w * (0.55 + 0.45 * Math.abs(Math.cos(Math.PI * 2 * t)))); };
    g += `<path d="${ring(rx + 8, ry + 8, 5)}" fill="${GF}"/>`;
    g += `<ellipse cx="${mcx}" cy="${mcy}" rx="${rx - 3}" ry="${ry - 3}" fill="none" stroke="${GF}" stroke-width="1.3"/>`;
    let beads = ''; for (let i = 0; i < 40; i++) { const a = (i / 40) * 2 * Math.PI; beads += pearl(mcx + (rx + 20) * Math.cos(a), mcy + (ry + 20) * Math.sin(a), 2.6); }
    g += beads;
    // crest on top: three small scrolls and a star
    for (const sx of [-1, 1]) g += `<path d="${B.flourish([[mcx + sx * 6, mcy - ry - 20], [mcx + sx * 22, mcy - ry - 34], [mcx + sx * 40, mcy - ry - 36], [mcx + sx * 50, mcy - ry - 24]], { r0: 8, turns: 1, dir: sx === 1 ? 1 : -1, w0: 1, w1: 3.4, ball: 2.6 })}" fill="${GF}"/>`;
    g += `<path d="${B.star(mcx, mcy - ry - 42, 24, 0.1)}" fill="${GF}"/>`;
    // glass shine + reflected heart
    g += `<path d="M${mcx - 62},${mcy - 40}L${mcx - 22},${mcy - 96}M${mcx - 66},${mcy - 6}L${mcx - 4},${mcy - 92}" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="${dk ? 0.25 : 0.8}"/>`;
    g += `<path d="${L.heart(mcx + 10, mcy + 18, 54)}" fill="url(#pink)" opacity="0.95"/>`;
    return { svg: g, defs };
  });
}

module.exports = { tiara, moon, mirror };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out9', { recursive: true });
  const set = {
    '25-tiara': tiara(false, '#FFFFFF'), '25-tiara-dark': tiara(true, '#4A0A24'),
    '26-moon-and-star': moon(false, '#FBF6EF'), '26-moon-and-star-dark': moon(true, '#2E0A24'),
    '27-vanity-mirror': mirror(false, '#FFFFFF'), '27-vanity-mirror-dark': mirror(true, '#4A0A24'),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out9/${n}.svg`, v);
}
