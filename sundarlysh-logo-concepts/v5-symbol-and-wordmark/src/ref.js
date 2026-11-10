// Reference-format DPs: one clean symbol above the original wordmark.
const L = require('./lib');
const B = require('./brand');
const W = require('./wordmark');
const C = 540;

function dp(bg, dark, sym, symDefs = '') {
  const wm = W.wordmark({ cx: C, top: 566, width: 800, variant: dark ? 'dark' : 'orig' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${symDefs}${wm.defs}</defs>` +
    `<rect width="1080" height="1080" fill="${bg}"/><g transform="translate(540,512) scale(1.17) translate(-540,-512)">${sym}</g>${wm.body}</svg>\n`;
}

// 1 · Star Arch — nested pointed arches (the A), star on top, heart at the threshold
function starArch({ dark = true, bg = '#4A0A24' } = {}) {
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const base = 520, spring = 452, e = 56;
  let g = '';
  for (let i = 0; i < 4; i++) {
    const hw = 124 - i * 21, R = hw + e;
    const apex = spring - Math.sqrt(R * R - e * e);
    g += `<path d="M${C - hw},${base}L${C - hw},${spring}A${R} ${R} 0 0 1 ${C},${L.r2(apex)}A${R} ${R} 0 0 1 ${C + hw},${spring}L${C + hw},${base}" fill="none" stroke="${GF}" stroke-width="4" stroke-linejoin="miter" stroke-miterlimit="10"/>`;
    if (i === 0) g += `<path d="${B.star(C, apex - 26, 34, 0.1)}" fill="${GF}"/>`;
  }
  g += `<rect x="${C - 160}" y="${base - 2}" width="320" height="4" fill="${GF}"/>`;
  g += `<path d="${L.heart(C, 466, 34)}" fill="url(#pink)"/>`;
  return dp(bg, dark, g);
}

// 2 · Sundar Lotus — petals drawn as pointed arches (A-shapes), heart at the heart
function lotus({ dark = false, bg = '#F8E6E6' } = {}) {
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const bx = C, by = 510;
  const petal = (len, wid, deg) => {
    const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
    const P = (x, y) => [L.r2(bx + x * c - y * s), L.r2(by + x * s + y * c)];
    const tip = P(0, -len), l1 = P(-wid, -len * 0.42), r1 = P(wid, -len * 0.42), lc = P(-wid * 0.9, -len * 0.82), rc = P(wid * 0.9, -len * 0.82);
    return `M${P(0, 0)}C${l1} ${lc} ${tip}C${rc} ${r1} ${P(0, 0)}Z`;
  };
  const fill = bg;
  let g = '';
  for (const [len, wid, deg] of [[150, 58, -64], [150, 58, 64], [205, 66, -32], [205, 66, 32], [270, 72, 0]])
    g += `<path d="${petal(len, wid, deg)}" fill="${fill}" stroke="${GF}" stroke-width="4" stroke-linejoin="round"/>`;
  // inner vein of the centre petal and heart
  g += `<path d="${petal(170, 36, 0)}" fill="none" stroke="${GF}" stroke-width="2"/>`;
  g += `<path d="${L.heart(C, by - 70, 34)}" fill="url(#pink)"/>`;
  g += `<path d="${B.star(C, by - 300, 30, 0.1)}" fill="${GF}"/>`;
  g += `<path d="M${C - 190},${by + 14}Q${C},${by - 6} ${C + 190},${by + 14}" fill="none" stroke="${GF}" stroke-width="3"/>`;
  return dp(bg, dark, g);
}

// 3 · S Seal — the wordmark's own S in a fine double ring, star breaking the top
function sSeal({ dark = false, bg = '#FFFFFF' } = {}) {
  const GF = dark ? 'url(#goldD)' : 'url(#goldR)';
  const cy = 368, R1 = 150, R2 = 139, gap = 0.2;
  const arcR = (R) => {
    const a0 = -Math.PI / 2 + gap, a1 = -Math.PI / 2 - gap;
    return `M${L.r2(C + R * Math.cos(a0))},${L.r2(cy + R * Math.sin(a0))}A${R} ${R} 0 1 1 ${L.r2(C + R * Math.cos(a1))},${L.r2(cy + R * Math.sin(a1))}`;
  };
  const S = W.traced('S'); const s = 232 / 358;
  const tx = C - s * (62 + 314) / 2 - 4, ty = cy - 116 - s * 642;
  let g = `<path d="${arcR(R1)}" fill="none" stroke="${GF}" stroke-width="4"/><path d="${arcR(R2)}" fill="none" stroke="${GF}" stroke-width="1.6"/>`;
  g += `<path d="${S}" fill="${dark ? '#F7E9DA' : 'url(#wine)'}" transform="translate(${L.r2(tx)},${L.r2(ty)}) scale(${s.toFixed(4)})"/>`;
  g += `<path d="${B.star(C, cy - R1 + 2, 34, 0.1)}" fill="${GF}"/>`;
  g += `<path d="${L.heart(C + 52, cy - 64, 26)}" fill="url(#pink)"/>`;
  return dp(bg, dark, g);
}

module.exports = { starArch, lotus, sSeal };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out6', { recursive: true });
  const set = {
    '16-star-arch': starArch(), '16-star-arch-light': starArch({ dark: false, bg: '#FFFFFF' }),
    '17-sundar-lotus': lotus(), '17-sundar-lotus-dark': lotus({ dark: true, bg: '#4A0A24' }),
    '18-s-seal': sSeal(), '18-s-seal-dark': sSeal({ dark: true, bg: '#4A0A24' }),
  };
  for (const [n, v] of Object.entries(set)) fs.writeFileSync(`out6/${n}.svg`, v);
}
