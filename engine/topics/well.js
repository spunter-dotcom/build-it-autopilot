// topics/well.js — "You built a well". Everything is a pure function of t (frames can render in any order).
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z);

  const R_IN = 0.72, DEPTH = 9.0, WATER_Y = -8.4, AXLE_Y = 1.85, COIL_R = 0.135, TOP_Y = 0.95;
  const world = new K.World(canvas, spec.w, spec.h, {
    grassCount: 14000, aa: true, groundHole: R_IN,
    grassExclude: (x, z) => Math.hypot(x, z) < 1.55 || Math.hypot(x + 2.1, z + 1.2) < 0.8,
  });
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 140);
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);

  // ---------- materials ----------
  const masonry = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#3d3a35'; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) { let x = (row % 2) * -20; while (x < 256) { const w = 34 + K.rand() * 26, v = 100 + K.rand() * 70;
      g.fillStyle = `rgb(${v},${v * 0.97},${v * 0.9})`; g.beginPath(); g.roundRect(x + 2, row * 32 + 2, w - 4, 28, 7); g.fill(); x += w; } }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 10); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const shaftStoneMat = new THREE.MeshStandardMaterial({ map: masonry, roughness: 0.95, side: THREE.BackSide, vertexColors: true });
  const shaftDirtMat = M.dirt.clone(); shaftDirtMat.side = THREE.BackSide; shaftDirtMat.map = M.dirt.map.clone(); shaftDirtMat.map.repeat.set(4, 8); shaftDirtMat.map.needsUpdate = true; shaftDirtMat.vertexColors = true;
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2b6f8f, roughness: 0.06, metalness: 0.15, emissive: 0x0b2f3f });
  const BLUE = new THREE.Color(0x2b6f8f), MUD = new THREE.Color(0x6e5233), BLUE_E = new THREE.Color(0x0b2f3f), MUD_E = new THREE.Color(0x2a1a0c);

  // ---------- shaft ----------
  const shaftGeo = new THREE.CylinderGeometry(R_IN, R_IN, DEPTH, 40, 18, true); shaftGeo.translate(0, -DEPTH / 2, 0);
  { const P = shaftGeo.attributes.position, col = []; for (let i = 0; i < P.count; i++) { const f = 0.3 + 0.7 * Math.pow(1 + P.getY(i) / DEPTH, 1.6); col.push(f, f, f); }
    shaftGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  const dirtGeo = shaftGeo.clone(); { const P = dirtGeo.attributes.position, C = dirtGeo.attributes.color; for (let i = 0; i < P.count; i++) { const f = 0.12 + 0.88 * Math.exp(P.getY(i) / 1.1); C.setXYZ(i, f, f, f); } }
  const shaftDirt = new THREE.Mesh(dirtGeo, shaftDirtMat), shaftStone = new THREE.Mesh(shaftGeo, shaftStoneMat);
  shaftDirt.receiveShadow = shaftStone.receiveShadow = true; S.add(shaftDirt, shaftStone);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(R_IN, 40), new THREE.MeshStandardMaterial({ color: 0x2c2018, roughness: 1 })); bottom.rotation.x = -Math.PI / 2; S.add(bottom);
  const water = new THREE.Mesh(new THREE.CircleGeometry(R_IN, 40), waterMat); water.rotation.x = -Math.PI / 2; S.add(water);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(R_IN + 0.03, 40), new THREE.MeshStandardMaterial({ map: world.ground.material.map.clone(), roughness: 1, transparent: true }));
  cap.material.map.repeat.set(0.2, 0.2); cap.material.map.needsUpdate = true; cap.rotation.x = -Math.PI / 2; cap.position.y = 0.003; S.add(cap);
  const mound = world.add(new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.dirt)); mound.position.set(-2.1, 0, -1.2);
  on(t => {
    const d0 = T('dig'), dd = E('dig') - d0, pd = prog(t, d0 + 0.2, dd - 0.4);
    cap.visible = t < E('dig'); cap.material.opacity = 1 - ease.inOut(clamp01(pd * 1.6));
    const depth = Math.max(0.02, ease.out(pd)); shaftDirt.scale.y = shaftStone.scale.y = depth;
    shaftDirt.visible = t < T('stones') + 0.6; shaftStone.visible = !shaftDirt.visible;
    bottom.position.y = -DEPTH * depth + 0.01; bottom.visible = t >= d0;
    mound.visible = t >= d0 && t < T('seep'); mound.scale.set(1, Math.max(0.01, 0.55 * ease.out(pd)), 1);
    // water level & color
    const ps = prog(t, T('seep'), E('seep') - T('seep') - 0.6);
    water.visible = t >= T('seep'); water.position.y = lerp(-DEPTH + 0.05, WATER_Y, ease.inOut(ps));
    const mud = t >= T('mud') && t < W('gravel', 'and') + 0.2 ? 1 - prog(t, T('gravel') + 1.0, W('gravel', 'and') - T('gravel') - 1.0) : 0;
    waterMat.color.copy(BLUE).lerp(MUD, mud); waterMat.emissive.copy(BLUE_E).lerp(MUD_E, mud);
  });
  for (let i = 0; i < 7; i++) { const tt = T('dig') + 0.3 + i * (E('dig') - T('dig') - 0.6) / 7; dust.puff(tt, V((K.rand() - 0.5) * 0.6, 0, (K.rand() - 0.5) * 0.6), 0.9, 8); sfx(tt, 'scrape', 0.7); }
  // cave-in clods
  const clods = []; for (let i = 0; i < 12; i++) { const c = world.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06 + K.rand() * 0.07, 0), M.dirt)); c.userData = { a: K.rand() * Math.PI * 2, t0: T('cave') + 0.1 + K.rand() * 1.2 }; clods.push(c); }
  on(t => { for (const c of clods) { const u = c.userData, p = (t - u.t0) / 0.9; c.visible = p >= 0 && p <= 1; if (!c.visible) continue;
    const r = lerp(R_IN - 0.02, R_IN * 0.5, p); c.position.set(Math.cos(u.a) * r, -0.02 - 4.5 * p * p, Math.sin(u.a) * r); c.rotation.set(p * 7, p * 5, 0); } });
  sfx(T('cave') + 0.15, 'rumble', 0.9); for (let i = 0; i < 4; i++) dust.puff(T('cave') + 0.15 + i * 0.35, V(Math.cos(i * 1.7) * 0.6, 0, Math.sin(i * 1.7) * 0.6), 0.7, 7);

  // ---------- helpers ----------
  const LAND = 0.7; // fraction of drop duration at which the part lands
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) dust.puff(tl, V(base.x, opts.puffY ?? Math.max(0, base.y - (opts.half ?? 0)), base.z), opts.puffSize ?? 0.8, opts.puffCount ?? 9);
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.8);
    on(t => { obj.visible = t >= t0; if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.4), base_r.y + h * (opts.spin ?? 0.4) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop') { const s0 = obj.scale.clone(); sfx(t0, sound, 0.6); dust.puff(t0 + 0.05, obj.getWorldPosition(new THREE.Vector3()), 0.5, 6);
    on(t => { obj.visible = t >= t0; const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const ropeGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 6); ropeGeo.translate(0, -0.5, 0);
  function ropeBetween(mesh, a, b) { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); mesh.position.copy(a); mesh.scale.set(1, Math.max(len, 0.001), 1);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); }

  // ---------- stone ring (3 courses x 14 stones) ----------
  const NS = 14, COURSES = 3, SH = 0.24, ringR = R_IN + 0.15, stones = [];
  const s0 = T('stones') + 0.15, sSpan = (E('stones') - T('stones')) - 0.75;
  for (let c = 0; c < COURSES; c++) for (let i = 0; i < NS; i++) {
    const a = (i + (c % 2) * 0.5) / NS * Math.PI * 2;
    const st = world.add(K.stoneBlock(0.34, SH, 0.3, M.stone)); st.position.set(Math.cos(a) * ringR, SH / 2 + c * SH, Math.sin(a) * ringR); st.rotation.y = -a + Math.PI / 2;
    const k = c * NS + i; const tt = s0 + k * sSpan / (NS * COURSES);
    dropIn(st, tt, 0.42, 2.2, { sound: 'clack', gain: 0.45, puffSize: 0.45, puffCount: 4, half: SH / 2, spin: 0.6 }); stones.push(st);
  }
  const RIM_Y = COURSES * SH;

  // ---------- village huts ----------
  function hut(x, z, rot) { const g = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.45, 1.9), new THREE.MeshStandardMaterial({ color: 0xd9cdb4, roughness: 1 })); walls.position.y = 0.72;
    const sh = new THREE.Shape(); sh.moveTo(-1.35, 0); sh.lineTo(1.35, 0); sh.lineTo(0, 1.1); sh.lineTo(-1.35, 0);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: false }), M.thatch); roof.position.set(0, 1.42, -1.1);
    roof.rotation.y = 0; const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.05), M.darkWood); door.position.set(0, 0.45, 0.96);
    g.add(walls, roof, door); g.position.set(x, 0, z); g.rotation.y = rot; return world.add(g); }
  [[-8.5, -6.5], [9.5, -7.5], [-11.5, 3.5], [6.5, 10.5], [-4, -12]].forEach(([x, z]) => hut(x, z, Math.atan2(-x, -z)));

  // ---------- person (with shoulder pivots) ----------
  function makePerson(tunic) { const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.25, 0.72, 10), cloth); body.position.y = 1.02;
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 10), dark); belt.position.y = 0.9;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), M.skin); head.position.y = 1.56;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 1 })); hair.position.y = 1.58;
    g.add(body, belt, head, hair);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.68, 8), dark); leg.position.set(0.09 * s, 0.34, 0); g.add(leg);
      const piv = new THREE.Group(); piv.position.set(0.24 * s, 1.34, 0); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.58, 8), cloth); arm.position.y = -0.29;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.skin); hand.position.y = -0.6; piv.add(arm, hand); g.add(piv); g[s > 0 ? 'armR' : 'armL'] = piv; }
    return world.add(g); }
  const man = makePerson(0x8a3b28);

  // ---------- windlass: posts, axle group (log, coil, crank, ratchet) ----------
  const posts = [-1.3, 1.3].map(x => { const p = world.add(K.post(2.62, 0.085, M.wood)); p.position.set(x, 0, 0); return p; });
  const axle = new THREE.Group(); axle.position.set(0, AXLE_Y, 0); S.add(axle);
  const logM = K.log(2.9, 0.1, M.wood); logM.castShadow = true; axle.add(logM);
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(COIL_R, COIL_R, 0.42, 16), M.rope); coil.rotation.z = Math.PI / 2; coil.castShadow = true; axle.add(coil);
  const crank = new THREE.Group(); crank.position.x = 1.5; axle.add(crank);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.07), M.darkWood); arm.position.y = -0.2; const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 8), M.darkWood);
  handle.rotation.z = Math.PI / 2; handle.position.set(0.12, -0.4, 0); crank.add(arm, handle); crank.traverse(c => { if (c.isMesh) c.castShadow = true; });
  const ratchet = K.gear(0.24, 12, 0.07, M.darkWood); ratchet.rotation.y = Math.PI / 2; ratchet.position.x = 1.13; ratchet.castShadow = true; axle.add(ratchet);
  const bracket = world.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), M.iron)); bracket.rotation.z = Math.PI / 2; bracket.position.set(1.2, 2.24, -0.34);
  const pawlPiv = new THREE.Group(); pawlPiv.position.set(1.13, 2.24, -0.34); S.add(pawlPiv);
  const pawl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.34), M.wood); pawl.position.z = 0.17; pawl.castShadow = true; pawlPiv.add(pawl);
  const PAWL_REST = 0.58;

  // log beat: posts, then log, then coil winds
  const tLog = T('log');
  dropIn(posts[0], tLog + 0.05, 0.5, 3.0, { gain: 0.9, puffSize: 0.7, spin: 0.2 }); dropIn(posts[1], tLog + 0.35, 0.5, 3.0, { gain: 0.9, puffSize: 0.7, spin: 0.2 });
  const tAxleLand = tLog + 0.75 + 0.55 * LAND; sfx(tAxleLand, 'thud', 1.0); dust.puff(tAxleLand, V(-1.3, AXLE_Y, 0), 0.5, 5); dust.puff(tAxleLand, V(1.3, AXLE_Y, 0), 0.5, 5);
  const tCoil = W('log', 'wind');
  on(t => { const p = clamp01((t - (tLog + 0.75)) / 0.55); let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
    axle.visible = t >= tLog + 0.75; axle.position.y = AXLE_Y + h * 2.6;
    coil.scale.set(1, Math.max(0.001, ease.out(prog(t, tCoil, 0.9))), 1); coil.visible = t >= tCoil;
    crank.visible = t >= T('crank') + 0.15; ratchet.visible = t >= W('teeth', 'wheel') - 0.25; });
  popIn(crank, T('crank') + 0.15, 0.4, 'thud');
  popIn(ratchet, W('teeth', 'wheel') - 0.25, 0.4, 'thud');
  dropIn(pawlPiv, W('teeth', 'peg') - 0.1, 0.45, 1.2, { gain: 0.7, puffSize: 0.35, puffCount: 5, spin: 0 }); bracket.visible = false;
  on(t => { bracket.visible = t >= W('teeth', 'peg') - 0.1; });

  // ---------- bucket & rope state machine (pure function of t) ----------
  const bucket = world.add(K.bucket(M)); const bWater = new THREE.Mesh(new THREE.CircleGeometry(0.175, 16), new THREE.MeshStandardMaterial({ color: 0x2b6f8f, roughness: 0.4, envMapIntensity: 0.25, emissive: 0x0b2f3f })); bWater.rotation.x = -Math.PI / 2; bWater.position.y = 0.12; bucket.add(bWater);
  const rope = world.add(new THREE.Mesh(ropeGeo, M.rope));
  const tAnd0 = W('gravel', 'and') - 0.1, tGo = W('drop', 'go'), tCrash = tGo + 0.85, tClick0 = T('click') + 0.1, tGoC = W('click', 'go'), stepDt = 0.36;
  const nSteps = Math.max(1, Math.floor((tGoC - tClick0) / stepDt));
  const yCrank0 = -3.0, aTop = (TOP_Y - yCrank0) / COIL_R, aBottom = aTop + (WATER_Y + 0.15 - TOP_Y) / COIL_R;
  function stepAngle(t) { // ratchet stepping: smooth within each step
    const k = (t - tClick0) / stepDt; if (k <= 0) return 0; const n = Math.min(Math.floor(k), nSteps), f = Math.min(k, nSteps) - n;
    return (n + ease.out(clamp01(f / 0.35))) * (Math.PI * 2 / 12); }
  for (let i = 0; i < nSteps; i++) sfx(tClick0 + i * stepDt + 0.12, 'click', 0.8); sfx(tGoC + 0.2, 'click', 1.0);
  function state(t) { // returns { y, angle, inWater, fullColor }
    if (t < T('haul')) return { y: null, angle: 0 };
    if (t < tLog) { // hand over hand: 8 jerky pulls
      const p = prog(t, T('haul') + 0.2, E('haul') - T('haul') - 0.5), n = 8, k = p * n, f = k - Math.floor(k);
      const y = lerp(WATER_Y + 0.25, TOP_Y, (Math.floor(k) + ease.out(clamp01(f / 0.6))) / n); return { y, angle: 0, hand: true, full: true }; }
    if (t < T('crank')) return { y: yCrank0, angle: 0 };
    if (t < T('drop')) { const p = ease.inOut(prog(t, T('crank') + 0.6, W('crank', 'this') - T('crank') - 0.4)); const y = lerp(yCrank0, TOP_Y, p); return { y, angle: (y - yCrank0) / COIL_R, full: true }; }
    if (t < T('teeth')) { const p = clamp01((t - tGo) / (tCrash - tGo)); const y = lerp(TOP_Y, WATER_Y + 0.15, p * p); return { y, angle: aTop + (y - TOP_Y) / COIL_R, full: true }; }
    if (t < T('mud')) { const a = stepAngle(t), back = t > tGoC ? -0.07 * Math.sin(Math.PI * clamp01((t - tGoC) / 0.25)) : 0; return { y: WATER_Y + 0.15 + (a + back) * COIL_R, angle: aBottom + a + back }; }
    return { y: TOP_Y, angle: aTop, full: true };
  }
  on(t => {
    const s = state(t); axle.rotation.x = -s.angle;
    const hide = s.y === null || (t >= T('frog') && t < T('mud')) || (t >= T('gravel') && t < tAnd0);
    bucket.visible = !hide || t < T('haul'); rope.visible = !hide && t >= T('haul');
    if (t < T('haul')) { bucket.position.set(1.95, 0.17, 1.65); bucket.visible = t < T('dig'); }
    else if (!hide) bucket.position.set(0, s.y, 0);
    bucket.rotation.y = t * 0.15;
    bWater.visible = !!s.full && !(t >= T('teeth') && t < T('mud'));
    const mud = t >= T('mud') && t < W('gravel', 'and') - 0.1; bWater.material.color.set(mud ? 0x4a2c12 : 0x1f5f80); bWater.material.emissive.set(mud ? 0x140a03 : 0x062635); bWater.material.roughness = mud ? 0.95 : 0.4; bWater.material.metalness = 0;
  });
  sfx(tGo + 0.05, 'whoosh', 0.9); sfx(tCrash, 'splash', 1.0);
  const splash = new K.Dust(world, 30, 'rgba(225,242,255,A)');
  splash.puff(tCrash, V(0, WATER_Y, 0), 0.9, 16);
  // crank creak while turning
  for (let tt = T('crank') + 0.8; tt < W('crank', 'this'); tt += 0.9) sfx(tt, 'creak', 0.45);

  // ---------- person poses ----------
  on(t => {
    man.armL.rotation.set(0, 0, 0); man.armR.rotation.set(0, 0, 0);
    if (t < T('haul')) { man.visible = t < T('dig') || t >= T('village'); man.position.set(2.35, 0, 1.75); man.rotation.y = -2.3 + 0.1 * Math.sin(t); }
    if (t >= T('haul') && t < tLog) { man.visible = true; man.position.set(0, 0, 1.38); man.rotation.y = Math.PI;
      const ph = Math.sin((t - T('haul')) * 9.5); man.armL.rotation.x = -1.6 - 0.5 * ph; man.armR.rotation.x = -1.6 + 0.5 * ph; }
    if (t >= tLog && t < T('drop')) man.visible = false;
    if (t >= T('drop') && t < T('frog')) { man.visible = true; man.position.set(2.05, 0, 0.32); man.rotation.y = -Math.PI / 2 - 0.25;
      const let_go = t > tGo; man.armR.rotation.x = let_go ? -0.3 : -1.25; man.armL.rotation.x = let_go ? -0.2 : -0.5; }
    if (t >= T('frog') && t < T('village')) man.visible = false;
    if (t >= T('village')) { man.visible = true; const p = ease.inOut(prog(t, T('village'), 2.4)); man.position.set(lerp(5.5, 1.95, p), 0, lerp(6.0, 1.35, p)); man.rotation.y = Math.atan2(1.95 - 5.5, 1.35 - 6.0);
      if (p < 1) { const w = Math.sin(t * 9); man.armL.rotation.x = 0.4 * w; man.armR.rotation.x = -0.4 * w; } else { man.rotation.y = Math.atan2(1.62 - 1.95, -1.35); man.armR.rotation.x = -1.2; } }
  });

  on(t => { if (!rope.visible) return; const s = state(t); man.updateMatrixWorld(true);
    const top = s.hand ? man.armL.localToWorld(new THREE.Vector3(0, -0.6, 0)) : new THREE.Vector3(0, axle.position.y - COIL_R, 0);
    ropeBetween(rope, top, new THREE.Vector3(0, bucket.position.y + 0.37, 0)); });
  // ---------- pawl motion ----------
  on(t => { let lift = 0; if (t >= tClick0 && t < T('frog')) { const k = (t - tClick0) / stepDt; if (k < nSteps) { const f = k - Math.floor(k); lift = f < 0.35 ? Math.sin(Math.PI * f / 0.35) * 0.22 : 0; } }
    pawlPiv.rotation.x = PAWL_REST - lift; });

  // ---------- leaves & frog ----------
  const leafGeo = new THREE.PlaneGeometry(0.09, 0.06); const leaves = [];
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.08 + K.rand() * 0.22, 0.65, 0.38), side: THREE.DoubleSide, roughness: 0.8 }));
    m.userData = { x: (K.rand() - 0.5) * 1.2, z: (K.rand() - 0.5) * 1.2, t0: T('frog') + K.rand() * 1.4, sp: 1 + K.rand() * 2 }; S.add(m); leaves.push(m); }
  on(t => { for (const l of leaves) { const u = l.userData, p = (t - u.t0) / 2.2; l.visible = p >= 0 && p <= 1; if (!l.visible) continue;
    l.position.set(u.x * (1 - p) + Math.sin(p * 9 * u.sp) * 0.1, 2.6 - 3.6 * p, u.z * (1 - p) + Math.cos(p * 7) * 0.08); l.rotation.set(p * 6 * u.sp, p * 4, p * 3); } });
  sfx(T('frog') + 0.2, 'rustle', 0.6);
  const frog = new THREE.Group(); { const g = new THREE.MeshStandardMaterial({ color: 0x5f9a2e, roughness: 0.6 });
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), g); b.scale.set(1, 0.62, 1.25); b.position.y = 0.045;
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf2f2e6 })); e.position.set(0.035 * s, 0.09, 0.06);
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshStandardMaterial({ color: 0x111111 })); p.position.set(0.036 * s, 0.093, 0.08); frog.add(e, p);
      const leg = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), g); leg.scale.set(1, 0.6, 1.6); leg.position.set(0.07 * s, 0.02, -0.05); frog.add(leg); }
    frog.add(b); frog.scale.setScalar(2.6); world.add(frog); }
  const tFrog = W('frog', 'frog'); const fA = V(1.25, 0, 1.0), fB = V(0.62, RIM_Y, 0.62), fC = V(0, -1.4, 0);
  on(t => { frog.visible = t >= T('frog') && t < tFrog + 1.2; if (!frog.visible) return;
    let p, a, b, hgt; if (t < tFrog - 0.15) { p = prog(t, T('frog') + 0.6, 0.55); a = fA; b = fB; hgt = 0.45; } else { p = prog(t, tFrog - 0.15, 0.75); a = fB; b = fC; hgt = 0.35; }
    frog.position.lerpVectors(a, b, p); frog.position.y += Math.sin(Math.PI * Math.min(p, 1)) * hgt * (b === fC ? (p < 0.5 ? 1 : 0.5) : 1);
    frog.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); });
  sfx(T('frog') + 0.75, 'hop', 0.6); sfx(tFrog - 0.1, 'hop', 0.6); sfx(tFrog + 0.85, 'plop', 0.9);

  // ---------- roof & lid ----------
  const tRoof = T('roof');
  const ridge = world.add(new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.13, 0.13), M.darkWood)); ridge.position.set(0, 2.68, 0);
  dropIn(ridge, tRoof + 0.2, 0.5, 2.2, { gain: 0.9, puffY: 2.62, puffSize: 0.5, spin: 0.1 });
  const ang = THREE.MathUtils.degToRad(32), PL = 1.2;
  for (const sgn of [1, -1]) { const panel = world.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, PL), M.thatch)); panel.rotation.x = sgn * ang;
    panel.position.set(0, 2.71 - 0.5 * PL * Math.sin(ang), sgn * 0.5 * PL * Math.cos(ang)); dropIn(panel, tRoof + (sgn > 0 ? 0.65 : 1.0), 0.5, 2.0, { gain: 0.9, puffY: 2.3, puffSize: 0.6, spin: 0.05 }); }
  const lidShape = new THREE.Shape(); const c0 = 0.24; const aa = Math.acos(c0 / (ringR + 0.12));
  lidShape.moveTo(Math.cos(Math.PI / 2 - aa) * (ringR + 0.12), c0); lidShape.absarc(0, 0, ringR + 0.12, Math.PI / 2 - aa, Math.PI / 2 + aa, false); lidShape.lineTo(Math.cos(Math.PI / 2 - aa) * (ringR + 0.12), c0);
  const lid = world.add(new THREE.Mesh(new THREE.ExtrudeGeometry(lidShape, { depth: 0.05, bevelEnabled: false }), M.wood)); lid.rotation.x = Math.PI / 2;
  const tLid = W('roof', 'lid') - 0.1; sfx(tLid + 0.5, 'slide', 0.8); sfx(tLid + 0.75, 'thud', 0.5);
  on(t => { lid.visible = t >= tLid; const p = ease.out(prog(t, tLid, 0.75)); lid.position.set(lerp(2.4, 0, p), RIM_Y + 0.055, 0); });

  // ---------- gravel ----------
  const NG = 240, gravel = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.035, 0), new THREE.MeshStandardMaterial({ color: 0x8a8278, roughness: 0.9 }), NG); S.add(gravel);
  const gd = Array.from({ length: NG }, () => ({ r: Math.sqrt(K.rand()) * 0.45, a: K.rand() * 6.283, t0: T('gravel') + 0.4 + K.rand() * 2.4, sp: 0.8 + K.rand() * 0.4 }));
  const gm = new THREE.Matrix4(), gq = new THREE.Quaternion(), gs = new THREE.Vector3(1, 1, 1), gp = new THREE.Vector3();
  on(t => { gravel.visible = t >= T('gravel') && t < E('gravel'); if (!gravel.visible) return;
    gd.forEach((g, i) => { const dtt = t - g.t0; let y; if (dtt < 0) y = 99; else { y = RIM_Y + 0.5 - 4.9 * dtt * dtt * g.sp * 2.2; if (y < WATER_Y) y = 99; }
      gp.set(Math.cos(g.a) * g.r, y, Math.sin(g.a) * g.r); gm.compose(gp, gq.setFromEuler(new THREE.Euler(dtt * 5, dtt * 3, 0)), gs); gravel.setMatrixAt(i, gm); });
    gravel.instanceMatrix.needsUpdate = true; });
  sfx(T('gravel') + 0.4, 'pour', 0.8); for (let i = 0; i < 6; i++) splash.puff(T('gravel') + 1.4 + i * 0.4, V((K.rand() - 0.5) * 0.4, WATER_Y, (K.rand() - 0.5) * 0.4), 0.4, 4);

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const tThisWell = W('seep', 'this') - 0.15, tThisWind = W('crank', 'this') - 0.2, tThisRat = W('click', 'this') - 0.2, tAnd = W('gravel', 'and') - 0.1;
  shot(0, T('dig'), V(7.0, 2.3, 8.6), V(0, 0.7, 0), V(5.0, 1.9, 6.2), V(0, 0.6, 0));
  shot(T('dig'), T('cave'), V(2.8, 3.4, 3.0), V(0, -0.5, 0), V(2.3, 2.9, 2.5), V(0, -0.7, 0));
  shot(T('cave'), T('stones'), V(1.25, 2.5, 1.15), V(0, -2.2, 0), V(1.05, 2.15, 0.95), V(0, -2.4, 0));
  sh.push({ t0: T('stones'), t1: T('seep'), orbit: { a0: 0.35, a1: 1.35, r: 3.7, h: 2.0, tgt: V(0, 0.3, 0) }, fov: 42 });
  shot(T('seep'), tThisWell, V(0.4, 2.4, 0.5), V(0, -6, 0), V(0.28, 1.95, 0.36), V(0, -6, 0), 46);
  shot(tThisWell, T('deep'), V(2.4, 0.95, 2.6), V(0, 0.42, 0), V(2.6, 1.05, 2.3), V(0, 0.42, 0));
  shot(T('deep'), T('haul'), V(0.06, 1.35, 0.12), V(0, -8, 0), V(0.05, 0.95, 0.1), V(0, -8, 0), 50);
  shot(T('haul'), T('haul') + 2.2, V(0.35, 2.0, -0.7), V(0, -5, 0), V(0.3, 1.9, -0.6), V(0, -2, 0), 46);
  shot(T('haul') + 2.2, tLog, V(2.9, 1.5, 3.3), V(0, 0.8, 0.6), V(2.7, 1.45, 3.0), V(0, 0.85, 0.6));
  shot(tLog, T('crank'), V(3.6, 2.6, 4.4), V(0, 1.1, 0), V(3.2, 2.4, 4.0), V(0, 1.15, 0));
  shot(T('crank'), tThisWind, V(2.95, 2.05, 1.45), V(1.55, 1.75, 0), V(2.75, 2.0, 1.3), V(1.55, 1.75, 0));
  shot(tThisWind, T('drop'), V(0.4, 1.7, 4.6), V(0, 1.2, 0), V(0.3, 1.75, 4.3), V(0, 1.2, 0));
  shot(T('drop'), tGo + 0.35, V(4.6, 2.0, 4.4), V(1.0, 1.2, 0.1), V(4.3, 1.95, 4.1), V(1.0, 1.2, 0.1), 46);
  shot(tGo + 0.35, T('teeth'), V(0.3, 2.2, -0.55), V(0, -8, 0), V(0.28, 2.0, -0.5), V(0, -8, 0), 46);
  shot(T('teeth'), T('click'), V(2.0, 2.4, -1.05), V(1.12, 1.98, -0.12), V(1.88, 2.32, -0.92), V(1.12, 1.98, -0.12), 40);
  shot(T('click'), tThisRat, V(1.78, 2.08, -0.8), V(1.12, 2.0, -0.12), V(1.7, 2.12, -0.7), V(1.12, 2.0, -0.12), 40);
  shot(tThisRat, T('frog'), V(3.3, 2.0, -3.0), V(0, 1.3, 0), V(3.1, 2.0, -2.8), V(0, 1.3, 0));
  shot(T('frog'), T('roof'), V(1.75, 1.95, 1.75), V(0.3, 0.3, 0.3), V(1.6, 1.88, 1.6), V(0.25, 0.3, 0.25), 44);
  shot(T('roof'), T('mud'), V(3.9, 2.9, 4.3), V(0, 1.5, 0), V(3.5, 2.7, 3.9), V(0, 1.5, 0));
  shot(T('mud'), T('gravel'), V(0.62, 1.82, 0.92), V(0, 1.0, 0), V(0.55, 1.76, 0.82), V(0, 1.0, 0), 40);
  shot(T('gravel'), tAnd, V(0.12, 2.0, -0.45), V(0, -8, 0.08), V(0.1, 1.85, -0.4), V(0, -8, 0.08), 46);
  shot(tAnd, T('village'), V(0.6, 1.8, -0.95), V(0, 1.0, 0), V(0.54, 1.74, -0.85), V(0, 1.0, 0), 40);
  shot(T('village'), T('end'), V(6.5, 1.4, 7.5), V(0, 0.9, 0), V(8.2, 4.6, 9.6), V(0, 0.7, 0));
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: -0.95, a1: -0.35, r: 5.2, h: 2.2, tgt: V(0, 1.25, 0) }, fov: 42 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(Math.cos(a) * o.r, o.h, Math.sin(a) * o.r); tg.copy(o.tgt); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    const shake = Math.max(0, 1 - Math.abs(t - tCrash) / 0.45) * 0.03; if (shake > 0) { tmp.x += Math.sin(t * 91) * shake; tmp.y += Math.cos(t * 77) * shake; }
    world.setCam(tmp, tg, s.fov);
  }
  // keep the sun's shadow box centred on the action
  world.sun.target.position.set(0, 0, 0);
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
