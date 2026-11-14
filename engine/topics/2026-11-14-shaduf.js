// topics/2026-11-14-shaduf.js — "You built a shaduf". Everything is a pure function of t (frames can render in any order).
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z), D = THREE.MathUtils.degToRad;

  // ---------- layout ----------
  // River runs along x (z < 0). Near bank slopes up from z=-0.5 (bed) to z=2.0, then a flat field plateau at y=TOP.
  const TOP = 2.4, WY = 0.6, SLOPE_Z0 = -0.5, SLOPE_Z1 = 2.0;
  const POST = V(0, TOP, 2.2), PIV = V(0, 5.06, 2.2), LL = 4.8, LS = 1.2, HANG = 0.97; // pivot, long arm, short arm (1/5), tip-to-pot-centre
  const HEAD = V(4.5, TOP, 3.25);                               // where the pot is tipped out (head of the canal)
  const slopeY = z => z >= SLOPE_Z1 ? TOP : Math.max(0, TOP * (z - SLOPE_Z0) / (SLOPE_Z1 - SLOPE_Z0));
  const DOWN = -Math.asin((PIV.y - (0.55 + HANG)) / LL);           // pot half in the river
  const UP = D(22);
  const dH = Math.hypot(HEAD.x - PIV.x, HEAD.z - PIV.z);
  const DUMP = -Math.acos(dH / LL), PSD = Math.atan2(-(HEAD.x - PIV.x), -(HEAD.z - PIV.z)), TILT = 1.9;
  const ROWX = k => 5.0 + 1.2 * k, NROW = 7, FURX = k => 5.6 + 1.2 * k, NFUR = 6;

  const world = new K.World(canvas, spec.w, spec.h, { grassCount: 1, aa: true, grassExclude: (x, z) => z < 4 });
  { const sc = world.sun.shadow.camera; sc.left = sc.bottom = -20; sc.right = sc.top = 20; sc.far = 220; sc.updateProjectionMatrix(); world.sun.shadow.mapSize.set(3072, 3072); }
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 200);
  const splash = new K.Dust(world, 90, 'rgba(225,242,255,A)');
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);

  // ---------- helpers ----------
  const LAND = 0.7;
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) dust.puff(tl, opts.puffAt || V(base.x, opts.puffY ?? base.y, base.z), opts.puffSize ?? 0.8, opts.puffCount ?? 9);
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.8);
    on(t => { obj.visible = t >= t0; if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.3), base_r.y + h * (opts.spin ?? 0.3) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop', puff = true) { const s0 = obj.scale.clone(); sfx(t0, sound, 0.6);
    if (puff) dust.puff(t0 + 0.05, obj.getWorldPosition(new THREE.Vector3()), 0.4, 5);
    on(t => { obj.visible = t >= t0; const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const ropeGeo = new THREE.CylinderGeometry(0.013, 0.013, 1, 6); ropeGeo.translate(0, -0.5, 0);
  function ropeBetween(mesh, a, b) { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); mesh.position.copy(a); mesh.scale.set(1, Math.max(len, 0.001), 1);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); }
  function grassMat(w, d) { const m = new THREE.MeshStandardMaterial({ map: world.ground.material.map.clone(), roughness: 0.95 }); m.map.repeat.set(w / 7.5, d / 7.5); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; m.map.needsUpdate = true; return m; }
  function dirtMat(rx, ry, tint = 0xffffff) { const m = M.dirt.clone(); m.map = M.dirt.map.clone(); m.map.repeat.set(rx, ry); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; m.map.needsUpdate = true; m.color.set(tint); return m; }

  // ---------- terrain: plateau, slope, river, far bank ----------
  { const w = 400, d = 198; const g = new THREE.Mesh(new THREE.BoxGeometry(w, TOP, d), [dirtMat(40, 1), dirtMat(40, 1), grassMat(w, d), dirtMat(1, 1), dirtMat(40, 1), dirtMat(40, 1)]);
    g.position.set(0, TOP / 2, SLOPE_Z1 + d / 2); g.receiveShadow = true; S.add(g); }
  { const geo = new THREE.BufferGeometry(); const x0 = -200, x1 = 200;
    geo.setAttribute('position', new THREE.Float32BufferAttribute([x0, 0, SLOPE_Z0, x1, 0, SLOPE_Z0, x1, TOP, SLOPE_Z1, x0, TOP, SLOPE_Z1], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 120, 0, 120, 1, 0, 1], 2)); geo.setIndex([0, 2, 1, 0, 3, 2]); geo.computeVertexNormals();
    const m = dirtMat(1, 1, 0xd8c8b0); m.map.repeat.set(1, 1); m.side = THREE.DoubleSide; const slope = new THREE.Mesh(geo, m); slope.receiveShadow = true; S.add(slope); }
  // a strip of wet mud right at the waterline
  { const wet = new THREE.Mesh(new THREE.PlaneGeometry(400, 0.5), new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.6 }));
    const ang = Math.atan2(TOP, SLOPE_Z1 - SLOPE_Z0); wet.rotation.x = -ang; const zc = SLOPE_Z0 + (WY + 0.1) / TOP * (SLOPE_Z1 - SLOPE_Z0); wet.position.set(0, slopeY(zc) + 0.012, zc); S.add(wet); }
  const FB_Z = -9.5, FB_H = 1.1;
  { const w = 400, d = 190; const g = new THREE.Mesh(new THREE.BoxGeometry(w, FB_H, d), [dirtMat(40, 1), dirtMat(40, 1), grassMat(w, d), dirtMat(1, 1), dirtMat(120, 1, 0xcbb89a), dirtMat(40, 1)]);
    g.position.set(0, FB_H / 2, FB_Z - d / 2); g.receiveShadow = true; S.add(g); }
  const riverMat = new THREE.MeshStandardMaterial({ color: 0x3d7486, roughness: 0.12, metalness: 0.1, emissive: 0x0a2430 });
  { const r = new THREE.Mesh(new THREE.PlaneGeometry(400, 10.2), riverMat); r.rotation.x = -Math.PI / 2; r.position.set(0, WY, -4.65); r.receiveShadow = true; S.add(r); }
  // drifting glints on the river (pure function of t)
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.35, depthWrite: false });
  const glints = Array.from({ length: 46 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5 + K.rand() * 0.9, 0.035), glintMat); m.rotation.x = -Math.PI / 2;
    m.userData = { x0: (K.rand() - 0.5) * 40, z: -0.3 - K.rand() * 8.8, sp: 0.35 + K.rand() * 0.3 }; S.add(m); return m; });
  on(t => { for (const g of glints) { const u = g.userData; g.position.set(((u.x0 + u.sp * t + 20) % 40 + 40) % 40 - 20, WY + 0.005, u.z); } });
  // reeds at the waterline
  const reedMat = new THREE.MeshStandardMaterial({ color: 0x6f8a3a, roughness: 0.9 });
  for (const cx of [-8.5, -5.5, -3.2, 3.4, 6.2, 9.4, -12, 12.5]) for (let i = 0; i < 9; i++) {
    const h = 0.7 + K.rand() * 0.7, r = new THREE.Mesh(new THREE.ConeGeometry(0.025, h, 4), reedMat); const z = 0.05 + K.rand() * 0.35;
    r.position.set(cx + (K.rand() - 0.5) * 0.9, WY + h / 2 - 0.05, z); r.rotation.set((K.rand() - 0.5) * 0.3, 0, (K.rand() - 0.5) * 0.3); S.add(r); }
  for (const cx of [-7, -2, 4, 8.5]) for (let i = 0; i < 8; i++) { const h = 0.7 + K.rand() * 0.6, r = new THREE.Mesh(new THREE.ConeGeometry(0.025, h, 4), reedMat);
    r.position.set(cx + (K.rand() - 0.5) * 1.0, FB_H + h / 2 - 0.05, FB_Z - 0.1 - K.rand() * 0.4); S.add(r); }

  // ---------- palms and mud-brick houses ----------
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x3f6b26, roughness: 0.85, side: THREE.DoubleSide });
  function palm(x, y, z, h, lean) { const g = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.2, h, 8), new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 1 }));
    tr.position.y = h / 2; g.add(tr); for (let i = 0; i < 8; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), frondMat); f.scale.set(0.22, 0.04, 1.3);
      const a = i / 8 * Math.PI * 2; f.position.set(Math.sin(a) * 1.0, h - 0.25, Math.cos(a) * 1.0); f.rotation.set(0.45 * Math.cos(a), a, 0); f.rotation.order = 'YXZ'; f.rotation.x = 0.45; g.add(f); }
    g.position.set(x, y, z); g.rotation.z = lean; return world.add(g); }
  [[-6, -13, 4.6, 0.08], [-2.5, -15, 5.2, -0.06], [3.5, -12.5, 4.2, 0.1], [7.5, -16, 5.0, -0.05], [12, -13, 4.4, 0.07], [-11, -14, 4.8, 0.04]].forEach(([x, z, h, l]) => palm(x, FB_H, z, h, l));
  [[-4.5, 9.5, 5.0, 0.05], [-1.5, 13.5, 4.6, -0.06], [15.5, 6.0, 4.8, 0.06]].forEach(([x, z, h, l]) => palm(x, TOP, z, h, l));
  const brick = new THREE.MeshStandardMaterial({ color: 0xc9a77a, roughness: 1 });
  function house(x, z, w, d, h) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brick); b.position.y = h / 2;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.12, d + 0.2), new THREE.MeshStandardMaterial({ color: 0x8a6d48, roughness: 1 })); roof.position.y = h + 0.06;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 0.05), new THREE.MeshStandardMaterial({ color: 0x2a1d12, roughness: 1 })); door.position.set(0, 0.5, -d / 2 - 0.01);
    g.add(b, roof, door); g.position.set(x, TOP, z); return world.add(g); }
  house(-6.5, 6.5, 2.6, 2.2, 1.8); house(-9.8, 9.0, 2.2, 2.4, 1.6); house(-3.2, 16, 3.0, 2.2, 1.9);

  // ---------- field: dirt patch and crop rows ----------
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 9.4), dirtMat(3, 3, 0xb8a080)); f.rotation.x = -Math.PI / 2; f.position.set(8.7, TOP + 0.004, 8.1); f.receiveShadow = true; S.add(f); }
  const BROWN = new THREE.Color(0x8a6c3c), GREEN = new THREE.Color(0x4c8f2a);
  const stemGeo = new THREE.ConeGeometry(0.05, 0.42, 6), leafGeo = new THREE.SphereGeometry(1, 8, 6);
  const rowMats = [], rows = [];
  for (let k = 0; k < NROW; k++) { const m = new THREE.MeshStandardMaterial({ color: BROWN.clone(), roughness: 0.85 }); rowMats.push(m); const plants = [];
    for (let j = 0; j < 11; j++) { const g = new THREE.Group(); const st = new THREE.Mesh(stemGeo, m); st.position.y = 0.21; g.add(st);
      for (let i = 0; i < 4; i++) { const lf = new THREE.Mesh(leafGeo, m); lf.scale.set(0.05, 0.02, 0.2); const a = i * 1.6 + j; lf.position.set(Math.sin(a) * 0.13, 0.18 + i * 0.06, Math.cos(a) * 0.13); lf.rotation.set(0.5, a, 0); g.add(lf); }
      g.position.set(ROWX(k) + (K.rand() - 0.5) * 0.08, TOP, 4.4 + 0.75 * j); g.rotation.y = K.rand() * 6; world.add(g); plants.push(g); }
    rows.push(plants); }
  const rowGreen = Array(NROW).fill(1e9); // time each row starts turning green
  on(t => { for (let k = 0; k < NROW; k++) { const g = ease.inOut(prog(t, rowGreen[k], 0.9)); rowMats[k].color.copy(BROWN).lerp(GREEN, g);
    for (const p of rows[k]) { p.scale.set(1, 0.62 + 0.45 * g, 1); p.rotation.z = 0.25 * (1 - g); } } });

  // ---------- person ----------
  function makePerson(tunic) { const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.8, 10), cloth); body.position.y = 1.0;
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 10), dark); belt.position.y = 0.95;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), new THREE.MeshStandardMaterial({ color: 0xb07a52, roughness: 0.7 })); head.position.y = 1.56;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x1f1510, roughness: 1 })); hair.position.y = 1.58;
    g.add(body, belt, head, hair);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.62, 8), new THREE.MeshStandardMaterial({ color: 0xb07a52, roughness: 0.7 })); leg.position.set(0.09 * s, 0.31, 0); g.add(leg);
      const piv = new THREE.Group(); piv.position.set(0.24 * s, 1.34, 0); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.58, 8), new THREE.MeshStandardMaterial({ color: 0xb07a52, roughness: 0.7 })); arm.position.y = -0.29;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.skin); hand.position.y = -0.6; piv.add(arm, hand); g.add(piv); g[s > 0 ? 'armR' : 'armL'] = piv; }
    return world.add(g); }
  const man = makePerson(0xe8dcc0);

  // ---------- hand bucket (carrying phase) ----------
  const handBucket = world.add(K.bucket(M));
  const hbWater = new THREE.Mesh(new THREE.CircleGeometry(0.175, 16), new THREE.MeshStandardMaterial({ color: 0x2b6f8f, roughness: 0.3, emissive: 0x0b2f3f })); hbWater.rotation.x = -Math.PI / 2; hbWater.position.y = 0.1; handBucket.add(hbWater);
  const A = V(1.7, TOP, 3.7), B = V(1.4, slopeY(0.3), 0.3), C = V(1.8, TOP, 3.4);
  const walkTo = (a, b, p) => { const x = lerp(a.x, b.x, p), z = lerp(a.z, b.z, p); return V(x, slopeY(z), z); };
  const tC = T('carry'), tDip = tC + 1.6, tUp = tC + 2.3;
  sfx(tDip + 0.25, 'splash', 0.8); splash.puff(tDip + 0.25, V(1.4, WY, -0.15), 0.6, 10);
  const tTi = T('tired'), tPour0 = tTi + 0.9;
  for (let k = 0; k < 3; k++) { rowGreen[k] = tPour0 + k * 0.62 + 0.15; sfx(tPour0 + k * 0.62, 'pour', 0.5); splash.puff(tPour0 + k * 0.62, V(ROWX(k), TOP, 4.4), 0.4, 6); }
  function manPose(t) { // returns {pos, ry, bend, aL, aR, bucketAt (or null)}
    const r = { pos: A.clone(), ry: Math.PI * 0.85, bend: 0, aL: 0, aR: 0, hb: null, hbTilt: 0, hbFull: false };
    if (t < tC) { r.hb = V(A.x + 0.45, TOP + 0.17, A.z - 0.2); return r; }
    if (t < tDip) { const p = ease.inOut(prog(t, tC, tDip - tC)); r.pos = walkTo(A, B, p); r.ry = Math.PI; const w = Math.sin(t * 10); r.aL = 0.4 * w; r.aR = -0.35; r.hand = true; return r; }
    if (t < tUp) { r.pos = B.clone(); r.ry = Math.PI; const p = Math.sin(Math.PI * prog(t, tDip, tUp - tDip)); r.bend = 0.6 * p; r.aR = -0.9 * p - 0.3; r.hand = true; r.hbFull = t > tDip + 0.25; return r; }
    if (t < tTi) { const p = ease.inOut(prog(t, tUp, tTi - tUp - 0.1)); r.pos = walkTo(B, C, p); r.ry = 0; const w = Math.sin(t * 7); r.aL = 0.4 * w; r.aR = -0.2; r.bend = 0.18; r.hand = true; r.hbFull = true; return r; }
    if (t < T('post')) { // walks to the rows and pours along them, bent over
      const P0 = V(4.6, TOP, 3.85); if (t < tPour0) { const p = ease.inOut(prog(t, tTi, tPour0 - tTi)); r.pos = V(lerp(C.x, P0.x, p), TOP, lerp(C.z, P0.z, p)); r.ry = Math.atan2(P0.x - C.x, P0.z - C.z); r.aR = -0.25; r.hand = true; r.hbFull = true; return r; }
      const p = prog(t, tPour0, 3 * 0.62); r.pos = V(lerp(P0.x, ROWX(2) - 0.45, p), TOP, P0.z); r.ry = 0.3; r.bend = 0.55; r.aR = -1.0; r.aL = -0.2; r.hand = true; r.hbTilt = 1.2 * Math.min(1, prog(t, tPour0 - 0.2, 0.3)); r.hbFull = t < tPour0 + 3 * 0.62; return r; }
    return r; }

  // ---------- the shaduf: post, pole (pivot > yaw > pitch), counterweight, pot ----------
  const post = world.add(K.post(PIV.y - 0.31 - TOP, 0.13, M.wood)); post.position.copy(POST);
  const prongs = [-1, 1].map(s => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.42, 8), M.wood); p.position.set(0.12 * s, PIV.y - 0.27, 0); p.rotation.z = -0.35 * s; p.castShadow = true; return p; });
  const postTop = new THREE.Group(); postTop.position.set(0, 0, 0); prongs.forEach(p => postTop.add(p));
  postTop.position.set(POST.x, 0, POST.z); world.add(postTop);
  const pivotG = new THREE.Group(); pivotG.position.copy(PIV); S.add(pivotG);
  const yawG = new THREE.Group(); pivotG.add(yawG); const pitchG = new THREE.Group(); yawG.add(pitchG);
  const poleM = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, LL + LS, 10), M.darkWood); poleM.rotation.x = Math.PI / 2; poleM.position.z = (LS - LL) / 2; poleM.castShadow = true; pitchG.add(poleM);
  const lash = new THREE.Group(); for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 6, 14), M.rope); r.position.z = -0.08 + i * 0.08; lash.add(r); } pitchG.add(lash);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0x5d4330, roughness: 0.75 });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 14), ballMat); { const P = ball.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), s = 1 + 0.06 * Math.sin(x * 9 + 1) * Math.cos(z * 8) + 0.04 * Math.sin(y * 11); P.setXYZ(i, x * s, y * s, z * s); } ball.geometry.computeVertexNormals(); }
  ball.position.set(0, -0.12, LS - 0.05); ball.castShadow = true; pitchG.add(ball);
  // the pot: wooden bucket, later a tar-coated reed basket
  const pot = new THREE.Group(); pot.rotation.order = 'YXZ'; S.add(pot);
  const bucketM = K.bucket(M); pot.add(bucketM);
  const weave = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#b8955a'; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 8) for (let x = 0; x < 128; x += 16) { g.fillStyle = ((x + y) / 8) % 2 ? '#8f6e3a' : '#d2b47a'; g.fillRect(x + ((y / 8) % 2) * 8, y, 12, 6); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const basketMat = new THREE.MeshStandardMaterial({ map: weave, roughness: 0.95, side: THREE.DoubleSide });
  const basketM = new THREE.Group(); { const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.15, 0.36, 16, 1, true), basketMat); const bot = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), basketMat); bot.rotation.x = -Math.PI / 2; bot.position.y = -0.18;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 20), basketMat); rim.rotation.x = Math.PI / 2; rim.position.y = 0.18;
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.012, 6, 20, Math.PI), M.rope); h.position.y = 0.18; basketM.add(body, bot, rim, h); basketM.traverse(c => { if (c.isMesh) c.castShadow = true; }); }
  pot.add(basketM);
  const potWater = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), new THREE.MeshStandardMaterial({ color: 0x2b6f8f, roughness: 0.3, emissive: 0x0b2f3f })); potWater.rotation.x = -Math.PI / 2; pot.add(potWater);
  const potRope = world.add(new THREE.Mesh(ropeGeo, M.rope));
  const handRope = world.add(new THREE.Mesh(ropeGeo, M.rope));

  // ---------- pose timeline: keys of {phi, psi, tilt, fill} ----------
  const keys = []; const k = (t, phi, psi = 0, tilt = 0, fill = 0) => keys.push({ t, phi, psi, tilt, fill });
  const tipAt = (phi, psi) => V(PIV.x - LL * Math.cos(phi) * Math.sin(psi), PIV.y + LL * Math.sin(phi), PIV.z - LL * Math.cos(phi) * Math.cos(psi));
  const RIVER_PT = (() => { const p = tipAt(DOWN, 0); return V(p.x, WY, p.z); })();
  const dip = t => { sfx(t, 'splash', 0.9); splash.puff(t, RIVER_PT, 0.7, 12); };
  const dump = (t, g = 1) => { sfx(t, 'pour', 0.8 * g); for (let i = 0; i < 3; i++) splash.puff(t + i * 0.12, V(HEAD.x + (K.rand() - 0.5) * 0.2, TOP + 0.05, HEAD.z + (K.rand() - 0.5) * 0.2), 0.45 * g, 7); dumps.push(t); };
  const dumps = [];
  function cycle(t0, leak = false) {
    k(t0, UP, 0, 0, 0); k(t0 + 1.0, DOWN, 0, 0, 0); dip(t0 + 0.95); k(t0 + 1.35, DOWN, 0, 0, 1);
    k(t0 + 2.5, UP, 0, 0, leak ? 0.45 : 1); k(t0 + 3.5, DUMP, PSD, 0, leak ? 0.42 : 1); k(t0 + 3.9, DUMP, PSD, TILT, 0); dump(t0 + 3.72, leak ? 0.5 : 1);
    k(t0 + 4.3, DUMP, PSD, 0, 0); k(t0 + 5.3, UP, 0, 0, 0);
    for (let tt = t0 + 0.2; tt < t0 + 5.3; tt += 1.1) sfx(tt, 'creak', 0.35);
  }
  const tPole = T('pole') + 0.25, tSee = W('pole', 'seesaw');
  k(0, 0); k(tSee, 0); k(tSee + 0.35, D(9)); k(tSee + 0.75, D(-7)); k(tSee + 1.1, 0); sfx(tSee + 0.3, 'creak', 0.6);
  const tPotIn = T('bucket') + 0.3, tPull = Math.max(W('bucket', 'pull'), tPotIn + 0.6);
  k(tPull, 0); k(tPull + 1.3, DOWN); dip(tPull + 1.22); k(tPull + 1.6, DOWN, 0, 0, 1);
  const tH = T('heavy'); k(tH + 0.4, DOWN, 0, 0, 1); k(tH + 1.4, DOWN + D(9), 0, 0, 1); k(tH + 1.8, DOWN + D(6), 0, 0, 1); k(tH + 2.2, DOWN + D(10), 0, 0, 1); k(tH + 3.0, DOWN, 0, 0, 1);
  sfx(tH + 1.0, 'creak', 0.7); sfx(tH + 2.0, 'creak', 0.7);
  const tFall = W('counter', 'falls'); k(tFall, DOWN, 0, 0, 1); k(tFall + 1.3, UP, 0, 0, 1); sfx(tFall + 0.1, 'whoosh', 0.7); sfx(tFall + 1.25, 'creak', 0.8);
  const tSw = T('swing'); k(tSw - 0.05, UP, 0, 0, 1); k(tSw, UP, 0, 0, 0);
  { const wd = W('swing', 'down'), wu = W('swing', 'up'), wt = W('swing', 'turn'), wtip = Math.max(W('swing', 'tip'), wt + 0.95);
    k(wd + 0.25, DOWN); dip(wd + 0.2); k(wd + 0.55, DOWN, 0, 0, 1); k(Math.max(wu + 0.3, wd + 1.4), UP, 0, 0, 1);
    k(wt + 0.9, DUMP, PSD, 0, 1); k(wtip + 0.45, DUMP, PSD, TILT, 0); dump(wtip + 0.28); sfx(wt + 0.2, 'creak', 0.6); }
  const tSh = T('shaduf'); k(tSh + 0.6, DUMP, PSD, 0, 0); k(tSh + 1.7, UP); k(tSh + 2.7, DOWN); dip(tSh + 2.65); k(tSh + 3.0, DOWN, 0, 0, 1); k(tSh + 4.2, UP, 0, 0, 1);
  const tSo = T('soak'); k(Math.max(tSo + 1.0, tSh + 5.0), DUMP, PSD, 0, 1); const tSoD = Math.max(tSo + 1.4, tSh + 5.4); k(tSoD, DUMP, PSD, TILT, 0); dump(tSoD - 0.15);
  k(tSoD + 0.4, DUMP, PSD, 0, 0); k(tSoD + 1.5, UP);
  const tFl = T('flow'), tFC = tFl - 3.6; cycle(tFC); const tFlowWater = tFC + 3.75;
  const tLk = Math.max(T('leak') - 1.1, tFC + 5.4); const tLiftA = tLk + 1.35, tLiftB = tLk + 2.5;
  k(tLk, UP); k(tLk + 1.0, DOWN); dip(tLk + 0.95); k(tLk + 1.35, DOWN, 0, 0, 1); k(tLk + 2.5, UP, 0, 0, 0.45);
  k(tLk + 3.5, DUMP, PSD, 0, 0.42); k(tLk + 3.9, DUMP, PSD, TILT, 0); dump(tLk + 3.72, 0.5); k(tLk + 4.3, DUMP, PSD, 0, 0);
  sfx(tLk + 0.2, 'creak', 0.35); sfx(tLk + 1.6, 'creak', 0.35); sfx(tLk + 2.8, 'creak', 0.35);
  const tSwap = Math.max(W('basket', 'basket'), tLk + 4.35), tTar = Math.max(W('basket', 'tar'), tSwap + 0.6);
  const tB0 = Math.max(tTar + 2.2, tLk + 5.6); k(tTar + 1.2, DUMP, PSD, 0, 0); // basket waits at the canal head, then back to work
  for (let tc = tB0; tc < spec.duration + 0.5; tc += 5.4) cycle(tc);
  keys.sort((a, b) => a.t - b.t);
  function pose(t) {
    if (t <= keys[0].t) return keys[0]; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t < b.t) { const q = (t - a.t) / Math.max(1e-3, b.t - a.t), p = ease.inOut(clamp01(q));
      return { phi: lerp(a.phi, b.phi, p), psi: lerp(a.psi, b.psi, p), tilt: lerp(a.tilt, b.tilt, p), fill: lerp(a.fill, b.fill, clamp01(q)) }; } }
    return keys[keys.length - 1]; }
  const potPos = t => { const s = pose(t); return tipAt(s.phi, s.psi).add(V(0, -HANG, 0)); };

  // post and pole drop-ins, lash, pot
  dropIn(post, T('post') + 0.25, 0.55, 3.2, { gain: 1.0, puffY: TOP, puffSize: 0.9, spin: 0.1 }); dropIn(postTop, T('post') + 0.25, 0.55, 3.2, { puff: false, sound: false, spin: 0 });
  const tPoleLand = tPole + 0.55 * LAND; sfx(tPoleLand, 'thud', 0.9); dust.puff(tPoleLand, PIV.clone(), 0.5, 6);
  lash.visible = false; popIn(lash, W('pole', 'tied') + 0.05, 0.35, 'rustle', false);
  on(t => { pivotG.visible = t >= tPole; const p = clamp01((t - tPole) / 0.55); let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
    pivotG.position.set(PIV.x, PIV.y + h * 2.5, PIV.z); });
  // mud ball: clods thrown from the person build it up, then it bakes in the sun
  const tMud = T('mud'), NCLOD = 6, clodT = Array.from({ length: NCLOD }, (_, i) => tMud + 0.5 + i * 0.42), tBake = W('mud', 'bake');
  const clods = clodT.map(() => world.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), ballMat)));
  const WET = new THREE.Color(0x5d4330), DRY = new THREE.Color(0xd2b483);
  clodT.forEach(tt => { sfx(tt + 0.42, 'plop', 0.8); dust.puff(tt + 0.42, tipAt(DOWN, 0).set(0, PIV.y - LS * Math.sin(DOWN) - 0.1, PIV.z + LS * Math.cos(DOWN)), 0.25, 4); });
  on(t => { let n = 0; for (const tt of clodT) n += ease.outBack(clamp01((t - tt - 0.42) / 0.25)); const s = Math.max(0.001, n / NCLOD); ball.visible = t >= clodT[0] + 0.4; ball.scale.setScalar(s);
    const b = ease.inOut(prog(t, tBake, 1.4)); ballMat.color.copy(WET).lerp(DRY, b); ballMat.roughness = lerp(0.55, 1, b); });

  // ---------- canal, furrows, puddle, water flow ----------
  const tDig = W('canal', 'dig'), tClay = W('canal', 'clay'), tFur = W('canal', 'furrows');
  const CH_X0 = 4.0, CH_X1 = 13.4, CH_Z = HEAD.z;
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x5e4630, roughness: 1 });
  const bedGeo = new THREE.BoxGeometry(CH_X1 - CH_X0, 0.01, 0.46); bedGeo.translate((CH_X1 - CH_X0) / 2, 0, 0);
  const bed = new THREE.Mesh(bedGeo, bedMat); bed.position.set(CH_X0, TOP + 0.006, CH_Z); bed.receiveShadow = true; S.add(bed);
  on(t => { bed.visible = t >= tDig; bed.scale.x = Math.max(0.001, ease.out(prog(t, tDig, 1.4))); });
  for (let i = 0; i < 6; i++) { const tt = tDig + i * 0.24; const x = CH_X0 + (i + 0.5) / 6 * (CH_X1 - CH_X0) * 0.9; dust.puff(tt, V(x, TOP, CH_Z), 0.45, 5); sfx(tt, 'scrape', 0.5); }
  const clayMat = new THREE.MeshStandardMaterial({ color: 0xa8714a, roughness: 0.9 });
  const NSEG = 9, segL = (CH_X1 - CH_X0) / NSEG;
  for (let i = 0; i < NSEG; i++) for (const s of [-1, 1]) { const r = world.add(K.stoneBlock(segL - 0.03, 0.13, 0.15, clayMat)); r.position.set(CH_X0 + (i + 0.5) * segL, TOP + 0.065, CH_Z + s * 0.3);
    dropIn(r, tClay - 0.1 + i * 0.13 + (s > 0 ? 0.05 : 0), 0.38, 1.4, { sound: s > 0 ? 'clack' : false, gain: 0.35, puffSize: 0.25, puffCount: 3, spin: 0.2 }); }
  // cap at the head end
  { const cap = world.add(K.stoneBlock(0.15, 0.13, 0.75, clayMat)); cap.position.set(CH_X0 - 0.07, TOP + 0.065, CH_Z); dropIn(cap, tClay - 0.25, 0.38, 1.4, { gain: 0.35, puffSize: 0.25, puffCount: 3 }); }
  const FUR_Z0 = CH_Z + 0.25, FUR_L = 12.3 - FUR_Z0;
  const furGeo = new THREE.BoxGeometry(0.3, 0.01, FUR_L); furGeo.translate(0, 0, FUR_L / 2);
  const furrows = []; for (let i = 0; i < NFUR; i++) { const f = new THREE.Mesh(furGeo, bedMat); f.position.set(FURX(i), TOP + 0.008, FUR_Z0); f.receiveShadow = true; S.add(f); furrows.push(f);
    const t0 = tFur + 0.1 + i * 0.2; sfx(t0, 'scrape', 0.35); dust.puff(t0 + 0.2, V(FURX(i), TOP, FUR_Z0 + 1.5), 0.3, 4);
    on(t => { f.visible = t >= t0; f.scale.z = Math.max(0.001, ease.out(prog(t, t0, 0.7))); }); }
  // water: puddle from early dumps, then the canal and furrows fill
  const wMat = new THREE.MeshStandardMaterial({ color: 0x3f7f96, roughness: 0.1, metalness: 0.1, emissive: 0x0b2a35, transparent: true, opacity: 0.95 });
  const puddleMat = new THREE.MeshStandardMaterial({ color: 0x2f2216, roughness: 0.35, transparent: true, opacity: 0 });
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 28), puddleMat); puddle.rotation.x = -Math.PI / 2; puddle.position.set(HEAD.x, TOP + 0.01, HEAD.z); S.add(puddle);
  const puddleSheen = new THREE.Mesh(new THREE.CircleGeometry(1, 28), wMat.clone()); puddleSheen.rotation.x = -Math.PI / 2; puddleSheen.position.set(HEAD.x, TOP + 0.014, HEAD.z); S.add(puddleSheen);
  on(t => { const pre = dumps.filter(d => d < tFlowWater - 0.5); let wet = 0, sheen = 0, n = 0;
    for (const d of pre) { if (t >= d) { n++; sheen = Math.max(sheen, 1 - prog(t, d + 0.3, 1.6)); } }
    wet = n > 0 ? 1 - prog(t, Math.max(tSoD + 0.6, T('soak') + 1.2), 1.6) : 0; if (t >= tDig) wet = 0;
    puddle.visible = wet > 0.01; puddleMat.opacity = 0.5 * wet; puddle.scale.setScalar(0.45 + 0.18 * Math.min(n, 3));
    puddleSheen.visible = sheen > 0.01 && t < tDig; puddleSheen.material.opacity = 0.9 * sheen; puddleSheen.scale.setScalar((0.35 + 0.15 * Math.min(n, 3)) * (0.6 + 0.4 * sheen)); });
  const chWGeo = new THREE.BoxGeometry(CH_X1 - CH_X0, 0.02, 0.4); chWGeo.translate((CH_X1 - CH_X0) / 2, 0, 0);
  const chW = new THREE.Mesh(chWGeo, wMat); chW.position.set(CH_X0, TOP + 0.05, CH_Z); S.add(chW);
  on(t => { chW.visible = t >= tFlowWater; chW.scale.x = Math.max(0.001, ease.out(prog(t, tFlowWater, 1.6))); });
  sfx(tFlowWater + 0.3, 'pour', 0.7);
  const furWGeo = new THREE.BoxGeometry(0.22, 0.02, FUR_L); furWGeo.translate(0, 0, FUR_L / 2);
  for (let i = 0; i < NFUR; i++) { const w = new THREE.Mesh(furWGeo, wMat); w.position.set(FURX(i), TOP + 0.03, FUR_Z0); S.add(w);
    const t0 = tFlowWater + 0.5 + i * 0.22; on(t => { w.visible = t >= t0; w.scale.z = Math.max(0.001, ease.out(prog(t, t0, 1.5))); });
    const rk = i + 1; if (rk < NROW && rk >= 3) rowGreen[rk] = Math.min(rowGreen[rk], t0 + 0.5); if (i === NFUR - 1) rowGreen[6] = Math.min(rowGreen[6], t0 + 0.7); }
  rowGreen[3] = Math.min(rowGreen[3], tFlowWater + 0.6);
  // drips from the leaky bucket while it rises
  const dripMat = new THREE.MeshStandardMaterial({ color: 0x9fd4ea, roughness: 0.1, emissive: 0x1d4a5c });
  const drips = []; for (let tt = tLiftA; tt < tLiftB + 0.4; tt += 0.06) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), dripMat); m.scale.set(1, 1.6, 1); m.userData = { ts: tt, ox: (K.rand() - 0.5) * 0.2, oz: (K.rand() - 0.5) * 0.2 }; S.add(m); drips.push(m); }
  on(t => { for (const d of drips) { const u = d.userData, dt = t - u.ts; if (dt < 0 || dt > 2.0) { d.visible = false; continue; } const p0 = potPos(u.ts); const y = p0.y - 0.18 - 4.9 * dt * dt;
    d.visible = y > WY; d.position.set(p0.x + u.ox, y, p0.z + u.oz); } });
  for (let tt = tLiftA + 0.2; tt < tLiftB; tt += 0.3) sfx(tt, 'plop', 0.25);
  // basket swap and tar
  const REED = new THREE.Color(0xffffff), TAR = new THREE.Color(0x141110);
  sfx(tSwap, 'pop', 0.7); sfx(tTar + 0.1, 'slide', 0.5);
  on(t => { const b = t >= tSwap; bucketM.visible = !b; basketM.visible = b; const s = b ? Math.max(0.001, ease.outBack(clamp01((t - tSwap) / 0.4))) : 1; basketM.scale.setScalar(s);
    const tar = ease.inOut(prog(t, tTar, 1.2)); basketMat.color.copy(REED).lerp(TAR, tar); basketMat.roughness = lerp(0.95, 0.25, tar); basketMat.metalness = lerp(0, 0.2, tar); });
  on(t => { if (t >= tSwap && t < tSwap + 0.1) dust.puff(tSwap + 0.02, potPos(tSwap), 0.4, 6); });
  dust.puff(tSwap + 0.02, potPos(tSwap), 0.45, 7);

  // ---------- per-frame: pole, pot, ropes, person ----------
  on(t => {
    const s = pose(t); yawG.rotation.y = s.psi; pitchG.rotation.x = s.phi;
    const tip = tipAt(s.phi, s.psi); tip.y += pivotG.position.y - PIV.y;
    const showPot = t >= tPotIn; pot.visible = potRope.visible = showPot;
    if (showPot) { const pp = clamp01((t - tPotIn) / 0.35), sc = Math.max(0.001, ease.outBack(pp)); pot.scale.setScalar(sc);
      pot.position.copy(tip).add(V(0, -HANG, 0)); pot.rotation.set(s.tilt, s.psi, 0);
      const f = s.fill; potWater.visible = f > 0.03 && s.tilt < 0.6; potWater.position.y = -0.16 + 0.29 * f; potWater.scale.setScalar(0.85 + 0.2 * f);
      ropeBetween(potRope, tip, pot.localToWorld(V(0, 0.2, 0))); }
    // person
    man.armL.rotation.set(0, 0, 0); man.armR.rotation.set(0, 0, 0); man.rotation.set(0, 0, 0);
    const mp = manPose(t); handBucket.visible = t < tPotIn; handRope.visible = false;
    if (t < T('post')) {
      man.position.copy(mp.pos); man.rotation.y = mp.ry; man.rotation.x = mp.bend; man.armL.rotation.x = mp.aL; man.armR.rotation.x = mp.aR;
      if (mp.hand) { man.updateMatrixWorld(true); const h = man.armR.localToWorld(V(0, -0.62, 0)); handBucket.position.set(h.x, h.y - 0.37, h.z); }
      else handBucket.position.copy(mp.hb);
      handBucket.rotation.set(mp.hbTilt, man.rotation.y, 0, 'YXZ'); hbWater.visible = mp.hbFull && mp.hbTilt < 0.6;
      if (t < tC) { handBucket.position.copy(mp.hb); handBucket.rotation.set(0, 0, 0); hbWater.visible = false; }
    } else {
      // stands at the bank edge beside the post, working the pole
      const P = V(0.85, TOP, 2.55); man.position.copy(P); man.rotation.y = Math.PI * 0.92;
      handBucket.position.set(1.35, TOP + 0.17, 2.9); handBucket.rotation.set(0, 0, 0); hbWater.visible = false;
      const pulling = t >= tPull && t < tPull + 1.4, heavy = t >= tH + 0.4 && t < tH + 3.0, mud = t >= tMud && t < clodT[NCLOD - 1] + 0.5;
      if (pulling) { const w = Math.sin((t - tPull) * 11); man.armL.rotation.x = -2.2 + 0.5 * w; man.armR.rotation.x = -2.2 - 0.5 * w; }
      else if (heavy) { const sh = Math.sin(t * 40) * 0.05; man.armL.rotation.x = -2.4 + sh; man.armR.rotation.x = -2.4 - sh; man.rotation.x = -0.12; }
      else if (mud) { const ph = clodT.reduce((a, tt) => (t >= tt - 0.25 && t < tt + 0.2 ? (t - tt + 0.25) / 0.45 : a), -1);
        man.rotation.y = 0.3; man.armR.rotation.x = ph >= 0 ? lerp(0.6, -2.8, ease.out(ph)) : -0.2; man.armL.rotation.x = -0.4; }
      else { const dphi = pose(t + 0.05).phi - s.phi; const active = Math.abs(dphi) > 0.002 && s.psi > -0.3; man.armL.rotation.x = active ? -2.3 + 0.3 * Math.sin(t * 9) : -0.3; man.armR.rotation.x = active ? -2.3 - 0.3 * Math.sin(t * 9) : -0.25; }
    }
  });
  // clods: arc from the person's hand to the short end of the pole
  on(t => { const P = V(0.85, TOP + 1.7, 2.55); pivotG.updateMatrixWorld(true); const target = ball.getWorldPosition(new THREE.Vector3());
    clods.forEach((c, i) => { const p = (t - clodT[i]) / 0.42; c.visible = p >= 0 && p < 1; if (!c.visible) return; c.position.lerpVectors(P, target, p); c.position.y += Math.sin(Math.PI * p) * 1.2; c.rotation.set(p * 6, p * 4, 0); }); });

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const tThisCW = W('counter', 'this') - 0.15, tThisCanal = W('flow', 'this') - 0.15;
  shot(0, T('carry'), V(2.4, 6.0, -7.0), V(6.5, 2.2, 6.5), V(3.0, 5.4, -5.4), V(6.5, 2.2, 6.5), 44);                  // river below, dying field above
  shot(T('carry'), tTi, V(8.6, 3.0, -0.6), V(1.5, 1.7, 1.4), V(8.2, 3.1, -0.2), V(1.6, 2.1, 1.8), 50);                   // down the bank and back up
  shot(tTi, T('post'), V(5.2, 3.9, 0.6), V(5.6, 2.5, 5.2), V(5.8, 3.7, 0.9), V(6.2, 2.5, 5.4), 44);                    // pouring on three rows
  shot(T('post'), T('pole'), V(3.0, 3.3, -1.6), V(0, 3.6, 2.2), V(2.6, 3.4, -1.2), V(0, 3.8, 2.2), 46);                // the forked post
  shot(T('pole'), T('bucket'), V(5.6, 5.2, -2.6), V(0, 4.6, 0.6), V(5.2, 5.0, -2.2), V(0, 4.6, 0.6), 48);              // pole on the fork, seesaw
  shot(T('bucket'), T('heavy'), V(4.6, 3.0, -4.0), V(0, 2.6, -0.4), V(4.2, 2.6, -3.6), V(0, 2.2, -0.6), 50);          // bucket down into the river
  shot(T('heavy'), T('mud'), V(3.4, 1.5, -4.4), V(0.2, 2.0, 0.2), V(3.2, 1.6, -4.1), V(0.2, 2.1, 0.2), 54);            // straining, the bucket barely moves
  shot(T('mud'), tFall, V(-3.6, 5.0, 5.6), V(0, 5.4, 3.0), V(-3.2, 5.1, 5.2), V(0, 5.5, 3.0), 46);                    // mud ball on the short end
  shot(tFall, tThisCW, V(8.8, 4.2, 0.6), V(0, 4.3, 0.4), V(9.2, 4.4, 0.2), V(0, 4.6, 0.2), 52);                       // falls, lifts the bucket
  shot(tThisCW, T('swing'), V(4.6, 4.8, 6.8), V(0, 4.5, 3.2), V(4.3, 4.8, 6.4), V(0, 4.5, 3.2), 46);                // hero: counterweight
  shot(T('swing'), T('shaduf'), V(-4.8, 5.4, 8.4), V(1.6, 3.2, 0.8), V(-4.2, 5.2, 8.0), V(1.6, 3.2, 0.8), 52);       // the full working cycle
  shot(T('shaduf'), tSh + 2.4, V(-7.2, 3.0, -1.6), V(0, 4.1, 1.6), V(-6.8, 3.1, -1.2), V(0, 4.1, 1.6), 52);           // hero: shaduf silhouette over the river
  shot(tSh + 2.4, T('soak'), V(6.8, 2.2, -4.6), V(0, 3.4, 0.6), V(6.4, 2.4, -4.2), V(0, 3.6, 0.6), 54);               // dipping again
  shot(T('soak'), T('canal'), V(3.4, 4.0, 0.4), V(4.5, 2.4, 3.25), V(3.6, 3.7, 0.9), V(4.5, 2.4, 3.25), 46);          // the water soaks away
  shot(T('canal'), tFur, V(2.4, 6.6, -1.2), V(7.6, 2.4, 4.2), V(3.0, 6.4, -0.8), V(8.2, 2.4, 4.4), 48);                // dig and line the channel
  shot(tFur, T('flow'), V(5.0, 7.6, -1.4), V(8.6, 2.4, 6.6), V(5.6, 7.8, -1.0), V(9.0, 2.4, 7.0), 50);                // furrows between rows
  shot(T('flow'), tThisCanal, V(2.6, 4.4, 0.0), V(5.8, 2.4, 4.0), V(3.4, 4.6, 0.4), V(7.4, 2.4, 5.0), 48);            // water runs down the canal
  shot(tThisCanal, T('leak'), V(8.6, 8.4, -1.4), V(8.6, 2.4, 6.6), V(8.8, 8.6, -1.8), V(8.6, 2.4, 6.8), 50);         // hero: irrigation canal
  sh.push({ t0: T('leak'), t1: T('basket'), track: V(3.6, 0.4, -3.4), fov: 50 });                                     // follow the leaking bucket up
  shot(T('basket'), tTar + 1.3, V(6.0, 3.3, 1.5), V(4.5, 2.9, 3.2), V(5.8, 3.25, 1.7), V(4.5, 2.9, 3.2), 40);          // reed basket, then tar
  shot(tTar + 1.3, T('history'), V(-4.8, 5.4, 8.4), V(1.6, 3.2, 0.8), V(-4.4, 5.3, 8.1), V(1.6, 3.2, 0.8), 52);       // it holds every drop
  shot(T('history'), T('end'), V(9.0, 4.6, -7.0), V(3.0, 2.8, 3.0), V(13.0, 7.5, -10.5), V(3.5, 2.6, 3.5), 50);      // pull back: the green field
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 2.45, a1: 2.85, r: 11.5, h: 5.6, tgt: V(0.8, 3.6, 2.0) }, fov: 50 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(o.tgt.x + Math.sin(a) * o.r, o.h, o.tgt.z + Math.cos(a) * o.r); tg.copy(o.tgt); }
    else if (s.track) { const pp = potPos(t), p0 = potPos(s.t0); tg.set(pp.x, lerp(p0.y, pp.y, 0.85) - 0.2, pp.z); tmp.copy(tg).add(s.track); tmp.y = Math.max(tmp.y, 1.6); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    world.setCam(tmp, tg, s.fov);
    world.sun.target.position.set(4, 0, 3); world.sun.position.copy(world.sun.target.position).addScaledVector(world.sunDir, 90);
  }
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
