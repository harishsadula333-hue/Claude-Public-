// Merged lockup 2 — "Jhumka A": the A inside SUNDAR becomes a jhumka earring —
// star stud, A-bell with heart gem, pearl fringe hanging from the baseline —
// while its leg and crossbar flow on into the words.
const L = require('./lib');
const B = require('./brand');
const M = require('./merge_common');

function offset(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    return [p[0] - ty * d, p[1] + tx * d];
  });
}

module.exports = function build({ dark = true } = {}) {
  const G = M.layout({ s: 0.52, Yb: 742, H: 440, A: 124 });
  const v = dark ? 'dark' : 'orig';
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const tip = [G.XL + 66, G.Yb + 84];
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="42%" r="72%">${dark
      ? '<stop offset="0" stop-color="#701339"/><stop offset="0.6" stop-color="#4A0A26"/><stop offset="1" stop-color="#2A0514"/>'
      : '<stop offset="0" stop-color="#FFF9F6"/><stop offset="1" stop-color="#F4E4DD"/>'}</radialGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#C2477A" stop-opacity="0.32"/><stop offset="1" stop-color="#C2477A" stop-opacity="0"/></radialGradient>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  if (dark) g.push(`<circle cx="${G.cx}" cy="${G.Ya + 200}" r="300" fill="url(#glow)"/>`);

  const cx = G.cx, apexY = G.Ya + 16;
  // stud + chain
  g.push(`<circle cx="${cx}" cy="${G.Ya - 40}" r="26" fill="none" stroke="${GF}" stroke-width="2.2"/>`);
  g.push(`<path d="${B.star(cx, G.Ya - 37, 42)}" fill="${GF}"/>`);
  g.push(`<circle cx="${cx}" cy="${G.Ya - 4}" r="4.6" fill="${GF}"/><circle cx="${cx}" cy="${G.Ya + 9}" r="3.6" fill="${GF}"/>`);

  // the A-bell (gold), thin leg flowing into the thread under SUND
  const A = B.brandA({ cx, apexY, baseY: G.Yb, halfW: G.A, legFill: GF, starFill: 'none', barFill: 'none', heart: false, barT: 0.7 });
  const foot = A.legPts[A.legPts.length - 1];
  g.push(`<path d="${M.swoosh(G, foot, A.legW, tip)}" fill="${GF}"/>`);
  g.push(`<path d="${M.bridge(G, [A.xr - 1, A.barY], 40)}" fill="${GF}"/>`); // crossbar flows on into "lysh"
  g.push(A.svg);
  g.push(`<circle cx="${cx}" cy="${apexY - 1}" r="5" fill="${GF}"/>`);
  // engraved inner hairlines
  const inL = offset(A.legPts.slice(18, 84), -13);
  g.push(`<path d="${L.polyline(inL)}" fill="none" stroke="${GF}" stroke-width="1.2"/>`);
  const rf = A.rightFoot - 0.27 * G.A * 1.6;
  g.push(`<path d="M${cx + 7},${apexY + 60}C${cx + 0.16 * G.A},${apexY + 0.42 * G.H} ${cx + 0.36 * G.A},${apexY + 0.78 * G.H} ${L.r2(rf - 10)},${G.Yb - 4}" fill="none" stroke="${GF}" stroke-width="1.2"/>`);

  // crossbar band with beads and heart gem
  const by = A.barY, xl = A.heartAt[0], xr = A.xr + 2;
  g.push(`<rect x="${L.r2(xl)}" y="${by - 9}" width="${L.r2(xr - xl)}" height="1.6" fill="${GF}"/><rect x="${L.r2(xl)}" y="${by + 8}" width="${L.r2(xr - xl)}" height="1.6" fill="${GF}"/>`);
  for (let x = xl + 9; x < xr - 4; x += 10) if (Math.abs(x - cx) > 20) g.push(`<circle cx="${L.r2(x)}" cy="${by}" r="2.8" fill="url(#pearl)"/>`);
  // inner arch + sparkle above the band
  g.push(`<path d="M${cx - 24},${by - 16}C${cx - 24},${by - 60} ${cx - 5},${by - 74} ${cx},${by - 96}C${cx + 5},${by - 74} ${cx + 24},${by - 60} ${cx + 24},${by - 16}" fill="none" stroke="${GF}" stroke-width="1.3"/>`);
  g.push(`<path d="${L.sparkle(cx, by - 46, 10, 6, 0.14)}" fill="${GF}"/>`);
  g.push(`<path d="${L.heart(cx, by + 1, 38)}" fill="url(#pink)" stroke="${GF}" stroke-width="2"/>`);

  // scalloped rim + pearl fringe hanging below the baseline
  const rx0 = cx - 0.82 * G.A, rx1 = A.rightFoot;
  const n = 9;
  let rim = `M${L.r2(rx0)},${G.Yb + 4}`;
  for (let i = 0; i < n; i++) {
    const a = rx0 + ((rx1 - rx0) * i) / n, b2 = rx0 + ((rx1 - rx0) * (i + 1)) / n;
    rim += `Q${L.r2((a + b2) / 2)},${G.Yb + 18} ${L.r2(b2)},${G.Yb + 4}`;
  }
  g.push(`<path d="${rim}" fill="none" stroke="${GF}" stroke-width="2"/>`);
  const mid = (rx0 + rx1) / 2;
  for (let i = 0; i <= n; i++) {
    const x = rx0 + ((rx1 - rx0) * i) / n;
    const len = 14 + 20 * Math.cos(((x - mid) / ((rx1 - rx0) / 2)) * (Math.PI / 2.3));
    const y2 = G.Yb + 6 + len;
    g.push(`<path d="M${L.r2(x)},${G.Yb + 6}L${L.r2(x)},${L.r2(y2)}" stroke="${GF}" stroke-width="1.1"/>`);
    g.push(i === Math.round(n / 2)
      ? `<path d="M${L.r2(x)},${L.r2(y2 - 2)}Q${L.r2(x + 8)},${L.r2(y2 + 9)} ${L.r2(x)},${L.r2(y2 + 18)}Q${L.r2(x - 8)},${L.r2(y2 + 9)} ${L.r2(x)},${L.r2(y2 - 2)}Z" fill="url(#pink)" stroke="${GF}" stroke-width="1"/>`
      : `<circle cx="${L.r2(x)}" cy="${L.r2(y2 + 5)}" r="5" fill="url(#pearl)"/>`);
  }

  const T = M.text(G, v);
  g.push(T.body);
  const tag = M.tagline(v, 0.5, 540, G.Yb + 136);
  g.push(tag.body);
  return L.svgDoc(g.join('\n'), defs + T.defs + tag.defs);
};
