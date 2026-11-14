// Brand drawing kit shared by the "letter-linked" emblem concepts.
const L = require('./lib');

const P = {
  wineTop: '#7A0A3C', wine: '#5A0630', wineDeep: '#3E0420',
  goldLight: '#F1CF7E', gold: '#DFAA49', goldDeep: '#B37A1C',
  pink: '#E8275E', ivory: '#FFFBF5',
};

function defs() {
  return (
    L.goldGrad('gold', 0, 120, 0, 900, [
      [0, '#F3D58E'], [0.25, '#E2AE4D'], [0.5, '#F0CB76'], [0.75, '#C38A2A'], [1, '#B07418'],
    ]) +
    L.goldGrad('goldD', 260, 140, 820, 860, [
      [0, '#9A6418'], [0.2, '#D9A848'], [0.42, '#F8E09A'], [0.55, '#E2B357'], [0.8, '#A87118'], [1, '#E2BC6A'],
    ]) +
    L.goldGrad('goldR', 260, 140, 820, 860, [
      [0, '#9A6214'], [0.22, '#CF9A3A'], [0.42, '#EBC66E'], [0.55, '#D39F42'], [0.8, '#996112'], [1, '#C9963F'],
    ]) +
    `<linearGradient id="wine" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="600"><stop offset="0" stop-color="${P.wineTop}"/><stop offset="1" stop-color="${P.wineDeep}"/></linearGradient>` +
    `<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5486"/><stop offset="1" stop-color="#D3134A"/></linearGradient>` +
    `<radialGradient id="pearl" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#F6E9D6"/><stop offset="1" stop-color="#CDB48E"/></radialGradient>`
  );
}

// The brand's star: long top ray, shorter bottom & side rays.
function star(cx, cy, s, k = 0.11) {
  const t = s, b = s * 0.62, w = s * 0.5;
  const r = L.r2;
  return `M${r(cx)},${r(cy - t)}Q${r(cx + w * k)},${r(cy - t * k)} ${r(cx + w)},${r(cy)}Q${r(cx + w * k)},${r(cy + b * k)} ${r(cx)},${r(cy + b)}` +
    `Q${r(cx - w * k)},${r(cy + b * k)} ${r(cx - w)},${r(cy)}Q${r(cx - w * k)},${r(cy - t * k)} ${r(cx)},${r(cy - t)}Z`;
}

// Spiral continuing from point P with heading D, turning clockwise (dir=1) or ccw (-1)
function curlFrom(Pt, D, r0, turns, shrink, dir = 1) {
  const m = Math.hypot(D[0], D[1]); const dx = D[0] / m, dy = D[1] / m;
  const C = dir === 1 ? [Pt[0] - dy * r0, Pt[1] + dx * r0] : [Pt[0] + dy * r0, Pt[1] - dx * r0];
  const a0 = Math.atan2(Pt[1] - C[1], Pt[0] - C[0]);
  return L.spiralPts(C[0], C[1], r0, a0, turns, shrink, dir, 140);
}

// A tapered flourish: a cubic chain that ends in a spiral curl, as a filled ribbon.
function flourish(chain, { r0 = 18, turns = 1, shrink = 0.35, dir = 1, w0 = 1, w1 = 6, ball = 3.5 } = {}) {
  const pts = L.chainPts(chain, 60);
  const n = chain.length;
  const D = [chain[n - 1][0] - chain[n - 2][0], chain[n - 1][1] - chain[n - 2][1]];
  const sp = curlFrom(chain[n - 1], D, r0, turns, shrink, dir);
  const all = pts.concat(sp.slice(1));
  const d = L.ribbon(all, (t) => {
    const rise = Math.min(1, t / 0.25);
    const fall = t > 0.55 ? Math.max(0.12, 1 - (t - 0.55) / 0.45) : 1;
    return (w0 + (w1 - w0) * Math.sin((rise * Math.PI) / 2)) * fall / 2 + 0.5;
  });
  const e = sp[sp.length - 1];
  return d + (ball ? `M${L.r2(e[0] + ball)},${L.r2(e[1])}a${ball},${ball} 0 1 0 ${-2 * ball},0a${ball},${ball} 0 1 0 ${2 * ball},0Z` : '');
}

// The signature A: thin flaring left leg, thick right leg, star at apex,
// heart on the left leg with a gold crossbar. Returns geometry + markup parts.
function brandA({ cx, apexY, baseY, halfW, legFill = 'url(#wine)', leftFill, starFill = 'url(#gold)', barFill = 'url(#gold)', heartFill = 'url(#pink)', starSize, thick = 1, mirror = false, heart = true, barT = 0.68, heartSize, tail = 0 }) {
  const H = baseY - apexY, W = halfW;
  const sx = mirror ? -1 : 1;
  const X = (dx) => cx + sx * dx;
  const r = L.r2;
  // left (thin) leg centreline: steep, flaring outward at the bottom
  const legPts = L.cubicPts([X(0), apexY + 4], [X(-0.06 * W), apexY + 0.5 * H], [X(-0.34 * W), apexY + 0.88 * H], [X(-1.0 * W), baseY], 90);
  let left = L.ribbon(legPts, (t) => (1.2 + 2.6 * t) * Math.max(0.6, W / 110));
  if (tail) {
    // the leg sweeps on into the brand's golden thread, tapering to a hairline
    const e = legPts[legPts.length - 1], q = legPts[legPts.length - 4];
    const d = [e[0] - q[0], e[1] - q[1]]; const m = Math.hypot(d[0], d[1]);
    const tp = L.cubicPts(e, [e[0] + (d[0] / m) * 34, e[1] + (d[1] / m) * 34], [X(-1.0 * W) - sx * 0.55 * tail, baseY + 30], [X(-1.0 * W) - sx * tail, baseY - 14], 80);
    const w0 = 3.8 * Math.max(0.6, W / 110);
    left += L.ribbon(tp, (t) => w0 * Math.pow(1 - t, 1.2) + 0.35);
  }
  // right (thick) leg as a filled wedge with a gently concave outer edge
  const tw = 0.27 * W * thick;
  const a = [X(1.5), apexY + 2], b = [X(5), apexY + 6];
  const fl = [X(0.62 * W - tw * 0.55), baseY], fr = [X(0.62 * W + tw * 0.55), baseY];
  const right = `M${r(a[0])},${r(a[1])}C${r(X(0.2 * W))},${r(apexY + 0.4 * H)} ${r(X(0.42 * W - tw * 0.4))},${r(apexY + 0.8 * H)} ${r(fl[0])},${r(fl[1])}` +
    `L${r(X(0.62 * W - tw * 0.9))},${r(baseY + 2)}L${r(X(0.62 * W + tw * 1.05))},${r(baseY + 2)}L${r(fr[0])},${r(fr[1])}` +
    `C${r(X(0.5 * W + tw * 0.2))},${r(apexY + 0.72 * H)} ${r(X(0.22 * W))},${r(apexY + 0.3 * H)} ${r(b[0])},${r(b[1])}Z`;
  // crossbar height and positions
  const by = apexY + barT * H;
  const tLeg = barT; // approx param on left leg
  const lp = legPts[Math.round(tLeg * 90)];
  const xr = X(0.5 * W * barT + 0.08 * W);
  const hs = heartSize || Math.max(16, 0.32 * W);
  const parts = [];
  parts.push(`<path d="${left}" fill="${leftFill || legFill}"/>`);
  parts.push(`<path d="${right}" fill="${legFill}"/>`);
  const x1 = Math.min(lp[0], xr), x2 = Math.max(lp[0], xr);
  parts.push(`<rect x="${r(x1)}" y="${r(by - 1.1)}" width="${r(x2 - x1)}" height="2.2" fill="${barFill}"/>`);
  if (heart) parts.push(`<path d="${L.heart(lp[0], by + hs * 0.06, hs)}" fill="${heartFill}"/>`);
  const ss = starSize || Math.max(22, 0.42 * W);
  parts.push(`<path d="${star(cx, apexY - ss * 0.05, ss)}" fill="${starFill}"/>`);
  return { svg: parts.join(''), legPts, barY: by, heartAt: [lp[0], by], apex: [cx, apexY], rightFoot: X(0.62 * W + tw * 1.05), legW: 3.8 * Math.max(0.6, W / 110), xr };
}

module.exports = { P, defs, star, curlFrom, flourish, brandA };
