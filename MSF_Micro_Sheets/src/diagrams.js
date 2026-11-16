// Small vector normal-curve diagrams (as drawn on the solution sheets). Used via {{D:name}} tokens in answer text.
let uid = 0;
function NC(shade, labels, notes = []) {
  const W = 100, H = 40, base = 31, amp = 26, L = 3.6;
  const X = (z) => ((Math.max(-L, Math.min(L, z)) + L) / (2 * L)) * W;
  const Y = (z) => base - amp * Math.exp(-z * z / 2);
  const curve = (a, b) => { let p = ''; for (let z = a; z <= b + 1e-9; z += 0.1) p += `${X(z).toFixed(2)},${Y(z).toFixed(2)} `; return p; };
  const id = 'h' + (++uid);
  let s = `<svg class="dg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="${id}" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.2" stroke="#000" stroke-width="0.7"/></pattern></defs>`;
  for (const [a, b] of shade) {
    const A = Math.max(-L, a), B = Math.min(L, b);
    s += `<polygon points="${X(A).toFixed(2)},${base} ${curve(A, B)}${X(B).toFixed(2)},${base}" fill="url(#${id})" stroke="#000" stroke-width="0.5"/>`;
  }
  s += `<line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="#000" stroke-width="0.6"/>`;
  s += `<polyline points="${curve(-L, L)}" fill="none" stroke="#000" stroke-width="0.9"/>`;
  s += `<line x1="${X(0)}" y1="${base}" x2="${X(0)}" y2="${Y(0)}" stroke="#000" stroke-width="0.4" stroke-dasharray="1.2,1"/>`;
  for (const [z, t] of labels) s += `<line x1="${X(z)}" y1="${base}" x2="${X(z)}" y2="${base + 1.8}" stroke="#000" stroke-width="0.6"/><text x="${X(z)}" y="${base + 8}" font-size="7.5" text-anchor="middle">${t}</text>`;
  for (const [z, y, t] of notes) s += `<text x="${X(z)}" y="${y}" font-size="7" text-anchor="middle" font-weight="bold">${t}</text>`;
  return s + `</svg>`;
}
const D = {
  // Unit 3 long
  u3q1:  NC([[-4.66, 1.66]], [[-3.3, '−4.66'], [0, '0'], [1.66, '1.66']]),
  u3q4:  NC([[-9, -1.48], [1.23, 9]], [[-1.48, '35'], [0, '0'], [1.23, '63']], [[-0.75, 20, '0.43'], [0.6, 20, '0.39']]),
  u3q6:  NC([[-9, -0.25], [1.04, 9]], [[-0.4, 'X=30'], [1.25, 'X=60']], [[-2.5, 22, '0.4'], [2.6, 22, '0.15']]),
  u3q8a: NC([[1.33, 9]], [[0, '0'], [1.33, '1.33']]),
  u3q8b: NC([[-9, -1.33]], [[-1.33, '−1.33'], [0, '0']]),
  u3q8c: NC([[-1, 1]], [[-1, '−1'], [0, '0'], [1, '1']]),
  u3q9a: NC([[-2, 1]], [[-2, '−2'], [0, '0'], [1, '1']]),
  u3q9b: NC([[1, 9]], [[0, '0'], [1, '1']]),
  u3q9c: NC([[-9, -3]], [[-3, '−3'], [0, '0']]),
  u3q9d: NC([[3, 9]], [[0, '0'], [3, '3']]),
  u3q10b: NC([[-9, -1.28]], [[-1.28, 'z₁'], [0, '0']], [[-2.3, 26, '0.1'], [-0.6, 20, '0.4']]),
  u3q10c: NC([[-1.64, 1.64]], [[-1.64, 'z₁'], [0, '0'], [1.64, 'z₂']], [[0, 18, '0.9'], [-2.5, 27, '0.05'], [2.5, 27, '0.05']]),
  // Unit 4 short Q7 (one-tailed / two-tailed)
  u4s7r: NC([[1.645, 9]], [[0, 'z=0'], [1.645, 'zα']], [[2.4, 24, 'α']]),
  u4s7t: NC([[-9, -1.96], [1.96, 9]], [[-1.96, '−zα/2'], [0, 'μ₀'], [1.96, 'zα/2']], [[-2.6, 24, 'α/2'], [2.6, 24, 'α/2']]),
};
module.exports = D;
