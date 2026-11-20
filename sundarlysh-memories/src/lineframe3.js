// SUNDARLYSH MEMORIES — Constellation S, Memory Locket, Vintage Key.
const L = require('./lib');
const B = require('./brand');
const C = 540;
const THEME = {
  noir: { bg: '#0B0A0B', ink: 'url(#lg)', txt: '#EAD3A0', glow: '#D9A848' },
  ivory: { bg: '#FBF6EF', ink: '#4A0A24', txt: '#4A0A24', glow: null },
  night: { bg: '#0D1230', ink: 'url(#lg)', txt: '#F2DDB0', glow: '#E9C676' },
  wine: { bg: '#3E0820', ink: 'url(#lg)', txt: '#F2DDB0', glow: '#E9C676' },
};
let uid = 0;
function dbl(d, ink, { w = 3.2, gap = 6, cap = 'round', join = 'round' } = {}) {
  const id = `d3${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask><rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
function wrap(T, body, under = '') {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.5"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}</defs><rect width="1080" height="1080" fill="${T.bg}"/>${under}<g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, o = {}) => `<path d="${L.text(o.font || 'jos400', str, x, y, size, { ls: o.ls ?? 0.3, anchor: o.anchor || 'start' }).d}" fill="${fill}"/>`;
const services = (x, y, fill, anchor = 'middle', size = 19) => txt('EVENTS · WORKSHOPS · BRANDING', x, y, size, fill, { ls: 0.38, anchor });
function rand(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

// 46 · Constellation S — the S traced in stars joined by fine lines
function constellation(theme = 'night') {
  const T = THEME[theme];
  const R = rand(7);
  let under = '';
  if (theme !== 'ivory') for (let i = 0; i < 90; i++) under += `<circle cx="${L.r2(R() * 1080)}" cy="${L.r2(R() * 1080)}" r="${L.r2(0.6 + R() * 1.4)}" fill="#FFF3D0" opacity="${L.r2(0.2 + R() * 0.5)}"/>`;
  // star points along an S (top arm, upper bowl, spine, lower bowl, tail)
  const P = [[400, 262], [330, 248], [262, 270], [228, 330], [250, 392], [312, 430], [372, 470], [404, 534], [388, 600], [330, 640], [258, 646], [204, 612]];
  const sizes = [16, 10, 13, 9, 14, 10, 20, 11, 15, 9, 12, 18].map((v) => v * 1.6);
  for (const p of P) { p[0] = 300 + (p[0] - 300) * 1.22; p[1] = 450 + (p[1] - 450) * 1.22; }
  let g = `<path d="M${P.map((p) => p.join(',')).join('L')}" fill="none" stroke="${T.ink}" stroke-width="2.2"/>`;
  P.forEach((p, i) => { g += `<path d="${B.star(p[0], p[1], sizes[i], 0.1)}" fill="${T.ink}"/>`; });
  g += `<path d="${L.heart(P[6][0], P[6][1], 30)}" fill="#E8275E"/>`;
  // a shooting-star trail from the tail into the name
  g += `<path d="${L.ribbon(L.cubicPts(P[11], [P[11][0] + 50, 740], [400, 720], [470, 650], 60), (t) => 0.4 + 2.2 * t)}" fill="${T.ink}" opacity="0.8"/>`;
  g += txt('UNDARLYSH', 470, 640, 62, T.txt, { ls: 0.14 });
  g += `<rect x="472" y="664" width="420" height="1.6" fill="${T.ink}"/>`;
  g += txt('MEMORIES', 472, 720, 38, T.txt, { ls: 0.62, font: 'jos300' });
  g += services(472, 766, T.txt, 'start', 17);
  return wrap(T, g, under);
}

// 47 · Memory Locket — a heart locket holding the S, its chain draped over the name
function locket(theme = 'noir') {
  const T = THEME[theme];
  const lx = 300, ly = 560, ls = 300;
  let g = '';
  // chain: links along a catenary from the locket bail over to the right
  const bail = [lx, ly - ls * 0.36 - 26];
  const chain = L.cubicPts(bail, [bail[0] + 60, bail[1] - 210], [820, 190], [900, 330], 120);
  let links = '';
  for (let i = 0; i < chain.length - 1; i += 3) {
    const p = chain[i], q = chain[Math.min(chain.length - 1, i + 2)], ang = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
    links += `<ellipse cx="${L.r2(p[0])}" cy="${L.r2(p[1])}" rx="7" ry="3.6" transform="rotate(${L.r2(ang + (i % 6 ? 0 : 90 * 0))} ${L.r2(p[0])} ${L.r2(p[1])})" fill="none" stroke="${T.ink}" stroke-width="1.8"/>`;
  }
  g += links;
  g += `<circle cx="900" cy="338" r="9" fill="none" stroke="${T.ink}" stroke-width="2.4"/>`; // clasp
  // locket: double-line heart with an inner border and a bail ring
  g += dbl(L.heart(lx, ly, ls), T.ink);
  g += `<path d="${L.heart(lx, ly + 6, ls * 0.84)}" fill="none" stroke="${T.ink}" stroke-width="1.4"/>`;
  g += `<circle cx="${bail[0]}" cy="${bail[1] + 10}" r="12" fill="none" stroke="${T.ink}" stroke-width="3"/>`;
  // the S inside the locket (Bodoni, engraved)
  const S = L.text('bodoni600', 'S', lx, ly + 54, 170);
  g += `<path d="${S.d}" fill="${T.ink}"/>`;
  g += `<path d="${B.star(lx + 62, ly - 50, 16, 0.1)}" fill="${T.ink}"/>`;
  // name under the chain
  g += txt('UNDARLYSH', lx + ls * 0.52 + 20, ly + 40, 56, T.txt, { ls: 0.12 });
  g += `<rect x="${lx + ls * 0.52 + 22}" y="${ly + 64}" width="330" height="1.6" fill="${T.ink}"/>`;
  g += txt('MEMORIES', lx + ls * 0.52 + 22, ly + 116, 34, T.txt, { ls: 0.6, font: 'jos300' });
  g += services(C, ly + 250, T.txt);
  return wrap(T, g);
}

// 48 · Vintage Key — the key's bow holds the S; its shaft underlines the name; the bit has a heart cut
function key(theme = 'noir') {
  const T = THEME[theme];
  const bx = 270, by = 470, R = 140, shaftY = by + 0;
  let g = '';
  // ornate bow: double ring + four lobes (quatrefoil)
  g += dbl(`M${bx},${by - R}A${R} ${R} 0 1 1 ${bx - 0.01},${by - R}Z`, T.ink);
  let lobes = '';
  for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + Math.PI / 4, cx = bx + (R + 16) * Math.cos(a), cy = by + (R + 16) * Math.sin(a); lobes += `<circle cx="${L.r2(cx)}" cy="${L.r2(cy)}" r="22" fill="none" stroke="${T.ink}" stroke-width="2.6"/>`; }
  g += lobes;
  g += `<path d="${B.star(bx, by - R - 44, 26, 0.1)}" fill="${T.ink}"/>`;
  const S = L.text('bodoni600', 'S', bx, by + 66, 190);
  g += `<path d="${S.d}" fill="${T.ink}"/>`;
  // collar + shaft
  const sx0 = bx + R, sx1 = 950;
  g += dbl(`M${sx0},${shaftY}L${sx1},${shaftY}`, T.ink, { cap: 'butt', gap: 10 });
  for (const x of [sx0 + 20, sx0 + 34]) g += `<rect x="${x}" y="${shaftY - 16}" width="6" height="32" fill="${T.ink}"/>`;
  // bit with stepped teeth and a heart cut-out
  const tx = sx1 - 120;
  g += dbl(`M${tx},${shaftY + 9}L${tx},${shaftY + 90}L${tx + 36},${shaftY + 90}L${tx + 36},${shaftY + 64}L${tx + 72},${shaftY + 64}L${tx + 72},${shaftY + 100}L${sx1},${shaftY + 100}L${sx1},${shaftY + 9}`, T.ink, { join: 'miter', cap: 'butt' });
  g += `<path d="${L.heart(tx + 80, shaftY + 44, 26)}" fill="#E8275E"/>`;
  // name rides on the shaft
  g += txt('UNDARLYSH', sx0 + 60, shaftY - 26, 60, T.txt, { ls: 0.13 });
  g += txt('MEMORIES', sx0 + 62, shaftY + 60, 30, T.txt, { ls: 0.55, font: 'jos300' });
  g += services(C, shaftY + 210, T.txt);
  return wrap(T, g);
}

module.exports = { constellation, locket, key };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out18', { recursive: true });
  for (const t of ['night', 'noir', 'ivory']) fs.writeFileSync(`out18/memories-constellation-s-${t}.svg`, constellation(t));
  for (const t of ['noir', 'ivory', 'wine']) { fs.writeFileSync(`out18/memories-locket-${t}.svg`, locket(t)); fs.writeFileSync(`out18/memories-vintage-key-${t}.svg`, key(t)); }
}
