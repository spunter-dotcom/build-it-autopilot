// topics/2026-11-11-syracusia.js — "You built Archimedes' giant ship" (the Syracusia). Everything is a pure function of t.
// Scale: 1 unit ~ 3 m. Hull 18 long (bow toward +x), 4.4 beam, main deck 3.0 above the keel. People ~0.33 scale.
// Ship-local coordinates: origin at mid-keel. The ship group's pose is a pure function shipPose(t).
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z]/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const smooth = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b);

  const world = new K.World(canvas, spec.w, spec.h, { grassCount: 0, aa: true });
  const M = world.mats, S = world.scene;
  const dust = new K.Dust(world, 220), spray = new K.Dust(world, 160, 'rgba(235,245,255,A)');
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);
  world.ground.visible = false;
  // trees that the default world scatters into what is now the sea: sink them
  S.traverse(o => { if (!o.isInstancedMesh || o.count !== 340) return; const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); m.decompose(p, q, s); if (p.x > -5) { p.y = -200; m.compose(p, q, s); o.setMatrixAt(i, m); } } o.instanceMatrix.needsUpdate = true; });

  // ---------- textures & materials ----------
  function tex(size, draw, rx = 1, ry = 1) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  const plankTex = tex(256, (g, s) => { for (let r = 0; r < 8; r++) { const k = 0.82 + K.rand() * 0.3; g.fillStyle = `rgb(${132 * k | 0},${88 * k | 0},${52 * k | 0})`; g.fillRect(0, r * 32, s, 32);
      for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(60,35,18,${K.rand() * 0.18})`; g.fillRect(K.rand() * s, r * 32 + K.rand() * 30, 20 + K.rand() * 60, 1.5); }
      g.fillStyle = 'rgba(40,24,12,0.9)'; g.fillRect(0, r * 32, s, 2.5); g.fillRect((K.rand() * s) | 0, r * 32, 3, 32); } });
  const plankMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.85, side: THREE.DoubleSide });
  const linenMat = new THREE.MeshStandardMaterial({ color: 0xcdb88c, roughness: 1, side: THREE.DoubleSide, map: tex(64, (g, s) => { g.fillStyle = '#ddd'; g.fillRect(0, 0, s, s); for (let i = 0; i < s; i += 4) { g.fillStyle = 'rgba(90,70,40,0.25)'; g.fillRect(i, 0, 1, s); g.fillRect(0, i, s, 1); } }) });
  const leadMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.55, side: THREE.DoubleSide, map: tex(128, (g, s) => { g.fillStyle = '#8b9096'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = 125 + K.rand() * 30; g.fillStyle = `rgb(${v},${v + 4},${v + 10})`; g.fillRect(x * 32 + 1.5 + (y % 2) * 16, y * 32 + 1.5, 29, 29); } }) });
  const bronze = new THREE.MeshStandardMaterial({ color: 0xb3793a, roughness: 0.35, metalness: 0.85 });
  const marble = new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xa8482b, roughness: 0.85 });
  const green = new THREE.MeshStandardMaterial({ color: 0x3f7a2c, roughness: 0.9, flatShading: true });
  const soil = new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 1 });
  const sand = new THREE.MeshStandardMaterial({ color: 0xd8c08e, roughness: 1 });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2f7fa0, roughness: 0.12, emissive: 0x0a2a3a });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xefe3c4, roughness: 0.95, side: THREE.DoubleSide });
  const agateTex = tex(256, (g, s) => { g.fillStyle = '#7a3a2a'; g.fillRect(0, 0, s, s); const cols = ['#c0563a', '#e2b07a', '#8f2f2a', '#f0dcc0', '#b8784a', '#6a4a7a'];
    for (let i = 0; i < 18; i++) { g.strokeStyle = cols[i % cols.length]; g.lineWidth = 6 + K.rand() * 8; g.beginPath(); g.arc(s / 2, s / 2, 10 + i * 8, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.strokeRect(i * 6, i * 6, s - i * 12, s - i * 12); } });
  const agateMat = new THREE.MeshStandardMaterial({ map: agateTex, roughness: 0.25, metalness: 0.1 });
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const cyl = (r0, r1, h, mat, x = 0, y = 0, z = 0, seg = 16, open = false) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg, 1, open), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };

  // ---------- land, beach, sea ----------
  const landMat = new THREE.MeshStandardMaterial({ map: K.grassTexture(), roughness: 0.95 }); landMat.map.repeat.set(60, 60);
  const land = new THREE.Mesh(new THREE.PlaneGeometry(612, 1200), landMat); land.rotation.x = -Math.PI / 2; land.position.set(-294, 0, 0); land.receiveShadow = true; S.add(land);
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(20, 1200), sand); beach.rotation.x = -Math.PI / 2; beach.position.set(3, 0.012, 0); beach.receiveShadow = true; S.add(beach);
  const SEA = 0.4;
  const seaMat = new THREE.MeshStandardMaterial({ color: 0x23607e, roughness: 0.18, metalness: 0.15, transparent: true, opacity: 0.9, map: tex(256, (g, s) => { g.fillStyle = '#bfd6e2'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + K.rand() * 0.3})`; g.fillRect(K.rand() * s, K.rand() * s, 6 + K.rand() * 18, 1.5); } }, 140, 140) });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), seaMat); sea.rotation.x = -Math.PI / 2; sea.position.set(612, SEA, 0); sea.receiveShadow = true; S.add(sea);
  const seabed = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ color: 0x1c3b44, roughness: 1 })); seabed.rotation.x = -Math.PI / 2; seabed.position.set(612, -4, 0); S.add(seabed);
  // shore slope between beach and seabed
  const slope = new THREE.Mesh(new THREE.PlaneGeometry(6, 1200), sand); slope.rotation.set(-Math.PI / 2, 0.75, 0, 'ZYX'); slope.rotation.order = 'YXZ'; slope.rotation.set(-Math.PI / 2 + 0, 0, 0);
  { const g = new THREE.PlaneGeometry(1, 1200); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i); P.setX(i, x < 0 ? 12.5 : 18); P.setZ(i, x < 0 ? 0.012 : -4.1); }
    // plane is in XY: x is our x, y is our -z, z is height → rotate so height is y
    g.rotateX(-Math.PI / 2); g.computeVertexNormals(); slope.geometry = g; slope.rotation.set(0, 0, 0); slope.position.set(0, 0, 0); S.add(slope); }
  on(t => { seaMat.map.offset.set(t * 0.004, t * 0.002); });

  // ---------- ship pose (pure) ----------
  const shipGrp = new THREE.Group(); S.add(shipGrp);
  const X_SEA = 30, Y_LAND = 0.35, Y_SEA = -0.5;
  const tSlide = W('launch', 'slides') - 0.35, SLIDE = 2.3;
  const tHarb = T('harbor') + 0.15, tSend = W('gift', 'sends') - 0.1;
  function shipPose(t, out = {}) {
    let x = 0, y = Y_LAND, z = 0, ry = 0, rz = 0, rx = 0;
    if (t >= T('seas') && t < E('seas')) { const env = Math.sin(Math.PI * prog(t, T('seas'), E('seas') - T('seas'))); rx = env * 0.012 * Math.sin(t * 9); rz = env * 0.006 * Math.sin(t * 6.3); }
    if (t >= tSlide) { const p = ease.inOut(prog(t, tSlide, SLIDE)); x = X_SEA * p; y = lerp(Y_LAND, Y_SEA, smooth(x, 6, 22)); rz = -0.06 * Math.sin(Math.PI * smooth(x, 3, 24)); }
    if (t >= tSlide + SLIDE * 0.8) { const a = clamp01((t - tSlide - SLIDE * 0.8) / 1.5); y += a * 0.05 * Math.sin(t * 1.4); rx += a * 0.012 * Math.sin(t * 0.9); }
    if (t >= tHarb) { x += 8 * ease.inOut(prog(t, tHarb, 1.9)); }
    if (t >= tSend) { const p = clamp01((t - tSend) / 6.5); ry = (Math.PI / 2) * ease.inOut(clamp01(p * 2.2)); x += 6 * ease.inOut(clamp01(p * 2.2)); z -= 34 * p * p * (1.6 - 0.6 * p); }
    out.x = x; out.y = y; out.z = z; out.ry = ry; out.rz = rz; out.rx = rx; return out;
  }
  const _pose = {}, _m = new THREE.Matrix4(), _e = new THREE.Euler();
  function shipToWorld(local, t) { shipPose(t, _pose); _e.set(_pose.rx, _pose.ry, _pose.rz, 'YXZ'); return local.clone().applyEuler(_e).add(V(_pose.x, _pose.y, _pose.z)); }
  on(t => { shipPose(t, _pose); shipGrp.position.set(_pose.x, _pose.y, _pose.z); shipGrp.rotation.set(_pose.rx, _pose.ry, _pose.rz, 'YXZ');
    const tg = V(_pose.x, 2, _pose.z); world.sun.target.position.copy(tg); world.sun.position.copy(tg).add(V(24, 40, 32)); });
  const sc = world.sun.shadow.camera; sc.left = sc.bottom = -17; sc.right = sc.top = 17; sc.far = 200; sc.updateProjectionMatrix();

  // ---------- drop / pop helpers ----------
  function isInShip(o) { for (let p = o; p; p = p.parent) if (p === shipGrp) return true; return false; }
  const LAND = 0.7;
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) { S.updateMatrixWorld(true); const lp = obj.parent ? obj.parent.localToWorld(base.clone()) : base.clone(); lp.y -= (opts.half ?? 0);
      const wp = isInShip(obj) ? shipToWorld(lp, tl) : lp; dust.puff(tl, wp, opts.puffSize ?? 0.6, opts.puffCount ?? 6); }
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.7);
    on(t => { obj.visible = t >= t0 && (opts.until === undefined || t < opts.until); if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.15), base_r.y + h * (opts.spin ?? 0.15) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop', gain = 0.5, until) { const s0 = obj.scale.clone(); if (sound) sfx(t0, sound, gain);
    on(t => { obj.visible = t >= t0 && (until === undefined || t < until); const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const showBetween = (o, a, b = 1e9) => on(t => { o.visible = t >= a && t < b; });

  // ---------- people ----------
  function makePerson(tunic, scale = 0.33, parent = S) { const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.8, 10), cloth); body.position.y = 0.98;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), M.skin); head.position.y = 1.56;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 1 })); hair.position.y = 1.58;
    g.add(body, head, hair);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.62, 8), dark); leg.position.set(0.09 * s, 0.31, 0); g.add(leg); g[s > 0 ? 'legR' : 'legL'] = leg;
      const piv = new THREE.Group(); piv.position.set(0.24 * s, 1.34, 0); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.58, 8), cloth); arm.position.y = -0.29;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.skin); hand.position.y = -0.6; piv.add(arm, hand); g.add(piv); g[s > 0 ? 'armR' : 'armL'] = piv; }
    g.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    g.scale.setScalar(scale); parent.add(g); return g; }
  function walkPose(p, t, moving) { const w = moving ? Math.sin(t * 10) : 0; p.armL.rotation.x = 0.5 * w; p.armR.rotation.x = -0.5 * w; p.legL.rotation.x = -0.4 * w; p.legR.rotation.x = 0.4 * w; }
  function textSprite(str, bg = 'rgba(160,20,12,0.92)', fg = '#fff', w = 4.2) { const c = document.createElement('canvas'); c.width = 640; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = bg; g.beginPath(); g.roundRect(6, 14, 628, 100, 24); g.fill(); g.font = '900 64px Cap'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg; g.fillText(str, 320, 66);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w, w / 5, 1); s.renderOrder = 10; return s; }

  // ---------- hull geometry ----------
  const LEN = 18, HB = 2.2, HD = 3.0;
  const hullW = u => HB * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), 2.2)), 0.55);
  const keelY = u => 0.9 * Math.pow(Math.abs(2 * u - 1), 3), topY = u => HD + 0.9 * Math.pow(Math.abs(2 * u - 1), 3);
  const uOf = x => x / LEN + 0.5;
  function hullPt(u, th, off = 0) { const hw = hullW(u), k = keelY(u), tp = topY(u);
    return new THREE.Vector3((u - 0.5) * LEN, k + (tp - k) * (1 - Math.cos(th)) - off * Math.cos(th) * 0.8, (hw + off) * Math.sin(th)); }
  function widthAt(u, y) { const k = keelY(u), tp = topY(u), hw = hullW(u); if (y <= k) return 0.02; const c = 1 - (y - k) / (tp - k); if (c <= 0) return hw; return hw * Math.sin(Math.acos(c)); }
  function surface(u0, u1, th0, th1, side, off, mat, nu = 28, nv = 4) {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const u = lerp(u0, u1, i / nu), th = lerp(th0, th1, j / nv) * side; const p = hullPt(u, th, off); pos.push(p.x, p.y, p.z); uv.push(u * LEN / 3, Math.abs(th) * 2.4); }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m; }
  function deckMesh(y, xa, xb, thick, mat, inset = 0.04) { const sh = new THREE.Shape(), n = 36, pts = [];
    for (let i = 0; i <= n; i++) { const x = lerp(xa, xb, i / n); pts.push([x, Math.max(0.02, widthAt(uOf(x), y) - inset)]); }
    sh.moveTo(pts[0][0], -pts[0][1]); for (const [x, w] of pts) sh.lineTo(x, w); for (let i = pts.length - 1; i >= 0; i--) sh.lineTo(pts[i][0], -pts[i][1]);
    const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: false }); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.y = y - thick; m.castShadow = m.receiveShadow = true; return m; }

  // ---------- shipyard: slipway, logs, king ----------
  for (const z of [-0.9, 0.9]) { const b = box(23, 0.3, 0.35, M.darkWood, 1.5, 0.15, z); S.add(b); }
  for (let i = 0; i < 7; i++) { const c = box(0.4, 0.35, 2.4, M.wood, -7.5 + i * 2.5, 0.2, 0); S.add(c); }
  const king = makePerson(0x5b2a7a, 0.35); king.position.set(8.5, 0, 6.5); king.rotation.y = -2.2;
  { const crown = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 6, 14), bronze); crown.rotation.x = Math.PI / 2; crown.position.y = 1.72; king.add(crown); }
  on(t => { king.armR.rotation.x = t < T('timber') ? -1.6 - 0.15 * Math.sin(t * 3) : -0.2; king.visible = t < T('top'); });
  const logs = [];
  for (let i = 0; i < 12; i++) { const r = i < 5 ? 0 : i < 9 ? 1 : 2, k = r === 0 ? i : r === 1 ? i - 5 : i - 9;
    const lg = K.log(4.2, 0.24, M.wood); lg.rotation.set(0, 0, Math.PI / 2); lg.rotation.order = 'YXZ'; lg.rotation.y = Math.PI / 2;
    lg.position.set(-2 + (k - (r === 0 ? 2 : r === 1 ? 1.5 : 1)) * 0.5, 0.24 + r * 0.42, 7.2); lg.castShadow = true; S.add(lg); logs.push(lg); }
  const tLog0 = T('timber') + 0.2, tLog1 = W('timber', 'enough');
  logs.forEach((lg, i) => dropIn(lg, tLog0 + i * (tLog1 - tLog0) / logs.length, 0.4, 2.6, { gain: 0.65, puffSize: 0.6, sound: i % 2 ? 'clack' : 'thud', spin: 0.25 }));
  // ---------- keel and ribs ----------
  const frame = new THREE.Group(); shipGrp.add(frame);
  const keelPts = []; for (let k = 8; k >= 0; k--) keelPts.push(hullPt(0.0, (k / 8) * Math.PI / 2, -0.02));
  for (let i = 1; i < 30; i++) keelPts.push(hullPt(i / 30, 0, -0.02)); for (let k = 0; k <= 8; k++) keelPts.push(hullPt(1.0, (k / 8) * Math.PI / 2, -0.02));
  const keel = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(keelPts), 160, 0.12, 8), M.darkWood); keel.castShadow = true; frame.add(keel);
  const tFrame = T('frame') + 0.1, tHalf = W('frame', 'half') - 0.1;
  dropIn(keel, tFrame, 0.5, 2.0, { gain: 1, puffSize: 1.6, puffCount: 12, spin: 0.02 });
  const ribs = [];
  for (let i = 0; i < 14; i++) { const u = 0.06 + i * (0.88 / 13); const pts = []; for (let k = -10; k <= 10; k++) pts.push(hullPt(u, (k / 10) * Math.PI / 2, -0.06));
    const r = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.07, 6), M.darkWood); r.castShadow = true; frame.add(r); ribs.push(r); }
  ribs.forEach((r, i) => dropIn(r, tFrame + 0.5 + i * (tHalf - tFrame - 0.8) / ribs.length, 0.38, 2.0, { gain: 0.55, sound: i % 2 ? 'clack' : 'thud', puffSize: 0.5, puffCount: 4, spin: 0.05 }));

  // ---------- planking: per side, per half, in strakes ----------
  const STRAKES = [[0, 0.33], [0.33, 0.66], [0.66, 0.99], [0.99, 1.3], [1.3, Math.PI / 2]];
  const starboard = []; // things hidden for the cutaway
  function planks(u0, u1, t0, span) { const parts = [];
    STRAKES.forEach(([a, b], i) => { for (const side of [1, -1]) { const m = surface(u0, u1, a, b, side, 0, plankMat, 22, 3); shipGrp.add(m); if (side > 0) starboard.push(m); parts.push([m, i]); } });
    parts.forEach(([m, i], k) => { const tt = t0 + i * span / STRAKES.length; popIn(m, tt, 0.25, k % 2 ? false : 'clack', 0.5); }); }
  planks(0, 0.5, tHalf, E('frame') - tHalf - 0.1);                       // stern half done in "six months"
  const tBow = T('rivets') + 0.05; planks(0.5, 1, tBow, W('rivets', 'bronze') - tBow);
  // gunwale rails
  for (const side of [1, -1]) { const pts = []; for (let i = 0; i <= 40; i++) pts.push(hullPt(i / 40, side * Math.PI / 2, 0.03));
    const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.07, 6), M.darkWood); rail.castShadow = true; shipGrp.add(rail); popIn(rail, W('rivets', 'bronze') - 0.1, 0.3, false); if (side > 0) starboard.push(rail); }
  // rivets: instanced, revealed progressively
  const rivGeo = new THREE.SphereGeometry(0.04, 8, 6), rivets = [];
  for (const side of [1, -1]) { const im = new THREE.InstancedMesh(rivGeo, bronze, 420); let n = 0; const m4 = new THREE.Matrix4();
    for (let i = 0; i < 42; i++) for (let j = 0; j < 10; j++) { const u = 0.03 + i * 0.94 / 41, th = side * (0.12 + j * (1.45 / 9)); const p = hullPt(u, th, 0.025); m4.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(n++, m4); }
    // order rivets from stern to bow so they "march" along
    im.instanceMatrix.needsUpdate = true; im.castShadow = false; shipGrp.add(im); rivets.push(im); if (side > 0) starboard.push(im); }
  const tRiv0 = W('rivets', 'bronze') - 0.05, tRiv1 = E('rivets') - 0.1;
  on(t => { const c = Math.round(420 * ease.out(prog(t, tRiv0, tRiv1 - tRiv0))); for (const im of rivets) { im.count = c; im.visible = c > 0; } });
  for (let tt = tRiv0; tt < tRiv1; tt += 0.22) sfx(tt, 'click', 0.7);
  // linen, then lead below the waterline
  const tLin = W('lead', 'linen') - 0.3, tLead = W('lead', 'sheets') - 0.15;
  for (const side of [1, -1]) { const lin = surface(0.01, 0.99, 0, 1.12, side, 0.04, linenMat, 40, 6); shipGrp.add(lin); popIn(lin, tLin, 0.3, side > 0 ? 'rustle' : false, 0.6); if (side > 0) starboard.push(lin); }
  [[0, 0.4], [0.4, 0.8], [0.8, 1.15]].forEach(([a, b], i) => { for (const side of [1, -1]) { const ld = surface(0.005, 0.995, a, b, side, 0.06, leadMat, 40, 3); shipGrp.add(ld); popIn(ld, tLead + i * 0.28, 0.25, side > 0 ? 'clack' : false, 0.8); if (side > 0) starboard.push(ld); } });

  // ---------- three gangways (built inside the open frame) ----------
  const tDeck = T('decks') + 0.15;
  const deckCargo = deckMesh(0.9, -5.4, 7.4, 0.08, M.wood), deckMid = deckMesh(1.95, -5.4, 7.9, 0.08, M.wood), deckTop = deckMesh(HD, -8.3, 8.3, 0.1, M.darkWood);
  shipGrp.add(deckCargo, deckMid, deckTop);
  dropIn(deckCargo, tDeck, 0.4, 1.6, { gain: 0.8, puffSize: 1.2, puffCount: 8 }); dropIn(deckMid, tDeck + 0.45, 0.4, 1.6, { gain: 0.8, puffSize: 1.2, puffCount: 8 }); dropIn(deckTop, W('decks', 'soldiers') - 0.2, 0.4, 1.6, { gain: 0.9, puffSize: 1.4, puffCount: 10 });
  // cargo: amphorae and sacks on the lowest gangway
  const amphGeo = new THREE.LatheGeometry([[0, 0], [0.05, 0.03], [0.09, 0.13], [0.095, 0.24], [0.05, 0.36], [0.035, 0.41], [0.045, 0.43]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
  const amphMat = new THREE.MeshStandardMaterial({ color: 0xb5683e, roughness: 0.8 });
  const cargo = new THREE.Group(); shipGrp.add(cargo);
  for (let i = 0; i < 26; i++) for (let j = -2; j <= 2; j++) { const x = -4.9 + i * 0.46; if (widthAt(uOf(x), 1.0) - 0.15 < Math.abs(j) * 0.28) continue; const a = new THREE.Mesh(amphGeo, amphMat); a.position.set(x, 0.9, j * 0.28); a.castShadow = true; cargo.add(a); }
  popIn(cargo, W('decks', 'cargo') - 0.05, 0.35, 'clack', 0.8);
  // thirty cabins on the middle gangway, 15 a side
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xc9a77a, roughness: 0.9 }), doorMat = new THREE.MeshStandardMaterial({ color: 0x3b2716, roughness: 1 });
  const tCab = W('decks', 'thirty') - 0.1, tSold = W('decks', 'soldiers') - 0.2;
  for (const side of [1, -1]) for (let i = 0; i < 15; i++) { const x = -5.0 + i * 0.84; const zc = side * (widthAt(uOf(x), 2.4) - 0.42);
    const cab = new THREE.Group(); cab.position.set(x, 1.95, zc); cab.add(box(0.76, 0.72, 0.62, cabMat, 0, 0.36, 0), box(0.24, 0.48, 0.02, doorMat, 0, 0.25, -side * 0.32)); shipGrp.add(cab);
    if (side > 0) starboard.push(cab); popIn(cab, tCab + (i + (side > 0 ? 0 : 0.5)) * (tSold - tCab - 0.2) / 15, 0.22, i % 3 === 0 && side > 0 ? 'pop' : false, 0.4); }
  // soldiers on the top gangway
  const soldiers = [];
  for (let i = 0; i < 7; i++) { const p = makePerson(0x8e2b22, 0.33, shipGrp); p.position.set(-4.5 + i * 1.5, HD, (i % 2 ? 0.7 : -0.7)); p.rotation.y = i % 2 ? 0.4 : -0.4;
    const spear = cyl(0.03, 0.03, 2.4, M.darkWood, 0.3, 1.2, 0.1, 6); p.add(spear); const shield = cyl(0.32, 0.32, 0.06, bronze, -0.32, 1.0, 0.15, 16); shield.rotation.z = Math.PI / 2; p.add(shield);
    soldiers.push(p); popIn(p, tSold + 0.35 + i * 0.1, 0.25, i === 0 ? 'pop' : false, 0.5, T('top')); }

  // ---------- shipwrights ----------
  const crew = [];
  for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1, p = makePerson([0x9b8b6b, 0x6b5b4b, 0x8a4b3b, 0x5b6b7b, 0xa08060][i % 5], 0.33);
    p.userData = { x: -7.5 + (i >> 1) * 2.3, z: side * (3.0 + (i % 3) * 0.35), ph: i * 0.7, side }; p.position.set(p.userData.x, 0, p.userData.z); p.rotation.y = side > 0 ? Math.PI : 0; crew.push(p); }
  crew.forEach((p, i) => popIn(p, T('frame') + 0.1 + i * 0.12, 0.25, i === 0 ? 'pop' : false, 0.5, T('land')));
  on(t => { for (const p of crew) { p.armR.rotation.x = -1.0 - 0.6 * Math.abs(Math.sin(t * 6 + p.userData.ph)); p.armL.rotation.x = -0.3; } });
  // the push that fails ("no crew can push it")
  const pushers = [];
  for (let i = 0; i < 8; i++) { const g = new THREE.Group(); S.add(g); const p = makePerson([0x9b8b6b, 0x6b5b4b, 0x8a4b3b, 0x5b6b7b][i % 4], 0.33, g); p.rotation.y = Math.PI / 2;
    const zz = -1.6 + (i % 4) * 1.05, xx = i < 4 ? -9.55 : -10.15; g.position.set(xx, 0, zz); g.userData = { ph: i * 0.9 }; pushers.push([g, p]); }
  pushers.forEach(([g], i) => popIn(g, T('land') + 0.05 + i * 0.07, 0.25, i === 0 ? 'pop' : false, 0.4, tSlide));
  on(t => { for (const [g, p] of pushers) { g.rotation.z = -0.38 - 0.06 * Math.sin(t * 5 + g.userData.ph); p.armR.rotation.x = p.armL.rotation.x = -1.5; p.legL.rotation.x = 0.3 * Math.sin(t * 5 + g.userData.ph); p.legR.rotation.x = -0.3 * Math.sin(t * 5 + g.userData.ph); } });
  for (let tt = T('land') + 0.6; tt < E('land'); tt += 0.8) sfx(tt, 'creak', 0.6);

  // ---------- Archimedes' windlass on a rock offshore; the launch ----------
  const islet = new THREE.Group(); islet.position.set(47, 0, 0); S.add(islet);
  { const rock = K.stoneBlock(5, 1.6, 4.5, M.stone); rock.position.y = 0.2; islet.add(rock);
    for (const z of [-0.8, 0.8]) islet.add(box(0.22, 1.4, 0.22, M.darkWood, 0, 1.7, z));
    islet.add(box(0.3, 0.2, 2.0, M.darkWood, 0, 2.45, 0)); }
  const drum = new THREE.Group(); drum.position.set(0, 2.1, 0); islet.add(drum);
  { const d = cyl(0.32, 0.32, 1.5, M.wood, 0, 0, 0, 16); d.rotation.x = Math.PI / 2; drum.add(d);
    for (let k = 0; k < 4; k++) { const sp = box(0.08, 1.6, 0.08, M.darkWood, 0, 0, 1.05); sp.rotation.z = k * Math.PI / 4; drum.add(sp); }
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 6, 20), M.rope); coil.rotation.y = Math.PI / 2; drum.add(coil); }
  const winders = []; for (let i = 0; i < 2; i++) { const p = makePerson(0x5b6b7b, 0.33, islet); p.position.set(0.6, 1.0, i ? 1.35 : -1.35); p.rotation.y = -Math.PI / 2; winders.push(p); }
  const archimedes = makePerson(0xeae2cf, 0.34, islet); archimedes.position.set(-1.2, 1.0, 1.4); archimedes.rotation.y = -2.2;
  const tWind = W('launch', 'windlass') - 0.25;
  islet.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(islet, tWind, 0.5, 4.0, { gain: 1.0, puffSize: 1.5, puffCount: 10, spin: 0.02 });
  on(t => { islet.visible = t >= tWind && t < T('top'); drum.rotation.z = -2.6 * Math.max(0, t - tSlide) * (t < tSlide + SLIDE ? 1 : 0) - (t >= tSlide + SLIDE ? 2.6 * SLIDE : 0);
    for (const p of winders) p.armR.rotation.x = p.armL.rotation.x = -1.2 + (t > tSlide && t < tSlide + SLIDE ? 0.5 * Math.sin(t * 9) : 0); archimedes.armR.rotation.x = -1.4; });
  const rope = cyl(0.035, 0.035, 1, M.rope, 0, 0, 0, 6); S.add(rope);
  on(t => { rope.visible = t >= tWind + 0.4 && t < tSlide + SLIDE + 0.1; if (!rope.visible) return; const a = shipToWorld(V(9.1, 3.6, 0), t), b = V(47, 2.1, 0);
    rope.position.copy(a).add(b).multiplyScalar(0.5); rope.scale.set(1, a.distanceTo(b), 1); rope.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); });
  sfx(tSlide, 'slide', 1.0); sfx(tSlide + 0.6, 'creak', 0.8); sfx(tSlide + SLIDE * 0.55, 'splash', 1.0); sfx(tSlide + SLIDE * 0.8, 'splash', 0.7);
  for (let i = 0; i < 10; i++) { const tt = tSlide + SLIDE * (0.45 + i * 0.05); spray.puff(tt, V(12 + i * 1.6, SEA, (i % 2 ? 2.4 : -2.4)), 2.2, 8); }
  // name banner after the launch
  const nameSprite = textSprite('SYRACUSIA', 'rgba(25,45,70,0.9)', '#ffd23f', 4.6); S.add(nameSprite);
  const altSprite = textSprite('ALEXANDRIS', 'rgba(25,45,70,0.9)', '#ffd23f', 4.6); S.add(altSprite);
  const tRen = W('gift', 'renames') - 0.1;
  on(t => { const p = shipToWorld(V(-1.2, 8.6, 0), t); nameSprite.position.copy(p); altSprite.position.copy(p);
    nameSprite.visible = false; altSprite.visible = t >= tRen && t < tRen + 2.4; const a = ease.outBack(prog(t, tRen, 0.35)); altSprite.scale.set(4.6 * a, 0.92 * a, 1); });
  sfx(tRen, 'whoosh', 0.7);

  // ---------- top deck: gymnasium, gardens, vines in casks ----------
  const D = HD; const tTop = T('top');
  const gym = new THREE.Group(); gym.position.set(-5.9, D, 0); shipGrp.add(gym);
  gym.add(box(2.3, 0.05, 2.3, sand, 0, 0.025, 0));
  for (const [x, z] of [[-1.05, -1.05], [0, -1.05], [1.05, -1.05], [-1.05, 1.05], [0, 1.05], [1.05, 1.05], [-1.05, 0], [1.05, 0]]) gym.add(cyl(0.06, 0.07, 0.9, marble, x, 0.45, z, 10));
  for (const z of [-1.05, 1.05]) gym.add(box(2.25, 0.09, 0.14, marble, 0, 0.94, z)); for (const x of [-1.05, 1.05]) gym.add(box(0.14, 0.09, 2.25, marble, x, 0.94, 0));
  gym.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(gym, W('top', 'gymnasium') - 0.2, 0.42, 2.2, { gain: 0.9, puffSize: 1.0, puffCount: 8 });
  const runner = makePerson(0xe8d9b0, 0.3, gym); on(t => { const a = t * 2.4; runner.position.set(Math.cos(a) * 0.6, 0.05, Math.sin(a) * 0.6); runner.rotation.y = -a; walkPose(runner, t * 1.4, true); });
  const garden = new THREE.Group(); garden.position.set(-3.3, D, 0); shipGrp.add(garden);
  const flowerCols = [0xe0503a, 0xf2d04a, 0xd77ac0, 0xffffff];
  for (const [x, z] of [[-0.55, -0.85], [0.55, -0.85], [-0.55, 0.85], [0.55, 0.85]]) { const bed = box(0.85, 0.2, 0.55, M.darkWood, x, 0.1, z); garden.add(bed); garden.add(box(0.78, 0.04, 0.48, soil, x, 0.2, z));
    for (let k = 0; k < 7; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), green); b.position.set(x - 0.3 + k * 0.1, 0.27, z + (k % 2 ? 0.1 : -0.1)); garden.add(b);
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), new THREE.MeshStandardMaterial({ color: flowerCols[(k + (x > 0 ? 1 : 0)) % 4] })); f.position.set(b.position.x, 0.36, b.position.z); garden.add(f); } }
  garden.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(garden, W('top', 'gardens') - 0.2, 0.4, 2.0, { gain: 0.8, puffSize: 0.9, sound: 'rustle' });
  const vines = new THREE.Group(); vines.position.set(-1.25, D, 0); shipGrp.add(vines);
  const barrelMat = new THREE.MeshStandardMaterial({ map: woodStripe(), roughness: 0.85 });
  function woodStripe() { return tex(64, (g, s) => { g.fillStyle = '#8a5a32'; g.fillRect(0, 0, s, s); for (let i = 0; i < s; i += 8) { g.fillStyle = 'rgba(40,20,10,0.5)'; g.fillRect(i, 0, 1.5, s); } g.fillStyle = '#333'; g.fillRect(0, 10, s, 4); g.fillRect(0, s - 14, s, 4); }); }
  const grapeMat = new THREE.MeshStandardMaterial({ color: 0x5a2a6a, roughness: 0.5 });
  for (const [x, z] of [[-0.75, -1.0], [0.75, -1.0], [-0.75, 1.0], [0.75, 1.0]]) { vines.add(cyl(0.18, 0.15, 0.36, barrelMat, x, 0.18, z, 14)); vines.add(cyl(0.04, 0.05, 1.15, M.darkWood, x, 0.55, z, 6));
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), green); b.position.set(x + (k % 2 ? 0.08 : -0.06), 0.45 + k * 0.17, z + 0.06); vines.add(b); } }
  for (const z of [-1.0, 1.0]) vines.add(box(1.7, 0.06, 0.06, M.darkWood, 0, 1.12, z)); for (let i = 0; i < 5; i++) vines.add(box(0.05, 0.05, 2.1, M.darkWood, -0.75 + i * 0.375, 1.16, 0));
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17 + K.rand() * 0.06, 0), green); b.position.set(-0.8 + (i % 7) * 0.27, 1.24, i < 7 ? -0.45 : 0.45); vines.add(b);
    if (i % 3 === 0) { const gr = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), grapeMat); gr.scale.y = 1.5; gr.position.set(b.position.x, 1.02, b.position.z); vines.add(gr); } }
  vines.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(vines, W('top', 'grapevines') - 0.2, 0.42, 2.2, { gain: 0.8, puffSize: 0.9, sound: 'thud' });
  const caskT = W('top', 'casks'); for (let i = 0; i < 4; i++) sfx(caskT + i * 0.12, 'clack', 0.5);

  // ---------- shrine of Aphrodite (agate floor), library, bath with three bronze tubs ----------
  const shrine = new THREE.Group(); shrine.position.set(0.85, D, -0.85); shipGrp.add(shrine);
  shrine.add(box(1.5, 0.12, 1.2, marble, 0, 0.06, 0)); const agate = box(1.36, 0.02, 1.06, agateMat, 0, 0.13, 0); shrine.add(agate);
  for (const x of [-0.62, -0.2, 0.2, 0.62]) for (const z of [-0.48, 0.48]) shrine.add(cyl(0.05, 0.06, 0.8, marble, x, 0.53, z, 10));
  shrine.add(box(1.5, 0.1, 1.2, marble, 0, 0.98, 0));
  { const g = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(-0.62, 0); sh.lineTo(0.62, 0); sh.lineTo(0, 0.32); sh.lineTo(-0.62, 0);
    const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: false }), roofMat); ped.rotation.y = Math.PI / 2; ped.position.set(-0.75, 1.03, 0); g.add(ped); shrine.add(g); }
  const statue = cyl(0.07, 0.1, 0.42, marble, 0, 0.35, 0, 10); shrine.add(statue); const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), marble); sHead.position.set(0, 0.6, 0); shrine.add(sHead);
  shrine.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(shrine, W('shrine', 'shrine') - 0.2, 0.42, 2.2, { gain: 0.9, puffSize: 1.0, puffCount: 8 });
  const agateGlow = W('shrine', 'agate'); on(t => { agateMat.emissive.setRGB(0.25 * Math.max(0, 1 - Math.abs(t - agateGlow - 0.4) / 0.7), 0.1 * Math.max(0, 1 - Math.abs(t - agateGlow - 0.4) / 0.7), 0); });
  sfx(agateGlow, 'click', 0.8);
  const library = new THREE.Group(); library.position.set(0.85, D, 0.85); shipGrp.add(library);
  library.add(box(1.4, 0.75, 1.0, new THREE.MeshStandardMaterial({ color: 0xe6d6b4, roughness: 0.9 }), 0, 0.375, 0)); library.add(box(1.5, 0.08, 1.1, roofMat, 0, 0.79, 0));
  const shelf = box(1.1, 0.5, 0.04, new THREE.MeshStandardMaterial({ map: tex(128, (g, s) => { g.fillStyle = '#4a2f1a'; g.fillRect(0, 0, s, s); for (let y = 0; y < 4; y++) for (let x = 0; x < 9; x++) { g.fillStyle = ['#e8d8b0', '#d8c08a', '#f0e6c8'][(x + y) % 3]; g.beginPath(); g.arc(8 + x * 14, 16 + y * 32, 6, 0, Math.PI * 2); g.fill(); } }) }), 0, 0.35, 0.51);
  library.add(shelf); library.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(library, W('shrine', 'library') - 0.2, 0.42, 2.2, { gain: 0.9, puffSize: 1.0, puffCount: 8 });
  const bath = new THREE.Group(); bath.position.set(2.65, D, 0); shipGrp.add(bath);
  bath.add(box(1.1, 0.04, 2.7, new THREE.MeshStandardMaterial({ color: 0x9fc0c8, roughness: 0.4 }), 0, 0.02, 0));
  const tubs = []; for (let i = 0; i < 3; i++) { const tb = new THREE.Group(); tb.position.set(0, 0.04, -0.85 + i * 0.85); const shell = cyl(0.3, 0.24, 0.32, bronze, 0, 0.16, 0, 20, true); shell.material = bronze.clone(); shell.material.side = THREE.DoubleSide; tb.add(shell);
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), waterMat); w.rotation.x = -Math.PI / 2; w.position.y = 0.27; tb.add(w); bath.add(tb); tubs.push(tb); }
  const tBath = W('shrine', 'bath') - 0.15, tTubs = W('shrine', 'tubs');
  popIn(bath, tBath, 0.3, 'pop', 0.5); tubs.forEach((tb, i) => { tb.scale.setScalar(1); popIn(tb, tBath + 0.25 + i * Math.max(0.15, (tTubs - tBath) / 3), 0.28, 'clack', 0.8); });

  // ---------- stalls with horses, freshwater tank, fish tank ----------
  const stalls = new THREE.Group(); stalls.position.set(4.3, D, 0); shipGrp.add(stalls);
  const horseMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.8 }), maneMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 1 });
  function horse() { const h = new THREE.Group(); h.add(box(0.62, 0.24, 0.2, horseMat, 0, 0.42, 0)); const neck = box(0.13, 0.3, 0.12, horseMat, 0.29, 0.6, 0); neck.rotation.z = -0.5; h.add(neck);
    h.add(box(0.22, 0.1, 0.1, horseMat, 0.4, 0.75, 0)); h.add(box(0.04, 0.22, 0.04, maneMat, 0.24, 0.66, 0));
    for (const x of [-0.24, 0.24]) for (const z of [-0.07, 0.07]) h.add(cyl(0.03, 0.025, 0.32, horseMat, x, 0.16, z, 6)); h.add(box(0.04, 0.22, 0.03, maneMat, -0.33, 0.37, 0)); return h; }
  for (const side of [1, -1]) { for (let i = 0; i <= 4; i++) stalls.add(box(0.05, 0.42, 0.75, M.darkWood, -0.9 + i * 0.45, 0.21, side * 1.0)); stalls.add(box(1.85, 0.05, 0.05, M.darkWood, 0, 0.42, side * 0.63));
    for (let i = 0; i < 4; i++) { const h = horse(); h.position.set(-0.68 + i * 0.45, 0, side * 1.0); h.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; h.scale.setScalar(0.62); stalls.add(h); } }
  stalls.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(stalls, W('stalls', 'horse') - 0.2, 0.42, 2.0, { gain: 0.9, puffSize: 1.0, puffCount: 8 });
  const tank = new THREE.Group(); tank.position.set(6.25, D, -0.62); shipGrp.add(tank);
  tank.add(cyl(0.48, 0.5, 0.7, barrelMat, 0, 0.35, 0, 20)); for (const y of [0.15, 0.55]) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 24), M.iron); band.rotation.x = Math.PI / 2; band.position.y = y; tank.add(band); }
  const tw = new THREE.Mesh(new THREE.CircleGeometry(0.46, 20), waterMat); tw.rotation.x = -Math.PI / 2; tw.position.y = 0.66; tank.add(tw); tank.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(tank, W('stalls', 'freshwater') - 0.2, 0.42, 2.0, { gain: 0.9, puffSize: 0.8 }); sfx(W('stalls', 'freshwater') + 0.3, 'splash', 0.5);
  const fishT = new THREE.Group(); fishT.position.set(6.3, D, 0.62); shipGrp.add(fishT);
  fishT.add(box(0.95, 0.42, 0.62, leadMat, 0, 0.21, 0)); const fw = box(0.86, 0.02, 0.53, waterMat, 0, 0.4, 0); fishT.add(fw);
  const fish = []; const fishMat = new THREE.MeshStandardMaterial({ color: 0xe0782a, roughness: 0.5 });
  for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), fishMat); f.scale.set(1.8, 0.7, 0.8); fishT.add(f); fish.push(f); }
  on(t => fish.forEach((f, i) => { const a = t * (1.2 + i * 0.3) + i * 2; f.position.set(Math.cos(a) * 0.28, 0.43, Math.sin(a) * 0.16); f.rotation.y = -a - Math.PI / 2; }));
  fishT.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(fishT, W('stalls', 'fish') - 0.2, 0.42, 2.0, { gain: 0.9, puffSize: 0.8, sound: 'clack' });

  // ---------- eight towers with archers ----------
  const towerXs = [-5.9, -2.3, 1.1, 4.3]; const towers = [], archers = [];
  const tTow = W('towers', 'raise') - 0.2, tArch = W('towers', 'archers') - 0.15;
  towerXs.forEach((x, i) => { for (const side of [1, -1]) { const z = side * (widthAt(uOf(x), D) - 0.45); const g = new THREE.Group(); g.position.set(x, D, z); shipGrp.add(g);
    for (const [a, b] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) g.add(box(0.08, 1.55, 0.08, M.darkWood, a, 0.775, b));
    g.add(box(0.72, 0.08, 0.72, M.darkWood, 0, 1.58, 0));
    for (const [w, d, a, b] of [[0.72, 0.06, 0, -0.33], [0.72, 0.06, 0, 0.33], [0.06, 0.72, -0.33, 0], [0.06, 0.72, 0.33, 0]]) g.add(box(w, 0.26, d, M.wood, a, 1.75, b));
    for (const [a, b] of [[-0.33, -0.33], [0.33, -0.33], [-0.33, 0.33], [0.33, 0.33]]) g.add(box(0.12, 0.12, 0.12, M.wood, a, 1.94, b));
    g.traverse(c => { if (c.isMesh) c.castShadow = true; }); towers.push(g);
    const k = towers.length - 1; dropIn(g, tTow + k * (tArch - tTow - 0.1) / 8, 0.36, 2.4, { gain: 0.7, puffSize: 0.7, puffCount: 5, sound: k % 2 ? 'clack' : 'thud' });
    const a = makePerson(0x3f5a2a, 0.27, g); a.position.set(0, 1.62, 0); a.rotation.y = side > 0 ? 0 : Math.PI; const bow = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 16, Math.PI), M.darkWood); bow.position.set(-0.3, 1.25, 0.35); bow.rotation.set(0, Math.PI / 2, Math.PI / 2); a.add(bow);
    archers.push(a); popIn(a, tArch + k * 0.06, 0.25, k === 0 ? 'pop' : false, 0.5); } });
  on(t => archers.forEach(a => { a.armL.rotation.x = -1.5; a.armR.rotation.x = -1.3 + 0.1 * Math.sin(t * 3); }));

  // ---------- Archimedes' stone thrower on a raised bow platform ----------
  const cat = new THREE.Group(); cat.position.set(7.35, D, 0); shipGrp.add(cat);
  { const yb = 0.75; for (const [a, b] of [[-0.45, -0.55], [0.45, -0.55], [-0.45, 0.55], [0.45, 0.55]]) cat.add(box(0.1, yb, 0.1, M.darkWood, a, yb / 2, b)); cat.add(box(1.15, 0.1, 1.35, M.darkWood, 0, yb + 0.05, 0));
    cat.add(box(0.9, 0.14, 0.14, M.wood, 0, yb + 0.17, -0.45)); cat.add(box(0.9, 0.14, 0.14, M.wood, 0, yb + 0.17, 0.45));
    for (const x of [-0.32, 0.32]) { cat.add(box(0.12, 0.7, 0.12, M.wood, x, yb + 0.5, 0)); }
    cat.add(box(0.8, 0.1, 0.1, M.wood, 0, yb + 0.86, 0.12)); const skein = cyl(0.11, 0.11, 0.55, M.rope, 0, yb + 0.38, 0, 10); skein.rotation.z = Math.PI / 2; cat.add(skein); }
  const PIV = V(0, 0.75 + 0.38, 0); const arm = new THREE.Group(); arm.position.copy(PIV); cat.add(arm);
  arm.add(box(0.1, 1.1, 0.1, M.wood, 0, 0.55, 0)); const cup = cyl(0.14, 0.08, 0.1, M.darkWood, 0, 1.1, 0, 10); arm.add(cup);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 1 }); const cupStone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), stoneMat); cupStone.position.set(0, 1.2, 0); arm.add(cupStone);
  const catGunner = makePerson(0x8e2b22, 0.3, cat); catGunner.position.set(0.45, 0.85, -0.3); catGunner.rotation.y = -Math.PI / 2;
  cat.traverse(c => { if (c.isMesh) c.castShadow = true; });
  dropIn(cat, W('catapult', 'machine') - 0.25, 0.45, 2.4, { gain: 1.0, puffSize: 1.0, puffCount: 8 });
  const tFire = W('catapult', 'hurls') - 0.05, A0 = -1.25, A1 = 0.45, tRel = tFire + 0.16, FLY = 1.9, G = 6.0;
  const flyStone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), stoneMat); flyStone.castShadow = true; S.add(flyStone);
  const relLocal = V(7.35, D, 0).add(PIV).add(V(0, Math.cos(A1) * 1.2, Math.sin(A1) * 1.2));
  let landP = null;
  on(t => { const a = t < tFire ? A0 * ease.out(prog(t, W('catapult', 'machine') + 0.4, 0.9)) : lerp(A0, A1, ease.in ? ease.in(prog(t, tFire, 0.18)) : prog(t, tFire, 0.18)); arm.rotation.x = a;
    cupStone.visible = t < tRel; catGunner.armR.rotation.x = t < tFire ? -1.0 : -0.3;
    flyStone.visible = t >= tRel && t < tRel + FLY; if (!flyStone.visible) return; const p0 = shipToWorld(relLocal, tRel); const tau = t - tRel;
    const vz = (24 - 0) / FLY, vy = (SEA - p0.y + 0.5 * G * FLY * FLY) / FLY; flyStone.position.set(p0.x + 1.0 * tau, p0.y + vy * tau - 0.5 * G * tau * tau, p0.z + vz * tau); flyStone.rotation.set(tau * 5, tau * 3, 0); });
  sfx(tFire, 'whoosh', 1.0); sfx(tFire + 0.05, 'thud', 0.7); { const p0 = shipToWorld(relLocal, tRel); landP = V(p0.x + FLY, SEA, p0.z + 24); for (let i = 0; i < 4; i++) spray.puff(tRel + FLY + i * 0.08, landP, 2.2, 10); sfx(tRel + FLY, 'splash', 1.0); }

  // ---------- leak & Archimedes screw (cutaway: starboard planking hidden) ----------
  const tCut0 = T('leak') - 0.05, tCut1 = E('screw') + 0.15;
  on(t => { const cut = t >= tCut0 && t < tCut1; for (const o of starboard) o.visible = cut ? false : o.visible; seaMat.opacity = cut ? 0.32 : 0.9; });
  const BW0 = 0.85; const bilge = deckMesh(BW0, -8.2, 8.2, 0.02, new THREE.MeshStandardMaterial({ color: 0x55b8e0, roughness: 0.15, emissive: 0x1a5a78, transparent: true, opacity: 0.9 }), 0.06); bilge.castShadow = false; shipGrp.add(bilge);
  const tLeak = T('leak') + 0.1, tPump = W('screw', 'pumps') - 0.1;
  const levelAt = t => t < tPump ? lerp(0.42, 0.8, ease.inOut(prog(t, tLeak, E('leak') - tLeak))) : lerp(0.8, 0.42, ease.inOut(prog(t, tPump + 0.4, E('screw') - tPump - 0.6)));
  on(t => { bilge.visible = t >= tLeak && t < tCut1; if (!bilge.visible) return; const lv = levelAt(t); bilge.position.y = lv - BW0 - 0.02; bilge.scale.set(1, 1, widthAt(0.5, lv) / widthAt(0.5, BW0)); });
  for (let tt = tLeak; tt < E('leak'); tt += 0.45) sfx(tt, 'pour', 0.6);
  // drips through seams
  const drips = []; for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), waterMat); d.scale.y = 1.6; shipGrp.add(d); drips.push(d); }
  on(t => drips.forEach((d, i) => { d.visible = t >= tLeak && t < tPump; if (!d.visible) return; const x = -7.0 + i * 1.9, ph = ((t * 1.4 + i * 0.37) % 1); d.position.set(x, 1.7 - ph * 1.0, 0.9 - i % 3 * 0.25); }));
  // screw in the open stern bay (no lower gangways aft of x = -5.4)
  const SB = V(-7.0, 0.42, 0.15), ST = V(-5.55, 2.6, 0.85), axis = ST.clone().sub(SB), alen = axis.length();
  const screw = new THREE.Group(); screw.position.copy(SB); screw.quaternion.setFromUnitVectors(V(0, 1, 0), axis.clone().normalize()); shipGrp.add(screw);
  const spin = new THREE.Group(); screw.add(spin);
  spin.add(cyl(0.06, 0.06, alen, M.darkWood, 0, alen / 2, 0, 8));
  { const pts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2 * 7, y = i / 160 * alen; pts.push(V(Math.cos(a) * 0.22, y, Math.sin(a) * 0.22)); }
    spin.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.045, 6), M.wood)); }
  const casing = cyl(0.3, 0.3, alen, new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.8, transparent: true, opacity: 0.28, depthWrite: false }), 0, alen / 2, 0, 18, true); screw.add(casing);
  const crank = box(0.06, 0.06, 0.4, M.iron, 0, alen + 0.05, 0.2); spin.add(crank);
  const platform = box(1.2, 0.07, 1.2, M.wood, -6.15, 1.95, -0.25); shipGrp.add(platform);
  const pumper = makePerson(0x6b7b4b, 0.33, shipGrp); pumper.position.set(-5.95, 1.99, 0.05); pumper.rotation.y = 0.7;
  const trough = box(0.18, 0.06, 1.1, M.darkWood, -5.55, 2.62, 1.45); shipGrp.add(trough);
  const outflow = cyl(0.035, 0.05, 1.4, waterMat, -5.55, 1.95, 2.05, 8); shipGrp.add(outflow);
  screw.traverse(c => { if (c.isMesh) c.castShadow = true; });
  const tScrew = W('screw', 'screw') - 0.3;
  [screw, platform, pumper, trough].forEach(o => showBetween(o, tScrew, tCut1)); dropIn(screw, tScrew, 0.42, 1.6, { gain: 0.9, puffSize: 0.6 });
  on(t => { const turning = t >= tPump && t < tCut1; spin.rotation.y = turning ? (t - tPump) * 7 : 0; pumper.armR.rotation.x = pumper.armL.rotation.x = turning ? -1.0 + 0.5 * Math.sin((t - tPump) * 7) : -0.4;
    outflow.visible = turning && t > tPump + 0.4; outflow.scale.set(1, 0.9 + 0.1 * Math.sin(t * 20), 1); });
  for (let tt = tPump + 0.4; tt < E('screw'); tt += 0.5) sfx(tt, 'pour', 0.7); for (let tt = tPump; tt < E('screw'); tt += 0.35) sfx(tt, 'creak', 0.35);

  // ---------- harbour too small ----------
  const harbour = new THREE.Group(); harbour.position.set(0, 0, 0); S.add(harbour);
  harbour.add(box(26, 1.4, 70, M.stone, 75, SEA + 0.1, 0));
  for (const z of [-1.55, 1.55]) { const mole = side => box(10, 1.2, 1.0, M.stone, 57, SEA + 0.1, side); harbour.add(mole(z + Math.sign(z) * 0.5)); }
  for (let i = 0; i < 10; i++) { const hh = 1.2 + K.rand() * 1.4; harbour.add(box(2.2, hh, 2.4, new THREE.MeshStandardMaterial({ color: [0xd8c3a0, 0xc9905e, 0xe0caa0][i % 3], roughness: 1 }), 68 + (i % 5) * 3.2, 1.2 + hh / 2, -10 + Math.floor(i / 5) * 20 + (i % 2) * 3)); }
  harbour.traverse(c => { if (c.isMesh) c.castShadow = c.receiveShadow = true; });
  dropIn(harbour, T('harbor') + 0.05, 0.5, 3.0, { gain: 1.0, puff: false, spin: 0 }); for (const z of [-2.05, 2.05]) dust.puff(T('harbor') + 0.4, V(55, SEA + 0.5, z), 2.5, 10);
  const gapSign = textSprite('TOO NARROW', 'rgba(160,20,12,0.92)', '#fff', 6.0); S.add(gapSign);
  on(t => { const vis = t >= tHarb + 1.6 && t < E('harbor') + 0.1; gapSign.visible = vis; gapSign.position.set(53.5, 6.0, 0); const a = ease.outBack(prog(t, tHarb + 1.6, 0.3)); gapSign.scale.set(6 * a, 1.2 * a, 1); });
  sfx(tHarb + 1.7, 'thud', 0.9); sfx(tHarb + 1.65, 'whoosh', 0.5);
  showBetween(harbour, T('harbor') + 0.05, 1e9);

  // ---------- masts, sails, grain, and away to Egypt ----------
  const masts = [];
  for (const [x, h] of [[-3.3, 5.2], [1.75, 6.2], [5.65, 4.6]]) { const g = new THREE.Group(); g.position.set(x, D, 0); shipGrp.add(g); g.add(cyl(0.09, 0.12, h, M.darkWood, 0, h / 2, 0, 10));
    const yard = cyl(0.05, 0.05, 3.4, M.darkWood, 0, h - 0.3, 0, 8); yard.rotation.x = Math.PI / 2; g.add(yard);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(3.2, h * 0.5, 8, 6), clothMat); { const P = sail.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const xx = P.getX(i), yy = P.getY(i); P.setZ(i, 0.25 * (1 - (xx / 1.6) ** 2) * (0.6 + 0.4 * (1 - Math.abs(yy) / (h * 0.25)))); } sail.geometry.computeVertexNormals(); }
    sail.rotation.y = Math.PI / 2; sail.position.set(0.12, h - 0.3 - h * 0.25, 0); g.add(sail); g.userData.sail = sail;
    g.traverse(c => { if (c.isMesh) c.castShadow = true; }); masts.push(g); }
  const tMast = T('gift') + 0.05;
  masts.forEach((g, i) => { dropIn(g, tMast + i * 0.3, 0.45, 3.0, { gain: 0.9, puffSize: 0.8, spin: 0 }); const s = g.userData.sail; s.scale.set(1, 1, 1); popIn(s, tMast + 1.0 + i * 0.15, 0.4, i ? false : 'whoosh', 0.6); });
  const sackMat = new THREE.MeshStandardMaterial({ color: 0xcfb07a, roughness: 1 }); const sacks = new THREE.Group(); shipGrp.add(sacks);
  for (let i = 0; i < 16; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), sackMat); s.scale.set(1.2, 0.8, 0.9); s.position.set(-6.6 + (i % 4) * 0.42, D + 0.12 + Math.floor(i / 8) * 0.2, -1.3 + Math.floor((i % 8) / 4) * 2.6 + (i % 2) * 0.1); s.castShadow = true; sacks.add(s); }
  popIn(sacks, W('gift', 'grain') - 0.1, 0.35, 'thud', 0.8);
  for (let tt = tSend + 0.3; tt < spec.duration; tt += 1.1) sfx(tt, 'splash', 0.25);
  for (let tt = tSend + 0.4; tt < spec.duration; tt += 0.3) spray.puff(tt, shipToWorld(V(9.0, 0.7, 0), tt), 0.9, 2);

  // ---------- camera ----------
  const sh = [];
  // rel: positions are offsets from the ship's (x, z)
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42, rel = false) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov, rel });
  const tSyr = W('launch', 'this') - 0.15, tCat = W('catapult', 'this') - 0.15, tScr = W('screw', 'this') - 0.15;
  shot(0, T('timber'), V(19, 7.5, 26), V(2, 1.8, 0), V(16, 6.2, 22), V(1, 1.5, 0));
  shot(T('timber'), T('frame'), V(4.5, 3.6, 16.5), V(-1.6, 0.9, 6.8), V(3.2, 3.2, 15.0), V(-1.8, 0.9, 6.8));
  shot(T('frame'), T('decks'), V(17, 6.5, 14), V(0, 1.6, 0), V(15, 5.8, 12.5), V(-0.5, 1.6, 0));
  shot(T('decks'), T('seas'), V(13.5, 3.0, 7.2), V(3.2, 1.7, 0), V(12.0, 3.6, 6.4), V(2.6, 2.0, 0), 44);
  shot(T('seas'), T('rivets'), V(-15, 5.2, 13), V(-1, 1.8, 0), V(-13.5, 4.6, 12), V(-1, 1.8, 0));
  shot(T('rivets'), T('lead'), V(9.5, 2.3, 8.8), V(4.0, 1.6, 1.5), V(4.5, 2.0, 8.0), V(0.5, 1.6, 1.5), 44);
  shot(T('lead'), T('land'), V(-2.5, 1.2, 9.0), V(1.5, 1.0, 1.5), V(1.5, 1.1, 8.6), V(3.5, 1.0, 1.5), 44);
  shot(T('land'), T('launch'), V(-16.5, 2.2, 6.2), V(-8.8, 1.3, 0), V(-15.5, 2.0, 5.2), V(-8.8, 1.3, 0), 44);
  shot(T('launch'), tSlide, V(38.5, 3.4, 9.5), V(46.5, 2.0, 0), V(39.5, 3.4, 8.8), V(46.5, 2.0, 0), 44);
  shot(tSlide, tSyr, V(11, 6.0, 30), V(4, 1.6, 0), V(14, 5.5, 25), V(5, 1.4, 0), 42, true);
  shot(tSyr, T('top'), V(15.5, 5.2, 17), V(0, 2.0, 0), V(14, 4.8, 15.5), V(0, 2.0, 0), 42, true);
  shot(T('top'), T('shrine'), V(-5.5, 5.8, 7.2), V(-5.8, 3.1, 0), V(-0.8, 5.8, 7.4), V(-2.0, 3.1, 0), 44, true);
  shot(T('shrine'), T('stalls'), V(0.0, 6.4, 6.6), V(0.8, 2.8, 0), V(2.7, 6.2, 6.6), V(2.2, 2.8, 0), 44, true);
  shot(T('stalls'), T('towers'), V(3.6, 6.6, 6.8), V(4.6, 2.8, 0), V(6.8, 6.4, 6.6), V(6.0, 2.8, 0), 44, true);
  shot(T('towers'), T('catapult'), V(14, 9.0, 17), V(0, 3.0, 0), V(12, 8.4, 15.5), V(0, 3.2, 0), 42, true);
  shot(T('catapult'), tFire + 0.1, V(12.5, 5.6, 5.8), V(7.2, 4.0, 0.2), V(12.0, 5.4, 5.4), V(7.2, 4.0, 0.2), 44, true);
  shot(tFire + 0.1, tCat, V(6.0, 6.2, -4.5), V(7.8, 2.6, 10), V(6.2, 5.6, -5.0), V(8.6, 0.8, 20), 44, true);
  shot(tCat, T('leak'), V(10.8, 4.9, 3.6), V(7.35, 4.1, 0), V(10.4, 4.8, 3.3), V(7.35, 4.1, 0), 44, true);
  shot(T('leak'), tScr, V(-8.6, 1.9, 5.0), V(-6.0, 0.8, 0.3), V(-8.9, 1.8, 4.6), V(-6.1, 0.9, 0.3), 44, true);
  shot(tScr, T('harbor'), V(-9.0, 1.8, 4.4), V(-6.2, 1.0, 0.4), V(-9.1, 1.8, 4.2), V(-6.2, 1.0, 0.4), 44, true);
  shot(T('harbor'), T('gift'), V(21, 31, 3), V(44, 0, 0), V(25, 29, 2), V(46, 0, 0));
  shot(T('gift'), tSend, V(14, 6.5, 20), V(0, 4.5, 0), V(12, 7.0, 18), V(0, 4.5, 0), 42, true);
  shot(tSend, T('end'), V(18, 8.0, 24), V(0, 3.5, 0), V(22, 9.0, 18), V(0, 3.5, 0), 42, true);
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 0.6, a1: 1.15, r: 24, h: 8.5 }, fov: 42 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    shipPose(t, _pose);
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(_pose.x + Math.cos(a) * o.r, o.h, _pose.z + Math.sin(a) * o.r); tg.set(_pose.x, 3.0, _pose.z); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); if (s.rel) { tmp.x += _pose.x; tmp.z += _pose.z; tg.x += _pose.x; tg.z += _pose.z; } }
    world.setCam(tmp, tg, s.fov);
  }
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
