// edit.jsx: Raising an Egyptian obelisk timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 72;

const def = { site: 0, trench: 0, marks: 0, crack: 0, sx: 0, bx: 0, load: 0, haul: 0, sand: 0, pull: 0, rope: 0, cut: 0, clear: 0, hide: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("so you go"), c2 = C("but granite is"), c3 = C("so you pound"), c4 = C("red marks"),
    c5 = C("but granite can"), k1 = C("this is the unfinished"), c6 = C("so you pick"), c7 = C("there a huge"),
    c8 = C("one record"), c9 = C("but how do"), c10 = C("one idea"), c11 = C("you haul"),
    c12 = C("then you let"), c13 = C("the obelisk sinks"), c14 = C("so teams"), k2 = C("this is an obelisk"),
    c15 = C("congratulations");
  const Q = { site: 0, ground: 1 };
  const N = { site: 1, ground: 3 };
  const T = { site: 2, ground: 3 };
  const DONE = { ...T, haul: 1, sand: 1, pull: 1, clear: 1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* The finished needle at the temple: the goal. */}
      <Scene t0={0} t1={c1} set={{ ...DONE }} anims={{ ang: [[0, 0.5], [c1, 0.2]], dist: [[0, 24], [c1, 20]], h: [[0, -3], [c1, -4]], tx: [[0, 0], [c1, 0]], ty: [[0, 7], [c1, 7]], tz: [[0, 0], [c1, 0]], lens: [[0, 1.0], [c1, 1.0]] }} />
      {/* The granite quarry at Aswan. */}
      <Scene t0={c1} t1={c2} set={{ ...Q }} anims={{ ang: [[c1, 0.9], [c2, 0.6]], dist: [[c1, 24], [c2, 20]], h: [[c1, 9], [c2, 8]], tx: [[c1, 0], [c2, 0]], ty: [[c1, 2], [c2, 2]], tz: [[c1, 0], [c2, 0]] }}>
        <Card s={c1} t0={K("aswan")} t1={c2} title="ASWAN" sub="GRANITE QUARRY" />
      </Scene>
      {/* Too hard to chop: close on the rock and a worker. */}
      <Scene t0={c2} t1={c3} set={{ ...Q }} anims={{ ang: [[c2, 0.2], [c3, 0.45]], dist: [[c2, 5], [c3, 4.2]], h: [[c2, 1.2], [c3, 1.0]], tx: [[c2, -0.5], [c3, -0.5]], ty: [[c2, 2.7], [c3, 2.7]], tz: [[c2, 1.3], [c3, 1.3]], lens: [[c2, 1.3], [c3, 1.3]] }} />
      {/* Pounding a trench around the shape. */}
      <Scene t0={c3} t1={c4} set={{ ...Q }} anims={{ trench: [[c3 + 0.3, 0], [c4, 0.7]], ang: [[c3, 0.6], [c4, 0.35]], dist: [[c3, 13], [c4, 11]], h: [[c3, 6], [c4, 5]], tx: [[c3, 0], [c4, 0]], ty: [[c3, 2], [c4, 2]], tz: [[c3, 0.5], [c4, 0.5]] }} />
      {/* Red marks on the trench wall. */}
      <Scene t0={c4} t1={c5} set={{ ...Q }} anims={{ trench: [[c4, 0.7], [c5, 1]], marks: [[c4 + 0.2, 0], [c4 + 1.0, 1]], ang: [[c4, 0.1], [c5, -0.15]], dist: [[c4, 6], [c5, 5]], h: [[c4, 1.2], [c5, 1.0]], tx: [[c4, -1.5], [c5, 0]], ty: [[c4, 1.4], [c5, 1.4]], tz: [[c4, -1.0], [c5, -1.0]], lens: [[c4, 1.2], [c5, 1.2]] }} />
      {/* The giant that cracked. */}
      <Scene t0={c5} t1={k1} set={{ ...Q, trench: 1, marks: 1 }} anims={{ crack: [[K("split") - 0.1, 0], [K("split") + 0.4, 1]], ang: [[c5, 0.3], [k1, 0.5]], dist: [[c5, 7], [k1, 9]], h: [[c5, 5], [k1, 6]], tx: [[c5, -2.2], [k1, -1]], ty: [[c5, 2], [k1, 2]], tz: [[c5, 0], [k1, 0]], lens: [[c5, 1.2], [k1, 1.1]] }}>
        <Card s={c5} t0={K("42")} t1={k1} title="42 M · 1,000+ TONS" sub="STILL IN THE QUARRY" />
      </Scene>
      <Scene t0={k1} t1={c6} set={{ ...Q, trench: 1, marks: 1, crack: 1 }} anims={{ ang: [[k1, -0.5], [c6, -0.8]], dist: [[k1, 18], [c6, 16]], h: [[k1, 10], [c6, 9]], tx: [[k1, 0.3], [c6, 0.3]], ty: [[k1, 2], [c6, 2]], tz: [[k1, 0], [c6, 0]] }}>
        <Label s={k1} t0={k1 + 0.1} t1={c6} text="UNFINISHED OBELISK" y={1500} />
      </Scene>
      {/* Dragged on a sledge to the river. */}
      <Scene t0={c6} t1={c7} set={{ ...N }} anims={{ sx: [[c6, 9], [c7, 3]], bx: [[c6, 40], [c7, 40]], ang: [[c6, 0.5], [c7, 0.3]], dist: [[c6, 16], [c7, 14]], h: [[c6, 5], [c7, 4]], tx: [[c6, 10], [c7, 5]], ty: [[c6, 1], [c7, 1]], tz: [[c6, -3], [c7, -3]] }} />
      {/* A barge carries it down the Nile. */}
      <Scene t0={c7} t1={c8} set={{ ...N, load: 1 }} anims={{ bx: [[c7, 12], [c8, 4]], ang: [[c7, 0.9], [c8, 0.6]], dist: [[c7, 22], [c8, 20]], h: [[c7, 6], [c8, 5]], tx: [[c7, 10], [c8, 3]], ty: [[c7, 1], [c8, 1]], tz: [[c7, 2], [c8, 2]] }} />
      <Scene t0={c8} t1={c9} set={{ ...N, load: 1 }} anims={{ bx: [[c8, 4], [c9, -2]], ang: [[c8, 0.15], [c9, -0.1]], dist: [[c8, 26], [c9, 24]], h: [[c8, 2], [c9, 2]], tx: [[c8, 2], [c9, -2]], ty: [[c8, 1.5], [c9, 1.5]], tz: [[c8, 4], [c9, 4]] }}>
        <Card s={c8} t0={K("63")} t1={c9} title="63 M" sub="ONE OBELISK SHIP" />
      </Scene>
      {/* How to stand it up? An empty pedestal at the temple. */}
      <Scene t0={c9} t1={c10} set={{ ...T, clear: 1, hide: 1 }} anims={{ ang: [[c9, 0.5], [c10, 0.2]], dist: [[c9, 9], [c10, 7]], h: [[c9, 3], [c10, 2]], tx: [[c9, 0], [c10, 0]], ty: [[c9, 1], [c10, 1]], tz: [[c9, 0], [c10, 0]], lens: [[c9, 1.2], [c10, 1.2]] }} />
      {/* A ramp ending in a pit of sand. */}
      <Scene t0={c10} t1={c11} set={{ ...T, hide: 1 }} anims={{ ang: [[c10, 0.9], [c11, 0.6]], dist: [[c10, 26], [c11, 23]], h: [[c10, 10], [c11, 8]], tx: [[c10, 9], [c11, 8]], ty: [[c10, 3], [c11, 3]], tz: [[c10, 0], [c11, 0]] }} />
      {/* Haul it up, base first, over the pit. */}
      <Scene t0={c11} t1={c12} set={{ ...T }} anims={{ haul: [[c11 + 0.2, 0], [c12 - 0.2, 1]], ang: [[c11, 0.55], [c12, 0.4]], dist: [[c11, 20], [c12, 17]], h: [[c11, 4], [c12, 3]], tx: [[c11, 6], [c12, 3]], ty: [[c11, 5], [c12, 5]], tz: [[c11, 0], [c12, 0]] }} />
      {/* Cutaway: the sand pours out, the base sinks. */}
      <Scene t0={c12} t1={c13} set={{ ...T, haul: 1, cut: 1 }} anims={{ sand: [[c12 + 0.3, 0], [c13, 0.5]], ang: [[c12, 0.15], [c13, 0.3]], dist: [[c12, 14], [c13, 12]], h: [[c12, 1], [c13, 0.5]], tx: [[c12, 1.5], [c13, 1.5]], ty: [[c12, 3.5], [c13, 3]], tz: [[c12, 0], [c13, 0]] }} />
      <Scene t0={c13} t1={c14} set={{ ...T, haul: 1, cut: 1 }} anims={{ sand: [[c13, 0.5], [K("groove"), 1]], ang: [[c13, -0.1], [c14, 0.1]], dist: [[c13, 9], [c14, 7.5]], h: [[c13, 0.5], [c14, 0.2]], tx: [[c13, 0.8], [c14, 0.6]], ty: [[c13, 2], [c14, 1.6]], tz: [[c13, 0], [c14, 0]], lens: [[c13, 1.1], [c14, 1.2]] }} />
      {/* Teams on ropes pull it upright. */}
      <Scene t0={c14} t1={k2} set={{ ...T, haul: 1, sand: 1, cut: 1, rope: 1 }} anims={{ pull: [[c14 + 0.3, 0], [k2 - 0.1, 1]], ang: [[c14, 0.75], [k2, 0.55]], dist: [[c14, 26], [k2, 24]], h: [[c14, 3], [k2, 2.5]], tx: [[c14, -4], [k2, -3]], ty: [[c14, 4.5], [k2, 5]], tz: [[c14, 0], [k2, 0]] }} />
      <Scene t0={k2} t1={c15} set={{ ...DONE }} anims={{ ang: [[k2, -0.3], [c15, 0.0]], dist: [[k2, 18], [c15, 20]], h: [[k2, -2], [c15, -3]], tx: [[k2, 0], [c15, 0]], ty: [[k2, 6], [c15, 6]], tz: [[k2, 0], [c15, 0]] }}>
        <Label s={k2} t0={k2 + 0.1} t1={c15} text="OBELISK" y={1500} />
      </Scene>
      <Scene t0={c15} t1={DUR} set={{ ...DONE }} anims={{ ang: [[c15, 0.2], [DUR, 0.9]], dist: [[c15, 26], [DUR, 32]], h: [[c15, 4], [DUR, 7]], tx: [[c15, 0], [DUR, 0]], ty: [[c15, 5], [DUR, 5]], tz: [[c15, -3], [DUR, -3]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
