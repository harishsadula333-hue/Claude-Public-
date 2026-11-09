// Concept 1 — "Jharokha": an ogee (S-curve) arch with the brand star and heart.
const L = require('./lib');
const CX = 540;

function ogeeLeft(cx, baseY, hw, shY, apY) {
  const H = shY - apY;
  const M = [cx - 0.36 * hw, apY + 0.33 * H];
  const c2 = [cx - 0.80 * hw, apY + 0.45 * H];
  const dir = [M[0] - c2[0], M[1] - c2[1]];
  const c3 = [M[0] + dir[0] * 0.55, M[1] + dir[1] * 0.55];
  return [[cx - hw, baseY], [cx - hw, shY], [cx - hw, shY - 0.50 * H], c2, M, c3, [cx, apY + 0.20 * H], [cx, apY]];
}
const mirror = (pts) => pts.map(([x, y]) => [2 * CX - x, y]);

function archOutline(baseY, hw, shY, apY) {
  const l = ogeeLeft(CX, baseY, hw, shY, apY).map((p) => p.map(L.r2));
  const r = mirror(l).reverse();
  return `M${l[0]}L${l[1]}C${l[2]} ${l[3]} ${l[4]}C${l[5]} ${l[6]} ${l[7]}` +
    `C${r[1]} ${r[2]} ${r[3]}C${r[4]} ${r[5]} ${r[6]}L${r[7]}Z`;
}

module.exports = function build() {
  const baseY = 582, hw = 124, shY = 420, apY = 196;
  const outline = archOutline(baseY + 300, hw, shY, apY); // extended below; clipped at base
  const lw = 3.4, gap = 15, n = 4;
  let maskStrokes = '';
  for (let k = n - 1; k >= 0; k--) {
    const o = lw / 2 + k * gap;
    maskStrokes += `<path d="${outline}" stroke="#fff" stroke-width="${2 * (o + lw / 2)}"/>`;
    if (o - lw / 2 > 0) maskStrokes += `<path d="${outline}" stroke="#000" stroke-width="${2 * (o - lw / 2)}"/>`;
  }
  const innerHalf = hw - (lw / 2 + (n - 1) * gap) - lw / 2;

  const word = L.text('corm600', 'Sundarlysh', CX, 760, 142, { ls: 0.012 });
  const tag = L.text('cinzel500', 'CARE WITH STYLE', CX, 842, 28, { ls: 0.38 });
  const tagHalf = tag.width / 2;

  const defs =
    `<radialGradient id="bg" cx="50%" cy="44%" r="62%"><stop offset="0" stop-color="#74183F"/><stop offset="0.55" stop-color="#4E0D29"/><stop offset="1" stop-color="#2B0616"/></radialGradient>` +
    L.goldGrad('gold', 300, 180, 800, 900) +
    `<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5C86"/><stop offset="1" stop-color="#D3134A"/></linearGradient>` +
    `<clipPath id="archClip"><path d="${outline}"/></clipPath>` +
    `<clipPath id="aboveBase"><rect x="0" y="0" width="1080" height="${baseY}"/></clipPath>` +
    `<mask id="archLines" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080"><g clip-path="url(#archClip)" fill="none" stroke-linejoin="round">${maskStrokes}</g></mask>` +
    `<radialGradient id="halo"><stop offset="0" stop-color="#B0436F" stop-opacity="0.32"/><stop offset="1" stop-color="#B0436F" stop-opacity="0"/></radialGradient>` +
    `<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>`;

  const heartY = 500;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  g.push('<g transform="translate(0,32)">');
  // faint halo behind emblem
  g.push(`<circle cx="${CX}" cy="400" r="300" fill="url(#halo)"/>`);
  // nested ogee arches
  g.push(`<g clip-path="url(#aboveBase)"><rect width="1080" height="1080" fill="url(#gold)" mask="url(#archLines)"/></g>`);
  // crossbar + heart (the "A" of the original mark)
  g.push(`<rect x="${CX - innerHalf}" y="${heartY - 1}" width="${innerHalf * 2}" height="2.2" fill="url(#gold)"/>`);
  g.push(`<path d="${L.heart(CX, heartY + 3, 40)}" fill="url(#pink)" stroke="url(#gold)" stroke-width="2.2"/>`);
  // small doorway under the heart
  {
    const dw = 26, dTop = heartY + 34, dSh = heartY + 62;
    const door = archOutline(baseY, dw, dSh, dTop);
    g.push(`<path d="${door}" fill="none" stroke="url(#gold)" stroke-width="2.2" clip-path="url(#aboveBase)"/>`);
  }
  // star finial
  g.push(`<path d="${L.sparkle(CX, apY - 14, 40, 20, 0.12)}" fill="url(#gold)"/>`);
  g.push(`<circle cx="${CX - 34}" cy="${apY + 2}" r="2.6" fill="url(#gold)"/><circle cx="${CX + 34}" cy="${apY + 2}" r="2.6" fill="url(#gold)"/>`);
  // stepped sill
  g.push(`<rect x="${CX - hw - 22}" y="${baseY + 6}" width="${2 * (hw + 22)}" height="3.4" fill="url(#gold)"/>`);
  g.push(`<rect x="${CX - hw - 46}" y="${baseY + 18}" width="${2 * (hw + 46)}" height="2" fill="url(#gold)"/>`);
  g.push(`<path d="M${CX - 9},${baseY + 26} L${CX},${baseY + 36} L${CX + 9},${baseY + 26}Z" fill="url(#gold)"/>`);
  // wordmark + tagline
  g.push(`<path d="${word.d}" fill="url(#gold)"/>`);
  g.push(`<path d="${tag.d}" fill="#E9CB86"/>`);
  const ly = 832;
  g.push(`<rect x="${CX - tagHalf - 106}" y="${ly}" width="70" height="1.6" fill="url(#gold)"/><rect x="${CX + tagHalf + 36}" y="${ly}" width="70" height="1.6" fill="url(#gold)"/>`);
  g.push(`<path d="M${CX - tagHalf - 20},${ly + 0.8}l-5,-5l-5,5l5,5z M${CX + tagHalf + 20},${ly + 0.8}l5,-5l5,5l-5,5z" fill="url(#gold)"/>`);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs);
};
