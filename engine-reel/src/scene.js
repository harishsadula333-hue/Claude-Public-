// "How do vehicles run on liquid fuel?" — deterministic three.js reel. window.render(t) draws the frame at time t.
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
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 900);
const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x3a3428, 0.8); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target);
const boom = new THREE.PointLight(0xffa040, 0, 6, 1.5); scene.add(boom);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g, draw }; return t; }
const FONT = "'Poppins', sans-serif";
const std = (c, r = 0.5, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const mesh = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };

// ------------------------------------------------------------ ROAD WORLD (x = 0)
const road = new THREE.Group(); scene.add(road);
const skyTex = ctex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3d7bd9'); gr.addColorStop(0.6, '#9cc8f2'); gr.addColorStop(1, '#f2e3c4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const roadTex = ctex(512, 512, (g, w, h) => { g.fillStyle = '#3b3d42'; g.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 4000; i++) { const v = 50 + R() * 30; g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(R() * w, R() * h, 2, 2); }
  g.fillStyle = '#f2f2f2'; g.fillRect(w / 2 - 6, 0, 12, h * 0.55); g.fillStyle = '#e8c33a'; g.fillRect(10, 0, 8, h); g.fillRect(w - 18, 0, 8, h); });
roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.repeat.set(1, 20);
{ const grass = mesh(new THREE.PlaneGeometry(400, 400), std(0x6aa04e, 1), false); grass.rotation.x = -Math.PI / 2; grass.position.y = -0.01; road.add(grass);
  const r = mesh(new THREE.PlaneGeometry(9, 400), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.85 }), false); r.rotation.x = -Math.PI / 2; r.rotation.z = Math.PI / 2; road.add(r);
  const R = rng(7);
  for (let i = 0; i < 70; i++) { const side = i % 2 ? 1 : -1, x = -150 + R() * 300, z = side * (8 + R() * 30), h = 2.5 + R() * 3;
    const tr = mesh(new THREE.ConeGeometry(1 + R(), h, 8), std(new THREE.Color().setHSL(0.28 + R() * 0.06, 0.45, 0.28 + R() * 0.12), 0.8)); tr.position.set(x, h / 2 + 1, z); road.add(tr);
    const tk = mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6), std(0x6b4a30)); tk.position.set(x, 0.6, z); road.add(tk); }
  for (let i = 0; i < 8; i++) { const hill = mesh(new THREE.SphereGeometry(30 + R() * 30, 24, 12), std(0x7fae68, 1), false); hill.scale.y = 0.35; hill.position.set(-200 + i * 60, -4, -90 - R() * 40); road.add(hill); }
}
function wheel(r, w, rimC = 0x9aa3ad) { const g = new THREE.Group(); const tire = mesh(new THREE.TorusGeometry(r * 0.8, r * 0.22, 12, 32), std(0x1b1b1d, 0.9)); g.add(tire);
  const rim = mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, w * 0.6, 24), std(rimC, 0.35, 0.7)); rim.rotation.x = Math.PI / 2; g.add(rim);
  for (let k = 0; k < 5; k++) { const sp = mesh(new THREE.BoxGeometry(r * 1.1, r * 0.1, w * 0.3), std(0x5b6370, 0.4, 0.6)); sp.rotation.z = k * Math.PI / 5; g.add(sp); }
  g.userData.r = r; return g; }
function makeBike() { const g = new THREE.Group(); const red = std(0xd61f2b, 0.35, 0.3), black = std(0x15161a, 0.5, 0.3), chrome = std(0xd8dde3, 0.2, 0.9);
  const wf = wheel(0.33, 0.12), wr = wheel(0.33, 0.14); wf.position.set(0.72, 0.33, 0); wr.position.set(-0.68, 0.33, 0); g.add(wf, wr);
  const tank = mesh(new RoundedBoxGeometry(0.55, 0.26, 0.32, 3, 0.1), red); tank.position.set(0.15, 0.86, 0); g.add(tank);
  const seat = mesh(new RoundedBoxGeometry(0.6, 0.1, 0.28, 3, 0.04), black); seat.position.set(-0.32, 0.86, 0); g.add(seat);
  const eng = mesh(new RoundedBoxGeometry(0.42, 0.34, 0.26, 3, 0.05), std(0x8a8f96, 0.35, 0.7)); eng.position.set(0.02, 0.48, 0); g.add(eng); g.userData.eng = eng;
  for (let k = 0; k < 4; k++) { const fin = mesh(new THREE.BoxGeometry(0.36, 0.015, 0.3), std(0x6b7078, 0.4, 0.7)); fin.position.set(0.04, 0.6 + k * 0.035, 0); g.add(fin); }
  const fork = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8), chrome); fork.position.set(0.62, 0.68, 0); fork.rotation.z = 0.35; g.add(fork);
  const bar = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), black); bar.position.set(0.5, 1.05, 0); bar.rotation.x = Math.PI / 2; g.add(bar);
  const head = mesh(new THREE.SphereGeometry(0.08, 16, 12), std(0xfff6d0, 0.2)); head.position.set(0.68, 0.92, 0); g.add(head);
  const frame = mesh(new THREE.BoxGeometry(1.0, 0.05, 0.05), black); frame.position.set(-0.05, 0.62, 0); frame.rotation.z = -0.15; g.add(frame);
  const exh = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.8, 10), chrome); exh.rotation.z = Math.PI / 2; exh.position.set(-0.35, 0.38, 0.15); g.add(exh);
  const rider = makeRider(); rider.position.set(-0.2, 0.86, 0); g.add(rider);
  g.userData.wheels = [wf, wr]; return g; }
function makeRider() { const g = new THREE.Group(), skin = std(0xb97a4f, 0.6), shirt = std(0x2f6fde, 0.7), pant = std(0x2b3446, 0.8);
  const torso = mesh(new THREE.CapsuleGeometry(0.15, 0.3, 6, 12), shirt); torso.position.set(0.05, 0.35, 0); torso.rotation.z = -0.35; g.add(torso);
  const helm = mesh(new THREE.SphereGeometry(0.14, 20, 14), std(0x111111, 0.25, 0.4)); helm.position.set(0.18, 0.72, 0); g.add(helm);
  const visor = mesh(new THREE.SphereGeometry(0.142, 20, 14, -0.6, 1.2, 1.2, 0.7), std(0x223355, 0.05, 0.6)); visor.position.copy(helm.position); visor.rotation.y = Math.PI / 2; g.add(visor);
  for (const s of [-1, 1]) { const arm = mesh(new THREE.CapsuleGeometry(0.045, 0.42, 4, 8), shirt); arm.position.set(0.32, 0.45, s * 0.17); arm.rotation.z = -1.1; g.add(arm);
    const leg = mesh(new THREE.CapsuleGeometry(0.06, 0.4, 4, 8), pant); leg.position.set(0.12, -0.05, s * 0.16); leg.rotation.z = 1.2; g.add(leg); }
  return g; }
function makeCar(c = 0xf2f4f7) { const g = new THREE.Group(), body = std(c, 0.25, 0.5);
  const b = mesh(new RoundedBoxGeometry(4.2, 0.75, 1.8, 4, 0.2), body); b.position.y = 0.65; g.add(b);
  const cab = mesh(new RoundedBoxGeometry(2.3, 0.65, 1.6, 4, 0.22), body); cab.position.set(-0.2, 1.25, 0); g.add(cab);
  const gl = mesh(new RoundedBoxGeometry(2.25, 0.45, 1.64, 3, 0.15), std(0x1d2633, 0.05, 0.6)); gl.position.set(-0.2, 1.28, 0); g.add(gl);
  const ws = [[1.35, -0.85], [1.35, 0.85], [-1.35, -0.85], [-1.35, 0.85]].map(([x, z]) => { const w = wheel(0.38, 0.25); w.position.set(x, 0.38, z); g.add(w); return w; });
  g.userData.wheels = ws; return g; }
function makeBus() { const g = new THREE.Group(), body = std(0xd9342b, 0.35, 0.3);
  const b = mesh(new RoundedBoxGeometry(11, 2.6, 2.5, 4, 0.25), body); b.position.y = 1.8; g.add(b);
  const win = mesh(new RoundedBoxGeometry(10.2, 0.9, 2.54, 2, 0.1), std(0x1d2633, 0.05, 0.6)); win.position.y = 2.35; g.add(win);
  const stripe = mesh(new THREE.BoxGeometry(10.9, 0.2, 2.52), std(0xf2c12e, 0.4)); stripe.position.y = 1.45; g.add(stripe);
  const ws = [[3.6, -1.1], [3.6, 1.1], [-3.4, -1.1], [-3.4, 1.1]].map(([x, z]) => { const w = wheel(0.55, 0.35); w.position.set(x, 0.55, z); g.add(w); return w; });
  g.userData.wheels = ws; return g; }
function makeLorry() { const g = new THREE.Group();
  const cab = mesh(new RoundedBoxGeometry(2.2, 2.4, 2.4, 4, 0.2), std(0x1f6fd1, 0.35, 0.3)); cab.position.set(3.3, 1.7, 0); g.add(cab);
  const ww = mesh(new RoundedBoxGeometry(0.1, 0.9, 2.1, 2, 0.04), std(0x1d2633, 0.05, 0.6)); ww.position.set(4.42, 2.2, 0); g.add(ww);
  const box = mesh(new RoundedBoxGeometry(5.8, 2.8, 2.5, 3, 0.1), std(0xf2a33a, 0.6)); box.position.set(-0.9, 2.0, 0); g.add(box);
  const ws = [[3.3, -1.1], [3.3, 1.1], [-0.4, -1.1], [-0.4, 1.1], [-2.6, -1.1], [-2.6, 1.1]].map(([x, z]) => { const w = wheel(0.52, 0.35); w.position.set(x, 0.52, z); g.add(w); return w; });
  g.userData.wheels = ws; return g; }
function makeTractor() { const g = new THREE.Group(), red = std(0xc0282d, 0.35, 0.3);
  const body = mesh(new RoundedBoxGeometry(2.4, 0.9, 1.0, 3, 0.12), red); body.position.set(0.5, 1.1, 0); g.add(body);
  const hood = mesh(new RoundedBoxGeometry(1.4, 0.7, 0.9, 3, 0.12), red); hood.position.set(1.2, 1.4, 0); g.add(hood);
  const stack = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), std(0x222222, 0.4, 0.5)); stack.position.set(1.3, 2.1, 0.25); g.add(stack); g.userData.stack = stack;
  const seat = mesh(new RoundedBoxGeometry(0.4, 0.3, 0.5, 2, 0.06), std(0x222222)); seat.position.set(-0.3, 1.75, 0); g.add(seat);
  const roof = mesh(new THREE.BoxGeometry(1.2, 0.08, 1.6), std(0xeeeeee)); roof.position.set(-0.3, 2.8, 0); g.add(roof);
  for (const z of [-0.7, 0.7]) for (const x of [-0.8, 0.2]) { const p = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), std(0x333333)); p.position.set(x, 2.25, z); g.add(p); }
  const ws = [[-0.6, -0.85, 0.85, 0.5], [-0.6, 0.85, 0.85, 0.5], [1.5, -0.6, 0.45, 0.3], [1.5, 0.6, 0.45, 0.3]].map(([x, z, r, w]) => { const wh = wheel(r, w, 0xf2c12e); wh.position.set(x, r, z); g.add(wh); return wh; });
  g.userData.wheels = ws; return g; }
const bike = makeBike(), car = makeCar(), bus = makeBus(), lorry = makeLorry(), tractor = makeTractor(), car2 = makeCar(0x2563eb), bike2 = makeBike();
const VEH = [bike, car, bus, lorry, tractor, car2, bike2]; VEH.forEach(v => road.add(v));
const smoke = Array.from({ length: 30 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: 0x777777, transparent: true, opacity: 0, roughness: 1, depthWrite: false })); scene.add(m); return m; });
function drive(v, x, z, heading = 0) { const prev = v.userData.px ?? x; v.position.set(x, 0, z); v.rotation.y = heading; v.userData.wheels.forEach(w => (w.rotation.z = -x / w.userData.r)); v.userData.px = x; }

// ------------------------------------------------------------ ENGINE STUDIO (x = 200)
const EX = 900, studio = new THREE.Group(); studio.position.x = EX; scene.add(studio);
{ const fl = mesh(new THREE.CircleGeometry(12, 64), new THREE.MeshStandardMaterial({ color: 0x141a2e, roughness: 0.35, metalness: 0.2 }), false); fl.rotation.x = -Math.PI / 2; fl.position.y = -0.9; studio.add(fl);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.66, 64), new THREE.MeshBasicMaterial({ color: 0x22d3ee, toneMapped: false, transparent: true, opacity: 0.4 })); ring.rotation.x = -Math.PI / 2; ring.position.y = -0.89; studio.add(ring); }
const eng = new THREE.Group(); studio.add(eng);
const CR = 0.32, ROD = 1.05, HEAD_Y = 1.72, PIST_H = 0.38;
const metal = std(0xaab3bf, 0.3, 0.85), dark = std(0x3a404a, 0.4, 0.7);
const glassM = new THREE.MeshPhysicalMaterial({ color: 0xcfe8ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.25, 48, 1, true), glassM); cyl.position.y = HEAD_Y - 0.625; eng.add(cyl);
const cylRims = [0, 1].map(k => { const r = mesh(new THREE.TorusGeometry(0.45, 0.025, 8, 48), metal); r.rotation.x = Math.PI / 2; r.position.y = k ? HEAD_Y : HEAD_Y - 1.25; eng.add(r); return r; });
const headM = new THREE.MeshPhysicalMaterial({ color: 0x9aa4b2, roughness: 0.35, metalness: 0.7, transparent: true, opacity: 0.55, depthWrite: false });
const headB = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.32, 0.95, 3, 0.06), headM); headB.position.y = HEAD_Y + 0.17; eng.add(headB);
const portIn = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(-1.15, HEAD_Y + 0.55, 0), V3(-0.6, HEAD_Y + 0.4, 0), V3(-0.22, HEAD_Y + 0.12, 0)]), 30, 0.09, 12), headM); eng.add(portIn);
const portEx = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0.22, HEAD_Y + 0.12, 0), V3(0.6, HEAD_Y + 0.4, 0), V3(1.15, HEAD_Y + 0.5, 0)]), 30, 0.09, 12), headM); eng.add(portEx);
function valve(x) { const g = new THREE.Group(); const stem = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 8), metal); stem.position.y = 0.22; g.add(stem);
  const disc = mesh(new THREE.CylinderGeometry(0.11, 0.05, 0.04, 20), metal); g.add(disc); g.position.set(x, HEAD_Y + 0.01, 0); g.rotation.z = -Math.sign(x) * 0.25; eng.add(g); return g; }
const vIn = valve(-0.2), vEx = valve(0.2);
const plug = new THREE.Group(); { const cer = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 16), std(0xf3f0ea, 0.3)); cer.position.y = 0.32; plug.add(cer);
  const hex = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 6), metal); hex.position.y = 0.14; plug.add(hex);
  const tip = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), metal); tip.position.y = 0.02; plug.add(tip); plug.position.set(0, HEAD_Y, 0); eng.add(plug); }
const injector = new THREE.Group(); { const body = mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.34, 16), std(0x2b2f36, 0.35, 0.6)); body.position.y = 0.17; injector.add(body);
  const top = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 16), std(0x1f6fd1, 0.4)); top.position.y = 0.36; injector.add(top); }
eng.add(injector);
const piston = new THREE.Group(); { const p = mesh(new THREE.CylinderGeometry(0.42, 0.42, PIST_H, 48), metal); p.position.y = PIST_H / 2; piston.add(p);
  for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.421, 0.008, 6, 48), dark); r.rotation.x = Math.PI / 2; r.position.y = PIST_H - 0.06 - k * 0.05; piston.add(r); } }
eng.add(piston);
const rod = mesh(new RoundedBoxGeometry(0.1, 1, 0.08, 2, 0.03), dark); eng.add(rod);
const crank = new THREE.Group(); { for (const z of [-0.12, 0.12]) { const web = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40, 1, false, -0.9, 1.8 + Math.PI), std(0x7d8794, 0.35, 0.8)); web.rotation.x = Math.PI / 2; web.rotation.y = 0; web.position.z = z; crank.add(web); }
  const pin = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 16), metal); pin.rotation.x = Math.PI / 2; pin.position.set(0, CR, 0); crank.add(pin);
  const shaft = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.2, 16), metal); shaft.rotation.x = Math.PI / 2; crank.add(shaft); }
eng.add(crank);
const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1, 40), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); eng.add(gas);
const flame = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffc04d, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })); eng.add(flame);
const spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0 })); spark.position.set(0, HEAD_Y - 0.04, 0); eng.add(spark);
// drivetrain: sprocket on crank, chain, rear wheel
const drv = new THREE.Group(); eng.add(drv);
const spr1 = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), std(0x30343c, 0.4, 0.8)); spr1.rotation.x = Math.PI / 2; spr1.position.set(0, 0, 0.42); drv.add(spr1);
const rearW = wheel(0.75, 0.25); rearW.position.set(2.6, -0.1, 0.42); drv.add(rearW);
const spr2 = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 30), std(0x30343c, 0.4, 0.8)); spr2.rotation.x = Math.PI / 2; spr2.position.set(2.6, -0.1, 0.42); drv.add(spr2);
const chainPath = (() => { const a = V3(0, 0, 0.42), b = V3(2.6, -0.1, 0.42), pts = []; for (let i = 0; i <= 20; i++) { const th = Math.PI / 2 + i / 20 * Math.PI; pts.push(V3(a.x + Math.cos(th) * 0.17, a.y + Math.sin(th) * 0.17, 0.42)); }
  for (let i = 0; i <= 30; i++) { const th = -Math.PI / 2 + i / 30 * Math.PI; pts.push(V3(b.x + Math.cos(th) * 0.31, b.y + Math.sin(th) * 0.31, 0.42)); } return new THREE.CatmullRomCurve3(pts, true); })();
const links = Array.from({ length: 70 }, () => { const m = mesh(new THREE.BoxGeometry(0.05, 0.025, 0.03), std(0x8a9099, 0.35, 0.8)); drv.add(m); return m; });
// fuel bottle, drops, mist
const bottle = new THREE.Group(); studio.add(bottle);
{ const g = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.0, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false })); g.position.y = 0.5; bottle.add(g);
  const liq = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 40), new THREE.MeshPhysicalMaterial({ color: 0xf2b134, roughness: 0.1, transparent: true, opacity: 0.85, emissive: 0x3a2200 })); liq.position.y = 0.42; bottle.add(liq); bottle.userData.liq = liq;
  const neck = mesh(new THREE.CylinderGeometry(0.12, 0.3, 0.2, 30), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })); neck.position.y = 1.1; bottle.add(neck);
  const cap = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 20), std(0xd61f2b, 0.4)); cap.position.y = 1.26; bottle.add(cap);
  const lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.356, 0.356, 0.34, 40, 1, true, -0.9, 1.8), new THREE.MeshBasicMaterial({ map: ctex(512, 200, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d61f2b'; g.font = `800 92px ${FONT}`; g.textAlign = 'center'; g.fillText('1 L', w / 2, 100); g.fillStyle = '#222'; g.font = `700 56px ${FONT}`; g.fillText('PETROL', w / 2, 170); }), toneMapped: false }));
  lbl.position.y = 0.5; bottle.add(lbl); }
const bolts = Array.from({ length: 10 }, (_, i) => { const t = ctex(128, 128, g => { g.font = "100px 'Noto Color Emoji'"; g.fillText('⚡', 10, 105); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false })); studio.add(m); return m; });
const mist = Array.from({ length: 160 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.012 + (i % 3) * 0.004, 6, 5), new THREE.MeshBasicMaterial({ color: 0xf2b134, toneMapped: false, transparent: true, opacity: 0 })); studio.add(m); return m; });
const air = Array.from({ length: 60 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, toneMapped: false, transparent: true, opacity: 0 })); m.rotation.z = Math.PI / 2; studio.add(m); return m; });
const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1, 12), new THREE.MeshPhysicalMaterial({ color: 0xf2b134, roughness: 0.05, transparent: true, opacity: 0, emissive: 0x3a2200 })); studio.add(stream);

// ------------------------------------------------------------ overlays (same system as previous reels)
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
const QDEF = [['intro', '?', 'Liquid తో బండి ఎలా నడుస్తుంది?'], ['energy', '1', 'అసలు Power ఎక్కడిది?'], ['mist', '2', 'Liquid ఎందుకు Spray?'], ['strokes', '3', 'Engine లో 4 Steps'], ['crank', '4', 'చక్రాలు ఎలా తిరుగుతాయి?'], ['diesel', '5', 'Diesel Engine తేడా ఏంటి?'], ['why', '6', 'ఏ బండికి ఏ Fuel?']];
const chips = QDEF.map(([name, n, txt], i) => { const w = document.createElement('div'); w.className = 'chipw'; w.innerHTML = `<div class="chip"><span class="n">${n}</span><span class="t">${txt}</span></div>`; hud.appendChild(w);
  const nx = QDEF[i + 1] ? S[QDEF[i + 1][0]] : END + 1; return { e: w.firstChild, wrap: w, a: name === 'intro' ? Wi(5) - 0.1 : S[name] - 0.05, b: nx - 0.2 }; });
function renderChips(t) { chips.forEach(c => { const i = E.back(P(t, c.a, 0.45)), vis = P(t, c.a, 0.15) * (1 - P(t, c.b, 0.2)); c.wrap.style.visibility = vis > 0.001 ? 'visible' : 'hidden'; c.e.style.opacity = vis;
  c.e.style.transform = `translateY(${((1 - i) * -40).toFixed(1)}px) rotate(${(-1.5 + (1 - i) * 6).toFixed(2)}deg) scale(${lerp(0.75, 1, i).toFixed(3)})`; }); }
QDEF.slice(1).forEach(([n]) => sfx(S[n] - 0.08, 'whoosh', 0.5));
const caps = $('#caps');
const EMPH = { 27: '#FFE14D', 36: '#FFE14D', 37: '#FFE14D', 50: '#7DD3FC', 53: '#7DD3FC', 68: '#C4B5FD', 71: '#FF9F43', 72: '#FF9F43', 77: '#FF5A6E', 94: '#7CF29A', 99: '#7CF29A', 105: '#FFE14D', 114: '#FF5A6E', 120: '#FF5A6E', 121: '#FF5A6E', 129: '#FF9F43', 132: '#7CF29A', 134: '#7CF29A', 154: '#FFE14D' };
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

lab('engine', 'Engine 🔧', 'y'); lab('push', 'Fuel నెట్టదు ✗', 'r'); lab('burn', '🔥 మండిస్తే → Energy', 'y'); lab('kwh', '1 L Petrol ≈ 9 kWh ⚡ <span class="s">(9 Units)</span>', 'y');
lab('slow', 'Liquid → నెమ్మదిగా మండుతుంది', 'r'); lab('inj', 'Injector 💉', 'c'); lab('mist', 'పొగమంచు + గాలి ✓', 'g');
lab('s1', '1️⃣ Intake <span class="s">లోపలికి</span>', 'c'); lab('s2', '2️⃣ Compression <span class="s">నొక్కడం</span>', 'c'); lab('s3', '3️⃣ Power 💥', 'r'); lab('s4', '4️⃣ Exhaust <span class="s">పొగ బయటకి</span>');
lab('piston', 'Piston', 'y'); lab('plug', 'Spark Plug ⚡', 'y'); lab('valveIn', 'Intake Valve'); lab('valveEx', 'Exhaust Valve');
lab('crank', 'Crankshaft 🔄', 'g'); lab('chain', 'Gears + Chain ⛓️', 'g'); lab('wheel', 'చక్రం 🛞', 'g'); lab('rpm', '3000 RPM <span class="s">= సెకనుకు 25 పేలుళ్లు</span>', 'y');
lab('noplug', 'Spark Plug లేదు ✗', 'r'); lab('temp', '🌡️ 500°C+', 'r'); lab('dinj', 'Diesel Spray', 'c'); lab('self', 'తనంతట తానే మండుతుంది 🔥', 'r');
lab('bus', 'Bus • Diesel 💪', 'c'); lab('lorry', 'Lorry • Diesel 💪', 'c'); lab('tractor', 'Tractor • Diesel 💪', 'c'); lab('bike', 'Bike • Petrol ⚡', 'y'); lab('car', 'Car • Petrol ⚡', 'y');

// ------------------------------------------------------------ engine kinematics + shading
let theta = 0;
function setEngine(th, opts = {}) { // th in degrees, 0 = TDC at start of intake; 720 per cycle
  const a = th * Math.PI / 180, s = Math.sin(a), c = Math.cos(a);
  const pinY = CR * c + Math.sqrt(ROD * ROD - (CR * s) ** 2);
  piston.position.y = pinY; crank.rotation.z = -a;
  const pinPos = V3(CR * Math.sin(a), CR * Math.cos(a), 0);
  const mid = pinPos.clone().add(V3(0, pinY, 0)).multiplyScalar(0.5), len = pinPos.distanceTo(V3(0, pinY, 0));
  rod.position.copy(mid); rod.scale.y = len; rod.rotation.z = Math.atan2(pinPos.x, pinY - pinPos.y);
  const ph = ((th % 720) + 720) % 720;
  const lift = (p0, p1) => (ph > p0 && ph < p1 ? Math.sin((ph - p0) / (p1 - p0) * Math.PI) : 0);
  const li = lift(-10, 200), le = lift(520, 730); vIn.position.y = HEAD_Y + 0.01 - 0.12 * li; vEx.position.y = HEAD_Y + 0.01 - 0.12 * le;
  const top = pinY + PIST_H, h = Math.max(0.02, HEAD_Y - top); gas.scale.y = h; gas.position.y = top + h / 2;
  drv.visible = !!opts.drive;
  return { ph, top, li, le };
}
function gasShade(ph, t, mode = 'petrol', tempK = 0) {
  const g = gas.material; flame.material.opacity = 0;
  if (ph < 180) { g.color.set(0x7dd3fc); g.opacity = 0.22 + 0.25 * ph / 180; }
  else if (ph < 360) { const k = (ph - 180) / 180; g.color.setRGB(0.5 + 0.5 * k * tempK, lerp(0.83, 0.4, k * tempK), lerp(0.99, 0.2, k * tempK)); g.opacity = 0.45 + 0.3 * k; }
  else if (ph < 540) { const k = (ph - 360) / 180; g.color.setRGB(1, lerp(0.85, 0.35, k), lerp(0.4, 0.1, k)); g.opacity = lerp(0.95, 0.35, k); }
  else { g.color.set(0x8a8f99); g.opacity = lerp(0.5, 0.1, (ph - 540) / 180); }
}
function smokeFrom(origin, t, k, dir = V3(-1, 0.6, 0)) { smoke.forEach((m, i) => { const u = ((t * 0.7 + i / smoke.length) % 1); m.position.copy(origin).addScaledVector(dir, u * 1.5).add(V3(Math.sin(i * 1.7) * 0.2 * u, u * 0.8, Math.cos(i * 2.1) * 0.2 * u)); m.scale.setScalar(0.5 + u * 2.5); m.material.opacity = k * (1 - u) * 0.35; }); }

// ------------------------------------------------------------ shots
function camLook(pos, look, fov = 50) { camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look); camera.updateMatrixWorld(true); }
const hh = (t, k = 1) => V3((Math.sin(t * 0.9) * 0.012 + Math.sin(t * 2.3 + 1) * 0.006) * k, (Math.sin(t * 0.7 + 2) * 0.01 + Math.sin(t * 1.9) * 0.005) * k, 0);
function reset() {
  VEH.forEach(v => (v.visible = false)); smoke.forEach(m => (m.material.opacity = 0)); bottle.visible = false; bolts.forEach(b => (b.material.opacity = 0)); mist.forEach(m => (m.material.opacity = 0)); air.forEach(m => (m.material.opacity = 0)); stream.material.opacity = 0;
  eng.visible = false; plug.visible = true; plug.position.y = HEAD_Y; plug.scale.setScalar(1); injector.visible = true; injector.scale.setScalar(1); spark.material.opacity = 0; boom.intensity = 0; gas.material.opacity = 0; flame.material.opacity = 0; drv.visible = false;
  scene.background = new THREE.Color(0x0b1020); scene.fog = null; renderer.toneMappingExposure = 1.0; hemi.intensity = 0.8; sun.intensity = 2.2; sun.color.set(0xffffff);
}
function roadLight() { scene.background = skyTex; scene.fog = new THREE.Fog(0xcfe0f2, 40, 220); sun.position.set(20, 30, 15); sun.target.position.set(0, 0, 0); hemi.intensity = 0.9; }
function studioLight(focus = V3(EX, 1, 0)) { scene.background = new THREE.Color(0x0b1020); scene.fog = new THREE.Fog(0x0b1020, 8, 30); sun.position.set(EX + 3, 8, 6); sun.target.position.copy(focus); hemi.intensity = 0.55; sun.intensity = 2.0; }
function injectorAt(pos, rotZ) { injector.position.copy(pos); injector.rotation.set(0, 0, rotZ); }
const SH = {};
SH.intro = (t, a, b) => { roadLight();
  VEH.slice(0, 5).forEach(v => (v.visible = true));
  drive(bike, -18 + t * 7.5, 1.5); drive(car, -30 + t * 9, -1.8); drive(bus, 30 - t * 6, -2.2, Math.PI); drive(tractor, 14 - t * 3, 2.5, Math.PI); drive(lorry, -60 + t * 8, -1.8);
  bike.rotation.y = 0; smokeFrom(tractor.userData.stack.getWorldPosition(V3()), t, 0.8, V3(0.6, 1, 0));
  const dive = E.io(P(t, Wi(16), b - Wi(16) - 0.1)), bp = bike.position.clone().add(V3(0.02, 0.5, 0));
  const far = V3(-6 + t * 2.2, 2.2, 8.5), near = bp.clone().add(V3(0.2, 0.15, 0.9));
  camLook(far.lerp(near, dive).add(hh(t, 2)), V3(lerp(bike.position.x - 2, bp.x, dive), lerp(1.0, bp.y, dive), lerp(0, 0, dive)), lerp(48, 30, dive));
  showLab('engine', bike.userData.eng.getWorldPosition(V3()).add(V3(0, 0.35, 0)), Wi(17) - 0.1, b, t); };
SH.energy = (t, a, b) => { studioLight(V3(EX, 0.5, 0)); bottle.visible = true; bottle.position.set(0, -0.9, 0); bottle.rotation.y = t * 0.3;
  const burn = P(t, Wi(25), 0.6), en = P(t, Wi(27) - 0.2, 0.5); bottle.userData.liq.material.emissive.setRGB(0.25 + 0.6 * burn, 0.12 + 0.3 * burn, 0); boom.position.set(EX, 0.6, 0.6); boom.intensity = 3 * burn * (0.8 + 0.2 * Math.sin(t * 13));
  bolts.forEach((bo, i) => { const ang = i / bolts.length * Math.PI * 2 + t * 0.6, r = lerp(0.2, 1.3 + (i % 3) * 0.2, E.out(en)); bo.position.set(Math.cos(ang) * r, -0.4 + 1.0 * E.out(en) + Math.sin(t * 2 + i) * 0.1, Math.sin(ang) * r); bo.lookAt(camera.position); bo.material.opacity = en; });
  const u = E.io(P(t, a, b - a)); camLook(V3(EX + lerp(0.6, -0.4, u), lerp(0.6, 0.9, u), lerp(3.2, 3.6, u)).add(hh(t, 1.5)), V3(EX, 0.15, 0), 46);
  showLab('push', V3(EX, 1.0, 0), Wi(21), Wi(24), t); showLab('burn', V3(EX, 1.05, 0), Wi(25), Wi(31), t); showLab('kwh', V3(EX, 1.25, 0), Wi(32), b, t); };
SH.mist = (t, a, b) => { studioLight(V3(EX, 0.8, 0)); if (injector.parent !== studio) studio.add(injector); injectorAt(V3(0, 0.78, 0), 0); injector.scale.setScalar(1.6);
  const liq = t < Wi(49) - 0.1, sprayK = P(t, Wi(53) - 0.3, 0.4);
  stream.position.set(0, 0.1, 0); stream.scale.y = 1.3; stream.material.opacity = liq ? 0.85 * P(t, a, 0.3) : 0;
  mist.forEach((m, i) => { const R = rng(i * 7 + 1), u = ((t * 1.3 + R()) % 1), ang = R() * Math.PI * 2, spread = R() * 0.45; m.position.set(Math.cos(ang) * spread * u, 0.74 - u * 1.3, Math.sin(ang) * spread * u); m.material.opacity = sprayK * (1 - u * 0.6); });
  air.forEach((m, i) => { const R = rng(i * 13 + 5), u = ((t * 0.9 + R()) % 1); m.position.set(-1.4 + u * 2.8, -0.4 + R() * 0.9, (R() - 0.5) * 0.8); m.material.opacity = P(t, Wi(56) - 0.2, 0.4) * Math.sin(u * Math.PI) * 0.8; });
  const u = E.io(P(t, a, b - a)); camLook(V3(EX + lerp(0.4, 0.9, u), lerp(0.7, 0.6, u), lerp(3.3, 3.6, u)).add(hh(t)), V3(EX, 0.35, 0), 44);
  showLab('slow', V3(EX, 1.45, 0), Wi(43), Wi(49) - 0.1, t); showLab('inj', V3(EX + 0.05, 1.5, 0), Wi(50), b, t); showLab('mist', V3(EX, -0.75, 0), Wi(56), b, t); };
// crank angle keyframes for the 4 strokes, keyed to the narration
const TH = [[S.strokes - 0.2, 0], [Wi(58), 0], [Wi(64) + 0.4, 180], [Wi(65), 180], [Wi(69) + 0.3, 360], [Wi(77) - 0.05, 360], [Wi(83) + 0.3, 540], [Wi(84), 540], [Wi(89) + 0.3, 720], [S.crank, 720]];
function keyTheta(t, keys) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; if (t <= t1) return lerp(v0, v1, E.io(clamp((t - t0) / Math.max(0.001, t1 - t0)))); } return keys[keys.length - 1][1]; }
SH.strokes = (t, a, b) => { studioLight(); eng.visible = true; injector.parent !== eng && eng.add(injector); injectorAt(V3(-0.55, HEAD_Y + 0.38, 0.0), 0.9);
  const th = keyTheta(t, TH), st = setEngine(th); gasShade(st.ph, t);
  // spark + flame kernel between "నిప్పు రవ్వ" and "పేలుడు"
  const sp = t > Wi(73) - 0.1 && t < Wi(77) + 0.2; spark.material.opacity = sp ? 0.6 + 0.4 * Math.sin(t * 60) : 0;
  const fk = P(t, Wi(74), Wi(77) - Wi(74)); if (t > Wi(74) && t < Wi(77) + 0.6) { flame.material.opacity = 0.9 * (1 - P(t, Wi(77), 0.6)); flame.scale.setScalar(lerp(0.03, 0.42, E.out(fk))); flame.position.set(0, HEAD_Y - 0.1, 0); }
  boom.position.set(EX, HEAD_Y, 0.5); boom.intensity = 5 * pulse(t, Wi(77) - 0.05, 0.7) + 1.5 * fk * (t < Wi(77) ? 1 : 0);
  if (st.ph < 180 && st.li > 0.1) mist.forEach((m, i) => { const R = rng(i + 3), u = ((t * 1.6 + R()) % 1); m.position.set(EX - 0.55 + u * 0.4, HEAD_Y + 0.3 - u * 0.5, (R() - 0.5) * 0.15); m.material.opacity = (1 - u) * 0.9; });
  if (st.le > 0.1) smokeFrom(V3(EX + 0.3, HEAD_Y + 0.25, 0), t, st.le, V3(1, 0.4, 0));
  const shake = 0.03 * pulse(t, Wi(77) - 0.05, 0.4); const u = E.io(P(t, a, b - a));
  camLook(V3(EX + lerp(1.2, 0.6, u) + shake * Math.sin(t * 80), lerp(1.7, 1.5, u), lerp(3.3, 3.0, u)).add(hh(t)), V3(EX, 1.15, 0), 46);
  showLab('s1', V3(EX - 0.9, 2.55, 0), Wi(58), Wi(65), t); showLab('s2', V3(EX - 0.6, 2.55, 0), Wi(65), Wi(71), t); showLab('s3', V3(EX, 2.55, 0), Wi(76), Wi(84), t); showLab('s4', V3(EX + 0.6, 2.55, 0), Wi(84), b, t);
  showLab('piston', V3(EX + 0.75, st.top - 0.1, 0), Wi(58), Wi(64), t); showLab('plug', V3(EX + 0.35, HEAD_Y + 0.62, 0), Wi(71), Wi(76), t);
  showLab('valveIn', V3(EX - 0.85, HEAD_Y + 0.1, 0), Wi(61), Wi(65), t); showLab('valveEx', V3(EX + 0.85, HEAD_Y + 0.1, 0), Wi(86), b, t); };
SH.crank = (t, a, b) => { studioLight(V3(EX + 1.2, 0.3, 0)); eng.visible = true; injector.parent !== eng && eng.add(injector); injectorAt(V3(-0.55, HEAD_Y + 0.38, 0.0), 0.9);
  const tt = t - a, rpmK = P(t, Wi(103), 1.5); theta = 720 + tt * 360 * (0.5 + 0.8 * tt) + rpmK * tt * 3000; const st = setEngine(theta, { drive: true }); gasShade(st.ph, t);
  if (st.ph > 360 && st.ph < 420) { boom.position.set(EX, HEAD_Y, 0.5); boom.intensity = 3; }
  const ang = theta * Math.PI / 180; spr1.rotation.y = ang; spr2.rotation.y = ang * 0.53; rearW.rotation.z = -ang * 0.53;
  links.forEach((l, i) => { const u = ((i / links.length) + ang * 0.17 / chainPath.getLength()) % 1; l.position.copy(chainPath.getPointAt(u)); const tg = chainPath.getTangentAt(u); l.rotation.z = Math.atan2(tg.y, tg.x); });
  const u = E.io(P(t, a, 3)); camLook(V3(EX + lerp(0.8, 1.5, u), lerp(1.4, 1.7, u), lerp(3.0, 9.0, u)).add(hh(t)), V3(EX + lerp(0, 1.4, u), lerp(1.0, 0.7, u), 0.2), 46);
  showLab('crank', V3(EX - 0.2, -0.55, 0.4), Wi(94) - 0.1, b, t); showLab('chain', V3(EX + 1.3, 0.25, 0.42), Wi(98), b, t); showLab('wheel', V3(EX + 2.6, 0.85, 0.42), Wi(101), b, t); showLab('rpm', V3(EX + 0.8, 2.6, 0), Wi(104), b, t); };
const THD = [[S.diesel - 0.2, 0], [Wi(110), 0], [Wi(114), 180], [Wi(115), 180], [Wi(123) + 0.2, 360], [Wi(128) - 0.05, 360], [Wi(129) + 0.6, 540], [S.why, 600]];
SH.diesel = (t, a, b) => { studioLight(); eng.visible = true; injector.parent !== eng && eng.add(injector); injectorAt(V3(0, HEAD_Y + 0.02, 0), 0);
  const plugOut = P(t, Wi(112), 0.6); plug.visible = plugOut < 1; plug.position.y = HEAD_Y + plugOut * 1.5; plug.scale.setScalar(1 - plugOut * 0.5);
  const th = keyTheta(t, THD), st = setEngine(th); const heat = P(t, Wi(116), Wi(123) - Wi(116)); gasShade(st.ph, t, 'diesel', heat);
  glassM.color.setRGB(0.81 + 0.19 * heat, lerp(0.91, 0.5, heat), lerp(1, 0.4, heat));
  const spray = t > Wi(125) - 0.1 && t < Wi(128); if (spray) mist.forEach((m, i) => { const R = rng(i * 5 + 2), u = ((t * 2 + R()) % 1), ang = R() * 6.28, sp = R() * 0.3; m.position.set(EX + Math.cos(ang) * sp * u, HEAD_Y - 0.02 - u * 0.12, Math.sin(ang) * sp * u); m.material.color.set(0xd9c27a); m.material.opacity = 1 - u; });
  if (t > Wi(128) - 0.05 && t < Wi(129) + 0.9) { const k = P(t, Wi(128) - 0.05, 0.25); flame.material.opacity = 0.9 * (1 - P(t, Wi(129), 0.9)); flame.scale.setScalar(lerp(0.1, 0.45, k)); flame.position.set(0, HEAD_Y - 0.1, 0); }
  boom.position.set(EX, HEAD_Y, 0.5); boom.intensity = 6 * pulse(t, Wi(128) - 0.05, 0.8) + 2 * heat * (t < Wi(128) ? 1 : 0);
  const u = E.io(P(t, a, b - a)); camLook(V3(EX + lerp(-1.0, -0.5, u) + 0.03 * pulse(t, Wi(128), 0.4) * Math.sin(t * 80), lerp(1.8, 1.6, u), lerp(3.2, 2.9, u)).add(hh(t)), V3(EX, 1.2, 0), 46);
  showLab('noplug', V3(EX, HEAD_Y + 1.0, 0), Wi(112), Wi(116), t); showLab('temp', V3(EX + 0.75, HEAD_Y - 0.25, 0), Wi(119), b, t);
  showLab('dinj', V3(EX - 0.6, HEAD_Y + 0.55, 0), Wi(125), Wi(128), t); showLab('self', V3(EX, HEAD_Y + 0.7, 0), Wi(128), b, t);
  LBL.temp.e.innerHTML = `🌡️ ${Math.round(lerp(30, 520, heat))}°C${heat > 0.95 ? '+' : ''}`; LBL.temp.w = 0; };
SH.why = (t, a, b) => { roadLight(); const tt = t - a; [bus, lorry, tractor, bike, car].forEach(v => (v.visible = true));
  drive(bus, -26 + tt * 6, -2.0); drive(lorry, -44 + tt * 6.5, -2.0); drive(tractor, -12 + tt * 3.2, 2.2); drive(bike, -40 + tt * 7.5, 1.6); drive(car, -56 + tt * 9, 1.8);
  smokeFrom(tractor.userData.stack.getWorldPosition(V3()), t, 0.8, V3(-0.6, 1, 0));
  const focusX = lerp(-6, 6, E.io(P(t, Wi(136), Wi(143) - Wi(136)))) + lerp(0, 14, E.io(P(t, Wi(143), 2.5)));
  camLook(V3(focusX + 4, 3.2, 12).add(hh(t, 2)), V3(focusX, 1.2, 0), 46);
  showLab('bus', bus.position.clone().add(V3(0, 3.7, 0)), Wi(137), Wi(143), t); showLab('lorry', lorry.position.clone().add(V3(0, 4.0, 0)), Wi(138), Wi(143), t); showLab('tractor', tractor.position.clone().add(V3(0, 3.4, 0)), Wi(139), Wi(143), t);
  showLab('bike', bike.position.clone().add(V3(0, 2.0, 0)), Wi(144), END + 1, t); showLab('car', car.position.clone().add(V3(0, 2.3, 0)), Wi(145), END + 1, t); };
const ORDER = ['intro', 'energy', 'mist', 'strokes', 'crank', 'diesel', 'why'];
// sound cues
sfx(0.0, 'engineIdle', 0.7); sfx(Wi(17) - 0.2, 'whooshS', 0.6); sfx(Wi(23), 'buzz', 0.4); sfx(Wi(25), 'ignite', 0.7); sfx(Wi(27), 'shimmer', 0.6); sfx(Wi(36), 'ding', 0.7);
sfx(Wi(43), 'pour', 0.6); sfx(Wi(53) - 0.3, 'sprayS', 0.8); sfx(Wi(56), 'whooshS', 0.4);
sfx(Wi(58), 'intake', 0.6); sfx(Wi(65), 'compress', 0.6); sfx(Wi(73), 'zap', 0.8); sfx(Wi(77) - 0.05, 'bang', 1.0); sfx(Wi(84), 'exhaustPuff', 0.7);
sfx(S.crank, 'engineRev', 0.9); sfx(Wi(112), 'popLow', 0.5); sfx(Wi(116), 'compress', 0.6); sfx(Wi(125) - 0.1, 'sprayS', 0.7); sfx(Wi(128) - 0.05, 'bang', 1.0);
sfx(S.why, 'dieselPass', 0.8); sfx(Wi(144), 'bikePass', 0.7);
window.SFX = SFX;

window.render = function (t) {
  reset(); let k = 0; for (let i = 0; i < ORDER.length; i++) if (t >= (i === 0 ? 0 : S[ORDER[i]] - 0.02)) k = i;
  const name = ORDER[k], a = k === 0 ? 0 : S[name], b = k + 1 < ORDER.length ? S[ORDER[k + 1]] : END;
  Object.values(LBL).forEach(L => (L.e.style.visibility = 'hidden'));
  glassM.color.set(0xcfe8ff); mist.forEach(m => m.material.color.set(0xf2b134));
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
  scene.traverse(o => { if (o.material && o.material.map) redraw(o.material.map); }); redraw(skyTex);
  window.render(0); return { duration: END, sfx: SFX };
};
window.__ready = true;
