// edit.jsx: olive press timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 68.3;

const def = { site: 0, squeeze: 0, tra: 1, spin: 0, paste: 1, bask: 1, beam: 1, sink: 0, stone: 1, screw: 0, turn: 0, lift: 0, flow: 0, fill: 0, settle: 0, pour: 0, work: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("but squeezing"), c2 = C("so you carve a round"), c3 = C("you push the"), c4 = C("but paste"),
    c5 = C("now you need"), c6 = C("so you fix"), c7 = C("then you tie"), c8 = C("but lifting"),
    c9 = C("so you carve a giant"), c10 = C("the juice"), c11 = C("so you wait"), c12 = C("the biggest"), c13 = C("congratulations");
  const Y = { site: 1, ground: 1 };
  const EMPTY = { tra: 0, paste: 0, bask: 0, beam: 0, stone: 0 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* hook: village among olive trees */}
      <Scene t0={0} t1={c1} set={{ site: 0 }} anims={{ ang: [[0, 0.5], [c1, 0.15]], dist: [[0, 18], [c1, 14]], h: [[0, 5], [c1, 3.5]], ty: [[0, 1.5], [c1, 1.5]], tz: [[0, -2], [c1, -1]] }} />
      {/* squeezing by hand */}
      <Scene t0={c1} t1={c2} set={{ site: 0 }} anims={{ squeeze: [[c1, 0], [c1 + 0.8, 1], [c1 + 1.6, 0.6], [c1 + 2.4, 1]], ang: [[c1, 0.7], [c2, 0.4]], dist: [[c1, 3.5], [c2, 3.0]], h: [[c1, 0.4], [c2, 0.3]], ty: [[c1, 0.9], [c2, 0.9]], tx: [[c1, 0.4], [c2, 0.4]], tz: [[c1, 0.7], [c2, 0.7]], lens: [[c1, 1.3], [c2, 1.3]] }} />
      {/* trapetum arrives */}
      <Scene t0={c2} t1={c3} set={{ ...Y, ...EMPTY, paste: 0 }} anims={{ tra: [[c2 + 0.3, 0], [c2 + 1.8, 1]], ang: [[c2, 0.6], [c3, 0.2]], dist: [[c2, 9], [c3, 7]], h: [[c2, 3.5], [c3, 2.8]], tx: [[c2, 3.8], [c3, 3.8]], ty: [[c2, 0.6], [c3, 0.6]], tz: [[c2, -4.5], [c3, -4.5]] }} />
      {/* crushing to paste */}
      <Scene t0={c3} t1={c4} set={{ ...Y, ...EMPTY, tra: 1 }} anims={{ spin: [[c3, 0], [c4, 7]], paste: [[c3, 0], [K("into paste"), 0], [K("into paste") + 0.2, 1]], ang: [[c3, -0.5], [c4, -0.2]], dist: [[c3, 5.5], [c4, 4.5]], h: [[c3, 2.5], [c4, 2.2]], tx: [[c3, 3.8], [c4, 3.8]], ty: [[c3, 0.5], [c4, 0.5]], tz: [[c3, -4.5], [c4, -4.5]], lens: [[c3, 1.1], [c4, 1.1]] }}>
        <Label s={c3} t0={K("this is a") + 0.1} t1={c4} text="TRAPETUM" />
      </Scene>
      {/* baskets stacked */}
      <Scene t0={c4} t1={c5} set={{ ...Y, beam: 0, stone: 0 }} anims={{ spin: [[c4, 7], [c5, 9]], bask: [[c4 + 1.6, 0], [c5 - 0.2, 1]], ang: [[c4, 0.9], [c5, 0.6]], dist: [[c4, 6], [c5, 5]], h: [[c4, 1.5], [c5, 1.2]], tx: [[c4, 1.5], [c5, 1.5]], ty: [[c4, 0.8], [c5, 0.9]], tz: [[c4, -0.5], [c5, 0]], lens: [[c4, 1.2], [c5, 1.2]] }} />
      {/* need weight: low angle on the stack */}
      <Scene t0={c5} t1={c6} set={{ ...Y, beam: 0, stone: 0 }} anims={{ ang: [[c5, -0.3], [c6, -0.6]], dist: [[c5, 3.2], [c6, 3.8]], h: [[c5, -0.2], [c6, 0.2]], tx: [[c5, 1.5], [c6, 1.5]], ty: [[c5, 1.0], [c6, 1.0]], tz: [[c5, 0], [c6, 0]], lens: [[c5, 1.2], [c6, 1.2]] }} />
      {/* lever beam fixed in the wall */}
      <Scene t0={c6} t1={c7} set={{ ...Y, stone: 0 }} anims={{ beam: [[c6 + 0.4, 0], [c6 + 1.8, 1]], ang: [[c6, 0.45], [c7, 0.3]], dist: [[c6, 13], [c7, 11.5]], h: [[c6, 3], [c7, 2.5]], tx: [[c6, 2.8], [c7, 2.8]], ty: [[c6, 1.3], [c7, 1.3]], tz: [[c6, 0], [c7, 0]] }} />
      {/* weight stone: beam sinks, oil runs */}
      <Scene t0={c7} t1={c8} set={{ ...Y }} anims={{ stone: [[c7 + 0.6, 0], [c7 + 1.8, 1]], sink: [[K("the beam sinks"), 0], [K("this is a lever") - 0.3, 1]], flow: [[K("oil starts"), 0], [K("oil starts") + 0.05, 1]], fill: [[K("oil starts"), 0], [c8, 0.3]], ang: [[c7, -0.35], [c8, -0.2]], dist: [[c7, 12], [c8, 10.5]], h: [[c7, 1.6], [c8, 1.8]], tx: [[c7, 3.0], [c8, 3.0]], ty: [[c7, 1.2], [c8, 1.2]], tz: [[c7, 0.5], [c8, 0.5]] }}>
        <Label s={c7} t0={K("this is a lever") + 0.1} t1={c8} text="LEVER PRESS" />
      </Scene>
      {/* lifting the stone back up by hand */}
      <Scene t0={c8} t1={c9} set={{ ...Y, work: 1, fill: 0.3 }} anims={{ sink: [[c8, 1], [c9, 0.1]], ang: [[c8, 0.8], [c9, 0.6]], dist: [[c8, 5], [c9, 4.5]], h: [[c8, 0.8], [c9, 0.9]], tx: [[c8, 6.2], [c9, 6.2]], ty: [[c8, 0.9], [c9, 1.0]], tz: [[c8, 0.3], [c9, 0.3]], lens: [[c8, 1.2], [c9, 1.2]] }} />
      {/* the screw lifts the stone */}
      <Scene t0={c9} t1={c10} set={{ ...Y, fill: 0.3, screw: 1 }} anims={{ screw: [[c9 + 0.4, 0], [c9 + 1.6, 1]], turn: [[K("and turn it"), 0], [c10, 3]], lift: [[K("now the stone"), 0], [c10, 1]], sink: [[K("now the stone"), 0], [c10, 0.9]], work: [[K("and turn it"), 0], [K("and turn it") + 0.4, 1]], ang: [[c9, -0.5], [c10, -0.2]], dist: [[c9, 7], [c10, 6]], h: [[c9, 1.5], [c10, 1.0]], tx: [[c9, 6.0], [c10, 6.0]], ty: [[c9, 1.7], [c10, 1.5]], tz: [[c9, 0], [c10, 0]], lens: [[c9, 1.1], [c10, 1.1]] }} />
      {/* juice into the pit */}
      <Scene t0={c10} t1={c11} set={{ ...Y, screw: 1, lift: 1, sink: 0.9, work: 1, flow: 1 }} anims={{ fill: [[c10, 0.3], [c11, 0.9]], ang: [[c10, 0.3], [c11, 0.1]], dist: [[c10, 3.8], [c11, 3.2]], h: [[c10, 2.0], [c11, 1.8]], tx: [[c10, 1.5], [c11, 1.5]], ty: [[c10, 0.3], [c11, 0.3]], tz: [[c10, 2.0], [c11, 2.3]], lens: [[c10, 1.2], [c11, 1.2]] }} />
      {/* settle and pour off */}
      <Scene t0={c11} t1={c12} set={{ ...Y, screw: 1, lift: 1, sink: 0.9, fill: 0.9 }} anims={{ settle: [[K("the oil rises"), 0], [K("the oil rises") + 0.05, 1]], pour: [[K("you pour"), 0], [c12, 1]], ang: [[c11, -0.4], [c12, -0.6]], dist: [[c11, 3.5], [c12, 3.8]], h: [[c11, 2.2], [c12, 2.0]], tx: [[c11, 1.8], [c12, 1.9]], ty: [[c11, 0.4], [c12, 0.5]], tz: [[c11, 2.4], [c12, 2.5]], lens: [[c11, 1.2], [c12, 1.2]] }} />
      {/* scale card */}
      <Scene t0={c12} t1={c13} set={{ ...Y, screw: 1, lift: 1, sink: 0.9, fill: 0.9, settle: 1, flow: 1, work: 1 }} anims={{ turn: [[c12, 0], [c13, 1]], ang: [[c12, 1.2], [c13, 0.9]], dist: [[c12, 15], [c13, 13]], h: [[c12, 6], [c13, 5]], tx: [[c12, 2.5], [c13, 2.5]], ty: [[c12, 1], [c13, 1]], tz: [[c12, -1], [c13, -1]] }}>
        <Card s={c12} t0={c12 + 0.3} t1={c13} title="12 M" sub="THE BIGGEST PRESSES" />
      </Scene>
      {/* hero: the whole press yard */}
      <Scene t0={c13} t1={DUR} set={{ ...Y, screw: 1, lift: 1, sink: 0.9, fill: 0.9, settle: 1, flow: 1, work: 1 }} anims={{ spin: [[c13, 0], [DUR, 3]], turn: [[c13, 1], [DUR, 2]], ang: [[c13, -0.4], [DUR, 0.3]], dist: [[c13, 17], [DUR, 15]], h: [[c13, 4], [DUR, 3.5]], tx: [[c13, 2.5], [DUR, 2.5]], ty: [[c13, 1.2], [DUR, 1.2]], tz: [[c13, -1.5], [DUR, -1.5]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
