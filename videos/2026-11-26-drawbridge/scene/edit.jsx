// edit.jsx: castle drawbridge timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 62.2;

const def = { site: 0, dig: 1, moat: 1, deck: 1, chain: 0, gaff: 0, raise: 0, port: 0, march: 0, wave: 0, drum: 0, turn: 0, cw: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });
const T = (a, b) => { try { return C(a); } catch (e) { return C(b); } };

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("so you dig"), c2 = C("but now your"), c3 = C("so you lay"), c4 = C("but a bridge"), c5 = C("so you fix"),
    c6 = C("but the bridge is"), c7 = C("so you wind"), c8 = T("but it's still", "still slow"), c9 = C("so you hang"),
    c10 = C("by the"), c11 = C("now when enemies"), c12 = C("behind it"), c13 = C("congratulations");
  const W = { site: 0 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* hook: castle, no moat, soldiers and villagers on the field */}
      <Scene t0={0} t1={c1} set={{ ...W, dig: 0, moat: 0, deck: 0 }} anims={{ ang: [[0, 0.5], [c1, 0.25]], dist: [[0, 26], [c1, 21]], h: [[0, 6], [c1, 4]], ty: [[0, 4], [c1, 4]], tz: [[0, 4], [c1, 3]], march: [[0, 0], [c1, 0.25]] }} />
      {/* dig and fill the moat */}
      <Scene t0={c1} t1={c2} set={{ ...W, deck: 0 }} anims={{ dig: [[c1, 0], [c1 + 2.2, 1]], moat: [[c1 + 2.0, 0], [K("this is a moat") , 1]], ang: [[c1, -0.7], [c2, -0.35]], dist: [[c1, 14], [c2, 12]], h: [[c1, 6], [c2, 4]], ty: [[c1, 0], [c2, 0]], tz: [[c1, 3], [c2, 3]] }}>
        <Label s={c1} t0={K("this is a moat") + 0.1} t1={c2} text="MOAT" />
      </Scene>
      {/* villagers stuck on the far bank */}
      <Scene t0={c2} t1={c3} set={{ ...W, deck: 0 }} anims={{ wave: [[c2, 0], [c2 + 0.6, 1]], ang: [[c2, 0.9], [c3, 0.7]], dist: [[c2, 7], [c3, 8.5]], h: [[c2, 1.2], [c3, 1.6]], tx: [[c2, 2.5], [c3, 2.0]], ty: [[c2, 1.0], [c3, 1.5]], tz: [[c2, 5.5], [c3, 4.5]], lens: [[c2, 1.3], [c3, 1.3]] }} />
      {/* bridge laid across */}
      <Scene t0={c3} t1={c4} set={{ ...W }} anims={{ deck: [[c3 + 0.3, 0], [c3 + 1.6, 1]], ang: [[c3, 0.45], [c4, 0.15]], dist: [[c3, 12], [c4, 10]], h: [[c3, 3], [c4, 2.5]], ty: [[c3, 1], [c4, 1]], tz: [[c3, 3], [c4, 3]] }} />
      {/* enemy marches in */}
      <Scene t0={c4} t1={c5} set={{ ...W }} anims={{ march: [[c4, 0.3], [c5, 1.0]], ang: [[c4, -0.25], [c5, -0.05]], dist: [[c4, 9], [c5, 7]], h: [[c4, 1.5], [c5, 1.2]], ty: [[c4, 1], [c5, 1.2]], tz: [[c4, 6], [c5, 3]], lens: [[c4, 1.2], [c5, 1.2]] }} />
      {/* chains up to the room above the gate */}
      <Scene t0={c5} t1={c6} set={{ ...W }} anims={{ chain: [[c5 + 0.3, 0], [c5 + 1.8, 1]], ang: [[c5, 0.6], [c6, 0.35]], dist: [[c5, 13], [c6, 15]], h: [[c5, 0], [c6, 1.5]], ty: [[c5, 3], [c6, 4.5]], tz: [[c5, 2], [c6, 1.5]] }} />
      {/* too heavy: guards haul on the chains */}
      <Scene t0={c6} t1={c7} set={{ site: 1, drum: 0, ground: 4 }} anims={{ ang: [[c6, -0.4], [c7, -0.15]], dist: [[c6, 6], [c7, 5]], h: [[c6, 1.2], [c7, 1.0]], ty: [[c6, 1.0], [c7, 1.0]], tz: [[c6, 0.5], [c7, 0.5]] }} />
      {/* windlass */}
      <Scene t0={c7} t1={c8} set={{ site: 1, ground: 4 }} anims={{ drum: [[c7 + 0.2, 0], [c7 + 1.4, 1]], turn: [[c7 + 1.4, 0], [c8, 3]], ang: [[c7, 0.5], [c8, 0.15]], dist: [[c7, 7], [c8, 6]], h: [[c7, 2], [c8, 1.5]], ty: [[c7, 1], [c8, 1]] }}>
        <Label s={c7} t0={K("this is a windlass") + 0.1} t1={c8} text="WINDLASS" />
      </Scene>
      {/* still slow: bridge creeps up */}
      <Scene t0={c8} t1={c9} set={{ ...W, chain: 1 }} anims={{ raise: [[c8, 0], [c9, 0.2]], ang: [[c8, -0.55], [c9, -0.4]], dist: [[c8, 14], [c9, 13]], h: [[c8, 2], [c9, 2.5]], ty: [[c8, 2], [c9, 2]], tz: [[c8, 2], [c9, 2]] }} />
      {/* counterweights in the room */}
      <Scene t0={c9} t1={c10} set={{ site: 1, ground: 4, drum: 1 }} anims={{ cw: [[c9 + 0.3, 0], [c9 + 1.4, 1]], raise: [[c9 + 1.5, 0], [c10, 1]], turn: [[c9 + 1.5, 0], [c10, 8]], ang: [[c9, -0.6], [c10, -0.2]], dist: [[c9, 7.5], [c10, 6.5]], h: [[c9, 1.8], [c10, 1.4]], ty: [[c9, 1], [c10, 1]] }} />
      {/* 14th century lifting arms */}
      <Scene t0={c10} t1={c11} set={{ ...W, chain: 1 }} anims={{ gaff: [[c10 + 0.2, 0], [c10 + 1.4, 1]], raise: [[c10 + 1.6, 0], [c11 - 0.3, 0.45], [c11, 0.45]], ang: [[c10, 0.75], [c11, 0.5]], dist: [[c10, 18], [c11, 16]], h: [[c10, 2], [c11, 3]], ty: [[c10, 5], [c11, 5]], tz: [[c10, 2], [c11, 2]] }}>
        <Card s={c10} t0={c10 + 0.3} t1={c11} title="1300s" sub="LIFTING ARMS" />
      </Scene>
      {/* enemies appear, bridge swings up */}
      <Scene t0={c11} t1={c12} set={{ ...W, chain: 1, gaff: 1 }} anims={{ march: [[c11, -0.3], [c12, 0.0]], raise: [[c11 + 0.8, 0], [c12 - 0.3, 1], [c12, 1]], ang: [[c11, -0.35], [c12, -0.15]], dist: [[c11, 20], [c12, 17]], h: [[c11, 1], [c12, 2]], ty: [[c11, 4], [c12, 4.5]], tz: [[c11, 4], [c12, 3]] }} />
      {/* portcullis, from the courtyard */}
      <Scene t0={c12} t1={c13} set={{ ...W, chain: 1, gaff: 1, raise: 1 }} anims={{ port: [[c12 + 0.2, 0], [c12 + 0.9, 1]], ang: [[c12, 3.0], [c13, 3.3]], dist: [[c12, 10], [c13, 9]], h: [[c12, 0.6], [c13, 1.0]], ty: [[c12, 2], [c13, 2]], tz: [[c12, -1.5], [c13, -1.5]] }}>
        <Label s={c12} t0={K("this is a portcullis") + 0.1} t1={c13} text="PORTCULLIS" />
      </Scene>
      {/* hero: the finished gate */}
      <Scene t0={c13} t1={DUR} set={{ ...W, chain: 1, gaff: 1, march: -0.3 }} anims={{ raise: [[c13, 1], [DUR, 0.75]], ang: [[c13, 0.7], [DUR, 0.25]], dist: [[c13, 24], [DUR, 20]], h: [[c13, 4], [DUR, 3]], ty: [[c13, 5], [DUR, 5]], tz: [[c13, 2], [DUR, 2]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
