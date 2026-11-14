// Shared helpers: text-to-outline, arc text, ornaments, gradients.
const opentype = require('opentype.js');
const path = require('path');

const FD = path.join(__dirname, 'node_modules/@fontsource');
const FONT_FILES = {
  cinzel400: 'cinzel/files/cinzel-latin-400-normal.woff',
  cinzel500: 'cinzel/files/cinzel-latin-500-normal.woff',
  cinzel600: 'cinzel/files/cinzel-latin-600-normal.woff',
  cinzel700: 'cinzel/files/cinzel-latin-700-normal.woff',
  deco400: 'cinzel-decorative/files/cinzel-decorative-latin-400-normal.woff',
  deco700: 'cinzel-decorative/files/cinzel-decorative-latin-700-normal.woff',
  deco900: 'cinzel-decorative/files/cinzel-decorative-latin-900-normal.woff',
  corm500: 'cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff',
  corm600: 'cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff',
  corm700: 'cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff',
  corm500i: 'cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff',
  corm600i: 'cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff',
  vibes: 'great-vibes/files/great-vibes-latin-400-normal.woff',
  pinyon: 'pinyon-script/files/pinyon-script-latin-400-normal.woff',
  abril: 'abril-fatface/files/abril-fatface-latin-400-normal.woff',
  marcellus: 'marcellus/files/marcellus-latin-400-normal.woff',
  italiana: 'italiana/files/italiana-latin-400-normal.woff',
  bodoni500: 'bodoni-moda/files/bodoni-moda-latin-500-normal.woff',
  bodoni600: 'bodoni-moda/files/bodoni-moda-latin-600-normal.woff',
  bodoni500i: 'bodoni-moda/files/bodoni-moda-latin-500-italic.woff',
};
const cache = {};
function font(k) {
  if (!cache[k]) cache[k] = opentype.loadSync(path.join(FD, FONT_FILES[k]));
  return cache[k];
}

const r2 = (n) => Math.round(n * 100) / 100;

function layout(fk, str, size, ls = 0) {
  const f = font(fk);
  const glyphs = f.stringToGlyphs(str);
  const scale = size / f.unitsPerEm;
  let x = 0;
  const items = [];
  glyphs.forEach((g, i) => {
    items.push({ g, x });
    x += g.advanceWidth * scale;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * scale + ls * size;
  });
  return { items, width: x, f, scale };
}

// Horizontal text converted to an outline path.
function text(fk, str, x, y, size, { ls = 0, anchor = 'middle' } = {}) {
  const L = layout(fk, str, size, ls);
  const x0 = anchor === 'middle' ? x - L.width / 2 : anchor === 'end' ? x - L.width : x;
  const p = new opentype.Path();
  for (const it of L.items) p.extend(it.g.getPath(x0 + it.x, y, size));
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), width: L.width, x0, bbox: bb };
}

// Measure ink box of a string without placing it.
function inkBox(fk, str, size, ls = 0) {
  return text(fk, str, 0, 0, size, { ls, anchor: 'start' }).bbox;
}

function xformPath(p, tx, ty, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const T = (x, y) => [x * c - y * s + tx, x * s + y * c + ty];
  const out = new opentype.Path();
  for (const cmd of p.commands) {
    const n = { type: cmd.type };
    if ('x' in cmd) [n.x, n.y] = T(cmd.x, cmd.y);
    if ('x1' in cmd) [n.x1, n.y1] = T(cmd.x1, cmd.y1);
    if ('x2' in cmd) [n.x2, n.y2] = T(cmd.x2, cmd.y2);
    out.commands.push(n);
  }
  return out;
}

// Text set on a circle. pos 'top' reads clockwise over the top, 'bottom' reads
// left-to-right along the bottom (upright).
function arcText(fk, str, cx, cy, r, size, { ls = 0, pos = 'top', offsetDeg = 0 } = {}) {
  const L = layout(fk, str, size, ls);
  const out = new opentype.Path();
  const off = (offsetDeg * Math.PI) / 180;
  for (const it of L.items) {
    const gw = it.g.advanceWidth * L.scale;
    const s = it.x + gw / 2 - L.width / 2;
    let th, rot;
    if (pos === 'top') { th = -Math.PI / 2 + s / r + off; rot = th + Math.PI / 2; }
    else { th = Math.PI / 2 - s / r + off; rot = th - Math.PI / 2; }
    const gp = it.g.getPath(-gw / 2, 0, size);
    out.extend(xformPath(gp, cx + r * Math.cos(th), cy + r * Math.sin(th), rot));
  }
  return { d: out.toPathData(2), arc: L.width / r };
}

// 4-point sparkle star.
function sparkle(cx, cy, h, w = h * 0.62, k = 0.16) {
  return `M${r2(cx)},${r2(cy - h)}Q${r2(cx + w * k)},${r2(cy - h * k)} ${r2(cx + w)},${r2(cy)}` +
    `Q${r2(cx + w * k)},${r2(cy + h * k)} ${r2(cx)},${r2(cy + h)}` +
    `Q${r2(cx - w * k)},${r2(cy + h * k)} ${r2(cx - w)},${r2(cy)}` +
    `Q${r2(cx - w * k)},${r2(cy - h * k)} ${r2(cx)},${r2(cy - h)}Z`;
}

// Heart centred on (cx,cy); s = overall width. Optional rotation in degrees
// (rotation about the heart's tip when tip:true).
function heartPts(s) {
  // returns cubic segments in local coords, tip at (0, 0.5s)
  return [
    [0, 0.47], [-0.1, 0.36], [-0.5, 0.1], [-0.5, -0.17],
    [-0.5, -0.4], [-0.24, -0.5], [0, -0.27],
    [0.24, -0.5], [0.5, -0.4], [0.5, -0.17],
    [0.5, 0.1], [0.1, 0.36], [0, 0.47],
  ].map(([x, y]) => [x * s, y * s]);
}
function heart(cx, cy, s, rotDeg = 0, pivot = null) {
  const a = (rotDeg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
  const pts = heartPts(s);
  const px = pivot ? pivot[0] : cx, py = pivot ? pivot[1] : cy;
  const T = ([x, y]) => {
    const X = cx + x - px, Y = cy + y - py;
    return [r2(X * c - Y * sn + px), r2(X * sn + Y * c + py)];
  };
  const q = pts.map(T);
  let d = `M${q[0]}`;
  for (let i = 1; i < q.length; i += 3) d += `C${q[i]} ${q[i + 1]} ${q[i + 2]}`;
  return d + 'Z';
}

// ---- calligraphic ribbons ----
function cubicPts(p0, p1, p2, p3, n = 60) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}
// chain: [p0, c1, c2, p1, c1, c2, p2, ...]
function chainPts(ch, n = 60) {
  let out = [];
  for (let i = 0; i + 3 < ch.length; i += 3) {
    const seg = cubicPts(ch[i], ch[i + 1], ch[i + 2], ch[i + 3], n);
    out = out.concat(i ? seg.slice(1) : seg);
  }
  return out;
}
// Spiral curl: starts at angle a0 on radius r0 around (cx,cy) and winds
// inward by factor per turn; dir = 1 clockwise, -1 counter-clockwise.
function spiralPts(cx, cy, r0, a0, turns, shrink = 0.35, dir = 1, n = 120) {
  const out = [];
  const k = Math.log(1 / shrink) / (2 * Math.PI);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * turns * 2 * Math.PI;
    const r = r0 * Math.exp(-k * t);
    const a = a0 + dir * t;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}
// Ribbon outline from a polyline and a half-width function w(t).
function ribbon(pts, wf) {
  const n = pts.length;
  // arc-length param
  const len = [0];
  for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const T = len[n - 1] || 1;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    const w = wf(len[i] / T);
    L.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
    R.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  const all = L.concat(R.reverse());
  return 'M' + all.map(([x, y]) => `${r2(x)},${r2(y)}`).join('L') + 'Z';
}
const polyline = (pts) => 'M' + pts.map(([x, y]) => `${r2(x)},${r2(y)}`).join('L');

// Metallic gold gradient (userSpaceOnUse so every element shares one sheen).
function goldGrad(id, x1, y1, x2, y2, stops) {
  stops = stops || [
    [0, '#8A5A14'], [0.18, '#C9933A'], [0.36, '#F6D98C'], [0.47, '#FFF3C4'],
    [0.58, '#E7BC5E'], [0.78, '#A9741F'], [1, '#E9C774'],
  ];
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
    stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') + '</linearGradient>';
}

function svgDoc(inner, defs = '', size = 1080) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">\n<defs>${defs}</defs>\n${inner}\n</svg>\n`;
}

module.exports = {
  font, layout, text, inkBox, arcText, sparkle, heart, cubicPts, chainPts, spiralPts,
  ribbon, polyline, goldGrad, svgDoc, r2, xformPath, opentype,
};
