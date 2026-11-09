// New concept B — "Jhumka A": the star-A becomes an Indian jhumka earring —
// star stud, A-shaped bell, heart gem on the crossbar, pearl fringe.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

module.exports = function build({ dark = true } = {}) {
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="40%" r="72%">${dark
      ? '<stop offset="0" stop-color="#701339"/><stop offset="0.6" stop-color="#4A0A26"/><stop offset="1" stop-color="#2A0514"/>'
      : '<stop offset="0" stop-color="#FFF8F4"/><stop offset="1" stop-color="#F3E1DA"/></radialGradient>'}</radialGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#C2477A" stop-opacity="0.35"/><stop offset="1" stop-color="#C2477A" stop-opacity="0"/></radialGradient>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  if (dark) g.push(`<circle cx="${C}" cy="360" r="280" fill="url(#glow)"/>`);
  g.push('<g transform="translate(0,4)">');
  g.push(`<g transform="translate(${C},380) scale(1.13) translate(${-C},-380)">`);

  const apexY = 250, rimY = 486, hw = 122;
  // stud: brand star inside a fine setting
  g.push(`<circle cx="${C}" cy="172" r="25" fill="none" stroke="${GF}" stroke-width="2"/>`);
  g.push(`<path d="${B.star(C, 174, 40)}" fill="${GF}"/>`);
  g.push(`<circle cx="${C}" cy="214" r="4.5" fill="${GF}"/><circle cx="${C}" cy="230" r="3.6" fill="${GF}"/>`);

  // bell = the A: two flaring legs (outer ribbon + engraved inner hairline)
  const leg = (sx, off = 0) => L.cubicPts([C + sx * off * 0.15, apexY + off * 1.6], [C + sx * (22 + off * 0.2), apexY + 70], [C + sx * (hw * 0.78 - off * 0.9), rimY - 110], [C + sx * (hw - off * 1.1), rimY], 90);
  for (const sx of [-1, 1]) {
    g.push(`<path d="${L.ribbon(leg(sx), (t) => 1.6 + (sx > 0 ? 6.5 : 3.2) * t)}" fill="${GF}"/>`);
    g.push(`<path d="${L.polyline(leg(sx, 14))}" fill="none" stroke="${GF}" stroke-width="1.2" opacity="0.9"/>`);
  }
  g.push(`<circle cx="${C}" cy="${apexY - 2}" r="5" fill="${GF}"/>`);

  // crossbar band with beads and the heart gem
  const barY = 404;
  const legX = (sx, y) => { const pts = leg(sx); let best = pts[0]; for (const p of pts) if (Math.abs(p[1] - y) < Math.abs(best[1] - y)) best = p; return best[0]; };
  const bl = legX(-1, barY), br = legX(1, barY);
  g.push(`<rect x="${L.r2(bl)}" y="${barY - 9}" width="${L.r2(br - bl)}" height="1.6" fill="${GF}"/><rect x="${L.r2(bl)}" y="${barY + 8}" width="${L.r2(br - bl)}" height="1.6" fill="${GF}"/>`);
  for (let x = bl + 11; x < br - 6; x += 11) if (Math.abs(x - C) > 22) g.push(`<circle cx="${L.r2(x)}" cy="${barY}" r="3" fill="url(#pearl)"/>`);
  g.push(`<path d="${L.heart(C, barY + 1, 40)}" fill="url(#pink)" stroke="${GF}" stroke-width="2.2"/>`);

  // filigree inside the dome: a small inner arch with a sparkle
  g.push(`<path d="M${C - 30},${barY - 18}C${C - 30},${barY - 60} ${C - 6},${barY - 74} ${C},${barY - 92}C${C + 6},${barY - 74} ${C + 30},${barY - 60} ${C + 30},${barY - 18}" fill="none" stroke="${GF}" stroke-width="1.4"/>`);
  g.push(`<path d="${L.sparkle(C, barY - 46, 11, 7, 0.14)}" fill="${GF}"/>`);
  // lattice below the band
  for (let i = -4; i <= 4; i++) {
    const x = C + i * 22;
    if (x < legX(-1, rimY - 12) + 8 || x > legX(1, rimY - 12) - 8) continue;
    g.push(`<path d="M${x},${barY + 16}L${x},${rimY - 8}" stroke="${GF}" stroke-width="1" opacity="0.6"/>`);
  }

  // scalloped rim + pearl fringe
  const n = 10, xl = C - hw, xr = C + hw;
  let rim = `M${xl},${rimY}`;
  const tips = [];
  for (let i = 0; i < n; i++) {
    const a = xl + ((xr - xl) * i) / n, b = xl + ((xr - xl) * (i + 1)) / n;
    rim += `Q${L.r2((a + b) / 2)},${rimY + 16} ${L.r2(b)},${rimY}`;
    if (i < n - 1) tips.push(b);
  }
  g.push(`<path d="${rim}" fill="none" stroke="${GF}" stroke-width="2.4"/>`);
  g.push(`<path d="M${xl},${rimY}L${xr},${rimY}" stroke="${GF}" stroke-width="2.4"/>`);
  for (let i = 0; i <= n; i++) {
    const x = xl + ((xr - xl) * i) / n;
    const len = 16 + 26 * Math.cos(((x - C) / hw) * (Math.PI / 2.4));
    const y2 = rimY + len;
    g.push(`<path d="M${L.r2(x)},${rimY + 2}L${L.r2(x)},${L.r2(y2)}" stroke="${GF}" stroke-width="1.2"/>`);
    const isMid = i === n / 2;
    g.push(isMid
      ? `<path d="M${C},${L.r2(y2 - 2)}Q${C + 9},${L.r2(y2 + 10)} ${C},${L.r2(y2 + 20)}Q${C - 9},${L.r2(y2 + 10)} ${C},${L.r2(y2 - 2)}Z" fill="url(#pink)" stroke="${GF}" stroke-width="1.2"/>`
      : `<circle cx="${L.r2(x)}" cy="${L.r2(y2 + 5.5)}" r="5.6" fill="url(#pearl)"/>`);
  }

  g.push('</g>');
  const wm = W.wordmark({ cx: C, top: 608, width: 790, variant: dark ? 'dark' : 'orig' });
  g.push(wm.body);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs + wm.defs);
};
