// SUNDARLYSH MEMORIES — more line-art concepts: Film Strip S, Camera, Keepsake Envelope.
const L = require('./lib');
const B = require('./brand');
const C = 540;
const THEME = {
  noir: { bg: '#0B0A0B', ink: 'url(#lg)', txt: '#EAD3A0', glow: '#D9A848', hole: '#0B0A0B' },
  ivory: { bg: '#FBF6EF', ink: '#4A0A24', txt: '#4A0A24', glow: null, hole: '#FBF6EF' },
  wine: { bg: '#3E0820', ink: 'url(#lg)', txt: '#F2DDB0', glow: '#E9C676', hole: '#3E0820' },
};
let uid = 0;
function dbl(d, ink, { w = 3.4, gap = 6, cap = 'round', join = 'round' } = {}) {
  const id = `d2${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask><rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
function wrap(T, body) {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.5"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}</defs><rect width="1080" height="1080" fill="${T.bg}"/><g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, o = {}) => `<path d="${L.text(o.font || 'jos400', str, x, y, size, { ls: o.ls ?? 0.3, anchor: o.anchor || 'start' }).d}" fill="${fill}"/>`;
const services = (x, y, fill, anchor = 'middle', size = 20) => txt('EVENTS · WORKSHOPS · BRANDING', x, y, size, fill, { ls: 0.38, anchor });
// sampled geometric S centreline (top arm, left half-circle, middle, right half-circle, bottom arm)
function sPts(x0, y0, W, H, ext = 0) {
  const r = H / 4, pts = [];
  const line = (a, b, n) => { for (let i = 0; i < n; i++) pts.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };
  const arc = (cx, cy, a0, a1, n) => { for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  line([x0 + W + ext, y0], [x0 + r, y0], 40);
  arc(x0 + r, y0 + r, -Math.PI / 2, -Math.PI * 1.5, 60);
  line([x0 + r, y0 + 2 * r], [x0 + W - r, y0 + 2 * r], 30);
  arc(x0 + W - r, y0 + 3 * r, -Math.PI / 2, Math.PI / 2, 60);
  line([x0 + W - r, y0 + 4 * r], [x0 - ext, y0 + 4 * r], 40); pts.push([x0 - ext, y0 + 4 * r]);
  return pts;
}

// 43 · Film Strip S
function filmS(theme = 'noir') {
  const T = THEME[theme];
  const sx = 170, sy = 300, W = 230, H = 420, SW = 64;
  const pts = sPts(sx, sy, W, H, 20);
  const d = 'M' + pts.map((p) => p.map(L.r2).join(',')).join('L');
  let g = dbl(d, T.ink, { w: 3.2, gap: SW, cap: 'butt' });
  // walk along the strip: sprocket holes on both edges, frame dividers and little pictures
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s) => { let i = 1; while (i < len.length - 1 && len[i] < s) i++; const t = (s - len[i - 1]) / (len[i] - len[i - 1] || 1); const p = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], m = Math.hypot(dx, dy) || 1; return { p, tx: dx / m, ty: dy / m }; };
  const total = len[len.length - 1];
  let holes = '';
  for (let s = 10; s < total - 6; s += 19) {
    const { p, tx, ty } = at(s); const ang = (Math.atan2(ty, tx) * 180) / Math.PI;
    for (const side of [-1, 1]) { const off = side * (SW / 2 - 9); holes += `<rect x="-4" y="-3" width="8" height="6" rx="1.5" transform="translate(${L.r2(p[0] - ty * off)},${L.r2(p[1] + tx * off)}) rotate(${L.r2(ang)})"/>`; }
  }
  g += `<g fill="${T.ink}">${holes}</g>`;
  let k = 0;
  for (let s = 60; s < total - 40; s += 96, k++) {
    const { p, tx, ty } = at(s), ang = (Math.atan2(ty, tx) * 180) / Math.PI;
    const q = at(s + 48);
    g += `<path d="M${L.r2(p[0] - ty * 20)},${L.r2(p[1] + tx * 20)}L${L.r2(p[0] + ty * 20)},${L.r2(p[1] - tx * 20)}" stroke="${T.ink}" stroke-width="1.6"/>`;
    const icon = k % 3 === 0 ? L.heart(0, 0, 18) : k % 3 === 1 ? B.star(0, 0, 11, 0.12) : `M-6,0a6,6 0 1 0 12,0a6,6 0 1 0 -12,0Z`;
    g += `<path d="${icon}" transform="translate(${L.r2(q.p[0])},${L.r2(q.p[1])}) rotate(${L.r2(ang)})" fill="${k % 3 === 0 ? '#E8275E' : T.ink}"/>`;
  }
  g += txt('UNDARLYSH', sx + W + 50, sy + H - 6, 66, T.txt, { ls: 0.13 });
  g += `<rect x="${sx + W + 52}" y="${sy + H + 26}" width="${430}" height="2" fill="${T.ink}"/>`;
  g += txt('MEMORIES', sx + W + 52, sy + H + 84, 40, T.txt, { ls: 0.6, font: 'jos300' });
  g += services(sx + W + 52, sy + H + 130, T.txt, 'start', 17);
  return wrap(T, g);
}

// 44 · Camera — the S sits in the lens, the star is the flash, the name is on the body
function camera(theme = 'noir') {
  const T = THEME[theme];
  const x1 = 170, y1 = 330, x2 = 910, y2 = 720;
  let g = '';
  g += dbl(`M${x1 + 30},${y1}L${x1 + 150},${y1}L${x1 + 176},${y1 - 46}L${x1 + 300},${y1 - 46}L${x1 + 326},${y1}L${x2 - 30},${y1}Q${x2},${y1} ${x2},${y1 + 30}L${x2},${y2 - 30}Q${x2},${y2} ${x2 - 30},${y2}L${x1 + 30},${y2}Q${x1},${y2} ${x1},${y2 - 30}L${x1},${y1 + 30}Q${x1},${y1} ${x1 + 30},${y1}Z`, T.ink);
  const lx = x1 + 238, ly = (y1 + y2) / 2 + 6, R = 150;
  g += dbl(`M${lx},${ly - R}A${R} ${R} 0 1 1 ${lx - 0.01},${ly - R}Z`, T.ink);
  g += `<circle cx="${lx}" cy="${ly}" r="${R - 22}" fill="none" stroke="${T.ink}" stroke-width="1.4"/>`;
  // S in the lens whose arms reach the inner ring
  const r2 = R - 22, sH = 184, sW = 112, sx = lx - sW / 2, sy = ly - sH / 2, r = sH / 4;
  const cxX = (y, side) => lx + side * Math.sqrt(r2 * r2 - (y - ly) * (y - ly));
  g += dbl(`M${L.r2(cxX(sy, 1))},${sy}L${sx + r},${sy}A${r} ${r} 0 0 0 ${sx + r},${sy + 2 * r}L${sx + sW - r},${sy + 2 * r}A${r} ${r} 0 0 1 ${sx + sW - r},${sy + sH}L${L.r2(cxX(sy + sH, -1))},${sy + sH}`, T.ink, { cap: 'butt' });
  g += `<path d="${B.star(x2 - 70, y1 + 56, 26, 0.1)}" fill="${T.ink}"/>`; // flash
  g += `<rect x="${x1 + 196}" y="${y1 - 34}" width="${82}" height="${22}" rx="4" fill="none" stroke="${T.ink}" stroke-width="1.6"/>`;
  g += txt('UNDARLYSH', lx + R + 30, ly + 6, 44, T.txt, { ls: 0.11 });
  g += `<rect x="${lx + R + 36}" y="${ly + 30}" width="${270}" height="1.6" fill="${T.ink}"/>`;
  g += txt('MEMORIES', lx + R + 32, ly + 76, 28, T.txt, { ls: 0.58, font: 'jos300' });
  g += `<path d="${L.heart(lx + R + 300, ly - 92, 30)}" fill="#E8275E"/>`;
  g += services(C, y2 + 72, T.txt);
  return wrap(T, g);
}

// 45 · Keepsake Envelope — the S is the envelope's left side; heart seal; the name as the address
function envelope(theme = 'noir') {
  const T = THEME[theme];
  const x1 = 300, y1 = 300, x2 = 900, y2 = 700;
  const sH = y2 - y1, sW = 190, sx = x1 - 150, r = sH / 4;
  let g = '';
  // S on the left whose top arm is the envelope's top edge and bottom arm its bottom edge
  g += dbl(`M${x2},${y1}L${sx + r},${y1}A${r} ${r} 0 0 0 ${sx + r},${y1 + 2 * r}L${sx + sW - r},${y1 + 2 * r}A${r} ${r} 0 0 1 ${sx + sW - r},${y2}L${x2},${y2}L${x2},${y1}`, T.ink, { join: 'miter' });
  // flap
  const fx = (x1 + 60 + x2) / 2, fy = y1 + 170;
  g += dbl(`M${x1 + 60},${y1}L${fx},${fy}L${x2},${y1}`, T.ink, { join: 'miter', cap: 'butt' });
  // heart wax seal on the flap point
  g += `<circle cx="${fx}" cy="${fy}" r="34" fill="none" stroke="${T.ink}" stroke-width="3"/><path d="${L.heart(fx, fy + 2, 34)}" fill="#E8275E"/>`;
  g += `<path d="${B.star(x2 - 50, y1 + 52, 18, 0.1)}" fill="${T.ink}"/>`;
  // address lines
  g += txt('UNDARLYSH', fx + 10, y2 - 120, 54, T.txt, { ls: 0.12, anchor: 'middle' });
  g += txt('MEMORIES', fx + 10, y2 - 62, 32, T.txt, { ls: 0.58, font: 'jos300', anchor: 'middle' });
  g += services(C, y2 + 76, T.txt);
  return wrap(T, g);
}

module.exports = { filmS, camera, envelope };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out17', { recursive: true });
  for (const [n, f] of Object.entries({ 'film-strip-s': filmS, camera, 'keepsake-envelope': envelope }))
    for (const t of ['noir', 'ivory', 'wine']) fs.writeFileSync(`out17/memories-${n}-${t}.svg`, f(t));
}
