// Simple-luxury kit: a Didone star-A drawn to match Bodoni Moda, wordmarks
// that swap in the star-A, and small brand ornaments.
const L = require('./lib');
const B = require('./brand');

const r = L.r2;

// Didone A in em units. ax = apex x, base = baseline y, size = font size.
// Thin left leg, thick right leg, hairline serifs, star at apex, small heart
// in place of the crossbar. Options let a monogram tweak proportions.
function didoneA(ax, base, size, o = {}) {
  const e = (v) => v * size;
  const cap = e(o.cap || 0.76);
  const top = base - cap;
  const hair = e(o.hair || 0.02), thick = e(o.thick || 0.13);
  const lx = ax - e(o.spreadL || 0.33), rx = ax + e(o.spreadR || 0.27); // inner foot positions
  const ink = o.fill || '#4A0A24', accent = o.accent || 'url(#lgold)';
  const parts = [];
  // left hairline leg (slightly tapered towards the apex)
  parts.push(`<path d="M${r(ax - hair * 0.2)},${r(top + e(0.01))}L${r(lx - hair / 2)},${r(base)}L${r(lx + hair / 2)},${r(base)}L${r(ax + hair * 0.6)},${r(top + e(0.01))}Z" fill="${ink}"/>`);
  // right thick leg
  parts.push(`<path d="M${r(ax - hair * 0.3)},${r(top)}L${r(rx)},${r(base)}L${r(rx + thick)},${r(base)}L${r(ax + thick * 0.28)},${r(top)}Z" fill="${ink}"/>`);
  // hairline serifs
  const sh = hair * 1.05;
  parts.push(`<rect x="${r(lx - e(0.075))}" y="${r(base - sh)}" width="${r(e(0.15))}" height="${r(sh)}" fill="${ink}"/>`);
  parts.push(`<rect x="${r(rx - e(0.055))}" y="${r(base - sh)}" width="${r(thick + e(0.11))}" height="${r(sh)}" fill="${ink}"/>`);
  // heart in place of the crossbar
  if (o.heart !== false) {
    const hy = base - e(o.barH || 0.25);
    const t = (hy - top) / cap;
    const xl = ax + (lx - ax) * t, xr = ax + (rx - ax) * t;
    const hs = o.heartSize ? e(o.heartSize) : (xr - xl) * 0.42;
    parts.push(`<path d="${L.heart((xl + xr) / 2 + e(0.005), hy, hs)}" fill="${o.heartFill || accent}"/>`);
    if (o.bar) parts.push(`<rect x="${r(xl)}" y="${r(hy - hair / 2)}" width="${r(xr - xl)}" height="${r(hair)}" fill="${ink}"/>`);
  }
  // star at the apex
  if (o.star !== false) {
    const ss = e(o.starSize || 0.2);
    parts.push(`<path d="${B.star(ax + thick * 0.04, top - ss * 0.42, ss, 0.1)}" fill="${accent}"/>`);
  }
  return { svg: parts.join(''), top, base, lx, rx: rx + thick };
}

// Wordmark: text set with letter-spacing; the A is replaced by the star-A
// (Bodoni) or decorated with a star (other faces).
function wordmark(fk, str, cx, base, size, { ls = 0.2, fill = '#4A0A24', accent = 'url(#lgold)', mode = 'didone', aOpts = {} } = {}) {
  const lay = L.layout(fk, str, size, ls);
  const x0 = cx - lay.width / 2;
  const p = new L.opentype.Path();
  let extra = '';
  lay.items.forEach((it, i) => {
    const ch = str[i];
    if (ch === 'A' && mode === 'didone') {
      const bb = it.g.getBoundingBox();
      const gx1 = x0 + it.x + bb.x1 * lay.scale, gx2 = x0 + it.x + bb.x2 * lay.scale;
      const ax = gx1 + (gx2 - gx1) * 0.47;
      extra += didoneA(ax, base, size, { fill, accent, ...aOpts }).svg;
    } else {
      p.extend(it.g.getPath(x0 + it.x, base, size));
      if (ch === 'A' && mode === 'star') {
        const bb = it.g.getBoundingBox();
        const gx = x0 + it.x + ((bb.x1 + bb.x2) / 2) * lay.scale;
        const gy = base - bb.y2 * lay.scale;
        const ss = (aOpts.starSize || 0.2) * size;
        extra += `<path d="${B.star(gx + (aOpts.starDx || 0) * size, gy - ss * 0.36, ss, 0.1)}" fill="${accent}"/>`;
      }
    }
  });
  return { svg: `<path d="${p.toPathData(2)}" fill="${fill}"/>` + extra, width: lay.width, x0 };
}

function defs() {
  return B.defs() +
    `<linearGradient id="lgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C99A45"/><stop offset="0.5" stop-color="#E4C27A"/><stop offset="1" stop-color="#A97A2C"/></linearGradient>`;
}

const PAL = {
  light: { bg: '#FAF6F0', ink: '#4A0A24', soft: '#8C6A5C', sep: '#FAF6F0' },
  dark: { bg: '#3E0820', ink: '#F6EBDD', soft: '#D9BFA0', sep: '#3E0820' },
};

module.exports = { didoneA, wordmark, defs, PAL };
