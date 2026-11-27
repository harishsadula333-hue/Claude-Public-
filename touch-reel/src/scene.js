// "How does a touchscreen know where we touched?" — deterministic three.js reel. window.render(t) draws frame t.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TL = window.TL, words = TL.words, W = words.map(w => w.t), WE = words.map(w => w.t + w.dur);
const S = {}; TL.scenes.forEach(s => (S[s.name] = s.t));
const LASTW = words[words.length - 1];
const END = Math.round((LASTW.t + LASTW.dur + 1.6) * 30) / 30; window.DURATION = END;
const Wi = i => W[i];
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, x) => a + (b - a) * x;
const E = { out: x => 1 - Math.pow(1 - x, 3), io: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: x => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); } };
const pulse = (t, a, d) => { const x = (t - a) / d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const SFX = []; const sfx = (t, name, gain = 1) => SFX.push({ t: +Math.max(0, t).toFixed(3), name, gain });

// ------------------------------------------------------------ renderer
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
// no PMREM environment map here: it came out corrupted in some parallel render workers (washed-out white surfaces).
// Lighting is done with hemisphere + key + rim + a soft fill instead, which is fully deterministic.
const camera = new THREE.PerspectiveCamera(45, 1080 / 1920, 0.01, 200);
const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x2a2438, 0.6); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2.0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 20 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x7dd3fc, 0.8); rim.position.set(-3, 2, -2); scene.add(rim);
const fill = new THREE.DirectionalLight(0xffe6cc, 0.7); fill.position.set(-2, 1.5, 3); scene.add(fill);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g, draw }; return t; }
const FONT = "'Poppins', sans-serif";
const std = (c, r = 0.5, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const mesh = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };
const glow = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: op, depthWrite: false });

// ------------------------------------------------------------ desk + backdrop
const desk = mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: ctex(512, 512, (g, w, h) => { g.fillStyle = '#5a3e2b'; g.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 300; i++) { g.strokeStyle = `rgba(30,18,10,${0.1 + R() * 0.15})`; g.lineWidth = 1 + R() * 2; g.beginPath(); const y = R() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + R() * 20 - 10, w * 0.6, y + R() * 20 - 10, w, y + R() * 10); g.stroke(); } }), roughness: 0.6 }), false);
desk.rotation.x = -Math.PI / 2; desk.position.y = 0; scene.add(desk);
const bokeh = Array.from({ length: 24 }, (_, i) => { const R = rng(i + 50); const m = new THREE.Mesh(new THREE.CircleGeometry(0.25 + R() * 0.4, 32), glow([0xffb36b, 0x7dd3fc, 0xf9a8d4][i % 3], 0.12 + R() * 0.12)); m.position.set((R() - 0.5) * 14, 1 + R() * 5, -6 - R() * 4); scene.add(m); return m; });

// ------------------------------------------------------------ PHONE (portrait, faces +z)
const PW = 0.76, PH = 1.6, phone = new THREE.Group(); scene.add(phone);
const homeTex = ctex(540, 1140, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2b1d6e'); gr.addColorStop(0.5, '#6b2f8f'); gr.addColorStop(1, '#f07a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = `700 26px ${FONT}`; g.fillText('9:41', 40, 50); g.font = `600 120px ${FONT}`; g.textAlign = 'center'; g.fillText('9:41', w / 2, 230); g.font = `600 30px ${FONT}`; g.fillText('Friday, 27 November', w / 2, 280);
  const cols = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6', '#6366f1', '#eab308', '#10b981', '#f43f5e', '#0ea5e9', '#8b5cf6'];
  const em = ['📞', '💬', '📷', '🎵', '🗺️', '📧', '🎮', '🛒', '📺', '☀️', '🎬', '📚', '💳', '❤️', '🔔', '⚙️'];
  for (let i = 0; i < 16; i++) { const x = 52 + (i % 4) * 116, y = 380 + Math.floor(i / 4) * 140; g.fillStyle = cols[i]; g.beginPath(); g.roundRect(x, y, 88, 88, 24); g.fill(); g.font = "54px 'Noto Color Emoji'"; g.fillText(em[i], x + 44, y + 64); }
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.roundRect(30, h - 150, w - 60, 120, 40); g.fill(); g.textAlign = 'left'; });
const body = mesh(new RoundedBoxGeometry(PW, PH, 0.07, 6, 0.08), std(0x15171c, 0.3, 0.7)); body.position.z = -0.04; phone.add(body);
const display = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.05, PH - 0.05), new THREE.MeshBasicMaterial({ map: homeTex, toneMapped: false })); display.position.z = 0.0; phone.add(display);
const gridLayer = new THREE.Group(); gridLayer.position.z = 0.008; phone.add(gridLayer);
const ROWS = 16, COLS = 9, GX = PW - 0.1, GY = PH - 0.12;
const rowX = j => -GX / 2 + j * GX / (COLS - 1), rowY = i => GY / 2 - i * GY / (ROWS - 1);
const rowLines = Array.from({ length: ROWS }, (_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(GX + 0.02, 0.006, 0.002), glow(0x22d3ee, 0)); m.position.set(0, rowY(i), 0); gridLayer.add(m); return m; });
const colLines = Array.from({ length: COLS }, (_, j) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.006, GY + 0.02, 0.002), glow(0xf472b6, 0)); m.position.set(rowX(j), 0, 0.003); gridLayer.add(m); return m; });
const cells = []; for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(GX / (COLS - 1) * 0.9, GY / (ROWS - 1) * 0.9), glow(0xffe14d, 0)); m.position.set(rowX(j), rowY(i), 0.004); gridLayer.add(m); cells.push({ m, i, j, x: rowX(j), y: rowY(i) }); }
const arcs = []; { const R = rng(9); for (let k = 0; k < 90; k++) { const i = Math.floor(R() * ROWS), j = Math.floor(R() * COLS); const a = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0025, 6, 20, Math.PI), glow(0x9fd3ff, 0)); a.position.set(rowX(j), rowY(i), 0.006); a.rotation.y = R() * Math.PI; a.rotation.x = Math.PI / 2; a.userData = { x: rowX(j), y: rowY(i), ph: R() * 6 }; gridLayer.add(a); arcs.push(a); } }
const glass = new THREE.Mesh(new RoundedBoxGeometry(PW - 0.01, PH - 0.01, 0.012, 4, 0.006), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.12, depthWrite: false, clearcoat: 1 })); glass.position.z = 0.016; phone.add(glass);
const chip = new THREE.Group(); { const b = mesh(new RoundedBoxGeometry(0.16, 0.08, 0.02, 2, 0.006), std(0x111316, 0.4, 0.4)); chip.add(b);
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) { const p = mesh(new THREE.BoxGeometry(0.006, 0.02, 0.004), std(0xc9a227, 0.3, 0.9)); p.position.set(-0.07 + k * 0.02, s * 0.048, 0); chip.add(p); }
  chip.position.set(0, -PH / 2 - 0.12, 0.008); gridLayer.add(chip); }
const chipWire = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.12, 0.002), glow(0xffe14d, 0)); chipWire.position.set(0, -PH / 2 - 0.04, 0.008); gridLayer.add(chipWire);
const scanBar = new THREE.Mesh(new THREE.BoxGeometry(GX + 0.06, 0.02, 0.003), glow(0xffffff, 0)); gridLayer.add(scanBar);
const scanBarV = new THREE.Mesh(new THREE.BoxGeometry(0.02, GY + 0.06, 0.003), glow(0xffffff, 0)); gridLayer.add(scanBarV);
const cross = [new THREE.Mesh(new THREE.BoxGeometry(GX + 0.1, 0.004, 0.003), glow(0xffe14d, 0)), new THREE.Mesh(new THREE.BoxGeometry(0.004, GY + 0.1, 0.003), glow(0xffe14d, 0))]; cross.forEach(c => gridLayer.add(c));
const ripples = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.05, 40), glow(0xffffff, 0)); m.position.z = 0.025; phone.add(m); return m; });
const charges = Array.from({ length: 30 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), glow(0xffe14d, 0)); phone.add(m); return m; });

// ------------------------------------------------------------ HAND (finger points along local -y; rotate x +90° to point into the screen)
function makeHand(skinC, sleeveC, glove = false) {
  const g = new THREE.Group(), skin = std(skinC, glove ? 0.95 : 0.55), sl = std(sleeveC, 0.8);
  const palm = mesh(new RoundedBoxGeometry(0.34, 0.38, 0.12, 4, 0.05), skin); palm.position.y = 0.0; g.add(palm);
  const seg = (r, l, x, y, rx = 0, rz = 0) => { const m = mesh(new THREE.CapsuleGeometry(r, l, 6, 12), skin); m.position.set(x, y, 0); m.rotation.set(rx, 0, rz); g.add(m); return m; };
  seg(0.042, 0.16, 0.0, -0.3); seg(0.038, 0.12, 0.0, -0.46); const tip = seg(0.035, 0.08, 0.0, -0.585); // index (extended)
  if (!glove) { const nail = mesh(new THREE.SphereGeometry(0.03, 12, 8), std(0xf5d0c0, 0.3)); nail.scale.set(1, 1.3, 0.3); nail.position.set(0, -0.6, -0.035); g.add(nail); }
  for (const [x, s] of [[-0.09, 0.9], [-0.17, 0.85], [0.1, 0.8]]) { const f = seg(0.04, 0.12, x, -0.24, 1.3, 0); f.position.z = 0.06; f.scale.setScalar(s); }
  const th = seg(0.042, 0.14, 0.17, -0.12, 0.6, -0.7);
  const sleeve = mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 20), sl); sleeve.position.y = 0.52; g.add(sleeve);
  g.userData.tipLocal = V3(0, -0.66, 0); scene.add(g); return g;
}
const hand = makeHand(0xc58a5c, 0x2f6fde), gloveHand = makeHand(0x51607a, 0x334155, true), nailHand = makeHand(0xc58a5c, 0xd9485f);
const tenHands = []; // little glowing finger markers for multi-touch
const pen = new THREE.Group(); { const b = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 20), std(0xf2c12e, 0.4)); b.position.y = 0.45; pen.add(b); const tip = mesh(new THREE.ConeGeometry(0.035, 0.1, 20), std(0xdedede, 0.3)); tip.rotation.x = Math.PI; tip.position.y = -0.05; pen.add(tip); scene.add(pen); }
const stylus = new THREE.Group(); { const b = mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.9, 20), std(0x1b1d22, 0.3, 0.6)); b.position.y = 0.45; stylus.add(b); const tip = mesh(new THREE.SphereGeometry(0.045, 20, 14), std(0x222222, 0.9)); tip.position.y = -0.02; tip.scale.y = 0.8; stylus.add(tip);
  const path = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8), glow(0xffe14d, 0)); path.position.y = 0.45; stylus.add(path); stylus.userData.path = path; scene.add(stylus); }
const sausage = new THREE.Group(); { const s = mesh(new THREE.CapsuleGeometry(0.06, 0.55, 10, 20), new THREE.MeshPhysicalMaterial({ color: 0xb5523b, roughness: 0.35, clearcoat: 0.6 })); s.position.y = 0.3; sausage.add(s);
  for (let k = 0; k < 4; k++) { const ln = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.004, 6, 24), std(0x7a2e1e)); ln.rotation.x = Math.PI / 2; ln.position.y = 0.12 + k * 0.14; sausage.add(ln); } scene.add(sausage); }
const snow = Array.from({ length: 140 }, (_, i) => { const R = rng(i + 7); const m = new THREE.Mesh(new THREE.SphereGeometry(0.012 + R() * 0.012, 6, 5), glow(0xffffff, 0.9)); m.userData = { x: (R() - 0.5) * 6, y: R() * 5, z: -1.5 + R() * 3, v: 0.3 + R() * 0.4, ph: R() * 6 }; scene.add(m); return m; });
// helper: world point on the screen at local (x,y)
const scrPt = (x, y, z = 0.03) => phone.localToWorld(V3(x, y, z));
function pointHand(h, x, y, lift, tiltX = -0.6, tiltZ = -0.45) { const tip = scrPt(x, y, 0.025 + lift); h.visible = true; h.rotation.set(Math.PI / 2 - tiltX, 0, tiltZ); h.updateMatrixWorld(true);
  const off = h.userData.tipLocal.clone().applyEuler(h.rotation); h.position.copy(tip).sub(off); }
function pointTool(o, x, y, lift, tiltX = -0.55, tiltZ = -0.4) { const tip = scrPt(x, y, 0.025 + lift); o.visible = true; o.rotation.set(Math.PI / 2 - tiltX, 0, tiltZ); o.updateMatrixWorld(true);
  const down = V3(0, -0.07, 0).applyEuler(o.rotation); o.position.copy(tip).sub(down); }

// ------------------------------------------------------------ overlays (same system as previous reels)
const $ = s => document.querySelector(s), labelsEl = $('#labels'), hud = $('#hud');
const LBL = {}; function lab(id, html, cls = '') { const e = document.createElement('div'); e.className = 'lab ' + cls; e.innerHTML = html; labelsEl.appendChild(e); LBL[id] = { e, w: 0 }; }
const tmpV = new THREE.Vector3();
function showLab(id, pos, a, b, t) { const L = LBL[id], vis = P(t, a, 0.18) * (1 - P(t, b, 0.18)); if (vis <= 0.001) return;
  tmpV.copy(pos).project(camera); const x = (tmpV.x * 0.5 + 0.5) * 1080, y = (-tmpV.y * 0.5 + 0.5) * 1920; if (!L.w) L.w = L.e.offsetWidth;
  L.e.style.visibility = tmpV.z < 1 ? 'visible' : 'hidden'; L.e.style.opacity = vis; const s = lerp(0.6, 1, E.back(P(t, a, 0.35)));
  L.e.style.transform = `translate(${clamp(x - L.w / 2, 20, 1060 - L.w).toFixed(1)}px, ${clamp(y - L.e.offsetHeight, 260, 1250).toFixed(1)}px) scale(${s.toFixed(3)})`; }
const QDEF = [['intro', '?', 'Touch ఎక్కడో Phone కి ఎలా తెలుసు?'], ['grid', '1', 'Screen కింద ఏముంది?'], ['finger', '2', 'వేలు పెడితే ఏమవుతుంది?'], ['scan', '3', 'Touch Point ఎలా కనిపెడుతుంది?'], ['why', '4', 'Pen, Gloves ఎందుకు పనిచేయవు?'], ['fact', '😄', 'Fun Fact']];
const chips = QDEF.map(([name, n, txt], i) => { const w = document.createElement('div'); w.className = 'chipw'; w.innerHTML = `<div class="chip"><span class="n">${n}</span><span class="t">${txt}</span></div>`; hud.appendChild(w);
  const nx = QDEF[i + 1] ? S[QDEF[i + 1][0]] : END + 1; return { e: w.firstChild, wrap: w, a: name === 'intro' ? Wi(8) - 0.1 : S[name] - 0.05, b: nx - 0.2 }; });
function renderChips(t) { chips.forEach(c => { const i = E.back(P(t, c.a, 0.45)), vis = P(t, c.a, 0.15) * (1 - P(t, c.b, 0.2)); c.wrap.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; c.e.style.opacity = vis;
  c.e.style.transform = `translateY(${((1 - i) * -40).toFixed(1)}px) rotate(${(-1.5 + (1 - i) * 6).toFixed(2)}deg) scale(${lerp(0.75, 1, i).toFixed(3)})`; }); }
QDEF.slice(1).forEach(([n]) => sfx(S[n] - 0.08, 'whoosh', 0.5));
const caps = $('#caps');
const EMPH = { 29: '#22D3EE', 31: '#22D3EE', 32: '#F9A8D4', 40: '#FFE14D', 41: '#FFE14D', 45: '#7DD3FC', 46: '#7DD3FC', 54: '#7CF29A', 62: '#FFE14D', 65: '#C4B5FD', 66: '#C4B5FD', 76: '#22D3EE', 78: '#F9A8D4', 88: '#FFE14D', 89: '#FFE14D', 106: '#FF5A6E', 111: '#7CF29A', 112: '#7CF29A', 124: '#FF9F43', 133: '#7CF29A' };
const chunks = []; { let cur = []; words.forEach((w, i) => { cur.push(i); const txt = cur.map(j => words[j].text).join(' '), nx = words[i + 1];
  if (w.end || !nx || nx.scene !== w.scene || cur.length >= 4 || txt.length >= 18 || (/,$/.test(w.text) && cur.length >= 2)) { chunks.push(cur); cur = []; } }); }
const capEls = chunks.map((idx, ci) => { const e = document.createElement('div'); e.className = 'cap'; e.innerHTML = idx.map(i => `<span>${words[i].text}</span>`).join(''); caps.appendChild(e);
  const a = W[idx[0]] - 0.1, nextA = chunks[ci + 1] ? W[chunks[ci + 1][0]] - 0.1 : END, lastEnd = WE[idx[idx.length - 1]], b = Math.min(nextA, nextA - lastEnd > 0.6 ? lastEnd + 0.4 : nextA);
  return { e, idx, spans: [...e.querySelectorAll('span')], a, b, cut: nextA - b < 0.15 }; });
function renderCaps(t) { capEls.forEach(c => { if (t < c.a - 0.01 || t > c.b + 0.12 || (c.cut && t >= c.b)) { c.e.style.visibility = 'hidden'; return; }
  const w = c.w || (c.w = c.e.offsetWidth), fit = Math.min(1, 1000 / w), i = E.back(P(t, c.a, 0.2)), o = c.cut ? 0 : P(t, c.b, 0.1);
  c.e.style.visibility = 'visible'; c.e.style.opacity = P(t, c.a, 0.06) * (1 - o); c.e.style.transform = `translate(${-w / 2}px, ${(26 + (1 - i) * 22).toFixed(1)}px) scale(${(lerp(0.86, 1, i) * fit).toFixed(3)})`;
  c.spans.forEach((s, k) => { const wi = c.idx[k], active = t >= W[wi] - 0.03 && t < (W[wi + 1] ?? 1e9) - 0.03 && t < WE[wi] + 0.45, pop = E.out(P(t, W[wi] - 0.03, 0.12)) * (active ? 1 : 0);
    s.style.color = active ? '#FFE14D' : (EMPH[wi] || '#fff'); s.style.opacity = t >= W[wi] - 0.03 ? 1 : 0.6; s.style.transform = `scale(${(1 + 0.07 * pop).toFixed(3)}) translateY(${(-4 * pop).toFixed(1)}px)`; }); }); }
const grainCv = $('#grain'), gctx = grainCv.getContext('2d'); const GRAIN = []; { const R = rng(99); for (let k = 0; k < 6; k++) { const im = gctx.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() + R() + R() - 1.5) * 110; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } GRAIN.push(im); } }

lab('grid', 'Touch Grid', 'c'); lab('glass', 'Glass', ''); lab('disp', 'Display', ''); lab('rows', '↔ అడ్డం Lines', 'c'); lab('cols', '↕ నిలువు Lines', 'y'); lab('field', '⚡ Electric Field', 'y');
lab('water', '💧 నీరు + లవణాలు', 'c'); lab('cond', 'వేలు = Conductor ✓', 'g'); lab('change', 'Field మారింది!', 'y');
lab('chip', 'Controller Chip', 'y'); lab('scan', 'సెకనుకు వందల సార్లు Scan', 'c'); lab('row', 'Row 9', 'c'); lab('col', 'Column 4', 'y'); lab('xy', '📍 X: 412 • Y: 1260', 'g'); lab('ten', '10 Touches ✓', 'g');
lab('pen', 'Plastic Pen ✗', 'r'); lab('glove', 'Gloves ✗', 'r'); lab('nail', 'గోరు ✗', 'r'); lab('ins', 'కరెంట్ Conduct చేయవు', 'r'); lab('stylus', 'Conductive Rubber Tip ✓', 'g');
lab('korea', '🇰🇷 కొరియా • చలికాలం ❄️', 'c'); lab('saus', 'Sausage = Conductor 😄', 'g');

// ------------------------------------------------------------ helpers
function camLook(pos, look, fov = 45) { camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look); camera.updateMatrixWorld(true); }
const hh = (t, k = 1) => V3((Math.sin(t * 0.9) * 0.006 + Math.sin(t * 2.3 + 1) * 0.003) * k, (Math.sin(t * 0.7 + 2) * 0.005 + Math.sin(t * 1.9) * 0.003) * k, 0);
function explode(k) { display.position.z = -0.16 * k; gridLayer.position.z = 0.008 + 0.02 * k; glass.position.z = 0.016 + 0.2 * k; body.position.z = -0.04 - 0.3 * k; body.material.opacity = 1 - 0.7 * k; body.material.transparent = k > 0; glass.material.opacity = 0.12 + 0.18 * k; }
function gridGlow(rk, ck, fieldK = 0, t = 0) { rowLines.forEach(l => (l.material.opacity = rk)); colLines.forEach(l => (l.material.opacity = ck));
  arcs.forEach(a => { a.material.opacity = fieldK * (0.35 + 0.35 * Math.sin(t * 4 + a.userData.ph)); a.scale.setScalar(1); a.material.color.set(0x9fd3ff); }); }
function touchField(tx, ty, k, t) { arcs.forEach(a => { const d = Math.hypot(a.userData.x - tx, a.userData.y - ty), w = Math.exp(-(d * d) / 0.012) * k; a.scale.setScalar(1 + 2.5 * w); a.material.color.setRGB(lerp(0.62, 1, w), lerp(0.83, 0.88, w), lerp(1, 0.3, w)); a.material.opacity = Math.max(a.material.opacity, w); }); }
function heat(points, k) { cells.forEach(c => { let v = 0; points.forEach(([x, y]) => { const d = Math.hypot(c.x - x, c.y - y); v = Math.max(v, Math.exp(-(d * d) / 0.006)); }); c.m.material.opacity = v * k * 0.85; c.m.material.color.setHSL(0.15 - 0.15 * v, 1, 0.55); }); }
function ripple(t, t0, x, y) { ripples.forEach((r, i) => { const u = P(t, t0 + i * 0.12, 0.6); r.position.set(x, y, 0.025); r.scale.setScalar(1 + u * 4); r.material.opacity = u > 0 && u < 1 ? (1 - u) * 0.9 : Math.max(0, r.material.opacity); }); }
function reset() {
  [hand, gloveHand, nailHand, pen, stylus, sausage].forEach(o => (o.visible = false)); snow.forEach(s => (s.visible = false));
  explode(0); gridGlow(0, 0, 0); heat([], 0); cells.forEach(c => (c.m.material.opacity = 0)); scanBar.material.opacity = 0; scanBarV.material.opacity = 0; cross.forEach(c => (c.material.opacity = 0)); chipWire.material.opacity = 0; chip.visible = false;
  ripples.forEach(r => (r.material.opacity = 0)); charges.forEach(c => (c.material.opacity = 0)); stylus.userData.path.material.opacity = 0;
  phone.position.set(0, 1.0, 0); phone.rotation.set(-0.12, 0, 0); scene.background = new THREE.Color(0x10131f); scene.fog = new THREE.Fog(0x10131f, 6, 16);
  key.position.set(1.5, 4, 3); key.target.position.set(0, 1, 0); key.intensity = 2.2; hemi.intensity = 1.0; bokeh.forEach(b => (b.visible = true)); desk.visible = true;
}
const SH = {};
const TAPS = [Wi(4), Wi(11), Wi(16)];
SH.intro = (t, a, b) => { // hand tapping apps
  const spots = [[-0.17, 0.14], [0.12, -0.14], [-0.05, -0.42]]; let k = 0; for (let i = 0; i < TAPS.length; i++) if (t > TAPS[i] - 0.6) k = i;
  const [x, y] = spots[k], tt = t - (TAPS[k] - 0.35), lift = 0.12 * (1 - pulse(tt, 0, 0.5)) + (tt < 0 ? 0.25 : 0);
  pointHand(hand, x, y, Math.max(0, lift) + (t < TAPS[0] - 0.6 ? 0.25 * (1 - P(t, 0, TAPS[0] - 0.6)) : 0));
  TAPS.forEach((tp, i) => { if (t > tp - 0.15 && t < tp + 0.9) ripple(t, tp - 0.15, spots[i][0], spots[i][1]); });
  const u = E.io(P(t, 0, b)); camLook(V3(lerp(-0.35, -0.2, u), lerp(1.35, 1.25, u), lerp(2.9, 2.5, u)).add(hh(t)), V3(0.05, 0.95, 0), 45); };
SH.grid = (t, a, b) => { const ex = E.io(P(t, a + 0.1, 1.6)); explode(ex); phone.rotation.set(-0.12, lerp(0, -0.7, ex), 0);
  const rk = P(t, Wi(31) - 0.1, 0.4), ck = P(t, Wi(32) - 0.1, 0.4); gridGlow(Math.max(0.35 * P(t, Wi(29) - 0.2, 0.4), 0.95 * rk) * (1 - 0.3 * ck * 0), Math.max(0.35 * P(t, Wi(29) - 0.2, 0.4), 0.95 * ck), P(t, Wi(40) - 0.2, 0.5), t);
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(0.4, 1.3, u), lerp(1.4, 1.5, u), lerp(2.3, 1.9, u)).add(hh(t)), V3(0, 1.0, 0), 45);
  showLab('glass', scrPt(PW / 2, PH / 2 - 0.1, 0.22 * ex + 0.02), a + 1.2, Wi(29), t); showLab('disp', scrPt(PW / 2, PH / 2 - 0.25, -0.16 * ex), a + 1.4, Wi(29), t);
  showLab('grid', scrPt(0, PH / 2 + 0.05, 0.03), Wi(29), Wi(31), t); showLab('rows', scrPt(0.1, 0.35, 0.03), Wi(31), Wi(37), t); showLab('cols', scrPt(0.1, 0.1, 0.03), Wi(32), Wi(37), t); showLab('field', scrPt(0, 0.45, 0.05), Wi(40) - 0.1, b, t); };
SH.finger = (t, a, b) => { explode(1); phone.rotation.set(-0.12, -0.35, 0); gridGlow(0.8, 0.8, 1, t); const tx = rowX(4), ty = rowY(8), touchT = Wi(57) - 0.05;
  const lift = lerp(0.45, 0.0, E.io(P(t, a, touchT - a))); pointHand(hand, tx, ty, lift + 0.21);
  const k = P(t, touchT - 0.1, 0.4); touchField(tx, ty, k, t); heat([[tx, ty]], k * 0.8);
  charges.forEach((c, i) => { const u = ((t * 1.3 + i / charges.length) % 1); const ang = i * 2.4; c.position.copy(V3(tx + Math.cos(ang) * 0.08 * (1 - u), ty + Math.sin(ang) * 0.08 * (1 - u), 0.03 + u * 0.18)); c.material.opacity = k * (1 - u); });
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(1.1, 0.75, u), lerp(1.5, 1.25, u), lerp(1.7, 1.25, u)).add(hh(t)), scrPt(tx, ty, 0.1), 45);
  const tip = scrPt(tx, ty, 0.25 + lift); showLab('water', tip.clone().add(V3(0, 0.35, 0)), Wi(45) - 0.1, Wi(50), t); showLab('cond', tip.clone().add(V3(0, 0.35, 0)), Wi(50), Wi(57), t); showLab('change', scrPt(tx, ty - 0.18, 0.05), Wi(58), b, t); };
SH.scan = (t, a, b) => { explode(1); phone.rotation.set(-0.12, -0.25, 0); chip.visible = true; const tx = rowX(4), ty = rowY(8);
  gridGlow(0.45, 0.45, 0.4, t); chipWire.material.opacity = P(t, Wi(65), 0.3) * (0.6 + 0.4 * Math.sin(t * 20));
  const scanning = t > Wi(70) - 0.3 && t < Wi(76); if (scanning) { const u = ((t - Wi(70)) * 2.2) % 1; scanBar.position.set(0, GY / 2 - u * GY, 0.005); scanBar.material.opacity = 0.9; const v = ((t - Wi(70)) * 1.7) % 1; scanBarV.position.set(-GX / 2 + v * GX, 0, 0.006); scanBarV.material.opacity = 0.6; }
  const multi = t > Wi(88) - 0.1; const pts = multi ? [[-0.25, 0.55], [-0.1, 0.6], [0.05, 0.58], [0.2, 0.52], [0.28, 0.3], [-0.26, -0.25], [-0.12, -0.32], [0.03, -0.34], [0.17, -0.3], [-0.3, 0.0]] : [[tx, ty]];
  heat(pts, multi ? P(t, Wi(88) - 0.1, 0.4) : 0.9);
  if (t > Wi(76) - 0.1 && !multi) { rowLines[8].material.opacity = 1; rowLines[8].material.color.set(0x22d3ee); }
  if (t > Wi(78) - 0.1 && !multi) { colLines[4].material.opacity = 1; }
  const cx = P(t, Wi(84) - 0.1, 0.3) * (multi ? 0 : 1); cross[0].position.set(0, ty, 0.007); cross[1].position.set(tx, 0, 0.007); cross.forEach(c => (c.material.opacity = cx));
  const u = E.io(P(t, a, 3)); camLook(V3(lerp(0.6, 0.45, u), lerp(1.2, 1.05, u), lerp(2.0, 2.3, u)).add(hh(t)), V3(0, lerp(0.9, 0.95, u), 0), 45);
  showLab('chip', scrPt(0, -PH / 2 - 0.2, 0.05), Wi(65) - 0.1, Wi(75), t); showLab('scan', scrPt(0, PH / 2 + 0.08, 0.05), Wi(70), Wi(76), t);
  showLab('row', scrPt(GX / 2 + 0.05, ty, 0.05), Wi(76), Wi(88) - 0.2, t); showLab('col', scrPt(tx, GY / 2 + 0.08, 0.05), Wi(78), Wi(88) - 0.2, t); showLab('xy', scrPt(tx, ty - 0.12, 0.05), Wi(84), Wi(88) - 0.2, t); showLab('ten', scrPt(0, 0.15, 0.05), Wi(88), b, t); };
SH.why = (t, a, b) => { explode(0.6); phone.rotation.set(-0.12, -0.3, 0); gridGlow(0.35, 0.35, 0.5, t);
  const items = [[pen, Wi(95), 'tool'], [gloveHand, Wi(96), 'hand'], [nailHand, Wi(97), 'nail'], [stylus, Wi(108), 'tool']];
  let cur = 0; items.forEach((it, i) => { if (t > it[1] - 0.5) cur = i; });
  if (t > Wi(101) - 0.4 && t < Wi(107) - 0.3) cur = -1;
  const tx = rowX(4), ty = rowY(7);
  if (cur >= 0) { const [o, t0, kind] = items[cur], tt = t - t0, lift = 0.3 * (1 - E.out(P(tt, -0.4, 0.4))) + 0.06 * pulse(tt, 0.1, 0.5);
    if (kind === 'hand') pointHand(o, tx, ty, lift + 0.21); else if (kind === 'nail') pointHand(o, tx, ty, lift + 0.2, 0.55, -0.45); else pointTool(o, tx, ty, lift);
    const works = cur === 3 && tt > 0; heat([[tx, ty]], works ? 0.9 : 0); touchField(tx, ty, works ? 1 : 0, t); stylus.userData.path.material.opacity = works ? 0.8 : 0; if (works) ripple(t, t0, tx, ty); }
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(1.0, 0.8, u), lerp(1.45, 1.35, u), lerp(1.7, 1.6, u)).add(hh(t)), scrPt(tx, ty, 0.15), 45);
  const lp = scrPt(tx, ty + 0.25, 0.3); showLab('pen', lp, Wi(95), Wi(96) - 0.1, t); showLab('glove', lp, Wi(96), Wi(97) - 0.1, t); showLab('nail', lp, Wi(97), Wi(101) - 0.3, t);
  showLab('ins', scrPt(tx, ty + 0.1, 0.2), Wi(101), Wi(107) - 0.2, t); showLab('stylus', lp, Wi(110), b, t); };
SH.fact = (t, a, b) => { scene.background = new THREE.Color(0x0b1430); scene.fog = new THREE.Fog(0x0b1430, 4, 12); bokeh.forEach(bk => (bk.visible = false)); desk.visible = false; hemi.intensity = 0.4; key.intensity = 1.4;
  phone.position.set(0, 1.25, 0); phone.rotation.set(-0.05, 0.25, 0);
  snow.forEach(s => { s.visible = true; const d = s.userData; s.position.set(d.x + Math.sin(t + d.ph) * 0.1, ((d.y - t * d.v) % 5 + 5) % 5 - 1, d.z); });
  const tapT = Wi(126) - 0.1, tx = 0.05, ty = -0.1, lift = 0.4 * (1 - E.out(P(t, tapT - 1.2, 1.2))) + 0.05 * pulse(t, tapT, 0.45);
  pointTool(sausage, tx, ty, lift, -0.55, -0.4);
  gloveHand.visible = true; gloveHand.rotation.copy(sausage.rotation); gloveHand.updateMatrixWorld(true); gloveHand.position.copy(sausage.localToWorld(V3(0, 1.15, 0)));
  if (t > tapT) { ripple(t, tapT, tx, ty); }
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(-0.5, -0.3, u), lerp(1.55, 1.45, u), lerp(2.8, 2.4, u)).add(hh(t)), V3(0.1, 1.05, 0), 45);
  showLab('korea', V3(0, 2.35, 0), Wi(117), END + 1, t); showLab('saus', scrPt(tx, ty - 0.35, 0.1), Wi(128), END + 1, t); };
const ORDER = ['intro', 'grid', 'finger', 'scan', 'why', 'fact'];
// sound cues
TAPS.forEach(tp => sfx(tp - 0.15, 'tap', 0.8)); sfx(S.grid + 0.1, 'swoosh', 0.6); sfx(Wi(29), 'shimmer', 0.5); sfx(Wi(40), 'hum', 0.5);
sfx(Wi(57) - 0.1, 'tap', 0.8); sfx(Wi(57), 'zapS', 0.6); sfx(Wi(65), 'popLow', 0.4); sfx(Wi(70) - 0.3, 'scan', 0.6); sfx(Wi(84), 'lockOn', 0.7); sfx(Wi(88), 'sparkle', 0.6);
sfx(Wi(95) - 0.1, 'tap', 0.5); sfx(Wi(95), 'buzz', 0.45); sfx(Wi(96) - 0.1, 'tapSoft', 0.5); sfx(Wi(96), 'buzz', 0.45); sfx(Wi(97) - 0.1, 'tap', 0.5); sfx(Wi(97), 'buzz', 0.45);
sfx(Wi(108), 'tap', 0.7); sfx(Wi(108) + 0.05, 'check', 0.7); sfx(S.fact, 'wind', 0.6); sfx(Wi(126) - 0.1, 'squish', 0.8); sfx(Wi(126), 'success', 0.6);
window.SFX = SFX;

window.render = function (t) {
  reset(); let k = 0; for (let i = 0; i < ORDER.length; i++) if (t >= (i === 0 ? 0 : S[ORDER[i]] - 0.02)) k = i;
  const name = ORDER[k], a = k === 0 ? 0 : S[name], b = k + 1 < ORDER.length ? S[ORDER[k + 1]] : END;
  Object.values(LBL).forEach(L => (L.e.style.visibility = 'hidden'));
  SH[name](t, a, b);
  const dip = Math.max(...ORDER.slice(1).map(n => pulse(t, S[n] - 0.09, 0.18)));
  renderer.toneMappingExposure *= 1 + dip * 1.3;
  renderer.render(scene, camera); renderChips(t); renderCaps(t);
  const f = Math.round(t * 30); gctx.putImageData(GRAIN[f % 6], 0, 0); grainCv.style.transform = `translate(${((f * 37) % 9) - 4}px, ${((f * 53) % 9) - 4}px)`;
};
window.setup = async function () {
  await Promise.all(['800 40px "Baloo Tammudu 2"', '700 40px "Baloo Tammudu 2"', '700 40px "Poppins"', '800 40px "Poppins"', '40px "Noto Color Emoji"'].map(f => document.fonts.load(f, 'అఆ abc ⚡')));
  await document.fonts.ready;
  const redraw = tx => { if (!tx || !tx.userData || !tx.userData.draw) return; const { c, g, draw } = tx.userData; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tx.needsUpdate = true; };
  scene.traverse(o => { if (o.material && o.material.map) redraw(o.material.map); });
  window.render(0); return { duration: END, sfx: SFX };
};
window.__ready = true;
