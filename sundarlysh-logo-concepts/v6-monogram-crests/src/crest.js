// Premium classic crests drawn from the wordmark's own letters: the original
// swash S woven with the original star-A, framed three ways, above the
// original wordmark.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

// Monogram in source-pixel space, then placed: group centre (812,720), height ~410.
function monogram(dark, sep, s, cx, cy) {
  const v = dark ? 'dark' : 'orig';
  const Sd = W.traced('S'), Ad = W.traced('Aonly');
  const sS = 0.77, sTx = 846 - sS * 314, sTy = 925 - sS * 1000;
  const T = `translate(${L.r2(cx - s * 790)},${L.r2(cy - s * 720)}) scale(${s.toFixed(4)})`;
  const Sfill = dark ? '#F7E9DA' : 'url(#wineM)';
  const Simg = `<path d="${Sd}" fill="${Sfill}" transform="translate(${L.r2(sTx)},${L.r2(sTy)}) scale(${sS})"/>`;
  const Ssep = `<path d="${Sd}" fill="none" stroke="${sep}" stroke-width="${(9 / sS).toFixed(1)}" transform="translate(${L.r2(sTx)},${L.r2(sTy)}) scale(${sS})"/>`;
  const GF = dark ? 'url(#goldD)' : 'url(#goldM)';
  const A = { defs: '', body: `<path d="${Ad}" fill="${GF}"/><path d="${L.heart(829, 806, 38)}" fill="url(#pink)"/>` };
  const Asep = `<path d="${Ad}" fill="none" stroke="${sep}" stroke-width="9"/>`;
  const body = `<g transform="${T}">${Simg}${Asep}${A.body}` +
    `<clipPath id="wvM"><rect x="812" y="636" width="50" height="70"/></clipPath><g clip-path="url(#wvM)">${Ssep}${Simg}</g></g>`;
  const defs = A.defs + `<linearGradient id="wineM" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="930"><stop offset="0" stop-color="#7A0A3C"/><stop offset="1" stop-color="#46041F"/></linearGradient>` +
    L.goldGrad('goldM', 0, 515, 0, 910, [[0, '#EBC66E'], [0.45, '#CF9A3A'], [1, '#9A6214']]);
  return { body, defs, map: (x, y) => [cx + s * (x - 790), cy + s * (y - 720)] };
}

function dp(bg, dark, sym, symDefs) {
  const wm = W.wordmark({ cx: C, top: 574, width: 790, variant: dark ? 'dark' : 'orig' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${symDefs}${wm.defs}</defs>` +
    `<rect width="1080" height="1080" fill="${bg}"/>${sym}${wm.body}</svg>\n`;
}

// 19 · Thread Seal — the gold thread leaves the star and circles the monogram
function threadSeal({ dark = false, bg = '#FFFFFF' } = {}) {
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const s = 0.86, cx = C, cy = 352;
  const M = monogram(dark, bg, s, cx, cy);
  const [scx, scy] = M.map(851, 560); // star centre
  const R = s * 186, oc = M.map(790, 742);
  const a0 = Math.atan2(scy - oc[1], scx - oc[0]);
  const pts = [];
  for (let i = 0; i <= 300; i++) { const a = a0 + 0.13 + (i / 300) * (2 * Math.PI - 0.26); pts.push([oc[0] + R * Math.cos(a), oc[1] + R * Math.sin(a)]); }
  const ring = L.ribbon(pts, (t) => 0.6 + 3.4 * Math.pow(Math.sin(Math.PI * t), 1.5));
  // ring behind letters, with a gap where the S crosses it
  return dp(bg, dark, `<path d="${ring}" fill="${GF}"/>` + M.body, M.defs);
}

// 20 · Flourish Crest — classic calligraphic swashes cradle the monogram
function flourishCrest({ dark = false, bg = '#FBF6EF' } = {}) {
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const s = 0.9, cx = C, cy = 330;
  const M = monogram(dark, bg, s, cx, cy);
  const by = cy + s * 215;
  let g = '';
  for (const sx of [-1, 1]) {
    const ch = [[cx + sx * 8, by + 8], [cx + sx * 70, by + 26], [cx + sx * 160, by + 10], [cx + sx * 196, by - 40]];
    g += `<path d="${B.flourish(ch, { r0: 26, turns: 1.1, shrink: 0.32, dir: sx === 1 ? -1 : 1, w0: 1.2, w1: 7, ball: 4 })}" fill="${GF}"/>`;
    const ch2 = [[cx + sx * 30, by + 26], [cx + sx * 80, by + 50], [cx + sx * 120, by + 46], [cx + sx * 132, by + 30]];
    g += `<path d="${B.flourish(ch2, { r0: 9, turns: 1, shrink: 0.35, dir: sx === 1 ? -1 : 1, w0: 0.8, w1: 3.4, ball: 2.6 })}" fill="${GF}"/>`;
  }
  g += `<path d="M${cx},${by + 18}l7,8l-7,8l-7,-8z" fill="url(#pink)"/>`;
  return dp(bg, dark, g + M.body, M.defs);
}

// 21 · Wine Medallion — the monogram in ivory and gold on a wine oval, like a foil stamp
function medallion({ bg = '#FBF6EF' } = {}) {
  const cx = C, cy = 346, rx = 150, ry = 186;
  const M = monogram(true, '#521030', 0.74, cx, cy + 6);
  let g = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#medal)"/>`;
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 9}" ry="${ry - 9}" fill="none" stroke="url(#goldD)" stroke-width="2.4"/>`;
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx + 9}" ry="${ry + 9}" fill="none" stroke="url(#goldR)" stroke-width="1.4"/>`;
  let beads = '';
  for (let i = 0; i < 64; i++) { const a = (i / 64) * 2 * Math.PI; beads += `<circle cx="${L.r2(cx + (rx - 17) * Math.cos(a))}" cy="${L.r2(cy + (ry - 17) * Math.sin(a))}" r="1.6"/>`; }
  g += `<g fill="url(#goldD)" opacity="0.8">${beads}</g>`;
  const defs = M.defs + `<radialGradient id="medal" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="#6E1238"/><stop offset="1" stop-color="#3E0820"/></radialGradient>`;
  return dp(bg, false, g + M.body, defs);
}

module.exports = { threadSeal, flourishCrest, medallion };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out7', { recursive: true });
  const set = {
    '19-thread-seal': threadSeal(), '19-thread-seal-dark': threadSeal({ dark: true, bg: '#4A0A24' }),
    '20-flourish-crest': flourishCrest(), '20-flourish-crest-dark': flourishCrest({ dark: true, bg: '#4A0A24' }),
    '21-wine-medallion': medallion(), '21-wine-medallion-white': medallion({ bg: '#FFFFFF' }),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out7/${n}.svg`, v);
}
