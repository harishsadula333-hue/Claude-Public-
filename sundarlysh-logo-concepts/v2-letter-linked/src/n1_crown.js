// New concept A — "Mukut": a crown whose three peaks are the brand's star-A.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

module.exports = function build({ dark = false } = {}) {
  const g = [];
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const bandY = 506;
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="42%" r="72%">${dark
      ? '<stop offset="0" stop-color="#6E1238"/><stop offset="0.6" stop-color="#480A25"/><stop offset="1" stop-color="#2A0514"/>'
      : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.7" stop-color="#FDF8F1"/><stop offset="1" stop-color="#F5ECDF"/>'}</radialGradient>`;
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  g.push('<g transform="translate(0,52)">');

  // side peaks (thick leg on the outside), then the hero A in the middle
  const side = { apexY: 286, baseY: bandY + 4, halfW: 64, legFill: GF, starFill: GF, barFill: GF, heart: false, starSize: 28 };
  const left = B.brandA({ ...side, cx: 418 });
  const right = B.brandA({ ...side, cx: 662, mirror: true });
  const mid = B.brandA({ cx: C, apexY: 178, baseY: bandY - 4, halfW: 100, legFill: GF, starFill: GF, barFill: GF, starSize: 50, heartSize: 32 });
  g.push(left.svg, right.svg);
  // pearls on the side crossbars
  for (const a of [left, right]) g.push(`<circle cx="${L.r2(a.heartAt[0])}" cy="${L.r2(a.barY)}" r="6" fill="url(#pearl)" stroke="${GF}" stroke-width="1.4"/>`);
  g.push(mid.svg);
  // pearl swags joining the crossbars: side pearl -> heart -> side pearl
  const swag = (p, q, sag) => {
    const m = [(p[0] + q[0]) / 2, Math.max(p[1], q[1]) + sag];
    const pts = L.cubicPts(p, [p[0] + (m[0] - p[0]) * 0.6, m[1]], [q[0] - (q[0] - m[0]) * 0.6, m[1]], q, 60);
    let out = `<path d="${L.polyline(pts)}" fill="none" stroke="${GF}" stroke-width="1.6"/>`;
    for (let i = 6; i < 60; i += 8) out += `<circle cx="${L.r2(pts[i][0])}" cy="${L.r2(pts[i][1])}" r="4.2" fill="url(#pearl)" stroke="${GF}" stroke-width="0.8"/>`;
    return out;
  };
  const hp = mid.heartAt;
  g.push(swag([left.heartAt[0], left.barY], [hp[0] - 10, hp[1] + 4], 34));
  g.push(swag([hp[0] + 14, mid.barY], [right.heartAt[0], right.barY], 30));
  // re-draw the heart so it sits over the swags
  g.push(`<path d="${L.heart(hp[0], hp[1] + 2, 32)}" fill="url(#pink)"/>`);

  // crown band
  const x0 = 330, x1 = 750;
  const band = `M${x0},${bandY + 6}Q${C},${bandY - 24} ${x1},${bandY + 6}L${x1 - 6},${bandY + 34}Q${C},${bandY + 6} ${x0 + 6},${bandY + 34}Z`;
  g.push(`<path d="${band}" fill="${GF}"/>`);
  g.push(`<path d="M${x0 + 14},${bandY + 9}Q${C},${bandY - 15} ${x1 - 14},${bandY + 9}" fill="none" stroke="#FFF3D0" stroke-width="1.2" opacity="0.7"/>`);
  // pearls along the band
  for (let i = -5; i <= 5; i++) {
    if (i === 0) continue;
    const t = (i + 5.5) / 11;
    const x = x0 + 16 + (x1 - x0 - 32) * t;
    const y = bandY + 20 - 30 * (1 - Math.pow((x - C) / (C - x0), 2)) * 0.5;
    g.push(`<circle cx="${L.r2(x)}" cy="${L.r2(y)}" r="4.6" fill="url(#pearl)"/>`);
  }
  // centre jewel: pink marquise in a gold setting
  g.push(`<path d="M${C},${bandY - 10}Q${C + 15},${bandY + 5} ${C},${bandY + 20}Q${C - 15},${bandY + 5} ${C},${bandY - 10}Z" fill="url(#pink)" stroke="${GF}" stroke-width="2"/>`);
  // scroll flourishes at the band ends (like the crowned W)
  g.push(`<path d="${B.flourish([[x0 + 4, bandY + 16], [x0 - 18, bandY + 14], [x0 - 34, bandY - 2], [x0 - 30, bandY - 24]], { r0: 15, turns: 1.05, dir: 1, w0: 6, w1: 5, ball: 3.2 })}" fill="${GF}"/>`);
  g.push(`<path d="${B.flourish([[x1 - 4, bandY + 16], [x1 + 18, bandY + 14], [x1 + 34, bandY - 2], [x1 + 30, bandY - 24]], { r0: 15, turns: 1.05, dir: -1, w0: 6, w1: 5, ball: 3.2 })}" fill="${GF}"/>`);

  // wordmark
  const wm = W.wordmark({ cx: C, top: 568, width: 790, variant: dark ? 'dark' : 'orig' });
  g.push(wm.body);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs + wm.defs);
};
