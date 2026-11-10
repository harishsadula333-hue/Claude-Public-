// Three completely new styles around the original lettering:
// Art Deco (black & champagne gold), Gold Foil on Velvet (embossed), Watercolour Bloom.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

function words(s, sy, fill) { // original lettering, star of the A centred
  const ox = C - s * 851, oy = sy - s * 560;
  const v = typeof fill === 'string' ? fill : { fill: fill.fill };
  const a = W.place('main', v, s, ox, oy), t = W.place('tag', v, s, ox, oy);
  return { defs: a.defs + t.defs, body: a.body + t.body, tip: [C, oy + s * 517] };
}
const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${defs}</defs>${body}</svg>\n`;

// ---------- 31 · Art Deco ----------
function deco() {
  const champ = L.goldGrad('champ', 0, 140, 0, 900, [[0, '#F6E3B4'], [0.35, '#D8B56E'], [0.6, '#F2DCA6'], [1, '#B8904A']]);
  const wd = words(0.56, 610, { fill: 'url(#champ)' });
  const O = [C, wd.tip[1] - 6];
  let g = `<rect width="1080" height="1080" fill="#0D0B0B"/>`;
  // stepped (ziggurat) arch that holds the sunrise
  const steps = [[230, 0], [196, 60], [162, 112], [128, 156], [94, 190]];
  let zig = `M${C - 260},${O[1]}`;
  for (const [hw, up] of steps) zig += `L${C - hw - 30},${O[1] - up - 60}L${C - hw},${O[1] - up - 60}`;
  zig += `L${C - 60},${O[1] - 300}L${C + 60},${O[1] - 300}`;
  for (const [hw, up] of steps.slice().reverse()) zig += `L${C + hw},${O[1] - up - 60}L${C + hw + 30},${O[1] - up - 60}`;
  zig += `L${C + 260},${O[1]}`;
  const defs = champ + wd.defs + `<clipPath id="zc"><path d="${zig}Z"/></clipPath>`;
  // sunrise rays from the A's star
  let rays = '';
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI + (i / 24) * Math.PI, long = i % 2 === 0, len = long ? 420 : 300;
    rays += `<path d="M${O[0]},${O[1]}L${L.r2(O[0] + len * Math.cos(a))},${L.r2(O[1] + len * Math.sin(a))}" stroke="url(#champ)" stroke-width="${long ? 3.2 : 1.4}"/>`;
  }
  g += `<g clip-path="url(#zc)">${rays}</g>`;
  g += `<path d="${zig}" fill="none" stroke="url(#champ)" stroke-width="3"/>`;
  g += `<path d="${zig}" fill="none" stroke="url(#champ)" stroke-width="1.2" transform="translate(${C},${O[1]}) scale(1.06) translate(${-C},${-O[1]})"/>`;
  // rising sun half-disc with concentric arcs
  for (const [r, w] of [[64, 2], [50, 1.4]]) g += `<path d="M${C - r},${O[1]}A${r} ${r} 0 0 1 ${C + r},${O[1]}" fill="none" stroke="url(#champ)" stroke-width="${w}"/>`;
  g += `<path d="M${C - 38},${O[1]}A38 38 0 0 1 ${C + 38},${O[1]}Z" fill="#0D0B0B" stroke="url(#champ)" stroke-width="2"/>`;
  g += `<path d="${L.heart(C, O[1] - 18, 26)}" fill="#E8275E"/>`;
  g += `<path d="${B.star(C, O[1] - 328, 26, 0.1)}" fill="url(#champ)"/>`;
  // deco rule lines flanking the tagline area
  g += wd.body;
  return svg(defs, g);
}

// ---------- 32 · Gold Foil on Velvet ----------
function foil() {
  const foilG = L.goldGrad('foil', 300, 120, 780, 900, [[0, '#8C5A12'], [0.2, '#D6A445'], [0.38, '#FFF0B8'], [0.5, '#E2B24F'], [0.7, '#9C6714'], [0.86, '#E8C66E'], [1, '#A87418']]);
  const filt = `<filter id="emb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/>` +
    `<feSpecularLighting in="b" surfaceScale="3.5" specularConstant="0.9" specularExponent="22" lighting-color="#FFF6DA" result="sp"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>` +
    `<feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/><feComposite in="SourceGraphic" in2="sp2" operator="arithmetic" k1="0" k2="1" k3="0.75" k4="0" result="lit"/>` +
    `<feDropShadow dx="2" dy="3" stdDeviation="2.4" flood-color="#14000A" flood-opacity="0.65"/></filter>` +
    `<filter id="velvet"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.02  0 0 0 0 0.15  0 0 0 0.22 0"/></filter>` +
    `<radialGradient id="vbg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#7A1742"/><stop offset="0.6" stop-color="#4C0A28"/><stop offset="1" stop-color="#25040F"/></radialGradient>`;
  const wd = words(0.56, 616, { fill: 'url(#foil)' });
  const cx = C, cy = 352, R = 150;
  let m = '';
  // scalloped outer ring
  let sc = ''; const n = 28;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI, am = (a0 + a1) / 2;
    if (i === 0) sc += `M${L.r2(cx + R * Math.cos(a0))},${L.r2(cy + R * Math.sin(a0))}`;
    sc += `Q${L.r2(cx + (R + 16) * Math.cos(am))},${L.r2(cy + (R + 16) * Math.sin(am))} ${L.r2(cx + R * Math.cos(a1))},${L.r2(cy + R * Math.sin(a1))}`;
  }
  m += `<path d="${sc}Z" fill="none" stroke="url(#foil)" stroke-width="5"/>`;
  m += `<circle cx="${cx}" cy="${cy}" r="${R - 14}" fill="none" stroke="url(#foil)" stroke-width="3"/>`;
  let beads = ''; for (let i = 0; i < 60; i++) { const a = (i / 60) * 2 * Math.PI; beads += `<circle cx="${L.r2(cx + (R - 26) * Math.cos(a))}" cy="${L.r2(cy + (R - 26) * Math.sin(a))}" r="3"/>`; }
  m += `<g fill="url(#foil)">${beads}</g>`;
  // lotus mandala: two rings of pointed petals
  const petal = (len, wid, a, r0) => {
    const c = Math.cos(a), s = Math.sin(a), P = (x, y) => [L.r2(cx + (x * c - y * s)), L.r2(cy + (x * s + y * c))];
    return `M${P(r0, 0)}C${P(r0 + len * 0.35, -wid)} ${P(r0 + len * 0.8, -wid * 0.6)} ${P(r0 + len, 0)}C${P(r0 + len * 0.8, wid * 0.6)} ${P(r0 + len * 0.35, wid)} ${P(r0, 0)}Z`;
  };
  let pet = '';
  for (let i = 0; i < 8; i++) pet += petal(80, 24, (i / 8) * 2 * Math.PI + Math.PI / 8, 26);
  m += `<path d="${pet}" fill="none" stroke="url(#foil)" stroke-width="3.4" stroke-linejoin="round"/>`;
  let pet2 = '';
  for (let i = 0; i < 8; i++) pet2 += petal(56, 18, (i / 8) * 2 * Math.PI - Math.PI / 2, 22);
  m += `<path d="${pet2}" fill="url(#foil)"/>`;
  m += `<circle cx="${cx}" cy="${cy}" r="26" fill="url(#foil)"/>`;
  m += `<path d="${L.heart(cx, cy + 1, 30)}" fill="#D3134A"/>`;
  m += `<path d="${B.star(cx, cy - R - 30, 30, 0.1)}" fill="url(#foil)"/>`;
  // thread from the medallion to the A's star
  m += `<path d="M${cx},${cy + R + 14}L${cx},${wd.tip[1]}" stroke="url(#foil)" stroke-width="2.4"/>`;
  m += `<circle cx="${cx}" cy="${(cy + R + 14 + wd.tip[1]) / 2}" r="5" fill="url(#foil)"/>`;
  const body = `<rect width="1080" height="1080" fill="url(#vbg)"/><rect width="1080" height="1080" filter="url(#velvet)"/>` +
    `<g filter="url(#emb)">${m}${wd.body}</g>`;
  return svg(foilG + filt + wd.defs, body);
}

// ---------- 33 · Watercolour Bloom ----------
function watercolour() {
  const wd = words(0.56, 626, 'orig');
  const wc = (id, seed, scale, blur) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="${blur}"/></filter>`;
  const defs = wc('wcA', 3, 22, 1.4) + wc('wcB', 9, 30, 2.4) + wc('wcL', 5, 14, 0.8) + wd.defs;
  let g = `<rect width="1080" height="1080" fill="#FFFDFB"/>`;
  const rose = (x, y, r, tones) => {
    let o = '';
    // outer petals
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 2 * Math.PI;
      o += `<ellipse cx="${L.r2(x + r * 0.55 * Math.cos(a))}" cy="${L.r2(y + r * 0.5 * Math.sin(a))}" rx="${r * 0.62}" ry="${r * 0.48}" transform="rotate(${(a * 180) / Math.PI} ${L.r2(x + r * 0.55 * Math.cos(a))} ${L.r2(y + r * 0.5 * Math.sin(a))})" fill="${tones[0]}" opacity="0.38"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * 2 * Math.PI + 0.4;
      o += `<ellipse cx="${L.r2(x + r * 0.3 * Math.cos(a))}" cy="${L.r2(y + r * 0.28 * Math.sin(a))}" rx="${r * 0.44}" ry="${r * 0.34}" fill="${tones[1]}" opacity="0.45"/>`;
    }
    o += `<circle cx="${x}" cy="${y}" r="${r * 0.32}" fill="${tones[2]}" opacity="0.6"/>`;
    // swirl at the heart of the rose
    const sp = L.spiralPts(x, y, r * 0.3, 0, 1.6, 0.25, 1, 80);
    o += `<path d="${L.polyline(sp)}" fill="none" stroke="${tones[3]}" stroke-width="${r * 0.05}" opacity="0.7" stroke-linecap="round"/>`;
    return `<g filter="url(#wcA)">${o}</g>`;
  };
  const leaf = (x, y, len, ang, col) => {
    const a = (ang * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), P = (u, v) => [L.r2(x + u * c - v * s), L.r2(y + u * s + v * c)];
    return `<path d="M${P(0, 0)}Q${P(len * 0.5, -len * 0.32)} ${P(len, 0)}Q${P(len * 0.5, len * 0.32)} ${P(0, 0)}Z" fill="${col}" opacity="0.55"/>`;
  };
  // garland arc above the name
  const cy = 382;
  let leaves = '';
  for (const [x, y, len, ang] of [[392, 392, 90, 200], [360, 350, 80, 230], [420, 300, 70, 250], [688, 392, 90, -20], [720, 350, 80, -50], [660, 300, 70, -70], [500, 250, 60, 250], [580, 250, 60, -70], [300, 420, 64, 190], [780, 420, 64, -10]])
    leaves += leaf(x, y + 52, len, ang, '#9DB49A');
  g += `<g filter="url(#wcL)">${leaves}</g>`;
  // soft wash behind
  g += `<g filter="url(#wcB)"><ellipse cx="${C}" cy="${cy + 20}" rx="230" ry="120" fill="#F6D3D8" opacity="0.45"/></g>`;
  g += rose(C, cy, 92, ['#E89AAE', '#C9466E', '#8E1446', '#6B0F33']);
  g += rose(C - 150, cy + 50, 64, ['#F2B9C6', '#E07C98', '#B03A62', '#7A1D45']);
  g += rose(C + 150, cy + 50, 64, ['#F2B9C6', '#E07C98', '#B03A62', '#7A1D45']);
  g += rose(C - 250, cy + 100, 36, ['#F7D0D8', '#EDA3B5', '#C9466E', '#8E1446']);
  g += rose(C + 250, cy + 100, 36, ['#F7D0D8', '#EDA3B5', '#C9466E', '#8E1446']);
  // gold accents: fine gold leaf sprigs and specks
  let gold = '';
  for (const [x, y, len, ang] of [[C - 90, cy - 70, 70, 225], [C + 90, cy - 70, 70, -45], [C - 210, cy + 10, 60, 210], [C + 210, cy + 10, 60, -30]]) {
    const a = (ang * Math.PI) / 180;
    const pts = L.cubicPts([x, y], [x + len * 0.4 * Math.cos(a), y + len * 0.4 * Math.sin(a) - 10], [x + len * 0.8 * Math.cos(a), y + len * 0.8 * Math.sin(a) - 6], [x + len * Math.cos(a), y + len * Math.sin(a)], 30);
    gold += `<path d="${L.ribbon(pts, (t) => 1.6 * (1 - t) + 0.3)}" fill="url(#goldR)"/>`;
    for (let k = 1; k <= 3; k++) { const p = pts[k * 7]; gold += `<path d="${L.heart(p[0], p[1] - 4, 9)}" fill="none" stroke="url(#goldR)" stroke-width="1.2"/>`; }
  }
  for (const [x, y] of [[C - 60, cy - 120], [C + 70, cy - 110], [C - 300, cy + 40], [C + 300, cy + 40], [C, cy - 140]]) gold += `<path d="${B.star(x, y, 9, 0.12)}" fill="url(#goldR)"/>`;
  g += gold;
  // gold thread from the central rose to the A's star
  g += `<path d="M${C},${cy + 92}L${C},${wd.tip[1]}" stroke="url(#goldR)" stroke-width="1.6"/>`;
  g += wd.body;
  return svg(defs, g);
}

module.exports = { deco, foil, watercolour };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out11', { recursive: true });
  fs.writeFileSync('out11/31-art-deco.svg', deco());
  fs.writeFileSync('out11/32-gold-foil-velvet.svg', foil());
  fs.writeFileSync('out11/33-watercolour-bloom.svg', watercolour());
}
