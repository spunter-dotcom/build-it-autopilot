// edit.jsx: noria timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 70;

const def = { wheel: 0, R: 3, turn: 0, pad: 0, box: 0, spill: 0, aq: 0, flow: 0, crop: 0, man: 0, walk: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("so you carry"), c2 = C("but it takes"), c3 = C("so you build a giant"), c4 = C("the current pushes"),
    c5 = C("but turning is"), c6 = C("so you fix"), c7 = C("each box dips"), k1 = C("this is a noria"),
    c8 = C("but at the top"), c9 = C("so you build a stone"), c10 = C("and the boxes tip"), k2 = C("this is an aqueduct"),
    c11 = C("but the wheel is"), c12 = C("so you make"), c13 = C("but the thick"), c14 = C("the name noria"),
    c15 = C("in hama"), c16 = C("it could lift"), c17 = C("congratulations");
  const G = { ground: 1 };
  const WH = { ...G, wheel: 1 };
  const TURN = { ...WH, turn: 1, pad: 1 };
  const BOX = { ...TURN, box: 1 };
  const AQ = { ...BOX, aq: 1, flow: 1 };
  const BIG = { ...AQ, R: 10.5 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* Thirsty fields high above the river. */}
      <Scene t0={0} t1={c1} set={{ ...G }} anims={{ ang: [[0, 0.5], [c1, 0.25]], dist: [[0, 17], [c1, 14]], h: [[0, 6], [c1, 5]], tx: [[0, -4], [c1, -4]], ty: [[0, 0], [c1, 0]], tz: [[0, -11], [c1, -11]] }} />
      {/* Carrying a jar up the steps. */}
      <Scene t0={c1} t1={c2} set={{ ...G, man: 1 }} anims={{ walk: [[c1, 0.55], [c2, 1.0]], ang: [[c1, 1.1], [c2, 0.9]], dist: [[c1, 8], [c2, 7]], h: [[c1, 2], [c2, 2.5]], tx: [[c1, 8], [c2, 8]], ty: [[c1, -0.6], [c2, 0.2]], tz: [[c1, -4.5], [c2, -5.8]], lens: [[c1, 1.2], [c2, 1.2]] }} />
      {/* The crops still wilt. */}
      <Scene t0={c2} t1={c3} set={{ ...G }} anims={{ crop: [[c2, 0.5], [c3 - 0.3, 0]], ang: [[c2, 0.1], [c3, 0.35]], dist: [[c2, 6], [c3, 5]], h: [[c2, 1.5], [c3, 1.2]], tx: [[c2, -2], [c3, -2]], ty: [[c2, 0.3], [c3, 0.3]], tz: [[c2, -9], [c3, -9]], lens: [[c2, 1.3], [c3, 1.3]] }} />
      {/* A giant wooden wheel stands in the river. */}
      <Scene t0={c3} t1={c4} set={{ ...G }} anims={{ wheel: [[c3 + 0.5, 0], [c3 + 2.2, 1]], ang: [[c3, 0.55], [c4, 0.3]], dist: [[c3, 15], [c4, 12]], h: [[c3, 3], [c4, 2.5]], ty: [[c3, 1], [c4, 1]], tz: [[c3, -3.5], [c4, -3.5]] }} />
      {/* Paddles; the current turns the wheel. */}
      <Scene t0={c4} t1={c5} set={{ ...WH, turn: 1 }} anims={{ pad: [[c4, 0], [c4 + 1.4, 1]], ang: [[c4, 0.7], [c5, 0.45]], dist: [[c4, 7.5], [c5, 6.5]], h: [[c4, 1.2], [c5, 1.0]], ty: [[c4, -0.6], [c5, -0.4]], tz: [[c4, -3.5], [c5, -3.5]], lens: [[c4, 1.2], [c5, 1.2]] }} />
      {/* Turning is not lifting. */}
      <Scene t0={c5} t1={c6} set={{ ...TURN }} anims={{ ang: [[c5, -0.4], [c6, -0.6]], dist: [[c5, 11], [c6, 10]], h: [[c5, 2], [c6, 2.5]], ty: [[c5, 1.2], [c6, 1.2]], tz: [[c5, -3.5], [c6, -3.5]] }} />
      {/* Boxes around the rim. */}
      <Scene t0={c6} t1={c7} set={{ ...TURN }} anims={{ box: [[c6 + 0.2, 0], [c7 - 0.2, 1]], ang: [[c6, 0.15], [c7, 0.4]], dist: [[c6, 10], [c7, 9]], h: [[c6, 2.5], [c7, 2]], ty: [[c6, 1.2], [c7, 1.2]], tz: [[c6, -3.5], [c7, -3.5]] }} />
      {/* A box dips, fills and rides to the top. */}
      <Scene t0={c7} t1={k1} set={{ ...BOX }} anims={{ ang: [[c7, 1.0], [k1, 0.8]], dist: [[c7, 6], [k1, 7]], h: [[c7, 1.0], [k1, 1.0]], tx: [[c7, 1.6], [k1, 1.6]], ty: [[c7, -0.6], [C("and rides"), -0.4], [k1, 3.2]], tz: [[c7, -3.5], [k1, -3.5]], lens: [[c7, 1.2], [k1, 1.2]] }} />
      <Scene t0={k1} t1={c8} set={{ ...BOX }} anims={{ ang: [[k1, 0.1], [c8, 0.3]], dist: [[k1, 12], [c8, 11]], h: [[k1, 1.2], [c8, 1.5]], ty: [[k1, 1.2], [c8, 1.2]], tz: [[k1, -3.5], [c8, -3.5]] }}>
        <Label s={k1} t0={k1 + 0.1} t1={c8} text="NORIA" y={1500} />
      </Scene>
      {/* At the top the water spills back into the river. */}
      <Scene t0={c8} t1={c9} set={{ ...BOX }} anims={{ spill: [[C("the water just"), 0], [C("back into"), 1]], ang: [[c8, 0.85], [c9, 0.65]], dist: [[c8, 8], [c9, 7.5]], h: [[c8, 1.5], [c9, 1.2]], ty: [[c8, 2.0], [c9, 1.5]], tz: [[c8, -3.3], [c9, -3.3]] }} />
      {/* A stone channel on tall arches rises beside the wheel. */}
      <Scene t0={c9} t1={c10} set={{ ...BOX, spill: 1 }} anims={{ aq: [[c9 + 0.4, 0], [c10 - 0.3, 1]], ang: [[c9, 0.6], [c10, 0.35]], dist: [[c9, 19], [c10, 17]], h: [[c9, 5], [c10, 4.5]], tx: [[c9, -6], [c10, -5]], ty: [[c9, 1.5], [c10, 1.5]], tz: [[c9, -5], [c10, -5]] }} />
      {/* The boxes tip into it. */}
      <Scene t0={c10} t1={k2} set={{ ...AQ }} anims={{ ang: [[c10, 0.95], [k2, 0.75]], dist: [[c10, 7], [k2, 6.5]], h: [[c10, 1.6], [k2, 1.4]], tx: [[c10, 0], [k2, -0.3]], ty: [[c10, 3.4], [k2, 3.4]], tz: [[c10, -4.3], [k2, -4.3]], lens: [[c10, 1.2], [k2, 1.2]] }} />
      <Scene t0={k2} t1={c11} set={{ ...AQ }} anims={{ ang: [[k2, 0.55], [c11, 0.35]], dist: [[k2, 17], [c11, 16]], h: [[k2, 2], [c11, 2.5]], tx: [[k2, -11], [c11, -10]], ty: [[k2, 1.2], [c11, 1.2]], tz: [[k2, -5.3], [c11, -5.3]] }}>
        <Label s={k2} t0={k2 + 0.1} t1={c11} text="AQUEDUCT" y={1500} />
      </Scene>
      {/* Too small to reach the highest fields. */}
      <Scene t0={c11} t1={c12} set={{ ...AQ }} anims={{ ang: [[c11, 0.75], [c12, 0.6]], dist: [[c11, 26], [c12, 24]], h: [[c11, 14], [c12, 12]], tx: [[c11, -6], [c12, -6]], ty: [[c11, 0], [c12, 0]], tz: [[c11, -8], [c12, -8]] }} />
      {/* Bigger. Much bigger. */}
      <Scene t0={c12} t1={c13} set={{ ...AQ }} anims={{ R: [[c12 + 0.3, 3], [K("21") - 0.1, 10.5]], ang: [[c12, 0.45], [c13, 0.2]], dist: [[c12, 16], [K("21"), 30], [c13, 31]], h: [[c12, 4], [c13, 8]], tx: [[c12, -2], [c13, -5]], ty: [[c12, 3], [K("21"), 8], [c13, 8]], tz: [[c12, -4], [c13, -4]] }}>
        <Card s={c12} t0={K("21")} t1={K("with")} title="21 METRES" sub="ACROSS" />
        <Card s={c12} t0={K("with")} t1={c13} title="120 BOXES" sub="ON ONE RIM" />
      </Scene>
      {/* The groaning wooden axle. */}
      <Scene t0={c13} t1={c14} set={{ ...BIG }} anims={{ ang: [[c13, 0.6], [c14, 0.35]], dist: [[c13, 6], [c14, 5]], h: [[c13, 0.6], [c14, 0.4]], ty: [[c13, 8.7], [c14, 8.7]], tz: [[c13, -2.5], [c14, -2.5]], lens: [[c13, 1.3], [c14, 1.3]] }} />
      {/* The name: from the river, looking up. */}
      <Scene t0={c14} t1={c15} set={{ ...BIG }} anims={{ ang: [[c14, -0.25], [c15, -0.45]], dist: [[c14, 22], [c15, 20]], h: [[c14, -6.5], [c15, -6.5]], ty: [[c14, 8], [c15, 8]], tz: [[c14, -3.5], [c15, -3.5]] }}>
        <Card s={c14} t0={K("comes from")} t1={c15} title="NA'URA" sub="ARABIC: TO GROAN" />
      </Scene>
      {/* Hama, 1361. */}
      <Scene t0={c15} t1={c16} set={{ ...BIG }} anims={{ ang: [[c15, 0.85], [c16, 0.5]], dist: [[c15, 31], [c16, 29]], h: [[c15, 6], [c16, 5]], tx: [[c15, -5], [c16, -5]], ty: [[c15, 8], [c16, 8]], tz: [[c15, -4], [c16, -4]] }}>
        <Card s={c15} t0={c15 + 0.2} t1={c16} title="1361" sub="HAMA, SYRIA" />
      </Scene>
      {/* Water reaches the fields; the crops recover. */}
      <Scene t0={c16} t1={c17} set={{ ...BIG }} anims={{ crop: [[c16 + 0.5, 0], [c17 - 0.3, 1]], ang: [[c16, 0.5], [c17, 0.3]], dist: [[c16, 22], [c17, 20]], h: [[c16, 9], [c17, 8]], tx: [[c16, -14], [c17, -12]], ty: [[c16, 1], [c17, 1]], tz: [[c16, -10], [c17, -10]] }}>
        <Card s={c16} t0={K("lift")} t1={c17} title="200,000 LITRES" sub="EVERY HOUR" />
      </Scene>
      <Scene t0={c17} t1={DUR} set={{ ...BIG, crop: 1 }} anims={{ ang: [[c17, 0.25], [DUR, -0.3]], dist: [[c17, 29], [DUR, 33]], h: [[c17, 7], [DUR, 9]], tx: [[c17, -5], [DUR, -5]], ty: [[c17, 7], [DUR, 7]], tz: [[c17, -4], [DUR, -4]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
