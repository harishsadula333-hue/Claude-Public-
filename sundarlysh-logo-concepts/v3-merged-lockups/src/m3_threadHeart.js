// Merged lockup 3 — "Dil-Dhaaga" (heart thread): the brand thread grows into one
// big heart that holds the whole wordmark. The star of the A sits in the heart's
// cleft; the left lobe is wine (Sundar), the right lobe gold (lysh); the heart
// weaves behind the swash S and under the swoosh.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');

function heartHalf(cx, cy, k, sx, kx = 1, ky = 1) {
  // classic heart curve; cleft at t=0, point at t=pi; (0,5) is the cleft
  const pts = [];
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * Math.PI;
    const u = 16 * Math.pow(Math.sin(t), 3);
    const v = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + sx * kx * k * u, cy + ky * k * (5 - v)]);
  }
  return pts;
}
// calligraphic width: thin at the cleft, swelling on the lobes' outer sides, fine at the point
const wHeart = (t) => 0.6 + 4.6 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 1.4) * (t < 0.15 ? t / 0.15 : 1);

module.exports = function build({ dark = false } = {}) {
  const s = 0.55, Ys = 352, cx = 540, k = 26.5, kx = 0.93, ky = 0.88;
  const v = dark ? 'dark' : 'orig';
  const bgFlat = dark ? '#4A0A26' : '#FFFFFF';
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="46%" r="72%">${dark
      ? '<stop offset="0" stop-color="#4A0A26"/><stop offset="0.7" stop-color="#4A0A26"/><stop offset="1" stop-color="#2E0617"/>'
      : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.7" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F7EEE4"/>'}</radialGradient>` +
    `<linearGradient id="wineH" gradientUnits="userSpaceOnUse" x1="0" y1="${Ys - 180}" x2="0" y2="${Ys + 580}"><stop offset="0" stop-color="${dark ? '#FFF6EA' : '#7A0A3C'}"/><stop offset="1" stop-color="${dark ? '#EAD6C0' : '#46041F'}"/></linearGradient>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);

  // the heart thread (behind the letters)
  const left = heartHalf(cx, Ys, k, -1, kx, ky), right = heartHalf(cx, Ys, k, 1, kx, ky);
  g.push(`<path d="${L.ribbon(left, wHeart)}" fill="url(#wineH)"/>`);
  g.push(`<path d="${L.ribbon(right, wHeart)}" fill="${GF}"/>`);

  // wordmark parts in their original arrangement, star centred in the cleft
  const ox = cx - s * 851, oy = Ys + 4 - s * 562;
  const parts = ['SUND', 'Astar', 'Rlysh'].map((n) => W.place(n, v, s, ox, oy));
  // hairline gap so the heart passes cleanly behind the letters
  for (const p of parts) g.push(`<path d="${p.d}" fill="none" stroke="${bgFlat}" stroke-width="${(9 / s).toFixed(1)}" stroke-linejoin="round" transform="${p.transform}"/>`);
  for (const p of parts) g.push(p.body);
  // a crisp star over the cleft
  g.push(`<path d="${B.star(cx, Ys - 6, 40)}" fill="${GF}"/>`);

  // tagline inside the lower heart
  const tagS = 0.37, tagY = Ys + 296;
  const tox = cx - tagS * (222 + 1393) / 2, toy = tagY - tagS * 1085;
  const tag = W.place('tag', v, tagS, tox, toy);
  g.push(tag.body);
  return L.svgDoc(g.join('\n'), defs + parts.map((p) => p.defs).join('') + tag.defs);
};
