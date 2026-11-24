// edit.jsx: the video's timeline. Copy from kit/template, then change only the marked parts.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 65; // CHANGE: voiceover length + about 1.5 s for the final shot, at least 62

// CHANGE: every param scene.glsl uses besides the camera/look params (ang dist h tx ty tz lens ground night).
const def = { site: 0, work: 0, logs: 0, build: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  // CHANGE: cut points at the start of spoken phrases (must exist in words.json), in order.
  const c1 = C("but all you have"), c2 = C("so you fell"), c3 = C("this is a sill");
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* CHANGE: one Scene per shot, back to back from 0 to DUR. Move the camera in every shot. */}
      <Scene t0={0} t1={c1} set={{ site: 0 }} anims={{ ang: [[0, 0.6], [c1, 0.2]], dist: [[0, 12], [c1, 9]], h: [[0, 3], [c1, 2]] }}>
        <Card s={0} t0={0.4} t1={c1} title="1638" sub="NEW SWEDEN" />
      </Scene>
      <Scene t0={c1} t1={c2} set={{ site: 0, work: 1 }} anims={{ logs: [[c1, 0], [c1 + 1.2, 1]], ang: [[c1, -0.4], [c2, 0.1]], dist: [[c1, 7], [c2, 6]] }} />
      <Scene t0={c2} t1={c3} set={{ site: 1, ground: 2 }} anims={{ build: [[c2, 0], [c3 - 0.5, 1]], ang: [[c2, 0.7], [c3, 0.2]], dist: [[c2, 16], [c3, 13]], h: [[c2, 4], [c3, 3]], ty: [[c2, 1.5], [c3, 1.5]] }}>
        <Label s={c2} t0={K("so you fell") + 0.4} t1={c3} text="STONE ARCADE" />
      </Scene>
      <Scene t0={c3} t1={DUR} set={{ site: 2, ground: 1 }} anims={{ ang: [[c3, -0.5], [DUR, 0.5]], dist: [[c3, 9], [DUR, 8]], h: [[c3, 2], [DUR, 2.5]], ty: [[c3, 1.4], [DUR, 1.4]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
