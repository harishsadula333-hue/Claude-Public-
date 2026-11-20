// SUNDARLYSH MEMORIES — Paper Plane, Hot Air Balloon, Ribbon Bow.
const L = require('./lib');
const B = require('./brand');
const C = 540;
const THEME = {
  noir: { bg: '#0B0A0B', ink: 'url(#lg)', txt: '#EAD3A0', glow: '#D9A848' },
  ivory: { bg: '#FBF6EF', ink: '#4A0A24', txt: '#4A0A24', glow: null },
  wine: { bg: '#3E0820', ink: 'url(#lg)', txt: '#F2DDB0', glow: '#E9C676' },
};
let uid = 0;
function dbl(d, ink, { w = 3.2, gap = 6, cap = 'round', join = 'round' } = {}) {
  const id = `d5${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask><rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
function wrap(T, body) {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.5"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}</defs><rect width="1080" height="1080" fill="${T.bg}"/><g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, o = {}) => `<path d="${L.text(o.font || 'jos400', str, x, y, size, { ls: o.ls ?? 0.3, anchor: o.anchor || 'start' }).d}" fill="${fill}"/>`;
const services = (x, y, fill, anchor = 'middle', size = 19) => txt('EVENTS · WORKSHOPS · BRANDING', x, y, size, fill, { ls: 0.38, anchor });
const nameBlock = (T, x, y, s = 60, anchor = 'start') => {
  const w = s * 7.2, x0 = anchor === 'middle' ? x - w / 2 : x;
  return txt('SUNDARLYSH', x, y, s, T.txt, { ls: 0.13, anchor }) + `<rect x="${x0}" y="${y + 24}" width="${w}" height="1.6" fill="${T.ink}"/>` + txt('MEMORIES', x, y + 24 + s * 0.95, s * 0.6, T.txt, { ls: 0.62, font: 'jos300', anchor });
};
// smooth S centreline (bottom-left terminal -> top-right terminal)
const sCurve = (x, y, w, h) => L.cubicPts([x, y + h * 0.86], [x + w * 0.2, y + h * 1.04], [x + w * 1.05, y + h * 1.0], [x + w * 0.95, y + h * 0.72], 50)
  .concat(L.cubicPts([x + w * 0.95, y + h * 0.72], [x + w * 0.85, y + h * 0.5], [x + w * 0.05, y + h * 0.52], [x + w * 0.08, y + h * 0.26], 50).slice(1))
  .concat(L.cubicPts([x + w * 0.08, y + h * 0.26], [x + w * 0.1, y - h * 0.02], [x + w * 0.85, y - h * 0.04], [x + w * 1.0, y + h * 0.1], 50).slice(1));

// 52 · Paper Plane — the plane's dotted trail draws the S
function plane(theme = 'noir') {
  const T = THEME[theme];
  const pts = sCurve(180, 250, 300, 440);
  let g = '';
  let dots = ''; for (let i = 0; i < pts.length - 6; i += 3) dots += `<circle cx="${L.r2(pts[i][0])}" cy="${L.r2(pts[i][1])}" r="${L.r2(2 + 2.4 * (i / pts.length))}"/>`;
  g += `<g fill="${T.ink}">${dots}</g>`;
  for (const i of [24, 74, 118]) g += `<path d="${L.heart(pts[i][0], pts[i][1] - 18, 20)}" fill="#E8275E"/>`;
  // origami plane at the end of the trail, heading up-right
  const e = pts[pts.length - 1], ang = -24;
  g += `<g transform="translate(${L.r2(e[0] + 30)},${L.r2(e[1] - 20)}) rotate(${ang})">` +
    dbl('M-50,-6L56,-30L-18,22L-12,4Z', T.ink, { join: 'miter' }).replace(/width="1080" height="1080" fill/g, 'x="-200" y="-200" width="400" height="400" fill').replace(/x="0" y="0" width="1080" height="1080"/g, 'x="-200" y="-200" width="400" height="400"') +
    `<path d="M-12,4L56,-30" stroke="${T.ink}" stroke-width="2.4"/></g>`;
  g += `<path d="${B.star(560, 230, 22, 0.1)}" fill="${T.ink}"/>`;
  g += nameBlock(T, 470, 610, 62);
  g += services(472, 726, T.txt, 'start', 17);
  return wrap(T, g);
}

// 53 · Hot Air Balloon — the S rides on the balloon's centre panel
function balloon(theme = 'noir') {
  const T = THEME[theme];
  const cx = 320, cy = 400, rw = 170, rh = 200;
  let g = '';
  const env = `M${cx},${cy - rh}C${cx + rw * 1.35},${cy - rh} ${cx + rw * 1.1},${cy + rh * 0.55} ${cx + rw * 0.32},${cy + rh * 0.98}L${cx - rw * 0.32},${cy + rh * 0.98}C${cx - rw * 1.1},${cy + rh * 0.55} ${cx - rw * 1.35},${cy - rh} ${cx},${cy - rh}Z`;
  g += dbl(env, T.ink);
  // gores
  for (const k of [-0.62, 0.62]) g += `<path d="M${cx},${cy - rh}C${cx + rw * k * 1.15},${cy - rh * 0.6} ${cx + rw * k * 0.95},${cy + rh * 0.5} ${cx + rw * 0.32 * Math.sign(k)},${cy + rh * 0.98}" fill="none" stroke="${T.ink}" stroke-width="1.8"/>`;
  const S = L.text('bodoni600', 'S', cx, cy + 46, 150);
  g += `<path d="${S.d}" fill="${T.ink}"/>`;
  // ropes + basket
  const by = cy + rh + 70;
  g += `<path d="M${cx - rw * 0.32},${cy + rh * 0.98}L${cx - 34},${by}M${cx + rw * 0.32},${cy + rh * 0.98}L${cx + 34},${by}M${cx},${cy + rh * 0.98}L${cx},${by}" stroke="${T.ink}" stroke-width="1.6"/>`;
  g += dbl(`M${cx - 40},${by}L${cx + 40},${by}L${cx + 32},${by + 50}L${cx - 32},${by + 50}Z`, T.ink, { join: 'miter' });
  g += `<path d="M${cx - 36},${by + 18}L${cx + 36},${by + 18}" stroke="${T.ink}" stroke-width="1.4"/>`;
  // floating hearts and stars
  for (const [x, y, s] of [[560, 220, 22], [600, 300, 14], [130, 250, 16]]) g += `<path d="${L.heart(x, y, s)}" fill="#E8275E"/>`;
  for (const [x, y, s] of [[520, 160, 18], [150, 170, 12], [580, 380, 10]]) g += `<path d="${B.star(x, y, s, 0.1)}" fill="${T.ink}"/>`;
  g += nameBlock(T, 560, 560, 58);
  g += services(562, 676, T.txt, 'start', 16);
  return wrap(T, g);
}

// 54 · Ribbon Bow — a bow whose long tail curls into the S
function bow(theme = 'noir') {
  const T = THEME[theme];
  const kx = 290, ky = 260;
  let g = '';
  // loops
  g += dbl(`M${kx},${ky}C${kx - 60},${ky - 90} ${kx - 170},${ky - 70} ${kx - 150},${ky - 10}C${kx - 136},${ky + 34} ${kx - 60},${ky + 30} ${kx},${ky}Z`, T.ink);
  g += dbl(`M${kx},${ky}C${kx + 60},${ky - 90} ${kx + 170},${ky - 70} ${kx + 150},${ky - 10}C${kx + 136},${ky + 34} ${kx + 60},${ky + 30} ${kx},${ky}Z`, T.ink);
  g += `<circle cx="${kx}" cy="${ky}" r="16" fill="${T.ink}"/>`;
  // short tail to the right
  g += dbl(`M${kx + 6},${ky + 10}C${kx + 40},${ky + 60} ${kx + 70},${ky + 100} ${kx + 60},${ky + 150}`, T.ink);
  // long tail curling into an S
  const tail = L.cubicPts([kx - 6, ky + 12], [kx - 120, ky + 90], [kx - 150, ky + 220], [kx - 20, ky + 260], 50)
    .concat(L.cubicPts([kx - 20, ky + 260], [kx + 120, ky + 300], [kx + 130, ky + 470], [kx - 10, ky + 500], 50).slice(1))
    .concat(L.cubicPts([kx - 10, ky + 500], [kx - 100, ky + 520], [kx - 160, ky + 480], [kx - 170, ky + 430], 40).slice(1));
  // ribbon as a band (two edges) with varying width
  const off = tail.map((p, i) => { const a = tail[Math.max(0, i - 1)], b = tail[Math.min(tail.length - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; return [-ty / m, tx / m]; });
  const wv = (t) => 8 + 12 * Math.abs(Math.cos(Math.PI * 2.2 * t));
  const e1 = tail.map((p, i) => [p[0] + off[i][0] * wv(i / tail.length), p[1] + off[i][1] * wv(i / tail.length)]);
  const e2 = tail.map((p, i) => [p[0] - off[i][0] * wv(i / tail.length), p[1] - off[i][1] * wv(i / tail.length)]);
  g += `<path d="${L.polyline(e1)}" fill="none" stroke="${T.ink}" stroke-width="3"/><path d="${L.polyline(e2)}" fill="none" stroke="${T.ink}" stroke-width="3"/>`;
  const end = tail[tail.length - 1];
  g += `<path d="M${L.r2(e1[e1.length - 1][0])},${L.r2(e1[e1.length - 1][1])}L${L.r2(end[0] - 10)},${L.r2(end[1] - 22)}L${L.r2(e2[e2.length - 1][0])},${L.r2(e2[e2.length - 1][1])}" fill="none" stroke="${T.ink}" stroke-width="3"/>`;
  g += `<path d="${L.heart(kx, ky + 1, 16)}" fill="#E8275E"/>`;
  g += `<path d="${B.star(kx + 190, ky - 70, 20, 0.1)}" fill="${T.ink}"/>`;
  g += nameBlock(T, 480, 640, 62);
  g += services(482, 756, T.txt, 'start', 17);
  return wrap(T, g);
}

module.exports = { plane, balloon, bow };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out20', { recursive: true });
  for (const [n, f] of Object.entries({ 'paper-plane': plane, 'hot-air-balloon': balloon, 'ribbon-bow': bow }))
    for (const t of ['noir', 'ivory', 'wine']) fs.writeFileSync(`out20/memories-${n}-${t}.svg`, f(t));
}
