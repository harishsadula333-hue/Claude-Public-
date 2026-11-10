// Pictorial symbols that grow out of the star of the A in the original
// wordmark, drawn with the same gold thread: Lotus, Butterfly, Peacock Feather.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540, s = 0.56;

function penRibbon(pts, { wmin, wmax, pen = -0.6, taper = () => 1, closed = false }) {
  const n = pts.length, Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const w = (wmin + (wmax - wmin) * Math.abs(Math.sin(Math.atan2(ty, tx) - pen))) * taper(i / (n - 1)) / 2;
    Lp.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); Rp.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  const f = (arr) => arr.map(([x, y]) => `${L.r2(x)},${L.r2(y)}`).join('L');
  return closed ? `M${f(Lp)}ZM${f(Rp.reverse())}Z` : `M${f(Lp)}L${f(Rp.reverse())}Z`;
}
const closedPts = (ch, n = 50) => { const p = L.chainPts(ch, n); p.pop(); return p; };

function scene(dark, bg, symbol) {
  const v = dark ? 'dark' : 'orig';
  const sy = 556; // star centre on canvas
  const ox = C - s * 851, oy = sy - s * 560;
  const a = W.place('main', v, s, ox, oy), t = W.place('tag', v, s, ox, oy);
  const tip = [C, oy + s * 517]; // top tip of the star
  const sym = symbol(tip, dark);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${sym.defs || ''}${a.defs}${t.defs}` +
    `<linearGradient id="wineS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A1446"/><stop offset="1" stop-color="#4A0624"/></linearGradient></defs>` +
    `<rect width="1080" height="1080" fill="${bg}"/>${sym.svg}${a.body}${t.body}</svg>\n`;
}

// thread stem from the star tip up to y
function stem(tip, toY, bend, GF) {
  const pts = L.cubicPts(tip, [tip[0], tip[1] - 30], [tip[0] + bend, toY + 40], [tip[0], toY], 60);
  return `<path d="${L.ribbon(pts, (t) => 0.5 + 1.6 * Math.sin(Math.PI * t * 0.9 + 0.1))}" fill="${GF}"/>`;
}

// 22 · Lotus
function lotus(dark, bg) {
  return scene(dark, bg, (tip, dk) => {
    const GF = dk ? 'url(#goldD)' : 'url(#goldR)', WF = dk ? '#F3E3D3' : 'url(#wineS)';
    const bx = C, by = tip[1] - 64;
    let g = stem(tip, by, 10, GF);
    const petal = (len, wid, deg, fill, edge, wmax) => {
      const t = (deg * Math.PI) / 180, c = Math.cos(t), sn = Math.sin(t);
      const P = (x, y) => [bx + x * c - y * sn, by + x * sn + y * c];
      const ch = [P(0, 0), P(-wid, -len * 0.38), P(-wid * 0.8, -len * 0.86), P(0, -len), P(wid * 0.8, -len * 0.86), P(wid, -len * 0.38), P(0, 0)];
      const pts = closedPts(ch, 60);
      return `<path d="${L.polyline(pts)}Z" fill="${fill}"/>` + `<path d="${penRibbon(pts, { wmin: 1.2, wmax: wmax, closed: true })}" fill="${edge}" fill-rule="evenodd"/>`;
    };
    g += petal(118, 50, -70, WF, GF, 5) + petal(118, 50, 70, WF, GF, 5);
    g += petal(158, 54, -36, WF, GF, 5.5) + petal(158, 54, 36, WF, GF, 5.5);
    g += petal(205, 60, 0, dk ? '#E9C676' : 'url(#goldR)', dk ? '#FFF1C9' : '#8E5A12', 3);
    g += `<path d="${L.heart(bx, by - 74, 38)}" fill="url(#pink)" stroke="${dk ? '#FFF1C9' : '#FFFFFF'}" stroke-width="2"/>`;
    // water line: thread sweeping left and right under the bloom
    for (const sx of [-1, 1]) g += `<path d="${L.ribbon(L.cubicPts([bx, by + 4], [bx + sx * 80, by + 16], [bx + sx * 170, by + 8], [bx + sx * 230, by - 14], 60), (t) => 2.2 * (1 - t) + 0.4)}" fill="${GF}"/>`;
    return { svg: g };
  });
}

// 23 · Butterfly
function butterfly(dark, bg) {
  return scene(dark, bg, (tip, dk) => {
    const GF = dk ? 'url(#goldD)' : 'url(#goldR)', WF = dk ? '#F3E3D3' : 'url(#wineS)';
    const bx = C, by = tip[1] - 150; // body centre
    let g = stem(tip, by + 70, -8, GF);
    const wing = (size, deg, dy, fill, st = GF) => {
      const pv = [bx, by + dy];
      const d = L.heart(bx, by + dy - size * 0.47, size, deg, pv);
      return `<path d="${d}" fill="${fill}" stroke="${st}" stroke-width="3.2" stroke-linejoin="round"/>` +
        `<path d="${L.heart(bx, by + dy - size * 0.47 * 0.62, size * 0.58, deg, pv)}" fill="none" stroke="${st}" stroke-width="1.4"/>`;
    };
    g += wing(176, -64, -10, WF) + wing(176, 64, -10, WF);
    const lw = dk ? '#E3BD68' : 'url(#goldR)', ls = dk ? '#FFF1C9' : '#7A0A3C';
    g += wing(112, -124, 22, lw, ls) + wing(112, 124, 22, lw, ls);
    // body
    g += `<path d="M${bx},${by - 62}C${bx + 9},${by - 40} ${bx + 9},${by + 40} ${bx},${by + 72}C${bx - 9},${by + 40} ${bx - 9},${by - 40} ${bx},${by - 62}Z" fill="${GF}"/>`;
    // antennae
    for (const sx of [-1, 1]) g += `<path d="${B.flourish([[bx + sx * 2, by - 58], [bx + sx * 10, by - 90], [bx + sx * 26, by - 112], [bx + sx * 44, by - 118]], { r0: 7, turns: 0.9, dir: sx === 1 ? 1 : -1, w0: 0.8, w1: 2.2, ball: 2.6 })}" fill="${GF}"/>`;
    g += `<path d="${L.heart(bx, by - 8, 26)}" fill="url(#pink)"/>`;
    return { svg: g };
  });
}

// 24 · Peacock Feather
function feather(dark, bg) {
  return scene(dark, bg, (tip, dk) => {
    const GF = dk ? 'url(#goldD)' : 'url(#goldR)', WF = dk ? '#F3E3D3' : 'url(#wineS)';
    const topY = tip[1] - 330;
    const shaft = L.cubicPts(tip, [tip[0] - 4, tip[1] - 110], [tip[0] + 26, topY + 150], [tip[0] + 6, topY + 40], 120);
    let g = '';
    // barbs: fine gold hairlines sweeping up and out, longest near the eye
    let barbs = '';
    for (let i = 14; i < 112; i += 3) {
      const p = shaft[i], q = shaft[i + 2], tx = q[0] - p[0], ty = q[1] - p[1], m = Math.hypot(tx, ty);
      const u = i / 112, len = 6 + 92 * Math.pow(u, 1.7);
      for (const sx of [-1, 1]) {
        const nx = (-ty / m) * sx, ny = (tx / m) * sx;
        const e = [p[0] + nx * len + (tx / m) * len * 0.9, p[1] + ny * len + (ty / m) * len * 0.9];
        barbs += `M${L.r2(p[0])},${L.r2(p[1])}Q${L.r2(p[0] + nx * len * 0.6)},${L.r2(p[1] + ny * len * 0.6)} ${L.r2(e[0])},${L.r2(e[1])}`;
      }
    }
    g += `<path d="${barbs}" fill="none" stroke="${GF}" stroke-width="1.2" opacity="0.85"/>`;
    g += `<path d="${L.ribbon(shaft, (t) => 2.4 * (1 - t) + 0.6)}" fill="${GF}"/>`;
    // the eye: layered teardrops
    const ex = shaft[100][0], ey = shaft[100][1] - 22;
    const drop = (w, h, fill, stroke, sw) => `<path d="M${ex},${L.r2(ey - h * 0.62)}C${L.r2(ex + w)},${L.r2(ey - h * 0.2)} ${L.r2(ex + w * 0.8)},${L.r2(ey + h * 0.38)} ${ex},${L.r2(ey + h * 0.38)}C${L.r2(ex - w * 0.8)},${L.r2(ey + h * 0.38)} ${L.r2(ex - w)},${L.r2(ey - h * 0.2)} ${ex},${L.r2(ey - h * 0.62)}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    g += drop(70, 150, dk ? '#3E0820' : '#FFFFFF', GF, 3.4) + drop(52, 112, WF, GF, 2) + drop(30, 66, dk ? '#E3BD68' : 'url(#goldR)', 'none', 0);
    g += `<path d="${L.heart(ex, ey + 2, 26)}" fill="url(#pink)"/>`;
    return { svg: g };
  });
}

module.exports = { lotus, butterfly, feather };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out8', { recursive: true });
  const set = {
    '22-lotus-thread': lotus(false, '#FFFFFF'), '22-lotus-thread-dark': lotus(true, '#4A0A24'),
    '23-butterfly-thread': butterfly(false, '#FBF4F1'), '23-butterfly-thread-dark': butterfly(true, '#4A0A24'),
    '24-peacock-thread': feather(false, '#FFFFFF'), '24-peacock-thread-dark': feather(true, '#4A0A24'),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out8/${n}.svg`, v);
}
