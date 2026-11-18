/* =====================================================================
   ORGO hero: floating boxes (three.js). Renders into #heroPhoto, behind the
   floating pouches and the headline. Tweak the CONFIG block below.
   Textures: assets/boxes/{Flavor}_{12|24}_{face}.jpg
   ===================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const stageEl = document.getElementById('heroPhoto');
if (stageEl) {

/* ================= settings you can tweak ================= */
const CONFIG = {
  textureFolder: 'assets/boxes/',   // where the face images live (relative to this file)
  fill: 0.2,                    // how much of the screen the boxes cover (0.25 = small, 0.5 = very big)
  // the boxes float inside a diagonal lane, from the top-right corner (near the cart)
  // down to just left of centre. Points are fractions of the screen: x -1 = left, 1 = right;
  // y 1 = top, -1 = bottom. width = lane half-width as a fraction of the screen height.
  lane: { from: [0.74, 1.0], to: [0.08, -1.0], width: 0.34, flowSpeed: 1.25 },        // desktop; flowSpeed = drift along the lane
  laneMobile: { from: [0.6, 1.0], to: [-0.4, -0.12], width: 0.3, flowSpeed: 0.9 },  // phones (tall screens)
  speed: 0.06,                  // drift speed, as a fraction of the screen height per second
  spin: 0.35,                   // average spin speed (radians per second)
  bounce: 0.15,                 // 1 = perfectly bouncy, 0.5 = soft (low = boxes nudge, not bounce)
  background: null,             // null = transparent (shows your site behind); or e.g. '#ffffff'
  pushOnHover: true,            // the cursor gently nudges boxes away; boxes can also be dragged & thrown
  overflow: 0.18,               // how far boxes may drift past the edge (0 = stay inside, 0.5 = half a screen out)
  flow: 0.5,                    // strength of the slow currents that carry the boxes around
};

/* ================= the 10 boxes (5 flavors x 2 sizes), sizes in mm ================= */
const FLAVORS = ['Blood_Orange', 'Blue_Pomegranate', 'Lemonade', 'Wild_Berries', 'Variety'];
const SIZES = { '12': { w: 75, h: 155.5, d: 125 }, '24': { w: 153, h: 155.5, d: 124.4 } };
const BOXES = [];
for (const f of FLAVORS) for (const s of ['12', '24']) BOXES.push({ id: `${f}_${s}`, ...SIZES[s] });

/* ================= renderer / scene ================= */
const stage = stageEl, hero = document.getElementById('hero') || stage;
stage.classList.add('has-boxes');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;               // keep brand colours exact
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
if (CONFIG.background) scene.background = new THREE.Color(CONFIG.background);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
scene.add(new THREE.HemisphereLight(0xffffff, 0xdddddd, 1.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.4); keyLight.position.set(-1, 1.4, 1.6); scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.6); fillLight.position.set(1.5, 0.3, 1); scene.add(fillLight);

const camera = new THREE.PerspectiveCamera(30, 1, 10, 20000);
camera.position.set(0, 0, 2600);

/* ================= textures & meshes ================= */
const loader = new THREE.TextureLoader();
const maxAniso = renderer.capabilities.getMaxAnisotropy();
let pending = BOXES.length * 6;
const onTex = () => { if (--pending <= 0) stage.classList.add('boxes-ready'); };
function tex(name) {
  const t = loader.load(CONFIG.textureFolder + name, onTex, undefined, onTex);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
  return t;
}
function boxMaterials(id) {
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z  ->  right, left, top, bottom, front, back
  return ['right', 'left', 'top', 'bottom', 'front', 'back'].map(face => {
    const map = tex(`${id}_${face}.jpg`);
    return new THREE.MeshPhysicalMaterial({
      map, emissiveMap: map, emissive: 0xffffff, emissiveIntensity: 0.22,      // keeps the print bright
      roughness: 0.32, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.12, // glossy coated card
    });
  });
}

const rand = (a, b) => a + Math.random() * (b - a);
const bodies = BOXES.map(b => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), boxMaterials(b.id));
  mesh.quaternion.setFromEuler(new THREE.Euler(rand(-0.5, 0.5), rand(0, Math.PI * 2), rand(-0.3, 0.3)));
  scene.add(mesh);
  return {
    mesh,
    half0: new THREE.Vector3(b.w / 2, b.h / 2, b.d / 2),      // half size at scale 1
    half: new THREE.Vector3(),                                  // half size on screen
    area: (b.w * b.h + b.w * b.d + b.h * b.d) / 3,
    invM: 1 / (b.w * b.h * b.d),
    v: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-0.3, 0.3)).normalize().multiplyScalar(rand(0.7, 1.3)),
    w: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(CONFIG.spin * rand(0.6, 1.4)),
    ax: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
    rs: 0,
    phase: rand(0, Math.PI * 2),
    pace: rand(0.94, 1.06),
  };
});

/* ================= size & bounds follow the viewport ================= */
const bounds = new THREE.Vector3();
let speedPx = 1;   // world units per second for CONFIG.speed
function resize() {
  const w = stage.clientWidth || window.innerWidth, h = stage.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  bounds.set(halfH * camera.aspect * 0.97, halfH * 0.95, 60);   // a thin slab, so boxes meet instead of passing behind each other
  const total = bodies.reduce((a, b) => a + b.area, 0);
  const sc = Math.sqrt(CONFIG.fill * 4 * bounds.x * bounds.y / total);
  for (const b of bodies) { b.mesh.scale.setScalar(sc); b.half.copy(b.half0).multiplyScalar(sc); b.rs = b.half.length(); }
  speedPx = CONFIG.speed * 2 * halfH;
}
window.addEventListener('resize', resize);
new ResizeObserver(resize).observe(stage);
resize();

// the lane in world units (recomputed from the viewport each frame)
const L = () => (camera.aspect < 0.8 ? CONFIG.laneMobile : CONFIG.lane);
const laneA = new THREE.Vector3(), laneB = new THREE.Vector3(), laneP = new THREE.Vector3(), laneD = new THREE.Vector3();
function laneClosest(p) {                     // nearest point on the lane's centre line
  laneA.set(L().from[0] * bounds.x, L().from[1] * bounds.y, 0);
  laneB.set(L().to[0] * bounds.x, L().to[1] * bounds.y, 0);
  laneD.subVectors(laneB, laneA);
  const t = THREE.MathUtils.clamp(laneP.set(p.x, p.y, 0).sub(laneA).dot(laneD) / laneD.lengthSq(), 0, 1);
  return laneP.copy(laneA).addScaledVector(laneD, t);
}
// position along the lane (0 = where it enters the screen), lane length and off-screen margin
function laneS(p) { laneClosest(p); return tmp.set(p.x - laneA.x, p.y - laneA.y, 0).dot(laneD) / laneD.length(); }
function laneLen() { laneClosest(laneP.set(0, 0, 0)); return laneD.length(); }
function laneMargin() { return Math.max(...bodies.map(b => b.rs)) * 1.3; }
// conveyor: a box that has floated off the bottom re-enters beyond the top-right,
// exactly one spacing behind the last box in line, so the stream never has gaps
function respawn(b) {
  const len = laneLen(), m = laneMargin(), spacing = (len + 2 * m) / bodies.length;
  let sMin = Infinity; for (const o of bodies) if (o !== b) sMin = Math.min(sMin, laneS(o.mesh.position));
  const sNew = Math.min(-m, sMin - spacing);
  laneClosest(laneP.set(0, 0, 0));
  const dir = laneD.clone().normalize(), nx = -dir.y, ny = dir.x;
  const side = rand(-0.55, 0.55) * L().width * bounds.y;
  b.mesh.position.set(laneA.x + dir.x * sNew + nx * side, laneA.y + dir.y * sNew + ny * side, 0);
  b.v.copy(dir).multiplyScalar(L().flowSpeed * b.pace);
}
// start evenly spaced along the whole loop so the stream is full from the first frame
function seedLane() {
  const len = laneLen(), m = laneMargin(), spacing = (len + 2 * m) / bodies.length;
  laneClosest(laneP.set(0, 0, 0));
  const dir = laneD.clone().normalize(), nx = -dir.y, ny = dir.x;
  bodies.forEach((b, i) => {
    const sv = -m + spacing * (i + 0.5), side = (i % 2 ? 1 : -1) * 0.3 * L().width * bounds.y;
    b.mesh.position.set(laneA.x + dir.x * sv + nx * side, laneA.y + dir.y * sv + ny * side, 0);
    b.v.copy(dir).multiplyScalar(L().flowSpeed * b.pace);
  });
}
seedLane();

/* ================= oriented-box collision (separating axis test) ================= */
const WORLD = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
const m4 = new THREE.Matrix4();
function updateAxes(b) { m4.makeRotationFromQuaternion(b.mesh.quaternion); m4.extractBasis(b.ax[0], b.ax[1], b.ax[2]); }
function extent(b, n) {   // half-length of box b along direction n
  return b.half.x * Math.abs(b.ax[0].dot(n)) + b.half.y * Math.abs(b.ax[1].dot(n)) + b.half.z * Math.abs(b.ax[2].dot(n));
}
const _d = new THREE.Vector3(), _ax = new THREE.Vector3(), _c = new THREE.Vector3(), hitN = new THREE.Vector3();
function collide(A, B) {   // penetration depth (hitN points A->B), or -1 if not touching
  _d.subVectors(B.mesh.position, A.mesh.position);
  if (_d.length() > A.rs + B.rs) return -1;
  let best = Infinity;
  const test = ax => {
    const len = ax.length(); if (len < 1e-6) return true;
    _ax.copy(ax).divideScalar(len);
    const o = extent(A, _ax) + extent(B, _ax) - Math.abs(_d.dot(_ax));
    if (o <= 0) return false;
    if (o < best) { best = o; hitN.copy(_ax); if (_d.dot(hitN) < 0) hitN.negate(); }
    return true;
  };
  for (let i = 0; i < 3; i++) if (!test(A.ax[i]) || !test(B.ax[i])) return -1;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (!test(_c.crossVectors(A.ax[i], B.ax[j]))) return -1;
  return best;
}
function corner(b, n, out) {   // the corner of b furthest along n
  out.copy(b.mesh.position);
  for (let k = 0; k < 3; k++) out.addScaledVector(b.ax[k], (b.ax[k].dot(n) >= 0 ? 1 : -1) * b.half.getComponent(k));
  return out;
}

/* ================= pointer: hover nudges, drag & throw ================= */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let hoverPoint = null, grabbed = null;
const grabOffset = new THREE.Vector3(), lastGrab = new THREE.Vector3(), grabVel = new THREE.Vector3();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
function pointerWorld(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const p = new THREE.Vector3(); ray.ray.intersectPlane(plane, p); return p;
}
hero.addEventListener('pointermove', e => {
  hoverPoint = pointerWorld(e);
  if (grabbed) {
    const p = pointerWorld(e).add(grabOffset);
    grabVel.subVectors(p, lastGrab).multiplyScalar(60); lastGrab.copy(p);
    grabbed.mesh.position.x = p.x; grabbed.mesh.position.y = p.y;
  }
});
hero.addEventListener('pointerleave', () => { hoverPoint = null; });
hero.addEventListener('pointerdown', e => {
  if (e.button || e.target.closest('a, button, input, .hero-copy, .pouch, .fp')) return;
  pointerWorld(e);
  const hit = ray.intersectObjects(bodies.map(b => b.mesh))[0];
  if (!hit) return;
  grabbed = bodies.find(b => b.mesh === hit.object);
  plane.constant = -grabbed.mesh.position.z;
  const p = pointerWorld(e); grabOffset.subVectors(grabbed.mesh.position, p).setZ(0); lastGrab.copy(p).add(grabOffset);
  grabVel.set(0, 0, 0);
  hero.setPointerCapture(e.pointerId); hero.classList.add('box-grabbing');
});
const release = () => {
  if (!grabbed) return;
  grabbed.v.copy(grabVel).divideScalar(speedPx).clampLength(0, 8);
  grabbed = null; plane.constant = 0; hero.classList.remove('box-grabbing');
};
hero.addEventListener('pointerup', release);
hero.addEventListener('pointercancel', release);

/* ================= simulation ================= */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tmp = new THREE.Vector3(), dq = new THREE.Quaternion(), pa = new THREE.Vector3(), pb = new THREE.Vector3(), r = new THREE.Vector3();
let clock = 0;
function step(dt) {
  clock += dt;
  // v is stored in "screen-heights per second" units (times speedPx)
  for (const b of bodies) {
    const p = b.mesh.position;
    if (b !== grabbed) {
      p.addScaledVector(b.v, dt * speedPx);
      // flow down the lane: ease toward a steady drift from the top-right toward the bottom
      laneClosest(p);                                  // refreshes laneA / laneD for this viewport
      const dir = tmp.copy(laneD).normalize();
      b.v.lerp(dir.multiplyScalar(L().flowSpeed * b.pace), Math.min(1, dt * 0.35));
      // slow, swirling currents so the motion feels like floating
      const t = clock;
      b.v.x += CONFIG.flow * dt * Math.sin(p.y / bounds.y * 2.1 + t * 0.23 + b.phase);
      b.v.y += CONFIG.flow * dt * Math.cos(p.x / bounds.x * 1.7 - t * 0.19 + b.phase * 1.3);
      // loosely held to the lane: boxes wander out of it and are drawn softly back in
      {
        const c = laneClosest(p), off = tmp.set(p.x - c.x, p.y - c.y, 0), dist = off.length(), R = L().width * bounds.y;
        if (dist > R && dist > 1e-3) b.v.addScaledVector(off.divideScalar(dist), -((dist - R) / R) * 1.6 * dt);
      }
      // once a box has floated off the bottom of the page, it re-enters from beyond the top-right
      if (laneS(p) > laneLen() + laneMargin()) respawn(b);
      if (CONFIG.pushOnHover && hoverPoint && !grabbed) {
        tmp.subVectors(p, hoverPoint).setZ(0); const d = tmp.length(), R = b.rs * 1.1;
        if (d < R && d > 0.001) b.v.addScaledVector(tmp.normalize(), (1 - d / R) * 12 * dt);
      }
    }
    const wl = b.w.length();                         // spin a little
    if (wl > 1e-5) { dq.setFromAxisAngle(tmp.copy(b.w).divideScalar(wl), wl * dt); b.mesh.quaternion.premultiply(dq); }
    b.w.multiplyScalar(1 + (CONFIG.spin / Math.max(b.w.length(), 1e-3) - 1) * Math.min(1, dt * 0.4));
    updateAxes(b);
  }
  // several passes so even crowded boxes are pushed fully apart (no cutting through)
  for (let it = 0; it < 6; it++) {
    for (const b of bodies) {                        // depth stays in a thin slab so boxes meet instead of passing behind
      const L = Math.max(0, bounds.z - extent(b, WORLD[2]));
      b.mesh.position.z = THREE.MathUtils.clamp(b.mesh.position.z, -L, L);
    }
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const A = bodies[i], B = bodies[j];
      const depth = collide(A, B); if (depth < 0) continue;
      const n = hitN, ia = A === grabbed ? 0 : A.invM, ib = B === grabbed ? 0 : B.invM;
      if (ia + ib === 0) continue;
      const push = depth + 0.5;                       // separate completely
      A.mesh.position.addScaledVector(n, -push * ia / (ia + ib));
      B.mesh.position.addScaledVector(n, push * ib / (ia + ib));
      const rel = tmp.subVectors(B.v, A.v).dot(n);
      if (rel < 0) {                                  // bounce back
        const jimp = -(1 + CONFIG.bounce) * rel / (ia + ib);
        A.v.addScaledVector(n, -jimp * ia); B.v.addScaledVector(n, jimp * ib);
        // an off-centre hit makes them tumble a little
        corner(A, n, pa); corner(B, tmp.copy(n).negate(), pb); pa.add(pb).multiplyScalar(0.5);
        const k = Math.min(0.8, Math.abs(rel) * 0.6);
        if (ia) A.w.addScaledVector(r.subVectors(pa, A.mesh.position).cross(n).normalize(), -k);
        if (ib) B.w.addScaledVector(r.subVectors(pa, B.mesh.position).cross(n).normalize(), k);
      }
    }
  }
}

/* ================= loop (pauses when off-screen or tab hidden) ================= */
let visible = true, last = performance.now();
new IntersectionObserver(es => { visible = es[0].isIntersecting; last = performance.now(); }).observe(stage);
document.addEventListener('visibilitychange', () => { last = performance.now(); });
function loop(now) {
  requestAnimationFrame(loop);
  if (!visible || document.hidden) return;
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  if (!reduceMotion) { step(dt / 2); step(dt / 2); }   // two sub-steps for solid contacts
  renderer.render(scene, camera);
}
for (const b of bodies) updateAxes(b);
requestAnimationFrame(loop);
window.__orgoBoxes = { bodies, CONFIG };
}
