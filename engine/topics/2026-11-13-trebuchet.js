// topics/2026-11-13-trebuchet.js — "You built a trebuchet". Everything is a pure function of t.
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z), D = THREE.MathUtils.degToRad;

  // ---------- layout ----------
  const PIV = V(0, 4.0, 0), LS = 2.0, LL = 6.5;               // pivot, short arm, long arm
  const COCK = -33, UP = 90;                                  // long arm angle (deg from +z, up is positive)
  const SLING = 2.5, WALL_Z = -42, WALL_H = 9;                // sling length, castle wall
  const WINCH = V(0, 0.75, 6.6);

  const world = new K.World(canvas, spec.w, spec.h, {
    grassCount: 12000, aa: true,
    grassExclude: (x, z) => (Math.abs(x) < 1.5 && z > -3.6 && z < 7.4),
  });
  { const sc = world.sun.shadow.camera; sc.left = sc.bottom = -24; sc.right = sc.top = 24; sc.far = 220; sc.updateProjectionMatrix(); world.sun.shadow.mapSize.set(3072, 3072); }
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 220);
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
  function popIn(obj, t0, dur = 0.35, sound = 'pop', until, gain = 0.6) { const s0 = obj.scale.clone(); if (sound) sfx(t0, sound, gain);
    on(t => { obj.visible = t >= t0 && (until === undefined || t < until); const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6); ropeGeo.translate(0, -0.5, 0);
  function ropeBetween(mesh, a, b) { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); mesh.position.copy(a); mesh.scale.set(1, Math.max(len, 0.001), 1);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); }
  const mkRope = (mat = M.rope) => { const r = new THREE.Mesh(ropeGeo, mat); r.castShadow = true; S.add(r); r.visible = false; return r; };
  function beamBetween(a, b, w, mat) { const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, w), mat); m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = m.receiveShadow = true; return m; }
  const dirOf = deg => V(0, Math.sin(D(deg)), Math.cos(D(deg)));

  // ---------- castle ----------
  function masonryTex(rx, ry) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#5f594f'; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) { let x = (row % 2) * -32; while (x < 256) { const w = 64, v = 150 + K.rand() * 45;
      g.fillStyle = `rgb(${v},${v * 0.96},${v * 0.86})`; g.fillRect(x + 2, row * 32 + 2, w - 4, 28); x += w; } }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const wallMat = new THREE.MeshStandardMaterial({ map: masonryTex(14, 2.2), roughness: 0.95 });
  const towerMat = new THREE.MeshStandardMaterial({ map: masonryTex(6, 3.2), roughness: 0.95 });
  const castle = new THREE.Group();
  { const wall = new THREE.Mesh(new THREE.BoxGeometry(56, WALL_H, 2.6), wallMat); wall.position.set(0, WALL_H / 2, WALL_Z); castle.add(wall);
    for (let x = -27; x <= 27; x += 1.6) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 2.6), wallMat); m.position.set(x, WALL_H + 0.45, WALL_Z); castle.add(m); }
    for (const x of [-12, 12]) { const tw = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 14, 20), towerMat); tw.position.set(x, 7, WALL_Z); castle.add(tw);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(3.8, 4.2, 20), new THREE.MeshStandardMaterial({ color: 0x5a3b2c, roughness: 0.8 })); cap.position.set(x, 16.1, WALL_Z); castle.add(cap); }
    const keep = new THREE.Mesh(new THREE.BoxGeometry(10, 18, 10), towerMat); keep.position.set(3, 9, WALL_Z - 14); castle.add(keep);
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(7.6, 5, 4), new THREE.MeshStandardMaterial({ color: 0x4a4f57, roughness: 0.8, flatShading: true })); keepRoof.rotation.y = Math.PI / 4; keepRoof.position.set(3, 20.5, WALL_Z - 14); castle.add(keepRoof);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5, 0.1), new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: 1 })); gate.position.set(0, 2.5, WALL_Z + 1.32); castle.add(gate);
    world.add(castle); }

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
    g.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); g.visible = false; S.add(g); return g; }
  const pose = (p, swing = 0, armUp = 0) => { p.legL.rotation.x = 0.5 * swing; p.legR.rotation.x = -0.5 * swing; p.armL.rotation.set(-armUp - 0.4 * swing, 0, 0); p.armR.rotation.set(-armUp + 0.4 * swing, 0, 0); };
  const handPos = p => { p.updateMatrixWorld(true); return p.armR.localToWorld(V(0, -0.6, 0)); };
  const hero = makePerson(0x8a3b28), winder = makePerson(0x2f5a7a);
  const tunics = [0x7a5a2a, 0x5a6a3a, 0x6a3a3a, 0x3a4a6a, 0x7a6a4a, 0x5a3a5a, 0x8a5a3a, 0x4a5a5a];
  const crew = []; for (let i = 0; i < 10; i++) { const p = makePerson(tunics[i % tunics.length]); p.userData = { x: (i % 2 ? 0.55 : -0.55) * (1 + 0.15 * (i % 3)), z: -3.4 - Math.floor(i / 2) * 0.85 }; crew.push(p); }
  const bigCrew = []; for (let i = 0; i < 36; i++) { const p = makePerson(tunics[(i + 3) % tunics.length]); const row = Math.floor(i / 6), col = i % 6; p.userData = { x: -3.2 + col * 1.28 + (row % 2) * 0.3, z: -8.2 - row * 0.95 }; bigCrew.push(p); }
  const trio = [0, 1, 2].map(i => makePerson(tunics[i + 2]));

  // ---------- frame ----------
  const frame = new THREE.Group(); S.add(frame);
  const sills = [-0.95, 0.95].map(x => { const m = world.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 6.4), M.darkWood)); m.position.set(x, 0.15, 0); return m; });
  const cross = [-2.6, 2.6].map(z => { const m = world.add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.26, 0.26), M.darkWood)); m.position.set(0, 0.43, z); return m; });
  const legs = []; for (const x of [-0.95, 0.95]) for (const z of [-2.5, 2.5]) { const g = new THREE.Group(); g.add(beamBetween(V(0, 0.3, z), V(0, PIV.y + 0.15, 0), 0.24, M.darkWood)); g.position.x = x; world.add(g); legs.push(g); }
  const braces = [-0.95, 0.95].map(x => { const m = world.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 3.0), M.darkWood)); m.position.set(x, 1.9, 0); return m; });
  const axleLog = world.add(K.log(2.4, 0.13, M.wood)); axleLog.position.copy(PIV);
  const tSeesaw = T('seesaw'), tFrame = W('seesaw', 'frame'), tBeam = W('seesaw', 'beam');
  dropIn(sills[0], tSeesaw + 0.05, 0.45, 3, { gain: 0.8, puffSize: 0.8 }); dropIn(sills[1], tSeesaw + 0.25, 0.45, 3, { gain: 0.8, puffSize: 0.8 });
  cross.forEach((c, i) => dropIn(c, tSeesaw + 0.45 + i * 0.2, 0.45, 3, { gain: 0.6, sound: 'clack', puffSize: 0.6 }));
  legs.forEach((g, i) => dropIn(g, tFrame - 0.4 + i * 0.22, 0.45, 4, { gain: 0.7, puffSize: 0.6, puffAt: V(g.position.x, 0.2, (i % 2 ? 2.5 : -2.5)), spin: 0.1 }));
  braces.forEach((b, i) => dropIn(b, tFrame + 0.5 + i * 0.2, 0.4, 3, { gain: 0.5, sound: 'clack', puffSize: 0.4, spin: 0.1 }));
  dropIn(axleLog, tFrame + 0.95, 0.45, 3, { gain: 0.8, puffSize: 0.5, puffY: PIV.y, spin: 0 });

  // ---------- beam (rotates about the pivot) ----------
  const beamG = new THREE.Group(); beamG.position.copy(PIV); S.add(beamG);
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, LS + LL), M.wood); b.position.z = (LL - LS) / 2; beamG.add(b);
    for (const z of [-LS + 0.25, -0.5, 0.5, LL - 0.4]) { const band = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.4, 0.08), M.iron); band.position.z = z; beamG.add(band); }
    const capT = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.44, 0.1), M.iron); capT.position.z = LL + 0.02; beamG.add(capT); }
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), M.iron); pin.rotation.x = Math.PI / 2; pin.position.set(0, 0, LL + 0.25); beamG.add(pin);
  beamG.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  const tipOf = phi => PIV.clone().addScaledVector(dirOf(phi), LL + 0.3);
  const shortOf = phi => PIV.clone().addScaledVector(dirOf(phi), -LS + 0.15);
  sfx(tBeam + 0.45, 'thud', 1.0); dust.puff(tBeam + 0.45, V(0, PIV.y, 0), 0.7, 8);

  // ---------- throws: arm angle as a pure function of t ----------
  const throws = []; // {t0, up, from, to, after, settle, mode, rel, land, apex, flight, show}
  const addThrow = o => { const th = Object.assign({ up: 0.55, from: COCK, to: 115, after: COCK, settle: 1.6, mode: 'cup', relPhi: 98, apex: 10, flight: 1.6, damp: false }, o); throws.push(th); return th; };
  const thTr = addThrow({ t0: T('traction') + 0.05, land: V(1.5, 0, -33), show: T('pull') + 0.4 });
  const tM = T('messy');
  const thM = [0, 1, 2].map(i => addThrow({ t0: tM + 0.25 + i * 1.15, up: 0.42, settle: 0.7, land: [V(-9, 0, -27), V(8, 0, -37), V(-2, 0, -21)][i], apex: [7, 12, 5][i], flight: [1.2, 1.6, 1.0][i], show: tM + 0.25 + i * 1.15 - 0.25 }));
  const tFall = W('hinge', 'falls') - 0.15;
  const thH = addThrow({ t0: tFall, up: 0.65, after: UP, settle: 2.2, damp: true, land: V(-1, 0, -39.5), apex: 12, flight: 1.7, show: T('hinge') });
  const thS = addThrow({ t0: T('short') + 0.15, up: 0.6, after: UP, settle: 1.6, damp: true, relPhi: 70, land: V(0.5, 0, -12), apex: 3.2, flight: 0.9, show: T('short') - 0.01 });
  const thR = addThrow({ t0: T('release') + 0.2, up: 1.3, after: UP, settle: 2.6, damp: true, mode: 'sling', land: V(-2, 0, -56), apex: 26, flight: 2.6, show: T('sling') - 0.01 });
  const thF = addThrow({ t0: W('far', 'send') - 0.25, up: 1.0, after: UP, settle: 2.2, damp: true, mode: 'sling', land: V(3, 0, -60), apex: 30, flight: 2.4, show: T('far') - 0.01 });
  throws.forEach(th => { sfx(th.t0 + 0.05, 'creak', 0.8); sfx(th.t0 + th.up * 0.6, 'whoosh', 0.9); sfx(th.t0 + th.up + 0.05, 'thud', 0.7); });

  function phiAt(t) {
    if (t < T('pull') + 0.9) return COCK;
    if (t < T('crowd')) { const k = prog(t, T('pull') + 0.9, T('crowd') - T('pull') - 1.0); return COCK + 3.5 * Math.sin(Math.PI * k) * (0.6 + 0.4 * Math.sin(t * 9)); }
    // between throws, cocking states
    if (t >= T('winch') && t < T('short')) { const k = ease.inOut(prog(t, T('winch') + 0.9, E('winch') - T('winch') - 1.3)); return lerp(UP, COCK, k); }
    if (t >= T('heavy') && t < T('winch')) return UP;
    if (t >= T('sling') && t < thR.t0) return COCK;
    if (t >= T('far') && t < thF.t0) return COCK;
    if (t >= T('box') && t < thH.t0) return COCK;
    if (t >= T('short') && t < thS.t0) return COCK;
    let th = null; for (const x of throws) if (t >= x.t0) th = x;
    if (!th) return COCK;
    const dt = t - th.t0;
    if (dt < th.up) { const p = dt / th.up; return th.from + (th.to - th.from) * Math.pow(p, 1.7); }
    const s = clamp01((dt - th.up) / th.settle);
    if (th.damp) return th.after + (th.to - th.after) * Math.cos(2.6 * Math.PI * s) * Math.pow(1 - s, 2);
    return lerp(th.to, th.after, ease.inOut(s));
  }
  // sling angle (direction from tip to pouch, deg) for sling throws
  function slingSigma(t, phi) {
    for (const th of [thR, thF]) { const dt = t - th.t0; if (dt >= 0 && dt < th.up) return 180 + 295 * Math.pow(dt / th.up, 2.2); if (dt >= th.up && dt < th.up + 1.5) return lerp(475, 630, ease.out((dt - th.up) / 1.5)); }
    if (Math.abs(phi - COCK) < 1) return 180; return 270;
  }
  const relTime = th => { if (th.mode === 'sling') return th.t0 + th.up; const f = Math.pow((th.relPhi - th.from) / (th.to - th.from), 1 / 1.7); return th.t0 + f * th.up; };
  throws.forEach(th => { th.tr = relTime(th); th.tl = th.tr + th.flight; dust.puff(th.tl, th.land.clone().setY(0.2), th.land.z < WALL_Z ? 3.2 : 2.6, 12); sfx(th.tl, 'rumble', th.land.z < WALL_Z ? 0.6 : 0.85); });

  // ---------- sling ----------
  const slingRope = mkRope(new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 1 }));
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9, side: THREE.DoubleSide })); S.add(pouch); pouch.castShadow = true;
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 14), M.rope); S.add(loop); loop.castShadow = true;
  const tSlingOn = W('sling', 'sling') - 0.1;
  sfx(tSlingOn + 0.1, 'pop', 0.7); sfx(W('sling', 'loop') + 0.1, 'click', 0.8);
  function pouchPos(t, phi) { const sg = slingSigma(t, phi); const p = tipOf(phi).addScaledVector(dirOf(sg), SLING); p.x += 0.4 * Math.max(0, -Math.sin(D(sg))); p.y = Math.max(0.28, p.y); return p; }

  // ---------- rocks ----------
  const rockMat = new THREE.MeshStandardMaterial({ map: M.stone.map, color: 0xd8d0c2, roughness: 0.95 });
  const mkRock = r => { const g = new THREE.IcosahedronGeometry(r, 1); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const k = 1 + (K.rand() - 0.5) * 0.18; P.setXYZ(i, P.getX(i) * k, P.getY(i) * k, P.getZ(i) * k); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, rockMat); m.castShadow = true; m.visible = false; S.add(m); return m; };
  throws.forEach(th => { th.rock = mkRock(0.34); sfx(th.show + 0.02, 'pop', 0.4); });
  function rockAt(th, t) {
    if (t < th.show) return null;
    if (t < th.tr) { const phi = phiAt(t); if (th.mode === 'sling') return pouchPos(t, phi).add(V(0, 0.18, 0));
      const tip = PIV.clone().addScaledVector(dirOf(phi), LL - 0.35), n = V(0, Math.cos(D(phi)), -Math.sin(D(phi))); return tip.addScaledVector(n, 0.5); }
    const P0 = rockAt(th, th.tr - 1e-4), u = clamp01((t - th.tr) / th.flight); const p = P0.clone().lerp(th.land.clone().setY(0.3), u); p.y += 4 * th.apex * u * (1 - u);
    return p;
  }
  // intro: you throw a rock by hand and it falls short
  const handRock = mkRock(0.2); const tToss = T('intro') + 2.2;
  sfx(tToss + 0.05, 'whoosh', 0.5); sfx(tToss + 1.05, 'thud', 0.5); dust.puff(tToss + 1.05, V(0.5, 0, -9.5), 0.6, 6);
  // the 300 kg stone beside three people
  const bigStone = mkRock(0.48); bigStone.position.set(2.6, 0.45, -2.6);
  const tBig = W('far', 'stones') - 0.1; popIn(bigStone, tBig, 0.4, 'thud', T('cannon'));
  trio.forEach((p, i) => { p.position.set(3.4 + i * 0.6, 0, -2.4 - i * 0.25); p.rotation.y = -0.6; popIn(p, tBig + 0.25 + i * 0.18, 0.35, 'pop', T('cannon')); });

  // ---------- traction ropes ----------
  const crewRopes = crew.map(() => mkRope());
  const tRopes = W('crowd', 'ropes') - 0.1, tCrew = W('crowd', 'crowd') - 0.2;
  crew.forEach((p, i) => popIn(p, tCrew + i * 0.07, 0.3, i % 3 ? null : 'pop', T('box') + 0.2 + i * 0.05));
  bigCrew.forEach((p, i) => popIn(p, W('traction', 'crews') - 0.1 + i * 0.03, 0.3, i % 6 ? null : 'pop', T('messy')));
  sfx(tRopes + 0.1, 'rustle', 0.6);
  const heroRope = mkRope();
  const yank = t => { for (const th of [thTr, ...thM]) if (t >= th.t0 - 0.15 && t < th.t0 + th.up + 0.2) return 1; return 0; };

  // ---------- counterweight box ----------
  const box = new THREE.Group(); S.add(box);
  { const bw = 1.4, bh = 1.5, bd = 1.4, wt = 0.1, wood = M.darkWood;
    const parts = [[bw, wt, bd, 0, -bh, 0], [wt, bh, bd, -bw / 2, -bh / 2, 0], [wt, bh, bd, bw / 2, -bh / 2, 0], [bw, bh, wt, 0, -bh / 2, -bd / 2], [bw, bh, wt, 0, -bh / 2, bd / 2]];
    for (const [w, h, d, x, y, z] of parts) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); m.position.set(x, y - 0.35, z); box.add(m); }
    for (const y of [-0.6, -1.5]) { const band = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.06, 0.08, bd + 0.06), M.iron); band.position.y = y; box.add(band); }
    for (const s of [-1, 1]) { const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), M.iron); strap.position.set(0.22 * s, -0.12, 0); box.add(strap); }
    const hingeRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), M.iron); hingeRod.rotation.z = Math.PI / 2; box.add(hingeRod);
    box.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); }
  const fill = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0x9a8a70, roughness: 1, map: M.stone.map })); fill.geometry.translate(0, 0.5, 0); fill.position.y = -1.8; box.add(fill); fill.castShadow = true;
  const tBox = W('box', 'box') - 0.3, tFill = W('box', 'fill') - 0.05;
  const NF = 26, fillStones = []; for (let i = 0; i < NF; i++) { const s = mkRock(0.1 + K.rand() * 0.06); s.userData = { x: (K.rand() - 0.5) * 0.9, z: (K.rand() - 0.5) * 0.9, t0: tFill + i * (E('box') - tFill - 0.5) / NF }; fillStones.push(s); }
  sfx(tFill + 0.2, 'pour', 0.8); for (let i = 0; i < 5; i++) sfx(tFill + 0.3 + i * 0.6, 'clack', 0.4);
  on(t => { const phi = phiAt(t), s = shortOf(phi);
    // box drops onto its hinge, then hangs from the short end
    const dt = t - tBox; box.visible = t >= tBox; let h = 0; if (dt >= 0 && dt < 0.5) { const p = dt / 0.5; h = p < LAND ? 1 - (p / LAND) ** 2 : 0; }
    box.position.copy(s).add(V(0, h * 3.5, 0)); box.rotation.x = Math.sin(t * 2.1) * 0.02 * clamp01(t - tFall);
    const f = prog(t, tFill + 0.2, E('box') - tFill - 0.2); fill.visible = f > 0.01; fill.scale.y = Math.max(0.01, f * 1.2); fill.position.y = -1.83;
    for (const st of fillStones) { const u = st.userData, q = (t - u.t0) / 0.45; st.visible = q >= 0 && q < 1; if (st.visible) st.position.set(s.x + u.x, s.y + 1.6 - 3.0 * q * q, s.z + u.z); } });
  sfx(tBox + 0.35, 'thud', 1.0); dust.puff(tBox + 0.35, V(0, 4.6, -1.6), 0.8, 8);

  // ---------- winch ----------
  const winchG = new THREE.Group(); world.add(winchG);
  for (const x of [-0.65, 0.65]) { const p = K.post(1.1, 0.09, M.darkWood); p.position.set(x, 0, WINCH.z); winchG.add(p); }
  const drum = new THREE.Group(); drum.position.copy(WINCH); winchG.add(drum);
  { const d = K.log(1.2, 0.17, M.wood); drum.add(d); const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 14), M.rope); coil.rotation.z = Math.PI / 2; drum.add(coil);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.07), M.darkWood); arm.position.set(0.72, -0.22, 0); drum.add(arm);
    const hdl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 8), M.darkWood); hdl.rotation.z = Math.PI / 2; hdl.position.set(0.85, -0.45, 0); drum.add(hdl); }
  winchG.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  const tWinch = W('winch', 'winch') - 0.2; popIn(winchG, tWinch, 0.4, 'thud');
  const winchRope = mkRope();
  for (let tt = T('winch') + 1.0; tt < E('winch') - 0.4; tt += 0.55) sfx(tt, 'click', 0.6);
  const winchHolds = t => (t >= T('winch') + 0.7 && t < thS.t0) || (t >= T('sling') && t < thR.t0) || (t >= T('far') && t < thF.t0);

  // ---------- cannon ----------
  const cannon = new THREE.Group();
  { const car = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 2.0), M.darkWood); car.position.y = 0.55; cannon.add(car);
    for (const s of [-1, 1]) for (const z of [-0.6, 0.6]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16), M.darkWood); w.rotation.z = Math.PI / 2; w.position.set(0.45 * s, 0.42, z); cannon.add(w); }
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2.4, 14), M.iron); barrel.rotation.x = Math.PI / 2 - 0.12; barrel.position.set(0, 0.92, -0.3); cannon.add(barrel); }
  cannon.position.set(-3.6, 0, -1.5); cannon.rotation.y = 0.1; world.add(cannon);
  const tCannon = W('cannon', 'cannons') - 0.2; popIn(cannon, tCannon, 0.4, 'thud');
  const smoke = new K.Dust(world, 30, 'rgba(235,235,235,A)'); for (let i = 0; i < 4; i++) smoke.puff(tCannon + 0.6 + i * 0.12, V(-3.8, 1.1, -3.0 - i * 0.4), 1.4, 7); sfx(tCannon + 0.6, 'rumble', 1.0);

  // ---------- per-frame state ----------
  on(t => {
    const phi = phiAt(t); beamG.rotation.x = -D(phi); beamG.visible = t >= tBeam;
    if (t >= tBeam && t < tBeam + 0.6) { const p = (t - tBeam) / 0.6; beamG.position.y = PIV.y + (p < LAND ? 1 - (p / LAND) ** 2 : 0) * 4; } else beamG.position.y = PIV.y;
    // sling + loop
    const slingOn = t >= tSlingOn; slingRope.visible = pouch.visible = slingOn; loop.visible = slingOn;
    if (slingOn) { const tip = tipOf(phi), pp = pouchPos(t, phi); ropeBetween(slingRope, tip, pp); pouch.position.copy(pp);
      const released = (t >= thR.tr && t < T('far')) || t >= thF.tr; const pinTip = PIV.clone().addScaledVector(dirOf(phi), LL + 0.32);
      if (!released) { loop.position.copy(pinTip); loop.rotation.set(-D(phi), 0, 0); loop.visible = true; } else loop.visible = false;
      const sp = popScale(t, tSlingOn); slingRope.scale.x = slingRope.scale.z = sp; pouch.scale.setScalar(sp); }
    // rocks
    for (const th of throws) { const p = rockAt(th, t); const gone = t > th.tl + 3.0 || (th.land.z < WALL_Z && t > th.tl);
      th.rock.visible = !!p && !gone; if (p) { th.rock.position.copy(p); th.rock.rotation.set(t * 3, t * 2, 0); const k = popScale(t, th.show); th.rock.scale.setScalar(k); } }
    // hand-thrown rock
    { handRock.visible = t < T('seesaw'); const u = clamp01((t - tToss) / 1.0);
      const a = V(0.35, 1.5, 2.2), b = V(0.5, 0.12, -9.5); if (t < tToss) handRock.position.copy(handPos(hero)); else { handRock.position.lerpVectors(a, b, u); handRock.position.y += 4 * 2.2 * u * (1 - u); } }
    // winch rope
    winchRope.visible = winchHolds(t); if (winchRope.visible) ropeBetween(winchRope, WINCH.clone().add(V(0, 0.2, -0.1)), PIV.clone().addScaledVector(dirOf(phi), LL - 0.2));
    drum.rotation.x = -(UP - phi) * 0.2 * (t >= T('winch') && t < T('short') ? 1 : 0);
    // crew ropes
    const yk = yank(t);
    crew.forEach((p, i) => { const u = p.userData, back = yk ? 0.7 : 0; p.position.set(u.x, 0, u.z - back); p.rotation.y = 0; p.rotation.x = yk ? 0.25 : 0;
      pose(p, yk ? 0.6 * Math.sin(t * 14 + i) : 0, yk ? 1.0 : 1.5);
      const r = crewRopes[i]; r.visible = p.visible && t >= tRopes; if (r.visible) ropeBetween(r, shortOf(phi), handPos(p)); });
    bigCrew.forEach((p, i) => { const u = p.userData; p.position.set(u.x, 0, u.z); p.rotation.y = 0; pose(p, 0.3 * Math.sin(t * 6 + i), 1.3); });
    // hero: throws by hand, then tries the beam alone, then can't reach the arm
    let hv = false; hero.rotation.set(0, 0, 0);
    if (t < T('seesaw')) { hv = true; hero.position.set(0.6, 0, 2.6); hero.rotation.y = Math.PI; const k = prog(t, tToss - 0.5, 0.6); pose(hero, 0, t < tToss ? -0.6 * k + 2.4 * k * k : 2.6 - 2 * prog(t, tToss, 0.6)); }
    else if (t >= T('pull') && t < T('crowd')) { hv = true; const s = shortOf(phi); hero.position.set(0.25, 0, s.z - 0.9); hero.rotation.y = 0; hero.rotation.x = t > T('pull') + 0.9 ? 0.18 : 0; pose(hero, 0, 2.7 + 0.15 * Math.sin(t * 10)); }
    else if (t >= T('heavy') && t < T('winch')) { hv = true; hero.position.set(0.3, 0, 1.4); hero.rotation.y = Math.PI; const j = Math.abs(Math.sin((t - T('heavy')) * 5)); hero.position.y = 0.25 * j; pose(hero, 0, 3.0); }
    hero.visible = hv; heroRope.visible = hv && t >= T('pull') && t < T('crowd'); if (heroRope.visible) ropeBetween(heroRope, shortOf(phi), handPos(hero));
    winder.visible = t >= tWinch && t < T('cannon') && !(t >= T('sling') && t < T('release')); winder.position.set(1.35, 0, WINCH.z); winder.rotation.y = -Math.PI / 2;
    const turning = t >= T('winch') + 0.9 && t < E('winch') - 0.4; pose(winder, 0, turning ? 1.3 + 0.5 * Math.sin(t * 7) : 0.6);
    // dangling pouch-on-ground shot helpers
    pouch.rotation.set(0, 0, 0);
  });
  function popScale(t, t0, dur = 0.35) { return Math.max(0.001, ease.outBack(clamp01((t - t0) / dur))); }
  sfx(W('weak', 'barely'), 'creak', 0.7);

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 44) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const tThisTr = W('traction', 'this') - 0.15, tCrews = W('traction', 'crews') - 0.2, tThisCW = W('hinge', 'this') - 0.15, tThisSl = W('release', 'this') - 0.15;
  shot(0, tToss + 0.2, V(2.0, 1.6, 7.6), V(0, 2.4, -40), V(1.7, 1.6, 6.6), V(0, 2.8, -40), 46);                    // behind you, the wall far ahead
  shot(tToss + 0.2, T('seesaw'), V(2.6, 1.2, -4.6), V(0.5, 0.3, -9.5), V(2.3, 1.1, -5.2), V(0.5, 0.3, -9.5), 44);      // the rock falls short
  shot(T('seesaw'), tBeam - 0.3, V(9.5, 5.0, 8.5), V(0, 1.6, 0), V(8.5, 5.4, 7.6), V(0, 2.2, 0), 46);                  // frame drops in
  shot(tBeam - 0.3, T('pull'), V(10.5, 5.5, 4.0), V(0, 3.0, 1.2), V(10.0, 5.8, 3.4), V(0, 3.2, 1.2), 50);              // beam lands
  shot(T('pull'), W('pull', 'pull') - 0.1, V(3.6, 1.6, 8.4), V(0, 0.8, 5.0), V(3.3, 1.6, 8.0), V(0, 0.8, 5.0), 44);
  shot(W('pull', 'pull') - 0.1, T('weak'), V(5.0, 2.0, -5.6), V(0, 3.0, -1.8), V(4.6, 2.0, -5.2), V(0, 3.2, -1.8), 50);                // rock on long end, then short end
  shot(T('weak'), T('crowd'), V(3.6, 1.7, -5.8), V(0, 2.6, -1.9), V(3.3, 1.7, -5.4), V(0, 2.7, -1.9), 50);             // one person hangs on it
  shot(T('crowd'), T('traction'), V(6.5, 3.2, -9.0), V(0, 2.4, -3.0), V(6.0, 3.4, -8.2), V(0, 2.6, -3.0), 48);          // ropes and crowd
  shot(T('traction'), tThisTr, V(10.0, 4.0, 11.0), V(0, 5.0, -1), V(10.5, 6.0, 11.5), V(0, 8.0, -7), 56);             // whip! follow the rock
  shot(tThisTr, tCrews, V(11.5, 3.6, -1.5), V(0, 3.2, -2.5), V(11.0, 3.8, -2.0), V(0, 3.4, -2.5), 50);                // hero: traction trebuchet
  shot(tCrews, T('messy'), V(9.0, 9.0, 6.0), V(0, 0.5, -9.5), V(10.0, 10.5, 6.5), V(0, 0.5, -11.0), 52);              // the crowd grows
  shot(T('messy'), T('box'), V(4.0, 16.0, 12.0), V(0, 0, -28), V(3.0, 17.0, 11.0), V(0, 0, -30), 52);                 // rocks land everywhere
  shot(T('box'), tFill + 0.2, V(7.0, 6.2, -6.0), V(0, 4.0, -1.6), V(6.4, 6.0, -5.4), V(0, 4.0, -1.6), 46);              // box drops onto the short arm
  shot(tFill + 0.2, T('hinge'), V(2.4, 7.4, -3.6), V(0, 4.3, -1.6), V(2.2, 7.3, -3.3), V(0, 4.2, -1.6), 44);            // fill it
  shot(T('hinge'), tFall, V(5.0, 4.6, -5.4), V(0, 4.0, -1.4), V(4.6, 4.5, -5.0), V(0, 4.0, -1.4), 46);                 // the hinge
  shot(tFall, tThisCW, V(12.0, 4.5, 9.0), V(0, 5.5, -2), V(12.5, 5.0, 9.5), V(0, 6.0, -6), 56);                        // falls, throws
  shot(tThisCW, T('heavy'), V(4.6, 1.6, -3.2), V(0, 1.4, 0.2), V(4.3, 1.7, -3.0), V(0, 1.5, 0.2), 46);                  // hero: counterweight (hanging low)
  shot(T('heavy'), T('winch'), V(4.4, 1.0, 6.6), V(0, 4.6, 0.6), V(4.0, 1.0, 6.2), V(0, 5.0, 0.6), 60);                     // the arm is way up there
  shot(T('winch'), T('short'), V(7.6, 3.4, 10.4), V(0, 3.2, 2.5), V(7.0, 2.8, 10.0), V(0, 1.8, 3.4), 50);               // winch it down
  shot(T('short'), T('sling'), V(8.5, 3.0, 6.5), V(0, 2.0, -6.0), V(8.0, 3.2, 5.5), V(0, 1.0, -10.0), 50);             // short and low
  shot(T('sling'), W('sling', 'one') - 0.1, V(-3.2, 1.9, 8.2), V(0, 0.4, 4.4), V(-2.9, 1.8, 7.9), V(0, 0.4, 4.4), 46);    // the sling appears
  shot(W('sling', 'one') - 0.1, T('release'), V(-2.0, 1.3, 7.6), V(0, 0.4, 5.4), V(-1.8, 1.2, 7.3), V(0, 0.4, 5.5), 42); // the loop on the pin
  shot(T('release'), tThisSl, V(12.5, 4.0, 10.0), V(0, 6.0, 0.5), V(13.0, 6.0, 9.5), V(0, 9.0, -7), 58);               // whip and release
  shot(tThisSl, T('far'), V(3.6, 8.0, 4.2), V(0.3, 9.0, 0.2), V(3.3, 8.2, 3.9), V(0.3, 9.1, 0.2), 48);                     // hero: sling hanging from the tip
  shot(T('far'), thF.t0, V(7.4, 1.8, 2.6), V(3.4, 1.0, -2.7), V(7.0, 1.8, 2.2), V(3.4, 1.0, -2.7), 48);                 // stone vs three people
  shot(thF.t0, T('cannon'), V(-3.0, 3.0, 14.0), V(0, 9.0, -20), V(-2.5, 4.0, 14.0), V(0, 12.0, -35), 56);              // over the wall
  shot(T('cannon'), T('end'), V(-8.5, 2.2, 5.5), V(-3.0, 1.0, -1.5), V(-8.0, 2.6, 4.6), V(-2.6, 1.6, -1.5), 46);        // cannon
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 0.9, a1: 1.35, r: 15.0, h: 5.5, tgt: V(0, 5.0, -2.0) }, fov: 50 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(o.tgt.x + Math.sin(a) * o.r, o.h, o.tgt.z + Math.cos(a) * o.r); tg.copy(o.tgt); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    world.setCam(tmp, tg, s.fov);
    const cx = THREE.MathUtils.clamp(tg.x * 0.5, -6, 6), cz = THREE.MathUtils.clamp(tg.z * 0.5, -12, 4);
    world.sun.target.position.set(cx, 0, cz); world.sun.position.copy(world.sun.target.position).addScaledVector(world.sunDir, 90);
  }
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
