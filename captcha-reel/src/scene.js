// "Why 'I'm not a robot' / CAPTCHA?" — deterministic three.js reel. window.render(t) draws frame t.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

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
const camera = new THREE.PerspectiveCamera(45, 1080 / 1920, 0.02, 300);
const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x241a3a, 1.0); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2.0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; scene.add(key, key.target);
const fill = new THREE.DirectionalLight(0x9fb4ff, 0.8); fill.position.set(-4, 2, 4); scene.add(fill);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g, draw }; return t; }
const FONT = "'Poppins', sans-serif", EMOJI = "'Noto Color Emoji', sans-serif";
const std = (c, r = 0.5, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const mesh = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };
const glow = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: op, depthWrite: false });
const basic = tex => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true });

// ------------------------------------------------------------ cyber floor + particles
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0d1430, roughness: 0.6, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const gridH = new THREE.GridHelper(60, 60, 0x2a4a8a, 0x1a2a55); gridH.position.y = 0.002; scene.add(gridH);
const motes = Array.from({ length: 60 }, (_, i) => { const R = rng(i + 3); const m = new THREE.Mesh(new THREE.SphereGeometry(0.015 + R() * 0.02, 8, 6), glow([0x22d3ee, 0xa78bfa, 0xf472b6][i % 3], 0.6)); m.userData = { x: (R() - 0.5) * 14, y: R() * 6, z: -6 + R() * 8, v: 0.1 + R() * 0.2, ph: R() * 6 }; scene.add(m); return m; });

// ------------------------------------------------------------ browser window + checkbox widget
const browser = new THREE.Group(); scene.add(browser);
const BW = 2.6, BH = 1.7;
function widget(g, w, h, state, k = 0) {
  g.fillStyle = '#f1f5f9'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#0f172a'; g.font = `800 64px ${FONT}`; g.fillText('Sign up', 70, 120); g.fillStyle = '#cbd5e1';
  for (let i = 0; i < 2; i++) { g.beginPath(); g.roundRect(70, 170 + i * 110, w - 140, 76, 16); g.fill(); }
  g.fillStyle = '#64748b'; g.font = `600 34px ${FONT}`; g.fillText('Email', 96, 220); g.fillText('Password', 96, 330);
  // checkbox card (generic design)
  const cx = 70, cy = 430, cw = w - 140, ch = 150; g.fillStyle = '#ffffff'; g.strokeStyle = '#cbd5e1'; g.lineWidth = 4; g.beginPath(); g.roundRect(cx, cy, cw, ch, 14); g.fill(); g.stroke();
  const bx = cx + 40, by = cy + 40, bs = 70;
  if (state === 'checked') { g.strokeStyle = '#16a34a'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx + 10, by + 38); g.lineTo(bx + 30, by + 60); g.lineTo(bx + 66, by + 10); g.stroke(); }
  else if (state === 'loading') { g.strokeStyle = '#3b82f6'; g.lineWidth = 10; g.beginPath(); g.arc(bx + bs / 2, by + bs / 2, 28, k, k + 4.2); g.stroke(); }
  else { g.strokeStyle = '#94a3b8'; g.lineWidth = 6; g.strokeRect(bx, by, bs, bs); }
  g.fillStyle = '#1e293b'; g.font = `700 46px ${FONT}`; g.fillText("I'm not a robot", bx + 110, by + 50);
  g.fillStyle = '#3b82f6'; g.beginPath(); g.moveTo(cx + cw - 90, cy + 34); g.lineTo(cx + cw - 50, cy + 48); g.lineTo(cx + cw - 50, cy + 82); g.quadraticCurveTo(cx + cw - 70, cy + 110, cx + cw - 90, cy + 118); g.quadraticCurveTo(cx + cw - 110, cy + 110, cx + cw - 130, cy + 82); g.lineTo(cx + cw - 130, cy + 48); g.closePath(); g.fill();
  g.fillStyle = '#64748b'; g.font = `600 22px ${FONT}`; g.textAlign = 'center'; g.fillText('Protected', cx + cw - 90, cy + 140); g.textAlign = 'left';
  g.fillStyle = '#2563eb'; g.beginPath(); g.roundRect(70, 640, w - 140, 80, 16); g.fill(); g.fillStyle = '#fff'; g.font = `800 40px ${FONT}`; g.textAlign = 'center'; g.fillText('Create Account', w / 2, 693); g.textAlign = 'left';
}
const pageTex = { un: ctex(800, 760, (g, w, h) => widget(g, w, h, 'un')), chk: ctex(800, 760, (g, w, h) => widget(g, w, h, 'checked')), load: ctex(800, 760, (g, w, h) => widget(g, w, h, 'loading', 0)) };
{ const frame = mesh(new RoundedBoxGeometry(BW + 0.12, BH + 0.3, 0.08, 4, 0.04), std(0x1e2338, 0.4, 0.4)); frame.position.set(0, 0.09, -0.05); browser.add(frame);
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(BW, 0.18), new THREE.MeshBasicMaterial({ color: 0x2b3150, toneMapped: false })); bar.position.set(0, BH / 2 + 0.11, 0.0); browser.add(bar);
  [0xff5f57, 0xfebc2e, 0x28c840].forEach((c, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); d.position.set(-BW / 2 + 0.1 + i * 0.09, BH / 2 + 0.11, 0.002); browser.add(d); });
  const url = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), new THREE.MeshBasicMaterial({ map: ctex(560, 40, (g, w, h) => { g.fillStyle = '#3a4166'; g.beginPath(); g.roundRect(0, 0, w, h, 20); g.fill(); g.fillStyle = '#cbd5e1'; g.font = `600 22px ${FONT}`; g.fillText('🔒  example-shop.com/signup', 16, 28); }), toneMapped: false })); url.position.set(0.15, BH / 2 + 0.11, 0.002); browser.add(url);
  const page = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: pageTex.un, toneMapped: false })); browser.add(page); browser.userData.page = page; }
// checkbox centre in browser-local coords (from the 800x760 canvas: box at x 110..180, y 470..540)
const CHK = V3(-BW / 2 + (145 / 800) * BW, BH / 2 - (505 / 760) * BH, 0.01);
// cursor (extruded arrow)
function makeCursor(fillC = 0xffffff) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, -0.28); s.lineTo(0.07, -0.21); s.lineTo(0.12, -0.32); s.lineTo(0.16, -0.3); s.lineTo(0.11, -0.19); s.lineTo(0.2, -0.19); s.closePath();
  const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }), std(fillC, 0.3)); g.add(f);
  const o = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.015, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.004, bevelSegments: 1 }), std(0x111111, 0.4)); o.position.z = -0.006; g.add(o); scene.add(g); return g; }
const curHuman = makeCursor(0xffffff), curBot = makeCursor(0xff5a6e);
const trailH = new THREE.Mesh(new THREE.BufferGeometry(), glow(0x34d399, 0.9)), trailB = new THREE.Mesh(new THREE.BufferGeometry(), glow(0xff5a6e, 0.9)); scene.add(trailH, trailB);
function setTrail(m, pts) { if (pts.length < 2) { m.visible = false; return; } m.visible = true; m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 2), 0.012, 6); }

// ------------------------------------------------------------ robots + spam objects + shield
function makeBot(c = 0x9aa8bd, scale = 1) { const g = new THREE.Group(), body = std(c, 0.35, 0.5), dark = std(0x1a1d26, 0.4);
  const b = mesh(new RoundedBoxGeometry(0.42, 0.42, 0.32, 4, 0.08), body); b.position.y = 0.42; g.add(b);
  const h = mesh(new RoundedBoxGeometry(0.46, 0.34, 0.34, 4, 0.1), body); h.position.y = 0.86; g.add(h);
  const face = mesh(new RoundedBoxGeometry(0.38, 0.24, 0.02, 3, 0.05), dark); face.position.set(0, 0.86, 0.17); g.add(face);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), glow(0x22d3ee)); e.position.set(s * 0.09, 0.88, 0.185); g.add(e);
    const arm = mesh(new THREE.CapsuleGeometry(0.04, 0.22, 4, 8), body); arm.position.set(s * 0.27, 0.42, 0); arm.rotation.z = s * 0.3; g.add(arm); g.userData['arm' + s] = arm;
    const wh = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 16), dark); wh.rotation.z = Math.PI / 2; wh.position.set(s * 0.15, 0.1, 0); g.add(wh); }
  const ant = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), dark); ant.position.y = 1.1; g.add(ant);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), glow(0xff5a6e)); bulb.position.y = 1.2; g.add(bulb); g.userData.bulb = bulb;
  g.scale.setScalar(scale); scene.add(g); return g; }
const bots = Array.from({ length: 12 }, (_, i) => makeBot([0x9aa8bd, 0x7d8ba6, 0xb4bfd0][i % 3], 0.75 + (i % 4) * 0.08));
const bigBot = makeBot(0x8b9dc3, 2.0);
const spamTex = { acc: ctex(256, 320, (g, w, h) => { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(0, 0, w, h, 24); g.fill(); g.fillStyle = '#cbd5e1'; g.beginPath(); g.arc(w / 2, 110, 60, 0, 7); g.fill(); g.fillStyle = '#ef4444'; g.font = `800 36px ${FONT}`; g.textAlign = 'center'; g.fillText('FAKE', w / 2, 230); g.fillStyle = '#64748b'; g.font = `600 26px ${FONT}`; g.fillText('user_8821', w / 2, 280); }),
  mail: ctex(320, 220, (g, w, h) => { g.fillStyle = '#fde68a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b45309'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.55); g.lineTo(w, 0); g.stroke(); g.fillStyle = '#b91c1c'; g.font = `800 50px ${FONT}`; g.textAlign = 'center'; g.fillText('SPAM', w / 2, h - 30); }),
  tick: ctex(340, 160, (g, w, h) => { g.fillStyle = '#f97316'; g.beginPath(); g.roundRect(0, 0, w, h, 18); g.fill(); g.fillStyle = '#fff'; g.font = `800 52px ${FONT}`; g.textAlign = 'center'; g.fillText('🎟️ TICKET', w / 2, 100); }) };
const spam = Array.from({ length: 24 }, (_, i) => { const k = ['acc', 'mail', 'tick'][i % 3], sz = k === 'acc' ? [0.26, 0.32] : k === 'mail' ? [0.32, 0.22] : [0.34, 0.16];
  const m = new THREE.Mesh(new THREE.PlaneGeometry(sz[0], sz[1]), basic(spamTex[k])); m.material.side = THREE.DoubleSide; scene.add(m); return m; });
const shield = new THREE.Group(); { const hex = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.06, 6, 1, true), glow(0x22d3ee, 0.35)); hex.material.side = THREE.DoubleSide; hex.rotation.x = Math.PI / 2; shield.add(hex);
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.6, 6), glow(0x22d3ee, 0.12)); shield.add(face); shield.userData = { hex, face }; scene.add(shield); }
const xMarks = Array.from({ length: 6 }, () => { const t = ctex(128, 128, g => { g.strokeStyle = '#ff3b3b'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(24, 24); g.lineTo(104, 104); g.moveTo(104, 24); g.lineTo(24, 104); g.stroke(); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), basic(t)); scene.add(m); return m; });

// ------------------------------------------------------------ 3D "CAPTCHA" letters (loaded in setup)
const letters = new THREE.Group(); scene.add(letters); let letterMeshes = [];

// ------------------------------------------------------------ image tiles + neural network
function tileDraw(kind) { return (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#8ec5ff'); sky.addColorStop(1, '#dbeafe'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = '#6b7280'; g.fillRect(0, h * 0.72, w, h * 0.28);
  if (kind === 'light') { g.fillStyle = '#374151'; g.fillRect(w * 0.47, h * 0.4, w * 0.06, h * 0.4); g.fillStyle = '#111827'; g.beginPath(); g.roundRect(w * 0.36, h * 0.08, w * 0.28, h * 0.4, 14); g.fill(); ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(w / 2, h * (0.15 + i * 0.12), w * 0.07, 0, 7); g.fill(); }); }
  else if (kind === 'bus') { g.fillStyle = '#dc2626'; g.beginPath(); g.roundRect(w * 0.08, h * 0.38, w * 0.84, h * 0.36, 14); g.fill(); g.fillStyle = '#bfdbfe'; for (let i = 0; i < 4; i++) g.fillRect(w * (0.14 + i * 0.19), h * 0.44, w * 0.14, h * 0.12); g.fillStyle = '#111'; [0.25, 0.75].forEach(x => { g.beginPath(); g.arc(w * x, h * 0.76, w * 0.07, 0, 7); g.fill(); }); }
  else if (kind === 'car') { g.fillStyle = '#2563eb'; g.beginPath(); g.roundRect(w * 0.15, h * 0.52, w * 0.7, h * 0.18, 12); g.fill(); g.beginPath(); g.roundRect(w * 0.3, h * 0.4, w * 0.4, h * 0.16, 12); g.fill(); g.fillStyle = '#111'; [0.3, 0.7].forEach(x => { g.beginPath(); g.arc(w * x, h * 0.72, w * 0.06, 0, 7); g.fill(); }); }
  else if (kind === 'tree') { g.fillStyle = '#7c4a24'; g.fillRect(w * 0.46, h * 0.45, w * 0.08, h * 0.3); g.fillStyle = '#16a34a'; g.beginPath(); g.arc(w / 2, h * 0.36, w * 0.22, 0, 7); g.fill(); }
  else if (kind === 'cross') { g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) g.fillRect(w * (0.06 + i * 0.16), h * 0.76, w * 0.09, h * 0.2); }
  else { g.fillStyle = '#9ca3af'; g.fillRect(w * 0.2, h * 0.15, w * 0.6, h * 0.6); g.fillStyle = '#fde68a'; for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) g.fillRect(w * (0.27 + x * 0.17), h * (0.22 + y * 0.12), w * 0.1, h * 0.07); }
}; }
const TILEK = ['light', 'tree', 'bus', 'cross', 'light', 'bus', 'build', 'light', 'car'];
const tiles = TILEK.map((k, i) => { const g = new THREE.Group(); const m = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.04, 2, 0.02), [std(0xffffff), std(0xffffff), std(0xffffff), std(0xffffff), new THREE.MeshBasicMaterial({ map: ctex(256, 256, tileDraw(k)), toneMapped: false }), std(0xffffff)]); m.castShadow = true; g.add(m);
  const sel = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66), glow(0x3b82f6, 0)); sel.position.z = -0.03; g.add(sel);
  const tk = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), new THREE.MeshBasicMaterial({ map: ctex(64, 64, gg => { gg.fillStyle = '#2563eb'; gg.beginPath(); gg.arc(32, 32, 30, 0, 7); gg.fill(); gg.strokeStyle = '#fff'; gg.lineWidth = 7; gg.beginPath(); gg.moveTo(18, 33); gg.lineTo(28, 43); gg.lineTo(46, 22); gg.stroke(); }), toneMapped: false, transparent: true })); tk.position.set(-0.22, 0.22, 0.03); g.add(tk);
  g.userData = { k, sel, tk, i }; scene.add(g); return g; });
const nn = new THREE.Group(); scene.add(nn); const nnNodes = [], nnLinks = [];
{ const layers = [5, 7, 7, 3]; layers.forEach((n, li) => { for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x0e7490, emissiveIntensity: 0.2 })); s.position.set(-1.2 + li * 0.8, (k - (n - 1) / 2) * 0.32, 0); nn.add(s); nnNodes.push({ s, li }); } });
  for (let a = 0; a < nnNodes.length; a++) for (let b = 0; b < nnNodes.length; b++) if (nnNodes[b].li === nnNodes[a].li + 1) { const p = nnNodes[a].s.position, q = nnNodes[b].s.position, len = p.distanceTo(q);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, len, 4), glow(0x22d3ee, 0.15)); l.position.copy(p).lerp(q, 0.5); l.lookAt(q); l.rotateX(Math.PI / 2); nn.add(l); nnLinks.push({ l, la: nnNodes[a].li }); } }
// ------------------------------------------------------------ old book + scan + digital page, newspapers
const book = new THREE.Group(); scene.add(book);
{ const cover = mesh(new RoundedBoxGeometry(1.7, 0.06, 1.2, 2, 0.02), std(0x6b3a1f, 0.7)); book.add(cover);
  const pageM = new THREE.MeshStandardMaterial({ map: ctex(512, 720, (g, w, h) => { g.fillStyle = '#efe2c2'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(80,50,20,.55)'; for (let y = 60; y < h - 40; y += 34) g.fillRect(40, y, w - 80 - (y % 3) * 30, 9); const R = rng(3); g.fillStyle = 'rgba(120,80,40,.15)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(R() * w, R() * h, R() * 18, 0, 7); g.fill(); } }), roughness: 0.9 });
  for (const s of [-1, 1]) { const pg = mesh(new THREE.BoxGeometry(0.8, 0.04, 1.12), [pageM, pageM, pageM, pageM, pageM, pageM]); pg.position.set(s * 0.41, 0.05, 0); pg.rotation.z = -s * 0.06; book.add(pg); } }
const wavyTex = ctex(600, 200, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); const word = 'morning'; g.font = `800 110px Georgia, serif`; let x = 40;
  for (let i = 0; i < word.length; i++) { g.save(); g.translate(x, 140 + Math.sin(i * 1.3) * 22); g.rotate(Math.sin(i * 2.1) * 0.25); g.fillStyle = '#3b2a1a'; g.fillText(word[i], 0, 0); g.restore(); x += 70; }
  g.strokeStyle = '#3b2a1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(20, 120); for (let k = 0; k < 20; k++) g.lineTo(20 + k * 29, 110 + Math.sin(k) * 25); g.stroke(); });
const wavy = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), basic(wavyTex)); wavy.material.side = THREE.DoubleSide; scene.add(wavy);
const digital = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), basic(ctex(520, 360, (g, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(0, 0, w, h, 22); g.fill(); g.fillStyle = '#0f172a'; g.font = `800 46px ${FONT}`; g.fillText('morning', 40, 90); g.fillStyle = '#94a3b8'; for (let y = 130; y < h - 40; y += 34) g.fillRect(40, y, w - 80 - (y % 2) * 60, 12); g.fillStyle = '#16a34a'; g.font = `800 34px ${FONT}`; g.fillText('✓ Digitized', w - 230, h - 26); }))); scene.add(digital);
const scanBeam = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.012, 0.02), glow(0x22d3ee, 0)); scene.add(scanBeam);
const papers = Array.from({ length: 5 }, (_, i) => { const m = mesh(new THREE.BoxGeometry(1.2, 0.02, 0.85), new THREE.MeshStandardMaterial({ map: ctex(400, 280, (g, w, h) => { g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = `800 40px Georgia, serif`; g.fillText('THE DAILY', 20, 50); g.fillStyle = 'rgba(0,0,0,.4)'; for (let y = 80; y < h - 10; y += 18) for (let c = 0; c < 3; c++) g.fillRect(20 + c * 128, y, 110, 7); }), roughness: 0.9 })); scene.add(m); return m; });

// ------------------------------------------------------------ overlays
const $ = s => document.querySelector(s), labelsEl = $('#labels'), hud = $('#hud');
const LBL = {}; function lab(id, html, cls = '') { const e = document.createElement('div'); e.className = 'lab ' + cls; e.innerHTML = html; labelsEl.appendChild(e); LBL[id] = { e, w: 0 }; }
const tmpV = new THREE.Vector3();
function showLab(id, pos, a, b, t) { const L = LBL[id], vis = P(t, a, 0.18) * (1 - P(t, b, 0.18)); if (vis <= 0.001) return;
  tmpV.copy(pos).project(camera); const x = (tmpV.x * 0.5 + 0.5) * 1080, y = (-tmpV.y * 0.5 + 0.5) * 1920; if (!L.w) L.w = L.e.offsetWidth;
  L.e.style.visibility = tmpV.z < 1 ? 'visible' : 'hidden'; L.e.style.opacity = vis; const s = lerp(0.6, 1, E.back(P(t, a, 0.35)));
  L.e.style.transform = `translate(${clamp(x - L.w / 2, 20, 1060 - L.w).toFixed(1)}px, ${clamp(y - L.e.offsetHeight, 260, 1250).toFixed(1)}px) scale(${s.toFixed(3)})`; }
function fixedEl(html, cls, x, y) { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; e.style.left = x + 'px'; e.style.top = y + 'px'; hud.appendChild(e); return e; }
function showFixed(e, t, a, b, dy = 30) { const vis = P(t, a, 0.2) * (1 - P(t, b, 0.2)); e.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; e.style.opacity = vis;
  e.style.transform = `translateY(${((1 - E.out(P(t, a, 0.35))) * dy).toFixed(1)}px) scale(${lerp(0.85, 1, E.back(P(t, a, 0.35))).toFixed(3)})`; }
const QDEF = [['intro', '?', "I'm not a robot ఎందుకు?"], ['bots', '1', 'Bots ఏం చేస్తాయి?'], ['name', '2', 'CAPTCHA అంటే?'], ['click', '3', 'Click లో Secret ఏంటి?'], ['images', '4', 'Photos ఎందుకు అడుగుతుంది?'], ['books', '5', 'వంకర Words ఎక్కడివి?'], ['future', '6', 'ఇప్పుడు ఏం మారింది?']];
const chips = QDEF.map(([name, n, txt], i) => { const w = document.createElement('div'); w.className = 'chipw'; w.innerHTML = `<div class="chip"><span class="n">${n}</span><span class="t">${txt}</span></div>`; hud.appendChild(w);
  const nx = QDEF[i + 1] ? S[QDEF[i + 1][0]] : END + 1; return { e: w.firstChild, wrap: w, a: name === 'intro' ? Wi(20) - 0.1 : S[name] - 0.05, b: nx - 0.2 }; });
function renderChips(t) { chips.forEach(c => { const i = E.back(P(t, c.a, 0.45)), vis = P(t, c.a, 0.15) * (1 - P(t, c.b, 0.2)); c.wrap.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; c.e.style.opacity = vis;
  c.e.style.transform = `translateY(${((1 - i) * -40).toFixed(1)}px) rotate(${(-1.5 + (1 - i) * 6).toFixed(2)}deg) scale(${lerp(0.75, 1, i).toFixed(3)})`; }); }
QDEF.slice(1).forEach(([n]) => sfx(S[n] - 0.08, 'whoosh', 0.5));
const caps = $('#caps');
const EMPH = { 2: '#7DD3FC', 3: '#7DD3FC', 4: '#7DD3FC', 5: '#7DD3FC', 26: '#FF5A6E', 40: '#FFE14D', 41: '#FFE14D', 55: '#FFE14D', 62: '#7DD3FC', 69: '#7CF29A', 70: '#7CF29A', 73: '#FF5A6E', 75: '#FF5A6E', 77: '#FF5A6E', 103: '#C4B5FD', 105: '#C4B5FD', 113: '#FDBA74', 126: '#7CF29A', 130: '#FF5A6E', 143: '#7DD3FC' };
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

lab('ok', '✓ Verified', 'g'); lab('fake', '👤 Fake Accounts', 'r'); lab('spam', '📧 Spam', 'r'); lab('tix', '🎟️ Tickets అన్నీ', 'r'); lab('cap', '🛡️ CAPTCHA', 'c');
lab('human', '🧑 Human: వంకర, Natural', 'g'); lab('bot', '🤖 Bot: Straight, Perfect', 'r'); lab('clu1', '🌐 Browser', 'c'); lab('clu2', '⏱️ Timing', 'y'); lab('clu3', '🍪 Cookies', '');
lab('sel', 'Traffic Lights ఎంచుకోండి', 'c'); lab('ai', '🧠 AI Training', 'y'); lab('old', '📖 పాత పుస్తకం', ''); lab('dig', '✓ Digital', 'g'); lab('news', '📰 Newspapers', 'c');
lab('race', '🤖 AI Bot: వేగంగా Solve!', 'r'); lab('bg', '🛡️ Background Check', 'c');
const fullForm = fixedEl(`<div style="font-family:Poppins;font-weight:700;font-size:40px;line-height:1.55">${[['C', 'ompletely'], ['A', 'utomated'], ['P', 'ublic'], ['T', 'uring test to tell'], ['C', 'omputers and'], ['H', 'umans'], ['A', 'part']].map(([a, b]) => `<div><span style="color:#FFE14D;font-weight:800;font-size:50px">${a}</span>${b}</div>`).join('')}</div>`, 'panel', 170, 760);
const raceP = fixedEl(`<div style="font-family:Poppins;font-weight:800;font-size:36px;margin-bottom:14px">CAPTCHA Solve Race ⏱️</div>
  <div style="display:flex;align-items:center;gap:14px;margin:8px 0"><span style="width:150px;font-size:34px">🤖 Bot</span><div style="width:520px;height:34px;border-radius:17px;background:rgba(255,255,255,.12);overflow:hidden"><i id="rb" style="display:block;height:100%;background:#ff5a6e;transform-origin:0 50%"></i></div></div>
  <div style="display:flex;align-items:center;gap:14px;margin:8px 0"><span style="width:150px;font-size:34px">🧑 మనం</span><div style="width:520px;height:34px;border-radius:17px;background:rgba(255,255,255,.12);overflow:hidden"><i id="rh" style="display:block;height:100%;background:#34d399;transform-origin:0 50%"></i></div></div>`, 'panel', 110, 300);
const rb = raceP.querySelector('#rb'), rh = raceP.querySelector('#rh');
const scoreP = fixedEl(`<div style="font-family:Poppins;font-weight:800;font-size:38px">Human Score</div><div id="sc" style="font-family:Poppins;font-weight:800;font-size:92px;color:#34d399;line-height:1.1">0.9</div><div style="font-size:30px;opacity:.85">Click అవసరం లేదు ✓</div>`, 'panel', 300, 820);
const scEl = scoreP.querySelector('#sc');

// ------------------------------------------------------------ helpers + shots
function camLook(pos, look, fov = 45) { camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look); camera.updateMatrixWorld(true); }
const hh = (t, k = 1) => V3((Math.sin(t * 0.9) * 0.012 + Math.sin(t * 2.3 + 1) * 0.006) * k, (Math.sin(t * 0.7 + 2) * 0.01 + Math.sin(t * 1.9) * 0.005) * k, 0);
const bl = v => browser.localToWorld(v.clone());
function reset() {
  [browser, curHuman, curBot, trailH, trailB, shield, letters, nn, book, wavy, digital, scanBeam, bigBot].forEach(o => (o.visible = false));
  bots.forEach(b => (b.visible = false)); spam.forEach(s => (s.visible = false)); xMarks.forEach(x => (x.visible = false)); tiles.forEach(t => (t.visible = false)); papers.forEach(p => (p.visible = false));
  browser.position.set(0, 1.6, 0); browser.rotation.set(0, 0, 0); browser.scale.setScalar(0.74); browser.userData.page.material.map = pageTex.un;
  scene.background = new THREE.Color(0x070b1f); scene.fog = new THREE.Fog(0x070b1f, 8, 30); key.position.set(3, 7, 5); key.target.position.set(0, 1, 0); hemi.intensity = 1.0; key.intensity = 2.0;
}
function motesAnim(t) { motes.forEach(m => { const d = m.userData; m.position.set(d.x + Math.sin(t * 0.5 + d.ph) * 0.3, ((d.y + t * d.v) % 6), d.z); }); }
function humanPath(u) { // wobbly natural path from bottom-left to the checkbox (browser-local)
  const a = V3(-1.0, -1.1, 0.02), c = CHK.clone().add(V3(0, 0, 0.02)), b1 = V3(0.6, -0.6, 0.02), b2 = V3(-0.9, -0.05, 0.02);
  const p = new THREE.Vector3().copy(a).multiplyScalar((1 - u) ** 3).addScaledVector(b1, 3 * (1 - u) ** 2 * u).addScaledVector(b2, 3 * (1 - u) * u * u).addScaledVector(c, u ** 3);
  p.x += Math.sin(u * 23) * 0.025 * (1 - u) + Math.sin(u * 51) * 0.01 * (1 - u); p.y += Math.cos(u * 19) * 0.02 * (1 - u); return p; }
const SH = {};
SH.intro = (t, a, b) => { browser.visible = true; curHuman.visible = true; motesAnim(t);
  const clickT = Wi(12) - 0.05, mv = E.io(P(t, 0.4, clickT - 0.4)); const p = humanPath(mv);
  curHuman.position.copy(bl(p)); curHuman.scale.setScalar(1 - 0.15 * pulse(t, clickT, 0.25));
  browser.userData.page.material.map = t < clickT ? pageTex.un : t < clickT + 0.9 ? pageTex.load : pageTex.chk;
  if (t > clickT && t < clickT + 0.9) { const { c, g, draw } = pageTex.load.userData; g.clearRect(0, 0, c.width, c.height); widget(g, c.width, c.height, 'loading', t * 9); pageTex.load.needsUpdate = true; }
  const u = E.io(P(t, 0, b)); camLook(V3(lerp(0.4, 0.15, u), lerp(1.8, 1.6, u), lerp(5.0, 4.2, u)).add(hh(t)), bl(V3(lerp(0, -0.15, u), lerp(0, -0.1, u), 0)), 45);
  showLab('ok', bl(CHK.clone().add(V3(0.5, 0.25, 0))), clickT + 0.9, b, t); };
SH.bots = (t, a, b) => { motesAnim(t); const tt = t - a; scene.fog = new THREE.Fog(0x070b1f, 10, 34);
  bots.forEach((bt, i) => { bt.visible = true; const R = rng(i + 11), ang = R() * 6.28, r = 1.5 + R() * 2.5; bt.position.set(Math.cos(ang + tt * 0.25) * r, 0, Math.sin(ang + tt * 0.25) * r - 2); bt.rotation.y = -ang - tt * 0.25 + Math.PI;
    bt.userData.bulb.material.opacity = 0.5 + 0.5 * Math.sin(t * 8 + i); bt.userData['arm1'].rotation.x = Math.sin(t * 6 + i) * 0.6; });
  spam.forEach((s, i) => { const kind = i % 3, t0 = [Wi(29), Wi(32), Wi(34)][kind] - 0.2 + Math.floor(i / 3) * 0.12; if (t < t0) return; s.visible = true; const R = rng(i + 40), bt = bots[i % bots.length];
    const u = P(t, t0, 1.6), block = P(t, Wi(39), 0.5); const from = bt.position.clone().add(V3(0, 1.1, 0)), to = V3((R() - 0.5) * 3, 1.5 + R() * 1.5, 1.0);
    s.position.copy(from.lerp(to, E.out(u))); s.position.z -= block * 1.2; s.rotation.set(Math.sin(t + i) * 0.3, t * (0.5 + R()), 0); s.material.opacity = 1 - block * 0.8; });
  shield.visible = t > Wi(39) - 0.3; if (shield.visible) { const k = E.back(P(t, Wi(39) - 0.3, 0.5)); shield.position.set(0, 1.9, 1.6); shield.scale.setScalar(k); shield.userData.hex.material.opacity = 0.35 + 0.2 * Math.sin(t * 6); }
  xMarks.forEach((x, i) => { if (t < Wi(40)) return; x.visible = true; x.position.set(-1 + i * 0.4, 1.4 + (i % 2) * 0.8, 1.55); x.scale.setScalar(E.back(P(t, Wi(40) + i * 0.06, 0.3))); });
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(0.8, 0.2, u), lerp(2.4, 2.1, u), lerp(6.2, 5.4, u)).add(hh(t, 2)), V3(0, 1.4, 0), 50);
  showLab('fake', V3(-1.1, 3.3, 0.5), Wi(29), Wi(38), t); showLab('spam', V3(1.0, 3.0, 0.5), Wi(32), Wi(38), t); showLab('tix', V3(0, 3.6, 0.5), Wi(34), Wi(38), t); showLab('cap', V3(0, 3.7, 1.6), Wi(39), b, t); };
SH.name = (t, a, b) => { motesAnim(t); letters.visible = true; const n = letterMeshes.length;
  letterMeshes.forEach((m, i) => { const k = E.back(P(t, a + 0.05 + i * 0.07, 0.5)); m.position.y = 2.5 + (1 - k) * 1.5 + Math.sin(t * 2 + i) * 0.04; m.scale.setScalar(Math.max(0.001, k)); m.rotation.y = Math.sin(t * 1.3 + i) * 0.15; });
  const u = E.io(P(t, a, b - a)); camLook(V3(0, lerp(2.6, 2.3, u), lerp(7.4, 8.0, u)).add(hh(t)), V3(0, lerp(2.4, 1.9, u), 0), 45);
  showFixed(fullForm, t, Wi(43) - 0.2, b + 0.2); };
SH.click = (t, a, b) => { motesAnim(t); browser.visible = true; browser.position.set(0, 1.6, 0); browser.rotation.set(-0.5, 0, 0);
  // race: bot (straight, constant speed, instant) vs human (wobbly, eased)
  const hT0 = Wi(61), hT1 = Wi(69) + 0.3, bT0 = Wi(73), bT1 = Wi(77) + 0.2;
  curHuman.visible = t > hT0 - 0.4; const hu = E.io(P(t, hT0, hT1 - hT0)); curHuman.position.copy(bl(humanPath(hu))); curHuman.rotation.copy(browser.rotation);
  const hp = []; for (let k = 0; k <= 40; k++) { const u = k / 40 * hu; hp.push(bl(humanPath(u))); } setTrail(trailH, hu > 0.02 ? hp : []);
  curBot.visible = t > bT0 - 0.4; const bu = P(t, bT0, bT1 - bT0), bStart = V3(1.1, -1.1, 0.02), bEnd = CHK.clone().add(V3(0.04, -0.03, 0.02)); const bpos = bStart.clone().lerp(bEnd, bu);
  curBot.position.copy(bl(bpos)); curBot.rotation.copy(browser.rotation); setTrail(trailB, bu > 0.02 ? [bl(bStart), bl(bStart.clone().lerp(bEnd, bu * 0.5)), bl(bpos)] : []);
  browser.userData.page.material.map = t > Wi(85) ? pageTex.chk : pageTex.un;
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(0.15, 0.3, u), lerp(4.3, 4.1, u), lerp(3.0, 3.2, u)).add(hh(t)), V3(-0.05, 1.35, -0.25), 45);
  showLab('human', bl(humanPath(Math.max(0.3, hu)).add(V3(0.1, 0.25, 0))), Wi(66), b, t); showLab('bot', bl(bStart.clone().lerp(bEnd, 0.4).add(V3(0.2, 0.2, 0))), Wi(73), b, t);
  showLab('clu1', bl(V3(-0.8, 0.75, 0.1)), Wi(80), b, t); showLab('clu2', bl(V3(0.0, 0.85, 0.1)), Wi(81), b, t); showLab('clu3', bl(V3(0.8, 0.75, 0.1)), Wi(83), b, t); };
SH.images = (t, a, b) => { motesAnim(t); const toNN = E.io(P(t, Wi(103) - 0.3, 1.0)); nn.visible = toNN > 0; nn.position.set(0, 2.0, -1.2);
  tiles.forEach((tl, i) => { tl.visible = true; const r = Math.floor(i / 3), c = i % 3, k = E.back(P(t, a + 0.05 + i * 0.05, 0.45)); const gp = V3((c - 1) * 0.68, 2.6 - r * 0.68, 0);
    const target = nn.position.clone().add(V3(-1.2, ((i % 5) - 2) * 0.32, 0)); tl.position.copy(gp.lerp(target, toNN)); tl.scale.setScalar(Math.max(0.001, k * (1 - toNN * 0.75))); tl.rotation.y = toNN * 1.2;
    const want = (tl.userData.k === 'light' && t > Wi(89) + i * 0.08) || (tl.userData.k === 'bus' && t > Wi(91) + i * 0.05); tl.userData.sel.material.opacity = want ? 0.9 : 0; tl.userData.tk.visible = want; });
  if (nn.visible) { const fl = (t - Wi(103)) * 2.2; nnNodes.forEach(({ s, li }) => (s.material.emissiveIntensity = 0.2 + 2.2 * Math.max(0, Math.sin((fl - li) * 2)) * toNN)); nnLinks.forEach(({ l, la }) => (l.material.opacity = 0.12 + 0.6 * Math.max(0, Math.sin((fl - la - 0.5) * 2)) * toNN)); }
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(0.3, 0.6, u), lerp(2.3, 2.3, u), lerp(5.2, 5.6, u)).add(hh(t)), V3(0, 2.0, lerp(0, -0.6, u)), 45);
  showLab('sel', V3(0, 3.25, 0), Wi(89) - 0.2, Wi(96), t); showLab('ai', V3(0.3, 3.2, -1.2), Wi(103), b, t); };
SH.books = (t, a, b) => { motesAnim(t); book.visible = true; book.position.set(0, 0.6, 0); book.rotation.set(0.05, 0.3, 0); key.target.position.set(0, 0.6, 0);
  const lift = E.io(P(t, Wi(113) - 0.2, 0.9)); wavy.visible = true; wavy.position.set(0, 0.68 + lift * 1.1, 0.05); wavy.rotation.set(-Math.PI / 2 * (1 - lift), 0.3 * (1 - lift), 0); wavy.scale.setScalar(0.5 + 0.5 * lift);
  const sc = P(t, Wi(119) - 0.2, 1.2); scanBeam.visible = sc > 0 && sc < 1; scanBeam.position.set(0, 1.78 + 0.3 - sc * 0.6, 0.12); scanBeam.material.opacity = 0.9;
  const dg = E.back(P(t, Wi(121), 0.6)); digital.visible = t > Wi(121); digital.position.set(0.15, 2.15, 0.2); digital.scale.setScalar(Math.max(0.001, dg)); wavy.material.opacity = 1 - P(t, Wi(121), 0.4);
  papers.forEach((p, i) => { p.visible = t > Wi(124) - 0.3; const k = E.out(P(t, Wi(124) - 0.3 + i * 0.08, 0.5)); p.position.set(1.4 - k * 0.4, 0.3 + i * 0.03, 0.4 + (1 - k) * 2); p.rotation.y = -0.4 + i * 0.07; });
  const u = E.io(P(t, a, b - a)); camLook(V3(lerp(0.6, 0.9, u), lerp(2.0, 2.4, u), lerp(3.4, 4.2, u)).add(hh(t)), V3(0.1, lerp(0.9, 1.4, u), 0), 45);
  showLab('old', V3(-0.4, 1.15, 0), a + 0.2, Wi(113), t); showLab('dig', V3(0.75, 2.7, 0.2), Wi(122), b, t); showLab('news', V3(1.2, 1.1, 0.4), Wi(124), b, t); };
SH.future = (t, a, b) => { motesAnim(t); const bg = t > Wi(137) - 0.3;
  if (!bg) { bigBot.visible = true; bigBot.position.set(0.9, 0, -0.6); bigBot.rotation.y = -0.4; bigBot.userData.bulb.material.opacity = 0.6 + 0.4 * Math.sin(t * 12); bigBot.userData['arm1'].rotation.x = -1.2 + Math.sin(t * 14) * 0.2;
    browser.visible = true; browser.position.set(-0.35, 1.6, 0.2); browser.rotation.set(0, 0.35, 0); browser.scale.setScalar(0.55); browser.userData.page.material.map = t > Wi(134) ? pageTex.chk : pageTex.un;
    const pr = P(t, Wi(132), 1.6), ph = P(t, Wi(132), 5.5); rb.style.transform = `scaleX(${pr.toFixed(3)})`; rh.style.transform = `scaleX(${ph.toFixed(3)})`; showFixed(raceP, t, Wi(130) - 0.2, Wi(137) - 0.3);
    camLook(V3(0.2, 2.1, 5.2).add(hh(t)), V3(0.15, 1.45, 0), 45); showLab('race', V3(0.9, 3.0, -0.6), Wi(133), Wi(137) - 0.3, t); }
  else { browser.visible = true; browser.position.set(0, 1.7, 0); browser.rotation.set(0, 0, 0); browser.userData.page.material.map = pageTex.un; curHuman.visible = true;
    curHuman.position.copy(bl(V3(Math.sin(t * 0.9) * 0.6, Math.cos(t * 0.7) * 0.35, 0.02))); shield.visible = true; shield.position.set(0, 1.7, -0.3); shield.scale.setScalar(1.1 + 0.05 * Math.sin(t * 3));
    shield.userData.hex.material.opacity = 0.25 + 0.15 * Math.sin(t * 5); shield.userData.face.material.opacity = 0.08;
    scEl.textContent = (0.1 + 0.8 * E.out(P(t, Wi(143), 1.4))).toFixed(1); showFixed(scoreP, t, Wi(142), END + 1);
    const u = E.io(P(t, Wi(137), b - Wi(137))); camLook(V3(lerp(0.3, 0, u), lerp(1.9, 1.8, u), lerp(5.0, 5.6, u)).add(hh(t)), V3(0, 1.6, 0), 45); showLab('bg', V3(0, 2.95, 0), Wi(139), END + 1, t); }
};
const ORDER = ['intro', 'bots', 'name', 'click', 'images', 'books', 'future'];
sfx(0.3, 'whooshS', 0.5); sfx(Wi(12) - 0.05, 'click', 1); sfx(Wi(12) + 0.1, 'scan', 0.4); sfx(Wi(12) + 0.9, 'success', 0.7);
sfx(S.bots, 'robots', 0.7); sfx(Wi(29), 'pop', 0.5); sfx(Wi(32), 'pop', 0.5); sfx(Wi(34), 'pop', 0.5); sfx(Wi(39) - 0.3, 'shieldUp', 0.8); sfx(Wi(40), 'buzz', 0.5);
[0, 1, 2, 3, 4, 5, 6].forEach(i => sfx(S.name + 0.05 + i * 0.07, 'tick', 0.4)); sfx(Wi(43) - 0.2, 'whooshS', 0.4);
sfx(Wi(61), 'mouse', 0.6); sfx(Wi(69) + 0.3, 'click', 0.8); sfx(Wi(73), 'zipStraight', 0.7); sfx(Wi(77) + 0.2, 'click', 0.8); [80, 81, 83].forEach(i => sfx(Wi(i), 'popLow', 0.45)); sfx(Wi(85), 'success', 0.6);
sfx(Wi(89), 'click', 0.6); sfx(Wi(89) + 0.2, 'click', 0.5); sfx(Wi(91), 'click', 0.6); sfx(Wi(103) - 0.3, 'whooshS', 0.5); sfx(Wi(104), 'sparkle', 0.6);
sfx(Wi(113) - 0.2, 'pageFlip', 0.7); sfx(Wi(119) - 0.2, 'scan', 0.6); sfx(Wi(121), 'ding', 0.6); sfx(Wi(124) - 0.3, 'pageFlip', 0.5);
sfx(Wi(130) - 0.2, 'robots', 0.6); sfx(Wi(132), 'tick', 0.4); sfx(Wi(134), 'buzz', 0.4); sfx(Wi(137) - 0.3, 'shieldUp', 0.6); sfx(Wi(143), 'check', 0.6);
window.SFX = SFX;

window.render = function (t) {
  reset(); renderer.toneMappingExposure = 1.0;   // reset every frame (the transition flash multiplies it)
  let k = 0; for (let i = 0; i < ORDER.length; i++) if (t >= (i === 0 ? 0 : S[ORDER[i]] - 0.02)) k = i;
  const name = ORDER[k], a = k === 0 ? 0 : S[name], b = k + 1 < ORDER.length ? S[ORDER[k + 1]] : END;
  Object.values(LBL).forEach(L => (L.e.style.visibility = 'hidden')); [fullForm, raceP, scoreP].forEach(e => (e.style.visibility = 'hidden'));
  SH[name](t, a, b);
  const dip = Math.max(...ORDER.slice(1).map(n => pulse(t, S[n] - 0.09, 0.18)));
  renderer.toneMappingExposure *= 1 + dip * 1.3;
  renderer.render(scene, camera); renderChips(t); renderCaps(t);
  const f = Math.round(t * 30); gctx.putImageData(GRAIN[f % 6], 0, 0); grainCv.style.transform = `translate(${((f * 37) % 9) - 4}px, ${((f * 53) % 9) - 4}px)`;
};
window.setup = async function () {
  await Promise.all(['800 40px "Baloo Tammudu 2"', '700 40px "Baloo Tammudu 2"', '700 40px "Poppins"', '800 40px "Poppins"', '600 40px "Poppins"', '40px "Noto Color Emoji"'].map(f => document.fonts.load(f, 'అఆ abc 🔒')));
  await document.fonts.ready;
  const redraw = tx => { if (!tx || !tx.userData || !tx.userData.draw) return; const { c, g, draw } = tx.userData; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tx.needsUpdate = true; };
  scene.traverse(o => { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => m && m.map && redraw(m.map)); }); Object.values(pageTex).forEach(redraw);
  const font = await new FontLoader().loadAsync('../node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
  const cols = [0x22d3ee, 0x38bdf8, 0x818cf8, 0xa78bfa, 0xc084fc, 0xf472b6, 0xfb7185]; let x = 0; const gl = [];
  'CAPTCHA'.split('').forEach((ch, i) => { const g = new TextGeometry(ch, { font, size: 0.4, depth: 0.14, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2 }); g.computeBoundingBox();
    const w = g.boundingBox.max.x - g.boundingBox.min.x; g.translate(-w / 2, 0, 0); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: cols[i], roughness: 0.3, metalness: 0.4, emissive: cols[i], emissiveIntensity: 0.25 })); m.castShadow = true;
    gl.push({ m, w }); });
  const total = gl.reduce((s, o) => s + o.w + 0.08, 0); gl.forEach(o => { o.m.position.x = -total / 2 + x + o.w / 2; x += o.w + 0.08; letters.add(o.m); }); letterMeshes = gl.map(o => o.m);
  window.render(0); return { duration: END, sfx: SFX };
};
window.__ready = true;
