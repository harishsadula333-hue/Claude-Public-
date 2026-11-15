/* Deterministic reel animation: window.render(t) draws the frame at time t (seconds).
   All timings are keyed to the narration word timestamps in window.TL (build/timeline.js). */
(() => {
'use strict';
const TL = window.TL;
const words = TL.words;
const W = words.map(w => w.t);
const WE = words.map(w => w.t + w.dur);
// scene cues were authored against the first script; map them onto the new narration's word indices
const VMAP = {0:1,1:2,2:3,3:4,4:6,5:7,6:8,7:9,8:10,10:12,12:15,13:16,14:17,15:20,16:23,17:24,18:25,20:27,26:33,27:34,29:37,30:38,33:42,34:44,35:45,38:48,39:49,41:51,42:52,45:55,49:59,52:61,55:65,57:67,59:70,60:72,61:73,63:75,65:77,67:79,68:80,69:81,70:83,71:84,73:86,74:87,75:88,76:89,84:97,85:98,88:102,89:103,93:108,94:109,95:110,97:112,98:113,99:114};
const V = []; Object.entries(VMAP).forEach(([a, b]) => (V[+a] = W[b]));
const S = {}; TL.scenes.forEach(s => (S[s.name] = s.t));
const END = Math.max(50, Math.round((TL.voiceDur + 2.1) * 30) / 30);
window.DURATION = END;

// ---------------------------------------------------------------- utils
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, x) => a + (b - a) * x;
const E = {
  out: x => 1 - Math.pow(1 - x, 3),
  io: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: x => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  el: x => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -9 * x) * Math.sin((x * 10 - 0.75) * 2.0944) + 1),
};
const pulse = (t, a, d) => { const x = (t - a) / d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function tf(e, x = 0, y = 0, s = 1, r = 0, o = 1, sy) {
  e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)},${(sy ?? s).toFixed(4)})`;
  e.style.opacity = clamp(o).toFixed(3);
  e.style.visibility = o < 0.003 ? 'hidden' : 'visible';
}
const $ = s => document.querySelector(s);
const world = $('#world'), bg = $('#bg');
function mk(cls, parent = world, html = '') { const e = document.createElement('div'); if (cls) e.className = cls; e.innerHTML = html; parent.appendChild(e); return e; }
function pos(e, x, y, w, h) { e.style.left = x + 'px'; e.style.top = y + 'px'; if (w != null) e.style.width = w + 'px'; if (h != null) e.style.height = h + 'px'; return e; }
const rgb = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`; };
// standard pop-in / fade-out of an element
function popIO(e, t, a, b, { dy = 50, dx = 0, s0 = 0.6, da = 0.42, db = 0.3, x = 0, y = 0, r = 0 } = {}) {
  const i = E.back(P(t, a, da)), o = E.io(P(t, b, db));
  tf(e, x + (1 - i) * dx, y + (1 - i) * dy - o * 40, lerp(s0, 1, i) * (1 - o * 0.12), r * (1 - i), P(t, a, da * 0.45) * (1 - o));
}
// group-level scene visibility (slide up in, slide up out)
function groupIO(g, t, a, b) {
  const i = E.out(P(t, a, 0.45)), o = E.io(P(t, b, 0.35));
  tf(g, 0, (1 - i) * 70 - o * 90, 1, 0, Math.min(P(t, a, 0.3), 1 - o));
}

let uid = 0; const U = () => 'u' + (++uid);
const SFX = []; const sfx = (t, name, gain = 1) => SFX.push({ t: +Math.max(0, t).toFixed(3), name, gain });
window.SFX = SFX;

// ---------------------------------------------------------------- icons
const grad = (c1, c2) => { const g = U(); return [g, `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`]; };
function svgPhoto() { const [g, d] = grad('#7DD3FC', '#2563EB'); return `<svg viewBox="0 0 200 200">${d}<rect x="12" y="12" width="176" height="176" rx="40" fill="url(#${g})"/><circle cx="138" cy="62" r="22" fill="#FDE047"/><path d="M12,152 L70,92 L112,134 L138,110 L188,160 L188,148 Q188,188 148,188 L52,188 Q12,188 12,150Z" fill="#1E40AF"/><path d="M12,166 L70,108 L128,166 Q136,188 116,188 L52,188 Q12,188 12,166Z" fill="#172554"/></svg>`; }
function svgVideo() { const [g, d] = grad('#C4B5FD', '#7C3AED'); return `<svg viewBox="0 0 200 200">${d}<rect x="12" y="12" width="176" height="176" rx="40" fill="url(#${g})"/><circle cx="100" cy="100" r="54" fill="rgba(255,255,255,.22)"/><path d="M84,70 L138,100 L84,130Z" fill="#fff"/></svg>`; }
function svgMusic() { const [g, d] = grad('#6EE7B7', '#059669'); return `<svg viewBox="0 0 200 200">${d}<rect x="12" y="12" width="176" height="176" rx="40" fill="url(#${g})"/><path d="M82,142 L82,64 L146,50 L146,126" stroke="#fff" stroke-width="13" fill="none" stroke-linejoin="round"/><ellipse cx="66" cy="144" rx="23" ry="18" fill="#fff"/><ellipse cx="130" cy="128" rx="23" ry="18" fill="#fff"/></svg>`; }
function svgFile(c1, c2) { const [g, d] = grad(c1, c2); return `<svg viewBox="0 0 160 200">${d}<path d="M20,10 L104,10 L144,50 L144,186 Q144,192 138,192 L26,192 Q20,192 20,186Z" fill="url(#${g})"/><path d="M104,10 L104,50 L144,50Z" fill="rgba(255,255,255,.45)"/><rect x="44" y="92" width="76" height="12" rx="6" fill="rgba(255,255,255,.7)"/><rect x="44" y="118" width="60" height="12" rx="6" fill="rgba(255,255,255,.5)"/><rect x="44" y="144" width="70" height="12" rx="6" fill="rgba(255,255,255,.5)"/></svg>`; }
const ICON = { photo: svgPhoto, video: svgVideo, music: svgMusic };
const COL = { photo: '#38BDF8', video: '#A78BFA', music: '#34D399', free: '#34D399', orange: '#FB923C' };

// ---------------------------------------------------------------- background
const blobs = [['#3B82F6', 180, 380], ['#7C3AED', 900, 950], ['#0EA5E9', 260, 1600]].map(([c, x, y]) => {
  const b = mk('blob', bg); b.style.background = `radial-gradient(circle, ${hexA(c, 0.12)} 0%, ${hexA(c, 0)} 66%)`; return { b, x, y };
});
// film grain: a few pre-baked noise frames, picked and offset per frame (deterministic)
const grainCv = $('#grain'), gctx = grainCv.getContext('2d');
const GRAIN = []; { const R = rng(99); for (let k = 0; k < 6; k++) { const im = gctx.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() + R() + R() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } GRAIN.push(im); } }
const flash = mk('layer', $('#stage')); flash.style.background = '#fff'; flash.style.pointerEvents = 'none';
function renderBg(t) {
  blobs.forEach((b, i) => tf(b.b, b.x - 450 + Math.sin(t * 0.3 + i * 2) * 120, b.y - 450 + Math.cos(t * 0.23 + i) * 110));
  const f = Math.round(t * 30); gctx.putImageData(GRAIN[f % 6], 0, 0);
  grainCv.style.transform = `translate(${((f * 37) % 9) - 4}px, ${((f * 53) % 9) - 4}px)`;
}

// ---------------------------------------------------------------- header chips
const chipDefs = [
  ['hook', '?', 'Delete చేసిన File ఏమవుతుంది?'],
  ['storage', '1', 'File ఎలా Save అవుతుంది?'],
  ['delete', '2', 'Delete చేస్తే ఏం జరుగుతుంది?'],
  ['recover', '3', 'తిరిగి తెచ్చుకోవచ్చా?'],
  ['ssd', '4', 'SSD & Phones లో?'],
  ['tips', '5', 'ముఖ్యమైన Tips'],
];
const chips = chipDefs.map(([name, n, txt], i) => {
  const e = mk('chip', world, `<span class="n">${n}</span><span class="t">${txt}</span>`);
  const a = i === 0 ? 0.2 : S[name] - 0.05;
  const nx = chipDefs[i + 1] ? S[chipDefs[i + 1][0]] - 0.3 : S.outro - 0.3;
  return { e, a, b: nx };
});
function renderChips(t) {
  chips.forEach(c => {
    const w = c.w || (c.w = c.e.offsetWidth);
    const i = E.back(P(t, c.a, 0.5)), o = E.io(P(t, c.b, 0.28));
    tf(c.e, -w / 2, (1 - i) * -40 - o * 30, lerp(0.75, 1, i), -1.6 + (1 - i) * 6, P(t, c.a, 0.2) * (1 - o));
  });
}
chips.forEach((c, i) => { if (i > 0) sfx(c.a - 0.05, 'whoosh', 0.55); });

// ---------------------------------------------------------------- HOOK
const gHook = mk('layer');
const fileDefs = [['photo', 'photo.jpg', '4.2 MB'], ['video', 'video.mp4', '86 MB'], ['music', 'song.mp3', '5.1 MB']];
const hookCards = fileDefs.map(([k, nm, sz], i) => {
  const ghost = pos(mk('ghost', gHook, '01101001 10110100 01011100 11010010 00101101 10010110 01110001'), 110 + i * 300, 430);
  const e = pos(mk('fcard', gHook, `${ICON[k]()}<div class="nm">${nm}</div><div class="sz">${sz}</div>`), 110 + i * 300, 430);
  const R = rng(100 + i);
  const parts = Array.from({ length: 16 }, () => {
    const p = mk('particle', gHook); p.style.background = COL[k];
    const ang = R() * Math.PI * 2; return { p, cx: 110 + i * 300 + 130 - 13, cy: 585 - 13, dx: Math.cos(ang), dy: Math.sin(ang) - 0.3, d: 120 + R() * 260, r: R() * 720 - 360 };
  });
  return { e, ghost, parts, a: V[i] - 0.06 };
});
const dialog = mk('dialog', gHook, `<div class="q"><span style="font-size:58px">🗑️</span><span style="padding-top:12px">శాశ్వతంగా Delete చేయాలా?</span></div>
  <div style="position:absolute;left:40px;top:118px;font-size:31px;font-weight:700;color:#64748B">3 items • ఇది Undo చేయలేరు</div>
  <div class="btns"><div class="btn cancel">Cancel</div><div class="btn del" id="delBtn">Delete</div></div>`);
const delBtn = dialog.querySelector('#delBtn');
const cursor = mk('cursor', world, '<div style="font-size:120px;line-height:1;transform:rotate(-12deg)">👆</div>');
const qmark = mk('qmark', gHook, '?');
const stamp = mk('stamp', gHook, 'లేదు!');
const T = {};
T.dialog = V[3] - 0.1; T.tap = V[5] + 0.02; T.poof = T.tap + 0.16; T.q = V[6] - 0.05; T.no = V[8] - 0.02;
hookCards.forEach(c => sfx(c.a, 'pop', 0.9));
sfx(0, 'impact', 0.8);
sfx(T.dialog, 'whooshS', 0.7); sfx(T.dialog + 0.05, 'pop', 0.6);
sfx(T.tap - 0.02, 'click', 1); sfx(T.poof, 'poof', 0.9);
sfx(T.q, 'popLow', 0.6);
sfx(T.no - 0.55, 'riser', 0.6); sfx(T.no, 'stamp', 1.0); sfx(T.no + 0.02, 'glitch', 0.45);

function renderHook(t) {
  groupIO(gHook, t, -1, S.storage - 0.32);
  hookCards.forEach((c, i) => {
    const i1 = E.back(P(t, c.a, 0.45));
    const shake = t > T.tap && t < T.poof ? Math.sin(t * 90 + i) * 6 : 0;
    const gone = E.out(P(t, T.poof + i * 0.05, 0.35));
    const bob = Math.sin(t * 2.2 + i * 1.3) * 6;
    const dim = t > T.dialog ? 1 - 0.25 * P(t, T.dialog, 0.3) : 1;
    tf(c.e, shake, (1 - i1) * 80 + bob, lerp(0.3, 1, i1) * (1 - gone * 0.5), (1 - i1) * -14, P(t, c.a, 0.18) * (1 - gone) * dim);
    c.parts.forEach(p => {
      const u = E.out(P(t, T.poof + i * 0.05, 0.7));
      tf(p.p, p.cx + p.dx * p.d * u, p.cy + p.dy * p.d * u + u * u * 120, 1 - u * 0.6, p.r * u, u > 0 && u < 1 ? 1 - u : 0);
    });
    // ghost slots: appear after poof, glow with "still there" bits at the NO moment
    const gIn = P(t, T.q, 0.4), glow = P(t, T.no, 0.3);
    c.ghost.style.color = `rgba(125,211,252,${(0.12 + 0.7 * glow).toFixed(3)})`;
    c.ghost.style.borderColor = `rgba(148,163,255,${(0.25 + 0.45 * glow).toFixed(3)})`;
    c.ghost.style.boxShadow = glow > 0 ? `0 0 ${40 * glow}px rgba(56,189,248,${0.35 * glow})` : 'none';
    tf(c.ghost, 0, 0, 1, 0, gIn * 0.9);
  });
  // dialog + tap
  const dIn = E.back(P(t, T.dialog, 0.4)), dOut = E.io(P(t, T.tap + 0.22, 0.25));
  tf(dialog, 0, (1 - dIn) * 120, lerp(0.7, 1, dIn) * (1 - dOut * 0.2), 0, P(t, T.dialog, 0.15) * (1 - dOut));
  const press = pulse(t, T.tap - 0.04, 0.2);
  tf(delBtn, 0, 0, 1 - press * 0.1, 0, 1);
  delBtn.style.background = press > 0.3 ? '#B91C1C' : '#EF4444';
  // cursor travels to the Delete button
  const cu = E.io(P(t, T.dialog + 0.35, T.tap - T.dialog - 0.4));
  const cx = lerp(980, 739, cu), cy = lerp(1380, 1049, cu);
  const cOut = P(t, T.tap + 0.3, 0.25);
  tf(cursor, cx, cy + cOut * 80, 1 - press * 0.16, 0, P(t, T.dialog + 0.3, 0.15) * (1 - cOut));
  // question mark
  const qi = E.el(P(t, T.q, 0.9)), qo = E.io(P(t, T.no - 0.12, 0.15));
  tf(qmark, 0, (1 - qi) * 100 + Math.sin(t * 5) * 8, lerp(0.2, 1, qi) * (1 + qo * 0.6), Math.sin(t * 4) * 8 * qi, P(t, T.q, 0.12) * (1 - qo));
  // stamp
  const si = E.out(P(t, T.no, 0.17));
  tf(stamp, 0, 0, lerp(2.6, 1, si), -9, P(t, T.no, 0.06) * (1 - E.io(P(t, S.storage - 0.4, 0.25))));
}

// ---------------------------------------------------------------- DISK (storage / delete / recover)
const gDisk = mk('layer');
const disk = mk('abs card disk', gDisk, `<div class="lbl"><svg width="44" height="44" viewBox="0 0 44 44"><rect x="3" y="6" width="38" height="32" rx="7" fill="none" stroke="#7DD3FC" stroke-width="4"/><circle cx="22" cy="22" r="7" fill="none" stroke="#7DD3FC" stroke-width="4"/><circle cx="34" cy="31" r="2.5" fill="#7DD3FC"/></svg>STORAGE</div><div class="sub">Hard Disk • SSD • Phone Memory</div>`);
const GX = 113, GY = 335, BW = 98, BH = 72, GSX = 108, GSY = 82;
const bpos = i => [GX + (i % 8) * GSX, GY + Math.floor(i / 8) * GSY];
const FILES = { photo: [2, 3, 4, 5, 6], video: [16, 17, 18, 19, 20, 21], music: [27, 28, 29, 30] };
const owner = {}; Object.entries(FILES).forEach(([k, arr]) => arr.forEach(i => (owner[i] = k)));
const blocks = []; { const R = rng(5); for (let i = 0; i < 40; i++) {
  const b8 = () => Array.from({ length: 4 }, () => (R() > 0.5 ? 1 : 0)).join('');
  const [x, y] = bpos(i);
  const e = pos(mk('blk', gDisk, `<div class="bits">${b8()}<br>${b8()}</div><div class="no">${i + 1}</div>`), x, y);
  blocks.push({ e, x, y, k: owner[i] });
} }
// fill times for storage scene
const fillT = {}; FILES.photo.forEach((b, j) => (fillT[b] = V[12] + j * 0.1)); FILES.video.forEach((b, j) => (fillT[b] = V[13] + j * 0.08)); FILES.music.forEach((b, j) => (fillT[b] = V[14] + j * 0.1));
// file chips that stream bits into blocks
const fchips = fileDefs.map(([k, nm], i) => {
  const e = pos(mk('abs card', gDisk, `<div style="position:absolute;left:18px;top:18px;width:84px;height:84px">${ICON[k]()}</div><div style="position:absolute;left:116px;top:34px;font-family:Poppins;font-weight:800;font-size:30px">${nm}</div>`), 70 + i * 318, 840, 304, 120);
  return { e, k, a: V[10] + i * 0.15 };
});
const streams = []; { const R = rng(9); Object.entries(FILES).forEach(([k, arr], fi) => arr.forEach(b => { for (let j = 0; j < 3; j++) {
  const e = mk('bit', gDisk, R() > 0.5 ? '1' : '0'); e.style.fontSize = '34px'; e.style.color = COL[k];
  streams.push({ e, b, sx: 70 + fi * 318 + 60, sy: 860, t0: fillT[b] - 0.42 + j * 0.07 });
} })); }
// index (address list)
const index = mk('abs card index', gDisk, `<div class="ttl"><svg width="46" height="46" viewBox="0 0 46 46"><rect x="6" y="4" width="34" height="38" rx="6" fill="#FDE047"/><rect x="12" y="12" width="22" height="4" rx="2" fill="#78350F"/><rect x="12" y="21" width="22" height="4" rx="2" fill="#78350F"/><rect x="12" y="30" width="15" height="4" rx="2" fill="#78350F"/></svg><span style="padding-top:8px">Address List <span style="opacity:.6;font-size:30px">(Index)</span></span></div>`);
pos(index, 220, 790);
const rowDefs = [['photo', 'photo.jpg', 'Block 3–7'], ['video', 'video.mp4', 'Block 17–22'], ['music', 'song.mp3', 'Block 28–31']];
const rows = rowDefs.map(([k, nm, bk], i) => {
  const r = mk('row', index, `<div class="rc" style="display:flex;align-items:center;gap:16px;width:100%"><span class="dot" style="background:${COL[k]}"></span><span>${nm}</span><span class="ar">→</span><span class="bk">${bk}</span></div>`);
  r.style.top = (88 + i * 74) + 'px';
  return { r, rc: r.querySelector('.rc'), k, a: [V[18], V[18] + 0.42, V[20] + 0.05][i] };
});
const row1 = rows[0];
const strike = mk('strike', row1.r);
const eraser = mk('', row1.r, '<div style="width:86px;height:52px;border-radius:12px;background:linear-gradient(90deg,#F9A8D4 0 60%,#E2E8F0 60%);box-shadow:0 6px 14px rgba(0,0,0,.4)"></div>');
Object.assign(eraser.style, { position: 'absolute', left: '0px', top: '7px' });
const delBadge = mk('', row1.r, '❌ Address మాత్రమే పోయింది');
Object.assign(delBadge.style, { position: 'absolute', left: '22px', top: '10px', fontFamily: "'Baloo Tammudu 2'", fontWeight: 800, fontSize: '32px', color: '#FDA4AF' });
const binTag = mk('', row1.r, '🗑️ Bin లో');
Object.assign(binTag.style, { position: 'absolute', right: '14px', top: '9px', padding: '6px 16px 0', borderRadius: '14px', background: '#475569', fontSize: '28px', fontWeight: 800 });
// recycle bin
const bin = mk('abs card bin', gDisk, `<svg viewBox="0 0 200 230"><g id="binLid"><rect x="18" y="32" width="164" height="24" rx="11" fill="#CBD5E1"/><rect x="76" y="14" width="48" height="22" rx="9" fill="#CBD5E1"/></g>
  <path d="M32,64 L168,64 L154,214 Q152,226 140,226 L60,226 Q48,226 46,214 Z" fill="#94A3B8"/>
  <path d="M74,92 L80,198 M100,92 L100,198 M126,92 L120,198" stroke="#475569" stroke-width="11" stroke-linecap="round"/></svg>
  <div class="cap">Recycle Bin</div>`);
const binLid = bin.querySelector('#binLid');
const flyIcon = mk('abs', gDisk, `<div style="width:84px;height:84px">${svgPhoto()}</div>`);
const binPuff = []; { const R = rng(21); for (let i = 0; i < 14; i++) { const p = mk('particle', gDisk); p.style.background = i % 2 ? '#38BDF8' : '#CBD5E1'; const a = -Math.PI / 2 + (R() - 0.5) * 2.2; binPuff.push({ p, dx: Math.cos(a), dy: Math.sin(a), d: 90 + R() * 150, r: R() * 500 }); } }
// keys overlay
const keys = mk('keys', gDisk, '<div class="key" id="kShift">Shift</div><div class="plus">+</div><div class="key" id="kDel">Delete</div>');
Object.assign(keys.style, { background: 'rgba(5,8,26,0.82)', borderRadius: '44px', border: '3px solid rgba(255,255,255,.12)' });
const kShift = keys.querySelector('#kShift'), kDel = keys.querySelector('#kDel');
// free tag, lens, data badge
const freeTag = pos(mk('tag', gDisk, 'ఖాళీ • FREE'), 0, 330); freeTag.style.background = '#059669';
const lens = mk('lens', gDisk, '<svg viewBox="0 0 200 200" width="200" height="200"><circle cx="80" cy="80" r="62" fill="rgba(125,211,252,0.22)" stroke="#E2E8F0" stroke-width="14"/><path d="M126,126 L182,182" stroke="#E2E8F0" stroke-width="24" stroke-linecap="round"/><path d="M48,58 Q62,38 86,38" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".75"/></svg>');
const dataBadge = pos(mk('tag', gDisk, '👀 Data ఇంకా ఇక్కడే ఉంది!'), 0, 432); Object.assign(dataBadge.style, { background: '#FDE047', color: '#1A1200' });
// recover: new file + threat arrow + recovery window + scanline
const newFile = mk('abs newfile', gDisk, `<div style="width:92px;height:112px">${svgFile('#FDBA74', '#EA580C')}</div><div style="font-size:40px;font-weight:800;margin-top:4px;line-height:1.3">కొత్త File</div><div style="font-size:26px;font-weight:700;color:#FED7AA;text-align:center;line-height:1.35;margin-top:4px;white-space:nowrap">⚠️ Overwrite అయితే<br>ఇక తిరిగి రాదు!</div>`);
const threat = mk('layer', gDisk, `<svg width="1080" height="1920" style="position:absolute;left:0;top:0;overflow:visible"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z" fill="#FB923C"/></marker></defs><path id="threatPath" d="M870,796 C900,640 840,520 700,452" stroke="#FB923C" stroke-width="9" fill="none" stroke-dasharray="20 16" stroke-linecap="round" marker-end="url(#ah)"/></svg>`);
const threatPath = threat.querySelector('#threatPath');
const win = mk('abs card window', gDisk, `<div class="bar"><i style="background:#F87171"></i><i style="background:#FBBF24"></i><i style="background:#34D399"></i><span style="margin-left:14px">🔍 Recovery Software</span></div>
  <div id="wtxt" style="position:absolute;left:32px;top:86px;font-size:36px;font-weight:800">Deleted Files వెతుకుతోంది...</div>
  <div id="pct" style="position:absolute;right:32px;top:92px;font-family:Poppins;font-weight:800;font-size:34px;color:#22D3EE">0%</div>
  <div class="pbar"><i id="pfill"></i></div>
  <div id="wres" style="position:absolute;left:32px;top:216px;width:576px;height:82px;border-radius:22px;background:rgba(52,211,153,0.16);border:3px solid #34D399;display:flex;align-items:center;gap:16px;padding:0 20px;font-family:Poppins;font-weight:800;font-size:34px"><div style="width:56px;height:56px">${svgPhoto()}</div>photo.jpg<span style="margin-left:auto;color:#34D399">✅ Recovered!</span></div>`);
const wtxt = win.querySelector('#wtxt'), pct = win.querySelector('#pct'), pfill = win.querySelector('#pfill'), wres = win.querySelector('#wres');
const scan = mk('scanline', gDisk);

// timings for the disk scenes
T.grid = S.storage + 0.02;
T.idx = V[17] - 0.12;
T.idxMove = S.delete - 0.02;
T.bin = S.delete + 0.08;
T.lidOpen = V[26] - 0.15; T.fly = V[26] - 0.05; T.drop = V[27] + 0.05; T.lidClose = T.drop + 0.12;
T.keys = V[29] - 0.12; T.k1 = V[30] - 0.05; T.k2 = V[30] + 0.18; T.empty = T.k2 + 0.28;
T.strike = V[33] - 0.05; T.erase = V[34] + 0.05; T.badge = V[35] + 0.25;
T.free = V[38] - 0.05; T.freeTag = V[39] - 0.05;
T.lens = V[41] - 0.05; T.dataBadge = V[42] + 0.05;
T.newFile = V[45] - 0.05; T.threat = V[49] - 0.1;
T.win = V[52] - 0.45; T.scan0 = T.win + 0.25; T.scan1 = V[55] - 0.05; T.rec = V[55];
T.diskOut = S.ssd - 0.12;
sfx(T.grid, 'shimmer', 0.6);
fchips.forEach(c => sfx(c.a, 'pop', 0.55));
sfx(V[12] - 0.35, 'data', 0.75);
sfx(V[15], 'popLow', 0.5);
sfx(T.idx, 'whooshS', 0.55);
rows.forEach(r => sfx(r.a, 'type', 0.7));
sfx(T.idxMove, 'whooshS', 0.5); sfx(T.bin + 0.05, 'pop', 0.7);
sfx(T.lidOpen, 'lid', 0.6); sfx(T.fly, 'whooshS', 0.5); sfx(T.drop, 'drop', 0.9);
sfx(T.keys, 'pop', 0.6); sfx(T.k1, 'key', 0.9); sfx(T.k2, 'key', 0.9); sfx(T.empty, 'crumple', 0.8);
sfx(T.strike, 'scribble', 0.8); sfx(T.erase, 'eraser', 0.85); sfx(T.badge, 'popLow', 0.6);
sfx(T.free, 'shimmer', 0.35); sfx(T.freeTag, 'stampS', 0.8);
sfx(T.lens, 'whooshS', 0.45); sfx(T.dataBadge, 'sparkle', 0.85);
sfx(T.newFile, 'pop', 0.7); sfx(T.threat, 'alarm', 0.6);
sfx(T.win, 'pop', 0.7); sfx(T.scan0, 'scan', 0.6); sfx(T.rec, 'success', 0.9);

function renderDisk(t) {
  groupIO(gDisk, t, S.storage - 0.08, T.diskOut);
  if (t < S.storage - 0.2 || t > T.diskOut + 0.5) return;
  popIO(disk, t, S.storage - 0.05, 99, { dy: 60, s0: 0.85 });
  // lens position
  const lu = E.io(P(t, T.lens, 1.15)), lensX = lerp(250, 930, lu), lensY = 371 + Math.sin(lu * Math.PI * 2) * 12;
  const lensOn = t > T.lens - 0.1 && t < S.recover + 0.1;
  tf(lens, lensX - 80, lensY - 80, lensOn ? E.back(P(t, T.lens, 0.3)) : 1, -10, lensOn ? P(t, T.lens, 0.15) * (1 - P(t, S.recover - 0.3, 0.3)) : 0);
  // scanline sweep
  const su = P(t, T.scan0, T.scan1 - T.scan0);
  const sy = GY - 10 + (1 - Math.abs(1 - 2 * ((su * 2) % 1))) * 400;
  tf(scan, 0, sy, 1, 0, su > 0 && su < 1 ? 0.9 : 0);
  scan.style.top = '0px';
  blocks.forEach((b, i) => {
    const order = (i % 8) + Math.floor(i / 8) * 1.5;
    const ap = E.back(P(t, T.grid + order * 0.035, 0.35));
    let bgA = 0.05, bc = 'rgba(255,255,255,0.12)', tc = 'rgba(255,255,255,0.22)', dashed = false, glow = 0, gcol = '#fff', s = 1;
    if (b.k) {
      const f = P(t, fillT[i], 0.22);
      const col = COL[b.k];
      bgA = lerp(0.05, 0.5, f); bc = hexA(col, lerp(0.12, 0.95, f)); tc = `rgba(255,255,255,${lerp(0.22, 0.9, f).toFixed(3)})`;
      s = 1 + pulse(t, fillT[i], 0.3) * 0.18 + pulse(t, V[15], 0.35) * 0.06;
      const row = rows.find(r => r.k === b.k);
      glow = pulse(t, row.a, 0.9);
      gcol = col;
      if (b.k === 'photo') {
        const fr = P(t, T.free, 0.4);
        if (fr > 0) { bgA = lerp(0.5, 0.14, fr); bc = hexA(col, lerp(0.95, 0.6, fr)); tc = `rgba(255,255,255,${lerp(0.9, 0.3, fr).toFixed(3)})`; dashed = fr > 0.4; }
        const rv = t > T.lens ? P(lensX, b.x + 10, 60) : 0;
        if (rv > 0) { bgA = lerp(bgA, 0.42, rv); tc = `rgba(224,242,254,${lerp(0.3, 1, rv).toFixed(3)})`; glow = Math.max(glow, rv * (1 - P(t, S.recover, 0.4)) * 0.8); }
        const rec = pulse(t, T.rec, 0.9);
        if (rec > 0) { glow = Math.max(glow, rec); gcol = '#34D399'; }
        const thr = t > T.threat && t < T.win ? (0.5 + 0.5 * Math.sin(t * 14)) * P(t, T.threat, 0.2) : 0;
        if (thr > 0) { glow = Math.max(glow, thr * 0.9); gcol = '#FB923C'; }
      }
    }
    const st = b.e.style;
    st.background = `rgba(${b.k ? rgb(COL[b.k]) : '255,255,255'},${bgA.toFixed(3)})`;
    st.borderColor = bc; st.borderStyle = dashed ? 'dashed' : 'solid'; st.color = tc;
    st.boxShadow = glow > 0.01 ? `0 0 ${(30 * glow).toFixed(1)}px ${hexA(gcol, 0.8 * glow)}` : 'none';
    tf(b.e, 0, (1 - ap) * 30, lerp(0.4, 1, ap) * s, 0, P(t, T.grid + order * 0.035, 0.15));
  });
  // file chips + bit streams (storage)
  fchips.forEach(c => popIO(c.e, t, c.a, V[16] + 0.5, { dy: 40, s0: 0.5 }));
  streams.forEach(s => {
    const u = P(t, s.t0, 0.42); const [bx, by] = bpos(s.b);
    const x = lerp(s.sx, bx + 30, E.io(u)), y = lerp(s.sy, by + 10, E.io(u)) - Math.sin(u * Math.PI) * 60;
    tf(s.e, x, y, 1, 0, u > 0 && u < 1 ? 1 : 0);
  });
  // index card: centered in storage, slides left for delete, exits at recovery window
  const mv = E.io(P(t, T.idxMove, 0.5));
  const iIn = E.back(P(t, T.idx, 0.45)), iOut = E.io(P(t, T.win - 0.2, 0.3));
  tf(index, -150 * mv - iOut * 120, (1 - iIn) * 80, lerp(0.8, 1, iIn), 0, P(t, T.idx, 0.2) * (1 - iOut));
  rows.forEach(r => {
    const u = E.out(P(t, r.a, 0.35));
    tf(r.r, (1 - u) * -60, 0, 1, 0, P(t, r.a, 0.2));
  });
  // row 1 life-cycle: -> bin tag -> strike -> erase -> badge
  const inBin = P(t, T.drop, 0.2) * (1 - P(t, T.empty, 0.25));
  tf(binTag, 0, 0, lerp(0.6, 1, E.back(P(t, T.drop, 0.3))), 0, inBin);
  row1.rc.style.opacity = (1 - 0.45 * inBin) * (1 - P(t, T.erase + 0.1, 0.45));
  tf(strike, 0, 0, 1, 0, t > T.strike ? 1 - P(t, T.erase + 0.2, 0.35) : 0, 1);
  strike.style.transform = `scaleX(${E.out(P(t, T.strike, 0.35)).toFixed(3)})`;
  const eu = P(t, T.erase, 0.6);
  tf(eraser, lerp(-20, 520, eu), Math.sin(eu * Math.PI * 6) * 6, 1, -8 + Math.sin(eu * Math.PI * 6) * 6, eu > 0 && eu < 1 ? 1 : 0);
  tf(delBadge, (1 - E.back(P(t, T.badge, 0.35))) * -30, 0, 1, 0, P(t, T.badge, 0.2));
  // bin
  popIO(bin, t, T.bin, S.recover - 0.05, { dy: 60, s0: 0.5 });
  const lid = E.out(P(t, T.lidOpen, 0.2)) * (1 - E.out(P(t, T.lidClose, 0.18))) + pulse(t, T.empty - 0.05, 0.35) * 0.8;
  binLid.setAttribute('transform', `rotate(${(-38 * lid).toFixed(2)} 20 44)`);
  const bshake = pulse(t, T.empty - 0.1, 0.4);
  bin.querySelector('svg').style.transform = `rotate(${(Math.sin(t * 60) * 7 * bshake).toFixed(2)}deg)`;
  binPuff.forEach(p => { const u = E.out(P(t, T.empty, 0.6)); tf(p.p, 877 + p.dx * p.d * u - 13, 860 + p.dy * p.d * u - 13, 1 - u * 0.5, p.r * u, u > 0 && u < 1 ? 1 - u : 0); });
  // flying photo icon row1 -> bin
  const fu = P(t, T.fly, T.drop - T.fly);
  const fx = lerp(100, 835, E.io(fu)), fy = lerp(880, 840, fu) - Math.sin(fu * Math.PI) * 220;
  tf(flyIcon, fx, fy, lerp(1, 0.6, fu), fu * 200, fu > 0 && fu < 1 ? 1 : 0);
  // keys
  const ki = E.back(P(t, T.keys, 0.35)), ko = E.io(P(t, T.empty + 0.15, 0.3));
  tf(keys, 0, (1 - ki) * 60, lerp(0.7, 1, ki) * (1 - ko * 0.2), 0, P(t, T.keys, 0.15) * (1 - ko));
  [[kShift, T.k1], [kDel, T.k2]].forEach(([k, kt]) => {
    const pr = t > kt ? 1 - P(t, kt + 0.55, 0.2) : 0;
    k.style.transform = `translateY(${(pr * 12).toFixed(1)}px)`;
    k.style.boxShadow = `0 ${(14 - pr * 11).toFixed(1)}px 0 #64748B, 0 30px 50px rgba(0,0,0,0.5)`;
    k.style.background = pr > 0.5 ? 'linear-gradient(180deg,#FDE68A,#FBBF24)' : '';
  });
  // free tag + data badge (centered over photo blocks)
  const ptsX = (bpos(2)[0] + bpos(6)[0] + BW) / 2;
  const fw = freeTag.offsetWidth, dw = dataBadge.offsetWidth;
  const ftI = E.out(P(t, T.freeTag, 0.18));
  tf(freeTag, ptsX - fw / 2, 0, lerp(1.9, 1, ftI), -4, P(t, T.freeTag, 0.08) * (1 - P(t, T.win - 0.1, 0.3)) * (t > T.lens && t < T.lens + 1.2 ? 0.55 : 1));
  tf(dataBadge, ptsX - dw / 2, (1 - E.back(P(t, T.dataBadge, 0.4))) * 30, lerp(0.5, 1, E.back(P(t, T.dataBadge, 0.4))), 0, P(t, T.dataBadge, 0.15) * (1 - P(t, S.recover + 0.15, 0.3)));
  // new file + threat
  const nf = E.back(P(t, T.newFile, 0.45)), nfo = E.io(P(t, T.rec + 0.35, 0.35));
  tf(newFile, (1 - nf) * 200, Math.sin(t * 9) * 5 * P(t, T.threat, 0.2) - nfo * 40, lerp(0.6, 1, nf), Math.sin(t * 7) * 2 * P(t, T.threat, 0.2), P(t, T.newFile, 0.2) * (1 - nfo));
  threatPath.style.strokeDashoffset = (-t * 90).toFixed(1);
  tf(threat, 0, 0, 1, 0, P(t, T.threat - 0.1, 0.3) * (1 - P(t, T.rec - 0.05, 0.3)));
  // recovery window
  popIO(win, t, T.win, 99, { dy: 80, s0: 0.7 });
  const prog = P(t, T.scan0, T.scan1 - T.scan0);
  pfill.style.transform = `scaleX(${prog.toFixed(3)})`;
  pct.textContent = Math.round(prog * 100) + '%';
  wtxt.textContent = prog >= 1 ? 'Scan పూర్తయింది!' : 'Deleted Files వెతుకుతోంది...';
  const ri = E.back(P(t, T.rec, 0.4));
  tf(wres, 0, (1 - ri) * 30, lerp(0.6, 1, ri), 0, P(t, T.rec, 0.15));
}

// ---------------------------------------------------------------- SSD / PHONE / METER
const gSSD = mk('layer');
const pA = pos(mk('abs card panel', gSSD, `<h3>SSD</h3>
  <svg style="position:absolute;left:30px;top:100px" width="396" height="120" viewBox="0 0 400 120"><rect x="0" y="8" width="372" height="104" rx="14" fill="#15803D"/><rect x="372" y="20" width="26" height="80" rx="4" fill="#CA8A04"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="376" y="${24 + i * 9.5}" width="20" height="5" fill="#FDE68A"/>`).join('')}
  <rect x="26" y="26" width="96" height="68" rx="8" fill="#0F172A"/><rect x="138" y="26" width="96" height="68" rx="8" fill="#0F172A"/><rect x="250" y="34" width="76" height="52" rx="8" fill="#1E293B"/>
  <text x="74" y="70" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="24" fill="#64748B">NAND</text><text x="186" y="70" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="24" fill="#64748B">NAND</text><circle cx="350" cy="60" r="9" fill="#0F172A"/></svg>
  <div class="ptag"><b style="color:#22D3EE">TRIM 🧹</b><span>ఖాళీ Blocks ని వెంటనే క్లీన్ చేస్తుంది</span></div>`), 70, 270);
const minis = Array.from({ length: 6 }, (_, i) => { const e = pos(mk('mini', pA, i % 2 ? '1' : '0'), 23 + i * 70 + 12, 244); return e; });
const broom = mk('abs', pA, '<div style="font-size:120px;line-height:1">🧹</div>');
const pAtag = pA.querySelector('.ptag');
const pB = pos(mk('abs card panel', gSSD, `<h3>Phones</h3>
  <svg style="position:absolute;left:44px;top:98px" width="128" height="220" viewBox="0 0 140 240"><rect x="4" y="4" width="132" height="232" rx="24" fill="#0F172A" stroke="#94A3B8" stroke-width="7"/><rect x="50" y="14" width="40" height="8" rx="4" fill="#334155"/>
  <g id="lockG" transform="translate(70,132)"><path id="shackle" d="M-20,0 L-20,-22 A20,20 0 0 1 20,-22 L20,0" stroke="#FDE047" stroke-width="10" fill="none"/><rect x="-32" y="-4" width="64" height="52" rx="10" fill="#FDE047"/><circle cx="0" cy="18" r="7" fill="#713F12"/><rect x="-3" y="20" width="6" height="14" rx="3" fill="#713F12"/></g></svg>
  <div id="scr" style="position:absolute;left:196px;top:104px;width:236px;height:210px;font-family:Poppins;font-weight:800;font-size:31px;line-height:1.38;color:#7DD3FC;word-break:break-all"></div>
  <div class="ptag"><b style="color:#FDE047">Encryption 🔐</b><span>Data మొత్తం Lock అయి ఉంటుంది</span></div>`), 555, 270);
const shackle = pB.querySelector('#shackle'), scr = pB.querySelector('#scr'), pBtag = pB.querySelector('.ptag');
const meter = mk('abs card meter', gSSD, `<div class="lb"><span>Recovery Chance</span><span id="mp">100%</span></div><div class="track"><i id="mf"></i></div><div class="big">దాదాపు అసాధ్యం ❌</div>`);
const mp = meter.querySelector('#mp'), mf = meter.querySelector('#mf'), mbig = meter.querySelector('.big');
T.pA = V[57] - 0.18; T.pB = V[59] - 0.18; T.trim = V[60]; T.enc = V[61]; T.meter = V[63] - 0.15; T.drain = V[63]; T.imp = V[65] - 0.05; T.ssdOut = V[67] - 0.32;
sfx(T.pA, 'pop', 0.7); sfx(T.pB, 'pop', 0.7); sfx(T.trim, 'swoosh', 0.9); sfx(T.enc + 0.12, 'lock', 1); sfx(T.enc + 0.2, 'glitch', 0.3);
sfx(T.meter, 'whooshS', 0.5); sfx(T.drain, 'down', 0.6); sfx(T.imp, 'buzz', 0.8);
const SCR_BITS = '1011 0110 0010 1101 0111 1000 0101 1110 0011', SCR_SYM = '#@%&*$!?~^<>¥§∆≠';
function renderSSD(t) {
  groupIO(gSSD, t, S.ssd - 0.1, T.ssdOut);
  if (t < S.ssd - 0.3 || t > T.ssdOut + 0.5) return;
  popIO(pA, t, T.pA, 99, { dx: -120, dy: 0, s0: 0.7 });
  popIO(pB, t, T.pB, 99, { dx: 120, dy: 0, s0: 0.7 });
  const bu = E.io(P(t, T.trim, 0.75)), bx = lerp(-40, 400, bu);
  tf(broom, bx, 190 + Math.sin(bu * Math.PI * 5) * 10, 1, -25 + Math.sin(bu * Math.PI * 5) * 14, bu > 0 && bu < 1 ? 1 : 0);
  minis.forEach((m, i) => {
    const cx = 23 + i * 70 + 12 + 29; const cleared = t > T.trim && bx + 70 > cx;
    m.style.background = cleared ? 'rgba(255,255,255,0.05)' : 'rgba(56,189,248,0.5)';
    m.style.borderColor = cleared ? 'rgba(255,255,255,0.18)' : '#38BDF8';
    m.style.color = cleared ? 'rgba(255,255,255,0.35)' : '#fff';
    m.textContent = cleared ? '0' : (i % 2 ? '1' : '0');
    tf(m, 0, 0, cleared ? 1 + pulse(t, T.trim + (cx - 40) / 440 * 0.75 * 0.9, 0.25) * 0.15 : 1, 0, 1);
  });
  tf(pAtag, 0, (1 - E.back(P(t, T.trim + 0.2, 0.4))) * 30, 1, 0, P(t, T.trim + 0.2, 0.2));
  const lk = E.out(P(t, T.enc, 0.2));
  shackle.setAttribute('transform', `translate(0 ${(-16 * (1 - lk)).toFixed(2)})`);
  const enc = t > T.enc + 0.1;
  const fr = Math.floor(t * 12);
  scr.style.color = enc ? '#FDE047' : '#7DD3FC';
  scr.textContent = enc ? SCR_BITS.split('').map((c, i) => (c === ' ' ? ' ' : SCR_SYM[(i * 7 + fr * 3) % SCR_SYM.length])).join('') : SCR_BITS;
  tf(pBtag, 0, (1 - E.back(P(t, T.enc + 0.2, 0.4))) * 30, 1, 0, P(t, T.enc + 0.2, 0.2));
  popIO(meter, t, T.meter, 99, { dy: 80, s0: 0.8 });
  const v = 1 - 0.97 * E.io(P(t, T.drain, 1.1));
  mf.style.transform = `scaleX(${v.toFixed(3)})`;
  mf.style.background = `hsl(${(v * 140).toFixed(0)}, 85%, 55%)`;
  mp.textContent = Math.round(v * 100) + '%';
  mp.style.color = `hsl(${(v * 140).toFixed(0)}, 85%, 62%)`;
  const bi = E.back(P(t, T.imp, 0.4));
  tf(mbig, Math.sin(t * 70) * 6 * pulse(t, T.imp + 0.2, 0.35), (1 - bi) * 20, lerp(0.5, 1, bi), 0, P(t, T.imp, 0.15));
}

// ---------------------------------------------------------------- CLOUD TRASH + DAY COUNTER
const gCloud = mk('layer');
const cloudC = mk('abs card cloudc', gCloud, (() => { const [g, d] = grad('#E0F2FE', '#7DD3FC'); return `
  <svg style="position:absolute;left:36px;top:66px" width="330" height="240" viewBox="0 0 320 230">${d}<path d="M80,196 C28,196 6,152 28,120 C40,96 64,88 86,92 C94,48 134,26 174,34 C210,40 232,66 238,98 C276,94 308,120 304,158 C300,184 276,198 252,196 Z" fill="url(#${g})"/>
  <g transform="translate(160,138)"><rect x="-36" y="-40" width="72" height="12" rx="5" fill="#0369A1"/><rect x="-12" y="-50" width="24" height="10" rx="4" fill="#0369A1"/><path d="M-30,-24 L30,-24 L24,40 Q23,46 17,46 L-17,46 Q-23,46 -24,40Z" fill="#0284C7"/><path d="M-12,-12 L-10,34 M0,-12 L0,34 M12,-12 L10,34" stroke="#BAE6FD" stroke-width="5" stroke-linecap="round"/></g></svg>
  <div class="cl" style="position:absolute;left:400px;top:52px;font-size:56px;font-weight:800">🖼️ Gallery</div>
  <div class="cl" style="position:absolute;left:400px;top:138px;font-size:56px;font-weight:800">☁️ Cloud Trash</div>
  <div class="cl" style="position:absolute;left:404px;top:236px;font-family:Poppins;font-weight:700;font-size:28px;line-height:1.5;opacity:.75">Recently Deleted / Trash<br>Google Photos • iCloud • Drive</div>`; })());
const cls = [...cloudC.querySelectorAll('.cl')];
const countC = mk('abs card countc', gCloud, `<div class="ring"><svg width="350" height="350" viewBox="0 0 350 350"><circle cx="175" cy="175" r="150" stroke="rgba(255,255,255,.1)" stroke-width="28" fill="none"/>
  <circle id="ringArc" cx="175" cy="175" r="150" stroke="#FDE047" stroke-width="28" fill="none" stroke-linecap="round" transform="rotate(-90 175 175)" stroke-dasharray="942.5" stroke-dashoffset="942.5"/></svg>
  <div class="num" id="dnum">0</div><div class="unit">రోజులు</div></div>
  <div class="ctext"><div class="c1" style="font-size:54px;white-space:nowrap">Trash లో ఉంటాయి</div><div class="c2" style="font-size:38px;color:#FDBA74;margin-top:18px">⚠️ తర్వాత Auto-Delete</div><div class="c3" style="font-size:38px;color:#6EE7B7;margin-top:8px">✅ ఈలోపే Restore చేసుకోండి!</div></div>`);
const ringArc = countC.querySelector('#ringArc'), dnum = countC.querySelector('#dnum');
const clines = ['.c1', '.c2', '.c3'].map(s => countC.querySelector(s));
T.cloud = V[67] - 0.15; T.cl = [V[67], V[68], V[69] + 0.1]; T.count = V[70] - 0.2; T.n30 = V[71]; T.n60 = V[73]; T.cl2 = [V[69], V[74], V[75]]; T.cloudOut = S.tips - 0.3;
sfx(T.cloud, 'pop', 0.7); T.cl.forEach(x => sfx(x, 'popLow', 0.45)); sfx(T.count, 'whooshS', 0.5);
for (let k = 0; k < 6; k++) sfx(T.n30 - 0.3 + k * 0.08, 'tick', 0.45);
sfx(T.n30 + 0.15, 'ding', 0.6);
for (let k = 0; k < 5; k++) sfx(T.n60 - 0.25 + k * 0.08, 'tick', 0.45);
sfx(T.n60 + 0.2, 'ding', 0.8);
T.cl2.forEach(x => sfx(x, 'popLow', 0.45));
function renderCloud(t) {
  groupIO(gCloud, t, T.cloud - 0.05, T.cloudOut);
  if (t < T.cloud - 0.3 || t > T.cloudOut + 0.5) return;
  popIO(cloudC, t, T.cloud, 99, { dy: 70, s0: 0.75 });
  cls.forEach((c, i) => popIO(c, t, T.cl[i], 99, { dx: 60, dy: 0, s0: 0.8 }));
  popIO(countC, t, T.count, 99, { dy: 80, s0: 0.75 });
  let n = 30 * E.out(P(t, T.n30 - 0.3, 0.45));
  n += 30 * E.out(P(t, T.n60 - 0.25, 0.45));
  dnum.textContent = Math.round(n);
  tf(dnum, 0, 0, 1 + pulse(t, T.n30 + 0.1, 0.3) * 0.15 + pulse(t, T.n60 + 0.15, 0.3) * 0.18, 0, 1);
  ringArc.setAttribute('stroke-dashoffset', (942.5 * (1 - n / 60)).toFixed(1));
  clines.forEach((c, i) => popIO(c, t, T.cl2[i], 99, { dx: 50, dy: 0, s0: 0.85 }));
}

// ---------------------------------------------------------------- TIPS
const gTips = mk('layer');
const tipIcons = [
  `<svg viewBox="0 0 130 130"><rect x="30" y="8" width="70" height="114" rx="14" fill="#0F172A" stroke="#E2E8F0" stroke-width="6"/><g class="ti1"><circle cx="65" cy="65" r="34" fill="#EF4444"/><rect x="45" y="58" width="40" height="14" rx="5" fill="#fff"/></g></svg>`,
  `<svg viewBox="0 0 130 130"><g class="paper"><rect x="38" y="-6" width="54" height="60" rx="6" fill="#F8FAFC"/><rect x="46" y="8" width="38" height="6" rx="3" fill="#94A3B8"/><rect x="46" y="20" width="30" height="6" rx="3" fill="#94A3B8"/></g>
   <rect x="14" y="46" width="102" height="44" rx="12" fill="#64748B"/><rect x="28" y="62" width="74" height="7" rx="3" fill="#0F172A"/>
   ${Array.from({ length: 6 }, (_, i) => `<rect class="strip" x="${34 + i * 11}" y="90" width="7" height="30" rx="2" fill="#F8FAFC"/>`).join('')}</svg>`,
  `<svg viewBox="0 0 130 130"><rect x="40" y="22" width="50" height="86" rx="10" fill="#0F172A" stroke="#E2E8F0" stroke-width="5"/>
   <g class="spin"><path d="M65,6 A59,59 0 1 1 10,44" stroke="#22D3EE" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M0,38 L14,30 L18,50Z" fill="#22D3EE"/></g></svg>`,
];
const tipDefs = [
  ['#F97316', 'పొరపాటున Delete అయితే?', 'వెంటనే Device వాడటం ఆపి, Recovery App తో Recover చేయండి'],
  ['#8B5CF6', 'పూర్తిగా చెరపాలంటే', 'Shredder Tools, Data పై Overwrite చేసి పూర్తిగా తుడిచేస్తాయి'],
  ['#0EA5E9', 'Phone అమ్మేముందు', 'Factory Reset తప్పనిసరి. Encryption Key పోయి, Data ఎవరూ చదవలేరు'],
];
const tips = tipDefs.map(([c, h, p], i) => {
  const e = pos(mk('abs card tip', gTips, `<div class="ic" style="background:${hexA(c, 0.25)};border:3px solid ${c}">${tipIcons[i]}</div><div class="nb">${i + 1}</div><h4 style="color:${['#FDBA74', '#C4B5FD', '#7DD3FC'][i]}">${h}</h4><p>${p}</p>
    <div class="ck"><svg width="46" height="46" viewBox="0 0 46 46"><path d="M10,24 L19,33 L37,13" stroke="#06281C" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`), 70, 262 + i * 280);
  return { e, ck: e.querySelector('.ck'), ic: e.querySelector('.ic svg'), a: [V[76], V[85], V[89]][i] - 0.12, c: [V[84], V[88], V[93]][i] + 0.1 };
});
const paper = tips[1].e.querySelector('.paper'), strips = [...tips[1].e.querySelectorAll('.strip')], spin = tips[2].e.querySelector('.spin'), ti1 = tips[0].e.querySelector('.ti1');
T.tipsOut = S.outro - 0.3;
tips.forEach(tp => { sfx(tp.a, 'whoosh', 0.6); sfx(tp.c, 'check', 0.8); });
sfx(tips[1].a + 0.5, 'shred', 0.6); sfx(tips[2].a + 0.45, 'spin', 0.5);
function renderTips(t) {
  groupIO(gTips, t, S.tips - 0.08, T.tipsOut);
  if (t < S.tips - 0.3 || t > T.tipsOut + 0.5) return;
  tips.forEach((tp, i) => {
    const u = E.back(P(t, tp.a, 0.5));
    const focus = t > tp.a && (i === 2 || t < tips[i + 1].a) ? 1 : 0.0;
    tf(tp.e, (1 - u) * 700, 0, 1 + 0.015 * focus, 0, P(t, tp.a, 0.25));
    tp.e.style.borderColor = focus ? hexA(tipDefs[i][0], 0.9) : 'rgba(148,163,255,0.22)';
    tp.e.style.boxShadow = focus ? `0 0 50px ${hexA(tipDefs[i][0], 0.35)}, 0 24px 60px rgba(0,0,0,0.45)` : '';
    const ck = E.back(P(t, tp.c, 0.4));
    tf(tp.ck, 0, 0, lerp(0, 1, ck), (1 - ck) * -90, P(t, tp.c, 0.1));
  });
  ti1.setAttribute('transform', `rotate(${(Math.sin(t * 9) * 8 * pulse(t, tips[0].a + 0.3, 1.4)).toFixed(2)} 65 65)`);
  const pu = ((t - tips[1].a - 0.4) % 1.1 + 1.1) % 1.1 / 1.1;
  paper.setAttribute('transform', `translate(0 ${(t > tips[1].a ? pu * 56 : 0).toFixed(1)})`);
  strips.forEach((s, i) => s.setAttribute('height', (t > tips[1].a + 0.5 ? 14 + 18 * Math.abs(Math.sin(t * 6 + i)) : 0).toFixed(1)));
  spin.setAttribute('transform', `rotate(${(t > tips[2].a ? (t - tips[2].a) * 260 : 0).toFixed(1)} 65 65)`);
}

// ---------------------------------------------------------------- OUTRO
const gOut = mk('layer');
const otitle = mk('abs otitle', gOut, '<span>మరిన్ని</span> <span style="color:#22D3EE">Tech Facts</span> <span>కోసం</span>');
const otw = [...otitle.querySelectorAll('span')];
otw.forEach(s => (s.style.display = 'inline-block'));
const follow = mk('abs follow', gOut, '<span id="f1">+ Follow</span><span id="f2" style="position:absolute">Following ✓</span><div id="bell" style="position:absolute;right:-128px;top:22px;font-size:104px;line-height:1">🔔</div>');
const f1 = follow.querySelector('#f1'), f2 = follow.querySelector('#f2'), bell = follow.querySelector('#bell');
const social = mk('abs social', gOut, '<div class="s"><span>❤️</span><b>Like</b></div><div class="s"><span>📤</span><b>Share</b></div><div class="s"><span>🔖</span><b>Save</b></div>');
const socials = [...social.querySelectorAll('.s')];
const confetti = []; { const R = rng(77); const cols = ['#FDE047', '#F472B6', '#22D3EE', '#34D399', '#A78BFA', '#FB923C']; for (let i = 0; i < 46; i++) { const c = mk('confetti', gOut); c.style.background = cols[i % cols.length]; const a = -Math.PI / 2 + (R() - 0.5) * 2.6; confetti.push({ c, vx: Math.cos(a) * (500 + R() * 700), vy: Math.sin(a) * (700 + R() * 700), r: R() * 900 - 450 }); } }
T.otitle = V[94] - 0.12; T.follow = V[97] - 0.35; T.ftap = V[98] + 0.12; T.social = V[99] + 0.25;
sfx(T.otitle, 'pop', 0.6); sfx(T.follow, 'pop', 0.8); sfx(T.follow + 0.3, 'bell', 0.55);
sfx(T.ftap, 'click', 1); sfx(T.ftap + 0.03, 'confetti', 0.8); sfx(T.ftap + 0.05, 'success', 0.8);
socials.forEach((s, i) => sfx(T.social + i * 0.15, 'popLow', 0.5));
sfx(END - 1.75, 'impact', 0.55);
function renderOutro(t) {
  groupIO(gOut, t, S.outro - 0.1, END + 5);
  if (t < S.outro - 0.3) return;
  otw.forEach((s, i) => { const u = E.back(P(t, [V[94], V[95], V[97]][i] - 0.1, 0.4)); tf(s, 0, (1 - u) * 50, lerp(0.4, 1, u), 0, P(t, [V[94], V[95], V[97]][i] - 0.1, 0.15)); });
  const fi = E.back(P(t, T.follow, 0.5));
  const tap = pulse(t, T.ftap - 0.05, 0.22);
  const beat = t > T.ftap ? 0 : Math.sin(t * 9) * 0.025 * P(t, T.follow + 0.5, 0.3);
  tf(follow, 0, (1 - fi) * 80, lerp(0.4, 1, fi) * (1 - tap * 0.08 + beat), 0, P(t, T.follow, 0.2));
  const done = P(t, T.ftap, 0.15);
  f1.style.opacity = 1 - done; f2.style.opacity = done;
  follow.style.background = done > 0.5 ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#F43F5E,#F97316)';
  bell.style.transform = `rotate(${(Math.sin(t * 22) * 22 * Math.max(pulse(t, T.follow + 0.3, 0.9), pulse(t, T.ftap, 0.9))).toFixed(1)}deg)`;
  socials.forEach((s, i) => popIO(s, t, T.social + i * 0.15, 99, { dy: 60, s0: 0.5 }));
  const ct = t - T.ftap;
  confetti.forEach(c => { if (ct < 0 || ct > 2.4) { c.c.style.visibility = 'hidden'; return; } tf(c.c, 540 + c.vx * ct * 0.6, 650 + c.vy * ct * 0.6 + 900 * ct * ct, 1, c.r * ct, 1 - P(ct, 1.6, 0.8)); });
  // cursor tap on follow
  const cu = E.io(P(t, T.follow + 0.4, T.ftap - T.follow - 0.45));
  const show = t > T.follow + 0.35 && t < T.ftap + 0.6;
  if (show) tf(cursor, lerp(960, 600, cu), lerp(1250, 650, cu), 1 - tap * 0.16, 0, P(t, T.follow + 0.35, 0.15) * (1 - P(t, T.ftap + 0.3, 0.3)));
}

// ---------------------------------------------------------------- CAPTIONS
const caps = $('#caps');
const EMPH = { 10: '#FF5A6E', 52: '#7CF29A', 53: '#7CF29A', 54: '#7CF29A', 78: '#FF5A6E', 84: '#FFE14D', 86: '#FFE14D', 113: '#FFE14D' };
const chunks = []; { let cur = [];
  words.forEach((w, i) => { cur.push(i); const txt = cur.map(j => words[j].text).join(' '); const nx = words[i + 1];
    if (w.end || !nx || nx.scene !== w.scene || cur.length >= 4 || txt.length >= 18 || (/,$/.test(w.text) && cur.length >= 2)) { chunks.push(cur); cur = []; } }); }
const capEls = chunks.map((idx, ci) => {
  const e = mk('cap', caps, idx.map(i => `<span>${words[i].text}</span>`).join(''));
  const a = W[idx[0]] - 0.1;
  const nextA = chunks[ci + 1] ? W[chunks[ci + 1][0]] - 0.1 : END;
  const lastEnd = WE[idx[idx.length - 1]];
  const b = Math.min(nextA, nextA - lastEnd > 0.6 ? lastEnd + 0.4 : nextA);
  return { e, idx, spans: [...e.querySelectorAll('span')], a, b, cut: nextA - b < 0.15 };   // back-to-back lines hard-cut, like a human edit
});
function renderCaps(t) {
  capEls.forEach(c => {
    if (t < c.a - 0.01 || t > c.b + 0.12 || (c.cut && t >= c.b)) { c.e.style.visibility = 'hidden'; return; }
    const w = c.w || (c.w = c.e.offsetWidth);
    const fit = Math.min(1, 1000 / w);
    const i = E.back(P(t, c.a, 0.2)), o = c.cut ? 0 : P(t, c.b, 0.1);
    tf(c.e, -w / 2, 26 + (1 - i) * 22, lerp(0.86, 1, i) * fit * (1 - o * 0.06), 0, P(t, c.a, 0.06) * (1 - o));
    c.spans.forEach((s, k) => {
      const wi = c.idx[k];
      const active = t >= W[wi] - 0.03 && t < (W[wi + 1] ?? 1e9) - 0.03 && t < WE[wi] + 0.45;
      const said = t >= W[wi] - 0.03;
      const pop = E.out(P(t, W[wi] - 0.03, 0.12)) * (active ? 1 : 0);
      s.style.color = active ? '#FFE14D' : (EMPH[wi] || '#FFFFFF');
      s.style.opacity = said ? 1 : 0.6;
      s.style.transform = `scale(${(1 + 0.07 * pop).toFixed(3)}) translateY(${(-4 * pop).toFixed(1)}px)`;
    });
  });
}

// ---------------------------------------------------------------- HAND-DRAWN MARKER DOODLES
const SVGNS = 'http://www.w3.org/2000/svg';
const dsvg = document.createElementNS(SVGNS, 'svg'); dsvg.setAttribute('width', 1080); dsvg.setAttribute('height', 1920);
dsvg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none'; world.appendChild(dsvg);
const pts2d = p => 'M' + p.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L');
function roughCircle(cx, cy, rx, ry, seed) {
  const R = rng(seed), a0 = -2.3 + R() * 0.6, turns = 1.1 + R() * 0.08, N = 72, p = [];
  for (let k = 0; k <= N; k++) { const u = k / N, a = a0 + turns * 2 * Math.PI * u, j = 1 + (R() - 0.5) * 0.035 + 0.05 * Math.sin(u * 7 + seed) + 0.06 * u;
    p.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]); }
  return pts2d(p);
}
function roughLine(x1, y1, x2, y2, seed, bow = 0) {
  const R = rng(seed), N = 30, p = [], nx = -(y2 - y1), ny = x2 - x1, L = Math.hypot(nx, ny) || 1;
  for (let k = 0; k <= N; k++) { const u = k / N, b = bow * Math.sin(Math.PI * u) + (R() - 0.5) * 2.5;
    p.push([x1 + (x2 - x1) * u + nx / L * b, y1 + (y2 - y1) * u + ny / L * b]); }
  return { d: pts2d(p), end: p[N], prev: p[N - 3] };
}
function roughArrow(x1, y1, x2, y2, seed, bow) {
  const l = roughLine(x1, y1, x2, y2, seed, bow), ang = Math.atan2(l.end[1] - l.prev[1], l.end[0] - l.prev[0]), h = 34;
  const hd = [-0.5, 0.5].map(s => `M${(l.end[0] - Math.cos(ang + s) * h).toFixed(1)},${(l.end[1] - Math.sin(ang + s) * h).toFixed(1)} L${l.end[0].toFixed(1)},${l.end[1].toFixed(1)}`).join(' ');
  return l.d + ' ' + hd;
}
const DOODLES = [
  { d: roughArrow(858, 905, 800, 425, 3, -70), col: '#FFE14D', a: V[20] + 0.75, b: S.delete - 0.12 },          // Address List -> blocks
  { d: roughCircle(594, 371, 300, 62, 7), col: '#FFE14D', a: W[53] - 0.05, b: S.recover + 0.25 },           // "Data అక్కడే ఉంటుంది"
  { d: roughCircle(548, 1047, 142, 54, 11), col: '#FFE14D', a: T.rec + 0.12, b: S.ssd - 0.15 },             // Recovered!
  { d: roughLine(250, 1080, 830, 1074, 5, 6).d, col: '#FF5A6E', a: W[78] + 0.05, b: T.ssdOut },               // దాదాపు అసాధ్యం
  { d: roughLine(492, 884, 905, 878, 9, -5).d, col: '#FF5A6E', a: W[88] + 0.05, b: T.cloudOut },              // Auto-Delete warning
  { d: roughArrow(118, 905, 222, 700, 13, 40), col: '#FFE14D', a: T.follow + 0.3, b: T.ftap + 0.7 },         // Follow
].map((o, k) => {
  const g = document.createElementNS(SVGNS, 'g'); dsvg.appendChild(g);
  const mkp = (w, op, dx) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', o.d); p.setAttribute('fill', 'none');
    p.setAttribute('stroke', o.col); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    p.setAttribute('opacity', op); p.setAttribute('pathLength', '1'); p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('transform', `translate(${dx} ${-dx})`); g.appendChild(p); return p; };
  sfx(o.a, 'scribble', 0.5);
  return Object.assign(o, { g, paths: [mkp(10, 0.95, 0), mkp(4, 0.55, 2.2)] });
});
function renderDoodles(t) {
  DOODLES.forEach(o => {
    const u = E.out(P(t, o.a, 0.42)), out = P(t, o.b, 0.22);
    o.g.style.opacity = (t < o.a || out >= 1) ? 0 : 1 - out;
    o.paths.forEach(p => p.setAttribute('stroke-dashoffset', (1 - u).toFixed(4)));
  });
}

// ---------------------------------------------------------------- frame
const PUNCH = [[W[52], 0.05], [W[59], 0.035], [W[78], 0.05], [W[86], 0.035], [W[108], 0.04], [W[113], 0.04]];
const SHAKES = [[V[8] - 0.02, 22], [T.freeTag, 6], [T.imp, 7]];
world.style.transformOrigin = '540px 250px';
window.render = function (t) {
  renderBg(t);
  let sx = 0, sy = 0; SHAKES.forEach(([a, amp]) => { const d = t - a; if (d > 0 && d < 0.45) { const k = amp * Math.exp(-d * 9); sx += Math.sin(d * 95) * k; sy += Math.cos(d * 77) * k; } });
  // handheld feel: layered slow wobble + editor punch-ins on key words
  let zoom = 1.04 + 0.01 * Math.sin(t * 0.31);
  PUNCH.forEach(([a, amt]) => { const d = t - a; if (d > 0) zoom += amt * (d < 0.08 ? d / 0.08 : Math.exp(-(d - 0.08) * 3.2)); });
  const hx = 3.2 * Math.sin(t * 0.83 + 0.4) + 1.6 * Math.sin(t * 2.11 + 1.3) + 0.7 * Math.sin(t * 4.7 + 2.2);
  const hy = 2.6 * Math.sin(t * 0.67 + 2.0) + 1.4 * Math.sin(t * 1.93 + 0.2) + 0.6 * Math.sin(t * 5.3 + 1.1);
  const hr = 0.22 * Math.sin(t * 0.59 + 0.7) + 0.1 * Math.sin(t * 1.7);
  tf(world, sx + hx, sy + 34 + hy, zoom, hr, 1);
  flash.style.opacity = (0.32 * Math.max(pulse(t, T.no - 0.02, 0.16), 0) + 0.15 * pulse(t, T.rec, 0.2)).toFixed(3);
  renderChips(t);
  renderHook(t); renderDisk(t); renderSSD(t); renderCloud(t); renderTips(t); renderOutro(t);
  if (!(t > S.outro)) { /* hook cursor handled in renderHook */ }
  renderDoodles(t);
  renderCaps(t);
};
window.setup = async function () {
  await Promise.all(['800 40px "Baloo Tammudu 2"', '600 40px "Baloo Tammudu 2"', '700 40px "Poppins"', '800 40px "Poppins"', '600 40px "Poppins"'].map(f => document.fonts.load(f, 'అఆ abc 0123')));
  await document.fonts.ready; window.render(0); return { duration: END, sfx: SFX }; };
})();
