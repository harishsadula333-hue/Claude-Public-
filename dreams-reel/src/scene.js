// "How do dreams happen?" — deterministic three.js reel. window.render(t) draws the frame at time t.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TL = window.TL, words = TL.words, W = words.map(w => w.t), WE = words.map(w => w.t + w.dur);
const S = {}; TL.scenes.forEach(s => (S[s.name] = s.t));
const END = Math.round((TL.voiceDur + 2.5) * 30) / 30; window.DURATION = END;
const Wi = i => W[i];

// ------------------------------------------------------------ utils
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
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 800);
const hemi = new THREE.HemisphereLight(0x8fa8ff, 0x1a1430, 0.6); scene.add(hemi);
const key = new THREE.DirectionalLight(0xbcd0ff, 1.6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 40 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; scene.add(key, key.target);
const warm = new THREE.PointLight(0xffb36b, 0, 6, 1.6); scene.add(warm);

function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g, draw }; return t; }
const FONT = "'Poppins', sans-serif", EMOJI = "'Noto Color Emoji', sans-serif";
const capsule = (r, l, mat) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 14), mat); m.castShadow = true; return m; };

// ------------------------------------------------------------ PEOPLE (same rig as the metro reel, with closed-eye option)
function makePerson(o) {
  const mats = [];
  const mk = (c, r = 0.7) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); mats.push(m); return m; };
  const skin = mk(o.skin, 0.6), shirt = mk(o.shirt, 0.75), pants = mk(o.pants, 0.8), hairM = mk(0x15110e), shoeM = mk(0x222222, 0.5);
  const root = new THREE.Group(), hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips);
  const torso = capsule(0.165, 0.36, shirt); torso.scale.z = 0.62; torso.position.y = 0.3; hips.add(torso);
  if (o.female) { const tunic = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.42, 20), shirt); tunic.position.y = -0.02; tunic.scale.z = 0.7; hips.add(tunic); }
  const neck = capsule(0.05, 0.06, skin); neck.position.y = 0.58; hips.add(neck);
  const head = new THREE.Group(); head.position.y = 0.72; hips.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24), skin); skull.scale.set(0.92, 1.05, 1); skull.castShadow = true; head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM); hair.position.set(0, 0.012, -0.01); hair.scale.set(0.95, 1.05, 1.02); head.add(hair);
  if (o.female) { const lh = capsule(0.085, 0.22, hairM); lh.position.set(0, -0.1, -0.07); head.add(lh); }
  const eyes = [];
  for (const s of [-1, 1]) {
    if (o.closed) { const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.017, 16, 12), skin); bulge.scale.set(1.2, 0.8, 0.6); bulge.position.set(s * 0.04, 0.012, 0.1); head.add(bulge); eyes.push(bulge);
      const lid = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0022, 6, 20, Math.PI), new THREE.MeshBasicMaterial({ color: 0x3a2418 })); lid.rotation.z = Math.PI; lid.position.set(s * 0.04, 0.012, 0.108); head.add(lid); }
    else { const e = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0x111111 })); e.position.set(s * 0.04, 0.01, 0.105); head.add(e); eyes.push(e); } }
  const limb = (side, isArm) => {
    const sh = new THREE.Group(); sh.position.set(side * (isArm ? 0.215 : 0.09), isArm ? 0.48 : -0.02, 0); hips.add(sh);
    const up = capsule(isArm ? 0.048 : 0.072, isArm ? 0.22 : 0.33, isArm ? shirt : pants); up.position.y = isArm ? -0.15 : -0.22; sh.add(up);
    const j = new THREE.Group(); j.position.y = isArm ? -0.3 : -0.44; sh.add(j);
    const lo = capsule(isArm ? 0.04 : 0.06, isArm ? 0.2 : 0.32, isArm ? skin : pants); lo.position.y = isArm ? -0.13 : -0.2; j.add(lo);
    let end; if (isArm) { end = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), skin); end.position.y = -0.27; j.add(end); }
    else { end = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.07, 0.24, 2, 0.03), shoeM); end.position.set(0, -0.42, 0.05); j.add(end); }
    return { sh, j, end, up, lo };
  };
  const L = { la: limb(-1, true), ra: limb(1, true), ll: limb(-1, false), rl: limb(1, false) };
  root.userData = { hips, head, L, eyes, mats, torso }; scene.add(root); return root;
}
function pose(p, { phase = 0, walk = 0, raise = 0, wave = 0, fly = 0, tilt = 0 } = {}) {
  const { hips, head, L } = p.userData, s = Math.sin(phase), c = Math.cos(phase);
  hips.position.y = 0.95 + Math.abs(c) * 0.03 * walk;
  L.ll.sh.rotation.x = lerp(-s * 0.6 * walk, 0.12, fly); L.rl.sh.rotation.x = lerp(s * 0.6 * walk, 0.25, fly);
  L.ll.j.rotation.x = lerp(Math.max(0, Math.sin(phase + 1.6)) * 0.9 * walk, 0.3, fly); L.rl.j.rotation.x = lerp(Math.max(0, Math.sin(phase + 1.6 + Math.PI)) * 0.9 * walk, 0.5, fly);
  L.la.sh.rotation.x = lerp(s * 0.5 * walk, -2.9, fly); L.la.j.rotation.x = lerp(-0.3 - 0.2 * walk, -0.1, fly); L.la.sh.rotation.z = lerp(-0.08, -0.25, fly);
  L.ra.sh.rotation.x = lerp(lerp(-s * 0.5 * walk, -2.6, raise), -2.9, fly); L.ra.j.rotation.x = lerp(lerp(-0.3, -0.3, raise), -0.1, fly);
  L.ra.sh.rotation.z = lerp(lerp(0.08, 0.35 + Math.sin(wave) * 0.35, raise), 0.25, fly);
  head.rotation.z = tilt; head.rotation.x = fly * -0.5;
}

// ------------------------------------------------------------ DREAM WORLD (x = -200)
const DX = -200, dream = new THREE.Group(); dream.position.x = DX; scene.add(dream);
const skyTex = ctex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b0730'); gr.addColorStop(0.5, '#3b1a6e'); gr.addColorStop(0.8, '#a2468f'); gr.addColorStop(1, '#f39a8b'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const stars = (() => { const R = rng(3), n = 2500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const th = R() * Math.PI * 2, ph = Math.acos(R() * 1.6 - 0.6), r = 180 + R() * 60; pos.set([Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: true, transparent: true, opacity: 0.9, fog: false })); })();
dream.add(stars);
function island(r, seed) { const R = rng(seed), g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, 0.35, 28), new THREE.MeshStandardMaterial({ color: 0x5fbf6a, roughness: 0.8 })); top.receiveShadow = true; top.castShadow = true; g.add(top);
  const rock = new THREE.Mesh(new THREE.ConeGeometry(r * 0.92, r * 1.6, 9), new THREE.MeshStandardMaterial({ color: 0x7a5a48, roughness: 0.95, flatShading: true })); rock.rotation.x = Math.PI; rock.position.y = -0.17 - r * 0.8; g.add(rock);
  const ts = Math.min(1, r / 2.2);
  for (let i = 0; i < Math.max(2, Math.round(r * 2.2)); i++) { const a = R() * 6.28, d = R() * r * 0.7, h = (0.6 + R() * 0.8) * ts;
    const tr = new THREE.Mesh(new THREE.ConeGeometry(0.28 * ts, h, 8), new THREE.MeshStandardMaterial({ color: 0x2f8f4e, roughness: 0.8 })); tr.position.set(Math.cos(a) * d, 0.18 + h / 2 + 0.2 * ts, Math.sin(a) * d); tr.castShadow = true; g.add(tr);
    const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * ts, 0.06 * ts, 0.25 * ts, 6), new THREE.MeshStandardMaterial({ color: 0x5b3a24 })); tk.position.set(tr.position.x, 0.18 + 0.12 * ts, tr.position.z); g.add(tk); }
  return g; }
function cloud(seed, s = 1) { const R = rng(seed), g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0xffeef8, roughness: 1, emissive: 0x3a2a55, emissiveIntensity: 0.4 });
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry((0.6 + R() * 0.6) * s, 20, 14), m); b.position.set((i - 3) * 0.55 * s, R() * 0.35 * s, (R() - 0.5) * 0.5 * s); g.add(b); } return g; }
const islands = [[0, -1, 0, 3.2, 1], [-7, 2.5, -9, 2.2, 2], [8, 1, -14, 2.8, 3], [-4, -3, -22, 3.5, 4], [10, 5, -30, 2, 5], [-12, 6, -36, 2.6, 6]].map(([x, y, z, r, s]) => { const g = island(r, s); g.position.set(x, y, z); dream.add(g); return g; });
const clouds = Array.from({ length: 12 }, (_, i) => { const R = rng(40 + i), c = cloud(60 + i, 0.8 + R() * 1.4); c.position.set((R() < 0.5 ? -1 : 1) * (7 + R() * 14), -5 + R() * 10, -10 - R() * 36); dream.add(c); return c; });
const flyer = makePerson({ skin: 0xb97a4f, shirt: 0x2f6fde, pants: 0x2b3446 });
const friend = makePerson({ skin: 0xc58a5c, shirt: 0xf59e0b, pants: 0x1f2937, female: true });

// ------------------------------------------------------------ BEDROOM (x = 0)
const room = new THREE.Group(); scene.add(room);
const nightWin = ctex(512, 768, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#071033'); gr.addColorStop(1, '#1d2b6b'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(9); g.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { g.globalAlpha = 0.3 + R() * 0.7; g.fillRect(R() * w, R() * h * 0.7, 2, 2); } g.globalAlpha = 1;
  g.fillStyle = '#0a0f22'; for (let i = 0; i < 9; i++) { const bw = 40 + R() * 60, bh = 80 + R() * 220; g.fillRect(i * 60 - 10, h - bh, bw, bh); g.fillStyle = '#ffd27a'; for (let k = 0; k < 6; k++) g.fillRect(i * 60 + R() * bw - 10, h - R() * bh, 5, 7); g.fillStyle = '#0a0f22'; } });
const moonTex = ctex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(0.35, 'rgba(255,245,215,1)'); gr.addColorStop(0.42, 'rgba(200,210,255,.35)'); gr.addColorStop(1, 'rgba(120,140,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const sleeper = makePerson({ skin: 0xb97a4f, shirt: 0x5b6bd6, pants: 0x2b3446, closed: true });
let blanket, moon;
{ const wood = ctex(512, 512, (g, w, h) => { g.fillStyle = '#6b4a33'; g.fillRect(0, 0, w, h); const R = rng(2); for (let y = 0; y < h; y += 64) { g.fillStyle = `rgba(0,0,0,${0.15 + R() * 0.1})`; g.fillRect(0, y, w, 3); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,220,180,${R() * 0.06})`; g.fillRect(R() * w, y + R() * 60, R() * 120, 2); } } });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; room.add(floor);
  const wallM = new THREE.MeshStandardMaterial({ color: 0x3a4a7a, roughness: 0.9 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallM); back.position.set(0, 2, -2.2); back.receiveShadow = true; room.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallM); side.position.set(-2.4, 2, 0); side.rotation.y = Math.PI / 2; side.receiveShadow = true; room.add(side);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({ map: nightWin, toneMapped: false })); win.position.set(0.9, 2.1, -2.19); room.add(win);
  const frameM = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 });
  for (const [w, h, x, y] of [[1.32, 0.06, 0.9, 2.93], [1.32, 0.06, 0.9, 1.27], [0.06, 1.7, 0.27, 2.1], [0.06, 1.7, 1.53, 2.1], [0.04, 1.6, 0.9, 2.1], [1.2, 0.04, 0.9, 2.1]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), frameM); f.position.set(x, y, -2.17); room.add(f); }
  moon = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, toneMapped: false, depthWrite: false })); moon.position.set(1.2, 2.6, -2.18); room.add(moon);
  // bed
  const bedM = new THREE.MeshStandardMaterial({ color: 0x5a3b28, roughness: 0.6 });
  const frame = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.35, 2.3, 3, 0.04), bedM); frame.position.set(-1.1, 0.18, -0.9); frame.castShadow = true; frame.receiveShadow = true; room.add(frame);
  const head = new THREE.Mesh(new RoundedBoxGeometry(1.55, 1.0, 0.12, 3, 0.04), bedM); head.position.set(-1.1, 0.55, -2.05); room.add(head);
  const matt = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.22, 2.15, 4, 0.08), new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.9 })); matt.position.set(-1.1, 0.45, -0.9); matt.receiveShadow = true; room.add(matt);
  const pillow = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.14, 0.38, 4, 0.06), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })); pillow.position.set(-1.1, 0.62, -1.72); room.add(pillow);
  blanket = new THREE.Mesh(new RoundedBoxGeometry(1.46, 0.2, 1.45, 4, 0.08), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.85 })); blanket.position.set(-1.1, 0.66, -0.45); blanket.castShadow = true; room.add(blanket);
  const stand = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.55, 0.45, 3, 0.03), bedM); stand.position.set(0.05, 0.28, -1.8); room.add(stand);
  const lampB = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0xd8c8a8 })); lampB.position.set(0.05, 0.7, -1.8); room.add(lampB);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0x6a4a20, side: THREE.DoubleSide })); shade.position.set(0.05, 0.93, -1.8); room.add(shade);
  const clockT = ctex(256, 128, (g, w, h) => { g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff4d4d'; g.font = `800 84px ${FONT}`; g.fillText('2:47', 30, 98); });
  const clk = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.11, 0.08, 2, 0.02), new THREE.MeshStandardMaterial({ color: 0x111111 })); clk.position.set(0.18, 0.61, -1.75); room.add(clk);
  const cf = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.09), new THREE.MeshBasicMaterial({ map: clockT, toneMapped: false })); cf.position.set(0.18, 0.61, -1.708); room.add(cf);
  sleeper.rotation.x = -Math.PI / 2; sleeper.position.set(-1.1, 0.68, -0.03); sleeper.userData.hips.position.y = 0.95;
  const rug = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshStandardMaterial({ color: 0x9b4d6a, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0.6, 0.004, 0.4); room.add(rug);
}
// x-ray spine + signals for the "lock" scene
const spineCurve = new THREE.CatmullRomCurve3([V3(-1.1, 0.68, -1.72), V3(-1.1, 0.64, -1.5), V3(-1.1, 0.61, -1.15), V3(-1.1, 0.6, -0.8)]);
const spine = new THREE.Mesh(new THREE.TubeGeometry(spineCurve, 40, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, toneMapped: false, transparent: true, opacity: 0 })); room.add(spine);
const pulses = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff5a6e, toneMapped: false, transparent: true, opacity: 0 })); room.add(m); return m; });
const stemGlow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffb020, toneMapped: false, transparent: true, opacity: 0 })); stemGlow.position.set(-1.1, 0.66, -1.78); room.add(stemGlow);
const zzz = Array.from({ length: 3 }, (_, i) => { const t = ctex(128, 128, (g) => { g.fillStyle = '#cfe0ff'; g.font = `800 ${90 - i * 18}px ${FONT}`; g.fillText('z', 30, 100); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false })); room.add(m); return m; });
const motes = Array.from({ length: 40 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: [0xffe14d, 0xc4b5fd, 0x7dd3fc][i % 3], toneMapped: false, transparent: true, opacity: 0 })); scene.add(m); return m; });

// ------------------------------------------------------------ BRAIN (x = +200)
const BX = 200, brainG = new THREE.Group(); brainG.position.set(BX, 0, 0); scene.add(brainG);
const brainParts = [];
function hemisphere(side) {
  const geo = new THREE.SphereGeometry(1, 180, 130), pos = geo.attributes.position, n = pos.count, col = new Float32Array(n * 3), wf = new Float32Array(n), wb = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const g1 = Math.sin(11 * z + 3.2 * Math.sin(5 * y + 2.1 * x)), g2 = Math.sin(10 * y + 2.6 * Math.sin(6 * z + 1.5 * x));
    const wr = 0.028 * (1 - Math.pow(Math.abs(g1 * 0.6 + g2 * 0.4), 0.35)) - 0.012;
    const r = 1 + wr - 0.12 * Math.max(0, -y - 0.3) * (z > 0 ? 1 : 0.4);
    let X = x * 0.55 * r, Y = y * 0.74 * r, Z = z * 1.0 * r; if (side * x < 0) X *= 0.25;
    if (y < -0.2 && z > -0.1 && z < 0.7 && Math.abs(x) > 0.6) Y -= 0.12 * (1 - Math.abs(z - 0.3));   // temporal lobe bulge
    pos.setXYZ(i, X + side * 0.53, Y, Z);
    wf[i] = clamp((z - 0.45) / 0.45) * clamp((y + 0.2) / 0.6); wb[i] = clamp((-z - 0.55) / 0.35);
    col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xf2a8b2, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color(0xffd0d8), vertexColors: true, transparent: true, opacity: 1, depthWrite: true }));
  m.userData = { wf, wb, col }; brainG.add(m); brainParts.push(m); return m;
}
const hemis = [hemisphere(-1), hemisphere(1)];
const cereb = (() => { const g = new THREE.SphereGeometry(1, 80, 60), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const r = 1 + 0.03 * Math.sin(y * 40); p.setXYZ(i, p.getX(i) * 0.78 * r, y * 0.38 * r, p.getZ(i) * 0.45 * r); } g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: 0xe3909c, roughness: 0.55, clearcoat: 0.3, transparent: true })); m.position.set(0, -0.62, -0.72); brainG.add(m); brainParts.push(m); return m; })();
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.9, 24), new THREE.MeshPhysicalMaterial({ color: 0xe8a0a8, roughness: 0.5, transparent: true, emissive: 0x000000 })); stem.position.set(0, -0.95, -0.35); stem.rotation.x = 0.35; brainG.add(stem); brainParts.push(stem);
const glowMat = c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const amyg = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), new THREE.MeshStandardMaterial({ color: 0xff7a45, emissive: 0xff5a1f, emissiveIntensity: 0 })); m.scale.set(1, 0.8, 1.3); m.position.set(s * 0.33, -0.33, 0.22); brainG.add(m);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), glowMat(0xff6a2a)); h.position.copy(m.position); brainG.add(h); return { m, h }; });
const hippo = [-1, 1].map(s => { const c = new THREE.CatmullRomCurve3([V3(s * 0.34, -0.36, 0.14), V3(s * 0.36, -0.3, -0.1), V3(s * 0.32, -0.16, -0.36), V3(s * 0.22, -0.02, -0.5)]);
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.04, 10), new THREE.MeshStandardMaterial({ color: 0xffd34d, emissive: 0xffb000, emissiveIntensity: 0 })); brainG.add(m); return m; });
const visGlow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), glowMat(0x4fa3ff)); visGlow.position.set(0, 0.0, -0.95); visGlow.scale.set(1.6, 1, 0.6); brainG.add(visGlow);
const pfcGlow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), glowMat(0x7c8aa0)); pfcGlow.position.set(0, 0.15, 0.9); pfcGlow.scale.set(1.6, 1, 0.6); brainG.add(pfcGlow);
const neurons = (() => { const R = rng(12), n = 900, pos = new Float32Array(n * 3), ph = []; for (let i = 0; i < n; i++) { const th = R() * 6.28, phi = Math.acos(2 * R() - 1), r = 1.15 + R() * 0.5; pos.set([Math.sin(phi) * Math.cos(th) * r * 0.9, Math.cos(phi) * r * 0.8, Math.sin(phi) * Math.sin(th) * r * 1.1], i * 3); ph.push(R() * 6.28); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fd3ff, size: 0.025, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); brainG.add(p); return p; })();
const memEmoji = [['🏏', 'Cricket'], ['☕', 'Chai'], ['📚', 'Exam'], ['👫', 'Friends'], ['📱', 'Reels']];
const memCards = memEmoji.map(([e, txt], i) => { const t = ctex(320, 400, (g, w, h) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.roundRect(0, 0, w, h, 28); g.fill(); g.fillStyle = ['#cde8ff', '#ffe4c4', '#e5d4ff', '#d4f5dd', '#ffd6e0'][i]; g.beginPath(); g.roundRect(18, 18, w - 36, h - 110, 18); g.fill();
    g.font = `150px ${EMOJI}`; g.textAlign = 'center'; g.fillText(e, w / 2, 230); g.fillStyle = '#222'; g.font = `800 48px ${FONT}`; g.fillText(txt, w / 2, h - 34); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.4), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, side: THREE.DoubleSide })); brainG.add(m); return m; });
const bubble = new THREE.Group(); scene.add(bubble);
{ const s = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0xc8e6ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, iridescence: 1, iridescenceIOR: 1.3, depthWrite: false })); bubble.add(s);
  const isl = island(0.32, 7); isl.scale.setScalar(0.9); isl.position.y = -0.12; bubble.add(isl); bubble.userData.isl = isl;
  const mini = makePerson({ skin: 0xb97a4f, shirt: 0x2f6fde, pants: 0x2b3446 }); scene.remove(mini); mini.scale.setScalar(0.18); mini.position.set(0.1, 0.12, 0.05); bubble.add(mini); bubble.userData.mini = mini; }
const bubbleParts = Array.from({ length: 60 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: [0xc8e6ff, 0xffe14d, 0xf9a8d4][i % 3], toneMapped: false, transparent: true, opacity: 0 })); scene.add(m); return m; });
const soundRings = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.01, 8, 64), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, toneMapped: false, transparent: true, opacity: 0 })); scene.add(m); return m; });

// ------------------------------------------------------------ overlays (labels, chips, captions, HUD)
const $ = s => document.querySelector(s), labelsEl = $('#labels'), hud = $('#hud');
const LBL = {}; function lab(id, html, cls = '') { const e = document.createElement('div'); e.className = 'lab ' + cls; e.innerHTML = html; labelsEl.appendChild(e); LBL[id] = { e, w: 0 }; }
const tmpV = new THREE.Vector3();
function showLab(id, pos, a, b, t) { const L = LBL[id], vis = P(t, a, 0.18) * (1 - P(t, b, 0.18)); if (vis <= 0.001) return;
  tmpV.copy(pos).project(camera); const x = (tmpV.x * 0.5 + 0.5) * 1080, y = (-tmpV.y * 0.5 + 0.5) * 1920; if (!L.w) L.w = L.e.offsetWidth;
  L.e.style.visibility = tmpV.z < 1 ? 'visible' : 'hidden'; L.e.style.opacity = vis; const s = lerp(0.6, 1, E.back(P(t, a, 0.35)));
  L.e.style.transform = `translate(${clamp(x - L.w / 2, 20, 1060 - L.w).toFixed(1)}px, ${(y - L.e.offsetHeight).toFixed(1)}px) scale(${s.toFixed(3)})`; }
function fixedEl(html, cls, x, y) { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; e.style.left = x + 'px'; e.style.top = y + 'px'; hud.appendChild(e); return e; }
function showFixed(e, t, a, b, dy = 30) { const vis = P(t, a, 0.2) * (1 - P(t, b, 0.2)); e.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; e.style.opacity = vis;
  e.style.transform = `translateY(${((1 - E.out(P(t, a, 0.35))) * dy).toFixed(1)}px) scale(${lerp(0.85, 1, E.back(P(t, a, 0.35))).toFixed(3)})`; }
const QDEF = [['intro', '?', 'కలలు ఎలా వస్తాయి?'], ['cycle', '1', 'కలలు ఎప్పుడు వస్తాయి?'], ['brain', '2', 'కలలో Brain ఏం చేస్తుంది?'], ['memory', '3', 'కల కథ ఎక్కడి నుంచి?'], ['lock', '4', 'కలలో ఎందుకు కదలం?'], ['facts', '5', 'మీకు తెలియని Facts']];
const chips = QDEF.map(([name, n, txt], i) => { const w = document.createElement('div'); w.className = 'chipw'; w.innerHTML = `<div class="chip"><span class="n">${n}</span><span class="t">${txt}</span></div>`; hud.appendChild(w);
  const nx = QDEF[i + 1] ? S[QDEF[i + 1][0]] : S.outro; return { e: w.firstChild, wrap: w, a: name === 'intro' ? Wi(9) - 0.1 : S[name] - 0.05, b: nx - 0.2 }; });
function renderChips(t) { chips.forEach(c => { const i = E.back(P(t, c.a, 0.45)), vis = P(t, c.a, 0.15) * (1 - P(t, c.b, 0.2)); c.wrap.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; c.e.style.opacity = vis;
  c.e.style.transform = `translateY(${((1 - i) * -40).toFixed(1)}px) rotate(${(-1.5 + (1 - i) * 6).toFixed(2)}deg) scale(${lerp(0.75, 1, i).toFixed(3)})`; }); }
QDEF.slice(1).forEach(([n]) => sfx(S[n] - 0.08, 'whoosh', 0.5));
const caps = $('#caps');
const EMPH = { 25: '#C4B5FD', 26: '#C4B5FD', 41: '#FDBA74', 44: '#7DD3FC', 45: '#7DD3FC', 53: '#CBD5E1', 54: '#CBD5E1', 65: '#FFE14D', 81: '#F9A8D4', 89: '#FDBA74', 94: '#FF5A6E', 108: '#FFE14D', 109: '#FFE14D', 117: '#FF5A6E' };
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

// labels
lab('fly', 'ఎగురుతాం ✈️', 'c'); lab('run', 'పరిగెడతాం 🏃', 'c'); lab('meet', 'కలుస్తాం 👋', 'c');
lab('rem', 'REM = Rapid Eye Movement', 'y'); lab('eyes', '👀 కళ్ళు వేగంగా కదులుతాయి', 'c');
lab('amy', 'Amygdala <span class="s">Emotions 🔥</span>', 'r'); lab('vis', 'Visual Cortex <span class="s">దృశ్యాలు 👁️</span>', 'c'); lab('pfc', 'Prefrontal Cortex <span class="s">Logic ↓</span>'); lab('nolog', 'Logic Check ✗', 'r');
lab('hip', 'Hippocampus <span class="s">Memory 🧠</span>', 'y'); lab('story', 'కల = జ్ఞాపకాల కథ ✨', 'y');
lab('stem', 'Brainstem 🔒', 'y'); lab('lock1', '🔒 Muscles Locked', 'r'); lab('eyeok', '👀 Eyes ✓', 'g'); lab('breath', '🫁 Breathing ✓', 'g');
lab('forget', 'కొన్ని నిమిషాల్లో మర్చిపోతాం ⏳', 'r'); lab('snd', '🔊 శబ్దాలు', 'c'); lab('tch', '✋ స్పర్శ', 'y'); lab('sml', '👃 వాసనలు', 'g');
// hypnogram
const hyp = (() => { const st = { A: 0, R: 1, N1: 2, N2: 3, N3: 4 }; const seq = [['A', .2], ['N1', .15], ['N2', .4], ['N3', .6], ['N2', .2], ['R', .15], ['N2', .4], ['N3', .45], ['N2', .3], ['R', .3], ['N2', .5], ['N3', .2], ['N2', .4], ['R', .45], ['N2', .6], ['R', .6], ['N1', .2], ['N2', .3], ['R', .75], ['A', .1]];
  const tot = seq.reduce((s, x) => s + x[1], 0); let x = 0, d = '', red = ''; const X = v => 60 + v / tot * 720, Y = s => 70 + st[s] * 52;
  seq.forEach(([s, dur], i) => { const x0 = X(x), x1 = X(x + dur); d += (i ? `L${x0.toFixed(1)},${Y(s)} ` : `M${x0.toFixed(1)},${Y(s)} `) + `L${x1.toFixed(1)},${Y(s)} `; if (s === 'R') red += `M${x0.toFixed(1)},${Y(s)} L${x1.toFixed(1)},${Y(s)} `; x += dur; });
  const svg = `<div style="font-weight:800;font-size:40px;margin-bottom:6px">Sleep Cycles <span style="font-family:Poppins;font-size:28px;opacity:.75">(one night)</span></div>
  <svg width="820" height="330" viewBox="0 0 820 330"><g font-family="Poppins" font-weight="700" font-size="22" fill="#cbd5e1">${Object.entries(st).map(([k, v]) => `<text x="0" y="${78 + v * 52}">${k === 'A' ? 'Awake' : k}</text>`).join('')}</g>
  <path id="hpath" d="${d}" fill="none" stroke="#9fb4ff" stroke-width="6" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>
  <path id="hred" d="${red}" fill="none" stroke="#ff5a6e" stroke-width="14" stroke-linecap="round" opacity="0"/>
  <g id="hcyc" opacity="0"><path d="M${X(0.2)},300 L${X(0.2)},312 L${X(1.9)},312 L${X(1.9)},300" stroke="#FFE14D" stroke-width="4" fill="none"/><text x="${X(1.05)}" y="300" fill="#FFE14D" font-family="Poppins" font-weight="800" font-size="26" text-anchor="middle">≈ 90 min</text></g>
  <text id="hmorn" x="800" y="40" fill="#ff8fa0" font-family="Poppins" font-weight="700" font-size="22" text-anchor="end" opacity="0">REM gets longer toward morning →</text></svg>`;
  const e = fixedEl(svg, 'panel', 110, 290); return { e, path: e.querySelector('#hpath'), red: e.querySelector('#hred'), cyc: e.querySelector('#hcyc'), morn: e.querySelector('#hmorn') }; })();
const clock2 = fixedEl(`<div style="display:flex;align-items:center;gap:26px"><div style="font-size:120px;line-height:1">🌙</div><div><div style="font-family:Poppins;font-weight:800;font-size:110px;line-height:1">≈ 2 hrs</div><div style="font-weight:800;font-size:44px;color:#FFE14D">ప్రతి రాత్రి కలలు</div></div></div>`, 'panel', 150, 380);
const logo = document.createElement('img'); logo.id = 'logo'; logo.src = '../../beyond-the-screen-logo/beyond-the-screen-icon.png'; hud.appendChild(logo);
const follow = fixedEl('+ Follow', 'follow', 260, 1040);

// ------------------------------------------------------------ shots
function camLook(pos, look, fov = 50) { camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look); camera.updateMatrixWorld(true); }
const hh = (t, k = 1) => V3((Math.sin(t * 0.9) * 0.012 + Math.sin(t * 2.3 + 1) * 0.006) * k, (Math.sin(t * 0.7 + 2) * 0.01 + Math.sin(t * 1.9) * 0.005) * k, 0);
function reset() {
  [flyer, friend].forEach(p => (p.visible = false)); sleeper.visible = true; blanket.visible = true;
  sleeper.userData.mats.forEach(m => { m.transparent = false; m.opacity = 1; m.depthWrite = true; m.emissive.set(0x000000); });
  spine.material.opacity = 0; pulses.forEach(p => (p.material.opacity = 0)); stemGlow.material.opacity = 0; zzz.forEach(z => (z.material.opacity = 0)); motes.forEach(m => (m.material.opacity = 0));
  bubble.visible = false; bubbleParts.forEach(p => (p.material.opacity = 0)); soundRings.forEach(r => (r.material.opacity = 0)); memCards.forEach(m => (m.visible = false));
  brainParts.forEach(m => { m.material.opacity = 1; m.material.transparent = false; m.material.depthWrite = true; }); amyg.forEach(a => { a.m.material.emissiveIntensity = 0; a.h.material.opacity = 0; }); hippo.forEach(h => (h.material.emissiveIntensity = 0));
  visGlow.material.opacity = 0; pfcGlow.material.opacity = 0; stem.material.emissive.set(0x000000);
  scene.background = new THREE.Color(0x0a0d1f); scene.fog = null; warm.intensity = 0; key.color.set(0xbcd0ff); key.intensity = 1.6; hemi.intensity = 0.6; renderer.toneMappingExposure = 1.0;
}
function sleeperBreath(t, k = 1) { const s = 1 + 0.035 * Math.sin(t * 1.4) * k; sleeper.userData.torso.scale.set(s, 1, 0.62 * s); blanket.scale.y = 1 + 0.12 * Math.sin(t * 1.4) * k; }
function remEyes(t, amt) { sleeper.userData.eyes.forEach(e => (e.position.x = Math.sign(e.position.x) * 0.04 + amt * 0.011 * Math.sign(Math.sin(t * 9.0)) * (0.6 + 0.4 * Math.sin(t * 23)))); }
function bedroomLight(t) { key.position.set(2.2, 4.2, -3.2); key.target.position.set(-1.1, 0.4, -0.9); key.color.set(0x9fb7ff); key.intensity = 1.5; hemi.intensity = 0.35; warm.position.set(0.05, 0.95, -1.75); warm.intensity = 0.6; }
function dreamLight() { scene.background = skyTex; scene.fog = new THREE.Fog(0x3b1a6e, 18, 70); key.position.set(DX + 10, 18, 12); key.target.position.set(DX, 0, -6); key.color.set(0xffd6f0); key.intensity = 2.2; hemi.intensity = 0.8; }
function brainLight() { scene.background = new THREE.Color(0x070a1a); key.position.set(BX + 3, 5, 6); key.target.position.set(BX, 0, 0); key.color.set(0xffffff); key.intensity = 2.0; hemi.intensity = 0.7; }
function brainXray(k) { brainParts.forEach(m => { m.material.transparent = true; m.material.opacity = 1 - 0.55 * k; m.material.depthWrite = k < 0.3; }); }
function brainTint(vb, pf) { hemis.forEach(h => { const { wf, wb, col } = h.userData, c = h.geometry.attributes.color; for (let i = 0; i < wf.length; i++) { const b = wb[i] * vb, f = wf[i] * pf;
  col[i * 3] = 1 - 0.55 * b - 0.35 * f; col[i * 3 + 1] = 1 - 0.1 * b - 0.25 * f; col[i * 3 + 2] = 1 + 0.6 * b - 0.15 * f; } c.needsUpdate = true; }); }
function neuronsFlash(t, k) { neurons.material.opacity = 0.3 + 0.5 * k; neurons.material.size = 0.02 + 0.01 * Math.sin(t * 7); neurons.rotation.y = t * 0.05; }
const SH = {};
SH.intro = (t, a, b) => {
  if (t < Wi(9) - 0.2) { // dream world
    dreamLight(); stars.rotation.y = t * 0.01; clouds.forEach((c, i) => (c.position.x += Math.sin(t * 0.2 + i) * 0.002));
    flyer.visible = true;
    if (t < Wi(4) - 0.1) { const u = P(t, 0, Wi(4) - 0.1); flyer.rotation.set(Math.PI / 2 - 0.25, 0.4, 0.1 * Math.sin(t * 2)); flyer.position.set(DX + lerp(-3, 1.5, u), 2.6 + Math.sin(t * 2) * 0.15, lerp(-2, -9, u)); pose(flyer, { fly: 1 });
      camLook(V3(DX + lerp(-5.5, -2.2, u), lerp(3.6, 3.6, u), lerp(2.6, -3.6, u)).add(hh(t, 3)), flyer.position.clone().add(V3(0, 0.3, 0)), 55); showLab('fly', flyer.position.clone().add(V3(0, 1.0, 0)), Wi(3), Wi(4) - 0.15, t); }
    else { const isl = islands[0], u = P(t, Wi(4) - 0.1, Wi(9) - Wi(4)); flyer.rotation.set(0, Math.PI / 2, 0);
      const runT = clamp((t - Wi(4)) / 1.0); flyer.position.set(DX + lerp(-2.4, 0.2, Math.min(runT, 1)), -1 + 0.175, 0.2); pose(flyer, { phase: t * 12, walk: t < Wi(4) + 1 ? 1 : 0 });
      friend.visible = t > Wi(5) - 0.3; friend.position.set(DX + 1.0, -1 + 0.175, 0.15); friend.rotation.y = -Math.PI / 2; pose(friend, { raise: P(t, Wi(6), 0.3), wave: t * 10 });
      camLook(V3(DX + lerp(-1.2, -0.4, u), lerp(1.0, 0.8, u), lerp(6.4, 5.4, u)).add(hh(t, 1.5)), V3(DX - 0.4, 0.0, 0.1), 50);
      showLab('run', flyer.position.clone().add(V3(0, 2.05, 0)), Wi(4), Wi(5) - 0.2, t); showLab('meet', V3(DX + 0.6, 1.25, 0.15), Wi(7) - 0.2, Wi(9) - 0.3, t); }
  } else { bedroomLight(t); sleeperBreath(t); const u = E.io(P(t, Wi(9) - 0.2, b - Wi(9)));
    camLook(V3(lerp(1.4, 0.2, u), lerp(1.9, 1.35, u), lerp(1.6, -0.7, u)).add(hh(t)), V3(-1.1, 0.62, -1.55), 48);
    zzz.forEach((z, i) => { const k = ((t * 0.5 + i / 3) % 1); z.position.set(-1.0 + k * 0.25, 0.8 + k * 0.5, -1.7); z.material.opacity = (1 - k) * 0.9; z.lookAt(camera.position); });
  }
};
SH.cycle = (t, a, b) => {
  bedroomLight(t); sleeperBreath(t); moon.position.x = lerp(0.55, 1.25, P(t, a, 6)); moon.position.y = 2.6 + Math.sin(P(t, a, 6) * Math.PI) * 0.2;
  const close = E.io(P(t, Wi(28) - 0.4, 0.8)), remAmt = P(t, Wi(28), 0.3) * (1 - P(t, b - 0.2, 0.2)); remEyes(t, remAmt);
  const far = V3(1.6, 2.3, 1.9), near = V3(-0.9, 1.32, -1.25);
  camLook(far.clone().lerp(near, close).add(hh(t, 1 - close * 0.9)), V3(-1.1, lerp(0.75, 0.8, close), lerp(-1.1, -1.7, close)), lerp(46, 34, close));
  hyp.path.setAttribute('stroke-dashoffset', (1 - E.io(P(t, a + 0.3, 3.4))).toFixed(4)); hyp.red.setAttribute('opacity', P(t, Wi(25), 0.3).toFixed(2)); hyp.cyc.setAttribute('opacity', P(t, Wi(17), 0.3).toFixed(2)); hyp.morn.setAttribute('opacity', P(t, Wi(26) + 0.4, 0.4).toFixed(2));
  showFixed(hyp.e, t, a + 0.1, Wi(28) - 0.3);
  showLab('rem', V3(-1.1, 0.95, -1.52), Wi(28) - 0.2, Wi(32), t); showLab('eyes', V3(-1.1, 0.95, -1.52), Wi(32), b, t);
  motes.forEach((m, i) => { const k = ((t * 0.35 + i / motes.length) % 1); m.position.set(-1.1 + Math.sin(i * 2.1 + t) * 0.12 * k, 0.75 + k * 0.6, -1.75 + Math.cos(i * 1.3) * 0.1 * k); m.material.opacity = t > Wi(32) ? (1 - k) : 0; });
};
SH.brain = (t, a, b) => {
  brainLight(); brainG.rotation.y = lerp(-0.6, 0.5, E.io(P(t, a, b - a))) + Math.sin(t * 0.4) * 0.05;
  const xr = P(t, Wi(38) - 0.3, 0.5); brainXray(xr);
  const amy = P(t, Wi(40), 0.4); amyg.forEach(x => { x.m.material.emissiveIntensity = 2.5 * amy * (0.8 + 0.2 * Math.sin(t * 8)); x.h.material.opacity = 0.55 * amy; });
  const vis = P(t, Wi(43), 0.4); visGlow.material.opacity = 0.55 * vis * (0.8 + 0.2 * Math.sin(t * 6)); const pf = P(t, Wi(53), 0.5); pfcGlow.material.opacity = 0.35 * pf; brainTint(vis, pf);
  neuronsFlash(t, P(t, Wi(46), 0.3) * (1 - pf * 0.5));
  const u = E.io(P(t, a, 3)); camLook(V3(BX + lerp(2.6, 1.9, u), lerp(1.2, 0.7, u), lerp(4.2, 3.1, u)).add(hh(t, 2)), V3(BX, -0.05, 0), 46);
  const wp = v => brainG.localToWorld(v.clone());
  showLab('amy', wp(V3(0.33, -0.1, 0.22)), Wi(41) - 0.1, b, t); showLab('vis', wp(V3(0.35, 0.1, -1.15)), Wi(44) - 0.1, b, t); showLab('pfc', wp(V3(0, 0.7, 0.95)), Wi(53) - 0.1, b, t);
  showLab('nolog', wp(V3(0.4, 1.3, 0.4)), Wi(56), b, t);
};
SH.memory = (t, a, b) => {
  brainLight(); brainG.rotation.y = 0.5 + lerp(0, 0.7, E.io(P(t, a, b - a))); brainXray(1); neuronsFlash(t, 0.6); brainTint(0, 0);
  const hp = P(t, Wi(65) - 0.2, 0.4); hippo.forEach(h => (h.material.emissiveIntensity = 2.2 * hp * (0.85 + 0.15 * Math.sin(t * 7))));
  const merge = E.io(P(t, Wi(76) - 0.3, 1.0)), center = V3(0, 1.25, 0.3);
  memCards.forEach((m, i) => { const st = Wi(68) + i * 0.35; if (t < st) return; m.visible = true; const u = E.out(P(t, st, 0.8)), ang = i / memCards.length * Math.PI * 2 + t * 0.5;
    const orbit = V3(Math.cos(ang) * 1.45, 0.75 + Math.sin(ang * 2) * 0.25, Math.sin(ang) * 1.45), src = V3(0.3, -0.25, -0.1);
    m.position.copy(src.clone().lerp(orbit, u).lerp(center, merge)); m.scale.setScalar(lerp(0.3, 1.7, u) * (1 - merge * 0.9)); m.lookAt(camera.position); m.visible = merge < 0.98; });
  bubble.visible = t > Wi(76) - 0.1; if (bubble.visible) { const k = E.back(P(t, Wi(76) - 0.1, 0.6)); bubble.position.copy(brainG.localToWorld(center.clone())); bubble.scale.setScalar(0.05 + 0.75 * k); bubble.rotation.y = t * 0.4;
    pose(bubble.userData.mini, { phase: t * 10, walk: 1 }); }
  const u = E.io(P(t, a, b - a)); camLook(V3(BX + lerp(1.9, 0.9, u), lerp(0.7, 1.4, u), lerp(3.1, 3.6, u)).add(hh(t, 2)), V3(BX, lerp(-0.05, 0.6, u), 0), 48);
  showLab('hip', brainG.localToWorld(V3(0.34, -0.05, -0.1)), Wi(65) - 0.1, Wi(70), t); showLab('story', brainG.localToWorld(center.clone().add(V3(0, 0.75, 0))), Wi(79) - 0.1, b, t);
};
SH.lock = (t, a, b) => {
  bedroomLight(t); sleeperBreath(t, 1.6); blanket.visible = t < Wi(89) - 0.3; const xr = P(t, Wi(89) - 0.3, 0.5);
  sleeper.userData.mats.forEach(m => { m.transparent = xr > 0; m.opacity = 1 - 0.55 * xr; m.depthWrite = xr < 0.5; m.emissive.setRGB(0.05 * xr, 0.12 * xr, 0.3 * xr); });
  spine.material.opacity = 0.9 * xr; stemGlow.material.opacity = P(t, Wi(89), 0.3) * (0.7 + 0.3 * Math.sin(t * 9)); stemGlow.scale.setScalar(1 + 0.3 * Math.sin(t * 9));
  pulses.forEach((p, i) => { const k = ((t - Wi(89)) * 0.9 + i / pulses.length) % 1; p.position.copy(spineCurve.getPoint(clamp(k))); p.material.opacity = t > Wi(89) ? 1 - k * 0.3 : 0; });
  remEyes(t, P(t, Wi(96), 0.3));
  bubble.visible = t < Wi(89) - 0.2; if (bubble.visible) { bubble.position.set(-0.85, 1.25, -1.6); bubble.scale.setScalar(0.45 * E.back(P(t, a, 0.6))); bubble.rotation.y = t * 0.5; pose(bubble.userData.mini, { phase: t * 12, walk: 1 }); }
  const u = E.io(P(t, a, 2.5)); camLook(V3(lerp(0.9, 0.5, u), lerp(1.6, 2.4, u), lerp(0.9, 0.2, u)).add(hh(t)), V3(-1.1, 0.55, -1.15), 48);
  showLab('stem', V3(-1.1, 0.82, -1.8), Wi(89), b, t); showLab('lock1', V3(-1.1, 0.8, -0.9), Wi(94) - 0.2, b, t);
  showLab('eyeok', V3(-1.3, 0.88, -1.6), Wi(96) - 0.1, b, t); showLab('breath', V3(-0.8, 0.85, -1.25), Wi(97) - 0.1, b, t);
};
SH.facts = (t, a, b) => {
  if (t < Wi(118) - 0.2) { dreamLight(); stars.rotation.y = t * 0.01;
    bubble.visible = true; const dis = P(t, Wi(115) - 0.2, 1.4); bubble.position.set(DX, 2.2, -3.4); bubble.scale.setScalar(lerp(1.4, 1.5, P(t, a, 3)) * (1 - E.io(dis))); bubble.rotation.y = t * 0.3; pose(bubble.userData.mini, { phase: t * 10, walk: 1 });
    bubbleParts.forEach((p, i) => { const R = rng(i + 3), dir = V3(R() - 0.5, R() - 0.3, R() - 0.5).normalize(), k = E.out(dis); p.position.copy(bubble.position).addScaledVector(dir, 0.3 + k * 2.4); p.material.opacity = dis > 0 && dis < 1 ? 1 - k : 0; });
    camLook(V3(DX + 0.4, 2.5, 0.6).add(hh(t, 2)), V3(DX, 2.1, -3.4), 50);
    showFixed(clock2, t, Wi(107) - 0.2, Wi(112)); showLab('forget', V3(DX, 3.8, -3.4), Wi(114) - 0.1, Wi(118) - 0.3, t);
  } else { scene.background = new THREE.Color(0x05060f); brainLight(); brainG.rotation.y = t * 0.2; brainXray(0.9); neuronsFlash(t, 0.8);
    soundRings.forEach((r, i) => { const k = ((t - Wi(122)) * 0.7 + i / 4) % 1; r.position.set(BX - 1.0, 0.3, 0.6); r.rotation.y = Math.PI / 2; r.scale.setScalar(0.5 + k * 3); r.material.opacity = t > Wi(122) - 0.1 ? (1 - k) * 0.8 : 0; });
    const vis = 0; visGlow.material.opacity = 0; brainTint(vis, 0);
    camLook(V3(BX + 0.3, 0.6, 3.6).add(hh(t, 2)), V3(BX, 0.1, 0), 50);
    showLab('snd', V3(BX - 1.1, 1.0, 0.6), Wi(122) - 0.1, b, t); showLab('tch', V3(BX + 0.9, 1.1, 0.4), Wi(123) - 0.1, b, t); showLab('sml', V3(BX, 1.55, 0.6), Wi(124) - 0.1, b, t); }
};
SH.outro = (t, a, b) => { dreamLight(); stars.rotation.y = t * 0.01; flyer.visible = true; const u = P(t, a, END - a);
  flyer.rotation.set(Math.PI / 2 - 0.25, -0.3, 0.1 * Math.sin(t * 2)); flyer.position.set(DX + lerp(2, -2, u), 3.5 + Math.sin(t * 2) * 0.15, lerp(-6, -12, u)); pose(flyer, { fly: 1 });
  camLook(V3(DX + lerp(1, -1, u), lerp(3, 4.5, u), lerp(2.5, 1, u)).add(hh(t, 2)), V3(DX, 2.5, -8), 55);
  showFixed(logo, t, Wi(130) - 0.3, END + 5, 60); showFixed(follow, t, Wi(134) - 0.2, END + 5, 60); };
const ORDER = ['intro', 'cycle', 'brain', 'memory', 'lock', 'facts', 'outro'];
// sound cues
sfx(0.05, 'whooshS', 0.6); sfx(Wi(3), 'swoosh', 0.6); sfx(Wi(5), 'pop', 0.5); sfx(Wi(9) - 0.25, 'shimmer', 0.6);
sfx(Wi(25), 'pop', 0.4); sfx(Wi(28) - 0.3, 'whooshS', 0.5);
sfx(Wi(40), 'shimmer', 0.5); sfx(Wi(43), 'sparkle', 0.5); sfx(Wi(53), 'down', 0.4);
sfx(Wi(65), 'shimmer', 0.5); [0, 1, 2, 3, 4].forEach(i => sfx(Wi(68) + i * 0.35, 'pop', 0.35)); sfx(Wi(76) - 0.2, 'sparkle', 0.7);
sfx(Wi(89), 'lock', 0.9); sfx(Wi(94), 'lock', 0.7); sfx(Wi(96), 'check', 0.5);
sfx(Wi(108), 'ding', 0.6); sfx(Wi(115) - 0.2, 'poof', 0.6); sfx(Wi(122) - 0.1, 'chime', 0.5);
sfx(Wi(130) - 0.3, 'pop', 0.6); sfx(Wi(134), 'click', 0.8);
window.SFX = SFX;

window.render = function (t) {
  reset(); let k = 0; for (let i = 0; i < ORDER.length; i++) if (t >= (i === 0 ? 0 : S[ORDER[i]] - 0.02)) k = i;
  const name = ORDER[k], a = k === 0 ? 0 : S[name], b = k + 1 < ORDER.length ? S[ORDER[k + 1]] : END;
  Object.values(LBL).forEach(L => (L.e.style.visibility = 'hidden')); [hyp.e, clock2, logo, follow].forEach(e => (e.style.visibility = 'hidden'));
  SH[name](t, a, b);
  const dip = Math.max(...ORDER.slice(1).map(n => pulse(t, S[n] - 0.09, 0.18)), pulse(t, Wi(9) - 0.29, 0.18), pulse(t, Wi(118) - 0.29, 0.18));
  renderer.toneMappingExposure *= 1 + dip * 1.4;
  renderer.render(scene, camera); renderChips(t); renderCaps(t);
  const f = Math.round(t * 30); gctx.putImageData(GRAIN[f % 6], 0, 0); grainCv.style.transform = `translate(${((f * 37) % 9) - 4}px, ${((f * 53) % 9) - 4}px)`;
};
window.setup = async function () {
  await Promise.all(['800 40px "Baloo Tammudu 2"', '700 40px "Baloo Tammudu 2"', '700 40px "Poppins"', '800 40px "Poppins"', '40px "Noto Color Emoji"'].map(f => document.fonts.load(f, 'అఆ abc 🏏')));
  await document.fonts.ready;
  const redraw = tx => { if (!tx || !tx.userData || !tx.userData.draw) return; const { c, g, draw } = tx.userData; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tx.needsUpdate = true; };
  scene.traverse(o => { if (o.material && o.material.map) redraw(o.material.map); }); redraw(skyTex);
  await new Promise(r => (logo.complete ? r() : (logo.onload = r)));
  window.render(0); return { duration: END, sfx: SFX };
};
window.__ready = true;
