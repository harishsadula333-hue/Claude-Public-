// SUNDARLYSH MEMORIES — Hourglass, Memory Tree, Memory Album.
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
  const id = `d4${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask><rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
function wrap(T, body) {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.5"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}</defs><rect width="1080" height="1080" fill="${T.bg}"/><g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, o = {}) => `<path d="${L.text(o.font || 'jos400', str, x, y, size, { ls: o.ls ?? 0.3, anchor: o.anchor || 'start' }).d}" fill="${fill}"/>`;
const services = (x, y, fill, anchor = 'middle', size = 19) => txt('EVENTS · WORKSHOPS · BRANDING', x, y, size, fill, { ls: 0.38, anchor });
const nameBlock = (T, x, y, s = 60) => txt('SUNDARLYSH', x, y, s, T.txt, { ls: 0.13 }) + `<rect x="${x + 2}" y="${y + 24}" width="${s * 7.2}" height="1.6" fill="${T.ink}"/>` + txt('MEMORIES', x + 2, y + 24 + s * 0.95, s * 0.6, T.txt, { ls: 0.62, font: 'jos300' });
const polaroid = (x, y, w, ang, ink, inner) => `<g transform="translate(${L.r2(x)},${L.r2(y)}) rotate(${ang})"><rect x="${-w / 2}" y="${-w / 2}" width="${w}" height="${w * 1.18}" fill="none" stroke="${ink}" stroke-width="2"/><rect x="${-w / 2 + w * 0.12}" y="${-w / 2 + w * 0.12}" width="${w * 0.76}" height="${w * 0.76}" fill="none" stroke="${ink}" stroke-width="1.2"/>${inner || ''}</g>`;

// 49 · Hourglass — the S in the upper glass falls as sand and gathers into a heart
function hourglass(theme = 'noir') {
  const T = THEME[theme];
  const cx = 300, top = 220, bot = 820, hw = 140, waist = 14, mid = (top + bot) / 2;
  let g = '';
  // frame plates + posts
  for (const y of [top - 24, bot + 6]) g += dbl(`M${cx - hw - 34},${y}L${cx + hw + 34},${y}`, T.ink, { cap: 'round', gap: 10 });
  for (const sx of [-1, 1]) g += dbl(`M${cx + sx * (hw + 22)},${top - 18}L${cx + sx * (hw + 22)},${bot}`, T.ink, { gap: 4, w: 2.6 });
  // glass outline (both sides)
  const side = (sx) => `M${cx + sx * hw},${top}C${cx + sx * hw},${top + 170} ${cx + sx * waist},${mid - 70} ${cx + sx * waist},${mid}C${cx + sx * waist},${mid + 70} ${cx + sx * hw},${bot - 170} ${cx + sx * hw},${bot}`;
  g += dbl(side(-1), T.ink) + dbl(side(1), T.ink);
  // S of sand in the upper glass
  const S = L.text('bodoni600', 'S', cx, mid - 74, 170);
  g += `<path d="${S.d}" fill="${T.ink}"/>`;
  // falling sand
  let dots = ''; for (let y = mid - 50; y < bot - 120; y += 13) dots += `<circle cx="${cx}" cy="${y}" r="2.2"/>`;
  g += `<g fill="${T.ink}">${dots}</g>`;
  // heart of sand in the lower glass
  g += `<path d="${L.heart(cx, bot - 70, 110)}" fill="#E8275E" opacity="0.92"/>`;
  g += `<path d="${B.star(cx, top - 70, 24, 0.1)}" fill="${T.ink}"/>`;
  g += nameBlock(T, 500, 520, 62);
  g += services(500, 640, T.txt, 'start', 17);
  return wrap(T, g);
}

// 50 · Memory Tree — the trunk is the S; heart leaves; tiny photos hang from the branches
function tree(theme = 'noir') {
  const T = THEME[theme];
  let g = '';
  // trunk: a tall S curve, thick at the base
  const trunk = L.cubicPts([300, 760], [430, 650], [380, 520], [300, 470], 80).concat(L.cubicPts([300, 470], [200, 420], [200, 320], [320, 300], 60).slice(1));
  g += `<path d="${L.ribbon(trunk, (t) => 18 * (1 - t) + 2)}" fill="${T.ink}"/>`;
  // branches
  const br = [[[306, 430], [380, 380], [430, 340], [470, 300]], [[300, 470], [230, 420], [190, 380], [160, 330]], [[320, 300], [300, 250], [270, 220], [240, 200]], [[316, 330], [370, 290], [400, 240], [420, 210]], [[296, 520], [380, 500], [430, 470], [480, 450]]];
  const onTrunk = (y) => { let best = trunk[0]; for (const p of trunk) if (Math.abs(p[1] - y) < Math.abs(best[1] - y)) best = p; return best; };
  for (const b of br) { const st = onTrunk(b[0][1]); const dx = st[0] - b[0][0]; const bb = b.map(([x, y], i) => [x + dx * (1 - i / 3), y]); g += `<path d="${L.ribbon(L.cubicPts(bb[0], bb[1], bb[2], bb[3], 40), (t) => 5 * (1 - t) + 1)}" fill="${T.ink}"/>`; }
  // heart leaves
  const leaves = [[470, 296, 30, 20], [440, 330, 22, -20], [160, 326, 30, -30], [195, 372, 22, 10], [240, 196, 26, -40], [420, 206, 28, 30], [384, 244, 18, 0], [480, 446, 26, 40], [270, 230, 18, -10], [350, 200, 20, 15], [214, 268, 20, -25], [330, 250, 16, 0]];
  leaves.forEach(([x, y, s, a], i) => { g += `<path d="${L.heart(x, y, s, a)}" fill="${i % 3 === 0 ? '#E8275E' : 'none'}" stroke="${T.ink}" stroke-width="${i % 3 === 0 ? 0 : 2}"/>`; });
  // hanging photos
  for (const [x, y, len, ang] of [[160, 340, 60, -6], [430, 470, 54, 8], [470, 310, 70, -4]]) {
    g += `<path d="M${x},${y}L${x},${y + len}" stroke="${T.ink}" stroke-width="1.2"/>`;
    g += polaroid(x, y + len + 22, 40, ang, T.ink, `<path d="${L.heart(0, -1, 12)}" fill="${T.ink}"/>`);
  }
  // roots run out as the baseline under the name
  g += `<path d="${L.ribbon(L.cubicPts([300, 760], [340, 784], [420, 790], [560, 790], 40), (t) => 6 * (1 - t) + 1.2)}" fill="${T.ink}"/>`;
  g += `<path d="${L.ribbon(L.cubicPts([300, 760], [260, 784], [220, 790], [170, 792], 30), (t) => 6 * (1 - t) + 1)}" fill="${T.ink}"/>`;
  g += `<rect x="560" y="789" width="360" height="2" fill="${T.ink}"/>`;
  g += txt('SUNDARLYSH', 560, 766, 54, T.txt, { ls: 0.12 });
  g += txt('MEMORIES', 562, 840, 34, T.txt, { ls: 0.6, font: 'jos300' });
  g += services(C, 920, T.txt);
  return wrap(T, g);
}

// 51 · Memory Album — tiny photos, hearts and stars rise from an open album along an S
function album(theme = 'noir') {
  const T = THEME[theme];
  const cx = C, by = 640;
  let g = '';
  // open book
  g += dbl(`M${cx},${by - 10}C${cx - 60},${by - 40} ${cx - 160},${by - 40} ${cx - 240},${by - 14}L${cx - 240},${by + 96}C${cx - 160},${by + 70} ${cx - 60},${by + 70} ${cx},${by + 100}C${cx + 60},${by + 70} ${cx + 160},${by + 70} ${cx + 240},${by + 96}L${cx + 240},${by - 14}C${cx + 160},${by - 40} ${cx + 60},${by - 40} ${cx},${by - 10}Z`, T.ink);
  g += dbl(`M${cx},${by - 10}L${cx},${by + 100}`, T.ink, { cap: 'butt' });
  for (let i = 1; i <= 3; i++) g += `<path d="M${cx - 30 - i * 40},${by + 10 + i * 4}l${-70 + i * 10},0M${cx + 30 + i * 40},${by + 10 + i * 4}l${70 - i * 10},0" stroke="${T.ink}" stroke-width="1.3"/>`;
  // memories rising along an S path from the spine
  const path = L.cubicPts([cx, by - 30], [cx + 210, by - 110], [cx + 170, by - 250], [cx, by - 260], 50).concat(L.cubicPts([cx, by - 260], [cx - 170, by - 270], [cx - 210, by - 420], [cx, by - 470], 50).slice(1));
  g += `<path d="${L.polyline(path)}" fill="none" stroke="${T.ink}" stroke-width="1.4" stroke-dasharray="4 7"/>`;
  const items = [[6, 'heart', 22], [16, 'photo', 46], [28, 'star', 18], [40, 'photo', 54], [52, 'heart', 26], [62, 'photo', 50], [74, 'star', 22], [86, 'photo', 58], [96, 'heart', 30]];
  items.forEach(([i, kind, s], k) => {
    const p = path[i];
    if (kind === 'heart') g += `<path d="${L.heart(p[0], p[1], s)}" fill="#E8275E"/>`;
    else if (kind === 'star') g += `<path d="${B.star(p[0], p[1], s, 0.1)}" fill="${T.ink}"/>`;
    else g += polaroid(p[0], p[1], s, (k % 2 ? 8 : -8), T.ink, `<path d="${k % 4 === 1 ? L.heart(0, -s * 0.08, s * 0.32) : B.star(0, -s * 0.06, s * 0.2, 0.1)}" fill="${T.ink}"/>`);
  });
  g += txt('SUNDARLYSH', cx, by + 186, 62, T.txt, { ls: 0.14, anchor: 'middle' });
  g += txt('MEMORIES', cx, by + 240, 34, T.txt, { ls: 0.62, font: 'jos300', anchor: 'middle' });
  g += services(cx, by + 290, T.txt);
  return wrap(T, g);
}

module.exports = { hourglass, tree, album };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out19', { recursive: true });
  for (const [n, f] of Object.entries({ hourglass, 'memory-tree': tree, 'memory-album': album }))
    for (const t of ['noir', 'ivory', 'wine']) fs.writeFileSync(`out19/memories-${n}-${t}.svg`, f(t));
}
