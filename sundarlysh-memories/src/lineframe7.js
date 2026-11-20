// SUNDARLYSH MEMORIES — Vinyl Record, Festive Lantern, Quill & Ink.
const L = require('./lib');
const B = require('./brand');
const C = 540;
const THEME = {
  noir: { bg: '#0B0A0B', ink: 'url(#lg)', txt: '#EAD3A0', glow: '#D9A848', bg2: '#0B0A0B' },
  ivory: { bg: '#FBF6EF', ink: '#4A0A24', txt: '#4A0A24', glow: null, bg2: '#FBF6EF' },
  wine: { bg: '#3E0820', ink: 'url(#lg)', txt: '#F2DDB0', glow: '#E9C676', bg2: '#3E0820' },
};
let uid = 0;
function dbl(d, ink, { w = 3.2, gap = 6, cap = 'round', join = 'round' } = {}) {
  const id = `d7${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask><rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
function wrap(T, body) {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.5"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}</defs><rect width="1080" height="1080" fill="${T.bg}"/><g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, o = {}) => `<path d="${L.text(o.font || 'jos400', str, x, y, size, { ls: o.ls ?? 0.3, anchor: o.anchor || 'start' }).d}" fill="${fill}"/>`;
const centreName = (T, y) => txt('SUNDARLYSH', C, y, 62, T.txt, { ls: 0.14, anchor: 'middle' }) + `<rect x="${C - 220}" y="${y + 24}" width="440" height="1.6" fill="${T.ink}"/>` +
  txt('MEMORIES', C, y + 80, 36, T.txt, { ls: 0.62, font: 'jos300', anchor: 'middle' }) + txt('EVENTS · WORKSHOPS · BRANDING', C, y + 128, 18, T.txt, { ls: 0.38, anchor: 'middle' });

// 58 · Vinyl Record
function vinyl(theme = 'noir') {
  const T = THEME[theme];
  const cx = 500, cy = 370, R = 210;
  let g = dbl(`M${cx},${cy - R}A${R} ${R} 0 1 1 ${cx - 0.01},${cy - R}Z`, T.ink);
  for (const r of [176, 150, 124, 104]) g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.ink}" stroke-width="1.1" opacity="0.7"/>`;
  g += `<path d="M${cx - 150},${cy - 70}A165 165 0 0 1 ${cx - 40},${cy - 160}" fill="none" stroke="${theme === 'ivory' ? '#FFFFFF' : '#FFF3D0'}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="72" fill="${T.ink}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${T.bg}"/>`;
  g += `<path d="${L.text('bodoni600', 'S', cx, cy + 38, 104).d}" fill="${T.bg}"/>`;
  // tone arm
  g += dbl(`M${cx + 250},${cy - 200}L${cx + 236},${cy - 30}L${cx + 140},${cy + 70}`, T.ink, { join: 'round' });
  g += `<circle cx="${cx + 250}" cy="${cy - 200}" r="18" fill="none" stroke="${T.ink}" stroke-width="3"/><rect x="${cx + 118}" y="${cy + 58}" width="34" height="18" rx="3" transform="rotate(-45 ${cx + 135} ${cy + 67})" fill="${T.ink}"/>`;
  // hearts drifting up like notes
  for (const [x, y, s] of [[cx + 300, cy - 70, 20], [cx + 330, cy - 130, 26], [cx + 300, cy - 210, 16]]) g += `<path d="${L.heart(x, y, s)}" fill="#E8275E"/>`;
  g += `<path d="M${cx + 290},${cy - 40}Q${cx + 340},${cy - 120} ${cx + 300},${cy - 230}" fill="none" stroke="${T.ink}" stroke-width="1.4" stroke-dasharray="3 7"/>`;
  g += centreName(T, 690);
  return wrap(T, g);
}

// 59 · Festive Lantern (kandil)
function lantern(theme = 'noir') {
  const T = THEME[theme];
  const cx = C, top = 120;
  let g = `<path d="M${cx},${top - 40}L${cx},${top}" stroke="${T.ink}" stroke-width="2"/><circle cx="${cx}" cy="${top + 8}" r="10" fill="none" stroke="${T.ink}" stroke-width="2.6"/>`;
  // dome cap
  g += dbl(`M${cx - 70},${top + 70}Q${cx},${top - 10} ${cx + 70},${top + 70}Z`, T.ink, { join: 'miter' });
  // body: faceted lantern
  const y1 = top + 70, y2 = top + 330;
  g += dbl(`M${cx - 70},${y1}L${cx - 140},${y1 + 90}L${cx - 140},${y2 - 70}L${cx - 70},${y2}L${cx + 70},${y2}L${cx + 140},${y2 - 70}L${cx + 140},${y1 + 90}L${cx + 70},${y1}Z`, T.ink, { join: 'miter' });
  g += `<path d="M${cx - 70},${y1}L${cx - 70},${y2}M${cx + 70},${y1}L${cx + 70},${y2}M${cx - 140},${y1 + 90}L${cx + 140},${y1 + 90}M${cx - 140},${y2 - 70}L${cx + 140},${y2 - 70}" stroke="${T.ink}" stroke-width="1.4"/>`;
  // glow + S on the centre pane
  g += `<ellipse cx="${cx}" cy="${(y1 + y2) / 2 + 10}" rx="60" ry="80" fill="${T.glow || '#E9C676'}" opacity="0.18"/>`;
  g += `<path d="${L.text('bodoni600', 'S', cx, (y1 + y2) / 2 + 40, 110).d}" fill="${T.ink}"/>`;
  for (const sx of [-1, 1]) g += `<path d="${L.heart(cx + sx * 105, (y1 + y2) / 2 + 12, 22)}" fill="#E8275E"/>`;
  // base + tassels
  g += dbl(`M${cx - 70},${y2}L${cx - 40},${y2 + 36}L${cx + 40},${y2 + 36}L${cx + 70},${y2}`, T.ink, { join: 'miter' });
  for (const dx of [-30, 0, 30]) { g += `<path d="M${cx + dx},${y2 + 36}L${cx + dx},${y2 + 86 + (dx === 0 ? 20 : 0)}" stroke="${T.ink}" stroke-width="2"/><circle cx="${cx + dx}" cy="${y2 + 92 + (dx === 0 ? 20 : 0)}" r="6" fill="${T.ink}"/>`; }
  for (const [x, y, s] of [[cx - 230, 230, 18], [cx + 230, 200, 22], [cx + 260, 330, 12]]) g += `<path d="${B.star(x, y, s, 0.1)}" fill="${T.ink}"/>`;
  g += centreName(T, 700);
  return wrap(T, g);
}

// 60 · Quill & Ink — a quill writing a flowing S; a heart-shaped ink drop
function quill(theme = 'noir') {
  const T = THEME[theme];
  let g = '';
  // flowing ink S (calligraphic)
  const s1 = L.cubicPts([300, 560], [380, 610], [520, 590], [500, 500], 50).concat(L.cubicPts([500, 500], [480, 420], [320, 450], [320, 360], 50).slice(1)).concat(L.cubicPts([320, 360], [320, 280], [470, 270], [520, 320], 40).slice(1));
  g += `<path d="${L.ribbon(s1, (t) => 1.5 + 9 * Math.abs(Math.sin(Math.PI * t * 1.5 + 0.3)))}" fill="${T.ink}"/>`;
  // quill feather: shaft + vane
  const tip = [520, 320];
  const shaft = L.cubicPts(tip, [580, 250], [660, 170], [760, 110], 40);
  g += `<path d="${L.ribbon(shaft, (t) => 1 + 2 * (1 - t))}" fill="${T.ink}"/>`;
  const vane = `M${tip[0] + 40},${tip[1] - 46}C${tip[0] + 60},${tip[1] - 140} ${tip[0] + 160},${tip[1] - 230} ${760},${110}C${tip[0] + 220},${tip[1] - 140} ${tip[0] + 160},${tip[1] - 70} ${tip[0] + 40},${tip[1] - 46}Z`;
  g += dbl(vane, T.ink);
  let barbs = ''; for (let i = 6; i < 38; i += 3) { const p = shaft[i]; barbs += `M${L.r2(p[0])},${L.r2(p[1])}l${L.r2(-14 - i * 0.4)},${L.r2(-30 - i * 0.6)}`; }
  g += `<path d="${barbs}" stroke="${T.ink}" stroke-width="1.1" opacity="0.7"/>`;
  // ink pot + heart drop
  g += dbl(`M${700},${520}L${700},${580}Q${700},${600} ${720},${600}L${800},${600}Q${820},${600} ${820},${580}L${820},${520}Q${820},${500} ${790},${496}L${730},${496}Q${700},${500} ${700},${520}Z`, T.ink);
  g += `<rect x="736" y="474" width="48" height="22" rx="4" fill="none" stroke="${T.ink}" stroke-width="2.4"/>`;
  g += `<path d="${L.heart(300, 600, 30)}" fill="#E8275E"/>`;
  g += `<path d="${B.star(250, 300, 20, 0.1)}" fill="${T.ink}"/>`;
  g += centreName(T, 730);
  return wrap(T, g);
}

module.exports = { vinyl, lantern, quill };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out22', { recursive: true });
  for (const [n, f] of Object.entries({ 'vinyl-record': vinyl, 'festive-lantern': lantern, 'quill-and-ink': quill }))
    for (const t of ['noir', 'ivory', 'wine']) fs.writeFileSync(`out22/memories-${n}-${t}.svg`, f(t));
}
