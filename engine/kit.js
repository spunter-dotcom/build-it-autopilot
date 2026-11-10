// kit.js — reusable "build it" 3D kit: environment, materials, parts, effects, camera, captions.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

// ---------- deterministic noise ----------
let _seed = 1234567;
export function rand() { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; }
export function setSeed(s) { _seed = s; }
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= 0.5; } return s; }

// ---------- easing ----------
export const ease = {
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outBounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; },
  inOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  inQ: t => t * t,
};
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const prog = (t, t0, d) => clamp01((t - t0) / d);

// ---------- canvas textures ----------
function canvasTex(size, draw, repeat = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
export function woodTexture(base = [128, 86, 50]) {
  return canvasTex(256, (g, s) => {
    g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      const n = fbm(x * 0.08, 3.1, 3);
      const k = 0.75 + 0.5 * n + 0.12 * Math.sin(x * 0.9 + n * 6);
      g.fillStyle = `rgba(${base.map(v => Math.min(255, v * k) | 0)},0.9)`; g.fillRect(x, 0, 1, s);
    }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(40,25,12,${0.05 + rand() * 0.12})`; g.fillRect(rand() * s, rand() * s, 1, 2 + rand() * 40); }
  });
}
export function stoneTexture() {
  return canvasTex(256, (g, s) => {
    const img = g.createImageData(s, s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const n = fbm(x * 0.05, y * 0.05, 5), m = fbm(x * 0.3 + 9, y * 0.3, 2);
      const v = 105 + 90 * n + 25 * m; const i = (y * s + x) * 4;
      img.data[i] = v; img.data[i + 1] = v * 0.97; img.data[i + 2] = v * 0.9; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
}
export function grassTexture() {
  return canvasTex(512, (g, s) => {
    const img = g.createImageData(s, s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const n = fbm(x * 0.02, y * 0.02, 4), m = hash(x, y);
      const i = (y * s + x) * 4;
      const pt = fbm(x * 0.006 + 5, y * 0.006, 3); img.data[i] = 58 + 46 * n + 16 * m + 20 * pt; img.data[i + 1] = 96 + 44 * n + 22 * m + 6 * pt; img.data[i + 2] = 34 + 18 * n + 6 * m; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, 90);
}
function dirtTexture() {
  return canvasTex(256, (g, s) => {
    const img = g.createImageData(s, s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const n = fbm(x * 0.06, y * 0.06, 4), m = hash(x * 3, y * 7); const i = (y * s + x) * 4;
      img.data[i] = 92 + 50 * n + 20 * m; img.data[i + 1] = 66 + 36 * n + 14 * m; img.data[i + 2] = 40 + 20 * n; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
}
function softDot(color) {
  return canvasTex(64, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, color.replace('A', '0.85')); gr.addColorStop(0.5, color.replace('A', '0.35')); gr.addColorStop(1, color.replace('A', '0'));
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  });
}

// ---------- world ----------
export class World {
  constructor(canvas, W, H, opts = {}) {
    this.W = W; this.H = H; this.grassCount = opts.grassCount ?? 14000; this.grassExclude = opts.grassExclude; this.opts = opts;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: opts.aa ?? true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    r.setPixelRatio(1); r.setSize(W, H, false);
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.55;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xcfe0ec, 90, 420);
    this.camera = new THREE.PerspectiveCamera(42, W / H, 0.05, 6000);
    this.uTime = { value: 0 };
    this.mats = {};
    this.tickers = []; this.events = [];
    this._buildSky(); this._buildGround(); this._buildHills(); this._buildTrees(); this._buildMats();
  }
  _buildSky() {
    const sky = new Sky(); sky.scale.setScalar(5000);
    const u = sky.material.uniforms; u.turbidity.value = 3.5; u.rayleigh.value = 1.1; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.82;
    this.sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 38), THREE.MathUtils.degToRad(215));
    u.sunPosition.value.copy(this.sunDir);
    if (this.opts.skyMesh) this.scene.add(sky);
    // environment lighting from the sky
    const pm = new THREE.PMREMGenerator(this.renderer); const envScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(5000);
    Object.assign(sky2.material.uniforms.sunPosition.value, this.sunDir); for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) sky2.material.uniforms[k].value = u[k].value;
    envScene.add(sky2); const envTex = pm.fromScene(envScene, 0, 0.1, 6000).texture; this.scene.environment = envTex; this.scene.environmentIntensity = 0.55;
    if (!this.opts.skyMesh) { this.scene.background = envTex; this.scene.backgroundBlurriness = 0; this.scene.backgroundIntensity = 1.0; }
    const sun = this.sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
    sun.position.copy(this.sunDir).multiplyScalar(60); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -14; sc.right = sc.top = 14; sc.near = 1; sc.far = 160;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025; sun.shadow.radius = 3;
    this.scene.add(sun, sun.target);
    this.scene.add(new THREE.HemisphereLight(0xd6ecff, 0x3d5a22, 0.55));
  }
  _buildGround() {
    const tex = grassTexture(); let geo;
    if (this.opts.groundHole) {
      const sh = new THREE.Shape(); sh.moveTo(-350, -350); sh.lineTo(350, -350); sh.lineTo(350, 350); sh.lineTo(-350, 350); sh.lineTo(-350, -350);
      const h = new THREE.Path(); h.absarc(0, 0, this.opts.groundHole, 0, Math.PI * 2, true); sh.holes.push(h);
      geo = new THREE.ShapeGeometry(sh, 48); tex.repeat.set(1 / 7.5, 1 / 7.5);
    } else geo = new THREE.PlaneGeometry(700, 700);
    const g = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    g.rotation.x = -Math.PI / 2; g.receiveShadow = true; g.castShadow = !!this.opts.groundHole; this.scene.add(g); this.ground = g;
    // grass blades
    const blade = new THREE.BufferGeometry();
    const p = [-0.012, 0, 0, 0.012, 0, 0, -0.008, 0.11, 0, 0.008, 0.11, 0, 0, 0.22, 0];
    blade.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); blade.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]); blade.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9 });
    const uTime = this.uTime;
    mat.onBeforeCompile = sh => {
      sh.uniforms.uTime = uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
         float hgt = position.y;
         vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
         float sway = sin(uTime*1.7 + wp.x*0.45 + wp.z*0.3) * 0.08 + sin(uTime*3.1 + wp.x*1.3) * 0.025;
         transformed.x += sway * hgt * 1.2; transformed.z += sway * hgt * 0.6;`);
    };
    this.grassMat = mat;
    const N = this.grassCount;
    const inst = this.grass = new THREE.InstancedMesh(blade, mat, N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3(), e = new THREE.Euler(), col = new THREE.Color();
    let i = 0;
    while (i < N) {
      const r = Math.sqrt(rand()) * 11, a = rand() * Math.PI * 2; const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (this.grassExclude && this.grassExclude(x, z)) continue;
      e.set((rand() - 0.5) * 0.5, rand() * Math.PI, (rand() - 0.5) * 0.5); q.setFromEuler(e);
      const h = 0.45 + rand() * 0.75 * (0.6 + fbm(x * 0.3, z * 0.3, 2)); s.set(1, h, 1); pos.set(x, 0, z);
      m4.compose(pos, q, s); inst.setMatrixAt(i, m4);
      const n = fbm(x * 0.2 + 50, z * 0.2, 3); col.setRGB(0.22 + 0.25 * n + rand() * 0.08, 0.42 + 0.25 * n + rand() * 0.1, 0.1 + 0.08 * n);
      inst.setColorAt(i, col); i++;
    }
    inst.receiveShadow = true; this.scene.add(inst);
  }
  _buildHills() {
    const geo = new THREE.PlaneGeometry(1800, 1800, 220, 220); geo.rotateX(-Math.PI / 2);
    const P = geo.attributes.position, colors = [];
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), z = P.getZ(i), r = Math.hypot(x, z);
      const k = THREE.MathUtils.smoothstep(r, 110, 420);
      const h = k * (18 + 70 * fbm(x * 0.006, z * 0.006, 5) + 120 * Math.pow(fbm(x * 0.0025 + 7, z * 0.0025, 3), 3) * THREE.MathUtils.smoothstep(r, 400, 800));
      P.setY(i, h - 0.4 - 40 * (1 - THREE.MathUtils.smoothstep(r, 60, 108))); // sink the hidden centre so it never shows through holes
      const n = fbm(x * 0.02, z * 0.02, 3), rock = THREE.MathUtils.smoothstep(h, 60, 120);
      const c = new THREE.Color().setRGB(0.26 + 0.18 * n, 0.42 + 0.2 * n, 0.16 + 0.06 * n).lerp(new THREE.Color(0.48, 0.46, 0.42), rock);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals();
    const hills = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    hills.receiveShadow = false; this.scene.add(hills);
  }
  _buildTrees() {
    const N = 340;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 }), N);
    const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), N);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
    let i = 0;
    while (i < N) {
      const r = 75 + rand() * 260, a = rand() * Math.PI * 2; const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (fbm(x * 0.01 + 3, z * 0.01, 3) < 0.48) continue; // clusters
      const sc = 0.9 + rand() * 0.9;
      m.compose(p.set(x, 1.1 * sc, z), q.identity(), s.set(sc, sc, sc)); trunk.setMatrixAt(i, m);
      m.compose(p.set(x, 3.2 * sc, z), q.setFromEuler(new THREE.Euler(0, rand() * 6, 0)), s.set(sc * (0.9 + rand() * 0.3), sc * (1.1 + rand() * 0.4), sc)); crown.setMatrixAt(i, m);
      crown.setColorAt(i, c.setRGB(0.12 + rand() * 0.08, 0.28 + rand() * 0.12, 0.08)); i++;
    }
    trunk.castShadow = crown.castShadow = false; this.scene.add(trunk, crown);
  }
  _buildMats() {
    const M = this.mats;
    M.wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.85 });
    M.darkWood = new THREE.MeshStandardMaterial({ map: woodTexture([92, 60, 36]), roughness: 0.9 });
    M.stone = new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.95 });
    M.dirt = new THREE.MeshStandardMaterial({ map: dirtTexture(), roughness: 1 });
    M.rope = new THREE.MeshStandardMaterial({ color: 0xb59a6a, roughness: 1 });
    M.iron = new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.55, metalness: 0.6 });
    M.water = new THREE.MeshStandardMaterial({ color: 0x2c5e7a, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.92 });
    M.cloth = new THREE.MeshStandardMaterial({ color: 0xa4462f, roughness: 0.9 });
    M.skin = new THREE.MeshStandardMaterial({ color: 0xe0ac86, roughness: 0.7 });
    M.thatch = new THREE.MeshStandardMaterial({ map: woodTexture([150, 118, 64]), roughness: 1 });
  }
  sfx(t, type, gain = 1) { this.events.push({ t: +t.toFixed(3), type, gain: +gain.toFixed(2) }); }
  add(o) { o.traverse?.(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); this.scene.add(o); return o; }
  setCam(pos, target, fov) { this.camera.position.copy(pos); this.camera.lookAt(target); if (fov) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); } }
  render(t) { this.uTime.value = t; for (const f of this.tickers) f(t); this.renderer.render(this.scene, this.camera); }
}

// ---------- parts ----------
export function beam(len, w, h, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), mat); return m; }
export function post(height, r, mat) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r, height, 10), mat); m.geometry.translate(0, height / 2, 0); return m; }
export function log(len, r, mat) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 14), mat); m.rotation.z = Math.PI / 2; return m; }
export function stoneBlock(w, h, d, mat) {
  const g = new THREE.BoxGeometry(w, h, d, 6, 4, 6); const P = g.attributes.position, v = new THREE.Vector3(), inner = new THREE.Vector3();
  const r = Math.min(w, h, d) * 0.32, hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r, j = Math.min(w, h, d) * 0.05;
  for (let i = 0; i < P.count; i++) {
    v.fromBufferAttribute(P, i); inner.set(THREE.MathUtils.clamp(v.x, -hw, hw), THREE.MathUtils.clamp(v.y, -hh, hh), THREE.MathUtils.clamp(v.z, -hd, hd));
    v.sub(inner).normalize().multiplyScalar(r).add(inner); v.x += (rand() - 0.5) * j; v.y += (rand() - 0.5) * j; v.z += (rand() - 0.5) * j; P.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return new THREE.Mesh(g, mat);
}
export function gear(rOuter, teeth, thick, mat) {
  const sh = new THREE.Shape(); const rIn = rOuter * 0.82;
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2, a1 = ((i + 0.55) / teeth) * Math.PI * 2, a2 = ((i + 1) / teeth) * Math.PI * 2;
    // ratchet tooth: steep face + slope
    const p0 = [Math.cos(a0) * rIn, Math.sin(a0) * rIn], p1 = [Math.cos(a0) * rOuter, Math.sin(a0) * rOuter], p2 = [Math.cos(a1) * rIn, Math.sin(a1) * rIn];
    if (i === 0) sh.moveTo(...p0); else sh.lineTo(...p0);
    sh.lineTo(...p1); sh.lineTo(...p2); sh.lineTo(Math.cos(a2) * rIn, Math.sin(a2) * rIn);
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, rOuter * 0.25, 0, Math.PI * 2, true); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  g.translate(0, 0, -thick / 2); return new THREE.Mesh(g, mat);
}
export function bucket(mats) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 14, 1, true), mats.wood); body.material = mats.wood.clone(); body.material.side = THREE.DoubleSide;
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.16, 14), mats.wood); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -0.16;
  for (const y of [-0.1, 0.1]) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.18 + y * 0.12 + 0.01, 0.012, 6, 20), mats.iron); band.rotation.x = Math.PI / 2; band.position.y = y; grp.add(band); }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.01, 6, 20, Math.PI), mats.iron); handle.position.y = 0.17;
  grp.add(body, bottom, handle); return grp;
}
export function person(mats, tunic = 0x7a3b2a) {
  const g = new THREE.Group(); const cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 });
  const legs = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.7, 10), cloth); body.position.y = 1.02;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), mats.skin); head.position.y = 1.55;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 1 })); hair.position.y = 1.57;
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.68, 8), legs); leg.position.set(0.09 * s, 0.34, 0); g.add(leg);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.6, 8), cloth); arm.position.set(0.25 * s, 1.07, 0); arm.rotation.z = 0.12 * s; g.add(arm); g['arm' + (s > 0 ? 'R' : 'L')] = arm;
  }
  g.add(body, head, hair); return g;
}

// ---------- effects ----------
export class Dust {
  constructor(world, n = 80, color = 'rgba(170,150,120,A)') {
    this.w = world; this.pool = []; this.events = [];
    const tex = softDot(color);
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; world.scene.add(s); this.pool.push(s); }
    world.tickers.push(t => this.update(t));
  }
  puff(t, pos, size = 1, count = 10) { this.events.push({ t, pos: pos.clone(), size, count, seeds: Array.from({ length: count }, () => [rand(), rand(), rand()]) }); }
  update(t) {
    let k = 0; for (const s of this.pool) s.visible = false;
    for (const e of this.events) {
      const a = (t - e.t) / 0.9; if (a < 0 || a > 1) continue;
      for (let i = 0; i < e.count && k < this.pool.length; i++, k++) {
        const [r1, r2, r3] = e.seeds[i], s = this.pool[k], ang = r1 * Math.PI * 2, rad = (0.3 + r2 * 0.9) * e.size * ease.out(a);
        s.visible = true; s.position.set(e.pos.x + Math.cos(ang) * rad, e.pos.y + 0.1 + a * 0.35 * e.size * (0.5 + r3), e.pos.z + Math.sin(ang) * rad);
        const sc = e.size * (0.35 + 0.9 * ease.out(a)) * (0.7 + r3 * 0.6); s.scale.set(sc, sc, sc); s.material.opacity = 0.55 * (1 - a);
      }
    }
  }
}

// ---------- captions overlay ----------
export class Overlay {
  constructor(W, H) { this.c = document.createElement('canvas'); this.c.width = W; this.c.height = H; this.g = this.c.getContext('2d'); this.W = W; this.H = H; }
  compose(glCanvas, t, words, labels, opts = {}) {
    const g = this.g, W = this.W, H = this.H; g.drawImage(glCanvas, 0, 0);
    if (opts.aiTag !== false) { g.save(); g.font = `800 ${Math.round(W * 0.03)}px Cap`; g.textAlign = 'left'; g.textBaseline = 'top';
      g.fillStyle = 'rgba(0,0,0,0.35)'; const tw = g.measureText('AI-generated').width; g.beginPath(); g.roundRect(W * 0.035, H * 0.035, tw + W * 0.04, W * 0.055, W * 0.02); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText('AI-generated', W * 0.055, H * 0.035 + W * 0.012); g.restore(); }
    // label (new term)
    const L = labels.find(l => t >= l.t0 && t < l.t1);
    if (L) {
      const a = clamp01((t - L.t0) / 0.18), s = 0.6 + 0.4 * ease.outBack(a);
      g.save(); g.translate(W / 2, H * 0.43); g.scale(s, s); g.globalAlpha = a;
      g.font = `900 ${Math.round(W * 0.065)}px Cap`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = W * 0.016; g.strokeStyle = 'rgba(20,16,12,0.95)'; g.lineJoin = 'round'; g.strokeText(L.text, 0, 0);
      g.fillStyle = '#ffd23f'; g.fillText(L.text, 0, 0); g.restore();
    }
    // word
    const w = words.find(x => t >= x.t0 && t < x.t1);
    if (w) {
      const a = clamp01((t - w.t0) / 0.09), s = 0.82 + 0.18 * ease.outBack(a);
      g.save(); g.translate(W / 2, H * 0.52); g.scale(s, s);
      g.font = `900 ${Math.round(W * 0.115)}px Cap`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = W * 0.02; g.shadowOffsetY = W * 0.006;
      g.lineWidth = W * 0.024; g.strokeStyle = 'rgba(18,14,10,1)'; g.lineJoin = 'round'; g.strokeText(w.w, 0, 0);
      g.shadowColor = 'transparent'; g.fillStyle = '#ffffff'; g.fillText(w.w, 0, 0); g.restore();
    }
    return this.c;
  }
}
