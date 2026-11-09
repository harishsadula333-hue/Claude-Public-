// Concept 2 — "S-Scroll Monogram": a baroque S-scroll drawn with a broad-nib
// pen, paired with a hairline outlined L; heart tucked in the top curl.
const L = require('./lib');

// Broad-nib ribbon: width depends on stroke direction relative to pen angle.
function penRibbon(pts, { wmin, wmax, pen, taper }) {
  const n = pts.length;
  const len = [0];
  for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const T = len[n - 1];
  const Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 2)], b = pts[Math.min(n - 1, i + 2)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const th = Math.atan2(ty, tx);
    const w = (wmin + (wmax - wmin) * Math.abs(Math.sin(th - pen))) * taper(len[i] / T) / 2;
    Lp.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
    Rp.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  const all = Lp.concat(Rp.reverse());
  return 'M' + all.map(([x, y]) => `${L.r2(x)},${L.r2(y)}`).join('L') + 'Z';
}

// spiral that continues from point P heading in direction D, turning right (clockwise on screen)
function curlFrom(P, D, r0, turns, shrink) {
  const m = Math.hypot(D[0], D[1]); const dx = D[0] / m, dy = D[1] / m;
  const C = [P[0] - dy * r0, P[1] + dx * r0];
  const a0 = Math.atan2(P[1] - C[1], P[0] - C[0]);
  return L.spiralPts(C[0], C[1], r0, a0, turns, shrink, 1, 140);
}

function sScroll(ox, oy, s) {
  const P = (x, y) => [ox + x * s, oy + y * s];
  const body = [
    P(64, -126), P(48, -166), P(16, -182), P(-14, -182),
    P(-58, -182), P(-92, -150), P(-92, -106),
    P(-92, -56), P(-50, -38), P(0, 0),
    P(50, 38), P(92, 56), P(92, 106),
    P(92, 150), P(58, 182), P(14, 182),
    P(-16, 182), P(-48, 166), P(-64, 126),
  ];
  const bodyPts = L.chainPts(body, 80);
  const A = body[0], A1 = body[1];
  const top = curlFrom(A, [A[0] - A1[0], A[1] - A1[1]], 44 * s, 1.05, 0.32);
  const F = body[body.length - 1], F1 = body[body.length - 2];
  const bot = curlFrom(F, [F[0] - F1[0], F[1] - F1[1]], 44 * s, 1.05, 0.32);
  const pts = top.slice().reverse().concat(bodyPts.slice(1), bot.slice(1));
  const taper = (t) => {
    const e = 0.26;
    const a = t < e ? Math.pow(t / e, 1.25) : 1;
    const b = t > 1 - e ? Math.pow((1 - t) / e, 1.25) : 1;
    return 0.12 + 0.88 * Math.min(a, b);
  };
  const d = penRibbon(pts, { wmin: 2.6 * s, wmax: 27 * s, pen: -0.42, taper });
  const inline = penRibbon(pts, { wmin: 0, wmax: 2.4 * s, pen: -0.42, taper: (t) => Math.max(0, taper(t) - 0.35) / 0.65 });
  return { d, inline, topEnd: top[top.length - 1], botEnd: bot[bot.length - 1] };
}

module.exports = function build() {
  const CX = 540;
  const defs =
    `<radialGradient id="bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#FFFDF9"/><stop offset="1" stop-color="#F6EEE2"/></radialGradient>` +
    L.goldGrad('gold', 330, 230, 760, 640, [
      [0, '#9A6418'], [0.25, '#D4A043'], [0.45, '#F3D58A'], [0.55, '#E2B357'], [0.8, '#A87118'], [1, '#D7AE58'],
    ]) +
    `<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0457A"/><stop offset="1" stop-color="#C0103F"/></linearGradient>`;

  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);

  // Outlined L (hairline) — placed first so the S overlaps it
  const LS = 500;
  const Lg = L.text('cinzel400', 'L', 0, 0, LS, { anchor: 'start' });
  const lx = 514 - Lg.bbox.x1, ly = 612; // baseline
  const Lpath = L.text('cinzel400', 'L', lx, ly, LS, { anchor: 'start' });
  g.push(`<path d="${Lpath.d}" fill="none" stroke="url(#gold)" stroke-width="2.6" stroke-linejoin="round"/>`);

  // S-scroll
  const S = sScroll(432, 436, 0.98);
  // ivory knock-out halo so the S sits "in front" of the L
  g.push(`<path d="${S.d}" fill="#FCF8F2" stroke="#FCF8F2" stroke-width="14" stroke-linejoin="round"/>`);
  g.push(`<path d="${S.d}" fill="url(#gold)"/>`);
  g.push(`<path d="${S.inline}" fill="#FFF8E6" opacity="0.85"/>`);
  // heart in the top curl, gold ball in the bottom curl
  g.push(`<path d="${L.heart(S.topEnd[0], S.topEnd[1] + 1, 24)}" fill="url(#pink)"/>`);
  g.push(`<circle cx="${S.botEnd[0]}" cy="${S.botEnd[1]}" r="5.5" fill="url(#gold)"/>`);
  // star finial above S
  g.push(`<path d="${L.sparkle(432 - 14, 226, 30, 16, 0.12)}" fill="url(#gold)"/>`);

  // Name + tagline
  const name = L.text('marcellus', 'SUNDARLYSH', CX, 742, 62, { ls: 0.16 });
  g.push(`<path d="${name.d}" fill="#7A1034"/>`);
  const tag = L.text('cinzel500', 'CARE WITH STYLE', CX, 798, 25, { ls: 0.45 });
  g.push(`<path d="${tag.d}" fill="url(#gold)"/>`);
  const th = tag.width / 2, y = 790;
  g.push(`<rect x="${CX - th - 100}" y="${y}" width="78" height="1.5" fill="url(#gold)"/><rect x="${CX + th + 22}" y="${y}" width="78" height="1.5" fill="url(#gold)"/>`);
  return L.svgDoc(g.join('\n'), defs);
};
