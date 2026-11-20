// SUNDARLYSH MEMORIES — S Mandala, Fireworks, Message in a Bottle.
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
  const id = `d6${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask><rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
function wrap(T, body) {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.5"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}</defs><rect width="1080" height="1080" fill="${T.bg}"/><g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, o = {}) => `<path d="${L.text(o.font || 'jos400', str, x, y, size, { ls: o.ls ?? 0.3, anchor: o.anchor || 'start' }).d}" fill="${fill}"/>`;
const centreName = (T, y) => txt('SUNDARLYSH', C, y, 62, T.txt, { ls: 0.14, anchor: 'middle' }) + `<rect x="${C - 220}" y="${y + 24}" width="440" height="1.6" fill="${T.ink}"/>` +
  txt('MEMORIES', C, y + 80, 36, T.txt, { ls: 0.62, font: 'jos300', anchor: 'middle' }) + txt('EVENTS · WORKSHOPS · BRANDING', C, y + 128, 18, T.txt, { ls: 0.38, anchor: 'middle' });

// 55 · S Mandala — eight S's turned around a heart form a rosette
function mandala(theme = 'noir') {
  const T = THEME[theme];
  const cx = C, cy = 360, n = 6;
  let g = '';
  const S = L.text('bodoni500', 'S', 0, 0, 120, { anchor: 'start' });
  const sw = S.bbox.x2 - S.bbox.x1, sh = S.bbox.y2 - S.bbox.y1;
  const Sd = L.text('bodoni500', 'S', -S.bbox.x1 - sw / 2, -S.bbox.y1 - sh - 34, 120, { anchor: 'start' }).d; // S sits above the centre
  for (let i = 0; i < n; i++) g += `<path d="${Sd}" fill="${T.ink}" transform="translate(${cx},${cy}) rotate(${(360 / n) * i})"/>`;
  g += dbl(`M${cx},${cy - 196}A196 196 0 1 1 ${cx - 0.01},${cy - 196}Z`, T.ink);
  let dots = ''; for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI; dots += `<circle cx="${L.r2(cx + 214 * Math.cos(a))}" cy="${L.r2(cy + 214 * Math.sin(a))}" r="2.2"/>`; }
  g += `<g fill="${T.ink}">${dots}</g>`;
  g += `<circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${T.ink}" stroke-width="2"/><path d="${L.heart(cx, cy + 1, 32)}" fill="#E8275E"/>`;
  g += `<path d="${B.star(cx, cy - 250, 24, 0.1)}" fill="${T.ink}"/>`;
  g += centreName(T, 680);
  return wrap(T, g);
}

// 56 · Fireworks — the S glows at the heart of a celebration burst
function fireworks(theme = 'noir') {
  const T = THEME[theme];
  const cx = C, cy = 360;
  let g = '';
  const burst = (x, y, r0, r1, n, dot, w) => { let o = ''; for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a); o += `<path d="M${L.r2(x + r0 * c)},${L.r2(y + r0 * s)}L${L.r2(x + r1 * c)},${L.r2(y + r1 * s)}" stroke="${T.ink}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${L.r2(x + (r1 + 10) * c)}" cy="${L.r2(y + (r1 + 10) * s)}" r="${dot}" fill="${i % 4 === 0 ? '#E8275E' : T.ink}"/>`; } return o; };
  g += burst(cx, cy, 120, 220, 24, 4, 2.4);
  g += burst(cx, cy, 104, 150, 24, 0, 1.2).replace(/<circle[^>]*\/>/g, '');
  g += burst(cx - 250, cy - 120, 18, 56, 12, 2.6, 1.6) + burst(cx + 250, cy - 90, 16, 48, 12, 2.4, 1.6);
  // rocket trail rising into the burst
  g += `<path d="${L.ribbon(L.cubicPts([cx - 40, cy + 300], [cx - 10, cy + 230], [cx + 10, cy + 180], [cx, cy + 112], 40), (t) => 0.5 + 2 * t)}" fill="${T.ink}" opacity="0.7"/>`;
  const S = L.text('bodoni600', 'S', cx, cy + 62, 180);
  g += `<path d="${S.d}" fill="${T.ink}"/>`;
  g += `<path d="${B.star(cx + 62, cy - 62, 18, 0.1)}" fill="${T.ink}"/>`;
  g += centreName(T, 730);
  return wrap(T, g);
}

// 57 · Message in a Bottle — a rolled letter stamped with the S, kept in a bottle on the waves
function bottle(theme = 'noir') {
  const T = THEME[theme];
  const cx = C, cy = 380, ang = -18;
  let g = `<g transform="rotate(${ang} ${cx} ${cy})">`;
  // bottle outline: body + shoulder + neck + cork
  const bw = 300, bh = 150, neck = 40;
  const x1 = cx - bw / 2, x2 = cx + bw / 2;
  g += dbl(`M${x1 + 40},${cy - bh / 2}L${x2 - 70},${cy - bh / 2}C${x2 - 30},${cy - bh / 2} ${x2 - 10},${cy - neck / 2} ${x2 + 30},${cy - neck / 2}L${x2 + 90},${cy - neck / 2}L${x2 + 90},${cy + neck / 2}L${x2 + 30},${cy + neck / 2}C${x2 - 10},${cy + neck / 2} ${x2 - 30},${cy + bh / 2} ${x2 - 70},${cy + bh / 2}L${x1 + 40},${cy + bh / 2}Q${x1},${cy + bh / 2} ${x1},${cy + bh / 2 - 40}L${x1},${cy - bh / 2 + 40}Q${x1},${cy - bh / 2} ${x1 + 40},${cy - bh / 2}Z`, T.ink);
  g += `<rect x="${x2 + 92}" y="${cy - neck / 2 + 4}" width="34" height="${neck - 8}" rx="6" fill="${T.ink}"/>`;
  // rolled letter inside, tied with a heart
  g += `<rect x="${cx - 100}" y="${cy - 40}" width="190" height="80" rx="38" fill="none" stroke="${T.ink}" stroke-width="2.4"/>`;
  g += `<path d="M${cx - 62},${cy - 40}C${cx - 76},${cy - 20} ${cx - 76},${cy + 20} ${cx - 62},${cy + 40}" fill="none" stroke="${T.ink}" stroke-width="1.6"/>`;
  g += `<path d="${L.text('bodoni600', 'S', cx + 14, cy + 28, 76).d}" fill="${T.ink}"/>`;
  g += `<path d="${L.heart(cx - 64, cy + 2, 22)}" fill="#E8275E"/>`;
  g += `<path d="M${x1 + 30},${cy - bh / 2 + 22}Q${x1 + 90},${cy - bh / 2 + 10} ${x1 + 160},${cy - bh / 2 + 16}" fill="none" stroke="${T.ink}" stroke-width="2" opacity="0.6"/></g>`;
  // waves that run on as the line under the name
  let wave = `M${cx - 280},560`;
  for (let i = 0; i < 8; i++) wave += `q35,-22 70,0`;
  g += dbl(wave, T.ink, { w: 2.6, gap: 5 });
  g += `<path d="${B.star(cx + 260, 210, 22, 0.1)}" fill="${T.ink}"/><path d="${B.star(cx - 240, 250, 14, 0.1)}" fill="${T.ink}"/>`;
  g += centreName(T, 680);
  return wrap(T, g);
}

module.exports = { mandala, fireworks, bottle };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out21', { recursive: true });
  for (const [n, f] of Object.entries({ 's-mandala': mandala, fireworks, 'message-in-a-bottle': bottle }))
    for (const t of ['noir', 'ivory', 'wine']) fs.writeFileSync(`out21/memories-${n}-${t}.svg`, f(t));
}
