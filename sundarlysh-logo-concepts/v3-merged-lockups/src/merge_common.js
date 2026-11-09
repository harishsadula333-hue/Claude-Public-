// Shared layout for the merged lockups: SUND · [hero A] · Rlysh on one baseline,
// the A's thin leg running on into the brand thread under SUND, and the thread
// arc from the top of the A into the "l" of lysh.
const L = require('./lib');
const W = require('./wordmark');

function layout({ s = 0.52, Yb = 748, H = 420, A = 116, gapL = 4, gapR = 10, cx0 = 540 }) {
  const sundW = (749 - 62) * s, rlW = (1495 - 928) * s;
  const leftReach = 0.74 * A + gapL;
  const rightReach = 0.62 * A + 0.27 * A * 1.05 + gapR;
  const total = sundW + leftReach + rightReach + rlW;
  const XL = cx0 - total / 2;
  const cx = XL + sundW + leftReach;
  const XR = cx + rightReach;
  const oy = Yb - s * 905;
  return {
    s, Yb, H, A, XL, cx, XR, oy, Ya: Yb - H,
    oxS: XL - s * 62, oxR: XR - s * 928,
    lTop: [XR + (1183 - 928) * s, oy + 656 * s],
  };
}

function text(G, variant) {
  const a = W.place('SUND', variant, G.s, G.oxS, G.oy);
  const b = W.place('Rlysh', variant, G.s, G.oxR, G.oy);
  return { defs: a.defs + b.defs, body: a.body + b.body, parts: [a, b] };
}

function tagline(variant, s, cx, baseline) {
  // source tag ink spans x 222..1393, y 1045..1085
  const ox = cx - s * (222 + 1393) / 2, oy = baseline - s * 1085;
  return W.place('tag', variant, s, ox, oy);
}

// thread continuing from the A's left-leg foot, under SUND, to a fine tip
function swoosh(G, footPt, w0, tip = [G.XL + 66, G.Yb + 84]) {
  const pts = L.cubicPts(footPt, [footPt[0] - 70, footPt[1] + 26], [G.XL + 330, G.Yb + 50], tip, 120);
  return L.ribbon(pts, (t) => w0 * Math.pow(1 - t, 1.15) + 0.35);
}

// arc from a start point into the top of the "l"
function arc(G, from, lift = 150) {
  const to = G.lTop;
  const pts = L.cubicPts(from, [from[0] + 120, from[1] - 34], [to[0] - 10, to[1] - lift], [to[0] - 3, to[1] + 2], 120);
  return L.ribbon(pts, (t) => 0.7 + 1.0 * Math.sin(Math.PI * Math.min(1, t * 1.1)));
}

function legGradient(id, G, top, tip) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${top[0]}" y1="${top[1]}" x2="${tip[0]}" y2="${tip[1]}">` +
    `<stop offset="0" stop-color="#6E0A38"/><stop offset="0.4" stop-color="#4E0526"/><stop offset="0.66" stop-color="#B07A26"/><stop offset="1" stop-color="#E9BC5E"/></linearGradient>`;
}

// the A's crossbar running on over the R and into the top of the "l"
function bridge(G, from, rise = 46) {
  const to = G.lTop;
  const pts = L.cubicPts(from, [from[0] + (to[0] - from[0]) * 0.35, from[1] - rise], [to[0] - 40, to[1] - rise * 1.1], [to[0] - 2, to[1] + 3], 120);
  return L.ribbon(pts, (t) => 1.0 + 0.6 * Math.sin(Math.PI * t));
}

module.exports = { layout, text, tagline, swoosh, arc, bridge, legGradient };
