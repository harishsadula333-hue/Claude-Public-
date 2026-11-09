// Merged lockup 1 — "Mukut A": the A inside SUNDAR grows into the emblem and
// its head becomes a crown (as WDC crowned its W). One continuous mark:
// crown-A, words on its baseline, thread under SUND, arc into "lysh".
const L = require('./lib');
const B = require('./brand');
const M = require('./merge_common');

module.exports = function build({ dark = false } = {}) {
  const G = M.layout({ s: 0.52, Yb: 760, H: 474, A: 122 });
  const v = dark ? 'dark' : 'orig';
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const legFill = dark ? '#F7E9DA' : 'url(#wineA)';
  const tip = [G.XL + 66, G.Yb + 84];
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="44%" r="72%">${dark
      ? '<stop offset="0" stop-color="#6E1238"/><stop offset="0.6" stop-color="#480A25"/><stop offset="1" stop-color="#2A0514"/>'
      : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.75" stop-color="#FFFCF8"/><stop offset="1" stop-color="#F7EEE4"/>'}</radialGradient>` +
    `<linearGradient id="wineA" gradientUnits="userSpaceOnUse" x1="0" y1="${G.Ya}" x2="0" y2="${G.Yb}"><stop offset="0" stop-color="#7A0A3C"/><stop offset="1" stop-color="#46041F"/></linearGradient>` +
    (dark ? `<linearGradient id="legG" gradientUnits="userSpaceOnUse" x1="${G.cx}" y1="${G.Ya + 150}" x2="${tip[0]}" y2="${tip[1]}"><stop offset="0" stop-color="#F7E9DA"/><stop offset="0.42" stop-color="#F7E9DA"/><stop offset="0.7" stop-color="#E2B357"/><stop offset="1" stop-color="#F3D58E"/></linearGradient>`
      : M.legGradient('legG', G, [G.cx, G.Ya + 150], tip));
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);

  // hero A
  const A = B.brandA({ cx: G.cx, apexY: G.Ya, baseY: G.Yb, halfW: G.A, legFill, leftFill: 'url(#legG)', starFill: GF, barFill: GF, starSize: 60, heartSize: 32, barT: 0.71 });
  const foot = A.legPts[A.legPts.length - 1];
  g.push(`<path d="${M.swoosh(G, foot, A.legW, tip)}" fill="url(#legG)"/>`);
  // the A's crossbar runs on over the R into "lysh" (under the leg)
  g.push(`<path d="${M.bridge(G, [A.xr - 1, A.barY], 40)}" fill="${GF}"/>`);
  g.push(A.svg);

  // crown on the head of the A
  const cx = G.cx, bandY = G.Ya + 112, bw = 82;
  const band = `M${cx - bw},${bandY + 4}Q${cx},${bandY - 14} ${cx + bw},${bandY + 4}L${cx + bw - 4},${bandY + 18}Q${cx},${bandY + 2} ${cx - bw + 4},${bandY + 18}Z`;
  // spires rising from the band ends, each tipped with a star
  for (const sx of [-1, 1]) {
    const base = [cx + sx * (bw - 10), bandY + 2];
    const top = [cx + sx * 104, G.Ya + 8];
    const pts = L.cubicPts(base, [cx + sx * (bw + 10), bandY - 44], [cx + sx * 112, G.Ya + 56], top, 60);
    g.push(`<path d="${L.ribbon(pts, (t) => 3.2 - 2.2 * t)}" fill="${GF}"/>`);
    g.push(`<path d="${B.star(top[0], top[1] - 10, 26)}" fill="${GF}"/>`);
    // short pearl-topped points between the spires and the apex
    const pb = [cx + sx * 46, bandY - 4], pt = [cx + sx * 54, G.Ya + 58];
    g.push(`<path d="${L.ribbon(L.cubicPts(pb, [pb[0], pb[1] - 18], [pt[0] - sx * 4, pt[1] + 14], pt, 30), (t) => 2.2 - 1.2 * t)}" fill="${GF}"/>`);
    g.push(`<circle cx="${L.r2(pt[0])}" cy="${L.r2(pt[1] - 4)}" r="5.2" fill="url(#pearl)" stroke="${GF}" stroke-width="0.9"/>`);
    // scroll curls at the band ends (the crowned-W gesture)
    g.push(`<path d="${B.flourish([[cx + sx * (bw - 2), bandY + 12], [cx + sx * (bw + 14), bandY + 16], [cx + sx * (bw + 26), bandY + 8], [cx + sx * (bw + 26), bandY - 6]], { r0: 9, turns: 1.05, dir: sx === 1 ? -1 : 1, w0: 4, w1: 4, ball: 2.4 })}" fill="${GF}"/>`);
    // pearl drops on the A's shoulders just under the band
  }
  // crown arches: spire tip -> pearl point -> apex, scalloped
  {
    const P = (sx) => ({ sp: [cx + sx * 104, G.Ya + 8], pp: [cx + sx * 54, G.Ya + 54], ap: [cx + sx * 8, G.Ya + 30] });
    let d = '';
    for (const sx of [-1, 1]) {
      const q = P(sx);
      d += `M${q.sp[0]},${q.sp[1] + 8}Q${(q.sp[0] + q.pp[0]) / 2},${q.pp[1] + 18} ${q.pp[0]},${q.pp[1] - 8}`;
      d += `M${q.pp[0]},${q.pp[1] - 8}Q${(q.pp[0] + q.ap[0]) / 2},${q.pp[1] + 6} ${q.ap[0]},${q.ap[1]}`;
    }
    g.push(`<path d="${d}" fill="none" stroke="${GF}" stroke-width="1.8" stroke-linecap="round"/>`);
  }
  g.push(`<path d="${band}" fill="${GF}"/>`);
  for (const k of [-0.7, -0.35, 0.35, 0.7]) {
    const x = cx + k * bw, y = bandY + 10 - 9 * (1 - k * k);
    g.push(`<circle cx="${L.r2(x)}" cy="${L.r2(y)}" r="3.2" fill="url(#pearl)"/>`);
  }
  g.push(`<path d="M${cx},${bandY - 8}Q${cx + 9},${bandY + 2} ${cx},${bandY + 12}Q${cx - 9},${bandY + 2} ${cx},${bandY - 8}Z" fill="url(#pink)" stroke="${GF}" stroke-width="1.4"/>`);


  // words on the A's baseline + tagline
  const T = M.text(G, v);
  g.push(T.body);
  const tag = M.tagline(v, 0.5, 540, G.Yb + 124);
  g.push(tag.body);
  return L.svgDoc(g.join('\n'), defs + T.defs + tag.defs);
};
