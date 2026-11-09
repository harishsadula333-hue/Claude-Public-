// The Sundarlysh logomark: the S of the wordmark woven through the star-A,
// held inside a heart drawn by the brand thread (wine half = Sundar,
// gold half = lysh); the star of the A crowns the heart's cleft.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');

function heartHalf(cx, cy, k, sx, kx, ky) {
  const pts = [];
  for (let i = 0; i <= 220; i++) {
    const t = (i / 220) * Math.PI;
    const u = 16 * Math.pow(Math.sin(t), 3);
    const v = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + sx * kx * k * u, cy + ky * k * (5 - v)]);
  }
  return pts;
}

let uid = 0;
// cx, cleft y, unit k. opts.dark switches wine->ivory. Returns {svg, defs, point, top, bottom}
function mark(cx, cl, k, { dark = false, sep = '#FFFFFF', transparent = false } = {}) {
  const id = `mk${uid++}`;
  const kx = 0.95, ky = 0.92;
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const WF = dark ? '#F7E9DA' : `url(#${id}w)`;
  const defs = `<linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="0" y1="${cl - 7 * k}" x2="0" y2="${cl + 22 * k}"><stop offset="0" stop-color="#7A0A3C"/><stop offset="1" stop-color="#46041F"/></linearGradient>` +
    `<clipPath id="${id}c"><rect x="${cx - 2 * k}" y="${cl + 1.1 * k}" width="${8.5 * k}" height="${4 * k}"/></clipPath>`;
  const g = [];
  const wH = (t) => (k / 26) * (0.8 + 6.2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.04)), 1.4) * (t < 0.12 ? t / 0.12 : 1));

  // S·A monogram inside
  const S = W.traced('S');
  const sS = (14.4 * k) / 358;
  const sx0 = cx - 1.1 * k - (252 * sS) / 2, sTop = cl + 1.4 * k;
  const tS = `translate(${L.r2(sx0 - sS * 62)},${L.r2(sTop - sS * 642)}) scale(${sS.toFixed(5)})`;
  const A = B.brandA({ cx: cx + 0.3 * k, apexY: cl - 2.6 * k, baseY: sTop + 14.4 * k - 0.2 * k, halfW: 6.3 * k, legFill: GF, starFill: 'none', barFill: GF, heartSize: 2.1 * k, barT: 0.68, thick: 1.1 });
  const left = heartHalf(cx, cl, k, -1, kx, ky), right = heartHalf(cx, cl, k, 1, kx, ky);
  const sw = ((0.3 * k) / sS).toFixed(1), aw = (0.3 * k).toFixed(1);
  const Aknock = (col) => A.svg.replace(/fill="url\(#(goldR|goldD|pink)\)"/g, `fill="none" stroke="${col}" stroke-width="${aw}"`);
  const heart = `<path d="${L.ribbon(left, wH)}" fill="${WF}"/><path d="${L.ribbon(right, wH)}" fill="${GF}"/>`;
  if (transparent) {
    // knock the letters out of the heart with a mask so it passes behind them
    const mk = `<mask id="${id}m" maskUnits="userSpaceOnUse" x="${cx - 20 * k}" y="${cl - 12 * k}" width="${40 * k}" height="${40 * k}"><rect x="${cx - 20 * k}" y="${cl - 12 * k}" width="${40 * k}" height="${40 * k}" fill="#fff"/><path d="${S}" fill="#000" stroke="#000" stroke-width="${sw}" transform="${tS}"/>${Aknock('#000')}</mask>`;
    g.push(mk + `<g mask="url(#${id}m)">${heart}</g>`);
    g.push(`<path d="${S}" fill="${WF}" transform="${tS}"/>`);
    g.push(A.svg);
    g.push(`<g clip-path="url(#${id}c)"><path d="${S}" fill="${WF}" transform="${tS}"/></g>`);
  } else {
    g.push(heart);
    g.push(`<path d="${S}" fill="none" stroke="${sep}" stroke-width="${sw}" transform="${tS}"/>`);
    g.push(`<path d="${S}" fill="${WF}" transform="${tS}"/>`);
    g.push(Aknock(sep));
    g.push(A.svg);
    g.push(`<g clip-path="url(#${id}c)"><path d="${S}" fill="none" stroke="${sep}" stroke-width="${sw}" transform="${tS}"/><path d="${S}" fill="${WF}" transform="${tS}"/></g>`);
  }
  // star on the apex of the A, rising out of the heart's cleft
  g.push(`<path d="${B.star(cx + 0.3 * k, cl - 3.1 * k, 2.6 * k)}" fill="${GF}"/>`);
  const point = left[left.length - 1];
  return { svg: g.join(''), defs, point, top: cl - 7 * k, bottom: point[1], width: 32 * k * kx };
}

module.exports = { mark, heartHalf };
