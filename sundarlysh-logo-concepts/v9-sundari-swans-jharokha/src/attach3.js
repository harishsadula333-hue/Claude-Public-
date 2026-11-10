// Sundari (profile), Swan Heart, Jharokha Frame.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

function crSpline(P, n = 16) { // Catmull-Rom through points
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}

function scene(dark, bg, { s = 0.56, sy = 586 }, symbol) {
  const v = dark ? 'dark' : 'orig';
  const ox = C - s * 851, oy = sy - s * 560;
  const a = W.place('main', v, s, ox, oy), t = W.place('tag', v, s, ox, oy);
  const tip = [C, oy + s * 517];
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const WF = dark ? '#F3E3D3' : 'url(#wineS)';
  const sym = symbol({ tip, GF, WF, dark, s, ox, oy });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${sym.defs || ''}${a.defs}${t.defs}` +
    `<linearGradient id="wineS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A1446"/><stop offset="1" stop-color="#4A0624"/></linearGradient></defs>` +
    `<rect width="1080" height="1080" fill="${bg}"/>${sym.under || ''}${a.body}${t.body}${sym.svg || ''}</svg>\n`;
}

// 28 · Sundari — a calligraphic woman's profile; her gold hair flows into the A's star
function sundari(dark, bg) {
  return scene(dark, bg, { sy: 600 }, ({ tip, GF, WF }) => {
    const dx = 40, dy = 0;
    const P = (x, y) => [x + dx, y + dy];
    const face = crSpline([P(548, 186), P(566, 222), P(574, 262), P(582, 286), P(580, 298), P(596, 326), P(610, 346), P(598, 354), P(588, 358), P(596, 370), P(587, 379), P(595, 390), P(586, 402), P(590, 420), P(578, 438), P(560, 446), P(556, 470), P(560, 500)]);
    let g = `<path d="${L.ribbon(face, (t) => 1.2 + 3.6 * Math.sin(Math.PI * Math.min(1, t * 1.05)))}" fill="${WF}"/>`;
    // closed eye with lashes
    g += `<path d="M${P(548, 304)}Q${P(560, 312)} ${P(572, 302)}" fill="none" stroke="${WF}" stroke-width="2.4" stroke-linecap="round"/>`;
    for (const [x, y, x2, y2] of [[552, 308, 548, 316], [558, 310, 556, 319], [564, 309, 564, 318]]) g += `<path d="M${P(x, y)}L${P(x2, y2)}" stroke="${WF}" stroke-width="1.4" stroke-linecap="round"/>`;
    g += `<path d="M${P(548, 288)}Q${P(562, 280)} ${P(576, 286)}" fill="none" stroke="${WF}" stroke-width="2" stroke-linecap="round"/>`;
    // bindi star
    g += `<path d="${B.star(...P(568, 264), 12, 0.12)}" fill="${GF}"/>`;
    // hair: gold strands sweeping back and down, the last one flowing into the A's star
    const strands = [
      [P(548, 186), P(500, 168), P(430, 200), P(410, 280), P(418, 360), P(450, 420)],
      [P(540, 196), P(486, 190), P(436, 236), P(432, 316), P(452, 392), P(496, 440)],
      [P(530, 210), P(476, 220), P(452, 276), P(462, 350), P(492, 410), P(520, 470), P(C - dx, tip[1] - 60)],
      [P(520, 186), P(462, 178), P(400, 224), P(380, 310), P(392, 400), P(430, 470)],
    ];
    strands.forEach((st, i) => {
      const pts = crSpline(st);
      g += `<path d="${L.ribbon(pts, (t) => (i === 2 ? 0.8 : 0.6) + (i === 2 ? 4.2 : 3.4) * Math.sin(Math.PI * Math.min(1, t * 1.1)))}" fill="${GF}"/>`;
    });
    // hair curls at strand ends
    g += `<path d="${B.flourish([P(450, 420), P(462, 440), P(476, 446), P(488, 440)], { r0: 9, turns: 1, dir: -1, w0: 2, w1: 2.4, ball: 2.4 })}" fill="${GF}"/>`;
    g += `<path d="${B.flourish([P(430, 470), P(440, 492), P(458, 498), P(470, 490)], { r0: 9, turns: 1, dir: -1, w0: 2, w1: 2.4, ball: 2.4 })}" fill="${GF}"/>`;
    // thread down into the star
    g += `<path d="${L.ribbon(L.cubicPts([C, tip[1] - 62], [C - 6, tip[1] - 40], [C + 4, tip[1] - 16], [C, tip[1]], 30), () => 1)}" fill="${GF}"/>`;
    // jhumka earring with heart
    g += `<circle cx="${P(500, 352)[0]}" cy="${P(500, 352)[1]}" r="4" fill="${GF}"/><path d="${L.heart(...P(500, 370), 22)}" fill="url(#pink)"/>`;
    return { svg: g };
  });
}

// 29 · Swan Heart — two swans whose necks form a heart; they glide on the thread from the star
function swans(dark, bg) {
  return scene(dark, bg, { sy: 610 }, ({ tip, GF, WF, dark: dk }) => {
    const wy = tip[1] - 40; // waterline
    let g = '';
    const swan = (sx, fill, edge) => {
      const X = (x) => C + sx * x;
      // neck + head as a single calligraphic stroke: breast -> up/out -> over -> head down to centre
      const neck = crSpline([[X(10), wy - 40], [X(60), wy - 110], [X(92), wy - 190], [X(80), wy - 250], [X(44), wy - 262], [X(16), wy - 236], [X(8), wy - 214]], 20);
      g += `<path d="${L.ribbon(neck, (t) => 3 + 7 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.9)))}" fill="${fill}"/>`;
      // head + beak
      g += `<ellipse cx="${X(20)}" cy="${wy - 230}" rx="13" ry="10" fill="${fill}"/>`;
      g += `<path d="M${X(10)},${wy - 234}L${X(-2)},${wy - 214}L${X(12)},${wy - 222}Z" fill="${dk ? '#E3BD68' : '#C38A2A'}"/>`;
      // body
      const body = `M${X(8)},${wy - 36}C${X(40)},${wy - 6} ${X(120)},${wy} ${X(190)},${wy - 10}C${X(222)},${wy - 18} ${X(236)},${wy - 50} ${X(232)},${wy - 86}C${X(206)},${wy - 54} ${X(170)},${wy - 52} ${X(150)},${wy - 60}C${X(110)},${wy - 74} ${X(60)},${wy - 74} ${X(8)},${wy - 36}Z`;
      g += `<path d="${body}" fill="${fill}"/>`;
      const cid = `sw${sx < 0 ? 'L' : 'R'}${dk ? 'd' : 'l'}`;
      g += `<clipPath id="${cid}"><path d="${body}"/></clipPath><g clip-path="url(#${cid})">`;
      // wing feathers
      for (let i = 0; i < 4; i++) g += `<path d="M${X(70 + i * 8)},${wy - 50 + i * 4}Q${X(130 + i * 14)},${wy - 92 + i * 12} ${X(196 + i * 6)},${wy - 70 + i * 14}" fill="none" stroke="${edge}" stroke-width="${1.6 - i * 0.2}"/>`;
      g += '</g>';
    };
    swan(-1, WF, dk ? '#4A0A24' : '#F3D58E');
    swan(1, GF, dk ? '#4A0A24' : '#FFF3D0');
    g += `<path d="${L.heart(C, wy - 140, 46)}" fill="url(#pink)"/>`;
    g += `<path d="${B.star(C, wy - 300, 26, 0.1)}" fill="${GF}"/>`;
    // water: the thread sweeps under them and drops into the A's star
    for (const sx of [-1, 1]) g += `<path d="${L.ribbon(L.cubicPts([C, wy + 6], [C + sx * 90, wy + 2], [C + sx * 200, wy + 14], [C + sx * 270, wy - 2], 60), (t) => 2.4 * (1 - t) + 0.4)}" fill="${GF}"/>`;
    g += `<path d="M${C},${wy + 6}L${C},${tip[1]}" stroke="${GF}" stroke-width="1.6"/>`;
    return { svg: g };
  });
}

// 30 · Jharokha Frame — a palace window frames the name; a heart lantern hangs to the A's star
function jharokha(dark, bg) {
  return scene(dark, bg, { s: 0.40, sy: 650 }, ({ tip, GF }) => {
    const hw = 336, base = 860, sh = 500, ap = 214;
    const side = (cx, hw2, sh2, ap2) => {
      const H = sh2 - ap2;
      return [[cx - hw2, base], [cx - hw2, sh2], [cx - hw2, sh2 - 0.5 * H], [cx - 0.8 * hw2, ap2 + 0.45 * H], [cx - 0.36 * hw2, ap2 + 0.33 * H], [cx - 0.2 * hw2, ap2 + 0.26 * H], [C, ap2 + 0.2 * H], [C, ap2]];
    };
    const archPath = (hw2, sh2, ap2) => {
      const l = side(C, hw2, sh2, ap2).map((p) => p.map(L.r2)), r = l.map(([x, y]) => [L.r2(2 * C - x), y]).reverse();
      return `M${l[0]}L${l[1]}C${l[2]} ${l[3]} ${l[4]}C${l[5]} ${l[6]} ${l[7]}C${r[1]} ${r[2]} ${r[3]}C${r[4]} ${r[5]} ${r[6]}L${r[7]}`;
    };
    let g = `<path d="${archPath(hw, sh, ap)}" fill="none" stroke="${GF}" stroke-width="4.2"/>`;
    g += `<path d="${archPath(hw - 16, sh + 6, ap + 22)}" fill="none" stroke="${GF}" stroke-width="1.6"/>`;
    // cusped (scalloped) inner arch
    let sc = ''; const n = 13;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI, R = hw - 36, cy = sh + 30;
      const p0 = [C + R * Math.cos(a0), cy + R * 0.95 * Math.sin(a0)], p1 = [C + R * Math.cos(a1), cy + R * 0.95 * Math.sin(a1)];
      const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], k = 0.55;
      sc += `M${L.r2(p0[0])},${L.r2(p0[1])}Q${L.r2(C + (m[0] - C) * k + (m[0] - C) * (1 - k) * 0.8)},${L.r2(cy + (m[1] - cy) * 0.82)} ${L.r2(p1[0])},${L.r2(p1[1])}`;
    }
    g += `<path d="${sc}" fill="none" stroke="${GF}" stroke-width="1.6" opacity="0.9"/>`;
    // finial: small dome + star
    g += `<path d="M${C - 18},${ap + 2}Q${C},${ap - 40} ${C + 18},${ap + 2}Z" fill="${GF}"/>`;
    g += `<path d="${B.star(C, ap - 54, 22, 0.1)}" fill="${GF}"/>`;
    // pillar capitals + sill
    for (const sx of [-1, 1]) g += `<rect x="${C + sx * hw - 12}" y="${sh - 6}" width="24" height="6" fill="${GF}"/><rect x="${C + sx * hw - 12}" y="${base - 10}" width="24" height="10" fill="${GF}"/>`;
    g += `<rect x="${C - hw - 30}" y="${base}" width="${2 * hw + 60}" height="4" fill="${GF}"/><rect x="${C - hw - 50}" y="${base + 12}" width="${2 * hw + 100}" height="2" fill="${GF}"/>`;
    // heart lantern hanging from the arch's crown down to the A's star
    const ly = tip[1] - 120;
    g += `<path d="M${C},${ap + 34}L${C},${ly - 26}" stroke="${GF}" stroke-width="1.4"/>`;
    g += `<path d="M${C - 16},${ly - 26}L${C + 16},${ly - 26}L${C + 10},${ly - 18}L${C - 10},${ly - 18}Z" fill="${GF}"/>`;
    g += `<path d="${L.heart(C, ly + 4, 40)}" fill="url(#pink)" stroke="${GF}" stroke-width="2"/>`;
    g += `<path d="M${C},${ly + 22}L${C},${tip[1]}" stroke="${GF}" stroke-width="1.4"/>`;
    return { svg: g };
  });
}

module.exports = { sundari, swans, jharokha };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out10', { recursive: true });
  const set = {
    '28-sundari': sundari(false, '#FFFFFF'), '28-sundari-dark': sundari(true, '#4A0A24'),
    '29-swan-heart': swans(false, '#FBF6EF'), '29-swan-heart-dark': swans(true, '#4A0A24'),
    '30-jharokha-frame': jharokha(false, '#FFFFFF'), '30-jharokha-frame-dark': jharokha(true, '#4A0A24'),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out10/${n}.svg`, v);
}
