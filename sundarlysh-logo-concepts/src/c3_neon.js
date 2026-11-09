// Concept 3 — "Neon Haveli": nested pointed arches (the star-topped A of the
// original mark) glowing as neon tubes, with a neon heart at the threshold.
const L = require('./lib');
const CX = 540;

function pointedArch(w, R, e, springY, baseY) {
  const h = Math.sqrt(R * R - e * e);
  const r = L.r2;
  return { d: `M${r(CX - w)},${baseY}L${r(CX - w)},${springY}A${r(R)} ${r(R)} 0 0 1 ${CX},${r(springY - h)}A${r(R)} ${r(R)} 0 0 1 ${r(CX + w)},${springY}L${r(CX + w)},${baseY}`, apex: springY - h };
}

function tube(d, color, { w = 7, glow = 18, core = 2.4, coreColor = '#FFFFFF', fill = 'none' } = {}) {
  return `<g fill="${fill}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${d}" stroke="${color}" stroke-width="${glow}" opacity="0.7" filter="url(#glow)"/>` +
    `<path d="${d}" stroke="${color}" stroke-width="${w}"/>` +
    `<path d="${d}" stroke="${coreColor}" stroke-width="${core}" opacity="0.8"/></g>`;
}

module.exports = function build() {
  const defs =
    `<radialGradient id="bg" cx="50%" cy="42%" r="68%"><stop offset="0" stop-color="#8E1D57"/><stop offset="0.6" stop-color="#5C0F37"/><stop offset="1" stop-color="#330720"/></radialGradient>` +
    `<radialGradient id="wash" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF6FA8" stop-opacity="0.28"/><stop offset="1" stop-color="#FF6FA8" stop-opacity="0"/></radialGradient>` +
    `<filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>` +
    `<filter id="glowText" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="6"/></filter>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  g.push(`<ellipse cx="${CX}" cy="380" rx="330" ry="300" fill="url(#wash)"/>`);
  g.push('<g transform="translate(0,58)">');

  const colors = ['#FFC53D', '#FF9A5C', '#FF4F93', '#FFA9CF', '#FFF0C9'];
  const springY = 402, baseY = 530, w0 = 176, e = 62, gap = 23;
  let innerApex = 0;
  colors.forEach((c, i) => {
    const w = w0 - i * gap, R = (w0 + e) - i * gap;
    const a = pointedArch(w, R, e, springY, baseY);
    g.push(tube(a.d, c));
    if (i === 0) g.push(tube(L.sparkle(CX, a.apex - 34, 26, 15, 0.14), '#FFC53D', { w: 5, glow: 14, core: 1.6 }));
    innerApex = a.apex;
  });
  // neon heart
  g.push(tube(L.heart(CX, 440, 78), '#FF2D6F', { w: 6.5, glow: 20, core: 2.2, coreColor: '#FFD3E2' }));

  // wordmark
  const word = L.text('abril', 'sundarlysh', CX, 668, 124, { ls: 0.005 });
  g.push(`<path d="${word.d}" fill="#FF7FB0" opacity="0.65" filter="url(#glowText)"/>`);
  g.push(`<path d="${word.d}" fill="#FFD9E6"/>`);
  const tag = L.text('cinzel700', 'CARE WITH STYLE', CX, 734, 30, { ls: 0.32 });
  g.push(`<path d="${tag.d}" fill="#FFC53D" opacity="0.5" filter="url(#glowText)"/>`);
  g.push(`<path d="${tag.d}" fill="#FFE6A8"/>`);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs);
};
