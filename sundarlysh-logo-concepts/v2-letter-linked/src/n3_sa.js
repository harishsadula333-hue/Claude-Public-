// New concept C — "S·A Monogram": the wordmark's own S, woven through the
// star-A (gold) — the two signature letters of SUNDAR as one crest.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

module.exports = function build({ dark = false } = {}) {
  const S = W.traced('S');
  const s = 1.02, top = 196;
  const sx0 = C - 22 - (252 * s) / 2;
  const tS = `translate(${L.r2(sx0 - s * 62)},${L.r2(top - s * 642)}) scale(${s})`;
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const WF = dark ? '#F7E9DA' : 'url(#wine)';
  const sep = dark ? '#4E0B28' : '#FFFFFF';
  const defs = B.defs() +
    `<radialGradient id="bg" cx="50%" cy="42%" r="72%">${dark
      ? '<stop offset="0" stop-color="#6E1238"/><stop offset="0.6" stop-color="#480A25"/><stop offset="1" stop-color="#2A0514"/>'
      : '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.75" stop-color="#FFFCF8"/><stop offset="1" stop-color="#F7EEE4"/>'}</radialGradient>` +
    `<clipPath id="weave"><circle cx="0" cy="0" r="1"/></clipPath>`;
  const g = [];
  g.push(`<rect width="1080" height="1080" fill="url(#bg)"/>`);
  g.push('<g transform="translate(0,28)">');

  const A = B.brandA({ cx: C + 14, apexY: 158, baseY: top + 358 * s - 4, halfW: 132, legFill: GF, starFill: GF, barFill: GF, starSize: 52, heartSize: 36, barT: 0.66, tail: 120 });
  // S first, A over it (with a separating hairline), then the S again over
  // the A on the upper bowl only, so the letters weave
  g.push(`<path d="${S}" fill="${WF}" transform="${tS}"/>`);
  g.push(`<g style="filter:none">${A.svg.replace(/fill="url\(#(goldR|goldD)\)"/g, `fill="none" stroke="${sep}" stroke-width="7"`).replace(/fill="url\(#pink\)"/g, 'fill="none"')}</g>`);
  g.push(A.svg);
  g.push(`<clipPath id="upper"><rect x="${C - 30}" y="${top - 10}" width="140" height="70"/></clipPath>`);
  g.push(`<g clip-path="url(#upper)"><path d="${S}" fill="none" stroke="${sep}" stroke-width="${7 / s}" transform="${tS}"/><path d="${S}" fill="${WF}" transform="${tS}"/></g>`);

  const wm = W.wordmark({ cx: C, top: 600, width: 790, variant: dark ? 'dark' : 'orig' });
  g.push(wm.body);
  g.push('</g>');
  return L.svgDoc(g.join('\n'), defs + wm.defs);
};
