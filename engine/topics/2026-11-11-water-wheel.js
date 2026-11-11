// topics/2026-11-11-water-wheel.js — "You built a water mill". Everything is a pure function of t.
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- layout ----------
  const CH = 0.9, WY = 0.35, BH = 1.0;            // channel half-width, water level, bank height
  const AY = 1.5, R = 1.4, WW = 0.3;               // axle height, wheel radius, wheel half-width
  const GX = 1.9, GR = 0.45, PX = 2.12, PR = 0.2, PY = 2.0; // gear on axle, pinion (horizontal drum)
  const TY = 2.1, SR = 0.5;                         // table top, millstone radius
  const FY = 3.05;                                  // flume (trough) bottom
  const P0 = V(4.2, BH + 0.32, -2.1);               // wheel build pose (lying flat on the bank)

  const world = new K.World(canvas, spec.w, spec.h, { grassCount: 0, aa: true });
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 180);
  const splash = new K.Dust(world, 90, 'rgba(225,242,255,A)');
  const flour = new K.Dust(world, 50, 'rgba(250,246,236,A)');
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);

  // ---------- stream and banks ----------
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2b6f8f, roughness: 0.08, metalness: 0.15, emissive: 0x0b2f3f });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * CH + 0.2, 240), waterMat); water.rotation.x = -Math.PI / 2; water.position.set(0, WY, 0); water.receiveShadow = true; S.add(water);
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(2 * CH + 0.2, 240), M.dirt); bed.rotation.x = -Math.PI / 2; bed.position.y = 0.01; S.add(bed);
  const topTex = world.ground.material.map.clone(); topTex.repeat.set(59 / 7.8, 240 / 7.8); topTex.needsUpdate = true;
  const faceTex = M.dirt.map.clone(); faceTex.repeat.set(60, 0.6); faceTex.needsUpdate = true;
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 1 }), topMat = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.95 });
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(59, BH, 240), [faceMat, faceMat, topMat, faceMat, faceMat, faceMat]);
    b.position.set(s * (CH + 29.5), BH / 2, 0); b.receiveShadow = b.castShadow = true; S.add(b); }
  // grass tufts on the banks
  const NT = 900, tuft = new THREE.InstancedMesh(new THREE.ConeGeometry(0.045, 0.24, 4), new THREE.MeshStandardMaterial({ color: 0x5d8a34, roughness: 1 }), NT);
  { const m4 = new THREE.Matrix4(), c = new THREE.Color(); for (let i = 0; i < NT; i++) { const s = K.rand() < 0.5 ? -1 : 1; let x = s * (CH + 0.1 + Math.pow(K.rand(), 1.6) * 9), z = (K.rand() - 0.5) * 30;
      if (x > 1.3 && x < 3.0 && Math.abs(z) < 1.2) x += 2.0; if (x > 2.5 && x < 6 && z > -3.7 && z < -0.4) z -= 3.2; if (x > 5 && x < 8.4 && z > 2 && z < 5.4) x += 3.6;
      m4.makeTranslation(x, BH + 0.1, z); tuft.setMatrixAt(i, m4); c.setRGB(0.3 + K.rand() * 0.15, 0.5 + K.rand() * 0.15, 0.18); tuft.setColorAt(i, c); } }
  S.add(tuft);
  // ripples drifting downstream (+z)
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xcfeaf6, transparent: true, opacity: 0.22, depthWrite: false });
  const ripples = []; for (let i = 0; i < 60; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.5 + K.rand() * 0.9), rippleMat); r.rotation.x = -Math.PI / 2;
    r.userData = { x: (K.rand() - 0.5) * 1.6, z0: K.rand() * 60, sp: 1.6 + K.rand() * 0.8 }; S.add(r); ripples.push(r); }
  on(t => { for (const r of ripples) { const u = r.userData; r.position.set(u.x, WY + 0.005, ((u.z0 + t * u.sp) % 60) - 30); } });
  // rocks in the stream
  const rocks = [[-0.45, -5.5], [0.5, -9], [0.3, 4.2], [-0.5, 7.5], [0.4, 11]].map(([x, z]) => { const r = K.stoneBlock(0.45, 0.4, 0.5, M.stone); r.position.set(x, WY - 0.08, z); r.rotation.y = K.rand() * 3; world.add(r); return r; });
  for (let tt = 0.4; tt < spec.duration; tt += 0.7) { const r = rocks[Math.floor(tt * 3) % rocks.length]; splash.puff(tt, V(r.position.x, WY + 0.05, r.position.z - 0.2), 0.3, 3); }

  // sunset tint for "by evening"
  const SUN0 = world.sun.color.clone(), SUNSET = new THREE.Color(0xff9a5a);
  on(t => { const k = prog(t, T('tired'), 0.8) * (1 - prog(t, T('stream') - 0.2, 0.5)); world.sun.color.copy(SUN0).lerp(SUNSET, k); world.sun.intensity = 2.6 - 0.9 * k; });

  // ---------- helpers ----------
  const LAND = 0.7;
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) dust.puff(tl, opts.puffAt || V(base.x, Math.max(0, base.y - (opts.half ?? 0)), base.z), opts.puffSize ?? 0.8, opts.puffCount ?? 9);
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.8);
    on(t => { obj.visible = t >= t0 && (opts.until === undefined || t < opts.until); if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.3), base_r.y + h * (opts.spin ?? 0.3) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop', gain = 0.6, puff = true, until) { const s0 = obj.scale.clone(); if (sound) sfx(t0, sound, gain);
    if (puff) { obj.updateMatrixWorld(true); dust.puff(t0 + 0.05, obj.getWorldPosition(new THREE.Vector3()), 0.4, 5); }
    on(t => { obj.visible = t >= t0 && (until === undefined || t < until); const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10); cylGeo.translate(0, -0.5, 0);
  function between(mesh, a, b) { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); mesh.position.copy(a); mesh.scale.y = Math.max(len, 0.001);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize()); }
  // toothed wheel: disc in the local xy plane (axis z) with box teeth
  function toothed(r, n, thick, mat, toothLen = 0.07) { const g = new THREE.Group();
    const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, thick, 28), mat); d.rotation.x = Math.PI / 2; g.add(d);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, tth = new THREE.Mesh(new THREE.BoxGeometry(toothLen, 0.045, thick * 0.8), M.wood); tth.position.set(Math.cos(a) * (r + toothLen / 2), Math.sin(a) * (r + toothLen / 2), 0); tth.rotation.z = a; g.add(tth); }
    for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(2 * r * 0.98, 0.05, thick * 1.3), M.darkWood); sp.rotation.z = i * Math.PI / 4; g.add(sp); }
    g.traverse(c => { if (c.isMesh) c.castShadow = true; }); return g; }

  // ---------- house ----------
  const house = new THREE.Group(); { const wall = K.stoneBlock(2.4, 1.5, 2.0, M.stone); wall.position.y = 0.75; house.add(wall);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.2, 4), M.thatch); roof.rotation.y = Math.PI / 4; roof.scale.set(1.0, 1, 0.85); roof.position.y = 2.05; house.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.95, 0.55), M.darkWood); door.position.set(-1.21, 0.5, 0.2); house.add(door); }
  house.position.set(6.7, BH, 3.7); world.add(house);

  // ---------- person + quern ----------
  function makePerson(tunic) { const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.25, 0.72, 10), cloth); body.position.y = 1.02;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), M.skin); head.position.y = 1.56;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 1 })); hair.position.y = 1.58;
    g.add(body, head, hair);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.68, 8), dark); leg.position.set(0.09 * s, 0.34, 0); g.add(leg);
      const piv = new THREE.Group(); piv.position.set(0.24 * s, 1.34, 0); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.58, 8), cloth); arm.position.y = -0.29;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.skin); hand.position.y = -0.6; piv.add(arm, hand); g.add(piv); g[s > 0 ? 'armR' : 'armL'] = piv; }
    return world.add(g); }
  const man = makePerson(0x2f5f8a);
  const Q = V(4.3, BH, 2.0); // quern spot
  const quernBase = K.stoneBlock(0.75, 0.2, 0.45, M.stone); quernBase.position.set(Q.x, BH + 0.1, Q.z); world.add(quernBase);
  const rubber = K.stoneBlock(0.3, 0.12, 0.3, M.stone); world.add(rubber);
  const grainMat = new THREE.MeshStandardMaterial({ color: 0xd8b25a, roughness: 0.9 });
  const flourMat = new THREE.MeshStandardMaterial({ color: 0xf3eee2, roughness: 1 });
  const tinyPile = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.07, 14), flourMat); tinyPile.position.set(Q.x + 0.5, BH + 0.035, Q.z + 0.05); world.add(tinyPile);
  const sack = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), new THREE.MeshStandardMaterial({ color: 0xb59a6a, roughness: 1 })); sack.scale.set(1, 1.3, 1); sack.position.set(Q.x - 0.7, BH + 0.3, Q.z - 0.3); world.add(sack);
  const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: 0x9a5a28, roughness: 0.8 })); loaf.scale.set(1.4, 0.7, 1); loaf.position.set(Q.x + 0.55, BH + 0.08, Q.z + 0.45); world.add(loaf);
  popIn(loaf, W('tired', 'loaf') - 0.05, 0.35, 'pop', 0.6, true, T('wheel'));
  on(t => { sack.visible = t < T('wheel'); });
  on(t => { const k = prog(t, T('quern') + 0.3, 3.5); tinyPile.scale.setScalar(Math.max(0.001, 0.3 + 0.7 * k)); tinyPile.visible = t >= T('quern'); });
  for (let tt = T('quern') + 0.6; tt < E('tired'); tt += 0.8) sfx(tt, 'scrape', 0.45);
  on(t => {
    man.armL.rotation.set(0, 0, 0); man.armR.rotation.set(0, 0, 0); man.rotation.set(0, 0, 0);
    const grinding = t < E('tired'); man.visible = t < T('stream') + 1.2;
    const rub = grinding ? Math.sin((t - T('intro')) * Math.PI * 2 / 1.6) * (t < T('tired') ? 1 : 0.4) : 0;
    rubber.position.set(Q.x + 0.18 * rub, BH + 0.26, Q.z);
    man.position.set(Q.x, BH, Q.z - 0.62); man.rotation.y = 0; man.rotation.x = t < T('tired') ? 0.45 : 0.3;
    man.armL.rotation.x = -1.1 - 0.1 * rub; man.armR.rotation.x = -1.1 - 0.1 * rub; man.armL.rotation.z = -0.3 * rub * 0.3; man.armR.rotation.z = 0.3 * rub * 0.3;
    if (t >= T('tired') + 1.0) { man.armL.rotation.x = -0.2; man.armR.rotation.x = -0.2; man.rotation.x = 0.15; }
    if (t >= T('stream')) { man.rotation.x = 0; man.rotation.y = -Math.PI / 2 - 0.4; man.armL.rotation.x = 0; man.armR.rotation.x = -0.6; }
  });

  // ---------- wheel: pose group (flat on bank -> on axle) > spin group; local axis = x ----------
  const pose = new THREE.Group(); S.add(pose); const spinG = new THREE.Group(); pose.add(spinG);
  const rims = [-WW, WW].map(x => { const r = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 8, 48), M.darkWood); r.rotation.y = Math.PI / 2; r.position.x = x; spinG.add(r); return r; });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2 * WW + 0.1, 12), M.darkWood); hub.rotation.z = Math.PI / 2; spinG.add(hub);
  const spokes = []; for (const x of [-WW, WW]) for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2 * R, 0.09), M.wood); s.position.x = x; s.rotation.x = i * Math.PI / 6; spinG.add(s); spokes.push(s); }
  const NP = 16;
  const paddles = []; for (let i = 0; i < NP; i++) { const a = i / NP * Math.PI * 2, g = new THREE.Group(); g.rotation.x = a; spinG.add(g);
    const p = new THREE.Mesh(new THREE.BoxGeometry(2 * WW + 0.06, 0.4, 0.05), M.wood); p.position.y = R - 0.02; g.add(p); paddles.push(g); }
  // overshot parts: sole board, shrouds, buckets, water in buckets
  const soleMat = M.darkWood.clone(); soleMat.side = THREE.DoubleSide;
  const sole = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.3, R - 0.3, 2 * WW, 40, 1, true), soleMat); sole.rotation.z = Math.PI / 2; spinG.add(sole);
  const shroudMat = new THREE.MeshStandardMaterial({ map: M.wood.map, roughness: 0.85, side: THREE.DoubleSide });
  const shrouds = [-WW - 0.01, WW + 0.01].map(x => { const s = new THREE.Mesh(new THREE.RingGeometry(R - 0.32, R + 0.06, 48, 1), shroudMat); s.rotation.y = Math.PI / 2; s.position.x = x; spinG.add(s); return s; });
  const NB = 20, buckets = [], bucketWater = [];
  const bwMat = new THREE.MeshStandardMaterial({ color: 0x2f86b0, roughness: 0.15, metalness: 0.1, emissive: 0x0d3a52 });
  for (let i = 0; i < NB; i++) { const a = i / NB * Math.PI * 2, g = new THREE.Group(); g.rotation.x = a; spinG.add(g);
    const radial = new THREE.Mesh(new THREE.BoxGeometry(2 * WW, 0.34, 0.04), M.wood); radial.position.set(0, R - 0.13, 0); g.add(radial);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(2 * WW, 0.04, 0.16), M.wood); lip.position.set(0, R + 0.03, -0.08); lip.rotation.x = 0.25; g.add(lip);
    const w = new THREE.Mesh(new THREE.BoxGeometry(2 * WW - 0.04, 0.16, 0.2), bwMat); w.position.set(0, R - 0.18, 0.11); g.add(w); bucketWater.push({ w, a });
    buckets.push(g); }
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 3.9, 14), M.darkWood); axle.rotation.z = Math.PI / 2; axle.position.x = 0.5; spinG.add(axle);
  const gearBig = toothed(GR, 22, 0.08, M.darkWood); gearBig.rotation.y = Math.PI / 2; gearBig.position.x = GX; spinG.add(gearBig);
  spinG.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });

  // posts holding the axle
  const posts = [-1.25, 1.25].map(x => { const p = world.add(K.post(AY - 0.11 - BH, 0.09, M.darkWood)); p.position.set(x, BH, 0); return p; });
  const caps = [-1.25, 1.25].map(x => { const c = world.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.32), M.darkWood)); c.position.set(x, AY - 0.15, 0); return c; });

  // ---------- timing ----------
  const tRim = T('wheel') + 0.35, tSpoke = W('wheel', 'build'), tPad = W('wheel', 'paddles') - 0.15, tPadEnd = E('wheel') - 0.1;
  const tAxle = W('axle', 'log') - 0.1, tPosts = W('axle', 'rest') - 0.15, tMove = W('axle', 'posts') - 0.6, tMoveEnd = E('axle') + 0.15;
  const tTurn = W('turns', 'wheel') + 0.1;
  const tDig = W('race', 'dig') - 0.05, tTrough = W('race', 'trough') - 0.3, tTroughEnd = E('race') - 0.3;
  const tSwap = W('buckets', 'swap') - 0.05, tBuck = W('buckets', 'buckets') - 0.1, tFlow = W('buckets', 'falling') - 0.15, tOver = W('buckets', 'weight') - 0.2;
  const tStoneLie = T('flat') + 0.3;
  const tGear = W('gears', 'toothed') - 0.15, tPin = W('gears', 'drum') - 0.35;
  const tTable = T('stones') + 0.05, tBed = W('stones', 'heavy') - 0.6, tRunner = W('stones', 'millstone') - 0.2;
  const tHop = W('hopper', 'hopper') - 0.2, tGrain = W('hopper', 'trickles') - 0.15;
  const tMill = W('grind', 'gears') - 0.1;

  // wheel build on the bank
  rims.forEach((r, i) => popIn(r, tRim + i * 0.3, 0.35, 'thud', 0.7, false)); popIn(hub, tRim + 0.1, 0.3, 'clack', 0.6, false);
  spokes.forEach((s, i) => popIn(s, tSpoke + i * (tPad - tSpoke - 0.1) / spokes.length, 0.25, i % 2 ? false : 'clack', 0.5, false));
  paddles.forEach((p, i) => { const t0 = tPad + i * (tPadEnd - tPad) / NP; sfx(t0 + 0.2, 'clack', 0.45);
    on(t => { p.visible = t >= t0 && t < tSwap + 0.1 + i * 0.04; const k = ease.out(prog(t, t0, 0.25)); p.children[0].position.y = R - 0.02 + (1 - k) * 0.8;
      if (t >= tSwap) { const q = prog(t, tSwap + i * 0.04, 0.12); p.children[0].scale.setScalar(Math.max(0.001, 1 - q)); } else p.children[0].scale.setScalar(1); }); });
  for (let i = 0; i < 4; i++) sfx(tSwap + i * 0.18, 'pop', 0.4);
  // overshot fit-out
  popIn(sole, tBuck - 0.25, 0.3, 'thud', 0.5, false); shrouds.forEach((s, i) => popIn(s, tBuck - 0.15 + i * 0.15, 0.3, 'thud', 0.5, false));
  buckets.forEach((b, i) => { const t0 = tBuck + 0.2 + i * 0.045; if (i % 4 === 0) sfx(t0, 'clack', 0.45); on(t => { b.visible = t >= t0; b.scale.setScalar(Math.max(0.001, ease.outBack(prog(t, t0, 0.25)))); }); });
  // axle + posts
  on(t => { axle.visible = t >= tAxle; axle.position.x = 0.5 + (1 - ease.out(prog(t, tAxle, 0.5))) * 4.5; });
  sfx(tAxle + 0.1, 'slide', 0.7); sfx(tAxle + 0.5, 'clack', 0.8);
  posts.forEach((p, i) => dropIn(p, tPosts + i * 0.25, 0.4, 1.8, { gain: 0.8, puffSize: 0.45, spin: 0.1 }));
  caps.forEach((c, i) => popIn(c, tPosts + 0.4 + i * 0.25, 0.25, false, 0.5, false));
  sfx(tMove + 0.1, 'whoosh', 0.8); sfx(tMoveEnd - 0.1, 'thud', 1.0); splash.puff(tMoveEnd - 0.1, V(0, WY, 0.2), 1.0, 14);
  gearBig.visible = false; popIn(gearBig, tGear, 0.4, 'thud', 0.8, false);

  // spin: undershot (bottom moves +z => negative x-rotation), then overshot (top moves +z => positive)
  const W1 = 0.55, W2 = 1.15;
  const tStop = tSwap - 0.3;
  function spinAt(t) { let a = 0;
    if (t > tTurn) { const d = Math.min(t, tStop) - tTurn, r = 1.2; a -= d < r ? W1 * d * d / (2 * r) : W1 * (d - r / 2); }
    if (t > tStop) { const d = Math.min(t, tStop + 0.6) - tStop; a -= W1 * (d - d * d / 1.2); }
    if (t > tOver) { const d = t - tOver, r = 1.6; a += d < r ? W2 * d * d / (2 * r) : W2 * (d - r / 2); }
    return a; }
  const qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), qUp = new THREE.Quaternion();
  const C = V(0, AY, 0);
  on(t => {
    pose.visible = t >= tRim - 0.05;
    const p = ease.inOut(prog(t, tMove, tMoveEnd - tMove));
    pose.quaternion.slerpQuaternions(qFlat, qUp, p); const lift = 1.6 * ease.out(prog(t, tAxle - 0.35, 0.4)); pose.position.lerpVectors(V(P0.x, P0.y + lift, P0.z), C, p); pose.position.y += Math.sin(Math.PI * p) * 1.0;
    spinG.rotation.x = spinAt(t);
    // water in buckets: filled on the descending (+z) side
    const filling = t >= tFlow + 0.4;
    for (const bw of bucketWater) { const a = bw.a + spinG.rotation.x; const z = Math.sin(a) * R, y = Math.cos(a) * R; bw.w.visible = filling && z > -0.15 && y > -R * 0.75;
      bw.w.scale.y = Math.max(0.05, Math.min(1, (0.35 + y / R) * 1.2)); }
  });
  for (let tt = tTurn + 0.5; tt < tStop; tt += 1.3) { sfx(tt, 'splash', 0.35); splash.puff(tt, V(0, WY + 0.05, 0.6), 0.5, 6); sfx(tt + 0.6, 'creak', 0.3); }
  for (let tt = tOver + 0.4; tt < spec.duration; tt += 0.9) sfx(tt, 'creak', 0.28);
  for (let tt = tOver; tt < spec.duration; tt += 0.6) splash.puff(tt, V(0, WY + 0.05, 1.2), 0.55, 6);

  // ---------- flume (trough) on trestles ----------
  const NS = 6, SEG = 1.6, troughSegs = [];
  for (let i = 0; i < NS; i++) { const g = new THREE.Group(); const zc = -0.3 - SEG / 2 - i * SEG;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, SEG), M.darkWood); b.position.y = 0.025; g.add(b);
    for (const x of [-0.27, 0.27]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, SEG), M.darkWood); s.position.set(x, 0.12, 0); g.add(s); }
    g.position.set(0, FY, zc); world.add(g); troughSegs.push(g); }
  const trestles = [];
  for (const z of [-1.6, -4.8, -8.0]) { const g = new THREE.Group();
    for (const x of [-1.15, 1.15]) { const p = K.post(FY - BH, 0.07, M.darkWood); p.position.set(x, 0, 0); g.add(p); }
    const cb = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.14), M.darkWood); cb.position.y = FY - BH - 0.06; g.add(cb);
    g.position.set(0, BH, z); world.add(g); trestles.push(g); }
  trestles.forEach((g, i) => dropIn(g, tTrough - 0.5 + i * 0.25, 0.45, 2.5, { gain: 0.8, puffAt: V(1.15, BH, g.position.z), puffSize: 0.5, spin: 0.08 }));
  troughSegs.slice().reverse().forEach((g, i) => dropIn(g, tTrough + 0.2 + i * (tTroughEnd - tTrough - 0.2) / NS, 0.4, 1.8, { gain: 0.6, sound: 'clack', puff: false, spin: 0.05 }));
  // upstream channel being dug on the bank (headrace into the trough)
  const ditchMat = new THREE.MeshStandardMaterial({ map: M.dirt.map, color: 0x6a5038, roughness: 1 });
  const ditch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 1), ditchMat); ditch.position.set(-1.5, BH + 0.01, -9.5); S.add(ditch);
  for (let i = 0; i < 6; i++) { const tt = tDig + 0.1 + i * 0.22; sfx(tt, 'scrape', 0.6); dust.puff(tt, V(-1.5, BH, -11 - i * 0.5), 0.5, 5); }
  on(t => { const k = ease.inOut(prog(t, tDig, 1.4)); ditch.visible = k > 0.001; ditch.scale.z = Math.max(0.001, 6 * k); ditch.position.z = -9.5 - 3 * k; });
  // water in the trough + the fall onto the wheel
  const troughWater = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 1), bwMat); S.add(troughWater);
  const fall = new THREE.Mesh(cylGeo, new THREE.MeshStandardMaterial({ color: 0x4fa3cf, roughness: 0.1, transparent: true, opacity: 0.85, emissive: 0x0d3a52 })); S.add(fall);
  const ZT = -0.3 - NS * SEG;
  sfx(tFlow, 'pour', 0.9); for (let tt = tFlow + 1.5; tt < spec.duration; tt += 2.5) sfx(tt, 'pour', 0.4);
  for (let tt = tFlow + 0.5; tt < spec.duration; tt += 0.35) splash.puff(tt, V(0, R + AY - 0.05, 0.45), 0.3, 3);
  on(t => { const k = ease.out(prog(t, tFlow - 0.6, 0.7)); troughWater.visible = k > 0.001; const z1 = lerp(ZT, -0.3, k);
    troughWater.scale.z = Math.max(0.001, z1 - ZT); troughWater.position.set(0, FY + 0.07, (ZT + z1) / 2);
    fall.visible = t >= tFlow; if (fall.visible) { const q = ease.out(prog(t, tFlow, 0.3)); between(fall, V(0, FY + 0.06, -0.28), V(0, lerp(FY, AY + R - 0.1, q), lerp(-0.2, 0.42, q))); fall.scale.x = fall.scale.z = 0.12 + 0.01 * Math.sin(t * 25); } });

  // ---------- millstone lying on the bank, gears, table, stones, hopper ----------
  const runner = new THREE.Group(); { const s = new THREE.Mesh(new THREE.CylinderGeometry(SR, SR, 0.16, 32), M.stone); runner.add(s);
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.17, 12), new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 1 })); runner.add(eye);
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(SR * 0.9, 0.005, 0.02), new THREE.MeshStandardMaterial({ color: 0x6d6a64 })); f.position.set(Math.cos(i) * SR * 0.5, 0.082, Math.sin(i) * SR * 0.5); f.rotation.y = -i; runner.add(f); } }
  world.add(runner);
  const RS = V(3.4, BH + 0.08, -1.5), RF = V(PX, TY + 0.30, 0);
  const pinion = toothed(PR, 10, 0.1, M.darkWood, 0.06); pinion.rotation.x = Math.PI / 2; pinion.position.set(PX, PY, 0); world.add(pinion);
  const shaftV = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 10), M.iron); shaftV.geometry.translate(0, 0.5, 0); shaftV.position.set(PX, PY - 0.05, 0); world.add(shaftV);
  const table = new THREE.Group(); { const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.8), M.wood); top.position.y = TY - BH + 0.04; table.add(top);
    for (const x of [-0.55, 0.55]) for (const z of [-0.82, 0.82]) { const l = K.post(TY - BH, 0.06, M.darkWood); l.position.set(x, 0, z); table.add(l); } }
  table.position.set(PX, BH, 0); world.add(table);
  // the table top has a hole for the shaft: fake it with a dark disc
  const bedStone = K.stoneBlock(1.06, 0.14, 1.06, M.stone); bedStone.scale.set(1, 1, 1); world.add(bedStone);
  const bedDisc = new THREE.Mesh(new THREE.CylinderGeometry(SR + 0.04, SR + 0.06, 0.14, 32), M.stone); bedDisc.position.set(PX, TY + 0.15, 0); world.add(bedDisc); bedStone.visible = false;
  const hopFrame = new THREE.Group(); { for (const z of [-0.78, 0.78]) { const p = K.post(1.35, 0.05, M.darkWood); p.position.set(0, 0, z); hopFrame.add(p); }
    const cb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.7), M.darkWood); cb.position.y = 1.35; hopFrame.add(cb); }
  hopFrame.position.set(PX, TY + 0.08, 0); world.add(hopFrame);
  const hopper = new THREE.Group(); { const hm = M.wood.clone(); hm.side = THREE.DoubleSide; const h = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.06, 0.42, 4, 1, true), hm); h.rotation.y = Math.PI / 4; hopper.add(h);
    const g = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 4), grainMat); g.rotation.y = Math.PI / 4; g.rotation.x = Math.PI; g.position.y = 0.12; hopper.add(g);
    for (const z of [-0.12, 0.12]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 4), M.rope); r.position.set(0, 0.38, z); hopper.add(r); } }
  hopper.position.set(PX, TY + 0.95, 0); world.add(hopper);
  const flourPile = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 18), flourMat); flourPile.position.set(PX, TY + 0.08 + 0.1, 0.72); world.add(flourPile);
  // grain trickle
  const NG = 18, grains = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 6, 4), grainMat, NG); S.add(grains);
  const gm = new THREE.Matrix4(), gq = new THREE.Quaternion(), gs = new THREE.Vector3(1, 1.6, 1), gp = new THREE.Vector3();
  const yTop = TY + 0.95 - 0.21, yEye = RF.y + 0.08;
  // flour spill particles
  const NF = 24, fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.02, 6, 4), flourMat, NF); S.add(fl);

  // runner: lies on the bank from 'flat', then flies onto the shaft
  sfx(tStoneLie + 0.25, 'thud', 0.9); dust.puff(tStoneLie + 0.25, RS, 0.6, 8);
  sfx(tRunner + 0.6, 'thud', 1.0); dust.puff(tRunner + 0.6, V(PX, RF.y - 0.1, 0), 0.7, 10);
  popIn(pinion, tPin, 0.35, 'clack', 0.8, false);
  on(t => { shaftV.visible = t >= tPin + 0.2; shaftV.scale.y = Math.max(0.001, (TY + 0.3 - PY) * ease.out(prog(t, tPin + 0.2, 0.4))); });
  sfx(tPin + 0.3, 'slide', 0.5);
  dropIn(table, tTable, 0.45, 2.2, { gain: 0.9, puffAt: V(PX, BH, 0), puffSize: 0.8, spin: 0.05 });
  dropIn(bedDisc, tBed, 0.45, 1.6, { gain: 1.0, puffAt: V(PX, TY + 0.08, 0), puffSize: 0.6, spin: 0.0 });
  dropIn(hopFrame, tHop - 0.35, 0.4, 1.8, { gain: 0.7, puffAt: V(PX, TY + 0.08, 0.78), puffSize: 0.4, spin: 0.05 });
  dropIn(hopper, tHop + 0.1, 0.45, 1.2, { gain: 0.6, sound: 'clack', puff: false, spin: 0.2 });
  sfx(tGrain, 'rustle', 0.7); for (let tt = tGrain + 1.4; tt < spec.duration; tt += 2.0) sfx(tt, 'rustle', 0.35);
  for (let tt = tMill + 0.5; tt < spec.duration; tt += 0.5) flour.puff(tt, V(PX + (tt * 7 % 1 - 0.5) * 0.6, RF.y - 0.05, 0.55), 0.25, 3);
  sfx(tMill, 'rumble', 0.8); for (let tt = tMill + 2; tt < spec.duration; tt += 2) sfx(tt, 'rumble', 0.45);
  const gearRatio = 22 / 10;
  on(t => {
    runner.visible = t >= tStoneLie;
    const fly = ease.inOut(prog(t, tRunner, 0.75)), drop = clamp01((t - tStoneLie) / 0.35);
    const rsY = RS.y + (1 - Math.min(1, drop / LAND) ** 2) * 1.6 * (drop < LAND ? 1 : 0);
    runner.position.set(lerp(RS.x, RF.x, fly), lerp(rsY, RF.y, fly) + Math.sin(Math.PI * fly) * 1.4, lerp(RS.z, RF.z, fly));
    // drive: after the gears exist, pinion + shaft + (once seated) runner turn with the wheel
    const a = spinG.rotation.x * gearRatio; pinion.rotation.z = a; shaftV.rotation.y = a;
    runner.rotation.y = fly >= 1 && t >= tMill ? a : (fly >= 1 ? 0 : 0);
    // grain trickle
    const gOn = t >= tGrain; grains.visible = gOn;
    for (let i = 0; i < NG; i++) { const ph = ((t * 1.3 + i / NG) % 1); gp.set(PX + 0.01 * Math.sin(i * 3.1), lerp(yTop, yEye, ph), 0.01 * Math.cos(i * 2.3)); gm.compose(gp, gq, gs); grains.setMatrixAt(i, gm); }
    grains.instanceMatrix.needsUpdate = true;
    // flour spills from the edge and the pile grows
    const fOn = t >= tMill + 0.3; fl.visible = fOn;
    for (let i = 0; i < NF; i++) { const ph = ((t * 0.9 + i / NF) % 1), ang = Math.PI / 2 + (i % 5 - 2) * 0.25; gp.set(PX + Math.cos(ang) * (SR + 0.04 + ph * 0.12), RF.y - 0.02 - ph * 0.3, Math.sin(ang) * (SR + 0.04 + ph * 0.12)); gm.compose(gp, gq, gs); fl.setMatrixAt(i, gm); }
    fl.instanceMatrix.needsUpdate = true;
    const fk = prog(t, tMill + 0.4, 6); flourPile.visible = fk > 0.001; flourPile.scale.setScalar(Math.max(0.001, 0.25 + 0.75 * fk));
  });

  // ---------- distant mills for "over six thousand" ----------
  const minis = [];
  for (const [z, s] of [[16, 1], [27, -1], [40, 1], [55, -1]]) { const g = new THREE.Group(); const h = K.stoneBlock(2.0, 1.4, 1.8, M.stone); h.position.set(s * 2.4, BH + 0.7, 0); g.add(h);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.0, 4), M.thatch); rf.rotation.y = Math.PI / 4; rf.position.set(s * 2.4, BH + 1.9, 0); g.add(rf);
    const wg = new THREE.Group(); wg.position.set(0, AY - 0.3, 0); g.add(wg);
    for (const x of [-0.25, 0.25]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 8, 32), M.darkWood); r.rotation.y = Math.PI / 2; r.position.x = x; wg.add(r); }
    for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.08), M.wood); sp.rotation.x = i * Math.PI / 4; wg.add(sp); }
    for (let i = 0; i < 12; i++) { const pg = new THREE.Group(); pg.rotation.x = i / 12 * Math.PI * 2; const p = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.05), M.wood); p.position.y = 1.1; pg.add(p); wg.add(pg); }
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, s * 2.4 * 0 + 2.4, 8), M.darkWood); ax.rotation.z = Math.PI / 2; ax.position.set(s * 0.6, AY - 0.3, 0); g.add(ax);
    g.position.set(0, 0, z); world.add(g); minis.push({ g, wg }); }
  minis.forEach((m, i) => { const t0 = W('spread', 'counted') - 0.3 + i * 0.4; popIn(m.g, t0, 0.4, 'pop', 0.6, false); on(t => { m.wg.rotation.x = -t * 0.9 - i; }); });

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const tOverHero = W('buckets', 'this') - 0.15, tGearHero = W('gears', 'these') - 0.15, tMillHero = W('grind', 'this') - 0.15;
  shot(0, T('quern'), V(9.5, 4.2, -1.2), V(4.6, 1.6, 2.2), V(8.6, 3.6, -0.6), V(4.5, 1.6, 2.2));
  shot(T('quern'), T('tired'), V(3.6, 3.3, 6.4), V(4.3, 1.5, 1.8), V(3.7, 3.1, 6.0), V(4.3, 1.5, 1.8), 40);
  shot(T('tired'), T('stream'), V(3.0, 2.9, 5.6), V(4.5, 1.4, 2.0), V(3.1, 2.8, 5.3), V(4.5, 1.4, 2.0), 40);
  shot(T('stream'), T('wheel'), V(3.4, 3.0, -6.5), V(0, 0.4, 2.0), V(3.0, 2.6, -4.5), V(0, 0.4, 3.0));
  shot(T('wheel'), tPad, V(7.6, 4.6, -3.6), V(4.2, 1.3, -2.1), V(7.3, 4.4, -3.2), V(4.2, 1.3, -2.1));
  shot(tPad, T('axle'), V(6.2, 4.2, -0.2), V(4.2, 1.3, -2.1), V(6.6, 4.0, -0.6), V(4.2, 1.3, -2.1));
  shot(T('axle'), tMove, V(8.6, 4.2, 2.6), V(3.8, 2.4, -1.6), V(8.0, 4.0, 2.2), V(3.6, 2.5, -1.5));
  shot(tMove, T('turns'), V(8.0, 5.0, 7.0), V(2.2, 2.4, -0.8), V(6.6, 3.6, 6.2), V(0.3, 1.5, 0));
  shot(T('turns'), T('weak'), V(5.6, 2.2, 3.4), V(0, 1.2, 0), V(5.2, 2.0, 3.8), V(0, 1.2, 0.2));
  shot(T('weak'), T('race'), V(0.5, 1.5, 6.0), V(0, 1.0, 0), V(0.4, 1.4, 5.6), V(0, 1.0, 0), 42);
  shot(T('race'), tTrough, V(4.6, 3.6, -6.0), V(-1.5, 1.0, -11), V(4.2, 3.4, -5.0), V(-1.2, 1.1, -10));
  shot(tTrough, T('buckets'), V(5.8, 5.0, 3.4), V(0, 2.5, -3.6), V(5.2, 4.8, 3.0), V(0, 2.6, -3.2));
  shot(T('buckets'), tFlow, V(4.2, 2.9, 2.2), V(0, 1.7, 0), V(4.0, 2.9, 2.0), V(0, 1.7, 0));
  shot(tFlow, tOverHero, V(3.8, 4.3, 3.0), V(0, 2.5, 0.2), V(4.2, 3.8, 3.4), V(0, 2.2, 0.2));
  shot(tOverHero, T('better'), V(6.4, 3.0, 3.6), V(0, 1.8, -0.2), V(6.6, 3.0, 3.3), V(0, 1.8, -0.2));
  sh.push({ t0: T('better'), t1: T('flat'), orbit: { a0: 0.55, a1: -0.25, r: 6.6, h: 3.4, tgt: V(0.2, 1.7, -0.4) }, fov: 42 });
  shot(T('flat'), T('gears'), V(4.6, 2.6, -2.6), V(2.6, 1.3, -0.6), V(4.4, 2.4, -2.2), V(2.6, 1.4, -0.5));
  shot(T('gears'), tPin, V(3.4, 2.15, 1.9), V(1.9, 1.6, 0), V(3.2, 2.1, 1.7), V(1.95, 1.65, 0), 40);
  shot(tPin, tGearHero, V(3.8, 2.7, 2.2), V(2.0, 1.8, 0), V(3.6, 2.6, 2.0), V(2.0, 1.8, 0), 40);
  shot(tGearHero, T('stones'), V(3.5, 2.45, 1.85), V(2.0, 1.8, 0), V(3.4, 2.4, 1.75), V(2.0, 1.8, 0), 40);
  shot(T('stones'), T('hopper'), V(5.4, 3.6, 2.6), V(2.6, 1.8, -0.4), V(5.0, 3.5, 2.4), V(2.4, 2.0, -0.2));
  shot(T('hopper'), tMill, V(4.4, 3.4, 1.4), V(PX, 2.7, 0), V(4.1, 3.3, 1.2), V(PX, 2.6, 0));
  shot(tMill, tMillHero, V(3.6, 3.1, 2.4), V(PX, 2.35, 0.2), V(3.4, 3.0, 2.2), V(PX, 2.35, 0.3), 40);
  shot(tMillHero, T('spread'), V(7.5, 4.2, 5.4), V(1.0, 1.9, 0), V(7.2, 4.0, 5.0), V(1.0, 1.9, 0));
  shot(T('spread'), T('end'), V(5.5, 6.5, -6.0), V(0, 1.0, 10), V(6.5, 11.0, -9.0), V(0, 1.0, 22));
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 0.85, a1: 0.35, r: 8.5, h: 4.6, tgt: V(1.0, 1.8, -0.6) }, fov: 42 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(o.tgt.x + Math.cos(a) * o.r, o.h, o.tgt.z + Math.sin(a) * o.r); tg.copy(o.tgt); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    world.setCam(tmp, tg, s.fov);
  }
  world.sun.target.position.set(1.5, 1, 0);
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
