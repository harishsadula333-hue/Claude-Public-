// SUNDARLYSH MEMORIES — refined lockup: big swash-wrapped S, crossbar-less star A,
// tall curled L, MEMORIES, services line. Several colourways + wide transparent.
const L = require('./lib');
const B = require('./brand');
const X = require('./luxe');

const THEMES = {
  classic: { bg: '#FFFFFF', ink: '#141010', accent: 'url(#mgold)', soft: '#3A302C' },
  wine: { bg: '#FBF6EF', ink: '#4A0A24', accent: 'url(#mgold)', soft: '#6E3A4C' },
  noir: { bg: '#0E0C0C', ink: '#E9CF8E', accent: 'url(#mgoldL)', soft: '#CDB98A' },
  royal: { bg: '#4A0A24', ink: '#F7EADB', accent: 'url(#mgoldL)', soft: '#E3C9A8' },
};

function lockup(T, ox, oy, sc) {
  // built in a 1000-wide design space; returns svg string
  const g = [];
  const F = 'bodoni500';
  const cap = 132, base = 300;               // caps size & baseline in design space
  const capH = cap * 0.747;
  // big S
  const Ssize = 232, Sbase = base + 34;
  const Sg = L.text('bodoni600', 'S', 0, 0, Ssize, { anchor: 'start' });
  const Sx = 92 - Sg.bbox.x1;
  const S = L.text('bodoni600', 'S', Sx, Sbase, Ssize, { anchor: 'start' });
  g.push(`<path d="${S.d}" fill="${T.ink}"/>`);
  const sb = { x1: Sx + Sg.bbox.x1, x2: Sx + Sg.bbox.x2, y1: Sbase + Sg.bbox.y1, y2: Sbase + Sg.bbox.y2 };
  // letters U N D [A] R [L] Y S H
  const f = L.font(F), scl = cap / f.unitsPerEm, ls = 0.035 * cap;
  let x = sb.x2 + 30;
  let aApex = null, lFoot = null;
  for (const ch of 'UNDARLYSH') {
    const gl = f.charToGlyph(ch);
    if (ch === 'A') {
      const bb = gl.getBoundingBox();
      const ax = x + ((bb.x1 + bb.x2) / 2) * scl;
      const A = X.didoneA(ax, base, cap, { fill: T.ink, heart: false, star: false, cap: 0.747, spreadL: 0.3, spreadR: 0.24, thick: 0.115 });
      g.push(A.svg); aApex = [ax, base - capH];
      x += gl.advanceWidth * scl + ls;
    } else if (ch === 'L') {
      const big = cap * 1.42, s2 = big / f.unitsPerEm;
      g.push(`<path d="${gl.getPath(x, base, big).toPathData(2)}" fill="${T.ink}"/>`);
      const bb = gl.getBoundingBox();
      lFoot = [x + bb.x2 * s2, base];
      x += gl.advanceWidth * s2 * 0.98 + ls;
    } else {
      g.push(`<path d="${gl.getPath(x, base, cap).toPathData(2)}" fill="${T.ink}"/>`);
      x += gl.advanceWidth * scl + ls;
    }
  }
  const textR = x - ls;
  // gold star on the A, tiny heart under it
  g.push(`<path d="${B.star(aApex[0] + 1, aApex[1] - 22, 26, 0.1)}" fill="${T.accent}"/>`);
  // curl on the L's foot (returns up and back with a pearl)
  g.push(`<path d="${B.flourish([[lFoot[0] - 6, base - 2], [lFoot[0] + 10, base - 2], [lFoot[0] + 20, base - 16], [lFoot[0] + 14, base - 30]], { r0: 11, turns: 1.05, dir: -1, w0: 3, w1: 3.4, ball: 4 })}" fill="${T.accent}"/>`);
  // swash: a calligraphic C wrapping the S, rising into a hairline over UND that ends in a curl
  const cx = (sb.x1 + sb.x2) / 2 + 6, cy = (sb.y1 + sb.y2) / 2 + 4, R = (sb.y2 - sb.y1) * 0.64;
  const arc = [];
  const a0 = -Math.PI / 2 - 0.02, a1 = Math.PI * 0.27;
  for (let i = 0; i <= 160; i++) { const a = a0 - (i / 160) * (2 * Math.PI - (a1 - a0)); arc.push([cx + R * Math.cos(a), cy + R * 1.0 * Math.sin(a)]); }
  arc.reverse(); // from bottom-right end round the left to the top
  const lineY = cy - R, lineEnd = sb.x2 + 30 + (textR - sb.x2 - 30) * 0.36;
  const top = [];
  for (let i = 1; i <= 40; i++) top.push([cx + (lineEnd - cx) * (i / 40), lineY]);
  const all = arc.concat(top);
  const n = arc.length;
  g.push(`<path d="${L.ribbon(all, (t) => { const u = t * all.length / n; return u <= 1 ? 0.6 + 5.4 * Math.pow(Math.sin(Math.PI * u), 1.6) : 0.9; })}" fill="${T.accent}"/>`);
  g.push(`<path d="${B.flourish([[lineEnd - 30, lineY], [lineEnd - 10, lineY], [lineEnd + 8, lineY - 6], [lineEnd + 12, lineY - 22]], { r0: 12, turns: 1.05, dir: -1, w0: 1.8, w1: 3.2, ball: 4.6 })}" fill="${T.accent}"/>`);
  // MEMORIES + services, centred under UNDARLYSH
  const mx = (sb.x2 + 30 + textR) / 2;
  const mem = L.text(F, 'MEMORIES', mx, base + 92, 54, { ls: 0.62 });
  g.push(`<path d="${mem.d}" fill="${T.ink}"/>`);
  const hw = mem.width / 2;
  g.push(`<rect x="${mx - hw - 80}" y="${base + 72}" width="56" height="1.6" fill="${T.accent}"/><rect x="${mx + hw + 24}" y="${base + 72}" width="56" height="1.6" fill="${T.accent}"/>`);
  const words = ['EVENTS', 'WORKSHOPS', 'BRANDING'], ts = 19, tls = 0.42;
  const widths = words.map((w) => L.text('bodoni600', w, 0, 0, ts, { ls: tls, anchor: 'start' }).width);
  const gap = 42, tot = widths.reduce((a, b) => a + b, 0) + gap * 2;
  let tx = mx - tot / 2;
  words.forEach((w, i) => {
    g.push(`<path d="${L.text('bodoni600', w, tx, base + 140, ts, { ls: tls, anchor: 'start' }).d}" fill="${T.soft}"/>`);
    tx += widths[i];
    if (i < 2) { const dx = tx + gap / 2; g.push(`<path d="M${dx},${base + 127}l4,6l-4,6l-4,-6z" fill="${T.accent}"/>`); tx += gap; }
  });
  const bbox = { x1: cx - R - 6, x2: Math.max(textR, lFoot[0] + 30), y1: lineY - 40, y2: base + 146 };
  return { svg: `<g transform="translate(${ox},${oy}) scale(${sc})">${g.join('')}</g>`, bbox };
}

const DEFS = L.goldGrad('mgold', 0, 100, 0, 480, [[0, '#E2BC6A'], [0.5, '#B98A34'], [1, '#D9B060']]) +
  L.goldGrad('mgoldL', 0, 100, 0, 480, [[0, '#F6E2A8'], [0.5, '#D7AE5A'], [1, '#F0D58E']]);

function square(theme) {
  const T = THEMES[theme];
  const probe = lockup(T, 0, 0, 1).bbox;
  const w = probe.x2 - probe.x1, h = probe.y2 - probe.y1;
  const sc = 900 / w, ox = 540 - sc * (probe.x1 + w / 2), oy = 540 - sc * (probe.y1 + h / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${DEFS}</defs><rect width="1080" height="1080" fill="${T.bg}"/>${lockup(T, ox, oy, sc).svg}</svg>\n`;
}
function wide(theme) {
  const T = THEMES[theme];
  const b = lockup(T, 0, 0, 1).bbox, pad = 50;
  const Wd = Math.ceil((b.x2 - b.x1 + 2 * pad) * 2), Hd = Math.ceil((b.y2 - b.y1 + 2 * pad) * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}"><defs>${DEFS}</defs>${lockup(T, 2 * (pad - b.x1), 2 * (pad - b.y1), 2).svg}</svg>\n`;
}
module.exports = { square, wide };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out14', { recursive: true });
  for (const t of Object.keys(THEMES)) fs.writeFileSync(`out14/memories-${t}.svg`, square(t));
  fs.writeFileSync('out14/memories-wide-black.svg', wide('classic'));
  fs.writeFileSync('out14/memories-wide-wine.svg', wide('wine'));
}
