// Three simple-luxury directions. Each returns a 1080 square (profile/logo).
const L = require('./lib');
const B = require('./brand');
const X = require('./luxe');

function frame(mode, inner, extraDefs = '', transparent = false) {
  const P = X.PAL[mode];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${X.defs()}${extraDefs}</defs>` +
    (transparent ? '' : `<rect width="1080" height="1080" fill="${P.bg}"/>`) + inner + '</svg>\n';
}

// 1 — Maison: Bodoni S woven with the Didone star-A; Bodoni wordmark.
function maison(mode = 'light', { markOnly = false, transparent = false } = {}) {
  const P = X.PAL[mode];
  const g = [];
  const ms = markOnly ? 560 : 430; // monogram font size
  const base = markOnly ? 760 : 560;
  const cx = 540;
  // S (Bodoni) and the Didone star-A set so the S's lower bowl just kisses the A's thin leg
  const S0 = L.text('bodoni500', 'S', 0, base, ms, { anchor: 'start' });
  const sRight = S0.bbox.x2, sLeft = S0.bbox.x1;
  const apexOff = sRight + ms * 0.2; // apex x relative to S origin
  const groupL = sLeft, groupR = apexOff + ms * (0.27 + 0.13 + 0.06);
  const ox = cx - (groupL + groupR) / 2;
  const Sx = L.text('bodoni500', 'S', ox, base, ms, { anchor: 'start' });
  const A = X.didoneA(ox + apexOff, base, ms, { fill: P.ink, starSize: 0.15, heartSize: 0.08, barH: 0.24 });
  g.push(`<path d="${Sx.d}" fill="${P.ink}"/>`);
  // hairline gap where the A's thin leg meets the S
  const legs = A.svg.split('/>').slice(0, 2).map((x) => x + '/>').join('');
  g.push(legs.replace(/fill="[^"]+"/g, `fill="none" stroke="${P.sep}" stroke-width="${(ms * 0.02).toFixed(1)}"`));
  g.push(A.svg);
  if (!markOnly) {
    g.push(X.wordmark('bodoni500', 'SUNDARLYSH', cx, 712, 62, { ls: 0.24, fill: P.ink, aOpts: { starSize: 0.44 } }).svg);
    g.push(`<path d="${L.text('bodoni500', 'CARE WITH STYLE', cx, 772, 20, { ls: 0.6 }).d}" fill="${P.soft}"/>`);
  }
  return frame(mode, g.join(''), '', transparent);
}

// 2 — Arch: one hairline lancet arch (the A) crowned by the star, an
// Italiana S inside; airy Italiana wordmark.
function arch(mode = 'light', { markOnly = false, transparent = false } = {}) {
  const P = X.PAL[mode];
  const g = [];
  const k = markOnly ? 1.35 : 1;
  const cx = 540, base = markOnly ? 800 : 570, hw = 100 * k, R = 236 * k, e = R - hw, spring = base - 118 * k;
  const h = Math.sqrt(R * R - e * e), apex = spring - h;
  const d = `M${cx - hw},${base}L${cx - hw},${spring}A${R} ${R} 0 0 1 ${cx},${L.r2(apex)}A${R} ${R} 0 0 1 ${cx + hw},${spring}L${cx + hw},${base}`;
  g.push(`<path d="${d}" fill="none" stroke="url(#lgold)" stroke-width="${2.4 * k}" stroke-linejoin="miter"/>`);
  g.push(`<path d="${B.star(cx, apex - 22 * k, 30 * k, 0.1)}" fill="url(#lgold)"/>`);
  g.push(`<rect x="${cx - hw - 26 * k}" y="${base - 1.2 * k}" width="${2 * hw + 52 * k}" height="${2.4 * k}" fill="url(#lgold)"/>`);
  const S = L.text('italiana', 'S', cx, base - 40 * k, 262 * k);
  g.push(`<path d="${S.d}" fill="${P.ink}"/>`);
  g.push(`<path d="${L.heart(cx, base - 22 * k, 13 * k)}" fill="url(#lgold)"/>`);
  if (!markOnly) {
    g.push(X.wordmark('italiana', 'SUNDARLYSH', cx, 690, 70, { ls: 0.3, fill: P.ink, mode: 'star', aOpts: { starSize: 0.44, starDx: 0.0 } }).svg);
    g.push(`<path d="${L.text('italiana', 'CARE WITH STYLE', cx, 756, 23, { ls: 0.6 }).d}" fill="${P.soft}"/>`);
  }
  return frame(mode, g.join(''), '', transparent);
}

// 3 — Ring: the Didone star-A alone, set in a fine gold ring like a
// jeweller's hallmark; the star breaks through the top of the ring.
function ring(mode = 'light', { markOnly = false, transparent = false } = {}) {
  const P = X.PAL[mode];
  const g = [];
  const k = markOnly ? 1.4 : 1;
  const cx = 540, cy = markOnly ? 560 : 410, R = 160 * k;
  const size = 284 * k, base = cy + 0.37 * size;
  const A = X.didoneA(cx + 0.02 * size, base, size, { fill: P.ink, starSize: 0.2, heartSize: 0.1, barH: 0.25 });
  // ring with a gap at the top where the star sits
  const gap = 0.16; // radians each side
  const a0 = -Math.PI / 2 + gap, a1 = -Math.PI / 2 - gap + 2 * Math.PI;
  const P0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], P1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
  g.push(`<path d="M${L.r2(P0[0])},${L.r2(P0[1])}A${R} ${R} 0 1 1 ${L.r2(P1[0])},${L.r2(P1[1])}" fill="none" stroke="url(#lgold)" stroke-width="${2.2 * k}"/>`);
  g.push(A.svg);
  if (!markOnly) {
    g.push(X.wordmark('corm600', 'SUNDARLYSH', cx, 700, 62, { ls: 0.28, fill: P.ink, mode: 'star', aOpts: { starSize: 0.44 } }).svg);
    g.push(`<path d="${L.text('corm500', 'CARE WITH STYLE', cx, 758, 22, { ls: 0.6 }).d}" fill="${P.soft}"/>`);
  }
  return frame(mode, g.join(''), '', transparent);
}

module.exports = { maison, arch, ring };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out5', { recursive: true });
  for (const [n, f] of Object.entries({ maison, arch, ring })) {
    fs.writeFileSync(`out5/${n}.svg`, f('light'));
    fs.writeFileSync(`out5/${n}-dark.svg`, f('dark'));
    fs.writeFileSync(`out5/${n}-mark.svg`, f('light', { markOnly: true }));
  }
  console.log('ok');
}
