// Final logo set: logomark (heart + S·A), vertical lockup (mark joined to the
// wordmark: the heart's tip runs into the star of the A), horizontal lockup
// (the heart's thread runs on into the swoosh under SUND).
const fs = require('fs');
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const { mark } = require('./mark');

const BG = {
  light: '<radialGradient id="bg" cx="50%" cy="48%" r="72%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.62" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F6EDE2"/></radialGradient>',
  dark: '<radialGradient id="bg" cx="50%" cy="48%" r="72%"><stop offset="0" stop-color="#521030"/><stop offset="0.6" stop-color="#521030"/><stop offset="1" stop-color="#2A0514"/></radialGradient>',
};
const SEP = { light: '#FFFFFF', dark: '#521030' };

function doc(w, h, inner, defs) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n<defs>${defs}</defs>\n${inner}\n</svg>\n`;
}

function vertical(mode) { // 'light' | 'dark' | 'transparent' | 'transparent-dark'
  const dark = mode === 'dark' || mode === 'transparent-dark';
  const transparent = mode.startsWith('transparent');
  const k = 15.5, cl = 272;
  const m = mark(540, cl, k, { dark, sep: SEP[dark ? 'dark' : 'light'], transparent });
  const s = 0.558, ox = 540 - s * 851, oy = m.point[1] - s * 515;
  const v = dark ? 'dark' : 'orig';
  const a = W.place('main', v, s, ox, oy), t = W.place('tag', v, s, ox, oy);
  const g = [];
  if (!transparent) g.push('<rect width="1080" height="1080" fill="url(#bg)"/>');
  g.push(m.svg, a.body, t.body);
  return doc(1080, 1080, g.join('\n'), B.defs() + (transparent ? '' : BG[dark ? 'dark' : 'light']) + m.defs + a.defs + t.defs);
}

function icon(mode) {
  const dark = mode === 'dark' || mode === 'transparent-dark';
  const transparent = mode.startsWith('transparent');
  const k = 21, cl = 402;
  const m = mark(540, cl, k, { dark, sep: SEP[dark ? 'dark' : 'light'], transparent });
  const g = [];
  if (!transparent) g.push('<rect width="1080" height="1080" fill="url(#bg)"/>');
  g.push(m.svg);
  return doc(1080, 1080, g.join('\n'), B.defs() + (transparent ? '' : BG[dark ? 'dark' : 'light']) + m.defs);
}

function horizontal(mode) { // 'transparent' (dark text) | 'transparent-dark' (ivory text, for dark grounds) | 'light'
  const dark = mode === 'transparent-dark' || mode === 'dark';
  const transparent = mode.startsWith('transparent');
  const Wd = 2240, Hd = 900;
  const oy = 200 - 515, ox = 720 - 62;
  const k = 19, mcx = 372, cl = 200 + 6.3 * k;
  const m = mark(mcx, cl, k, { dark, sep: SEP[dark ? 'dark' : 'light'], transparent });
  const v = dark ? 'dark' : 'orig';
  const a = W.place('main', v, 1, ox, oy), t = W.place('tag', v, 1, ox, oy);
  // the heart's thread runs on from its tip into the swoosh tip under SUND
  const p0 = m.point, tip = [ox + 191, oy + 1054];
  const pts = L.cubicPts(p0, [p0[0] + 30, p0[1] + 48], [tip[0] - 240, tip[1] + 18], tip, 140);
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const thread = L.ribbon(pts, (t2) => 0.5 + 2.2 * Math.sin(Math.PI * t2));
  const g = [];
  if (!transparent) g.push(`<rect width="${Wd}" height="${Hd}" fill="${dark ? '#521030' : '#FFFFFF'}"/>`);
  g.push(`<path d="${thread}" fill="${GF}"/>`, m.svg, a.body, t.body);
  return doc(Wd, Hd, g.join('\n'), B.defs() + m.defs + a.defs + t.defs);
}

fs.mkdirSync('out4', { recursive: true });
const files = {
  'sundarlysh-logo': vertical('light'),
  'sundarlysh-logo-dark': vertical('dark'),
  'sundarlysh-logo-transparent': vertical('transparent'),
  'sundarlysh-logo-transparent-for-dark-bg': vertical('transparent-dark'),
  'sundarlysh-logomark': icon('light'),
  'sundarlysh-logomark-dark': icon('dark'),
  'sundarlysh-logomark-transparent': icon('transparent'),
  'sundarlysh-logo-horizontal': horizontal('transparent'),
  'sundarlysh-logo-horizontal-for-dark-bg': horizontal('transparent-dark'),
};
for (const [n, svg] of Object.entries(files)) fs.writeFileSync(`out4/${n}.svg`, svg);
console.log(Object.keys(files).length, 'files');
