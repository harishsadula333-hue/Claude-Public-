// Concept 5 — "Signature Orbit": the star-topped A from the current logo stands
// as a monument, circled by the golden thread from the original swoosh.
const L = require('./lib');
const CX = 540;

module.exports = function build() {
  const defs =
    `<radialGradient id="bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#3A0C22"/><stop offset="0.6" stop-color="#22060F"/><stop offset="1" stop-color="#120308"/></radialGradient>` +
    L.goldGrad('gold', 330, 150, 760, 820) +
    `<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5C8A"/><stop offset="1" stop-color="#D3134A"/></linearGradient>` +
    `<radialGradient id="starGlow"><stop offset="0" stop-color="#FFE7A3" stop-opacity="0.32"/><stop offset="0.35" stop-color="#FFD98A" stop-opacity="0.12"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6EA"/><stop offset="1" stop-color="#EAD6C0"/></linearGradient>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  g.push('<g transform="translate(0,30)">');

  const apex = [CX, 178], baseY = 524;
  const lf = [CX - 92, baseY], rt = [CX + 92, baseY];
  // orbit (rotated ellipse) split into back and front halves
  const oc = [CX, 418], rx = 252, ry = 60, rot = (-11 * Math.PI) / 180;
  const ell = (t) => {
    const x = rx * Math.cos(t), y = ry * Math.sin(t);
    return [oc[0] + x * Math.cos(rot) - y * Math.sin(rot), oc[1] + x * Math.sin(rot) + y * Math.cos(rot)];
  };
  const seg = (a, b, n = 160) => Array.from({ length: n + 1 }, (_, i) => ell(a + ((b - a) * i) / n));
  const back = seg(Math.PI + 0.05, 2 * Math.PI - 0.05);
  const front = seg(-0.05, Math.PI + 0.05);
  const wBack = (t) => 0.7 + 0.6 * Math.sin(Math.PI * t);
  const wFront = (t) => 1.1 + 3.6 * Math.pow(Math.sin(Math.PI * t), 1.6);
  g.push(`<path d="${L.ribbon(back, wBack)}" fill="url(#gold)" opacity="0.8"/>`);

  // star glow
  g.push(`<circle cx="${apex[0]}" cy="${apex[1] - 10}" r="150" fill="url(#starGlow)"/>`);
  // A — thin left leg, tapered right leg
  g.push(`<path d="M${apex[0] - 1.4},${apex[1] + 6}L${lf[0] - 2.2},${lf[1]}L${lf[0] + 2.2},${lf[1]}L${apex[0] + 1.4},${apex[1] + 6}Z" fill="url(#gold)"/>`);
  g.push(`<path d="M${apex[0] - 2},${apex[1] + 6}L${rt[0] - 16},${rt[1]}L${rt[0] + 16},${rt[1]}L${apex[0] + 3},${apex[1] + 6}Z" fill="url(#gold)"/>`);
  // serifs
  g.push(`<rect x="${lf[0] - 26}" y="${baseY}" width="52" height="3" fill="url(#gold)"/><rect x="${rt[0] - 34}" y="${baseY}" width="68" height="3.4" fill="url(#gold)"/>`);
  // crossbar + heart
  const cy = 408, tL = (cy - apex[1]) / (baseY - apex[1]);
  const xl = apex[0] + (lf[0] - apex[0]) * tL, xr = apex[0] + (rt[0] - apex[0]) * tL;
  g.push(`<rect x="${xl}" y="${cy - 1}" width="${xr - xl}" height="2.2" fill="url(#gold)"/>`);
  g.push(`<path d="${L.heart(CX, cy + 2, 36)}" fill="url(#pink)"/>`);
  // front of orbit passes over the A
  g.push(`<path d="${L.ribbon(front, wFront)}" fill="url(#gold)"/>`);
  // star
  g.push(`<path d="${L.sparkle(apex[0], apex[1] - 8, 50, 26, 0.12)}" fill="url(#gold)"/>`);
  g.push(`<path d="${L.sparkle(CX + 214, 336, 12, 7, 0.14)}" fill="url(#gold)"/><path d="${L.sparkle(CX - 236, 470, 9, 5, 0.14)}" fill="url(#gold)" opacity="0.8"/>`);

  // wordmark: SUNDAR (serif caps) + lysh (script), like the original lockup
  const sz1 = 106, sz2 = 168;
  const w1 = L.text('corm600', 'SUNDAR', 0, 0, sz1, { ls: 0.02, anchor: 'start' }).width;
  const w2 = L.text('vibes', 'lysh', 0, 0, sz2, { anchor: 'start' }).width;
  const overlap = 14, x0 = CX - (w1 + w2 - overlap) / 2, by = 712;
  g.push(`<path d="${L.text('corm600', 'SUNDAR', x0, by, sz1, { ls: 0.02, anchor: 'start' }).d}" fill="url(#ivory)"/>`);
  g.push(`<path d="${L.text('vibes', 'lysh', x0 + w1 - overlap, by + 4, sz2, { anchor: 'start' }).d}" fill="url(#gold)"/>`);
  const tag = L.text('cinzel500', 'CARE WITH STYLE', CX, 790, 25, { ls: 0.45 });
  g.push(`<path d="${tag.d}" fill="#EBD6B5"/>`);
  const th = tag.width / 2;
  g.push(`<rect x="${CX - th - 96}" y="782" width="74" height="1.5" fill="url(#gold)"/><rect x="${CX + th + 22}" y="782" width="74" height="1.5" fill="url(#gold)"/>`);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs);
};
