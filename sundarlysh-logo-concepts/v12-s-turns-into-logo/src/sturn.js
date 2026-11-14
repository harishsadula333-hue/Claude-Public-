// The S itself turns into the logo: Swan S, Peacock S, Silk Ribbon S.
// Shapes are drawn in the original S's own coordinate frame (x 62..314, y 642..1000)
// and mapped onto the enlarged S position by LM().
const L = require('./lib');
const B = require('./brand');
const { lockup } = require('./sfirst');

const cr = (P, n = 14) => { // Catmull-Rom
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); }
  }
  out.push(P[P.length - 1]); return out;
};
const path = (pts, close = true) => 'M' + pts.map(([x, y]) => `${L.r2(x)},${L.r2(y)}`).join('L') + (close ? 'Z' : '');

// S-frame neck/spine shared by swan and peacock: head end -> over the top -> down the spine
const NECK = [[292, 690], [280, 662], [248, 647], [208, 652], [174, 680], [162, 716], [178, 756], [222, 792], [268, 828], [300, 870]];

function neckRibbon(LM, sk, wHead, wMax) {
  const pts = cr(NECK).map((p) => LM(...p));
  return L.ribbon(pts, (t) => sk * (wHead + (wMax - wHead) * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + t * 0.85)), 1.6)) / 2);
}

// 37 · Swan S
function swanS(opts = {}) {
  return lockup({ ...opts, deco: ({ LM, sk, GF, WF, dark }) => {
    let g = `<path d="${neckRibbon(LM, sk, 9, 34)}" fill="${WF}"/>`;
    // head + beak + eye
    const h = LM(292, 688);
    g += `<ellipse cx="${L.r2(h[0])}" cy="${L.r2(h[1])}" rx="${L.r2(17 * sk)}" ry="${L.r2(13 * sk)}" fill="${WF}" transform="rotate(25 ${L.r2(h[0])} ${L.r2(h[1])})"/>`;
    const b0 = LM(302, 694), b1 = LM(326, 724), b2 = LM(296, 704);
    g += `<path d="M${L.r2(b0[0])},${L.r2(b0[1])}L${L.r2(b1[0])},${L.r2(b1[1])}L${L.r2(b2[0])},${L.r2(b2[1])}Z" fill="${GF}"/>`;
    const e = LM(290, 683); g += `<circle cx="${L.r2(e[0])}" cy="${L.r2(e[1])}" r="${L.r2(2.6 * sk)}" fill="${GF}"/>`;
    // body = the lower bowl of the S, tail rising at the left
    const body = cr([[300, 868], [314, 920], [292, 972], [236, 1000], [170, 1000], [112, 978], [74, 936], [62, 880], [74, 828], [96, 852], [126, 878], [176, 892], [236, 884], [290, 866]], 12).map((p) => LM(...p));
    g += `<path d="${path(body)}" fill="${WF}"/>`;
    // gold wing feathers engraved into the body
    let w = '';
    for (let i = 0; i < 5; i++) {
      const pts = cr([[286 - i * 4, 900 + i * 6], [240 - i * 6, 905 + i * 12], [180 - i * 10, 902 + i * 14], [120 - i * 8, 880 + i * 14], [84 + i * 2, 850 + i * 16]], 10).map((p) => LM(...p));
      w += `<path d="${L.ribbon(pts, (t) => sk * (0.6 + 1.6 * Math.sin(Math.PI * t)) / 2)}" fill="${GF}" opacity="${1 - i * 0.12}"/>`;
    }
    g += w;
    // tiny pink heart where the neck meets the breast, star above the head
    const hh = LM(316, 840); g += `<path d="${L.heart(hh[0], hh[1], 14 * sk)}" fill="url(#pink)"/>`;
    const st = LM(318, 646); g += `<path d="${B.star(st[0], st[1], 15 * sk, 0.1)}" fill="${GF}"/>`;
    return { noS: true, over: g };
  } });
}

// 38 · Peacock S
function peacockS2(opts = {}) {
  return lockup({ ...opts, deco: ({ LM, sk, GF, WF, dark }) => {
    let g = '';
    // tail: feather eyes fanned along the S's lower curve, gold barbs behind
    const cx = 188, cy = 906, R = 92;
    let barbs = '';
    const eyes = [];
    for (let i = 0; i < 9; i++) {
      const a = (-10 + i * 30) * (Math.PI / 180); // from right, round the bottom, up the left
      const p = [cx + R * Math.cos(a), cy + R * 0.95 * Math.sin(a)];
      eyes.push([p, a]);
      for (let j = -3; j <= 3; j++) { const aa = a + j * 0.06, q = [cx + (R + 20) * Math.cos(aa), cy + (R + 20) * 0.95 * Math.sin(aa)]; const P0 = LM(cx + 40 * Math.cos(a), cy + 40 * Math.sin(a)), Q = LM(...q); barbs += `M${L.r2(P0[0])},${L.r2(P0[1])}L${L.r2(Q[0])},${L.r2(Q[1])}`; }
    }
    g += `<path d="${barbs}" stroke="${GF}" stroke-width="${L.r2(0.7 * sk)}" opacity="0.7"/>`;
    const arcPts = []; for (let i = 0; i <= 80; i++) { const a = (-25 + (i / 80) * 262) * (Math.PI / 180); arcPts.push(LM(cx + (R - 6) * Math.cos(a), cy + (R - 6) * 0.95 * Math.sin(a))); }
    arcPts.unshift(LM(300, 868));
    g += `<path d="${L.ribbon(arcPts, (t) => sk * (2 + 9 * Math.sin(Math.PI * Math.min(1, t * 1.15))) / 2)}" fill="${WF}"/>`;
    for (const [p, a] of eyes) {
      const c = LM(...p), rot = (a * 180) / Math.PI + 90;
      const drop = (w, h, fill) => `<path d="M0,${-h * 0.6}C${w},${-h * 0.2} ${w * 0.8},${h * 0.4} 0,${h * 0.4}C${-w * 0.8},${h * 0.4} ${-w},${-h * 0.2} 0,${-h * 0.6}Z" fill="${fill}"/>`;
      g += `<g transform="translate(${L.r2(c[0])},${L.r2(c[1])}) rotate(${L.r2(rot + 180)}) scale(${(sk).toFixed(3)})">${drop(16, 40, GF)}${drop(11, 28, WF)}${drop(5.5, 14, dark ? '#F3D58E' : '#E8275E')}</g>`;
    }
    // neck + head + crest
    g += `<path d="${neckRibbon(LM, sk, 9, 30)}" fill="${WF}"/>`;
    const h = LM(292, 688);
    g += `<ellipse cx="${L.r2(h[0])}" cy="${L.r2(h[1])}" rx="${L.r2(15 * sk)}" ry="${L.r2(12 * sk)}" fill="${WF}"/>`;
    const b0 = LM(304, 692), b1 = LM(322, 704), b2 = LM(302, 702);
    g += `<path d="M${L.r2(b0[0])},${L.r2(b0[1])}L${L.r2(b1[0])},${L.r2(b1[1])}L${L.r2(b2[0])},${L.r2(b2[1])}Z" fill="${GF}"/>`;
    for (const [dx, dy] of [[-10, -34], [0, -38], [10, -34]]) { const a0 = LM(290, 678), a1 = LM(290 + dx, 678 + dy); g += `<path d="M${L.r2(a0[0])},${L.r2(a0[1])}L${L.r2(a1[0])},${L.r2(a1[1])}" stroke="${GF}" stroke-width="${L.r2(1.4 * sk)}"/><circle cx="${L.r2(a1[0])}" cy="${L.r2(a1[1])}" r="${L.r2(3.4 * sk)}" fill="${GF}"/>`; }
    const e = LM(290, 686); g += `<circle cx="${L.r2(e[0])}" cy="${L.r2(e[1])}" r="${L.r2(2.4 * sk)}" fill="${GF}"/>`;
    return { noS: true, over: g };
  } });
}

// 39 · Silk Ribbon S — a twisting ribbon, wine face and gold reverse, ending in a heart
function ribbonS(opts = {}) {
  return lockup({ ...opts, deco: ({ LM, sk, GF, WF }) => {
    const spine = cr([[302, 700], [296, 662], [252, 646], [204, 652], [170, 682], [162, 720], [186, 760], [236, 798], [286, 838], [308, 892], [292, 956], [236, 996], [166, 998], [104, 970], [72, 920], [80, 868], [118, 840]], 16).map((p) => LM(...p));
    const n = spine.length;
    // twist: width follows |cos| of a phase that passes zero three times
    const phase = (t) => Math.PI * (0.15 + 3.0 * t);
    let g = '';
    const W0 = (t) => sk * 15 * Math.cos(phase(t));
    const off = spine.map((p, i) => { const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; return [-ty / m, tx / m]; });
    let run = [0];
    const flush = (ids) => {
      if (ids.length < 2) return;
      const mid = ids[Math.floor(ids.length / 2)], front = W0(mid / (n - 1)) > 0;
      const Lft = ids.map((i) => { const w = W0(i / (n - 1)); return [spine[i][0] + off[i][0] * w, spine[i][1] + off[i][1] * w]; });
      const Rgt = ids.map((i) => { const w = W0(i / (n - 1)); return [spine[i][0] - off[i][0] * w, spine[i][1] - off[i][1] * w]; }).reverse();
      g += `<path d="${path(Lft.concat(Rgt))}" fill="${front ? WF : GF}"/>`;
    };
    for (let i = 1; i < n; i++) {
      const sameSign = Math.sign(W0(i / (n - 1))) === Math.sign(W0((i - 1) / (n - 1)));
      run.push(i);
      if (!sameSign) { flush(run); run = [i]; }
    }
    flush(run);
    // fine gold edges
    const edge = (sgn) => path(spine.map((p, i) => { const t = i / (n - 1), w = sk * 15 * Math.cos(phase(t)) * sgn; const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m; return [p[0] - ty * w, p[1] + tx * w]; }), false);
    g += `<path d="${edge(1)}" fill="none" stroke="${GF}" stroke-width="1"/><path d="${edge(-1)}" fill="none" stroke="${GF}" stroke-width="1"/>`;
    const e = spine[n - 1]; g += `<path d="${L.heart(e[0] + 4, e[1] - 6, 30 * sk / 2.2)}" fill="url(#pink)"/>`;
    const st = spine[0]; g += `<path d="${B.star(st[0] + 6, st[1] - 26, 26, 0.1)}" fill="${GF}"/>`;
    return { noS: true, over: g };
  } });
}

module.exports = { swanS, peacockS2, ribbonS };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out13', { recursive: true });
  const set = {
    '37-swan-s': swanS(), '37-swan-s-dark': swanS({ dark: true, bg: '#4A0A24' }),
    '38-peacock-s': peacockS2(), '38-peacock-s-dark': peacockS2({ dark: true, bg: '#4A0A24' }),
    '39-silk-ribbon-s': ribbonS({ bg: '#FBF6EF' }), '39-silk-ribbon-s-dark': ribbonS({ dark: true, bg: '#4A0A24' }),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out13/${n}.svg`, v);
}
