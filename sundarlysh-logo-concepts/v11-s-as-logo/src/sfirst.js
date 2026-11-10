// The first letter S becomes the logo inside the word: an enlarged, decorated S
// followed by the original "UND", star-A (with its thread) and "Rlysh".
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;
const k = 2.45, Sx0 = 296 - 252 * k, Sy0 = 1012 - 358 * k;     // big S in lockup space
const spanL = Sx0, spanR = 1495, top = Sy0, bot = 1085;

function lockup({ dark = false, bg = '#FFFFFF', deco }) {
  const s = 930 / (spanR - spanL);
  const ox = C - s * (spanL + spanR) / 2, oy = 540 - s * (top + bot) / 2 + 6;
  const v = dark ? 'dark' : 'orig';
  const parts = ['UND', 'Astar', 'Rlysh'].map((n) => W.place(n, v, s, ox, oy));
  const tagS = s, tagOx = C - tagS * (222 + 1393) / 2 + 40;
  const tag = W.place('tag', v, tagS, tagOx, oy);
  const LM = (x, y) => [ox + s * (Sx0 + k * (x - 62)), oy + s * (Sy0 + k * (y - 642))];
  const sk = s * k;
  const ST = `translate(${L.r2(LM(0, 0)[0])},${L.r2(LM(0, 0)[1])}) scale(${sk.toFixed(4)})`;
  const Sd = W.traced('S');
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const WF = dark ? '#F6EADC' : 'url(#wineB)';
  const f = sk / (1.6 * 0.563);
  const ctx = { LM, sk, ST, Sd, GF, WF, dark, s, f };
  const d = deco(ctx);
  const defs = B.defs() + parts.map((p) => p.defs).join('') + tag.defs + (d.defs || '') +
    `<linearGradient id="wineB" gradientUnits="userSpaceOnUse" x1="0" y1="${LM(0, 642)[1]}" x2="0" y2="${LM(0, 1000)[1]}"><stop offset="0" stop-color="#860E44"/><stop offset="1" stop-color="#46041F"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${defs}</defs>` +
    `<rect width="1080" height="1080" fill="${bg}"/>${d.under || ''}<path d="${Sd}" fill="${WF}" transform="${ST}"/>${d.over || ''}` +
    parts.map((p) => p.body).join('') + tag.body + '</svg>\n';
}

// 34 · Jewel S — engraved gold inline, star on the hook, heart in the bowl, filigree curl
function jewel(opts = {}) {
  return lockup({ ...opts, deco: ({ LM, sk, ST, Sd, GF, dark, f }) => {
    let over = `<clipPath id="sc"><path d="${Sd}" transform="${ST}"/></clipPath>`;
    over += `<g clip-path="url(#sc)"><path d="${Sd}" fill="none" stroke="${GF}" stroke-width="${(5 / sk).toFixed(2)}" transform="${ST}"/></g>`;
    const hook = LM(305, 676);
    over += `<path d="${B.star(hook[0] + 6 * f, hook[1] - 34 * f, 30 * f, 0.1)}" fill="${GF}"/>`;
    // filigree curl growing from the inner tail of the lower bowl
    const t0 = LM(170, 806);
    over += `<path d="${B.flourish([t0, [t0[0] + 30 * f, t0[1] + 6 * f], [t0[0] + 52 * f, t0[1] + 30 * f], [t0[0] + 46 * f, t0[1] + 62 * f]], { r0: 22 * f, turns: 1.1, shrink: 0.4, dir: 1, w0: 3 * f, w1: 3.6 * f, ball: 0 })}" fill="${GF}"/>`;
    const hc = LM(186, 912);
    over += `<path d="${L.heart(hc[0] + 4 * f, hc[1] + 4 * f, 40 * f)}" fill="url(#pink)" stroke="${dark ? '#4A0A24' : '#FFFFFF'}" stroke-width="2"/>`;
    return { over };
  } });
}

// 35 · Lotus S — a lotus blooms on the crown of the S
function lotusS(opts = {}) {
  return lockup({ ...opts, deco: ({ LM, GF, WF, dark, f }) => {
    const b = LM(246, 650);
    const petal = (len, wid, deg, fill) => {
      const t = (deg * Math.PI) / 180, c = Math.cos(t), sn = Math.sin(t);
      const P = (x, y) => [L.r2(b[0] + f * (x * c - y * sn)), L.r2(b[1] + f * (x * sn + y * c))];
      return `<path d="M${P(0, 0)}C${P(-wid, -len * 0.38)} ${P(-wid * 0.8, -len * 0.86)} ${P(0, -len)}C${P(wid * 0.8, -len * 0.86)} ${P(wid, -len * 0.38)} ${P(0, 0)}Z" fill="${fill}" stroke="${GF}" stroke-width="2.4"/>`;
    };
    let over = petal(62, 26, -66, WF) + petal(62, 26, 66, WF) + petal(84, 28, -32, WF) + petal(84, 28, 32, WF) + petal(108, 30, 0, dark ? '#E9C676' : 'url(#goldR)');
    over += `<path d="${L.heart(b[0], b[1] - 40 * f, 24 * f)}" fill="url(#pink)" stroke="${dark ? '#4A0A24' : '#FFFFFF'}" stroke-width="1.6"/>`;
    over += `<path d="${B.star(b[0], b[1] - 132 * f, 18 * f, 0.1)}" fill="${GF}"/>`;
    const hc = LM(186, 912);
    over += `<path d="${L.heart(hc[0] + 4 * f, hc[1] + 4 * f, 30 * f)}" fill="none" stroke="${GF}" stroke-width="2"/>`;
    return { over };
  } });
}

// 36 · Peacock S — the lower bowl of the S becomes a peacock feather's eye
function peacockS(opts = {}) {
  return lockup({ ...opts, deco: ({ LM, GF, WF, dark, f }) => {
    const c = LM(190, 905), r = 64 * f;
    let under = '';
    let barbs = '';
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * 2 * Math.PI;
      const x1 = c[0] + 26 * f * Math.cos(a), y1 = c[1] + 34 * f * Math.sin(a), x2 = c[0] + (r + 22 * f) * Math.cos(a), y2 = c[1] + (r + 30 * f) * Math.sin(a);
      barbs += `M${L.r2(x1)},${L.r2(y1)}L${L.r2(x2)},${L.r2(y2)}`;
    }
    under += `<path d="${barbs}" stroke="${GF}" stroke-width="1" opacity="0.7"/>`;
    const drop = (w, h, fill, stroke, sw) => `<path d="M${c[0]},${L.r2(c[1] - h * 0.6)}C${L.r2(c[0] + w)},${L.r2(c[1] - h * 0.2)} ${L.r2(c[0] + w * 0.8)},${L.r2(c[1] + h * 0.4)} ${c[0]},${L.r2(c[1] + h * 0.4)}C${L.r2(c[0] - w * 0.8)},${L.r2(c[1] + h * 0.4)} ${L.r2(c[0] - w)},${L.r2(c[1] - h * 0.2)} ${c[0]},${L.r2(c[1] - h * 0.6)}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    let over = drop(44 * f, 104 * f, dark ? '#4A0A24' : '#FFFFFF', GF, 2.6) + drop(32 * f, 76 * f, WF, GF, 1.6) + drop(18 * f, 44 * f, dark ? '#E3BD68' : 'url(#goldR)', 'none', 0);
    over += `<path d="${L.heart(c[0], c[1] - 4 * f, 18 * f)}" fill="url(#pink)"/>`;
    const hook = LM(305, 676);
    over += `<path d="${B.star(hook[0] + 6 * f, hook[1] - 32 * f, 26 * f, 0.1)}" fill="${GF}"/>`;
    return { under, over };
  } });
}

module.exports = { jewel, lotusS, peacockS };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out12', { recursive: true });
  const set = {
    '34-jewel-s': jewel(), '34-jewel-s-dark': jewel({ dark: true, bg: '#4A0A24' }),
    '35-lotus-s': lotusS({ bg: '#FBF6EF' }), '35-lotus-s-dark': lotusS({ dark: true, bg: '#4A0A24' }),
    '36-peacock-s': peacockS(), '36-peacock-s-dark': peacockS({ dark: true, bg: '#4A0A24' }),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out12/${n}.svg`, v);
}
