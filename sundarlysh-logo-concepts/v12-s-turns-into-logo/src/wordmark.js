// The client's original wordmark, traced to vector outlines (potrace) and
// coloured by clipping a smooth colour field taken from the original artwork.
const fs = require('fs');
const path = require('path');
const svgpath = require('svgpath');
const T = path.join(__dirname, 'trace');
const meta = JSON.parse(fs.readFileSync(path.join(T, 'meta.json'), 'utf8'));

const cache = {};
function traced(name) {
  if (cache[name]) return cache[name];
  const svg = fs.readFileSync(path.join(T, `${name}.potrace.svg`), 'utf8');
  const H4 = +svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1];
  const m = meta[name];
  const ds = [...svg.matchAll(/<path d="([^"]+)"/g)].map((x) => x[1].replace(/\s+/g, ' '));
  cache[name] = ds.map((d) => svgpath(d).matrix([0.025, 0, 0, -0.025, m.x0, m.y0 + H4 / 4]).abs().round(2).toString()).join(' ');
  return cache[name];
}

let uidN = 0;
// variant: 'orig' | 'dark' | {fill:'url(#gold)'} (solid)
function piece(name, variant) {
  const m = meta[name];
  const d = traced(name);
  if (typeof variant === 'object') return { defs: '', body: `<path d="${d}" fill="${variant.fill}"/>` };
  const id = `wm${name}${uidN++}`;
  const img = fs.readFileSync(path.join(T, `${name}.${variant === 'dark' ? 'dark' : 'field'}.jpg`)).toString('base64');
  return {
    defs: `<clipPath id="${id}"><path d="${d}"/></clipPath>`,
    body: `<image href="data:image/jpeg;base64,${img}" x="${m.x0}" y="${m.y0}" width="${m.w}" height="${m.h}" preserveAspectRatio="none" clip-path="url(#${id})"/>`,
  };
}

// Ink extents of the original lockup (source pixels)
const BOX = { x0: 62, x1: 1495, y0: 522, y1: 1053, tagY1: 1085 };

// Place the lockup: centred on cx, top of the star at `top`, overall `width`.
function wordmark({ cx = 540, top, width, variant = 'orig', tag = true, tagVariant }) {
  const s = width / (BOX.x1 - BOX.x0);
  const tx = cx - (s * (BOX.x0 + BOX.x1)) / 2, ty = top - s * BOX.y0;
  const parts = [piece('main', variant)];
  if (tag) parts.push(piece('tag', tagVariant || variant));
  return {
    defs: parts.map((p) => p.defs).join(''),
    body: `<g transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${s.toFixed(5)})">${parts.map((p) => p.body).join('')}</g>`,
    bottom: top + s * ((tag ? BOX.tagY1 : BOX.y1) - BOX.y0),
    scale: s,
    map: (x, y) => [tx + s * x, ty + s * y], // source px -> canvas
  };
}

module.exports = { wordmark, traced, piece, meta, BOX };

// Place a traced part with source point (0,0) mapped to (ox,oy) at scale s.
function place(name, variant, s, ox, oy, extra = '') {
  const p = piece(name, variant);
  return { defs: p.defs, body: `<g transform="translate(${ox.toFixed(2)},${oy.toFixed(2)}) scale(${s.toFixed(5)})"${extra}>${p.body}</g>`, d: traced(name), transform: `translate(${ox.toFixed(2)},${oy.toFixed(2)}) scale(${s.toFixed(5)})` };
}
module.exports.place = place;
