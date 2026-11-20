// SUNDARLYSH MEMORIES — monoline "letter becomes the frame" logos.
// Principles taken from the reference (not its layout): one double-line drawing
// where the initial's strokes turn into a frame, the name continuing from the
// initial, the second word set along the frame, geometric spaced capitals.
const L = require('./lib');
const B = require('./brand');
const C = 540;

const THEME = {
  noir: { bg: '#0B0A0B', ink: 'url(#lg)', txt: '#EAD3A0', glow: '#D9A848' },
  ivory: { bg: '#FBF6EF', ink: '#4A0A24', txt: '#4A0A24', glow: null },
  wine: { bg: '#3E0820', ink: 'url(#lg)', txt: '#F2DDB0', glow: '#E9C676' },
};
let uid = 0;
// double-line stroke via mask: two parallel lines of width w with gap
function dbl(d, ink, { w = 3.6, gap = 6, cap = 'round', join = 'round' } = {}) {
  const id = `dl${uid++}`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><path d="${d}" fill="none" stroke="#fff" stroke-width="${2 * w + gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/><path d="${d}" fill="none" stroke="#000" stroke-width="${gap}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></mask>` +
    `<rect width="1080" height="1080" fill="${ink}" mask="url(#${id})"/>`;
}
const single = (d, ink, w = 3.6) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// geometric S centreline: top line, left half-circle, middle line, right half-circle, bottom line
function sPath(x0, y0, W, H, { topExtra = 0, botExtra = 0 } = {}) {
  const r = H / 4;
  return `M${x0 + W + topExtra},${y0}L${x0 + r},${y0}A${r} ${r} 0 0 0 ${x0 + r},${y0 + 2 * r}L${x0 + W - r},${y0 + 2 * r}A${r} ${r} 0 0 1 ${x0 + W - r},${y0 + 4 * r}L${x0 - botExtra},${y0 + 4 * r}`;
}
function wrap(T, body, extraDefs = '') {
  const glow = T.glow ? `<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feFlood flood-color="${T.glow}" flood-opacity="0.55"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${L.goldGrad('lg', 0, 120, 0, 960, [[0, '#F6E2A8'], [0.5, '#D6AB55'], [1, '#F0D58E']])}${glow}${extraDefs}</defs>` +
    `<rect width="1080" height="1080" fill="${T.bg}"/><g${T.glow ? ' filter="url(#gl)"' : ''}>${body}</g></svg>\n`;
}
const txt = (str, x, y, size, fill, opts = {}) => `<path d="${L.text(opts.font || 'jos400', str, x, y, size, { ls: opts.ls ?? 0.3, anchor: opts.anchor || 'start' }).d}" fill="${fill}"/>`;

// 40 · Arch Door — the left jamb of an arched doorway runs down into the S;
// UNDARLYSH continues along the threshold; MEMORIES curves under the crown.
function archDoor(theme = 'noir') {
  const T = THEME[theme];
  const L0 = 250, R0 = 830, base = 800, spring = 470, rr = (R0 - L0) / 2;
  const sH = 250, sW = 150, sx = L0, sy = base - sH;
  let g = '';
  // arch: right jamb from threshold up, over the crown, down the left jamb into the S's upper bowl
  const r = sH / 4;
  const arch = `M${R0},${base}L${R0},${spring}A${rr} ${rr} 0 0 0 ${L0},${spring}L${L0},${sy + r}A${r} ${r} 0 0 0 ${L0 + r},${sy + 2 * r}L${sx + sW - r},${sy + 2 * r}A${r} ${r} 0 0 1 ${sx + sW - r},${sy + 4 * r}L${L0 - 30},${base}`;
  g += dbl(arch, T.ink);
  // S top arm (the upper bowl's top stroke)
  g += dbl(`M${sx + sW + 6},${sy}L${L0 + r},${sy}A${r} ${r} 0 0 0 ${L0},${sy + r}`, T.ink);
  // threshold line from after the S to the right jamb
  g += dbl(`M${sx + sW + 40},${base}L${R0},${base}`, T.ink, { cap: 'butt' });
  // UNDARLYSH sitting on the threshold, MEMORIES under the crown
  g += txt('UNDARLYSH', sx + sW + 28, base - 22, 50, T.txt, { ls: 0.16, font: 'jos400' });
  g += `<path d="${L.arcText('jos300', 'MEMORIES', C, spring, rr - 56, 40, { ls: 0.55, pos: 'top' }).d}" fill="${T.txt}"/>`;
  g += `<path d="${B.star(C, spring - rr - 40, 26, 0.1)}" fill="${T.ink}"/>`;
  g += `<path d="M${C},${spring - rr + 70}L${C},${spring + 60}" stroke="${T.ink}" stroke-width="1.6"/>`;
  g += `<path d="${L.heart(C, spring + 80, 34)}" fill="#E8275E"/>`;
  g += txt('EVENTS · WORKSHOPS · BRANDING', C, base + 70, 20, T.txt, { ls: 0.38, anchor: 'middle', font: 'jos400' });
  return wrap(T, g);
}

// 41 · Ring — the S's arms stretch out to meet a ring, so letter and ring are one drawing
function ring(theme = 'noir') {
  const T = THEME[theme];
  const cx = C, cy = 500, R = 310;
  const sH = 270, sW = 160, sx = 262, sy = cy - 150;
  const chordX = (y, side) => cx + side * Math.sqrt(R * R - (y - cy) * (y - cy));
  let g = dbl(`M${cx},${cy - R}A${R} ${R} 0 1 1 ${cx - 0.01},${cy - R}Z`, T.ink);
  // S whose top arm runs right to the ring and bottom arm runs left to the ring
  const r = sH / 4, yT = sy, yB = sy + sH;
  const sd = `M${L.r2(chordX(yT, 1))},${yT}L${sx + r},${yT}A${r} ${r} 0 0 0 ${sx + r},${yT + 2 * r}L${sx + sW - r},${yT + 2 * r}A${r} ${r} 0 0 1 ${sx + sW - r},${yB}L${L.r2(chordX(yB, -1))},${yB}`;
  g += dbl(sd, T.ink, { cap: 'butt' });
  g += txt('UNDARLYSH', sx + sW + 22, yB - 8, 50, T.txt, { ls: 0.14 });
  g += txt('MEMORIES', sx + sW + 24, yB + 64, 32, T.txt, { ls: 0.6, font: 'jos300' });
  g += `<path d="${B.star(cx + 120, yT - 52, 24, 0.1)}" fill="${T.ink}"/>`;
  g += `<path d="${L.heart(cx + 60, yT + 78, 30)}" fill="#E8275E"/>`;
  g += `<path d="${L.arcText('jos400', 'EVENTS · WORKSHOPS · BRANDING', cx, cy, R + 36, 22, { ls: 0.32, pos: 'bottom' }).d}" fill="${T.txt}"/>`;
  return wrap(T, g);
}

// 42 · Photo Frame — the S's top arm becomes a photo frame with mounting corners;
// MEMORIES rises up the left edge like a caption on the back of a photo
function photoFrame(theme = 'noir') {
  const T = THEME[theme];
  const x1 = 300, y1 = 230, x2 = 830, y2 = 790;
  const sH = 230, sW = 150, sx = x1 - 75, sy = y1 - 60;
  let g = '';
  // frame: from S top arm along the top, down the right, along the bottom, up the left to below the S
  g += dbl(`M${sx + sW / 2 + 30},${sy}L${x2},${sy}L${x2},${y2}L${x1},${y2}L${x1},${sy + sH + 46}`, T.ink, { join: 'miter', cap: 'butt' });
  g += dbl(sPath(sx, sy, sW, sH, { topExtra: 30, botExtra: 0 }), T.ink);
  // photo corners
  for (const [x, y, sx2, sy2] of [[x2, sy, -1, 1], [x2, y2, -1, -1], [x1, y2, 1, -1]]) g += `<path d="M${x},${y}l${sx2 * 54},0l${-sx2 * 54},${sy2 * 54}z" fill="${T.ink}" opacity="0.9"/>`;
  g += txt('UNDARLYSH', sx + sW + 24, sy + sH - 6, 56, T.txt, { ls: 0.13 });
  // MEMORIES vertical up the left edge (outside)
  g += `<g transform="translate(${x1 - 30},${y2 - 10}) rotate(-90)">${txt('MEMORIES', 0, 0, 40, T.txt, { ls: 0.62, font: 'jos300' })}</g>`;
  g += `<path d="${L.heart(C + 40, 600, 64)}" fill="none" stroke="${T.ink}" stroke-width="3"/>`;
  g += `<path d="${B.star(C + 40, 512, 24, 0.1)}" fill="${T.ink}"/>`;
  g += txt('EVENTS · WORKSHOPS · BRANDING', (x1 + x2) / 2, y2 + 64, 20, T.txt, { ls: 0.38, anchor: 'middle' });
  return wrap(T, g);
}

module.exports = { archDoor, ring, photoFrame };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out16', { recursive: true });
  for (const [n, f] of Object.entries({ 'arch-door': archDoor, ring, 'photo-frame': photoFrame }))
    for (const t of ['noir', 'ivory', 'wine']) fs.writeFileSync(`out16/memories-${n}-${t}.svg`, f(t));
}
