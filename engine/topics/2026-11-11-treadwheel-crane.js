// topics/2026-11-11-treadwheel-crane.js — "You built a treadwheel crane". Everything is a pure function of t.
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- layout ----------
  const HALF = 3.5, WT = 0.8, H0 = 3.2, H1 = 9.0;           // tower footprint, wall thickness, early / final wall height
  const SB = { w: 0.9, h: 0.55, d: 0.6 };                    // stone block
  const PICK = V(0, SB.h / 2, 4.3);                          // where stones wait on the ground (under the jib tip)
  const AX_R = 0.25, WR = 1.8, WHW = 1.2;                    // rope coil radius, wheel radius, wheel width
  const LOC = { tip: V(0, 7.3, -2.3), mastTop: V(0, 7.0, 0.15), wheel: V(0, 1.95, 2.0) };
  const GROUND_POSE = { p: V(0, 0, 6.6), ry: 0 }, TOP_POSE = { p: V(0, H1 + 0.3, 2.0), ry: Math.PI };

  const world = new K.World(canvas, spec.w, spec.h, {
    grassCount: 12000, aa: true,
    grassExclude: (x, z) => (Math.abs(x) < HALF + 0.3 && Math.abs(z) < HALF + 0.3) || (Math.abs(x) < 2.6 && z > HALF && z < 11.2),
  });
  { const sc = world.sun.shadow.camera; sc.left = sc.bottom = -22; sc.right = sc.top = 22; sc.far = 220; sc.updateProjectionMatrix(); world.sun.shadow.mapSize.set(3072, 3072);
    world.sun.position.copy(world.sunDir).multiplyScalar(90); }
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 180);
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);

  // ---------- helpers ----------
  const LAND = 0.7;
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) dust.puff(tl, opts.puffAt || V(base.x, opts.puffY ?? Math.max(0, base.y - (opts.half ?? 0)), base.z), opts.puffSize ?? 0.8, opts.puffCount ?? 9);
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.8);
    on(t => { obj.visible = t >= t0 && (opts.until === undefined || t < opts.until); if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.4), base_r.y + h * (opts.spin ?? 0.4) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop', until) { const s0 = obj.scale.clone(); sfx(t0, sound, 0.6);
    on(t => { obj.visible = t >= t0 && (until === undefined || t < until); const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const ropeGeo = new THREE.CylinderGeometry(0.022, 0.022, 1, 6); ropeGeo.translate(0, -0.5, 0);
  function ropeBetween(mesh, a, b) { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); mesh.position.copy(a); mesh.scale.set(1, Math.max(len, 0.001), 1);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); }
  const mkRope = () => { const r = new THREE.Mesh(ropeGeo, M.rope); r.castShadow = true; S.add(r); r.visible = false; return r; };
  function beamBetween(a, b, w, mat) { const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, w), mat); m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = m.receiveShadow = true; return m; }

  // ---------- materials ----------
  function masonryTex(rx, ry) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#6d665a'; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) { let x = (row % 2) * -32; while (x < 256) { const w = 64, v = 168 + K.rand() * 40;
      g.fillStyle = `rgb(${v},${v * 0.95},${v * 0.84})`; g.fillRect(x + 2, row * 32 + 2, w - 4, 28); x += w; } }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const COURSE = 0.55, BLK = 0.9; // texture: 8 courses x 4 blocks per tile
  const wallMatA = new THREE.MeshStandardMaterial({ map: masonryTex(7 / (4 * BLK), 1), roughness: 0.95 });
  const wallMatB = new THREE.MeshStandardMaterial({ map: masonryTex(5.4 / (4 * BLK), 1), roughness: 0.95 });
  const ashlar = new THREE.MeshStandardMaterial({ color: 0xbcaa86, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x15110d, roughness: 1 });

  // ---------- tower walls (grow with t) ----------
  const walls = [];
  for (const [sx, sz, len, mat] of [[0, 1, 7, wallMatA], [0, -1, 7, wallMatA], [1, 0, 5.4, wallMatB], [-1, 0, 5.4, wallMatB]]) {
    const g = new THREE.BoxGeometry(sz ? len : WT, 1, sz ? WT : len); g.translate(0, 0.5, 0);
    const m = world.add(new THREE.Mesh(g, mat)); m.position.set(sx * (HALF - WT / 2), 0, sz * (HALF - WT / 2)); walls.push(m); }
  // lancet windows on the front wall (appear once the wall is tall enough)
  const windows = [];
  for (const x of [-1.9, 0, 1.9]) { const sh = new THREE.Shape(); const ww = 0.42, wh = 2.2; sh.moveTo(-ww, 0); sh.lineTo(ww, 0); sh.lineTo(ww, wh); sh.quadraticCurveTo(ww, wh + 0.7, 0, wh + 1.0); sh.quadraticCurveTo(-ww, wh + 0.7, -ww, wh); sh.lineTo(-ww, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), dark); m.position.set(x, 4.6, HALF + 0.012); S.add(m); windows.push(m);
    const m2 = m.clone(); m2.position.z = -HALF - 0.012; m2.rotation.y = Math.PI; S.add(m2); windows.push(m2); }
  // scaffold-free: the wall height timeline
  const tH0 = T('higher') + 0.1, tH1 = E('higher') + 0.2;
  const wallH = t => t < T('intro') + 0.4 ? H0 - COURSE : t < tH0 ? H0 : lerp(H0, H1, ease.inOut(prog(t, tH0, tH1 - tH0)));
  on(t => { const h = wallH(t); for (const w of walls) w.scale.y = h; wallMatA.map.repeat.y = wallMatB.map.repeat.y = h / (8 * COURSE);
    for (const w of windows) w.visible = h > 7.9; });
  // intro: a course of blocks lands along the top of the front wall
  for (let i = 0; i < 7; i++) { const b = world.add(K.stoneBlock(BLK * 0.98, COURSE, WT * 0.98, ashlar)); b.position.set(-2.95 + i * 0.98, H0 - COURSE / 2, HALF - WT / 2);
    dropIn(b, T('intro') + 0.3 + i * 0.5, 0.45, 2.0, { gain: 0.5, sound: 'clack', puffSize: 0.5, puffCount: 5, half: COURSE / 2, until: tH0 + 0.4 }); }
  // higher: blocks keep landing on the rising walls
  for (let i = 0; i < 9; i++) { const tt = tH0 + 0.1 + i * (tH1 - tH0 - 0.3) / 9; const h = wallH(tt + 0.32);
    const side = i % 3, b = world.add(K.stoneBlock(BLK, COURSE, WT * 0.98, ashlar));
    if (side === 0) b.position.set(-2.4 + (i % 5) * 1.2, h, HALF - WT / 2); else { const sx = side === 1 ? 1 : -1; b.position.set(sx * (HALF - WT / 2), h, -1.5 + (i % 4)); b.rotation.y = Math.PI / 2; }
    dropIn(b, tt, 0.45, 2.2, { gain: 0.55, sound: 'clack', puffSize: 0.6, puffCount: 5, until: tt + 0.9 }); }
  sfx(tH0 + 0.2, 'rumble', 0.6);

  // ---------- nave (appears at the end, for the wide shot) ----------
  const nave = new THREE.Group(); { const body = new THREE.Mesh(new THREE.BoxGeometry(6.2, 6.5, 16), new THREE.MeshStandardMaterial({ map: masonryTex(6.2 / 3.6, 6.5 / 4.4), roughness: 0.95 })); body.position.set(0, 3.25, -HALF - 8);
    const sh = new THREE.Shape(); sh.moveTo(-3.4, 0); sh.lineTo(3.4, 0); sh.lineTo(0, 3.0); sh.lineTo(-3.4, 0);
    const roofN = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 16.4, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x4a4f57, roughness: 0.8 })); roofN.position.set(0, 6.5, -HALF - 16.2);
    nave.add(body, roofN); world.add(nave); }
  popIn(nave, T('canterbury') + 0.2, 0.5, 'thud');

  // ---------- people ----------
  function makePerson(tunic) { const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }), dk = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.25, 0.72, 10), cloth); body.position.y = 1.02;
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 10), dk); belt.position.y = 0.9;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), M.skin); head.position.y = 1.56;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 1 })); hair.position.y = 1.58;
    g.add(body, belt, head, hair);
    for (const s of [-1, 1]) { const lp = new THREE.Group(); lp.position.set(0.09 * s, 0.68, 0); const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.68, 8), dk); leg.position.y = -0.34; lp.add(leg); g.add(lp); g[s > 0 ? 'legR' : 'legL'] = lp;
      const piv = new THREE.Group(); piv.position.set(0.24 * s, 1.34, 0); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.58, 8), cloth); arm.position.y = -0.29;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.skin); hand.position.y = -0.6; piv.add(arm, hand); g.add(piv); g[s > 0 ? 'armR' : 'armL'] = piv; }
    g.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return g; }
  const pose = (p, swing = 0, armUp = 0) => { p.legL.rotation.x = 0.5 * swing; p.legR.rotation.x = -0.5 * swing; p.armL.rotation.set(-armUp - 0.4 * swing, 0, 0); p.armR.rotation.set(-armUp + 0.4 * swing, 0, 0); };
  const mason = makePerson(0x8a3b28); S.add(mason);
  const master = makePerson(0x2f5a7a); S.add(master);

  // ---------- crane (one group so it can move onto the tower) ----------
  const crane = new THREE.Group(); S.add(crane);
  const parts = {};
  { // frame: mast, base cross, jib, brace
    const mast = K.post(7.15, 0.13, M.darkWood); parts.mast = mast;
    const baseA = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.26), M.darkWood); baseA.position.y = 0.11;
    const baseB = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 2.4), M.darkWood); baseB.position.y = 0.11;
    const struts = new THREE.Group(); for (const [x, z] of [[1.1, 0], [-1.1, 0], [0, 1.1], [0, -1.1]]) struts.add(beamBetween(V(x, 0.2, z), V(0, 2.2, 0), 0.12, M.darkWood));
    parts.frame = new THREE.Group(); parts.frame.add(mast, baseA, baseB, struts); crane.add(parts.frame);
    parts.jib = new THREE.Group(); parts.jib.add(beamBetween(V(0, 6.85, 0.5), LOC.tip.clone().add(V(0, 0.12, -0.15)), 0.2, M.darkWood));
    parts.jib.add(beamBetween(V(0, 5.0, 0), V(0, 7.05, -1.6), 0.13, M.darkWood)); crane.add(parts.jib);
    parts.tipPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), M.wood); parts.tipPulley.rotation.z = Math.PI / 2; parts.tipPulley.position.copy(LOC.tip).add(V(0, 0.2, 0));
    parts.mastPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 16), M.wood); parts.mastPulley.rotation.z = Math.PI / 2; parts.mastPulley.position.copy(LOC.mastTop).add(V(0, 0.17, 0));
    crane.add(parts.tipPulley, parts.mastPulley);
    // wheel stand + axle
    parts.stand = new THREE.Group(); for (const x of [-0.85, 0.85]) { const p = K.post(LOC.wheel.y + 0.15, 0.1, M.darkWood); p.position.set(x, 0, LOC.wheel.z); parts.stand.add(p);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 2.6), M.darkWood); foot.position.set(x, 0.1, LOC.wheel.z); parts.stand.add(foot);
      for (const dz of [-1, 1]) parts.stand.add(beamBetween(V(x, 0.2, LOC.wheel.z + dz * 1.1), V(x, LOC.wheel.y - 0.1, LOC.wheel.z), 0.1, M.darkWood)); }
    crane.add(parts.stand);
    parts.axle = new THREE.Group(); parts.axle.position.copy(LOC.wheel); crane.add(parts.axle);
    const ax = K.log(2.2, 0.15, M.wood); parts.axle.add(ax);
    parts.coil = new THREE.Mesh(new THREE.CylinderGeometry(AX_R, AX_R, 0.5, 18), M.rope); parts.coil.rotation.z = Math.PI / 2; parts.axle.add(parts.coil);
    // the wheel: two rims, spokes, tread planks
    parts.rims = new THREE.Group(); parts.spokes = new THREE.Group(); parts.treads = [];
    for (const x of [-WHW / 2, WHW / 2]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(WR + 0.05, 0.075, 8, 48), M.darkWood); rim.rotation.y = Math.PI / 2; rim.position.x = x; parts.rims.add(rim);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; parts.spokes.add(beamBetween(V(x, 0, 0), V(x, Math.sin(a) * WR, Math.cos(a) * WR), 0.09, M.darkWood)); } }
    parts.axle.add(parts.rims, parts.spokes);
    const NT = 34; for (let i = 0; i < NT; i++) { const a = i / NT * Math.PI * 2; const tr = new THREE.Mesh(new THREE.BoxGeometry(WHW + 0.1, 0.06, 0.24), M.wood);
      tr.position.set(0, Math.sin(a) * (WR - 0.02), Math.cos(a) * (WR - 0.02)); tr.rotation.x = -a; parts.axle.add(tr); parts.treads.push(tr); }
    crane.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  }
  const walkers = [makePerson(0x6b5a2a), makePerson(0x7a3b5a)]; walkers.forEach((w, i) => { w.position.set(i ? 0.28 : -0.28, LOC.wheel.y - WR + 0.03, LOC.wheel.z); w.rotation.y = Math.PI; crane.add(w); });

  // crane pose: ground until 'climb', then pops out and rebuilds on the tower
  const tOut = T('climb') + 0.05, tIn = T('climb') + 0.85;
  on(t => { const top = t >= tIn; const P = top ? TOP_POSE : GROUND_POSE; crane.position.copy(P.p); crane.rotation.y = P.ry;
    let k = 1; if (t >= tOut && t < tIn) k = Math.max(0.001, 1 - ease.inOut(prog(t, tOut, 0.45)));
    if (top) { const p = prog(t, tIn, 0.6), q = p < LAND ? 1 - (p / LAND) ** 2 : 0; crane.position.y += q * 3.0; }
    crane.scale.setScalar(k); crane.visible = k > 0.002; });
  sfx(tOut + 0.1, 'whoosh', 0.7); sfx(tIn + 0.6 * LAND, 'thud', 1.0); dust.puff(tIn + 0.6 * LAND, V(0, H1 + 0.3, 2.0), 1.6, 14);
  // platform on top of the tower (the floor the crane stands on)
  const platform = world.add(new THREE.Mesh(new THREE.BoxGeometry(2 * HALF - 2 * WT + 0.02, 0.3, 2 * HALF - 2 * WT + 0.02), M.wood)); platform.position.set(0, H1 + 0.15, 0);
  dropIn(platform, tOut + 0.15, 0.45, 2.5, { gain: 0.9, puffSize: 1.2, spin: 0 });

  // build sequence of the crane parts
  dropIn(parts.frame, T('frame') + 0.1, 0.55, 5, { gain: 1.0, puffAt: V(0, 0, 6.6), puffSize: 1.2, spin: 0.05 });
  dropIn(parts.jib, W('frame', 'arm') - 0.1, 0.5, 3, { gain: 0.9, puffAt: V(0, 6.8, 5.2), puffSize: 0.7, spin: 0.05 });
  popIn(parts.tipPulley, T('rope') + 0.15, 0.35, 'clack'); popIn(parts.mastPulley, W('axle', 'axle') - 0.3, 0.3, 'clack');
  dropIn(parts.stand, T('axle') + 0.1, 0.5, 3, { gain: 0.9, puffAt: V(0, 0, 8.6), puffSize: 1.0, spin: 0.05 });
  { const base = parts.axle.position.clone(), t0 = W('axle', 'wooden') - 0.15; sfx(t0 + 0.35, 'thud', 1.0); dust.puff(t0 + 0.35, V(0, LOC.wheel.y, 8.6), 0.6, 6);
    on(t => { parts.axle.visible = t >= t0; const p = clamp01((t - t0) / 0.5); const h = p < LAND ? 1 - (p / LAND) ** 2 : 0; parts.axle.position.set(base.x, base.y + h * 3, base.z); }); }
  const tCoil = W('axle', 'wind'); on(t => { parts.coil.visible = t >= tCoil; parts.coil.scale.set(1, Math.max(0.001, ease.out(prog(t, tCoil, 0.8))), 1); });
  popIn(parts.rims, T('wheel') + 0.2, 0.45, 'thud'); popIn(parts.spokes, W('wheel', 'wheel') , 0.4, 'clack');
  const tTr0 = W('wheel', 'wide'), tTr1 = W('wheel', 'side', 1) || E('wheel') - 0.4;
  parts.treads.forEach((tr, i) => { const tt = tTr0 + i * (E('wheel') - 0.6 - tTr0) / parts.treads.length; const s0 = tr.scale.clone();
    on(t => { tr.visible = t >= tt; const k = Math.max(0.001, ease.outBack(prog(t, tt, 0.25))); tr.scale.set(s0.x * k, s0.y, s0.z * k); }); if (i % 3 === 0) sfx(tt, 'clack', 0.35); });
  walkers.forEach((w, i) => popIn(w, T('walk') + 0.1 + i * 0.35, 0.35, 'hop'));

  // ---------- stones ----------
  const stoneA = world.add(K.stoneBlock(SB.w, SB.h, SB.d, ashlar)), stoneB = world.add(K.stoneBlock(SB.w, SB.h, SB.d, ashlar)), stoneC = world.add(K.stoneBlock(SB.w, SB.h, SB.d, ashlar));
  const PLACE_A = V(-0.95, H0 + SB.h / 2, HALF - WT / 2), PLACE_B = V(0, H0 + SB.h / 2, HALF - WT / 2);
  // stone A: dropped in at 'stones', lifted in walk/lift, sits on the wall after
  const tA0 = T('stones') + 0.2; sfx(tA0 + 0.5 * LAND, 'thud', 1.0); dust.puff(tA0 + 0.5 * LAND, PICK.clone().setY(0), 0.9, 10);
  const tLift0 = W('walk', 'walk') + 0.3, tLift1 = E('lift') - 0.3, liftTopA = H0 + 1.0 + SB.h / 2;
  const yA = t => t < tLift0 ? PICK.y : lerp(PICK.y, liftTopA, ease.inOut(prog(t, tLift0, tLift1 - tLift0)));
  const pullJig = t => (t >= W('pull', 'pull') && t < E('pull')) ? Math.abs(Math.sin((t - W('pull', 'pull')) * 9)) * 0.04 * (t < W('pull', 'barely') + 0.6 ? 1 : 0.3) : 0;
  on(t => { stoneA.visible = t >= tA0 && t < tH0 + 0.4; if (!stoneA.visible) return;
    if (t < tA0 + 0.5) { const p = prog(t, tA0, 0.5); const h = p < LAND ? 1 - (p / LAND) ** 2 : 0; stoneA.position.set(PICK.x, PICK.y + h * 3, PICK.z); return; }
    if (t < T('grip')) stoneA.position.set(PICK.x, yA(t) + pullJig(t), PICK.z); else stoneA.position.copy(PLACE_A); });
  // stone B: pops in at 'grip', lewis, lifted in brake/friction, steered onto the wall in 'swing'
  const tB0 = T('grip') + 0.1; popIn(stoneB, tB0, 0.4, 'thud');
  const tBup0 = T('brake') + 0.15, tStop = W('brake', 'stop') + 0.15, tRes = W('friction', 'held') - 0.3, ySTOP = 1.7;
  const tSw0 = T('swing') + 0.1, tSwUp = W('swing', 'into') - 0.2, tSwEnd = E('swing') - 0.35, liftTopB = H0 + 0.8 + SB.h / 2;
  function yB(t) { if (t < tBup0) return PICK.y; if (t < tStop) return lerp(PICK.y, ySTOP, ease.out(prog(t, tBup0, tStop - tBup0)));
    if (t < tSw0) return ySTOP + 0.025 * Math.sin((t - tStop) * 7) * Math.exp(-(t - tStop) * 1.5);
    if (t < tSwUp) return lerp(ySTOP, liftTopB, ease.inOut(prog(t, tSw0, tSwUp - tSw0)));
    return lerp(liftTopB, PLACE_B.y, ease.inOut(prog(t, tSwUp + 0.5, tSwEnd - tSwUp - 0.5))); }
  const zB = t => t < tSwUp ? PICK.z : lerp(PICK.z, PLACE_B.z, ease.inOut(prog(t, tSwUp, 0.9)));
  on(t => { if (t < tB0) return; stoneB.visible = t < tH0 + 0.4; stoneB.position.set(0, yB(t), zB(t)); stoneB.rotation.y = t > tStop && t < tSw0 ? 0.04 * Math.sin((t - tStop) * 2.3) : 0; });
  sfx(tSwEnd, 'thud', 0.9); dust.puff(tSwEnd, V(0, H0, PLACE_B.z), 0.6, 7);
  // stone C: lifted by the crane on top of the tower (climb .. end)
  const tC0 = tIn + 0.7, tC1 = E('roof') - 0.2, liftTopC = 5.2;
  const yC = t => lerp(PICK.y, liftTopC, ease.inOut(prog(t, tC0 + 0.4, tC1 - tC0 - 0.4)));
  popIn(stoneC, tC0, 0.35, 'thud'); on(t => { if (t >= tC0) stoneC.position.set(PICK.x, yC(t), PICK.z); });

  // lewis: dovetail hole + three iron legs + ring on top of stone B
  const lewis = new THREE.Group(); stoneB.add(lewis);
  const hole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.12), dark); hole.position.y = SB.h / 2 + 0.003; lewis.add(hole);
  const legs = [-0.06, 0.06, 0].map((x, i) => { const g = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.1), M.iron); g.position.set(x, SB.h / 2 + 0.06, 0); g.rotation.z = i === 2 ? 0 : (x < 0 ? -0.12 : 0.12); lewis.add(g); return g; });
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16), M.iron); shackle.position.y = SB.h / 2 + 0.3; lewis.add(shackle);
  const tHole = W('lewis', 'dovetail') - 0.1, tLegs = W('lewis', 'three') - 0.1, tRing = W('lewis', 'wedge') - 0.05;
  on(t => { hole.visible = t >= tHole; hole.scale.set(Math.max(0.01, ease.outBack(prog(t, tHole, 0.3))), 1, 1); });
  legs.forEach((g, i) => { const tt = tLegs + i * 0.35, y0 = g.position.y; sfx(tt + 0.25, 'clack', 0.7);
    on(t => { g.visible = t >= tt; const p = clamp01((t - tt) / 0.3); g.position.y = y0 + (1 - p * p) * 0.8; }); });
  on(t => { shackle.visible = t >= tRing; shackle.scale.setScalar(Math.max(0.01, ease.outBack(prog(t, tRing, 0.3)))); }); sfx(tRing, 'click', 0.8);
  for (let i = 0; i < 4; i++) dust.puff(tHole + 0.1 + i * 0.2, V(0, SB.h + 0.02, PICK.z), 0.25, 4); sfx(tHole + 0.05, 'scrape', 0.7);

  // ---------- rope state ----------
  // total rope wound onto the axle (drives wheel rotation): A lift + B lift + C lift
  const wound = t => (yA(Math.min(t, T('grip'))) - PICK.y) + (t >= tBup0 ? yB(t) - PICK.y + (t >= tSwUp ? 0 : 0) : 0) + (t >= tC0 ? yC(t) - PICK.y : 0);
  on(t => { parts.axle.rotation.x = -wound(t) / AX_R; });
  const rHang = mkRope(), rPull = mkRope(), rMast = mkRope(), rAxle = mkRope(), rSide = mkRope();
  const wp = v => crane.localToWorld(v.clone());
  const tRope = W('rope', 'rope') - 0.1;
  const ropeUpdate = t => {
    crane.updateMatrixWorld(true);
    const tip = wp(LOC.tip), mastP = wp(LOC.mastTop.clone().add(V(0, 0.17, 0))), axTop = wp(LOC.wheel.clone().add(V(0, AX_R, 0)));
    // which load hangs from the tip
    let load = null, end = null;
    if (t >= tRope && t < T('grip')) { load = stoneA; end = stoneA.position.clone().add(V(0, SB.h / 2, 0)); }
    else if (t >= T('grip') && t < tSwEnd + 0.25) { if (t < tRing + 0.2) end = V(0, Math.max(SB.h + 0.35, 2.2 - 3 * prog(t, tRing - 0.5, 0.6)), PICK.z); else end = stoneB.localToWorld(V(0, SB.h / 2 + 0.38, 0)); }
    else if (t >= tC0 && t < E('end') + 5) end = stoneC.position.clone().add(V(0, SB.h / 2, 0));
    const ropeGrow = clamp01((t - tRope) / 0.6);
    rHang.visible = !!end && crane.visible && crane.scale.x > 0.9; if (rHang.visible) ropeBetween(rHang, tip, end.clone().lerp(tip, 1 - (t < T('pull') ? ropeGrow : 1)));
    // before the axle: the other end runs down to the mason's hands
    rPull.visible = t >= T('pull') && t < W('axle', 'wind'); if (rPull.visible) { mason.updateMatrixWorld(true); ropeBetween(rPull, tip, mason.armL.localToWorld(V(0, -0.6, 0))); }
    const winding = t >= W('axle', 'wind') && crane.scale.x > 0.9 && crane.visible;
    rMast.visible = rAxle.visible = winding; if (winding) { ropeBetween(rMast, mastP, tip); ropeBetween(rAxle, axTop, mastP); }
    // the crane master's side rope
    rSide.visible = t >= W('swing', 'small') - 0.3 && t < tSwEnd + 0.4; if (rSide.visible) { master.updateMatrixWorld(true); ropeBetween(rSide, master.armR.localToWorld(V(0, -0.6, 0)), stoneB.localToWorld(V(0, 0, -SB.d / 2))); }
  };

  // ---------- people poses ----------
  on(t => {
    // mason: stands by the stone, tries the ladder idea, pulls the rope
    mason.visible = t >= T('stones') && t < W('axle', 'wind') + 0.3;
    if (mason.visible) { if (t < T('pull')) { mason.position.set(1.0, 0, PICK.z + 0.3); mason.rotation.y = -Math.PI / 2; const bend = t < T('frame') ? 0.3 * Math.sin(t * 6) : 0; pose(mason, 0, 1.2 + bend); }
      else { mason.position.set(0.15, 0, PICK.z + 1.0); mason.rotation.y = 0; const ph = Math.sin((t - T('pull')) * 7), tired = t > W('pull', 'arms'); pose(mason, 0, tired ? 0.3 : 2.6 + 0.3 * ph); mason.rotation.x = tired ? 0.12 : -0.08; } }
    // walkers: walk while the rope winds
    const walking = (t >= tLift0 && t < tLift1) || (t >= tBup0 && t < tStop) || (t >= tRes && t < tSwUp + 0.5) || t >= tC0 + 0.4;
    walkers.forEach((w, i) => { const sw = walking ? Math.sin(t * 7 + i * 1.6) : 0; pose(w, sw, 0.5); w.position.y = LOC.wheel.y - WR + 0.03 + (walking ? 0.03 * Math.abs(Math.sin(t * 7 + i)) : 0); });
    // crane master: on the wall top during 'swing'
    master.visible = t >= T('swing') && t < tSwEnd + 0.8; master.position.set(1.0, H0, HALF - WT / 2 - 0.1); master.rotation.y = -Math.PI / 2 + 0.5;
    pose(master, 0, t > W('swing', 'small') ? 1.1 - 0.4 * prog(t, tSwUp, 0.9) : 0.2);
  });
  // ladder against the wall in 'stones'
  const ladder = new THREE.Group(); for (const x of [-0.25, 0.25]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.6, 0.07), M.wood); r.position.set(x, 1.8, 0); ladder.add(r); }
  for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), M.wood); r.position.set(0, 0.3 + i * 0.34, 0); ladder.add(r); }
  ladder.position.set(1.9, 0, HALF + 0.55); ladder.rotation.x = -0.16; world.add(ladder);
  dropIn(ladder, W('stones', 'ladder') - 0.35, 0.45, 2.0, { gain: 0.7, sound: 'clack', puffSize: 0.5, until: T('wheel') });

  // ---------- roof over the crane on the tower ----------
  const RY = H1 + 0.3, RP = 8.0;
  const rposts = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], i) => { const p = world.add(K.post(RP, 0.16, M.darkWood)); p.position.set(sx * 3.05, RY, sz * 3.05);
    dropIn(p, T('roof') + 0.15 + i * 0.22, 0.45, 4, { gain: 0.8, puffY: RY, puffSize: 0.6 }); return p; });
  const roof = world.add(new THREE.Mesh(new THREE.ConeGeometry(5.0, 3.6, 4), new THREE.MeshStandardMaterial({ color: 0x4a4f57, roughness: 0.75, flatShading: true }))); roof.position.set(0, RY + RP + 1.8, 0); roof.rotation.y = Math.PI / 4;
  dropIn(roof, W('roof', 'tucked') - 0.2, 0.55, 5, { gain: 1.0, puffY: RY + RP, puffSize: 1.6, spin: 0 });

  // ---------- sounds while turning ----------
  for (let tt = tLift0 + 0.3; tt < tLift1; tt += 0.85) sfx(tt, 'creak', 0.45);
  for (let tt = tBup0 + 0.2; tt < tStop; tt += 0.85) sfx(tt, 'creak', 0.45);
  for (let tt = tRes; tt < tSwUp + 0.4; tt += 0.85) sfx(tt, 'creak', 0.4);
  for (let tt = tC0 + 0.5; tt < tC1; tt += 0.9) sfx(tt, 'creak', 0.35);
  sfx(T('pull') + 0.3, 'creak', 0.6); sfx(tStop + 0.05, 'creak', 0.8);

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const tThisTW = W('walk', 'this') - 0.15, tThisLewis = W('lewis', 'this') - 0.15, tThisTC = W('climb', 'this') - 0.15;
  shot(0, T('stones'), V(9.5, 1.2, 12.5), V(0, 3.0, 0), V(7.5, 1.6, 10.0), V(0, 2.8, 0));                       // intro: low, looking up at the walls
  shot(T('stones'), T('frame'), V(5.2, 2.0, 9.4), V(0.6, 1.4, 3.9), V(4.8, 2.2, 8.8), V(0.6, 1.6, 3.9));          // stone + ladder
  shot(T('frame'), T('rope'), V(9.5, 4.0, 11.0), V(0, 3.8, 5.6), V(8.8, 4.4, 10.2), V(0, 4.0, 5.6), 46);        // frame + jib
  shot(T('rope'), T('pull'), V(6.8, 4.6, 9.0), V(0, 5.0, 4.6), V(6.2, 3.2, 8.6), V(0, 2.2, 4.4), 50);            // pulley, rope comes down
  shot(T('pull'), T('axle'), V(3.6, 2.0, 9.4), V(0.1, 1.5, 4.9), V(3.3, 1.9, 9.0), V(0.1, 1.4, 4.9));            // pulling, stone barely moves
  shot(T('axle'), T('wheel'), V(4.6, 4.2, 12.0), V(0, 1.9, 8.6), V(4.2, 3.9, 11.4), V(0, 1.9, 8.6));             // axle
  sh.push({ t0: T('wheel'), t1: T('walk'), orbit: { a0: 0.25, a1: 1.05, r: 6.6, h: 2.6, tgt: V(0, 1.9, 8.6) }, fov: 44 });
  shot(T('walk'), tThisTW, V(1.6, 1.75, 11.6), V(0, 1.2, 8.6), V(1.4, 1.7, 11.0), V(0, 1.2, 8.6), 46);          // walkers inside
  shot(tThisTW, T('lift'), V(7.6, 2.4, 10.9), V(0, 2.1, 8.6), V(7.3, 2.5, 10.5), V(0, 2.1, 8.6), 44);            // hero: treadwheel
  shot(T('lift'), T('grip'), V(8.0, 2.4, 9.0), V(0, 2.4, 5.8), V(8.4, 3.6, 9.4), V(0, 3.4, 5.8), 50);            // stone rises
  shot(T('grip'), tThisLewis, V(1.3, 1.5, 5.2), V(0, 0.45, 4.3), V(1.1, 1.35, 5.0), V(0, 0.5, 4.3), 40);          // close on stone top
  shot(tThisLewis, T('brake'), V(1.9, 1.3, 5.9), V(0, 0.7, 4.3), V(2.0, 1.35, 6.1), V(0, 0.75, 4.3), 42);         // hero: lewis
  shot(T('brake'), T('friction'), V(4.2, 1.2, 6.0), V(0, 1.6, 4.3), V(3.8, 1.3, 5.6), V(0, 1.7, 4.3), 44);        // stone hangs
  shot(T('friction'), T('swing'), V(6.2, 2.1, 11.2), V(0, 1.9, 8.6), V(5.6, 2.0, 10.6), V(0, 1.9, 8.6), 44);       // wheel holds
  shot(T('swing'), T('higher'), V(5.6, 5.2, 8.6), V(0, 3.4, 3.6), V(5.0, 4.8, 8.0), V(0, 3.3, 3.4), 44);           // steered onto wall
  shot(T('higher'), T('climb'), V(11.5, 1.0, 15.0), V(0, 5.0, 3.0), V(12.5, 1.0, 16.5), V(0, 6.0, 3.0), 48);      // walls outgrow the crane
  shot(T('climb'), tThisTC, V(11.0, 10.0, 15.5), V(0, 10.5, 1.5), V(10.0, 11.5, 14.0), V(0, 12.0, 1.5), 48);       // rebuilt on top
  shot(tThisTC, T('roof'), V(8.5, 13.5, 9.5), V(0, 12.5, 1.8), V(8.0, 13.8, 9.0), V(0, 12.6, 1.8), 46);           // hero: treadwheel crane
  shot(T('roof'), T('canterbury'), V(12.0, 12.0, 14.0), V(0, 13.0, 0), V(13.0, 11.0, 15.5), V(0, 12.5, 0), 50);    // roof
  shot(T('canterbury'), T('end'), V(16.0, 6.0, 20.0), V(0, 8.0, -4.0), V(22.0, 9.0, 26.0), V(0, 8.0, -5.0), 50);   // wide with nave
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 0.95, a1: 1.45, r: 22.0, h: 9.0, tgt: V(0, 9.0, -1.0) }, fov: 50 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(o.tgt.x + Math.sin(a) * o.r, o.h, o.tgt.z + Math.cos(a) * o.r); tg.copy(o.tgt); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    world.setCam(tmp, tg, s.fov);
    world.sun.target.position.set(tg.x * 0.5, 0, tg.z * 0.5); world.sun.position.copy(world.sun.target.position).addScaledVector(world.sunDir, 90);
  }
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); ropeUpdate(t); camera(t); } };
}
