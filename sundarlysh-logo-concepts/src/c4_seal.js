// Concept 4 — "Heart-Bloom Seal": a royal seal whose centre is a five-petal
// flower made of hearts (care) blooming around the brand's star.
const L = require('./lib');
const C = 540;

module.exports = function build() {
  const defs =
    `<radialGradient id="bg" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#FBF1EC"/><stop offset="1" stop-color="#EFD9D0"/></radialGradient>` +
    L.goldGrad('gold', 120, 120, 960, 960, [
      [0, '#9A6418'], [0.22, '#D9A848'], [0.42, '#F6DC94'], [0.55, '#DDAE52'], [0.78, '#A06A16'], [1, '#D8B062'],
    ]) +
    `<radialGradient id="petal" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#8E1C47"/><stop offset="1" stop-color="#560B28"/></radialGradient>` +
    `<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0457A"/><stop offset="1" stop-color="#C0103F"/></linearGradient>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);

  // rings
  let beads = '';
  for (let a = 0; a < 360; a += 4) {
    const t = (a * Math.PI) / 180;
    beads += `<circle cx="${L.r2(C + 470 * Math.cos(t))}" cy="${L.r2(C + 470 * Math.sin(t))}" r="3.1"/>`;
  }
  g.push(`<g fill="url(#gold)">${beads}</g>`);
  g.push(`<g fill="none" stroke="url(#gold)"><circle cx="${C}" cy="${C}" r="453" stroke-width="2.6"/><circle cx="${C}" cy="${C}" r="444" stroke-width="1.1"/>` +
    `<circle cx="${C}" cy="${C}" r="338" stroke-width="2.6"/><circle cx="${C}" cy="${C}" r="329" stroke-width="1.1"/></g>`);

  // ring text
  const top = L.arcText('cinzel600', 'SUNDARLYSH', C, C, 371, 60, { ls: 0.3, pos: 'top' });
  const bot = L.arcText('cinzel600', 'CARE WITH STYLE', C, C, 409, 38, { ls: 0.32, pos: 'bottom' });
  g.push(`<path d="${top.d}" fill="#6B0F33"/><path d="${bot.d}" fill="#6B0F33"/>`);
  // separators at 3 and 9 o'clock
  for (const sx of [C - 391, C + 391]) {
    g.push(`<path d="${L.sparkle(sx, C, 17, 10, 0.12)}" fill="url(#gold)"/>`);
  }

  // heart-bloom
  const s = 200, tip = 18;
  // fine sunburst between bloom and inner ring
  let rays = '';
  for (let a = 0; a < 360; a += 2.5) {
    const t = (a * Math.PI) / 180, r1 = 262, r2 = 316;
    rays += `M${L.r2(C + r1 * Math.cos(t))},${L.r2(C + r1 * Math.sin(t))}L${L.r2(C + r2 * Math.cos(t))},${L.r2(C + r2 * Math.sin(t))}`;
  }
  g.push(`<path d="${rays}" stroke="url(#gold)" stroke-width="1.2" opacity="0.55"/>`);
  g.push(`<circle cx="${C}" cy="${C}" r="254" fill="none" stroke="url(#gold)" stroke-width="1.1"/>`);
  let first = '';
  for (let i = 0; i < 5; i++) {
    const mark = g.length;
    const phi = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const dist = tip + 0.47 * s;
    const hx = C + dist * Math.cos(phi), hy = C + dist * Math.sin(phi);
    const rot = (phi * 180) / Math.PI + 90;
    g.push(`<path d="${L.heart(hx, hy, s, rot)}" fill="url(#petal)" stroke="url(#gold)" stroke-width="3"/>`);
    // inner hairline heart (petal vein)
    const d2 = tip + 0.47 * s * 0.62 + 31;
    g.push(`<path d="${L.heart(C + d2 * Math.cos(phi), C + d2 * Math.sin(phi), s * 0.6, rot)}" fill="none" stroke="url(#gold)" stroke-width="1.4"/>`);
    if (i === 0) first = g.slice(mark).join('');
  }
  // close the pinwheel: the top petal tucks over the last one
  g.push(`<clipPath id="pw"><rect x="0" y="0" width="${C}" height="${C}"/></clipPath><g clip-path="url(#pw)">${first}</g>`);
  // centre: gold disc with pink heart
  g.push(`<circle cx="${C}" cy="${C}" r="36" fill="url(#gold)"/><circle cx="${C}" cy="${C}" r="29" fill="#FBF1EC"/>`);
  g.push(`<path d="${L.heart(C, C + 1, 34)}" fill="url(#pink)"/>`);
  return L.svgDoc(g.join('\n'), defs);
};
