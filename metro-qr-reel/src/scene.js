// Metro QR reel: deterministic three.js world. window.render(t) draws the frame at time t (seconds).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TL = window.TL, words = TL.words, W = words.map(w => w.t), WE = words.map(w => w.t + w.dur);
const S = {}; TL.scenes.forEach(s => (S[s.name] = s.t));
const END = Math.round((TL.voiceDur + 2.5) * 30) / 30;
window.DURATION = END;

// ------------------------------------------------------------ utils
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, x) => a + (b - a) * x;
const ss = x => x * x * (3 - 2 * x);
const E = { out: x => 1 - Math.pow(1 - x, 3), io: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: x => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); } };
const pulse = (t, a, d) => { const x = (t - a) / d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const SFX = []; const sfx = (t, name, gain = 1) => SFX.push({ t: +Math.max(0, t).toFixed(3), name, gain });

// ------------------------------------------------------------ renderer / scene
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 600);

const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x3a3428, 0.9); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun, sun.target);

// ------------------------------------------------------------ textures (canvas)
function ctex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g, draw }; return t;
}
const FONT = "'Poppins', sans-serif", TFONT = "'Baloo Tammudu 2', 'Noto Sans Telugu', sans-serif";
function qrMatrix(seed, n = 29) {
  const R = rng(seed), m = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = R() > 0.52 ? 1 : 0;
  const finder = (ox, oy) => { for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) { const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= n || Y >= n) continue;
    const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3)); m[Y][X] = (x < 0 || y < 0 || x > 6 || y > 6) ? 0 : (ring === 3 || ring <= 1) ? 1 : 0; } };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7); return m;
}
function drawQR(g, x0, y0, size, seed, scramble = 0) {
  const m = qrMatrix(seed), n = m.length, c = size / n; g.fillStyle = '#fff'; g.fillRect(x0 - c * 2, y0 - c * 2, size + c * 4, size + c * 4);
  const R = rng(seed * 7 + Math.floor(scramble * 20));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { let v = m[y][x]; if (scramble > 0 && R() < scramble * 0.6) v = 1 - v;
    if (v) { g.fillStyle = '#111'; g.fillRect(x0 + x * c, y0 + y * c, c + 0.5, c + 0.5); } }
}
// phone screens
function phoneScreen(g, w, h, mode, seed = 3) {
  const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#0f2547'); grd.addColorStop(1, '#0a1428'); g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.8)'; g.font = `600 22px ${FONT}`; g.fillText('9:42', 36, 46); g.fillText('5G ▮▮▮', w - 120, 46);
  g.fillStyle = '#1E6FD9'; g.fillRect(0, 70, w, 110); g.fillStyle = '#fff'; g.font = `800 40px ${FONT}`; g.fillText('Metro e-Ticket', 36, 140);
  if (mode === 'pay' || mode === 'paid') {
    g.fillStyle = '#fff'; g.font = `700 34px ${FONT}`; g.fillText('Ameerpet  →  HITEC City', 36, 260);
    g.fillStyle = 'rgba(255,255,255,.65)'; g.font = `600 28px ${FONT}`; g.fillText('1 Adult  •  Single Journey', 36, 310);
    g.fillStyle = mode === 'paid' ? '#12B76A' : '#F59E0B'; g.beginPath(); g.roundRect(36, 640, w - 72, 120, 26); g.fill();
    g.fillStyle = '#fff'; g.font = `800 42px ${FONT}`; g.textAlign = 'center';
    g.fillText(mode === 'paid' ? 'Payment Successful ✓' : 'Pay with UPI', w / 2, 715); g.textAlign = 'left';
    if (mode === 'paid') { g.strokeStyle = '#12B76A'; g.lineWidth = 16; g.beginPath(); g.arc(w / 2, 470, 110, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(w / 2 - 50, 470); g.lineTo(w / 2 - 10, 512); g.lineTo(w / 2 + 58, 430); g.stroke(); }
    return;
  }
  g.fillStyle = '#fff'; g.font = `700 32px ${FONT}`; g.fillText('Ameerpet  →  HITEC City', 36, 236);
  g.fillStyle = 'rgba(255,255,255,.65)'; g.font = `600 26px ${FONT}`; g.fillText('Valid today  •  16 Nov  •  1 Adult', 36, 280);
  drawQR(g, 76, 340, w - 152, seed, mode === 'scramble' ? 1 : 0);
  if (mode === 'used') { g.save(); g.translate(w / 2, 560); g.rotate(-0.25); g.strokeStyle = '#F04438'; g.lineWidth = 12; g.strokeRect(-190, -70, 380, 140);
    g.fillStyle = '#F04438'; g.font = `800 96px ${FONT}`; g.textAlign = 'center'; g.fillText('USED', 0, 34); g.restore(); }
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = `600 26px ${FONT}`; g.textAlign = 'center'; g.fillText('Show this QR at the gate', w / 2, h - 60); g.textAlign = 'left';
}
const floorTex = ctex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#8f939a'; g.fillRect(0, 0, w, h); const R = rng(4);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = 150 + R() * 22; g.fillStyle = `rgb(${v},${v + 2},${v + 6})`; g.fillRect(x * 256 + 2, y * 256 + 2, 252, 252); }
  g.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 3000; i++) g.fillRect(R() * w, R() * h, 2, 2);
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(30, 30);
const tactile = ctex(256, 256, (g, w, h) => { g.fillStyle = '#E8B71A'; g.fillRect(0, 0, w, h); g.fillStyle = '#c99a0d'; for (let i = 0; i < 4; i++) g.fillRect(20 + i * 60, 10, 30, h - 20); });
tactile.wrapS = tactile.wrapT = THREE.RepeatWrapping;
function signTex(lines, bg = '#0B2A55', w = 1024, h = 256) {
  return ctex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#FFE14D'; g.fillRect(0, h - 14, w, 14);
    g.fillStyle = '#fff'; g.font = `800 92px ${FONT}`; g.fillText(lines[0], 40, 120); g.font = `700 64px ${TFONT}`; g.fillText(lines[1], 40, 215); });
}

// ------------------------------------------------------------ materials
const M = {
  floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.28, metalness: 0.0, envMapIntensity: 0.9 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 0.85 }),
  ceil: new THREE.MeshStandardMaterial({ color: 0x8f949c, roughness: 0.9 }),
  pillar: new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: 0.5 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xc8ced8, metalness: 0.85, roughness: 0.32 }),
  darkGlass: new THREE.MeshStandardMaterial({ color: 0x14181f, metalness: 0.3, roughness: 0.12 }),
  lightStrip: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  blueStrip: new THREE.MeshBasicMaterial({ color: 0x4FA3FF, toneMapped: false }),
  flap: new THREE.MeshStandardMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1, depthWrite: false }),
  rail: new THREE.MeshStandardMaterial({ color: 0x8b8f96, metalness: 0.9, roughness: 0.35 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xb9b6ae, roughness: 0.95 }),
};

// ------------------------------------------------------------ CONCOURSE
const conc = new THREE.Group(); scene.add(conc);
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.floor); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; conc.add(f);
  const c = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.ceil); c.rotation.x = Math.PI / 2; c.position.y = 4.4; conc.add(c);
  for (let i = -6; i <= 6; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 30), M.lightStrip); l.position.set(i * 2.6, 4.37, -2); conc.add(l); }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(80, 6), M.wall); back.position.set(0, 2.2, -14); conc.add(back);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(80, 6), M.wall); front.position.set(0, 2.2, 16); front.rotation.y = Math.PI; conc.add(front);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(80, 0.5), new THREE.MeshStandardMaterial({ color: 0x1E5AA8, roughness: 0.6 })); band.position.set(0, 3.4, -13.98); conc.add(band);
  for (const x of [-7.8, -3.9, 3.9, 7.8]) for (const z of [-7, 5]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 4.4, 24), M.pillar); p.position.set(x, 2.2, z); p.castShadow = true; p.receiveShadow = true; conc.add(p); }
  const tac = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 12), new THREE.MeshStandardMaterial({ map: tactile, roughness: 0.6 })); tac.material.map.repeat.set(1, 24); tac.rotation.x = -Math.PI / 2; tac.position.set(3.6, 0.003, 5); conc.add(tac);
  const s1 = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: signTex(['To Platforms  ↑', 'ప్లాట్‌ఫారమ్‌లకు']), toneMapped: false })); s1.position.set(-1.2, 3.3, -4.5); conc.add(s1);
  const s2 = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.75), new THREE.MeshBasicMaterial({ map: signTex(['Ticket Counter', 'టికెట్ కౌంటర్'], '#0F5132'), toneMapped: false })); s2.position.set(5.6, 3.1, 7.2); s2.rotation.y = -0.5; conc.add(s2);
  // ticket machines
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); const b = new THREE.Mesh(new RoundedBoxGeometry(0.8, 1.8, 0.55, 3, 0.06), new THREE.MeshStandardMaterial({ color: 0x1E5AA8, roughness: 0.4, metalness: 0.3 }));
    b.position.y = 0.9; b.castShadow = true; g.add(b); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.42), new THREE.MeshBasicMaterial({ color: 0x9fd3ff, toneMapped: false })); scr.position.set(0, 1.25, 0.28); g.add(scr);
    g.position.set(-6.5 + i * 1.1, 0, 7.6); conc.add(g); }
  // stanchions
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), M.steel); s.position.set(-4.4 + i * 0.9, 0.5, 3.2); s.castShadow = true; conc.add(s); }
}
// gates
const GATE_X = [-2.2, -1.1, 0, 1.1, 2.2], LANE_X = [-1.65, -0.55, 0.55, 1.65];
const gates = { cabinets: [], flaps: [], leds: [], scanners: [], beams: [], emitters: [], internals: null, cabMats: [] };
function ledTex(kind) { return ctex(128, 128, (g, w, h) => { g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); g.lineWidth = 16; g.lineCap = 'round';
  if (kind === 'go') { g.strokeStyle = '#34E07A'; g.beginPath(); g.moveTo(64, 100); g.lineTo(64, 30); g.moveTo(34, 58); g.lineTo(64, 28); g.lineTo(94, 58); g.stroke(); }
  else if (kind === 'stop') { g.strokeStyle = '#FF3B3B'; g.beginPath(); g.moveTo(36, 36); g.lineTo(92, 92); g.moveTo(92, 36); g.lineTo(36, 92); g.stroke(); }
  else { g.strokeStyle = '#2a3b55'; g.beginPath(); g.moveTo(64, 100); g.lineTo(64, 30); g.stroke(); } }); }
const LEDT = { idle: ledTex('idle'), go: ledTex('go'), stop: ledTex('stop') };
GATE_X.forEach((x, i) => {
  const g = new THREE.Group(); g.position.set(x, 0, 0); conc.add(g);
  const mat = M.steel.clone(); gates.cabMats.push(mat);
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.28, 1.0, 1.55, 4, 0.06), mat); body.position.y = 0.5; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const top = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.05, 1.57, 3, 0.02), M.darkGlass); top.position.y = 1.01; g.add(top);
  for (const sx of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.03, 1.3), M.blueStrip); st.position.set(sx * 0.145, 0.9, 0); g.add(st); }
  // scanner pads on both ends (entry end +z, exit end -z)
  const pads = [];
  for (const sz of [1, -1]) { const pad = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.025, 0.24, 2, 0.01), M.darkGlass); pad.position.set(0, 1.045, sz * 0.5); pad.rotation.x = sz * -0.18; g.add(pad);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 40), new THREE.MeshBasicMaterial({ color: 0x9fd3ff, toneMapped: false, transparent: true, opacity: 0.6 }));
    ring.rotation.x = -Math.PI / 2 + sz * -0.18; ring.position.set(0, 1.06, sz * 0.5); g.add(ring); pads.push(ring); }
  gates.scanners.push(pads);
  const leds = [];
  for (const sz of [1, -1]) { const led = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: LEDT.idle, toneMapped: false }));
    led.position.set(0, 0.78, sz * 0.781); if (sz < 0) led.rotation.y = Math.PI; g.add(led); leds.push(led); }
  gates.leds.push(leds);
  gates.cabinets.push(g);
});
// flaps per lane (left + right), IR beams per lane
LANE_X.forEach((lx, li) => {
  const pair = [];
  for (const side of [-1, 1]) { const f = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.5, 0.03, 3, 0.012), M.flap); f.position.set(lx + side * 0.27, 0.66, 0); f.userData = { side, lx }; conc.add(f); pair.push(f);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.46, 0.035), new THREE.MeshBasicMaterial({ color: 0xff5544, toneMapped: false })); edge.position.set(-side * 0.165, 0, 0); f.add(edge); f.userData.edge = edge; }
  gates.flaps.push(pair);
  const bs = [], es = [];
  for (let k = 0; k < 6; k++) { const z = 0.55 - k * 0.22;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.82, 6), new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false, transparent: true, opacity: 0 }));
    b.rotation.z = Math.PI / 2; b.position.set(lx, 0.55, z); conc.add(b); bs.push(b);
    for (const side of [-1, 1]) { const e = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), new THREE.MeshBasicMaterial({ color: 0x330808, toneMapped: false }));
      e.position.set(lx + side * 0.418, 0.55, z); e.rotation.y = side * -Math.PI / 2; conc.add(e); es.push(e); } }
  gates.beams.push(bs); gates.emitters.push(es);
});
// x-ray internals inside cabinet at x=0 (right of hero lane 1)
{ const g = new THREE.Group(); g.position.set(0, 0, 0); g.visible = false; conc.add(g);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.26), new THREE.MeshStandardMaterial({ color: 0x0f7b3a, roughness: 0.5, emissive: 0x05301a })); pcb.position.set(0.05, 0.45, 0.42); g.add(pcb);
  for (let i = 0; i < 4; i++) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 })); ch.position.set(0.04, 0.4 + (i % 2) * 0.08, 0.36 + Math.floor(i / 2) * 0.12); g.add(ch); }
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24), new THREE.MeshStandardMaterial({ color: 0x8892a0, metalness: 0.8, roughness: 0.3 })); motor.position.set(0, 0.5, 0.05); g.add(motor);
  const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 12), new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.8, roughness: 0.3 })); gear.position.set(0, 0.6, 0.05); g.add(gear);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0, 1.0, 0.5), V3(0, 0.75, 0.5), V3(0, 0.55, 0.42), V3(0, 0.5, 0.2), V3(0, 0.5, 0.06)]), 30, 0.008, 6), new THREE.MeshBasicMaterial({ color: 0xffb020, toneMapped: false })); g.add(wire);
  gates.internals = { g, pcb, motor, gear, path: new THREE.CatmullRomCurve3([V3(0, 1.05, 0.5), V3(0, 0.75, 0.5), V3(0, 0.5, 0.42), V3(0, 0.5, 0.2), V3(0, 0.5, 0.06)]) };
}
function setFlaps(li, open) { gates.flaps[li].forEach(f => { const s = f.userData.side; f.position.x = f.userData.lx + s * (0.27 + 0.30 * open); }); }
function setLed(gi, end, kind) { gates.leds[gi][end].material.map = LEDT[kind]; }
function setScanner(gi, end, color, k) { const r = gates.scanners[gi][end]; r.material.color.set(color); r.material.opacity = 0.35 + 0.65 * k; r.scale.setScalar(1 + 0.25 * k); }

// ------------------------------------------------------------ PEOPLE
const capsule = (r, l, mat) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 14), mat); m.castShadow = true; return m; };
function makePerson(o) {
  const skin = new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.6 });
  const shirt = new THREE.MeshStandardMaterial({ color: o.shirt, roughness: 0.75 }), pants = new THREE.MeshStandardMaterial({ color: o.pants, roughness: 0.8 });
  const hairM = new THREE.MeshStandardMaterial({ color: 0x15110e, roughness: 0.7 }), shoeM = new THREE.MeshStandardMaterial({ color: o.shoe || 0x222222, roughness: 0.5 });
  const root = new THREE.Group(), hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips);
  const torso = capsule(0.165, 0.36, shirt); torso.scale.z = 0.62; torso.position.y = 0.3; hips.add(torso);
  if (o.female) { const tunic = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.42, 20), shirt); tunic.position.y = -0.02; tunic.scale.z = 0.7; tunic.castShadow = true; hips.add(tunic); }
  const neck = capsule(0.05, 0.06, skin); neck.position.y = 0.58; hips.add(neck);
  const head = new THREE.Group(); head.position.y = 0.72; hips.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 18), skin); skull.scale.set(0.92, 1.05, 1); skull.castShadow = true; head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM); hair.position.set(0, 0.012, -0.01); hair.scale.set(0.95, 1.05, 1.02); head.add(hair);
  if (o.female) { const lh = capsule(0.085, 0.22, hairM); lh.position.set(0, -0.1, -0.07); head.add(lh); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0x111111 })); e.position.set(s * 0.04, 0.01, 0.105); head.add(e); }
  const limb = (side, isArm) => {
    const sh = new THREE.Group(); sh.position.set(side * (isArm ? 0.215 : 0.09), isArm ? 0.48 : -0.02, 0); hips.add(sh);
    const up = capsule(isArm ? 0.048 : 0.072, isArm ? 0.22 : 0.33, isArm ? shirt : pants); up.position.y = isArm ? -0.15 : -0.22; sh.add(up);
    const j = new THREE.Group(); j.position.y = isArm ? -0.3 : -0.44; sh.add(j);
    const lo = capsule(isArm ? 0.04 : 0.06, isArm ? 0.2 : 0.32, isArm ? skin : pants); lo.position.y = isArm ? -0.13 : -0.2; j.add(lo);
    let end;
    if (isArm) { end = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), skin); end.position.y = -0.27; j.add(end); }
    else { end = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.07, 0.24, 2, 0.03), shoeM); end.position.set(0, -0.42, 0.05); end.castShadow = true; j.add(end); }
    return { sh, j, end };
  };
  const L = { la: limb(-1, true), ra: limb(1, true), ll: limb(-1, false), rl: limb(1, false) };
  let phone = null;
  if (o.phone) { phone = new THREE.Group(); const b = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.155, 0.01, 2, 0.006), new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.5, roughness: 0.3 }));
    phone.add(b); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.145), new THREE.MeshBasicMaterial({ color: 0x6fb6ff, toneMapped: false })); scr.position.z = 0.0055; phone.add(scr);
    phone.position.set(0, -0.06, 0.04); phone.rotation.x = -1.2; L.ra.end.add(phone); }
  if (o.bag) { const bag = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.34, 0.14, 2, 0.04), new THREE.MeshStandardMaterial({ color: o.bag, roughness: 0.8 })); bag.position.set(0, 0.3, -0.2); bag.castShadow = true; hips.add(bag); }
  root.userData = { hips, head, L, phone };
  scene.add(root); return root;
}
function pose(p, { phase = 0, walk = 0, raise = 0, tilt = 0, lookDown = 0 } = {}) {
  const { hips, head, L } = p.userData, s = Math.sin(phase), c = Math.cos(phase);
  hips.position.y = 0.95 + Math.abs(c) * 0.025 * walk;
  L.ll.sh.rotation.x = -s * 0.5 * walk; L.rl.sh.rotation.x = s * 0.5 * walk;
  L.ll.j.rotation.x = Math.max(0, Math.sin(phase + 1.6)) * 0.75 * walk; L.rl.j.rotation.x = Math.max(0, Math.sin(phase + 1.6 + Math.PI)) * 0.75 * walk;
  L.la.sh.rotation.x = s * 0.4 * walk; L.la.j.rotation.x = -0.25 - 0.1 * walk; L.la.sh.rotation.z = -0.08;
  L.ra.sh.rotation.x = lerp(-s * 0.4 * walk, -1.15, raise); L.ra.j.rotation.x = lerp(-0.25, -0.75, raise); L.ra.sh.rotation.z = lerp(0.08, -0.05, raise);
  head.rotation.z = tilt; head.rotation.x = lookDown;
}
// walk a person along timed keys [[t, x, z], ...]
function walkKeys(p, t, keys, extra = {}) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [t0, x0, z0] = keys[i], [t1, x1, z1] = keys[i + 1];
  const u = clamp((t - t0) / Math.max(0.001, t1 - t0)), moving = (x0 !== x1 || z0 !== z1) && t > t0 && t < t1;
  const x = lerp(x0, x1, u), z = lerp(z0, z1, u);
  p.position.set(x, 0, z);
  if (x0 !== x1 || z0 !== z1) p.rotation.y = Math.atan2(x1 - x0, z1 - z0);
  else if (extra.face !== undefined) p.rotation.y = extra.face;
  const dist = Math.hypot(x1 - x0, z1 - z0), speed = dist / Math.max(0.001, t1 - t0);
  pose(p, Object.assign({ phase: t * speed * 4.2, walk: moving ? clamp(speed / 1.2) : 0 }, extra));
}
const skins = [0xa86b45, 0xc58a5c, 0x8d5a3b, 0xb97a4f, 0x9b6440];
const hero = makePerson({ skin: 0xb97a4f, shirt: 0x2f6fde, pants: 0x2b3446, phone: true, bag: 0x3b3b3b });
const card = makePerson({ skin: 0xc58a5c, shirt: 0xd9485f, pants: 0x1f2937, female: true });
const tail = makePerson({ skin: 0x8d5a3b, shirt: 0x16a34a, pants: 0x374151 });
const exitP = makePerson({ skin: 0xa86b45, shirt: 0xf59e0b, pants: 0x1e293b });
const npcs = []; { const R = rng(21); const shirts = [0x7c3aed, 0x0ea5e9, 0xf97316, 0x64748b, 0xec4899, 0x14b8a6, 0xeab308, 0x475569];
  for (let i = 0; i < 9; i++) npcs.push({ p: makePerson({ skin: skins[i % 5], shirt: shirts[i % 8], pants: [0x1f2937, 0x334155, 0x3f3f46][i % 3], female: i % 3 === 1, bag: i % 4 === 0 ? 0x5b4636 : 0 }),
    lane: [0, 2, 3, 0, 3, 2, 0, 3, 2][i], off: R() * 9, dir: i % 4 === 3 ? -1 : 1, x0: (R() - 0.5) * 8 }); }

// ------------------------------------------------------------ PLATFORM + TRAIN + SKYLINE (area at x=+200)
const PX = 200, plat = new THREE.Group(); plat.position.x = PX; scene.add(plat);
{ const slab = new THREE.Mesh(new THREE.BoxGeometry(90, 1, 7), M.concrete); slab.position.set(0, -0.5, 1.5); slab.receiveShadow = true; plat.add(slab);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(90, 7), new THREE.MeshStandardMaterial({ map: floorTex.clone(), roughness: 0.35 })); top.material.map.repeat.set(30, 3); top.material.map.needsUpdate = true;
  top.rotation.x = -Math.PI / 2; top.position.set(0, 0.002, 1.5); top.receiveShadow = true; plat.add(top);
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(90, 0.25), new THREE.MeshStandardMaterial({ color: 0xF2C12E, roughness: 0.6 })); edge.rotation.x = -Math.PI / 2; edge.position.set(0, 0.004, -1.6); plat.add(edge);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(90, 0.5, 4), M.concrete); bed.position.set(0, -1.5, -4.2); plat.add(bed);
  for (const rz of [-3.5, -4.9]) { const r = new THREE.Mesh(new THREE.BoxGeometry(90, 0.12, 0.08), M.rail); r.position.set(0, -1.18, rz); plat.add(r); }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(90, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.6 })); roof.position.set(0, 5.2, -1); plat.add(roof);
  for (let i = -6; i <= 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5.2, 16), M.steel); c.position.set(i * 7, 2.6, 4.4); c.castShadow = true; plat.add(c);
    const l = new THREE.Mesh(new THREE.BoxGeometry(5, 0.05, 0.25), M.lightStrip); l.position.set(i * 7, 5.05, 1); plat.add(l); }
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.85), new THREE.MeshBasicMaterial({ map: signTex(['Ameerpet', 'అమీర్‌పేట్']), toneMapped: false })); ps.position.set(3, 3.9, 4.2); ps.rotation.y = Math.PI; plat.add(ps);
  const ps2 = ps.clone(); ps2.rotation.y = 0; ps2.position.set(-6, 3.9, 4.35); plat.add(ps2);
  // skyline
  const R = rng(8), winTex = ctex(128, 256, (g, w, h) => { g.fillStyle = '#d9d3c8'; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 22) for (let x = 8; x < w; x += 20) { g.fillStyle = R() > 0.6 ? '#ffd58a' : '#5b6575'; g.fillRect(x, y, 12, 14); } });
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  for (let i = 0; i < 70; i++) { const h = 6 + R() * 34, w = 5 + R() * 9; const m = new THREE.MeshStandardMaterial({ map: winTex.clone(), color: new THREE.Color().setHSL(0.08, 0.15, 0.55 + R() * 0.3), roughness: 0.8, emissive: 0x2a1c08, emissiveIntensity: 0.4 });
    m.map.repeat.set(w / 6, h / 8); m.map.needsUpdate = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), m); b.position.set(-120 + R() * 240, h / 2 - 12, -30 - R() * 70); plat.add(b); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: 0x6f6a5f, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -12, -60); plat.add(ground);
  // viaduct pillars
  for (let i = -6; i <= 6; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(1.4, 11, 1.6), M.concrete); v.position.set(i * 9, -7, -3); plat.add(v); }
}
const skyTex = ctex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b7fbf'); gr.addColorStop(0.55, '#f2b97c'); gr.addColorStop(1, '#f6d7a8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const trainG = new THREE.Group(); plat.add(trainG);
{ const body = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, metalness: 0.35, roughness: 0.28 });
  const stripe = new THREE.MeshStandardMaterial({ color: 0x1E5AA8, roughness: 0.4 }), stripe2 = new THREE.MeshStandardMaterial({ color: 0xE11D48, roughness: 0.4 });
  for (let c = 0; c < 3; c++) { const car = new THREE.Group(); car.position.x = c * 17.6; trainG.add(car);
    const b = new THREE.Mesh(new RoundedBoxGeometry(17, 3.3, 2.9, 4, 0.45), body); b.position.y = 1.55; b.castShadow = true; car.add(b);
    const win = new THREE.Mesh(new RoundedBoxGeometry(15.6, 0.95, 2.94, 2, 0.12), M.darkGlass); win.position.y = 2.05; car.add(win);
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(16.9, 0.22, 2.95), stripe); s1.position.y = 1.2; car.add(s1);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(16.9, 0.08, 2.95), stripe2); s2.position.y = 1.04; car.add(s2);
    for (let d = 0; d < 4; d++) { const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 2.96), new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 0.4, roughness: 0.3 })); door.position.set(-6 + d * 4, 1.25, 0); car.add(door);
      const dw = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 2.98), M.darkGlass); dw.position.set(-6 + d * 4, 1.85, 0); car.add(dw); }
    const under = new THREE.Mesh(new THREE.BoxGeometry(15, 0.5, 2.4), new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.8 })); under.position.y = -0.2; car.add(under); }
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 2.4), M.darkGlass); nose.position.set(-8.55, 2.0, 0); trainG.add(nose);
  for (const z of [-0.9, 0.9]) { const hl = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: 0xfff6d5, toneMapped: false })); hl.position.set(-8.61, 0.85, z); hl.rotation.y = -Math.PI / 2; trainG.add(hl); }
  trainG.position.set(0, -0.15, -4.2);
}
const platPeople = [0, 1, 2].map(i => makePerson({ skin: skins[i + 1], shirt: [0x0ea5e9, 0xf43f5e, 0x84cc16][i], pants: 0x1f2937, female: i === 1, bag: i === 0 ? 0x444444 : 0 }));

// ------------------------------------------------------------ PROPS: phone close-up, smart card, server, map
const studio = new THREE.Group(); scene.add(studio);
const phoneTexes = {}; for (const m of ['qr', 'scramble', 'pay', 'paid', 'used', 'blank']) phoneTexes[m] = ctex(540, 1080, (g, w, h) => m === 'blank' ? (g.fillStyle = '#0a1428', g.fillRect(0, 0, w, h)) : phoneScreen(g, w, h, m));
const bigPhone = new THREE.Group(); scene.add(bigPhone);
{ const b = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.158, 0.009, 3, 0.008), new THREE.MeshStandardMaterial({ color: 0x0d0f14, metalness: 0.6, roughness: 0.25 })); b.castShadow = true; bigPhone.add(b);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.069, 0.148), new THREE.MeshBasicMaterial({ map: phoneTexes.qr, toneMapped: false })); scr.position.z = 0.0048; bigPhone.add(scr); bigPhone.userData.scr = scr;
  const handM = new THREE.MeshStandardMaterial({ color: 0xb97a4f, roughness: 0.6 });
  const palm = new THREE.Mesh(new RoundedBoxGeometry(0.085, 0.09, 0.03, 3, 0.012), handM); palm.position.set(0.006, -0.06, -0.022); bigPhone.add(palm);
  const thumb = capsule(0.011, 0.045, handM); thumb.position.set(-0.042, -0.035, -0.004); thumb.rotation.z = -0.5; bigPhone.add(thumb);
  for (let i = 0; i < 3; i++) { const f = capsule(0.0095, 0.05, handM); f.position.set(0.043, -0.04 + i * 0.024, -0.008); f.rotation.z = 1.35; bigPhone.add(f); }
  const wrist = capsule(0.028, 0.08, handM); wrist.position.set(0.012, -0.13, -0.03); bigPhone.add(wrist);
  const sleeve = capsule(0.036, 0.12, new THREE.MeshStandardMaterial({ color: 0x2f6fde, roughness: 0.8 })); sleeve.position.set(0.016, -0.22, -0.035); bigPhone.add(sleeve);
}
const cardTex = ctex(856, 540, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1E5AA8'); gr.addColorStop(1, '#0E7490'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * 0.85, h * 0.2, 120 + i * 70, 0, Math.PI * 2); g.lineWidth = 18; g.strokeStyle = 'rgba(255,255,255,.06)'; g.stroke(); }
  g.fillStyle = '#fff'; g.font = `800 70px ${FONT}`; g.fillText('METRO', 56, 120); g.font = `600 44px ${FONT}`; g.fillText('Smart Card', 56, 180);
  g.font = `700 40px ${FONT}`; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('•••• 4821', 56, h - 60); g.font = `700 50px ${FONT}`; g.fillText(')))', w - 140, h - 60); });
const bigCard = new THREE.Group(); scene.add(bigCard);
{ const cm = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.35, metalness: 0.1, transparent: true, opacity: 1 });
  const c = new THREE.Mesh(new RoundedBoxGeometry(0.0856, 0.054, 0.0012, 2, 0.0006), cm); bigCard.add(c); bigCard.userData.mat = cm;
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.01, 0.0016), new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.9, roughness: 0.25, emissive: 0x000000 })); chip.position.set(-0.025, 0.002, 0); bigCard.add(chip);
  const coilPts = []; for (let k = 0; k < 4; k++) { const ix = 0.038 - k * 0.003, iy = 0.022 - k * 0.003; coilPts.push(V3(-ix, -iy, 0), V3(ix, -iy, 0), V3(ix, iy, 0), V3(-ix, iy, 0), V3(-ix, -iy + 0.003, 0)); }
  const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts, false, 'catmullrom', 0.02), 300, 0.00045, 4), new THREE.MeshBasicMaterial({ color: 0xffb020, toneMapped: false, transparent: true, opacity: 0 }));
  bigCard.add(coil); bigCard.userData.coil = coil; bigCard.userData.chip = chip;
  const handM = new THREE.MeshStandardMaterial({ color: 0xc58a5c, roughness: 0.6 });
  const th = capsule(0.008, 0.03, handM); th.position.set(0.03, -0.024, 0.004); th.rotation.z = 1.2; bigCard.add(th);
  const fing = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.03, 0.02, 2, 0.008), handM); fing.position.set(0.045, -0.03, -0.01); bigCard.add(fing);
}
const rings = Array.from({ length: 5 }, () => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.0025, 8, 64), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, toneMapped: false, transparent: true, opacity: 0 })); scene.add(r); return r; });
const sparks = Array.from({ length: 24 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe14d, toneMapped: false, transparent: true, opacity: 0 })); scene.add(m); return m; });
// server rack (Metro System)
const server = new THREE.Group(); scene.add(server); const serverLeds = [];
{ const b = new THREE.Mesh(new RoundedBoxGeometry(0.7, 1.3, 0.55, 3, 0.04), new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.6, roughness: 0.35 })); b.castShadow = true; server.add(b);
  for (let r = 0; r < 6; r++) { const u = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.01), new THREE.MeshStandardMaterial({ color: 0x2a3344, metalness: 0.5, roughness: 0.4 })); u.position.set(0, -0.5 + r * 0.2, 0.28); server.add(u);
    for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.012, 10), new THREE.MeshBasicMaterial({ color: 0x34e07a, toneMapped: false })); l.position.set(0.18 + k * 0.035, -0.5 + r * 0.2, 0.286); server.add(l); serverLeds.push(l); } } }
const link = { mesh: null, curve: null, dot: new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe14d, toneMapped: false })) }; scene.add(link.dot);
function setLink(a, b) { const mid = a.clone().lerp(b, 0.5); mid.y += 0.8; link.curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  if (link.mesh) scene.remove(link.mesh); link.mesh = new THREE.Mesh(new THREE.TubeGeometry(link.curve, 50, 0.012, 6), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, toneMapped: false, transparent: true, opacity: 0.7 })); scene.add(link.mesh); }
// map (area x=-100)
const MAPX = -100, map = new THREE.Group(); map.position.set(MAPX, 0, 0); scene.add(map);
const stations = []; { const base = new THREE.Mesh(new RoundedBoxGeometry(6, 0.15, 9, 3, 0.06), new THREE.MeshStandardMaterial({ color: 0x0d1424, roughness: 0.4, metalness: 0.3 })); base.receiveShadow = true; map.add(base);
  const grid = new THREE.GridHelper(8.8, 22, 0x1e3a5f, 0x15263f); grid.position.y = 0.08; grid.scale.x = 0.68; map.add(grid);
  const pts = []; for (let i = 0; i < 9; i++) { const u = i / 8; pts.push(V3(-2.0 + 4.0 * u + Math.sin(u * 5) * 0.35, 0.2, 3.4 - 6.8 * u)); }
  const curve = new THREE.CatmullRomCurve3(pts); map.userData.curve = curve;
  map.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.06, 10), new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.6, roughness: 0.3 })));
  pts.forEach((p, i) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(i === 0 || i === 8 ? 0.2 : 0.12, i === 0 || i === 8 ? 0.2 : 0.12, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 })); s.position.copy(p); map.add(s); stations.push(s); });
  const mini = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.35, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0x6b5a00 })); mini.rotation.z = Math.PI / 2; map.add(mini); map.userData.mini = mini;
  const trail = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.085, 10), new THREE.MeshBasicMaterial({ color: 0xffe14d, toneMapped: false, transparent: true, opacity: 0.85 })); trail.geometry.setDrawRange(0, 0); map.add(trail); map.userData.trail = trail;
}

// ------------------------------------------------------------ HTML overlays
const $ = s => document.querySelector(s);
const labelsEl = $('#labels'), hud = $('#hud');
const LBL = {};
function lab(id, html, cls = '') { const e = document.createElement('div'); e.className = 'lab ' + cls; e.innerHTML = html; labelsEl.appendChild(e); LBL[id] = { e, w: 0 }; return e; }
const tmpV = new THREE.Vector3();
function showLab(id, pos, a, b, t, dy = 0) {
  const L = LBL[id]; const vis = P(t, a, 0.18) * (1 - P(t, b, 0.18));
  if (vis <= 0.001) { L.e.style.visibility = 'hidden'; return; }
  tmpV.copy(pos).project(camera); const x = (tmpV.x * 0.5 + 0.5) * 1080, y = (-tmpV.y * 0.5 + 0.5) * 1920 + dy;
  if (!L.w) L.w = L.e.offsetWidth; const s = lerp(0.6, 1, E.back(P(t, a, 0.35)));
  L.e.style.visibility = tmpV.z < 1 ? 'visible' : 'hidden'; L.e.style.opacity = vis;
  L.e.style.transform = `translate(${(x - L.w / 2).toFixed(1)}px, ${(y - L.e.offsetHeight).toFixed(1)}px) scale(${s.toFixed(3)})`;
}
// fixed-position overlay element (screen coords)
function fixedEl(html, cls, x, y) { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; e.style.left = x + 'px'; e.style.top = y + 'px'; hud.appendChild(e); return e; }
function showFixed(e, t, a, b, dy = 30) { const vis = P(t, a, 0.2) * (1 - P(t, b, 0.2)); e.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; e.style.opacity = vis;
  e.style.transform = `translateY(${((1 - E.out(P(t, a, 0.35))) * dy).toFixed(1)}px) scale(${lerp(0.85, 1, E.back(P(t, a, 0.35))).toFixed(3)})`; }

// question stickers
const QDEF = [['q1', '1', 'QR Ticket లో ఏముంటుంది?'], ['q2', '2', 'Scan చేస్తే ఏమవుతుంది?'], ['q3', '3', 'Smart Card ఎలా పనిచేస్తుంది?'], ['q4', '4', 'Mobile QR ఎలా Valid అవుతుంది?'],
  ['q5', '5', 'Fare ఎలా లెక్కిస్తారు?'], ['q6', '6', 'Red Light ఎందుకు వస్తుంది?'], ['q7', '7', 'Gate ఎలా Open, Close అవుతుంది?'], ['q14', '8', 'ఒక్కరు దాటారని ఎలా తెలుస్తుంది?'],
  ['q15', '9', 'ఒకే Ticket తో ఇద్దరు వెళ్తే?'], ['q16', '10', 'Exit లో మళ్ళీ Scan ఎందుకు?']];
const chips = QDEF.map(([name, n, txt], i) => { const w = document.createElement('div'); w.className = 'chipw'; w.innerHTML = `<div class="chip"><span class="n">${n}</span><span class="t">${txt}</span></div>`; hud.appendChild(w);
  const nx = QDEF[i + 1] ? S[QDEF[i + 1][0]] : S.outro; return { e: w.firstChild, wrap: w, a: S[name] - 0.05, b: nx - 0.2 }; });
function renderChips(t) { chips.forEach(c => { const i = E.back(P(t, c.a, 0.45)), o = P(t, c.b, 0.2); const vis = P(t, c.a, 0.15) * (1 - o);
  c.wrap.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; c.e.style.opacity = vis; c.e.style.transform = `translateY(${((1 - i) * -40).toFixed(1)}px) rotate(${(-1.5 + (1 - i) * 6).toFixed(2)}deg) scale(${lerp(0.75, 1, i).toFixed(3)})`; }); }
QDEF.forEach(([name]) => sfx(S[name] - 0.08, 'whoosh', 0.5));

// captions (creator style, hard cut between lines)
const caps = $('#caps');
const EMPH = { 43: '#FF5A6E', 71: '#7CF29A', 94: '#7CF29A', 95: '#7CF29A', 118: '#7CF29A', 139: '#FF5A6E', 140: '#FF5A6E', 198: '#7CF29A', 210: '#FF5A6E', 211: '#FF5A6E', 218: '#7CF29A' };
const chunks = []; { let cur = []; words.forEach((w, i) => { cur.push(i); const txt = cur.map(j => words[j].text).join(' '); const nx = words[i + 1];
  if (w.end || !nx || nx.scene !== w.scene || cur.length >= 4 || txt.length >= 18 || (/,$/.test(w.text) && cur.length >= 2)) { chunks.push(cur); cur = []; } }); }
const capEls = chunks.map((idx, ci) => { const e = document.createElement('div'); e.className = 'cap'; e.innerHTML = idx.map(i => `<span>${words[i].text}</span>`).join(''); caps.appendChild(e);
  const a = W[idx[0]] - 0.1, nextA = chunks[ci + 1] ? W[chunks[ci + 1][0]] - 0.1 : END, lastEnd = WE[idx[idx.length - 1]];
  const b = Math.min(nextA, nextA - lastEnd > 0.6 ? lastEnd + 0.4 : nextA); return { e, idx, spans: [...e.querySelectorAll('span')], a, b, cut: nextA - b < 0.15 }; });
function renderCaps(t) { capEls.forEach(c => {
  if (t < c.a - 0.01 || t > c.b + 0.12 || (c.cut && t >= c.b)) { c.e.style.visibility = 'hidden'; return; }
  const w = c.w || (c.w = c.e.offsetWidth), fit = Math.min(1, 1000 / w), i = E.back(P(t, c.a, 0.2)), o = c.cut ? 0 : P(t, c.b, 0.1);
  c.e.style.visibility = 'visible'; c.e.style.opacity = P(t, c.a, 0.06) * (1 - o);
  c.e.style.transform = `translate(${-w / 2}px, ${(26 + (1 - i) * 22).toFixed(1)}px) scale(${(lerp(0.86, 1, i) * fit).toFixed(3)})`;
  c.spans.forEach((s, k) => { const wi = c.idx[k], active = t >= W[wi] - 0.03 && t < (W[wi + 1] ?? 1e9) - 0.03 && t < WE[wi] + 0.45, pop = E.out(P(t, W[wi] - 0.03, 0.12)) * (active ? 1 : 0);
    s.style.color = active ? '#FFE14D' : (EMPH[wi] || '#fff'); s.style.opacity = t >= W[wi] - 0.03 ? 1 : 0.6; s.style.transform = `scale(${(1 + 0.07 * pop).toFixed(3)}) translateY(${(-4 * pop).toFixed(1)}px)`; }); }); }

// grain
const grainCv = $('#grain'), gctx = grainCv.getContext('2d'); const GRAIN = []; { const R = rng(99); for (let k = 0; k < 6; k++) { const im = gctx.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() + R() + R() - 1.5) * 110; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } GRAIN.push(im); } }

// ------------------------------------------------------------ LABELS (content)
lab('d_no', 'Ticket No <span class="s">HM-48213</span>'); lab('d_from', 'From <span class="s">Ameerpet</span>', 'c'); lab('d_to', 'To <span class="s">HITEC City</span>', 'c');
lab('d_fare', 'Fare <span class="s">Paid ✓</span>'); lab('d_time', 'Date & Time <span class="s">16 Nov • 09:42</span>');
lab('d_enc', '🔒 Encrypted', 'y'); lab('d_fake', 'Fake Ticket ✗', 'r');
lab('s_read', 'QR Read ✓', 'c'); lab('s_sys', 'Metro System', 'y'); lab('s_c1', 'Genuine ✓', 'g'); lab('s_c2', 'This Station ✓', 'g'); lab('s_c3', 'Not Used ✓', 'g'); lab('s_entry', 'Entry Recorded ✓ <span class="s">Ameerpet • 09:42</span>', 'g');
lab('c_chip', 'Chip', 'y'); lab('c_ant', 'Antenna', 'y'); lab('c_wave', 'Radio Waves', 'c'); lab('c_pow', 'Power ⚡ <span class="s">no battery!</span>', 'y'); lab('c_data', 'Data ✓', 'g'); lab('c_cl', 'Contactless', 'c');
lab('m_pay', 'Payment ✓', 'g'); lab('m_srv', 'Server', 'y'); lab('m_act', 'Ticket Activated ✓', 'g'); lab('m_qr', 'Unique QR', 'c'); lab('m_route', 'Route <span class="s">Ameerpet → HITEC City</span>'); lab('m_day', 'Valid <span class="s">Today only</span>', 'y');
lab('f_a', 'Ameerpet', 'c'); lab('f_b', 'HITEC City', 'c'); lab('f_km', '≈ 9 km', 'y');
lab('r_used', 'Already Used', 'r'); lab('r_exp', 'Expired', 'r'); lab('r_bal', 'Low Balance', 'r'); lab('r_st', 'Wrong Station', 'r');
lab('g_ctl', 'Controller', 'y'); lab('g_mot', 'Motor', 'y'); lab('g_sig', 'Signal ⚡', 'c');
lab('i_ir', 'Infrared Sensors', 'r'); lab('i_one', '1 Person ✓', 'g');
lab('t_alarm', '🚨 Tailgating!', 'r');
lab('e_exit', 'Exit ✓ <span class="s">HITEC City</span>', 'g'); lab('e_trip', 'Journey <span class="s">Ameerpet → HITEC City ✓</span>'); lab('e_fare', 'Fare Deducted ✓', 'y'); lab('e_closed', 'QR Closed', 'r');
const fareTab = fixedEl(`<div style="font-weight:800;font-size:40px;margin-bottom:10px">Fare Table</div><div class="ftab">${['0–2 km', '2–4 km', '4–6 km', '6–8 km', '8–10 km', '10–14 km', '14–18 km', '18–22 km', '22–26 km', '26+ km'].map((r, i) => `<div class="${i === 4 ? 'row4' : ''}"><span>${r}</span><span>Slab ${i + 1}</span></div>`).join('')}</div>`, 'panel', 600, 330);
const row4 = fareTab.querySelector('.row4');
const pattern = fixedEl(`<div style="font-weight:800;font-size:36px;margin-bottom:12px">Beam Pattern</div><div style="display:flex;gap:12px">${Array.from({ length: 6 }, (_, k) => `<i style="display:block;width:70px;height:70px;border-radius:14px;background:#3a0d0d;border:3px solid #ff4d4d"></i>`).join('')}</div>`, 'panel', 220, 1060);
const patCells = [...pattern.querySelectorAll('i')];
const logo = document.createElement('img'); logo.id = 'logo'; logo.src = '../../beyond-the-screen-logo/beyond-the-screen-icon.png'; hud.appendChild(logo);
const follow = fixedEl('+ Follow', 'follow', 0, 0); follow.style.left = '260px'; follow.style.top = '1040px';

// ------------------------------------------------------------ choreography helpers
const LANE = 1, LX = LANE_X[LANE];
function flapOpenAt(t, open, close) { return E.io(P(t, open, 0.35)) * (1 - E.io(P(t, close, 0.4))); }
function camLook(pos, look, fov = 50, roll = 0) { camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look); camera.rotateZ(roll); camera.updateMatrixWorld(true); }
function handheld(t, k = 1) { return V3((Math.sin(t * 0.9) * 0.012 + Math.sin(t * 2.3 + 1) * 0.006) * k, (Math.sin(t * 0.7 + 2) * 0.01 + Math.sin(t * 1.9) * 0.005) * k, 0); }
function npcFlow(t, enabled) {
  npcs.forEach((n, i) => { if (!enabled) { n.p.visible = false; return; } n.p.visible = true;
    const cyc = 9, u = ((t + n.off) % cyc) / cyc, lx = LANE_X[n.lane], d = n.dir;
    const zA = 7 * d, zB = -7 * d; const z = lerp(zA, zB, u), x = Math.abs(z) < 1.6 ? lx : lerp(n.x0, lx, ss(clamp(1 - (Math.abs(z) - 1.6) / 5)));
    n.p.position.set(x, 0, z); n.p.rotation.y = d > 0 ? Math.PI : 0; pose(n.p, { phase: t * 5.2 + i, walk: 1 }); });
}
function resetWorld() {
  gates.flaps.forEach((_, li) => setFlaps(li, 0)); GATE_X.forEach((_, gi) => { setLed(gi, 0, 'idle'); setLed(gi, 1, 'idle'); setScanner(gi, 0, 0x9fd3ff, 0); setScanner(gi, 1, 0x9fd3ff, 0); });
  gates.beams.forEach(bs => bs.forEach(b => (b.material.opacity = 0))); gates.emitters.forEach(es => es.forEach(e => e.material.color.set(0x330808)));
  gates.internals.g.visible = false; gates.cabMats.forEach(m => { m.transparent = false; m.opacity = 1; m.depthWrite = true; });
  [hero, card, tail, exitP, ...platPeople].forEach(p => (p.visible = false)); bigPhone.visible = false; bigCard.visible = false; server.visible = false; link.dot.visible = false; if (link.mesh) link.mesh.visible = false;
  rings.forEach(r => (r.material.opacity = 0)); sparks.forEach(s => (s.material.opacity = 0));
  scene.background = new THREE.Color(0x1b2030); scene.fog = new THREE.Fog(0x1b2030, 14, 40);
  sun.position.set(4, 12, 8); sun.target.position.set(0, 0, 0); sun.color.set(0xfff1dc); sun.intensity = 1.7; hemi.intensity = 0.6;
}
// ------------------------------------------------------------ SHOTS
const Wi = i => W[i];
const SH = {};
SH.intro = t => {
  if (t < 3.1) { // elevated platform, train arriving
    scene.background = skyTex; scene.fog = new THREE.Fog(0xf2c99a, 40, 160); sun.position.set(PX - 30, 25, 20); sun.target.position.set(PX, 0, 0); sun.color.set(0xffe2b8); sun.intensity = 2.6;
    const u = E.out(P(t, 0, 3.0)); trainG.position.x = lerp(80, -4, u);
    platPeople.forEach((p, i) => { p.visible = true; p.position.set(PX - 6 + i * 3.4, 0, 0.6 + (i % 2) * 1.2); p.rotation.y = Math.PI; pose(p, { tilt: Math.sin(t + i) * 0.05 }); });
    camLook(V3(PX - 12 + t * 0.6, 1.5, 2.6).add(handheld(t)), V3(PX + 4, 1.4, -3.5), 52);
    if (t > 2.4) { const k = P(t, 2.6, 0.5); renderer.toneMappingExposure = 0.85 + k * 1.5; }
  } else {
    npcFlow(t, true); hero.visible = true;
    walkKeys(hero, t, [[3.1, LX, 3.4], [3.75, LX, 0.95], [4.4, LX, 0.95], [5.6, LX, -2.2], [8.4, LX, -2.2]], { raise: pulse(t, 3.7, 0.75) });
    const sc = pulse(t, 3.85, 0.6); setScanner(2, 0, 0x34e07a, sc); if (t > 4.0) setLed(2, 0, 'go'); setFlaps(LANE, flapOpenAt(t, 4.15, 5.2));
    const u = E.io(P(t, 3.1, 5.2));
    camLook(V3(lerp(2.6, 0.6, u), lerp(2.2, 1.35, u), lerp(6.5, 2.2, u)).add(handheld(t)), V3(LX + 0.2, lerp(1.0, 0.9, u), lerp(0, 0.2, u)), 48);
  }
};
SH.q1 = (t, a, b) => { // phone close-up + data labels
  npcFlow(t, true); bigPhone.visible = true; const scr = bigPhone.userData.scr;
  scr.material.map = t > Wi(36) - 0.1 && t < Wi(43) + 0.4 ? phoneTexes.scramble : phoneTexes.qr;
  bigPhone.position.set(-5.4, 1.3, 2.6); bigPhone.rotation.set(-0.12 + Math.sin(t * 0.8) * 0.02, -0.25 + Math.sin(t * 0.6) * 0.03, 0.05);
  const u = E.io(P(t, a, 1.2)), back = E.io(P(t, Wi(23) - 0.45, 0.7)); camLook(V3(-5.4 - 0.05 + 0.02 * u, 1.31, 2.6 + lerp(lerp(0.5, 0.34, u), 0.64, back)).add(handheld(t, 0.08)), V3(-5.4 - 0.005, 1.3, 2.6), 46);
  const ph = bigPhone.position, enc = t > Wi(36);
  const items = [['d_no', 23, -0.078, 0.07], ['d_from', 25, 0.078, 0.07], ['d_to', 27, -0.078, 0.0], ['d_fare', 29, 0.078, 0.0], ['d_time', 30, 0.0, -0.075]];
  items.forEach(([id, wi, dx, dy]) => { const p = V3(ph.x + dx, ph.y + dy, ph.z + 0.05); showLab(id, p, Wi(wi), enc ? Wi(36) + 0.4 : b, t); });
  showLab('d_enc', V3(ph.x, ph.y + 0.12, ph.z + 0.05), Wi(36) + 0.1, b, t); showLab('d_fake', V3(ph.x, ph.y - 0.115, ph.z + 0.05), Wi(40), b, t);
};
SH.q2 = (t, a, b) => { // scan at gate -> server checks -> entry
  npcFlow(t, true); hero.visible = true; server.visible = true; server.position.set(LX + 1.2, 2.9, -1.6); server.rotation.y = -0.35;
  const scanT = Wi(46) - 0.1, openT = Wi(68) + 0.2;
  walkKeys(hero, t, [[a - 1, LX, 1.25], [openT, LX, 1.25], [openT + 1.6, LX, -2.0], [b + 1, LX, -2.0]], { raise: P(t, scanT - 0.4, 0.4) * (1 - P(t, Wi(57), 0.4)), lookDown: 0.2 });
  const sc = clamp(P(t, scanT, 0.2) * (1 - P(t, Wi(57), 0.4))); setScanner(1, 0, 0x7dd3fc, sc); setScanner(2, 0, 0x7dd3fc, sc);
  const ok = t > Wi(68); setLed(2, 0, ok ? 'go' : 'idle'); if (ok) setScanner(2, 0, 0x34e07a, 1 - P(t, Wi(68) + 0.8, 0.5)); setFlaps(LANE, flapOpenAt(t, openT, openT + 2.2));
  const scanPos = V3(0, 1.08, 0.5), srv = server.position.clone().add(V3(0, 0, 0.3));
  if (!link.curve || link.curve.v0.distanceTo(scanPos) > 0.01 || link.curve.v2.distanceTo(srv) > 0.01) setLink(scanPos, srv);
  const lk = t > Wi(53) - 0.2 && t < Wi(68) + 0.5; link.mesh.visible = lk; link.dot.visible = lk;
  const u = ((t - Wi(53)) / 1.1) % 1; link.dot.position.copy(link.curve.getPoint(t > Wi(64) ? 1 - Math.abs(u) : Math.abs(u)));
  serverLeds.forEach((l, i) => l.material.color.set(Math.sin(t * 9 + i * 1.7) > 0.2 ? 0x34e07a : 0x0b3a1f));
  const cu = E.io(P(t, Wi(53) - 0.4, 1.2)), cd = E.io(P(t, Wi(66), 1.2));
  const pos = V3(lerp(lerp(1.3, 2.2, cu), 1.6, cd), lerp(lerp(1.45, 2.4, cu), 1.6, cd), lerp(lerp(2.6, 4.4, cu), 3.4, cd)).add(handheld(t, 0.6));
  camLook(pos, V3(lerp(lerp(LX + 0.3, LX + 0.8, cu), LX, cd), lerp(lerp(1.05, 2.0, cu), 1.0, cd), lerp(0.5, -0.5, cu * (1 - cd))), 46);
  showLab('s_read', V3(0, 1.3, 0.5), Wi(48), Wi(53), t); showLab('s_sys', srv.clone().add(V3(0, 0.85, 0)), Wi(53) - 0.1, b, t);
  showLab('s_c1', srv.clone().add(V3(-0.95, 0.35, 0)), Wi(59), b, t); showLab('s_c2', srv.clone().add(V3(-0.95, -0.05, 0)), Wi(60), b, t); showLab('s_c3', srv.clone().add(V3(-0.95, -0.45, 0)), Wi(63), b, t);
  showLab('s_entry', V3(LX, 1.75, 0), Wi(68), b, t);
};
SH.q3 = (t, a, b) => { // smart card x-ray + radio waves
  npcFlow(t, false); bigCard.visible = true; const rd = V3(1.1, 1.06, -0.5); // exit-end reader on cabinet x=1.1
  const approach = E.io(P(t, Wi(80) - 0.2, 0.9));
  const hold = V3(1.1, 1.06 + lerp(0.16, 0.05, approach), -0.5 - lerp(0.12, 0.0, approach));
  bigCard.position.copy(hold); bigCard.rotation.set(-Math.PI / 2 + lerp(0.5, 0.15, approach) + Math.sin(t * 1.3) * 0.02, 0.2, 0);
  const xr = P(t, Wi(77) - 0.2, 0.4); bigCard.userData.mat.opacity = 1 - 0.6 * xr;
  const pw = P(t, Wi(88), 0.4); bigCard.userData.coil.material.opacity = Math.max(xr * 0.35 * P(t, Wi(78) - 0.1, 0.3), pw);
  bigCard.userData.chip.material.emissive.setRGB(pw * 0.9, pw * 0.6, 0);
  const waves = t > Wi(83) - 0.1; rings.forEach((r, i) => { const u = ((t - Wi(83)) * 0.9 + i / rings.length) % 1;
    r.position.copy(rd).add(V3(0, 0.01 + u * 0.12, 0)); r.rotation.x = Math.PI / 2; r.scale.setScalar(0.6 + u * 1.6); r.material.opacity = waves ? (1 - u) * 0.8 : 0; });
  const dat = t > Wi(91) - 0.1 && t < Wi(96); sparks.forEach((s, i) => { const u = ((t * 1.6 + i / sparks.length) % 1); s.position.copy(bigCard.position).lerp(rd, u); s.position.x += Math.sin(i * 2.3) * 0.01; s.material.opacity = dat ? 1 - u * 0.5 : 0; });
  setScanner(3, 1, t > Wi(91) ? 0x34e07a : 0x7dd3fc, waves ? 0.6 + 0.4 * Math.sin(t * 10) : 0); if (t > Wi(92)) setLed(3, 1, 'go');
  const cu = E.io(P(t, a, 2.0));
  camLook(V3(1.1 + lerp(0.32, 0.24, cu), 1.06 + lerp(0.38, 0.3, cu), -0.5 - lerp(0.42, 0.32, cu)).add(handheld(t, 0.05)), V3(1.1, 1.1, -0.5), 42);
  const cp = bigCard.position; showLab('c_chip', cp.clone().add(V3(-0.06, 0.06, 0)), Wi(77), Wi(83), t); showLab('c_ant', cp.clone().add(V3(0.07, 0.06, 0)), Wi(78), Wi(83), t);
  showLab('c_wave', rd.clone().add(V3(-0.1, 0.13, 0)), Wi(83), Wi(91), t); showLab('c_pow', cp.clone().add(V3(0.04, 0.1, 0)), Wi(88), Wi(91) + 0.3, t);
  showLab('c_data', rd.clone().add(V3(0.09, 0.1, 0)), Wi(91), b, t); showLab('c_cl', cp.clone().add(V3(-0.05, 0.16, 0)), Wi(94), b, t);
};
SH.q4 = (t, a, b) => { // payment -> server -> unique QR
  npcFlow(t, true); bigPhone.visible = true; server.visible = true; const scr = bigPhone.userData.scr;
  const qrIn = Wi(108) + 0.4; scr.material.map = t < Wi(99) + 0.6 ? phoneTexes.pay : t < qrIn ? phoneTexes.paid : phoneTexes.qr;
  bigPhone.position.set(5.4, 1.3, 3.2); bigPhone.rotation.set(-0.1, 0.15 + Math.sin(t * 0.6) * 0.03, -0.04);
  server.position.set(6.1, 1.9, 1.6); server.rotation.y = -0.3; serverLeds.forEach((l, i) => l.material.color.set(Math.sin(t * 9 + i * 1.7) > 0.2 ? 0x34e07a : 0x0b3a1f));
  const from = bigPhone.position.clone().add(V3(0, 0.05, 0)), to = server.position.clone().add(V3(0, 0, 0.25));
  if (!link.curve || link.curve.v0.distanceTo(from) > 0.01 || link.curve.v2.distanceTo(to) > 0.01) setLink(from, to);
  const lk = t > Wi(101) - 0.3 && t < qrIn + 0.2; link.mesh.visible = lk; link.dot.visible = lk;
  const up = P(t, Wi(101) - 0.3, 0.9), down = P(t, Wi(108) - 0.3, 0.7); link.dot.position.copy(link.curve.getPoint(t < Wi(108) - 0.3 ? up : 1 - down));
  const cu = E.io(P(t, Wi(101) - 0.5, 1.0)), cd = E.io(P(t, qrIn, 0.9));
  const ph0 = bigPhone.position, mid = ph0.clone().lerp(server.position, 0.5), near = ph0.clone().add(V3(-0.01, 0.0, 0.6)), far = ph0.clone().add(V3(-1.1, 0.35, 1.9));
  camLook(near.clone().lerp(far, cu * (1 - cd)).add(handheld(t, 0.15)), ph0.clone().lerp(mid, cu * (1 - cd)), 44);
  const ph = bigPhone.position; showLab('m_pay', ph.clone().add(V3(0, 0.12, 0.02)), Wi(99) + 0.5, Wi(101), t); showLab('m_srv', to.clone().add(V3(0, 0.8, 0)), Wi(101), qrIn, t);
  showLab('m_act', to.clone().add(V3(0, 0.55, 0)), Wi(105), qrIn, t); showLab('m_qr', ph.clone().add(V3(0, 0.12, 0.02)), qrIn, Wi(113), t);
  showLab('m_route', ph.clone().add(V3(0, 0.125, 0.02)), Wi(113), b, t); showLab('m_day', ph.clone().add(V3(0, -0.11, 0.02)), Wi(116), b, t);
};
SH.q5 = (t, a, b) => { // 3D route map + fare table
  scene.background = new THREE.Color(0x0a0f1d); scene.fog = new THREE.Fog(0x0a0f1d, 8, 30); sun.position.set(MAPX + 3, 10, 6); sun.target.position.set(MAPX, 0, 0);
  const curve = map.userData.curve, go = E.io(P(t, Wi(129) - 0.2, 1.6)); map.userData.mini.position.copy(curve.getPoint(go)).add(V3(0, 0.12, 0));
  const tan = curve.getTangent(go); map.userData.mini.rotation.set(0, Math.atan2(-tan.z, tan.x), Math.PI / 2);
  map.userData.trail.geometry.setDrawRange(0, Math.floor(go * 120 * 10) * 6);
  stations.forEach((s, i) => s.material.emissive.set(i === 0 && t > Wi(123) ? 0x0e7490 : i === 8 && t > Wi(126) ? 0x0e7490 : (go * 8 >= i && go > 0 ? 0x6b5a00 : 0x222222)));
  const u = E.io(P(t, a, 5.5)); camLook(V3(MAPX + lerp(-3.4, -2.2, u), lerp(9.5, 8.2, u), lerp(9.5, 8.0, u)).add(handheld(t, 2)), V3(MAPX + 0.2, 0, lerp(0.4, -0.6, u)), 50);
  showLab('f_a', map.localToWorld(curve.getPoint(0).clone()).add(V3(0, 0.35, 0)), Wi(123), b, t); showLab('f_b', map.localToWorld(curve.getPoint(1).clone()).add(V3(0, 0.35, 0)), Wi(126), b, t);
  showLab('f_km', map.localToWorld(curve.getPoint(0.5).clone()).add(V3(0.6, 0.4, 0)), Wi(130), b, t);
  showFixed(fareTab, t, Wi(132) - 0.1, b + 0.1); row4.className = t > Wi(135) - 0.1 ? 'hi' : '';
};
SH.q6 = (t, a, b) => { // red light
  npcFlow(t, true); tail.visible = true; const scanT = a + 0.55;
  walkKeys(tail, t, [[a - 1.2, LX, 3.0], [a + 0.3, LX, 1.2], [b + 1, LX, 1.2]], { raise: P(t, scanT - 0.3, 0.3) * (1 - P(t, Wi(141) + 0.4, 0.4)), tilt: 0.15 * P(t, Wi(142), 0.4) * Math.sin(t * 2.2), face: Math.PI });
  const red = t > scanT + 0.15; setLed(2, 0, red ? 'stop' : 'idle'); setLed(1, 0, red ? 'stop' : 'idle'); setScanner(2, 0, red ? 0xff3b3b : 0x7dd3fc, red ? 0.6 + 0.4 * Math.sin(t * 12) : 0); setFlaps(LANE, 0);
  if (red) { gates.flaps[LANE].forEach(f => f.userData.edge.material.color.setHSL(0, 1, 0.5 + 0.2 * Math.sin(t * 12))); }
  const u = E.io(P(t, a, 7)); camLook(V3(LX + lerp(1.9, 1.6, u), lerp(1.55, 1.7, u), lerp(2.3, 2.0, u)).add(handheld(t, 0.6)), V3(LX - 0.1, 1.05, 0.5), 48);
  showLab('r_used', V3(LX - 0.5, 1.62, 0.3), Wi(145) - 0.1, b, t); showLab('r_exp', V3(LX + 0.2, 1.62, 0.3), Wi(147) - 0.1, b, t);
  showLab('r_bal', V3(LX - 0.5, 1.4, 0.3), Wi(152) - 0.1, b, t); showLab('r_st', V3(LX + 0.2, 1.4, 0.3), Wi(155) - 0.1, b, t);
};
SH.q7 = (t, a, b) => { // x-ray: controller -> motor -> flaps
  npcFlow(t, false); hero.visible = true; const it = gates.internals; it.g.visible = true;
  const xr = P(t, a, 0.6); [1, 2].forEach(gi => { const m = gates.cabMats[gi]; m.transparent = true; m.opacity = 1 - 0.75 * xr; m.depthWrite = false; });
  const openT = Wi(165) - 0.1; setFlaps(LANE, flapOpenAt(t, openT, Wi(169)));
  it.motor.rotation.y = t > openT - 0.2 && t < openT + 0.4 || (t > Wi(169) - 0.2 && t < Wi(169) + 0.4) ? t * 40 : 0; it.gear.rotation.y = it.motor.rotation.y;
  it.pcb.material.emissive.set(t > Wi(159) && t < Wi(165) ? 0x1f8f4a : 0x05301a);
  const sigU = P(t, Wi(163) - 0.3, 0.7); link.dot.visible = sigU > 0 && sigU < 1; if (link.dot.visible) { link.dot.position.copy(it.path.getPoint(sigU)); link.dot.scale.setScalar(0.35); }
  setLed(2, 0, t > openT ? 'go' : 'idle'); setScanner(2, 0, 0x34e07a, P(t, a, 0.3) * (1 - P(t, Wi(160), 0.5)));
  walkKeys(hero, t, [[a - 1, LX, 1.1], [Wi(167) - 0.3, LX, 1.1], [Wi(169), LX, -1.6], [b + 2, LX, -1.6]], { face: Math.PI });
  const u = E.io(P(t, a, 6.5)); camLook(V3(lerp(0.85, 0.7, u), lerp(1.35, 1.2, u), lerp(1.6, 1.2, u)).add(handheld(t, 0.3)), V3(-0.1, 0.65, 0.15), 46);
  showLab('g_ctl', V3(0, 0.7, 0.42), Wi(159), b, t); showLab('g_mot', V3(0, 0.72, 0.02), Wi(161), b, t); showLab('g_sig', V3(0, 1.2, 0.55), Wi(163) - 0.2, Wi(165), t);
};
function beamsState(t, lane, walkers) { // walkers: list of z positions (and radius) of bodies in lane
  const bs = gates.beams[lane], es = gates.emitters[lane]; const st = [];
  bs.forEach((b, k) => { const blocked = walkers.some(z => Math.abs(z - b.position.z) < 0.2); st.push(blocked); b.material.opacity = blocked ? 0.12 : 0.9; b.material.color.set(blocked ? 0x661111 : 0xff2a2a);
    es[k * 2].material.color.set(0xff3030); es[k * 2 + 1].material.color.set(0xff3030); }); return st;
}
SH.q14 = (t, a, b) => { // infrared beams, top-down
  npcFlow(t, false); hero.visible = true; const on = t > Wi(179) - 0.2;
  const walkA = Wi(184) - 0.2, walkB = Wi(195) - 0.3; setFlaps(LANE, flapOpenAt(t, walkA - 0.3, walkB + 0.4));
  walkKeys(hero, t, [[a - 1, LX, 1.5], [walkA, LX, 1.5], [walkB, LX, -1.4], [b + 2, LX, -1.4]], { face: Math.PI });
  let st = [false, false, false, false, false, false]; if (on) st = beamsState(t, LANE, [hero.position.z]);
  const u = E.io(P(t, a, 2.6)); camLook(V3(LX + lerp(1.8, 1.25, u), lerp(2.0, 2.5, u), lerp(2.8, 1.5, u)).add(handheld(t, 0.3)), V3(LX, 0.55, -0.05), 50);
  patCells.forEach((c, k) => { c.style.background = st[k] ? '#ff4d4d' : '#3a0d0d'; c.style.boxShadow = st[k] ? '0 0 24px #ff4d4d' : 'none'; });
  showFixed(pattern, t, Wi(192) - 0.4, b - 0.05); showLab('i_ir', V3(LX + 0.1, 1.35, 0.2), Wi(179), Wi(190), t); showLab('i_one', V3(LX, 1.9, -1.2), Wi(195), b, t);
};
SH.q15 = (t, a, b) => { // tailgating
  npcFlow(t, false); hero.visible = true; tail.visible = true; const closeT = Wi(208) - 0.25;
  walkKeys(hero, t, [[a - 1, LX, 1.6], [a + 0.3, LX, 1.6], [a + 2.3, LX, -1.6], [b + 2, LX, -1.6]], { face: Math.PI });
  walkKeys(tail, t, [[a - 1, LX, 2.3], [a + 0.45, LX, 2.3], [closeT, LX, 0.18], [b + 2, LX, 0.18]], { face: Math.PI, tilt: 0.12 * P(t, Wi(210), 0.3) });
  setFlaps(LANE, flapOpenAt(t, a + 0.1, closeT)); const alarm = t > closeT; setLed(2, 0, alarm ? 'stop' : 'go'); setLed(1, 0, alarm ? 'stop' : 'go');
  beamsState(t, LANE, [hero.position.z, tail.position.z]);
  rings.forEach((r, i) => { const u = ((t - Wi(210)) * 0.8 + i / rings.length) % 1; r.position.set(LX, 1.2, 0); r.rotation.x = Math.PI / 2; r.scale.setScalar(4 + u * 14); r.material.color.set(0xff3b3b); r.material.opacity = t > Wi(210) - 0.1 ? (1 - u) * 0.7 : 0; });
  const u = E.io(P(t, a, 5)); camLook(V3(LX + lerp(1.9, 1.3, u), lerp(2.6, 2.2, u), lerp(3.2, 2.4, u)).add(handheld(t, 0.4 + (alarm ? 1.5 * pulse(t, closeT, 0.4) : 0))), V3(LX, 0.7, 0.3), 48);
  showLab('t_alarm', V3(LX, 1.9, 0.2), Wi(210) - 0.1, b, t);
};
SH.q16 = (t, a, b) => { // exit: card + used QR
  npcFlow(t, true); exitP.visible = true; hero.visible = true; bigPhone.visible = false;
  const scanT = Wi(214) - 0.1; // exit reader on cabinet x=-1.1 (right of lane 1 when walking +z)
  walkKeys(exitP, t, [[a - 1, LX, -2.6], [a + 0.6, LX, -1.25], [scanT + 1.3, LX, -1.25], [scanT + 3.3, LX, 2.4], [b + 2, LX, 2.4]], { raise: pulse(t, scanT - 0.35, 1.1), face: 0 });
  setScanner(1, 1, 0x34e07a, pulse(t, scanT, 0.9)); setLed(1, 1, t > scanT + 0.2 ? 'go' : 'idle'); setFlaps(LANE, flapOpenAt(t, scanT + 0.6, scanT + 3.4));
  walkKeys(hero, t, [[a - 1, LANE_X[2], -3.2], [b + 2, LANE_X[2], -3.2]], { face: 0 }); hero.visible = t > Wi(225) - 0.4;
  const showQR = t > Wi(225) - 0.3; if (showQR) { bigPhone.visible = true; bigPhone.userData.scr.material.map = t > Wi(229) ? phoneTexes.used : phoneTexes.qr; bigPhone.position.set(LANE_X[2], 1.25, -1.6); bigPhone.rotation.set(-0.15, Math.PI - 0.25, 0); }
  const u = E.io(P(t, a, 4.5)), q = E.io(P(t, Wi(225) - 0.4, 0.9));
  const pos = V3(lerp(lerp(-1.8, -1.3, u), LANE_X[2] - 0.08, q), lerp(1.55, 1.27, q), lerp(lerp(-3.2, -2.6, u), -1.9, q)).add(handheld(t, lerp(0.6, 0.06, q)));
  camLook(pos, V3(lerp(LX, LANE_X[2], q), lerp(1.0, 1.25, q), lerp(-0.6, -1.6, q)), lerp(48, 44, q));
  showLab('e_exit', V3(LX, 1.8, -0.6), scanT + 0.2, Wi(225) - 0.5, t); showLab('e_trip', V3(LX, 2.1, -0.6), Wi(217), Wi(225) - 0.5, t); showLab('e_fare', V3(LX, 1.5, -0.6), Wi(222) - 0.2, Wi(225) - 0.5, t);
  showLab('e_closed', V3(LANE_X[2], 1.37, -1.6), Wi(229), b, t);
};
SH.outro = (t, a, b) => {
  scene.background = skyTex; scene.fog = new THREE.Fog(0xf2c99a, 40, 160); sun.position.set(PX - 30, 25, 20); sun.target.position.set(PX, 0, 0); sun.color.set(0xffe2b8); sun.intensity = 2.6;
  const go = P(t, a, 4.5); trainG.position.x = -4 - 40 * go * go;
  const u = E.io(P(t, a, END - a)); camLook(V3(PX + lerp(-4, -10, u), lerp(1.8, 6, u), lerp(3.5, 12, u)).add(handheld(t)), V3(PX - 6, lerp(1.4, 2, u), -4), 52);
  showFixed(logo, t, Wi(235) - 0.3, END + 5, 60); showFixed(follow, t, Wi(239) - 0.2, END + 5, 60);
};
const ORDER = ['intro', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q14', 'q15', 'q16', 'outro'];
// sound cues
sfx(0.05, 'trainArrive', 1); sfx(2.95, 'whoosh', 0.6); sfx(3.95, 'beep', 0.9); sfx(4.15, 'flap', 0.8); sfx(5.2, 'flap', 0.5);
[23, 25, 27, 29, 30].forEach(i => sfx(Wi(i), 'pop', 0.45)); sfx(Wi(36), 'glitch', 0.4); sfx(Wi(40), 'buzz', 0.45);
sfx(Wi(46) - 0.05, 'beep', 0.9); sfx(Wi(53) - 0.2, 'data', 0.6); [59, 60, 63].forEach(i => sfx(Wi(i), 'check', 0.6)); sfx(Wi(68), 'success', 0.7); sfx(Wi(68) + 0.2, 'flap', 0.8);
sfx(Wi(77), 'pop', 0.4); sfx(Wi(78), 'pop', 0.4); sfx(Wi(83) - 0.1, 'scan', 0.6); sfx(Wi(88), 'shimmer', 0.6); sfx(Wi(91), 'data', 0.5); sfx(Wi(92), 'beep', 0.8);
sfx(Wi(99) + 0.5, 'ding', 0.7); sfx(Wi(101) - 0.3, 'whooshS', 0.5); sfx(Wi(105), 'check', 0.6); sfx(Wi(108) - 0.3, 'whooshS', 0.5); sfx(Wi(108) + 0.4, 'pop', 0.6);
sfx(Wi(123), 'pop', 0.4); sfx(Wi(126), 'pop', 0.4); sfx(Wi(129), 'trainMini', 0.6); sfx(Wi(132), 'whooshS', 0.4); sfx(Wi(135), 'check', 0.6);
sfx(S.q6 + 0.7, 'error', 0.9); [145, 147, 152, 155].forEach(i => sfx(Wi(i) - 0.1, 'popLow', 0.5));
sfx(Wi(163) - 0.3, 'data', 0.4); sfx(Wi(165) - 0.15, 'motor', 0.8); sfx(Wi(169) - 0.15, 'motor', 0.6);
sfx(Wi(179) - 0.2, 'shimmer', 0.4); sfx(Wi(184) - 0.5, 'flap', 0.6); sfx(Wi(195), 'check', 0.6);
sfx(S.q15 + 0.1, 'flap', 0.6); sfx(Wi(208) - 0.25, 'flapSlam', 1.0); sfx(Wi(210) - 0.05, 'alarm', 0.8);
sfx(Wi(214) - 0.05, 'beep', 0.9); sfx(Wi(214) + 0.5, 'flap', 0.7); sfx(Wi(222) - 0.2, 'coin', 0.6); sfx(Wi(229), 'stamp', 0.7);
sfx(S.outro + 0.1, 'trainDepart', 1); sfx(Wi(235) - 0.3, 'pop', 0.6); sfx(Wi(239), 'click', 0.8);
window.SFX = SFX;

// ------------------------------------------------------------ frame
window.render = function (t) {
  resetWorld(); renderer.toneMappingExposure = 0.85;
  let k = 0; for (let i = 0; i < ORDER.length; i++) if (t >= (i === 0 ? 0 : S[ORDER[i]] - 0.02)) k = i;
  const name = ORDER[k], a = k === 0 ? 0 : S[name], b = k + 1 < ORDER.length ? S[ORDER[k + 1]] : END;
  Object.values(LBL).forEach(L => (L.e.style.visibility = 'hidden')); [fareTab, pattern, logo, follow].forEach(e => (e.style.visibility = 'hidden'));
  SH[name](t, a, b);
  // quick white dip between shots (hides the cut like an editor's flash)
  const dip = Math.max(...ORDER.slice(1).map(n => pulse(t, S[n] - 0.09, 0.18)));
  renderer.toneMappingExposure *= 1 + dip * 1.2;
  renderer.render(scene, camera);
  renderChips(t); renderCaps(t);
  const f = Math.round(t * 30); gctx.putImageData(GRAIN[f % 6], 0, 0); grainCv.style.transform = `translate(${((f * 37) % 9) - 4}px, ${((f * 53) % 9) - 4}px)`;
};
window.setup = async function () {
  await Promise.all(['800 40px "Baloo Tammudu 2"', '700 40px "Baloo Tammudu 2"', '700 40px "Poppins"', '800 40px "Poppins"', '600 40px "Poppins"'].map(f => document.fonts.load(f, 'అఆ abc 0123')));
  await document.fonts.ready;
  // redraw canvas textures now that fonts are loaded
  scene.traverse(o => { const m = o.material; if (m && m.map && m.map.userData && m.map.userData.draw && m.map.userData.c) { const { c, g, draw } = m.map.userData; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); m.map.needsUpdate = true; } });
  Object.values(phoneTexes).forEach(tx => { const { c, g, draw } = tx.userData; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tx.needsUpdate = true; });
  [cardTex, skyTex].forEach(tx => { const { c, g, draw } = tx.userData; draw(g, c.width, c.height); tx.needsUpdate = true; });
  await new Promise(r => (logo.complete ? r() : (logo.onload = r)));
  window.render(0); return { duration: END, sfx: SFX };
};
window.__ready = true;
