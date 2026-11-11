// topics/2026-11-10-insula.js — "You built a Roman apartment block". Everything is a pure function of t.
// Scale: 1 unit ~ 3 m. Ground floor 1.3 tall, upper floors 0.95. People are scaled to ~0.56 units.
import * as THREE from 'three';

export async function build(K, canvas, spec) {
  const L = spec.lines;
  const T = id => L[id].t0, E = id => L[id].t1;
  const W = (id, word, nth = 0) => { const ws = L[id].words.filter(w => w.w.toLowerCase().replace(/[^a-z']/g, '') === word); return (ws[nth] || ws[0] || { t0: T(id) }).t0; };
  const { prog, ease, clamp01 } = K;
  const lerp = THREE.MathUtils.lerp, V = (x, y, z) => new THREE.Vector3(x, y, z);

  const world = new K.World(canvas, spec.w, spec.h, { grassCount: 0, aa: true });
  const M = world.mats, S = world.scene, dust = new K.Dust(world, 220);
  const ups = []; const on = f => ups.push(f);
  const sfx = (t, type, g = 1) => world.sfx(t, type, g);
  // sun from the front-right so the street facade is lit
  world.sun.position.set(28, 42, 40); world.sun.target.position.set(0, 2, 0);
  const sc = world.sun.shadow.camera; sc.left = sc.bottom = -16; sc.right = sc.top = 16; sc.updateProjectionMatrix();

  // ---------- textures & materials ----------
  function tex(size, draw, rx = 1, ry = 1) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  const paveTex = tex(256, (g, s) => { g.fillStyle = '#5d5953'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const v = 120 + K.rand() * 45; g.fillStyle = `rgb(${v},${v * 0.96},${v * 0.9})`; g.beginPath(); g.roundRect(x * 64 + 3 + K.rand() * 4, y * 64 + 3 + K.rand() * 4, 56, 56, 10); g.fill(); } }, 120, 120);
  const paving = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ map: paveTex, roughness: 0.95 }));
  paving.rotation.x = -Math.PI / 2; paving.position.y = 0.008; paving.receiveShadow = true; S.add(paving);

  const brickDraw = (g, s, base = [168, 84, 52]) => { g.fillStyle = '#b9ab95'; g.fillRect(0, 0, s, s);
    const rows = 16, bh = s / rows; for (let r = 0; r < rows; r++) { let x = (r % 2) * -16; while (x < s) { const w = 32, k = 0.8 + K.rand() * 0.35;
      g.fillStyle = `rgb(${base[0] * k | 0},${base[1] * k | 0},${base[2] * k | 0})`; g.fillRect(x + 1.5, r * bh + 1.5, w - 3, bh - 3); x += w; } } };
  const brickTex = tex(256, (g, s) => brickDraw(g, s), 3, 2);
  const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xa79f92, roughness: 1, map: K.stoneTexture() });
  const plasterMat = new THREE.MeshStandardMaterial({ color: 0xd8c3a0, roughness: 1 });
  const tileMat = new THREE.MeshStandardMaterial({ roughness: 0.85, map: tex(128, (g, s) => { g.fillStyle = '#7e3420'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 8; i++) { const gr = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0); gr.addColorStop(0, '#8e3b22'); gr.addColorStop(0.5, '#c5643a'); gr.addColorStop(1, '#7a311c'); g.fillStyle = gr; g.fillRect(i * 16, 0, 16, s); }
    for (let j = 0; j < 8; j++) { g.fillStyle = 'rgba(40,15,5,0.35)'; g.fillRect(0, j * 16, s, 2); } }, 6, 3) });

  // facade tile: one bay of wall with one window. kind: 'brick' | 'plaster' | 'timber'
  function facadeCanvas(kind, wallRGB) { return (g, s) => {
    if (kind === 'brick') brickDraw(g, s, wallRGB); else { g.fillStyle = `rgb(${wallRGB})`; g.fillRect(0, 0, s, s);
      for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(80,60,40,${K.rand() * 0.08})`; g.fillRect(K.rand() * s, K.rand() * s, 3 + K.rand() * 8, 2 + K.rand() * 6); } }
    if (kind === 'timber') { g.fillStyle = '#4a3220'; g.fillRect(0, 0, 14, s); g.fillRect(s - 14, 0, 14, s); g.fillRect(0, 0, s, 12); g.fillRect(0, s - 12, s, 12);
      g.save(); g.strokeStyle = '#4a3220'; g.lineWidth = 9; g.beginPath(); g.moveTo(14, s - 12); g.lineTo(s * 0.3, s * 0.62); g.moveTo(s - 14, s - 12); g.lineTo(s * 0.7, s * 0.62); g.stroke(); g.restore(); }
    const ww = s * 0.34, wh = s * 0.44, wx = (s - ww) / 2, wy = s * 0.2;
    g.fillStyle = kind === 'brick' ? '#c9b38e' : '#5b4028'; g.fillRect(wx - 5, wy - 5, ww + 10, wh + 12);
    g.fillStyle = '#1c1612'; g.fillRect(wx, wy, ww, wh);
    g.fillStyle = '#6b4a2c'; g.fillRect(wx - ww * 0.32, wy, ww * 0.3, wh); g.fillRect(wx + ww * 1.02, wy, ww * 0.3, wh); }; }
  const facadeTiles = { brick: tex(128, facadeCanvas('brick', [170, 86, 54])), brick2: tex(128, facadeCanvas('brick', [150, 96, 70])),
    plaster: tex(128, facadeCanvas('plaster', '214,190,150')), ochre: tex(128, facadeCanvas('plaster', '200,150,90')), timber: tex(128, facadeCanvas('timber', '196,160,112')) };
  const matCache = {};
  function facadeMat(kind, rx, ry = 1) { const key = kind + rx.toFixed(2) + ry.toFixed(2); if (matCache[key]) return matCache[key];
    const t = facadeTiles[kind].clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return (matCache[key] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 })); }
  // box with facade on the 4 sides; w along x, d along z
  function facadeBox(w, h, d, kind, floors = 1) { const fx = facadeMat(kind, Math.max(1, Math.round(w / 0.95)), floors), fz = facadeMat(kind, Math.max(1, Math.round(d / 0.95)), floors), top = concreteMat;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [fz, fz, top, top, fx, fx]); m.castShadow = m.receiveShadow = true; return m; }
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  function gableRoof(w, d, rise, mat) { const g = new THREE.Group(); const half = d / 2 + 0.12, len = Math.hypot(half, rise), ang = Math.atan2(rise, half);
    for (const s of [1, -1]) { const p = box(w + 0.24, 0.06, len, mat); p.rotation.x = s * ang; p.position.set(0, rise / 2, s * half / 2); g.add(p); }
    const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(d / 2, 0); sh.lineTo(0, rise); sh.lineTo(-d / 2, 0);
    for (const s of [1, -1]) { const e = new THREE.Mesh(new THREE.ShapeGeometry(sh), plasterMat); e.rotation.y = Math.PI / 2; e.position.x = s * (w / 2 - 0.01); e.material.side = THREE.DoubleSide; g.add(e); }
    return g; }

  // ---------- helpers (drop / pop) ----------
  const LAND = 0.7;
  function dropIn(obj, t0, dur = 0.5, height = 2.4, opts = {}) {
    const base = obj.position.clone(), base_r = obj.rotation.clone(); const tl = t0 + dur * LAND;
    if (opts.puff !== false) { S.updateMatrixWorld(true); const wp = obj.parent ? obj.parent.localToWorld(base.clone()) : base.clone(); dust.puff(tl, V(wp.x, Math.max(0, wp.y - (opts.half ?? 0)), wp.z), opts.puffSize ?? 0.8, opts.puffCount ?? 8); }
    if (opts.sound !== false) sfx(tl, opts.sound || 'thud', opts.gain ?? 0.8);
    on(t => { obj.visible = t >= t0; if (t < t0) return; const p = clamp01((t - t0) / dur);
      let h; if (p < LAND) { const q = p / LAND; h = 1 - q * q; } else { const q = (p - LAND) / (1 - LAND); h = 0.05 * Math.sin(Math.PI * q) * (1 - q); }
      obj.position.set(base.x, base.y + h * height, base.z); obj.rotation.set(base_r.x + h * (opts.spin ?? 0.15), base_r.y + h * (opts.spin ?? 0.15) * 0.5, base_r.z); });
    return tl;
  }
  function popIn(obj, t0, dur = 0.35, sound = 'pop', gain = 0.6) { const s0 = obj.scale.clone(); if (sound) sfx(t0, sound, gain);
    on(t => { obj.visible = t >= t0; const p = clamp01((t - t0) / dur), k = Math.max(0.001, ease.outBack(p)); obj.scale.set(s0.x * k, s0.y * k, s0.z * k); }); }

  // ---------- people ----------
  function makePerson(tunic, scale = 0.33) { const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.8, 10), cloth); body.position.y = 0.98;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), M.skin); head.position.y = 1.56;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.147, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 1 })); hair.position.y = 1.58;
    g.add(body, head, hair);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.62, 8), dark); leg.position.set(0.09 * s, 0.31, 0); g.add(leg); g[s > 0 ? 'legR' : 'legL'] = leg;
      const piv = new THREE.Group(); piv.position.set(0.24 * s, 1.34, 0); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.58, 8), cloth); arm.position.y = -0.29;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.skin); hand.position.y = -0.6; piv.add(arm, hand); g.add(piv); g[s > 0 ? 'armR' : 'armL'] = piv; }
    g.scale.setScalar(scale); return world.add(g); }
  function walkPose(p, t, moving) { const w = moving ? Math.sin(t * 10) : 0; p.armL.rotation.x = 0.5 * w; p.armR.rotation.x = -0.5 * w; p.legL.rotation.x = -0.4 * w; p.legR.rotation.x = 0.4 * w; }

  // ---------- neighbourhood blocks ----------
  const GF = 1.3, FH = 0.95;
  // generic insula-like block: returns { group, floors[] }
  function block(x0, x1, z0, z1, n, kind, roof = true, parent = S) { const g = new THREE.Group(); parent.add(g); const w = x1 - x0, d = z1 - z0, floors = [];
    g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const gf = facadeBox(w, GF, d, kind === 'timber' ? 'plaster' : kind); gf.position.y = GF / 2; g.add(gf); floors.push(gf);
    for (let i = 0; i < n - 1; i++) { const f = facadeBox(w - 0.04, FH, d - 0.04, kind); f.position.y = GF + FH * (i + 0.5); g.add(f); floors.push(f); }
    let r = null; if (roof) { r = gableRoof(w, d, 0.5, tileMat); r.position.y = GF + FH * (n - 1); r.traverse(c => { if (c.isMesh) { c.castShadow = c.receiveShadow = true; } }); g.add(r); }
    return { g, floors, roof: r, top: GF + FH * (n - 1) }; }
  // left neighbour (burns), right neighbour (collapses), back row, across the street
  const left = block(-7.6, -3.5, -2.2, 2.0, 5, 'ochre');
  const rightPivot = new THREE.Group(); S.add(rightPivot);
  const right = block(3.5, 7.4, -2.0, 1.9, 5, 'timber');
  block(-11.8, -8.1, -2.2, 2.2, 4, 'brick2');
  block(-8, -3.6, -8.2, -3.0, 4, 'plaster'); block(4.2, 10, -8.4, -3.2, 5, 'brick2');
  [[-16, -10.6, 3], [-10.1, -5.4, 4], [5.4, 10.4, 3], [10.9, 16, 4]].forEach(([a, b, n], i) => block(a, b, 12.2, 15.6, n, ['brick', 'ochre', 'plaster', 'brick2'][i]));
  // the two plots behind us that get built during the height-limit beats
  const backA = block(-3.1, 1.4, -7.8, -3.0, 6, 'brick'), backB = block(1.9, 3.7, -7.0, -3.0, 5, 'ochre', true);
  // backB sits partially behind; it is the "after Trajan" build (5 storeys ≤ 60 ft)

  // ---------- OUR INSULA ----------
  const XW = 3.0, ZD = 2.0; // half-width, half-depth
  // ground floor: back wall, side walls, partitions, front piers, lintel (brick-faced concrete)
  const tUp = W('up', 'starting') - 0.05, upSpan = E('up') - tUp - 0.35;
  const gfParts = [];
  gfParts.push(box(6, GF, 0.25, brickMat, 0, GF / 2, -ZD + 0.125));
  for (const s of [-1, 1]) gfParts.push(box(0.25, GF, 4, brickMat, s * (XW - 0.125), GF / 2, 0));
  const bayX = []; for (let i = 0; i < 6; i++) bayX.push(-2.85 + i * 1.14);
  for (const x of bayX) gfParts.push(box(0.3, GF, 0.3, brickMat, x, GF / 2, ZD - 0.15));
  for (let i = 1; i < 5; i++) gfParts.push(box(0.1, GF, 3.6, concreteMat, bayX[i], GF / 2, 0));
  const lintel = box(6, 0.26, 0.32, brickMat, 0, GF - 0.13, ZD - 0.15); gfParts.push(lintel);
  gfParts.forEach((p, i) => { world.add(p); dropIn(p, tUp + i * upSpan / gfParts.length, 0.42, 2.2, { gain: 0.6, sound: i % 2 ? 'clack' : 'thud', puffSize: 0.5, puffCount: 5, half: GF / 2 }); });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a211b, roughness: 1 });
  const gfFloor = world.add(box(5.6, 0.02, 3.7, dark, 0, 0.012, 0)); on(t => { gfFloor.visible = t >= tUp; });
  // plot outline before building (stakes + rope), visible in intro
  const stakes = []; for (const [x, z] of [[-XW, -ZD], [XW, -ZD], [XW, ZD], [-XW, ZD]]) stakes.push(world.add(box(0.06, 0.35, 0.06, M.wood, x, 0.175, z)));
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0 });
  const ropes = [box(6, 0.015, 0.015, lineMat, 0, 0.3, ZD), box(6, 0.015, 0.015, lineMat, 0, 0.3, -ZD), box(0.015, 0.015, 4, lineMat, XW, 0.3, 0), box(0.015, 0.015, 4, lineMat, -XW, 0.3, 0)];
  ropes.forEach(r => world.add(r)); on(t => { const v = t < tUp + 0.6; stakes.forEach(s => s.visible = v); ropes.forEach(r => r.visible = v); });

  // tabernae: counters, goods, awnings, shopkeepers
  const tShop = T('shop') + 0.2, shopSpan = W('shop', 'this') - tShop - 0.2;
  const awnCols = [0xb4472e, 0xd9b45a, 0x3e6e8e, 0x7f4a8a, 0x5d8a43];
  const amphGeo = new THREE.LatheGeometry([[0, 0], [0.04, 0.02], [0.07, 0.1], [0.075, 0.18], [0.04, 0.27], [0.03, 0.31], [0.035, 0.33]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
  const amphMat = new THREE.MeshStandardMaterial({ color: 0xb5683e, roughness: 0.8 });
  const breadMat = new THREE.MeshStandardMaterial({ color: 0xc8904a, roughness: 0.9 });
  for (let i = 0; i < 5; i++) { const cx = (bayX[i] + bayX[i + 1]) / 2, tt = tShop + i * shopSpan / 5;
    const counter = world.add(box(0.75, 0.34, 0.2, concreteMat, cx, 0.17, ZD - 0.32)); dropIn(counter, tt, 0.4, 1.6, { gain: 0.6, puffSize: 0.4, puffCount: 4 });
    const awn = world.add(box(0.95, 0.03, 0.55, new THREE.MeshStandardMaterial({ color: awnCols[i], roughness: 0.9 }), cx, 1.0, ZD + 0.22)); awn.rotation.x = 0.28; popIn(awn, tt + 0.2, 0.35, 'pop', 0.4);
    const goods = new THREE.Group(); goods.position.set(cx, 0.34, ZD - 0.32); world.add(goods);
    if (i % 2 === 0) for (let k = -1; k <= 1; k++) { const a = new THREE.Mesh(amphGeo, amphMat); a.position.x = k * 0.2; a.castShadow = true; goods.add(a); }
    else for (let k = -2; k <= 2; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), breadMat); b.scale.y = 0.6; b.position.set(k * 0.12, 0.03, 0); goods.add(b); }
    popIn(goods, tt + 0.3, 0.3, false);
    const keeper = makePerson([0x8a5a2b, 0x5b6f3a, 0x7a3b2a, 0x4a5f7a, 0x8a7a4a][i]); keeper.position.set(cx, 0, ZD - 0.75); keeper.rotation.y = 0; popIn(keeper, tt + 0.35, 0.35, false);
    on(t => { keeper.armR.rotation.x = -0.4 - 0.3 * Math.sin(t * 2 + i); }); }

  // workers arriving (pure function of t)
  const crowd = []; for (let i = 0; i < 10; i++) { const p = makePerson([0x9b8b6b, 0x6b5b4b, 0x8a4b3b, 0x5b6b7b, 0xa08060][i % 5]);
    const side = i % 2 ? 1 : -1, tx = -2.6 + i * 0.58, tz = 2.9 + (i % 3) * 0.45; p.userData = { sx: side * (11 + i * 0.7), sz: 3.4 + (i % 4) * 0.5, tx, tz, t0: T('workers') + 0.1 + i * 0.18 }; crowd.push(p); }
  on(t => { for (const p of crowd) { const u = p.userData; p.visible = t >= u.t0 && t < T('timber'); if (!p.visible) continue;
    const q = prog(t, u.t0, 2.4), e = ease.out(q); p.position.set(lerp(u.sx, u.tx, e), 0, lerp(u.sz, u.tz, e));
    p.rotation.y = q < 1 ? Math.atan2(u.tx - u.sx, u.tz - u.sz) : Math.PI; walkPose(p, t, q < 0.97); } });

  // upper floors
  const upper = new THREE.Group(); S.add(upper); // timber floors + roof go in here so they can wobble
  function floorParts(y0, kind, parent) { const parts = [];
    parts.push(box(6.1, 0.1, 4.1, concreteMat, 0, y0 + 0.05, 0));
    const fW = facadeMat(kind, 6, 1), fD = facadeMat(kind, 4, 1);
    const mk = (w, d, mat, x, z) => { const m = box(w, FH - 0.1, d, mat, x, y0 + 0.1 + (FH - 0.1) / 2, z); return m; };
    parts.push(mk(6, 0.2, fW, 0, -ZD + 0.1), mk(0.2, 3.6, fD, -XW + 0.1, 0), mk(0.2, 3.6, fD, XW - 0.1, 0), mk(6, 0.2, fW, 0, ZD - 0.1));
    parts.forEach(p => parent.add(p)); return parts; }
  const stackT0 = T('stack') + 0.15, stackSpan = W('stack', 'thick') - stackT0 + 0.6;
  for (let f = 0; f < 2; f++) floorParts(GF + f * FH, 'brick', S).forEach((p, i) => { p.castShadow = true; const k = f * 5 + i;
    dropIn(p, stackT0 + k * stackSpan / 10, 0.42, 2.0, { gain: 0.6, sound: i ? 'clack' : 'thud', puffSize: 0.5, puffCount: 5 }); });
  // thick walls hint: corner piers on the brick floors
  // balcony for the wealthy tenant
  const balc = new THREE.Group(); balc.position.set(0, GF + FH, ZD + 0.28); world.add(balc);
  balc.add(box(4.2, 0.07, 0.56, M.darkWood, 0, 0.035, 0)); for (let i = 0; i <= 10; i++) balc.add(box(0.03, 0.3, 0.03, M.darkWood, -2.05 + i * 0.41, 0.2, 0.25));
  balc.add(box(4.2, 0.04, 0.05, M.darkWood, 0, 0.36, 0.25)); balc.traverse(c => { if (c.isMesh) c.castShadow = true; });
  const balcY = balc.position.y; popIn(balc, T('rich') + 0.1, 0.4, 'thud', 0.7);
  const richP = makePerson(0xf0ece0, 0.33); richP.position.set(0.2, balcY + 0.07, ZD + 0.22); richP.rotation.y = 0.3;
  const sash = world.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 16), new THREE.MeshStandardMaterial({ color: 0x6a1f4f, roughness: 0.8 }))); sash.rotation.set(1.2, 0.3, 0.6); sash.scale.setScalar(0.33);
  const richP2 = makePerson(0x2f5f8f, 0.31); richP2.position.set(-0.4, balcY + 0.07, ZD + 0.2); richP2.rotation.y = -0.2;
  popIn(richP, W('rich', 'wealthiest'), 0.35, 'pop', 0.5); popIn(richP2, W('rich', 'lower'), 0.35, 'pop', 0.4);
  on(t => { sash.visible = richP.visible; sash.position.set(0.2, balcY + 0.07 + 0.37, ZD + 0.22); richP.armR.rotation.x = -0.6 + 0.2 * Math.sin(t * 1.5); });

  // building materials in the street: bricks (expensive) then timber (fast)
  const pallets = [];
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(-1.6 + i * 0.75, 0, 3.6); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.add(box(0.18, 0.08, 0.36, brickMat, -0.2 + c * 0.2, 0.04 + r * 0.085, 0)); world.add(g); pallets.push(g); popIn(g, T('cost') + 0.2 + i * 0.25, 0.3, 'clack', 0.6); }
  const tFast = W('cost', 'fast') - 0.2; const logs = [];
  for (let i = 0; i < 5; i++) { const l = world.add(K.log(1.8, 0.07, M.wood)); l.position.set(1.3, 0.07 + (i > 2 ? 0.13 : 0), 3.4 + (i % 3) * 0.15 + (i > 2 ? 0.07 : 0)); l.rotation.y = 0; logs.push(l);
    dropIn(l, W('cost', 'more') + i * 0.18, 0.4, 1.8, { gain: 0.7, sound: 'thud', puffSize: 0.4, puffCount: 4, spin: 0.3 }); }
  on(t => { const v = t < T('water'); pallets.forEach(p => { if (!v) p.visible = false; }); logs.forEach(l => { if (!v) l.visible = false; }); });

  // timber floors (2) — slab, frame posts, top beam, infill
  const tTim0 = T('timber') + 0.05, tTim1 = W('water', 'tenants') - 0.3; const timSpan = tTim1 - tTim0;
  const timberSteps = [];
  for (let f = 0; f < 2; f++) { const y0 = GF + 2 * FH + f * FH;
    const slab = box(6.1, 0.1, 4.1, M.darkWood, 0, y0 + 0.05, 0); upper.add(slab); timberSteps.push({ o: slab, kind: 'drop' });
    for (const zs of [1, -1]) { const row = new THREE.Group(); for (let i = 0; i <= 6; i++) row.add(box(0.1, FH - 0.1, 0.1, M.darkWood, -XW + 0.05 + i * (5.9 / 6), y0 + 0.1 + (FH - 0.1) / 2, zs * (ZD - 0.03)));
      for (const xs of [-1, 1]) for (let i = 1; i < 4; i++) if (zs > 0) row.add(box(0.1, FH - 0.1, 0.1, M.darkWood, xs * (XW - 0.03), y0 + 0.1 + (FH - 0.1) / 2, -ZD + i * 1.0));
      row.add(box(6.1, 0.08, 0.12, M.darkWood, 0, y0 + FH - 0.04, zs * (ZD - 0.03))); upper.add(row); timberSteps.push({ o: row, kind: 'drop' }); }
    const fW = facadeMat('timber', 6, 1), fD = facadeMat('timber', 4, 1); const ih = FH - 0.18, iy = y0 + 0.1 + ih / 2;
    for (const [w, d, mat, x, z] of [[5.9, 0.12, fW, 0, ZD - 0.1], [5.9, 0.12, fW, 0, -ZD + 0.1], [0.12, 3.7, fD, XW - 0.1, 0], [0.12, 3.7, fD, -XW + 0.1, 0]]) {
      const m = box(w, ih, d, mat, x, iy, z); upper.add(m); timberSteps.push({ o: m, kind: 'pop' }); } }
  timberSteps.forEach((s, i) => { const tt = tTim0 + i * timSpan / timberSteps.length; s.o.traverse(c => { if (c.isMesh) c.castShadow = true; });
    if (s.kind === 'drop') dropIn(s.o, tt, 0.4, 1.8, { gain: 0.65, sound: 'thud', puffSize: 0.45, puffCount: 4 }); else popIn(s.o, tt, 0.3, 'pop', 0.35); });
  // roof
  const roofY = GF + 4 * FH; const attic = box(6.1, 0.1, 4.1, M.darkWood, 0, roofY + 0.05, 0); upper.add(attic);
  const roof = gableRoof(6.0, 4.0, 0.55, tileMat); roof.position.y = roofY + 0.1; roof.traverse(c => { if (c.isMesh) c.castShadow = true; }); upper.add(roof);
  const tRoof = W('roof', 'under') - 0.25; dropIn(attic, tRoof - 0.45, 0.4, 1.6, { gain: 0.7, puffSize: 0.5 }); dropIn(roof, tRoof, 0.5, 2.2, { gain: 1.0, puffSize: 0.9, puffCount: 10 });
  // attic dwellers peeking from the gable window line
  const atticPeople = []; for (let i = 0; i < 3; i++) { const p = makePerson([0x7b6b5b, 0x8b5b3b, 0x5b5b6b][i], 0.3); p.position.set(-1.6 + i * 1.6, roofY - FH + 0.12, ZD + 0.05); upper.add(p); p.visible = false; atticPeople.push(p); }
  // (kept hidden: windows are painted) — the roof beat shows rooms by camera rise instead
  // wobble of the upper timber stack (flimsy)
  on(t => { const a = t >= T('flimsy') && t < E('flimsy') ? 1 : 0; const env = a * Math.sin(Math.PI * prog(t, T('flimsy'), E('flimsy') - T('flimsy')));
    upper.rotation.z = env * 0.03 * Math.sin(t * 7.3); upper.position.x = -upper.rotation.z * (GF + 2 * FH); });
  for (let tt = T('flimsy') + 0.4; tt < E('flimsy') - 0.3; tt += 0.75) sfx(tt, 'creak', 0.7);

  // fountain & food stall in the street; a tenant hauling water
  const fountain = new THREE.Group(); fountain.position.set(3.0, 0, 5.2); world.add(fountain);
  { const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.32, 24, 1, true), concreteMat); basin.position.y = 0.16; basin.material = concreteMat.clone(); basin.material.side = THREE.DoubleSide;
    const wtr = new THREE.Mesh(new THREE.CircleGeometry(0.49, 24), new THREE.MeshStandardMaterial({ color: 0x2c6f8f, roughness: 0.1, emissive: 0x0b2f3f })); wtr.rotation.x = -Math.PI / 2; wtr.position.y = 0.27;
    const pillar = box(0.16, 0.7, 0.16, concreteMat, 0, 0.35, -0.45); const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), M.iron); spout.rotation.x = Math.PI / 2; spout.position.set(0, 0.55, -0.32);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6), new THREE.MeshStandardMaterial({ color: 0x9fd0e8, transparent: true, opacity: 0.8 })); stream.position.set(0, 0.41, -0.22);
    fountain.add(basin, wtr, pillar, spout, stream); fountain.traverse(c => { if (c.isMesh) c.castShadow = true; }); }
  const tFount = W('water', 'fountain') - 0.35; dropIn(fountain, tFount, 0.45, 2.0, { gain: 0.9, puffSize: 0.7 }); sfx(tFount + 0.6, 'splash', 0.5);
  const stall = new THREE.Group(); stall.position.set(-3.2, 0, 5.4); world.add(stall);
  stall.add(box(1.0, 0.36, 0.35, M.wood, 0, 0.18, 0)); for (const s of [-1, 1]) stall.add(box(0.05, 0.9, 0.05, M.darkWood, s * 0.48, 0.45, -0.15));
  { const aw = box(1.2, 0.03, 0.7, new THREE.MeshStandardMaterial({ color: 0xc9a23a, roughness: 0.9 }), 0, 0.9, 0.05); aw.rotation.x = 0.2; stall.add(aw);
    for (let k = -1; k <= 1; k++) { const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.1, 12), amphMat); pot.position.set(k * 0.3, 0.41, 0); stall.add(pot); } }
  stall.traverse(c => { if (c.isMesh) c.castShadow = true; });
  const tStall = W('water', 'dinner') - 0.3; dropIn(stall, tStall, 0.45, 1.8, { gain: 0.8, puffSize: 0.6 });
  const vendor = makePerson(0x9a3b2a); vendor.position.set(-3.2, 0, 5.05); vendor.rotation.y = 0; popIn(vendor, tStall + 0.3, 0.3, false);
  const carrier = makePerson(0x6b7b4b); const cBucket = K.bucket(M); cBucket.scale.setScalar(0.4); world.add(cBucket);
  const pA = V(2.3, 0, 2.45), pB = V(2.9, 0, 4.55);
  on(t => { const t0 = W('water', 'haul') - 0.2; carrier.visible = t >= t0 && t < E('roof'); cBucket.visible = carrier.visible; if (!carrier.visible) return;
    const k = (t - t0) / 1.8, leg = Math.floor(k) % 2, f = clamp01(k - Math.floor(k)), q = ease.inOut(clamp01(f / 0.8)); const a = leg ? pB : pA, b = leg ? pA : pB;
    carrier.position.lerpVectors(a, b, q); carrier.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); walkPose(carrier, t, f < 0.8);
    carrier.updateMatrixWorld(true); const h = carrier.armR.localToWorld(V(0, -0.6, 0)); cBucket.position.set(h.x, h.y - 0.08, h.z); });

  // ---------- collapse of the right neighbour (upper 3 floors topple outward) ----------
  { const rg = right.g; const pivotX = 7.4; const top = new THREE.Group(); rightPivot.add(top); rightPivot.position.set(pivotX, GF + FH, 0);
    for (let i = 2; i < right.floors.length; i++) { const f = right.floors[i]; rg.remove(f); f.position.set(rg.position.x - pivotX, f.position.y - (GF + FH), rg.position.z); top.add(f); }
    rg.remove(right.roof); right.roof.position.set(rg.position.x - pivotX, right.roof.position.y - (GF + FH), rg.position.z); top.add(right.roof);
    const tC = W('collapse', 'falling') - 0.3; const rubble = new THREE.Group(); world.add(rubble);
    for (let i = 0; i < 40; i++) { const r = K.stoneBlock(0.18 + K.rand() * 0.2, 0.12 + K.rand() * 0.12, 0.18 + K.rand() * 0.2, i % 3 ? brickMat : M.darkWood); r.position.set(7.6 + K.rand() * 2.6, 0.06 + K.rand() * 0.4, -1.8 + K.rand() * 3.6); r.rotation.set(K.rand() * 3, K.rand() * 3, K.rand() * 3); rubble.add(r); }
    rubble.traverse(c => { if (c.isMesh) c.castShadow = true; });
    on(t => { const p = clamp01((t - tC) / 1.1), e = p * p; rightPivot.rotation.z = -e * 1.45; top.visible = p < 1; rightPivot.position.y = GF + FH - e * 1.2; rubble.visible = t >= tC + 0.95;
      // the leaning: a slight tilt starts a second earlier
      if (t < tC && t > tC - 1.4) rightPivot.rotation.z = -0.05 * prog(t, tC - 1.4, 1.4); });
    sfx(tC - 1.0, 'creak', 0.9); sfx(tC + 0.9, 'rumble', 1.0); sfx(tC + 1.0, 'thud', 1.0);
    for (let i = 0; i < 8; i++) dust.puff(tC + 0.95 + i * 0.12, V(8.0 + K.rand() * 2.5, 0.2, -1.5 + K.rand() * 3), 1.6, 9); }

  // ---------- fire: left neighbour, then the district ----------
  const flames = new K.Dust(world, 260, 'rgba(255,150,40,A)'), smoke = new K.Dust(world, 120, 'rgba(55,50,46,A)');
  const tF = W('fire', 'burns') - 0.2, tSpread = W('fire', 'swept') - 0.2, tFend = T('limit') + 0.6;
  const fireSites = [[-5.55, 2.2, 1.3, 0], [-5.55, 2.2, 2.6, 0], [-5.55, 2.2, 4.0, 0], [-5.55, 0, 4.9, 0], [-9.9, 2.4, 3.2, 1], [-5.8, -3.2, 3.4, 1], [-13.3, 14, 2.6, 1], [-7.7, 14, 3.4, 1], [7.0, -3.5, 4.4, 1]];
  for (let tt = tF; tt < tFend; tt += 0.14) for (const [x, z, y, late] of fireSites) { if (late && tt < tSpread) continue; if (K.rand() < 0.45) continue;
    flames.puff(tt, V(x + (K.rand() - 0.5) * 3.2, y + K.rand() * 0.6, z + (K.rand() - 0.5) * 0.6), 1.4 + K.rand() * 0.9, 3);
    if (K.rand() < 0.35) smoke.puff(tt + 0.2, V(x + (K.rand() - 0.5) * 2, y + 1.2 + K.rand() * 1.5, z), 2.6, 1); }
  sfx(tF, 'whoosh', 0.9); for (let tt = tF + 0.3; tt < tFend - 0.3; tt += 0.6) sfx(tt, 'rustle', 0.8); sfx(tSpread, 'rumble', 0.8);
  flames.pool.forEach(sp => { sp.material.blending = THREE.AdditiveBlending; });
  const charred = new THREE.Color(0x2a2420); const leftMats = []; left.g.traverse(c => { if (c.isMesh) { const ms = Array.isArray(c.material) ? c.material : [c.material]; c.material = ms.map(m => { const n = m.clone(); leftMats.push([n, n.color.clone()]); return n; }); if (c.material.length === 1) c.material = c.material[0]; } });
  const glowMats = []; leftMats.forEach(([m]) => glowMats.push(m));
  on(t => { const c = clamp01((t - tF) / 3.5); for (const [m, c0] of leftMats) { m.color.copy(c0).lerp(charred, c * 0.92); m.emissive.setRGB(0.12 * (t > tF && t < tFend ? (0.6 + 0.4 * Math.sin(t * 23)) : 0) * c, 0.02 * c * (t < tFend ? 1 : 0), 0); } });

  // ---------- height limits ----------
  const H70 = 6.9, H60 = 5.92; const tLim = W('limit', 'higher') - 0.2, tTraj = W('trajan', 'sixty') - 0.3;
  const limitPlane = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), new THREE.MeshBasicMaterial({ color: 0xff3b2f, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
  limitPlane.rotation.x = -Math.PI / 2; S.add(limitPlane);
  const limitEdge = new THREE.Mesh(new THREE.BoxGeometry(22, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xff3b2f })); S.add(limitEdge);
  function textSprite(str) { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(160,20,12,0.92)'; g.beginPath(); g.roundRect(6, 14, 500, 100, 24); g.fill(); g.font = '900 60px Cap'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(str, 256, 66);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(4.2, 1.05, 1); s.renderOrder = 10; S.add(s); return s; }
  const sign70 = textSprite('70 ROMAN FEET'), sign60 = textSprite('60 ROMAN FEET');
  sfx(tLim, 'whoosh', 0.7); sfx(tTraj + 0.1, 'slide', 0.8);
  on(t => { const vis = t >= tLim && t < T('city') + 1.0; limitPlane.visible = limitEdge.visible = vis;
    const y = lerp(H70, H60, ease.inOut(prog(t, tTraj, 0.9))); limitPlane.position.set(0, y, -1); limitEdge.position.set(0, y, 8.0);
    const a = ease.outBack(prog(t, tLim, 0.35)); sign70.visible = vis && t < tTraj + 0.4; sign60.visible = vis && t >= tTraj + 0.4;
    sign70.position.set(0.3, y + 0.8, 2.5); sign60.position.set(0.3, y + 0.8, 2.5); sign70.scale.set(4.2 * a, 1.05 * a, 1); limitPlane.material.opacity = 0.26 * prog(t, tLim, 0.4); });
  // back plot A rises to the 70-ft line, plot B (after Trajan) to the 60-ft line
  const growA = [...backA.floors, backA.roof], growB = [...backB.floors, backB.roof];
  const tA0 = T('limit') + 0.4, tB0 = tTraj + 0.7;
  growA.forEach((o, i) => { const tt = tA0 + i * (tLim + 0.9 - tA0) / growA.length; dropIn(o, tt, 0.4, 2.0, { gain: 0.55, puffSize: 0.6, puffCount: 5 }); });
  growB.forEach((o, i) => { const tt = tB0 + i * (E('trajan') + 0.6 - tB0) / growB.length; dropIn(o, tt, 0.35, 1.8, { gain: 0.5, puffSize: 0.5, puffCount: 4 }); });

  // ---------- the city: many insulae popping in ----------
  const NB = 520, cityBody = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.95, map: facadeMat('plaster', 3, 4).map }), NB);
  const cityRoof = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xa4482b, roughness: 0.9 }), NB);
  const cityData = []; const cols = [0xd8b48a, 0xc9905e, 0xb8684a, 0xe0caa0, 0xa86a50];
  for (let gx = -14; gx <= 14; gx++) for (let gz = -14; gz <= 14; gz++) { const x = gx * 5.2 + (K.rand() - 0.5), z = gz * 5.2 + (K.rand() - 0.5);
    if (Math.abs(x) < 18 && z > -12 && z < 18) continue; const r = Math.hypot(x, z); if (r > 72 || cityData.length >= NB) continue;
    cityData.push({ x, z, w: 3.4 + K.rand() * 1.0, d: 3.4 + K.rand() * 1.0, h: 3.5 + K.rand() * 2.6, r, c: cols[(K.rand() * cols.length) | 0] }); }
  cityData.forEach((b, i) => { cityBody.setColorAt(i, new THREE.Color(b.c)); });
  cityBody.castShadow = false; cityBody.receiveShadow = true; S.add(cityBody, cityRoof);
  const cm = new THREE.Matrix4(), cq = new THREE.Quaternion(), cs = new THREE.Vector3(), cp = new THREE.Vector3(); const tCity = T('city') + 0.2;
  for (let i = 0; i < 6; i++) sfx(tCity + 0.5 + i * 0.75, 'thud', 0.45);
  on(t => { const vis = t >= tCity; cityBody.visible = cityRoof.visible = vis; if (!vis) return; cityBody.count = cityRoof.count = cityData.length;
    cityData.forEach((b, i) => { const p = ease.outBack(prog(t, tCity + (b.r - 15) / 60 * 4.2, 0.5)), h = Math.max(0.001, b.h * p);
      cm.compose(cp.set(b.x, h / 2, b.z), cq, cs.set(b.w, h, b.d)); cityBody.setMatrixAt(i, cm);
      cm.compose(cp.set(b.x, h + 0.08, b.z), cq, cs.set(b.w + 0.2, 0.16 * Math.max(0.01, p), b.d + 0.2)); cityRoof.setMatrixAt(i, cm); });
    cityBody.instanceMatrix.needsUpdate = cityRoof.instanceMatrix.needsUpdate = true; });

  // ---------- camera ----------
  const sh = [];
  const shot = (t0, t1, p0, g0, p1, g1, fov = 42) => sh.push({ t0, t1, p0, g0, p1: p1 || p0, g1: g1 || g0, fov });
  const tTab = W('shop', 'this') - 0.15, tIns = W('roof', 'this') - 0.15;
  shot(0, T('up'), V(3.6, 4.6, 13.5), V(0, 1.6, -2.0), V(2.8, 3.8, 11.5), V(0, 1.3, -1.5));
  shot(T('up'), T('shop'), V(3.4, 3.4, 9.5), V(0, 0.6, 0), V(2.6, 2.8, 8.2), V(0, 0.7, 0));
  shot(T('shop'), tTab, V(-2.3, 0.85, 4.4), V(-1.8, 0.55, 1.6), V(1.2, 0.85, 4.3), V(1.1, 0.55, 1.6), 44);
  shot(tTab, T('workers'), V(0.9, 1.0, 5.6), V(0.0, 0.75, 1.7), V(0.7, 0.95, 5.2), V(0.0, 0.75, 1.7), 44);
  shot(T('workers'), T('stack'), V(4.6, 1.3, 8.6), V(-0.3, 0.7, 3.0), V(3.9, 1.5, 7.8), V(-0.3, 0.8, 2.8));
  shot(T('stack'), T('rich'), V(4.2, 3.6, 11.5), V(0, 2.0, 0), V(3.4, 4.0, 10.5), V(0, 2.2, 0));
  shot(T('rich'), T('cost'), V(1.5, 1.95, 4.5), V(0.0, 1.6, 2.2), V(1.1, 1.9, 4.1), V(0.0, 1.6, 2.2), 44);
  shot(T('cost'), T('timber'), V(-0.6, 2.2, 9.2), V(0, 1.2, 2.5), V(0.4, 2.8, 9.0), V(0, 1.6, 1.5));
  shot(T('timber'), W('water', 'tenants') - 0.2, V(3.4, 5.0, 9.5), V(0, 3.9, 0.5), V(2.8, 5.2, 8.6), V(0, 4.1, 0.5));
  shot(W('water', 'tenants') - 0.2, tStall - 0.1, V(5.6, 1.35, 8.2), V(2.6, 0.6, 4.2), V(5.0, 1.3, 7.6), V(2.6, 0.6, 4.3), 44);
  shot(tStall - 0.1, T('roof'), V(-1.4, 1.1, 8.4), V(-3.0, 0.6, 5.2), V(-1.8, 1.05, 8.0), V(-3.0, 0.6, 5.2), 44);
  shot(T('roof'), tIns, V(0.4, 2.2, 8.5), V(0, 2.0, 1.5), V(0.6, 5.2, 8.5), V(0, 5.0, 0.0));
  shot(tIns, T('flimsy'), V(4.2, 3.0, 19.5), V(0, 2.9, 0), V(3.6, 3.2, 18.6), V(0, 2.9, 0));
  shot(T('flimsy'), T('collapse'), V(3.6, 4.0, 8.0), V(0.0, 3.9, 0.8), V(3.0, 4.2, 7.4), V(0.0, 4.0, 0.8), 44);
  shot(T('collapse'), T('fire'), V(-1.2, 4.4, 14.0), V(5.6, 2.6, 0), V(-0.8, 4.1, 13.0), V(5.6, 2.4, 0));
  shot(T('fire'), T('limit'), V(2.8, 4.6, 13.5), V(-5.2, 3.0, 0), V(2.2, 6.2, 15.0), V(-5.5, 3.0, 1.0));
  shot(T('limit'), T('trajan'), V(-3.2, 7.4, 17.5), V(0, 4.6, -2.5), V(-2.6, 7.6, 17.0), V(0, 4.6, -2.5));
  shot(T('trajan'), T('city'), V(-2.4, 7.4, 16.8), V(0, 4.3, -2.5), V(-1.6, 7.2, 16.2), V(0, 4.2, -2.5));
  shot(T('city'), T('end'), V(-1.0, 8.5, 18.0), V(0, 2.0, 0), V(12.0, 46.0, 62.0), V(0, 0, -4));
  sh.push({ t0: T('end'), t1: spec.duration + 1, orbit: { a0: 1.25, a1: 1.68, r: 17.5, h: 4.4, tgt: V(0, 2.8, 0) }, fov: 42 });
  const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  function camera(t) {
    const s = sh.find(x => t >= x.t0 && t < x.t1) || sh[sh.length - 1]; const p = ease.inOut(clamp01((t - s.t0) / Math.max(0.01, s.t1 - s.t0)));
    if (s.orbit) { const o = s.orbit, a = lerp(o.a0, o.a1, p); tmp.set(Math.cos(a) * o.r, o.h, Math.sin(a) * o.r); tg.copy(o.tgt); }
    else { tmp.lerpVectors(s.p0, s.p1, p); tg.lerpVectors(s.g0, s.g1, p); }
    world.setCam(tmp, tg, s.fov);
  }
  window.getEvents = () => world.events.slice().sort((a, b) => a.t - b.t);
  return { world, update(t) { for (const f of ups) f(t); camera(t); } };
}
