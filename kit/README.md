# Scene kit

Every video is drawn in 3D from these shared files, so a run only writes two small files: `scene.glsl` (what is in the world) and `edit.jsx` (the shots). Start from `template/`.

| File | What it is | Edit it per video? |
|---|---|---|
| `lib.glsl` | ray marcher, lighting, shadows | no |
| `parts.glsl` | the parts list and material ids | no (add a part only if a topic truly needs a new kind) |
| `render.glsl` | camera, sky, ground, material colours, `pixel()` | no |
| `kit.jsx` | `Scene`, `Label`, `Card`, `Captions`, phrase times `K()`/`C()` | no |
| `template/scene.glsl` | example `map()` with three sets | copy, then rewrite |
| `template/edit.jsx` | example timeline | copy, then change the `CHANGE` lines |
| `scripts/` | `setup.sh`, `align.py`, `preview.sh`, `render.sh`, `finish.sh` | no |

## scene.glsl
- Define only `vec2 map(vec3 p)`, returning `vec2(distance, material id)`. Start from `vec2(p.y, 0.0)` (the ground) and add parts with `opU`. Material ids are listed at the top of `parts.glsl` (stone 2, wood 3, marble 4, brick 5, roof 6, iron 7, water 8, clothing 9, foliage 11, plaster 12, rope 13, gold 14, dark opening 15).
- Move a part by subtracting its position: `pColumn(p - vec3(3.0, 0.0, 1.0), 0.3, 3.2, 4.0)`. Rotate with `q.xz = rot(a) * q.xz`.
- Switch sets with `if (u_site < 0.5) { … } else if (u_site < 1.5) { … }`.
- Make parts arrive with your own 0..1 params: `drop(p, u_walls)` drops a part in from above, `rise(d, p, u_build, height)` grows it upward, `count(u_k, n)` reveals n repeated items one by one. Skip a dropped part entirely while its param is under 0.01.
- Repeated parts on the ground (forests, rows of houses) must use `cellXZ`/`cellBound` like `pForest`, and must never sit inside an `if`. Breaking either rule makes shapes render hollow.
- Units are metres. A person is 1.35 tall. The ground is y = 0.

## edit.jsx
- `DUR`: voice length + about 1.5 s, at least 62.
- `def`: every param your `scene.glsl` uses (`u_site` is written `site`). The camera and look params are already there: `ang` (orbit angle), `dist`, `h` (camera height above target), `tx ty tz` (target), `lens`, `ground` (0 grass, 1 dirt, 2 paving, 3 sand, 4 wood floor, 5 snow), `night` (0..1).
- Cut points: `C("so you fell")` = just before that phrase. `K(...)` = the exact start (for labels). Phrases must appear in `words.json`; numbers appear as words ("twenty-five" may be one word).
- `Scene t0 t1 set anims`: `set` holds fixed params, `anims` holds `[[time, value], ...]` keyframes in global seconds. Scenes must be back to back from 0 to `DUR`.
- `Label s t0 t1 text`: ALL-CAPS naming label (s = the scene's t0). `Card s t0 t1 title sub`: a date or number panel near the top.
- Frame a person or tool with `dist` 2–4 and `lens` 1.3; a building with `dist` 10–16 and `lens` 1.0–1.1.

## Speed
About 0.8–1 s per frame on the XL sandbox for a normal scene, so five 13-second parts take 6–8 minutes each. `preview.sh` prints milliseconds per frame on the standard sandbox: stay under about 6000.
