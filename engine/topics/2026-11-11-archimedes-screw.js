// topics/2026-11-11-archimedes-screw.js — "You built an Archimedes screw". Everything is a pure function of t.
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- layout ----------
  const RIVER_X = -1.2, WATER_Y = 0.06, BANK_X = 1.0, BANK_H = 2.4;
  const SL = 5.5, R_SHAFT = 0.09, R_BLADE = 0.34, R_CASE = 0.38, PITCH = 2.2, NB = 8, GAP = PITCH / NB;
  const TH = Math.asin(0.6); // 3 up for every 5 along (Vitruvius)
  const B1 = V(-3.0, 0.0, 0), DIR1 = V(Math.cos(TH), Math.sin(TH), 0);
  const B0 = V(-0.1, 0.78, 1.0); // build pose: bottom end, axis along +z

  const world = new K.World(canvas, spec.w, spec.h, {
    grassCount: 9000, aa: true,
    grassExclude: (x, z) => x < RIVER_X + 0.1 || x > BANK_X - 0.05,
  });
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 160);
  const splash = new K.Dust(world, 60, 'rgba(225,242,255,A)');
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);

  // ---------- river ----------
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2b6f8f, roughness: 0.08, metalness: 0.15, emissive: 0x0b2f3f });
  const river = new THREE.Mesh(new THREE.PlaneGeometry(240, 240, 1, 1), waterMat); river.rotation.x = -Math.PI / 2; river.position.set(RIVER_X - 120, WATER_Y, 0); river.receiveShadow = true; S.add(river);
  const mudEdge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 240), M.dirt); mudEdge.position.set(RIVER_X + 0.05, 0.02, 0); mudEdge.receiveShadow = true; S.add(mudEdge);
  // ripples: a few soft white streaks drifting downstream
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.18, depthWrite: false });
  const ripples = []; for (let i = 0; i < 26; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.9 + K.rand() * 1.2), rippleMat); r.rotation.x = -Math.PI / 2;
    r.userData = { x: RIVER_X - 0.5 - K.rand() * 9, z0: K.rand() * 40 - 20, sp: 0.5 + K.rand() * 0.4 }; S.add(r); ripples.push(r); }
  on(t => { for (const r of ripples) { const u = r.userData; r.position.set(u.x, WATER_Y + 0.005, ((u.z0 + t * u.sp + 20) % 40) - 20); } });

  // ---------- bank (raised fields) ----------
  const bankTop = world.ground.material.map.clone(); bankTop.repeat.set(119 / 7.8, 240 / 7.8); bankTop.needsUpdate = true;
  const bankFace = M.dirt.map.clone(); bankFace.repeat.set(60, 1.2); bankFace.needsUpdate = true;
  const faceMat = new THREE.MeshStandardMaterial({ map: bankFace, roughness: 1 }), topMat = new THREE.MeshStandardMaterial({ map: bankTop, roughness: 0.95 });
  const bank = new THREE.Mesh(new THREE.BoxGeometry(119, BANK_H, 240), [faceMat, faceMat, topMat, faceMat, faceMat, faceMat]);
  bank.position.set(BANK_X + 59.5, BANK_H / 2, 0); bank.receiveShadow = bank.castShadow = true; S.add(bank);
  // a lip of grass tufts along the edge
  const tuft = new THREE.InstancedMesh(new THREE.ConeGeometry(0.05, 0.22, 4), new THREE.MeshStandardMaterial({ color: 0x5d8a34, roughness: 1 }), 160);
  { const m4 = new THREE.Matrix4(); for (let i = 0; i < 160; i++) { const z = -20 + i * 0.25 + (K.rand() - 0.5) * 0.2, x = BANK_X + 0.05 + K.rand() * 0.25; if (Math.abs(z) < 0.7) { m4.makeTranslation(0, -9, 0); } else m4.makeTranslation(x, BANK_H + 0.1, z); tuft.setMatrixAt(i, m4); } }
  S.add(tuft);

  // ---------- fields ----------
  const ROWS = 7, PER = 14, NCROP = ROWS * PER;
  const crops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.13, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), NCROP);
  crops.castShadow = true; S.add(crops);
  const cropPos = []; for (let i = 0; i < ROWS; i++) for (let j = 0; j < PER; j++) cropPos.push(V(4.5 + i * 0.85, BANK_H, -3.4 + j * 0.523 + (K.rand() - 0.5) * 0.08));
  const furrowMat = new THREE.MeshStandardMaterial({ map: M.dirt.map, roughness: 1, color: 0xb59a7a });
  for (let i = 0; i < ROWS; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 7.4), furrowMat); f.position.set(4.5 + i * 0.85, BANK_H + 0.02, 0); f.receiveShadow = true; S.add(f); }
  const DRY = new THREE.Color(0x8a6a3a), GREEN = new THREE.Color(0x3f8f2a), cc = new THREE.Color();
  const cm = new THREE.Matrix4(), cq = new THREE.Quaternion(), cs = new THREE.Vector3(), cp = new THREE.Vector3();
  const tGreen = T('green');
  on(t => { cropPos.forEach((p, i) => { const row = Math.floor(i / PER);
      const d = Math.abs(p.z) * 0.08 + row * 0.12; let g = prog(t, tGreen + 0.3 + d, 1.0);
      if (row === 0 && t >= T('carry') + 2.0) g = Math.max(g, 0.35 * prog(t, T('carry') + 2.0, 1.5));
      cc.copy(DRY).lerp(GREEN, g); crops.setColorAt(i, cc);
      const s = 0.65 + 0.55 * ease.outBack(g); cs.set(s, s * (0.8 + 0.8 * g), s); cp.set(p.x, p.y + 0.08 * s, p.z); cq.setFromEuler(new THREE.Euler(0, i * 1.7, 0)); cm.compose(cp, cq, cs); crops.setMatrixAt(i, cm); });
    crops.instanceMatrix.needsUpdate = true; crops.instanceColor.needsUpdate = true; });
  // sunset tint for "by sunset"
  const SUN0 = world.sun.color.clone(), SUNSET = new THREE.Color(0xff9a5a);
  on(t => { const k = prog(t, T('slow'), 0.8) * (1 - prog(t, T('log') - 0.3, 0.5)); world.sun.color.copy(SUN0).lerp(SUNSET, k); world.sun.intensity = 2.6 - 0.9 * k; });

  // ---------- helpers ----------
  const LAND = 0.7;
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) dust.puff(tl, opts.puffAt || V(base.x, Math.max(0, base.y - (opts.half ?? 0)), base.z), opts.puffSize ?? 0.8, opts.puffCount ?? 9);
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.8);
    on(t => { obj.visible = t >= t0; if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.3), base_r.y + h * (opts.spin ?? 0.3) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop', gain = 0.6, puff = true) { const s0 = obj.scale.clone(); if (sound) sfx(t0, sound, gain);
    if (puff) { obj.updateMatrixWorld(true); dust.puff(t0 + 0.05, obj.getWorldPosition(new THREE.Vector3()), 0.4, 5); }
    on(t => { obj.visible = t >= t0; const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const ropeGeo = new THREE.CylinderGeometry(1, 1, 1, 8); ropeGeo.translate(0, -0.5, 0);
  function between(mesh, a, b) { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); mesh.position.copy(a); mesh.scale.y = Math.max(len, 0.001);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); }

  // ---------- person ----------
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
  const man = makePerson(0x2f5f8a);
  const bucket = world.add(K.bucket(M));
  const bWater = new THREE.Mesh(new THREE.CircleGeometry(0.175, 16), new THREE.MeshStandardMaterial({ color: 0x1f5f80, roughness: 0.4, emissive: 0x062635 })); bWater.rotation.x = -Math.PI / 2; bWater.position.y = 0.12; bucket.add(bWater);

  // ---------- trestles & pitch pot ----------
  const trestles = [];
  for (const z of [1.6, 5.9]) { const g = new THREE.Group(); const top = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.12), M.darkWood); top.position.y = 0.62 - 0.04 - 0.36; g.add(top);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.05), M.darkWood); l.position.set(sx * 0.3, 0.29 - 0.36 + 0.02, sz * 0.05); l.rotation.z = sx * 0.18; l.rotation.x = sz * 0.12; g.add(l); }
    g.position.set(B0.x, 0.36, z); world.add(g); trestles.push(g); }
  trestles.forEach((g, i) => dropIn(g, T('log') + 0.05 + i * 0.25, 0.45, 2.0, { gain: 0.7, puffSize: 0.5, spin: 0.15, half: 0.36 }));
  const pot = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.26, 14), new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.9 })); b.position.y = 0.13;
    const tar = new THREE.Mesh(new THREE.CircleGeometry(0.155, 14), new THREE.MeshStandardMaterial({ color: 0x0c0907, roughness: 0.25, metalness: 0.2 })); tar.rotation.x = -Math.PI / 2; tar.position.y = 0.24; pot.add(b, tar); }
  pot.position.set(-0.85, 0, 2.6); world.add(pot); popIn(pot, W('strips', 'pitch') - 0.15, 0.35, 'thud', 0.6);

  on(t => { const k = t < T('tilt') + 0.6; trestles.forEach(g => { if (t >= T('tilt') + 0.6) g.visible = false; }); if (t >= T('tilt') + 0.6) pot.visible = false; });
  // ---------- the screw: tilt (pose) group > spin group, axis along local +x from u=0 to u=SL ----------
  const pose = new THREE.Group(); S.add(pose); const spinG = new THREE.Group(); pose.add(spinG);
  const roughLog = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, SL, 7), M.darkWood); roughLog.material = M.darkWood.clone(); roughLog.material.flatShading = true;
  roughLog.rotation.z = -Math.PI / 2; roughLog.position.x = SL / 2; roughLog.castShadow = true; spinG.add(roughLog);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(R_SHAFT, R_SHAFT, SL, 18), M.wood); shaft.rotation.z = -Math.PI / 2; shaft.position.x = SL / 2; shaft.castShadow = true; spinG.add(shaft);
  // end marks: 4 diameters = 8 parts on each end
  const marks = [];
  for (const u of [-0.002, SL + 0.002]) for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.006, 2 * R_SHAFT * 0.96, 0.012), new THREE.MeshBasicMaterial({ color: 0x24160c }));
    m.position.x = u; m.rotation.x = i * Math.PI / 4; spinG.add(m); marks.push({ m, end: u < 1 ? 0 : 1, i }); }
  // helix blades (non-indexed, ordered along u so drawRange reveals them along the log)
  const NSEG = 260, hp = [];
  for (let j = 0; j < NSEG; j++) { const u0 = j / NSEG * SL, u1 = (j + 1) / NSEG * SL;
    for (let b = 0; b < NB; b++) { const ph = b * Math.PI * 2 / NB, a0 = ph + Math.PI * 2 * u0 / PITCH, a1 = ph + Math.PI * 2 * u1 / PITCH;
      const P = (u, a, r) => [u, r * Math.cos(a), r * Math.sin(a)];
      const p00 = P(u0, a0, R_SHAFT * 0.9), p01 = P(u0, a0, R_BLADE), p10 = P(u1, a1, R_SHAFT * 0.9), p11 = P(u1, a1, R_BLADE);
      hp.push(...p00, ...p01, ...p11, ...p00, ...p11, ...p10); } }
  const helixGeo = new THREE.BufferGeometry(); helixGeo.setAttribute('position', new THREE.Float32BufferAttribute(hp, 3)); helixGeo.computeVertexNormals();
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xc9965c, roughness: 0.75, side: THREE.DoubleSide });
  const helix = new THREE.Mesh(helixGeo, bladeMat); helix.castShadow = true; spinG.add(helix);
  const PER_SEG = NB * 6;
  // casing planks
  const NPL = 14, plankMat = new THREE.MeshStandardMaterial({ map: M.wood.map, color: 0xffffff, roughness: 0.85, transparent: true, opacity: 1 });
  const planks = [];
  for (let i = 0; i < NPL; i++) { const a = i / NPL * Math.PI * 2, g = new THREE.Group(); g.rotation.x = a; spinG.add(g);
    const p = new THREE.Mesh(new THREE.BoxGeometry(SL, 0.04, 2 * Math.PI * R_CASE / NPL * 1.02), plankMat); p.position.set(SL / 2, R_CASE, 0); p.castShadow = true; g.add(p); planks.push(p); }
  const hoops = []; for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.TorusGeometry(R_CASE + 0.03, 0.02, 8, 36), M.iron); h.rotation.y = Math.PI / 2; h.position.x = 0.3 + i * (SL - 0.6) / 4; h.castShadow = true; spinG.add(h); hoops.push(h); }
  // pins & crank
  const pins = [-0.12, SL + 0.12].map(u => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 10), M.iron); p.rotation.z = Math.PI / 2; p.position.x = u; spinG.add(p); return p; });
  const crank = new THREE.Group(); crank.position.x = SL + 0.26; spinG.add(crank);
  { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.07), M.darkWood); arm.position.y = -0.15; const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 8), M.darkWood);
    handle.rotation.z = Math.PI / 2; handle.position.set(0.12, -0.3, 0); crank.add(arm, handle); crank.traverse(c => { if (c.isMesh) c.castShadow = true; }); }
  // frame (in pose group, doesn't spin): two side beams and two cross pieces
  const frame = [];
  for (const z of [-0.56, 0.56]) { const b = new THREE.Mesh(new THREE.BoxGeometry(SL + 0.5, 0.11, 0.1), M.darkWood); b.position.set(SL / 2, -0.04, z); b.castShadow = true; pose.add(b); frame.push(b); }
  const cross = [-0.12, SL + 0.12].map(u => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 1.22), M.darkWood); c.position.set(u, -0.04, 0); c.castShadow = true; pose.add(c); return c; });
  // posts under the frame (world space)
  const topPosts = [-0.56, 0.56].map(z => { const p = world.add(K.post(0.72, 0.06, M.darkWood)); p.position.set(1.25, BANK_H, z); return p; });
  const lowPosts = [-0.56, 0.56].map(z => { const p = world.add(K.post(0.9, 0.06, M.darkWood)); p.position.set(-2.62, -0.6, z); return p; });

  // ---------- build-sequence timing ----------
  const tLog = T('log') + 0.6, tSmooth = W('log', 'smooth') - 0.1, tMark = W('log', 'mark');
  const tWind = W('strips', 'wind') - 0.2, tWindEnd = E('strips') - 0.15;
  const tLayer = T('blades') + 0.1, tLayerEnd = W('blades', 'this') - 0.25;
  const tPl = W('planks', 'wrap') - 0.05, tSeal = W('planks', 'seal'), tBind = W('planks', 'bind'), tPlEnd = E('planks');
  const tTilt = T('tilt') + 0.2, tTiltEnd = W('tilt', 'tip') + 1.2;
  const tPin = W('crank', 'pin') - 0.1, tFrame = W('crank', 'frame') - 0.35, tHandle = W('crank', 'handle') - 0.15;
  const tSpin = T('turn') + 0.25, REV = 0.6; // revolutions per second
  // log drop + rough -> smooth
  const logLand = tLog + 0.55 * LAND; sfx(logLand, 'thud', 1.0); dust.puff(logLand, V(B0.x, 0.55, 1.6), 0.6, 6); dust.puff(logLand, V(B0.x, 0.55, 5.9), 0.6, 6);
  for (let i = 0; i < 5; i++) { const tt = tSmooth + i * 0.22; sfx(tt, 'scrape', 0.6); dust.puff(tt, V(B0.x, B0.y, B0.z + 0.6 + i * 1.0), 0.35, 5); }
  marks.forEach(({ m, end, i }) => { const tt = tMark + 0.2 + i * 0.22 + end * 0.12; m.userData.t0 = tt; if (end === 0) sfx(tt, 'scrape', 0.35); });
  for (let tt = tWind + 0.1; tt < tWindEnd; tt += 0.55) sfx(tt, 'creak', 0.35);
  for (let i = 0; i < 4; i++) { const tt = tLayer + i * (tLayerEnd - tLayer) / 4; sfx(tt + 0.1, 'thud', 0.5); dust.puff(tt + 0.1, V(B0.x, B0.y + 0.2, B0.z + 1 + i * 1.1), 0.4, 4); }
  const plankT = planks.map((p, i) => tPl + i * (tSeal - tPl - 0.1) / NPL); plankT.forEach(tt => sfx(tt + 0.22, 'clack', 0.45));
  for (let tt = tSeal + 0.05; tt < tBind - 0.1; tt += 0.3) sfx(tt, 'scrape', 0.4);
  const hoopT = hoops.map((h, i) => tBind + 0.25 + i * (tPlEnd - tBind - 0.35) / 5); hoopT.forEach(tt => sfx(tt, 'clack', 0.8));
  sfx(tTilt + 0.15, 'whoosh', 0.8); sfx(tTiltEnd - 0.2, 'splash', 1.0); splash.puff(tTiltEnd - 0.2, V(B1.x, WATER_Y, 0), 1.1, 18); sfx(tTiltEnd - 0.05, 'thud', 0.8);
  sfx(T('stuck') + 0.4, 'creak', 0.3);
  frame.forEach((b, i) => sfx(tFrame + 0.3 + i * 0.25, 'thud', 0.9)); topPosts.forEach((p, i) => dropIn(p, tFrame - 0.25 + i * 0.2, 0.4, 1.6, { gain: 0.8, puffSize: 0.4, spin: 0.1 }));
  lowPosts.forEach((p, i) => { sfx(tFrame - 0.1 + i * 0.2, 'splash', 0.5); splash.puff(tFrame - 0.1 + i * 0.2, V(-2.62, WATER_Y, p.position.z), 0.5, 6); });
  pins.forEach((p, i) => sfx(tPin + i * 0.3, 'clack', 0.8));
  popIn(crank, tHandle, 0.4, 'thud', 0.8, false);

  const qBuild = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)), qFinal = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, TH));
  const spinAt = t => { if (t < tSpin) return 0; const d = t - tSpin, ramp = 0.8; const turns = d < ramp ? REV * d * d / (2 * ramp) : REV * (d - ramp / 2); return turns * Math.PI * 2; };
  on(t => {
    // pose
    pose.visible = t >= tLog;
    if (t < tTilt) { const p = clamp01((t - tLog) / 0.55); let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.04 * Math.sin(Math.PI * q) * (1 - q); }
      pose.position.set(B0.x, B0.y + h * 2.4, B0.z); pose.quaternion.copy(qBuild); }
    else { const p = ease.inOut(prog(t, tTilt, tTiltEnd - tTilt)); pose.quaternion.slerpQuaternions(qBuild, qFinal, p); pose.position.lerpVectors(B0, B1, p); pose.position.y += Math.sin(Math.PI * p) * 2.2; }
    // log surface
    roughLog.visible = t < tSmooth + 0.5; shaft.visible = !roughLog.visible;
    for (const { m } of marks) { m.visible = t >= m.userData.t0; m.scale.setScalar(Math.max(0.001, ease.out(prog(t, m.userData.t0, 0.2)))); }
    // blades: strips wind along, then layers build outward
    helix.visible = t >= tWind;
    helix.geometry.setDrawRange(0, Math.floor(NSEG * ease.inOut(prog(t, tWind, tWindEnd - tWind))) * PER_SEG);
    const layer = prog(t, tLayer, tLayerEnd - tLayer), steps = 4, lk = Math.min(steps, Math.floor(layer * steps) + ease.out(clamp01((layer * steps % 1) / 0.5)) * (layer < 1 ? 1 : 0));
    const rs = lerp(0.33, 1.0, layer >= 1 ? 1 : lk / steps); helix.scale.set(1, rs, rs);
    // planks
    planks.forEach((p, i) => { const k = prog(t, plankT[i], 0.3); p.visible = t >= plankT[i]; p.position.y = R_CASE + (1 - ease.out(k)) * 0.9; });
    const seal = prog(t, tSeal, tBind - tSeal); plankMat.color.setRGB(1 - 0.38 * seal, 1 - 0.42 * seal, 1 - 0.46 * seal);
    hoops.forEach((h, i) => { h.visible = t >= hoopT[i]; h.scale.setScalar(Math.max(0.001, ease.outBack(prog(t, hoopT[i], 0.3)))); });
    // see-through casing while the water climbs
    const xr = prog(t, T('turn') - 0.1, 0.5) * (1 - prog(t, T('ditch') + 0.4, 0.8)); plankMat.opacity = 1 - 0.8 * xr; plankMat.depthWrite = xr < 0.05;
    // frame + pins
    frame.forEach((b, i) => { const t0 = tFrame + 0.3 + i * 0.25 - 0.3; b.visible = t >= t0; b.position.y = -0.04 + (1 - ease.out(prog(t, t0, 0.3))) * 1.2; });
    cross.forEach(c => { c.visible = t >= tFrame + 0.5; c.scale.setScalar(Math.max(0.001, ease.outBack(prog(t, tFrame + 0.5, 0.3)))); });
    lowPosts.forEach((p, i) => { const t0 = tFrame - 0.3 + i * 0.2; p.visible = t >= t0; p.position.y = -0.6 + (1 - ease.out(prog(t, t0, 0.3))) * 1.5; });
    pins.forEach((p, i) => { p.visible = t >= tPin + i * 0.3; p.scale.setScalar(Math.max(0.001, ease.outBack(prog(t, tPin + i * 0.3, 0.3)))); });
    // spin
    spinG.rotation.x = -spinAt(t);
  });
  for (let tt = tSpin + 0.6; tt < spec.duration; tt += 1 / REV) sfx(tt, 'creak', 0.35);

  // ---------- water: pockets inside the screw (pose frame, low side = local -y) ----------
  const pocketMat = new THREE.MeshStandardMaterial({ color: 0x2f86b0, roughness: 0.15, metalness: 0.1, emissive: 0x0d3a52 });
  const xrayMat = new THREE.MeshBasicMaterial({ color: 0x3fa6e0, transparent: true, opacity: 0.92, depthTest: false });
  const NP = 24, pockets = []; for (let i = 0; i < NP; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), xrayMat); m.renderOrder = 10; m.scale.set(GAP * 0.42, 0.075, 0.2); pose.add(m); pockets.push(m); }
  const adv = t => spinAt(t) / (Math.PI * 2) * PITCH;
  const tOut = (() => { let a = tSpin; while (adv(a) < SL && a < 200) a += 0.01; return a; })();
  on(t => { const A = adv(t), wet = t >= tSpin; let k = 0;
    if (wet) { const nMax = Math.floor(A / GAP), nMin = Math.ceil((A - SL) / GAP);
      for (let n = nMax; n >= nMin && k < NP; n--) { const u = A - n * GAP; if (u < 0 || u > SL) continue; const m = pockets[k++]; m.visible = true;
        const sw = 0.85 + 0.15 * Math.sin(t * 6 + n); m.position.set(u - GAP * 0.5 + GAP * 0.5, -(R_CASE - 0.13), 0); m.scale.set(GAP * 0.45, 0.1 * sw, 0.22); } }
    xrayMat.depthTest = !(t >= T('turn') && t < T('ditch'));
    for (; k < NP; k++) pockets[k].visible = false; });
  // leak drips (pose frame): droplets slide from one pocket back to the one below
  const dripMat = new THREE.MeshStandardMaterial({ color: 0x5ab0d8, roughness: 0.1, emissive: 0x123f55 });
  const drips = []; for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), xrayMat); d.renderOrder = 11; pose.add(d); drips.push(d); }
  const tLeak = W('leak', 'leaks') - 0.1, tLeakEnd = E('catch');
  on(t => { drips.forEach((d, i) => { const per = 1.1, ph = (t - tLeak - i * per / drips.length * 2) / per; d.visible = t >= tLeak && t < tLeakEnd && ph >= 0;
    if (!d.visible) return; const f = ph % 1, A = adv(t), base = 2.4 + (i % 3) * 1.0; const u0 = A - Math.floor((A - base) / GAP) * GAP;
    d.position.set(u0 - f * GAP * 0.9, -(R_CASE - 0.1) + 0.03 * Math.sin(f * Math.PI), (i % 2 ? 1 : -1) * 0.12); }); });
  for (let tt = tLeak + 0.2; tt < E('leak'); tt += 0.55) sfx(tt, 'click', 0.25);

  // ---------- outflow, trough, ditch ----------
  const trough = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.42), M.darkWood); b.position.y = 0.02; trough.add(b);
    for (const z of [-0.2, 0.2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 0.04), M.darkWood); s.position.set(0, 0.08, z); trough.add(s); } }
  trough.position.set(1.95, BANK_H, 0); world.add(trough); popIn(trough, tHandle + 0.45, 0.35, 'thud', 0.6);
  const lipW = V(); const tmpQ = new THREE.Quaternion();
  const stream = new THREE.Mesh(ropeGeo, new THREE.MeshStandardMaterial({ color: 0x4fa3cf, roughness: 0.1, transparent: true, opacity: 0.85, emissive: 0x0d3a52 })); stream.scale.set(0.07, 1, 0.07); S.add(stream);
  const troughWater = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.02, 0.34), pocketMat); troughWater.position.set(1.95, BANK_H + 0.1, 0); S.add(troughWater);
  for (let tt = tOut + 0.1; tt < spec.duration; tt += 0.5) { splash.puff(tt, V(1.72, BANK_H + 0.1, 0), 0.35, 4); }
  sfx(tOut + 0.05, 'splash', 0.9); for (let tt = tOut + 0.9; tt < spec.duration; tt += 2.2) sfx(tt, 'splash', 0.35);
  const ditchMat = new THREE.MeshStandardMaterial({ map: M.dirt.map, color: 0x6a5038, roughness: 1 });
  const D1 = { x0: 2.6, x1: 4.15 }, D2 = { z0: -3.7, z1: 3.7 };
  const ditchA = new THREE.Mesh(new THREE.BoxGeometry(1, 0.03, 0.34), ditchMat), ditchB = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 1), ditchMat); S.add(ditchA, ditchB);
  const wA = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 0.24), pocketMat), wB = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 1), pocketMat); S.add(wA, wB);
  ditchA.receiveShadow = ditchB.receiveShadow = true;
  const tDig = W('ditch', 'dig') - 0.05, tDigMid = tDig + 1.0, tDigEnd = E('ditch') - 0.1, tFlow = T('green') - 0.1;
  for (let i = 0; i < 8; i++) { const tt = tDig + 0.1 + i * (tDigEnd - tDig - 0.2) / 8; sfx(tt, 'scrape', 0.6);
    const p = i < 3 ? V(lerp(D1.x0, D1.x1, (i + 0.5) / 3), BANK_H, 0) : V(D1.x1, BANK_H, lerp(D2.z0, D2.z1, (i - 2.5) / 5)); dust.puff(tt, p, 0.5, 5); }
  sfx(tFlow + 0.2, 'splash', 0.6);
  on(t => {
    pose.updateMatrixWorld(true); lipW.set(SL + 0.02, -(R_CASE - 0.08), 0).applyMatrix4(pose.matrixWorld);
    const flowing = t >= tOut; stream.visible = flowing; troughWater.visible = flowing; troughWater.scale.y = 1;
    if (flowing) { const p = ease.out(prog(t, tOut, 0.35)); const end = V(lipW.x + 0.12, lerp(lipW.y, BANK_H + 0.1, p), 0); between(stream, lipW, end); stream.scale.x = stream.scale.z = 0.06 + 0.01 * Math.sin(t * 20); }
    const a = ease.inOut(prog(t, tDig, tDigMid - tDig)), b = ease.inOut(prog(t, tDigMid, tDigEnd - tDigMid));
    ditchA.visible = a > 0.001; ditchA.scale.x = Math.max(0.001, (D1.x1 - D1.x0) * a); ditchA.position.set(D1.x0 + (D1.x1 - D1.x0) * a / 2, BANK_H + 0.006, 0);
    ditchB.visible = b > 0.001; ditchB.scale.z = Math.max(0.001, (D2.z1 - D2.z0) * b); ditchB.position.set(D1.x1, BANK_H + 0.006, 0);
    const fa = ease.out(prog(t, tFlow, 0.8)), fb = ease.out(prog(t, tFlow + 0.6, 1.4));
    wA.visible = fa > 0.001; wA.scale.x = Math.max(0.001, (D1.x1 - D1.x0) * fa); wA.position.set(D1.x0 + (D1.x1 - D1.x0) * fa / 2, BANK_H + 0.016, 0);
    wB.visible = fb > 0.001; wB.scale.z = Math.max(0.001, (D2.z1 - D2.z0) * fb); wB.position.set(D1.x1, BANK_H + 0.016, 0);
  });

  // ---------- spill: a bucket of water poured over the open blades ----------
  const spillB = world.add(K.bucket(M)); const sbW = bWater.clone(); spillB.add(sbW);
  const tPour = W('spill', 'water') - 0.25, NDROP = 40;
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), dripMat, NDROP); S.add(drops);
  const dd = Array.from({ length: NDROP }, () => ({ t0: tPour + 0.35 + K.rand() * 1.4, dx: (K.rand() - 0.5) * 0.25, dz: (K.rand() - 0.5) * 0.5, vx: (K.rand() - 0.5) * 0.6 }));
  const dm = new THREE.Matrix4(), dq = new THREE.Quaternion(), dsv = new THREE.Vector3(1, 1, 1), dpv = new THREE.Vector3();
  sfx(tPour + 0.4, 'splash', 0.8); splash.puff(tPour + 1.0, V(B0.x, 0.05, 3.6), 0.6, 8); splash.puff(tPour + 1.5, V(B0.x, 0.05, 3.4), 0.5, 6);
  on(t => { const vis = t >= T('spill') && t < T('planks') + 0.2; spillB.visible = vis; drops.visible = vis;
    if (!vis) return; const tilt = ease.inOut(prog(t, tPour, 0.4)) * (1 - ease.inOut(prog(t, tPour + 1.9, 0.4)));
    spillB.position.set(B0.x + 0.15, 1.55, 3.5); spillB.rotation.set(0, 0, tilt * 1.9); sbW.visible = t < tPour + 0.9;
    dd.forEach((d, i) => { const a = t - d.t0; let y = 99; if (a >= 0) { y = 1.5 - 4.9 * a * a; if (y < 0.03) y = 99; if (a < 0.25 && y < B0.y + 0.36 && Math.abs(d.dx) < 0.3) y = Math.max(y, B0.y + 0.3 - a * 0.6); }
      dpv.set(B0.x + d.dx + d.vx * Math.max(0, a), y, 3.5 + d.dz); dm.compose(dpv, dq, dsv); drops.setMatrixAt(i, dm); }); drops.instanceMatrix.needsUpdate = true; });

  // ---------- person poses ----------
  const handW = () => { man.updateMatrixWorld(true); return man.armL.localToWorld(new THREE.Vector3(0, -0.6, 0)); };
  const tCarryB = W('carry', 'one') - 0.15;
  on(t => {
    man.armL.rotation.set(0, 0, 0); man.armR.rotation.set(0, 0, 0); man.rotation.set(0, 0, 0); bucket.visible = false; bucket.rotation.set(0, 0, 0); bWater.visible = true;
    if (t < T('carry')) { man.visible = true; man.position.set(3.85, BANK_H, 1.4); man.rotation.y = Math.PI / 2 + 0.5 + 0.05 * Math.sin(t * 1.3); bucket.visible = true; bucket.position.set(3.55, BANK_H + 0.17, 1.95); bWater.visible = false; return; }
    if (t < tCarryB) { // at the river, lifting a full bucket
      man.visible = true; man.position.set(-1.45, -0.05, 1.55); man.rotation.y = -Math.PI / 2;
      const lift = ease.inOut(prog(t, T('carry') + 0.4, 0.9)); man.armL.rotation.x = lerp(-0.15, -0.9, lift); man.armR.rotation.x = lerp(-0.15, -0.9, lift) * 0.8;
      const h = handW(); bucket.visible = true; bucket.position.set(h.x, Math.max(h.y - 0.37, WATER_Y + 0.08), h.z); return; }
    if (t < T('log')) { // on the bank pouring, then tired at sunset
      man.visible = true; const pour = t < T('slow');
      man.position.set(4.05, BANK_H, pour ? -0.6 : -1.5); man.rotation.y = pour ? Math.PI / 2 : Math.PI / 2 + 0.7;
      if (pour) { const p = ease.inOut(prog(t, tCarryB + 0.2, 0.6)); man.armL.rotation.x = -1.0 * p - 0.2; man.armR.rotation.x = -1.0 * p - 0.2;
        const h = handW(); bucket.visible = true; bucket.position.set(h.x + 0.05, h.y - 0.3, h.z); bucket.rotation.set(0, 0, -1.6 * p); bWater.visible = p < 0.6; }
      else { man.rotation.x = 0.12; man.armL.rotation.x = 0.05; man.armR.rotation.x = 0.05; bucket.visible = true; bucket.position.set(4.35, BANK_H + 0.17, -1.85); bWater.visible = false; }
      return; }
    if (t < tHandle + 0.3) { man.visible = false; return; }
    // turning the crank on the bank
    man.visible = true; man.position.set(2.35, BANK_H, 0.42); man.rotation.y = -Math.PI / 2 - 0.25; const s = spinAt(t);
    man.armR.rotation.x = -1.35 + 0.3 * Math.sin(s); man.armL.rotation.x = -1.35 + 0.3 * Math.sin(s + 0.4); man.armR.rotation.z = 0.25; man.armL.rotation.z = -0.1;
    man.rotation.x = 0.04 * Math.sin(s);
  });
  sfx(T('carry') + 0.5, 'splash', 0.7); splash.puff(T('carry') + 0.5, V(-1.9, WATER_Y, 1.55), 0.5, 8);
  sfx(tCarryB + 0.5, 'splash', 0.6); splash.puff(tCarryB + 0.6, V(4.55, BANK_H + 0.05, -0.6), 0.5, 8);

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const BC = V(B0.x, B0.y, B0.z + SL / 2); // build-pose centre
  const tHelix = W('blades', 'this') - 0.15, tCrankHero = W('crank', 'this', 1) - 0.15, tScrewHero = W('climb', 'this') - 0.15;
  shot(0, T('carry'), V(-3.6, 5.4, 7.2), V(4.6, 2.3, 0.4), V(-2.6, 5.0, 6.2), V(4.8, 2.4, 0.4));
  shot(T('carry'), tCarryB, V(0.6, 1.9, 4.6), V(-1.6, 0.7, 1.4), V(0.4, 1.95, 4.3), V(-1.6, 0.8, 1.4));
  shot(tCarryB, T('slow'), V(7.0, 4.3, 2.2), V(4.4, 2.8, -0.6), V(6.7, 4.2, 1.9), V(4.4, 2.8, -0.6));
  shot(T('slow'), T('log'), V(10.5, 5.6, 5.2), V(5.6, 2.5, -0.6), V(10.0, 5.0, 4.6), V(5.6, 2.5, -0.6));
  shot(T('log'), tMark, V(-2.7, 2.5, -0.9), V(B0.x, 0.7, 3.0), V(-2.4, 2.3, -0.4), V(B0.x, 0.7, 3.2));
  shot(tMark, T('strips'), V(-0.55, 0.98, 0.25), V(B0.x, 0.78, 1.0), V(-0.5, 0.95, 0.35), V(B0.x, 0.78, 1.0), 40);
  shot(T('strips'), tWind + 0.6, V(-1.9, 1.9, 1.3), V(0.2, 0.4, 3.1), V(-1.8, 1.9, 1.5), V(0.1, 0.5, 3.1));
  shot(tWind + 0.6, T('blades'), V(-1.9, 1.8, 0.6), V(B0.x, B0.y, 3.0), V(-1.9, 1.8, 3.0), V(B0.x, B0.y, 5.2));
  shot(T('blades'), tHelix, V(-2.4, 2.3, 0.8), V(B0.x, B0.y, 3.4), V(-2.1, 2.1, 1.3), V(B0.x, B0.y, 3.6));
  shot(tHelix, T('spill'), V(-1.6, 1.5, 1.6), V(B0.x, B0.y, 3.3), V(-1.6, 1.45, 1.9), V(B0.x, B0.y, 3.4), 40);
  shot(T('spill'), T('planks'), V(-2.2, 1.6, 2.0), V(B0.x, 0.85, 3.5), V(-2.1, 1.55, 2.2), V(B0.x, 0.8, 3.5));
  shot(T('planks'), tBind, V(-2.6, 2.3, 7.6), V(B0.x, B0.y, 3.8), V(-2.4, 2.1, 6.8), V(B0.x, B0.y, 3.6));
  shot(tBind, T('tube'), V(-2.2, 1.7, 1.4), V(B0.x, B0.y, 3.2), V(-2.1, 1.7, 1.9), V(B0.x, B0.y, 3.6));
  sh.push({ t0: T('tube'), t1: T('tilt'), orbit: { a0: 2.99, a1: 2.29, r: 4.0, h: 2.1, tgt: BC.clone() }, fov: 42 });
  shot(T('tilt'), T('stuck'), V(-5.6, 3.6, 11.8), V(0.0, 1.9, 0), V(-5.2, 3.4, 11.0), V(0.0, 1.9, 0));
  shot(T('stuck'), T('crank'), V(-5.2, 1.4, 4.4), V(-1.0, 1.4, 0), V(-5.0, 1.45, 4.1), V(-1.0, 1.4, 0));
  shot(T('crank'), tHandle - 0.2, V(-3.0, 3.4, 8.2), V(-0.8, 1.5, 0), V(-2.6, 3.3, 7.6), V(-0.8, 1.6, 0));
  shot(tHandle - 0.2, tCrankHero, V(2.7, 4.3, 4.3), V(1.5, 3.2, 0), V(2.3, 3.95, 3.3), V(1.5, 3.25, 0));
  shot(tCrankHero, T('turn'), V(1.9, 3.8, 2.6), V(1.6, 3.35, 0), V(1.95, 3.75, 2.4), V(1.6, 3.35, 0), 40);
  shot(T('turn'), T('climb'), V(-3.7, 1.7, 3.2), V(-2.3, 0.5, 0), V(-3.2, 1.9, 3.2), V(-1.8, 0.8, 0));
  shot(T('climb'), tScrewHero, V(-2.0, 2.4, 3.6), V(-1.4, 1.1, 0), V(0.9, 4.4, 3.8), V(1.1, 3.0, 0));
  shot(tScrewHero, T('leak'), V(-5.6, 3.7, 11.8), V(0.1, 2.0, 0), V(-5.3, 3.6, 11.2), V(0.1, 2.0, 0));
  shot(T('leak'), T('catch'), V(-0.5, 2.9, 2.7), V(-0.6, 1.75, 0), V(-0.6, 2.85, 2.5), V(-0.6, 1.75, 0), 40);
  shot(T('catch'), T('ditch'), V(-1.4, 2.3, 2.8), V(-1.2, 1.3, 0), V(-0.2, 3.2, 2.9), V(0.0, 2.15, 0), 40);
  shot(T('ditch'), T('green'), V(2.4, 5.6, 6.6), V(3.6, 2.4, 0), V(2.8, 5.8, 6.8), V(3.9, 2.4, 0));
  shot(T('green'), T('end'), V(7.5, 5.0, 7.5), V(3.0, 2.3, 0), V(8.8, 6.8, 9.4), V(2.6, 2.1, 0));
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 1.15, a1: 0.8, r: 9.5, h: 6.0, tgt: V(2.0, 2.2, 0) }, fov: 42 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(o.tgt.x + Math.cos(a) * o.r, o.h, o.tgt.z + Math.sin(a) * o.r); tg.copy(o.tgt); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    world.setCam(tmp, tg, s.fov);
  }
  world.sun.target.position.set(1, 1, 0);
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
