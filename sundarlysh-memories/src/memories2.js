// SUNDARLYSH MEMORIES — three more styles: Wax Seal, Polaroid, Heritage Stamp.
const L = require('./lib');
const B = require('./brand');
const C = 540;
const doc = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080"><defs>${B.defs()}${defs}</defs>${body}</svg>\n`;
const gold = L.goldGrad('mg', 0, 200, 0, 900, [[0, '#E9C676'], [0.5, '#B98A34'], [1, '#DDB466']]);
const services = (cx, y, fill, acc, size = 19) => {
  const words = ['EVENTS', 'WORKSHOPS', 'BRANDING'], ls = 0.42, gap = size * 2.2;
  const ws = words.map((w) => L.text('bodoni600', w, 0, 0, size, { ls, anchor: 'start' }).width);
  let x = cx - (ws.reduce((a, b) => a + b, 0) + gap * 2) / 2, out = '';
  words.forEach((w, i) => { out += `<path d="${L.text('bodoni600', w, x, y, size, { ls, anchor: 'start' }).d}" fill="${fill}"/>`; x += ws[i]; if (i < 2) { out += `<path d="M${x + gap / 2},${y - size * 0.7}l${size * 0.22},${size * 0.32}l${-size * 0.22},${size * 0.32}l${-size * 0.22},${-size * 0.32}z" fill="${acc}"/>`; x += gap; } });
  return out;
};
const paper = (base) => `<rect width="1080" height="1080" fill="${base}"/><rect width="1080" height="1080" filter="url(#grain)"/>`;
const grain = `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0.06 0"/></filter>`;

// 1 · Wax Seal — script name sealed with a wine wax stamp
function waxSeal() {
  const ink = '#4A0A24';
  const word = L.text('pinyon', 'Sundarlysh', 0, 0, 176, { anchor: 'start' });
  const ww = word.bbox.x2 - word.bbox.x1;
  const wx = C - ww / 2 - word.bbox.x1, wy = 610;
  const w2 = L.text('pinyon', 'Sundarlysh', wx, wy, 176, { anchor: 'start' });
  const sx = C, sy = 340; // seal above the name
  const sealDefs = `<filter id="wax" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26"/></filter>` +
    `<filter id="emb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/><feSpecularLighting in="b" surfaceScale="4" specularConstant="0.8" specularExponent="18" lighting-color="#FFD6DF" result="s"><feDistantLight azimuth="235" elevation="50"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3="0.28" k4="0"/><feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#2A0010" flood-opacity="0.45"/></filter>` +
    `<radialGradient id="waxG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#8A1340"/><stop offset="1" stop-color="#3E0420"/></radialGradient>`;
  let seal = `<g filter="url(#emb)"><g filter="url(#wax)"><circle cx="${sx}" cy="${sy}" r="112" fill="url(#waxG)"/></g>` +
    `<circle cx="${sx}" cy="${sy}" r="80" fill="none" stroke="#C25480" stroke-width="3" opacity="0.8"/>`;
  let beads = ''; for (let i = 0; i < 36; i++) { const a = (i / 36) * 2 * Math.PI; beads += `<circle cx="${L.r2(sx + 70 * Math.cos(a))}" cy="${L.r2(sy + 70 * Math.sin(a))}" r="2.2"/>`; }
  seal += `<g fill="#C25480" opacity="0.8">${beads}</g>`;
  const S = L.text('bodoni600', 'S', sx, sy + 40, 112);
  seal += `<path d="${S.d}" fill="#D9A848"/><path d="${B.star(sx + 36, sy - 40, 14, 0.1)}" fill="#D9A848"/></g>`;
  let g = paper('#FBF6EF') + `<path d="${w2.d}" fill="${ink}"/>` + seal;
  const mem = L.text('bodoni500', 'MEMORIES', C, 748, 56, { ls: 0.62 });
  g += `<path d="${mem.d}" fill="${ink}"/>`;
  g += `<rect x="${C - mem.width / 2 - 84}" y="729" width="58" height="1.6" fill="url(#mg)"/><rect x="${C + mem.width / 2 + 26}" y="729" width="58" height="1.6" fill="url(#mg)"/>`;
  g += services(C, 806, '#6E3A4C', 'url(#mg)');
  return doc(gold + grain + sealDefs, g);
}

// 2 · Polaroid — a gold S in a tilted instant photo; "memories" handwritten on the caption strip
function polaroid() {
  const ink = '#3A0A20';
  const defs = `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="12" stdDeviation="12" flood-color="#4A0A24" flood-opacity="0.28"/></filter>` +
    `<linearGradient id="photo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A1742"/><stop offset="1" stop-color="#3E0820"/></linearGradient>` +
    `<radialGradient id="glow"><stop offset="0" stop-color="#E9C676" stop-opacity="0.35"/><stop offset="1" stop-color="#E9C676" stop-opacity="0"/></radialGradient>`;
  const pw = 300, ph = 356, px = C - pw / 2, py = 200, ang = -6;
  let card = `<g transform="rotate(${ang} ${C} ${py + ph / 2})"><g filter="url(#sh)"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="6" fill="#FFFFFF"/></g>`;
  const ix = px + 22, iy = py + 22, iw = pw - 44;
  card += `<rect x="${ix}" y="${iy}" width="${iw}" height="${iw}" fill="url(#photo)"/>`;
  card += `<circle cx="${C}" cy="${iy + iw / 2}" r="120" fill="url(#glow)"/>`;
  const S = L.text('bodoni600', 'S', C, iy + iw / 2 + 74, 200);
  card += `<path d="${S.d}" fill="url(#mg)"/>`;
  card += `<path d="${B.star(C + 62, iy + 62, 18, 0.1)}" fill="url(#mg)"/><path d="${B.star(C - 80, iy + iw - 50, 10, 0.12)}" fill="url(#mg)"/>`;
  const cap = L.text('vibes', 'memories', C, py + ph - 30, 58);
  card += `<path d="${cap.d}" fill="${ink}"/>`;
  card += `<path d="${L.heart(C + cap.width / 2 + 18, py + ph - 52, 16)}" fill="#E8275E"/></g>`;
  // a strip of washi tape at the top
  card += `<rect x="${C - 56}" y="${py - 18}" width="112" height="34" fill="#E9C676" opacity="0.55" transform="rotate(${ang + 3} ${C} ${py})"/>`;
  let g = paper('#F8EEEA') + card;
  g += `<path d="${L.text('bodoni600', 'SUNDARLYSH', C, 690, 92, { ls: 0.16 }).d}" fill="${ink}"/>`;
  g += `<path d="${L.text('bodoni500', 'MEMORIES', C, 752, 34, { ls: 0.86 }).d}" fill="#B98A34"/>`;
  g += services(C, 806, '#6E3A4C', 'url(#mg)', 17);
  return doc(gold + grain + defs, g);
}

// 3 · Heritage Stamp — name on the ring, Memories in script at the centre
function stamp(dark = false) {
  const ink = dark ? '#E9C676' : '#4A0A24', bg = dark ? '#121010' : '#FBF6EF';
  const R = 330;
  let g = paper(bg);
  g += `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${ink}" stroke-width="6"/>`;
  g += `<circle cx="${C}" cy="${C}" r="${R - 14}" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
  g += `<circle cx="${C}" cy="${C}" r="${R - 108}" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
  g += `<circle cx="${C}" cy="${C}" r="${R - 120}" fill="none" stroke="${ink}" stroke-width="4"/>`;
  g += `<path d="${L.arcText('bodoni600', 'SUNDARLYSH', C, C, R - 82, 62, { ls: 0.34, pos: 'top' }).d}" fill="${ink}"/>`;
  g += `<path d="${L.arcText('bodoni600', 'EVENTS · WORKSHOPS · BRANDING', C, C, R - 44, 26, { ls: 0.3, pos: 'bottom' }).d}" fill="${ink}"/>`;
  for (const sx of [-1, 1]) g += `<path d="${B.star(C + sx * (R - 60), C, 16, 0.1)}" fill="${dark ? ink : 'url(#mg)'}"/>`;
  const mem = L.text('vibes', 'Memories', C, C + 30, 100);
  g += `<path d="${mem.d}" fill="${ink}"/>`;
  g += `<path d="${B.star(C, C - 96, 24, 0.1)}" fill="${dark ? ink : 'url(#mg)'}"/>`;
  g += `<path d="${L.heart(C, C + 92, 22)}" fill="#E8275E"/>`;
  g += `<path d="M${C - 130},${C + 66}Q${C},${C + 82} ${C + 130},${C + 66}" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
  return doc(gold + grain, g);
}

module.exports = { waxSeal, polaroid, stamp };
if (require.main === module) {
  const fs = require('fs'); fs.mkdirSync('out15', { recursive: true });
  fs.writeFileSync('out15/memories-wax-seal.svg', waxSeal());
  fs.writeFileSync('out15/memories-polaroid.svg', polaroid());
  fs.writeFileSync('out15/memories-heritage-stamp.svg', stamp());
  fs.writeFileSync('out15/memories-heritage-stamp-dark.svg', stamp(true));
}
