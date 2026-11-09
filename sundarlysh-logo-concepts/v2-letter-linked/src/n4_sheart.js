// New concept D — "Do Dil": the S from the wordmark meets its own reflection;
// their tops join into a heart. Wine S (Sundar) + gold S (lysh).
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

module.exports = function build({ dark = false } = {}) {
  const S = W.traced('S'); // source bbox x 62..314, y 642..1000
  const s = 0.98, ov = 50, top = 168;
  const w = 252 * s, pairW = 2 * w - ov * s;
  const X = C - pairW / 2;
  const bg = dark ? '#3A0820' : '#FFFFFF';
  const place = (x, mir) => `translate(${L.r2(mir ? x + s * 314 : x - s * 62)},${L.r2(top - s * 642)}) scale(${mir ? -s : s},${s})`;
  const tL = place(X, false), tR = place(X + w - ov * s, true);
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const WF = dark ? '#F7E9DA' : 'url(#wine)';
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="42%" r="72%">${dark
      ? '<stop offset="0" stop-color="#6E1238"/><stop offset="0.6" stop-color="#480A25"/><stop offset="1" stop-color="#2A0514"/>'
      : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.75" stop-color="#FFFCF8"/><stop offset="1" stop-color="#F7EEE4"/>'}</radialGradient>` +
    `<clipPath id="lower"><rect x="0" y="${top + 250}" width="1080" height="400"/></clipPath>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  g.push('<g transform="translate(0,36)">');
  // left (wine) S, then the gold mirror over it with a hairline gap
  const sep = dark ? '#521030' : '#FFFFFF';
  g.push(`<path d="${S}" fill="${WF}" transform="${tL}"/>`);
  g.push(`<path d="${S}" fill="none" stroke="${sep}" stroke-width="${7 / s}" transform="${tR}"/>`);
  g.push(`<path d="${S}" fill="${GF}" transform="${tR}"/>`);
  // star crowning the heart, small pink heart inside it
  g.push(`<path d="${B.star(C, top - 30, 46)}" fill="${GF}"/>`);
  g.push(`<path d="${L.heart(C, top + 64, 38)}" fill="url(#pink)"/>`);

  const wm = W.wordmark({ cx: C, top: 578, width: 790, variant: dark ? 'dark' : 'orig' });
  g.push(wm.body);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs + wm.defs);
};
