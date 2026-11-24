// Parses the user's "Software Engineering 15 Long Answers" text (kept word for word) into sheet data.
// Rows = units I..V, columns = the 3 questions of each unit, in the order of the user's PDF.
const fs = require('fs'), path = require('path');
const raw = fs.readFileSync(path.join(__dirname, '../user.txt'), 'utf8').split('\n');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/_/g, '&#95;');

// ---- diagrams (black & white, redrawn: the PDF's own diagrams are corrupted text) ----
let mk = 0;
const SVG = (w, h, body) => { const id = 'su' + (++mk); return `<svg class="jdw" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="${id}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#000"/></marker></defs>${body.replace(/MARK/g, id)}</svg>`; };
const B = (x, y, w, h, t, bold) => { const ls = t.split('|'); return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#000" stroke-width="1.2"/>` + ls.map((l, i) => `<text x="${x + w / 2}" y="${y + h / 2 + (i - (ls.length - 1) / 2) * 9.5 + 3}" font-size="8.5" text-anchor="middle"${bold ? ' font-weight="bold"' : ''}>${l}</text>`).join(''); };
const A = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="1.1" marker-end="url(#MARK)"/>`;
const stack = (items, w = 110, h = 15, gap = 8) => SVG(w + 20, items.length * (h + gap) - gap + 4,
  items.map((t, i) => B(10, 2 + i * (h + gap), w, h, t, 1) + (i < items.length - 1 ? A(10 + w / 2, 2 + i * (h + gap) + h, 10 + w / 2, 2 + (i + 1) * (h + gap)) : '')).join(''));
const D = {
  layered: SVG(130, 84, B(8, 2, 114, 18, 'TOOLS', 1) + B(8, 22, 114, 18, 'METHODS', 1) + B(8, 42, 114, 18, 'PROCESS', 1) + B(8, 62, 114, 18, 'QUALITY FOCUS (foundation)', 1)),
  spiral: SVG(150, 120,
    `<ellipse cx="75" cy="60" rx="64" ry="50" fill="none" stroke="#000" stroke-width="1.2"/><ellipse cx="75" cy="60" rx="38" ry="30" fill="none" stroke="#000" stroke-width="1.2"/><ellipse cx="75" cy="60" rx="14" ry="11" fill="none" stroke="#000" stroke-width="1.2"/>` +
    `<line x1="8" y1="60" x2="142" y2="60" stroke="#000" stroke-width="0.8"/><line x1="75" y1="8" x2="75" y2="112" stroke="#000" stroke-width="0.8"/>` +
    `<text x="40" y="22" font-size="7.5" text-anchor="middle" font-weight="bold">1 Objectives</text><text x="112" y="22" font-size="7.5" text-anchor="middle" font-weight="bold">2 Risk analysis</text>` +
    `<text x="112" y="104" font-size="7.5" text-anchor="middle" font-weight="bold">3 Development</text><text x="40" y="104" font-size="7.5" text-anchor="middle" font-weight="bold">4 Evaluation</text>` +
    `<text x="75" y="58" font-size="6.5" text-anchor="middle">start</text>` + A(75, 52, 100, 36) + A(100, 84, 75, 92)),
  waterfall: SVG(170, 100,
    B(2, 2, 76, 13, 'Requirements', 1) + A(40, 15, 40, 19) + B(14, 19, 76, 13, 'Design', 1) + A(52, 32, 52, 36) + B(26, 36, 76, 13, 'Implementation', 1) + A(64, 49, 64, 53) +
    B(38, 53, 76, 13, 'Integration & Test', 1) + A(76, 66, 76, 70) + B(50, 70, 76, 13, 'Deployment', 1) + A(88, 83, 88, 87) + B(62, 87, 76, 12, 'Maintenance', 1)),
  re: stack(['Feasibility study', 'Requirements elicitation', 'Analysis & negotiation', 'Specification (SRS)', 'Validation', 'Management (changes)'], 120, 13, 6),
  lms: stack(['USERS: Member / Librarian', 'PRESENTATION LAYER|screens & forms', 'BUSINESS LOGIC LAYER|search · issue/return · fine · reports', 'DATA ACCESS LAYER', 'DATABASE|books · members · loans · fines'], 130, 20, 7),
  testlv: stack(['Unit testing', 'Integration testing', 'System testing', 'Acceptance testing'], 110, 15, 9),
};
const DIAG = { 'U1.Q3': 'layered', 'U1.Q7': 'spiral', 'U1.Q9': 'waterfall', 'U2.Q5': 're', 'U3.Q4': 'lms', 'U4.Q1': 'testlv' };

// ---- parse ----
const ROM = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
const lines = raw.filter(l => !/^\s*Software Engineering – 10 Mark Answers\s+Page \d+/.test(l));
const Q = {}, A_ = {}, LABEL = {};
let unit = 0, cur = null, order = {}, state = 'skip', title = '', items = [], para = '', skipDiag = false;
const flush = () => { if (para) { items.push(para.trim()); para = ''; } };
const finish = () => {
  if (!cur) return; flush();
  Q[cur.r][cur.c] = esc(cur.title.replace(/\s+/g, ' ').trim());
  A_[cur.r][cur.c] = items.join('<br>'); LABEL[cur.r][cur.c] = `U${Object.keys(ROM).find(k => ROM[k] === cur.r)}·Q${cur.q}`;
};
for (const l0 of lines) {
  const l = l0.trim();
  let m;
  if ((m = l.match(/^UNIT (I|II|III|IV|V) –/))) { finish(); cur = null; unit = ROM[m[1]]; order[unit] = 0; Q[unit] = {}; A_[unit] = {}; LABEL[unit] = {}; continue; }
  if (unit && (m = l.match(/^Q(\d+)\.\s+(.*)/))) {
    finish(); order[unit]++; cur = { r: unit, c: order[unit], q: +m[1], title: m[2] }; items = []; para = ''; state = 'title'; skipDiag = false; continue;
  }
  if (!cur) continue;
  if (state === 'title') { if (/^Introduction$/.test(l)) { state = 'body'; items.push('<b>Introduction.</b>'); } else if (l) cur.title += ' ' + l; continue; }
  if (!l) continue;
  if (skipDiag) { if (l.includes('\\n') || l.includes('+--') || l.includes('|') && !/^[0-9A-Za-z]/.test(l)) continue; skipDiag = false; }
  if (/diagram$/i.test(l) && l.length < 40) {
    flush(); const k = DIAG[`U${cur.r}.Q${cur.q}`]; items.push(`<b>${esc(l)}.</b> ` + (k ? D[k] : '')); skipDiag = true; continue;
  }
  // heading: short line without terminal punctuation
  if (l.length <= 62 && !/[.:;,)]$/.test(l) && /^[0-9A-Z]/.test(l)) { flush(); para = `<b>${esc(l)}.</b> `; continue; }
  para += (para && !para.endsWith(' ') ? ' ' : '') + esc(l);
}
finish();
module.exports = { Q, A: A_, LABEL };
