// edit.jsx: Viking longship timeline (copied from kit/template).
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 67; // voice 65.5 s + 1.5 s

const def = { site: 0, work: 0, split: 0, planks0: 0, keel: 0, stem: 0, planks: 0, riv: 0, ribs: 0, rud: 0, oars: 0, mast: 0, sail: 0, row: 0, go: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("so you start"), c2 = C("then you raise"), c3 = C("but you have no"), c4 = C("so you lay"),
    c5 = C("you fix each"), c6 = C("16 planks"), c7 = C("but a shell"), c8 = C("but how do"),
    c9 = C("this is the starboard"), c10 = C("but the wind"), c11 = C("and when it"), c12 = C("some longships"),
    c13 = C("so you row"), c14 = C("congratulations");
  const Y = { site: 2, ground: 3 };                       // shipyard on the sand
  const H1 = { ...Y, keel: 1, stem: 1 };
  const H2 = { ...H1, planks: 1, riv: 1 };
  const H3 = { ...H2, ribs: 1, rud: 1 };
  const SEA = { site: 3, ground: 3 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* The need: a northern shore and open sea. */}
      <Scene t0={0} t1={c1} set={{ site: 0, ground: 0 }} anims={{ ang: [[0, 1.9], [c1, 1.35]], dist: [[0, 24], [c1, 17]], h: [[0, 4], [c1, 3]], tx: [[0, -12], [c1, -14]], ty: [[0, 1.5], [c1, 1.5]] }} />
      {/* Keel. */}
      <Scene t0={c1} t1={c2} set={{ ...Y }} anims={{ keel: [[c1 + 0.3, 0], [c1 + 2.8, 1]], ang: [[c1, 0.7], [c2, 0.35]], dist: [[c1, 19], [c2, 15]], h: [[c1, 6], [c2, 4.5]], ty: [[c1, 0.6], [c2, 0.6]] }}>
        <Label s={c1} t0={K("this is a keel") + 0.1} t1={c2} text="KEEL" y={1450} />
      </Scene>
      {/* Bow and stern posts. */}
      <Scene t0={c2} t1={c3} set={{ ...Y, keel: 1 }} anims={{ stem: [[c2 + 0.3, 0], [c2 + 2.6, 1]], ang: [[c2, -0.6], [c3, -0.95]], dist: [[c2, 15], [c3, 13]], h: [[c2, 2.5], [c3, 2]], tx: [[c2, -4], [c3, -6]], ty: [[c2, 2], [c3, 2.2]] }} />
      {/* No saw: split the oak. */}
      <Scene t0={c3} t1={c4} set={{ site: 1, ground: 0, work: 1 }} anims={{ split: [[K("so you split"), 0], [K("so you split") + 1.0, 1]], planks0: [[K("shape every"), 0], [c4 - 0.3, 1]], ang: [[c3, 0.35], [c4, -0.2]], dist: [[c3, 8], [c4, 6.5]], h: [[c3, 4.5], [c4, 4]], ty: [[c3, 0.5], [c4, 0.5]], tz: [[c3, 0], [c4, -0.5]] }} />
      {/* First strakes, overlapping. */}
      <Scene t0={c4} t1={c5} set={{ ...H1 }} anims={{ planks: [[c4 + 0.3, 0], [c5 - 0.3, 0.19]], ang: [[c4, 0.35], [c5, 0.1]], dist: [[c4, 9], [c5, 7]], h: [[c4, 1.2], [c5, 0.8]], tx: [[c4, 1], [c5, 3]], ty: [[c4, 0.5], [c5, 0.5]], tz: [[c4, 2], [c5, 2]] }} />
      {/* Rivets: clinker building. */}
      <Scene t0={c5} t1={c6} set={{ ...H1, lens: 1.3 }} anims={{ planks: [[c5, 0.19], [c5 + 1.2, 0.75]], riv: [[c5 + 0.6, 0], [c6 - 0.5, 1]], ang: [[c5, 0.3], [c6, 0.1]], dist: [[c5, 5], [c6, 4]], h: [[c5, 0.9], [c6, 0.6]], tx: [[c5, 3], [c6, 5]], ty: [[c5, 1.2], [c6, 1.3]], tz: [[c5, 2.4], [c6, 2.4]] }}>
        <Card s={c5} t0={K("about every")} t1={K("this is clinker")} title="ABOUT 15 CM" sub="BETWEEN RIVETS" />
        <Label s={c5} t0={K("this is clinker") + 0.1} t1={c6} text="CLINKER BUILDING" y={1450} />
      </Scene>
      {/* Sixteen strakes: the shell. */}
      <Scene t0={c6} t1={c7} set={{ ...H1, riv: 1 }} anims={{ planks: [[c6, 0.75], [c6 + 1.6, 1]], ang: [[c6, 0.85], [c7, 0.45]], dist: [[c6, 21], [c7, 17]], h: [[c6, 6], [c7, 5]], ty: [[c6, 1], [c7, 1]] }}>
        <Card s={c6} t0={c6 + 0.2} t1={c7} title="16" sub="PLANKS A SIDE" />
      </Scene>
      {/* Ribs inside the shell. */}
      <Scene t0={c7} t1={c8} set={{ ...H2 }} anims={{ ribs: [[K("so you fit"), 0], [c8 - 0.4, 1]], ang: [[c7, 0.25], [c8, 0.65]], dist: [[c7, 7], [c8, 9]], h: [[c7, 11], [c8, 10]], ty: [[c7, 0.8], [c8, 0.8]], tx: [[c7, 2], [c8, -1]] }} />
      {/* Steering board. */}
      <Scene t0={c8} t1={c9} set={{ ...H2, ribs: 1 }} anims={{ rud: [[K("so you hang"), 0], [K("so you hang") + 1.2, 1]], ang: [[c8, 0.55], [c9, 0.2]], dist: [[c8, 8], [c9, 6.5]], h: [[c8, 1.5], [c9, 1.2]], tx: [[c8, -8.5], [c8 + 0.01, -8.5]], ty: [[c8, 1.3], [c9, 1.3]], tz: [[c8, 1.2], [c9, 1.2]] }} />
      <Scene t0={c9} t1={c10} set={{ ...H3 }} anims={{ ang: [[c9, -0.75], [c10, -0.4]], dist: [[c9, 15], [c10, 13]], h: [[c9, 3.5], [c10, 3]], tx: [[c9, -6], [c10, -5]], ty: [[c9, 1.5], [c10, 1.5]] }}>
        <Label s={c9} t0={K("this is the starboard") + 0.1} t1={c10} text="STARBOARD" y={1450} />
      </Scene>
      {/* Oar holes and oars. */}
      <Scene t0={c10} t1={c11} set={{ ...H3 }} anims={{ oars: [[C("so you cut"), 0], [c11 - 0.4, 1]], ang: [[c10, 0.6], [c11, 1.0]], dist: [[c10, 21], [c11, 19]], h: [[c10, 7], [c11, 6]], ty: [[c10, 1], [c11, 1]] }}>
        <Card s={c10} t0={K("32")} t1={c11} title="32" sub="OARS" />
      </Scene>
      {/* At sea: mast and sail. */}
      <Scene t0={c11} t1={c12} set={{ ...SEA }} anims={{ mast: [[c11, 0], [c11 + 0.8, 1]], sail: [[c11 + 0.9, 0], [c12 - 0.6, 1]], ang: [[c11, 0.95], [c12, 0.55]], dist: [[c11, 26], [c12, 23]], h: [[c11, 4], [c12, 5]], ty: [[c11, 5], [c12, 5.5]] }}>
        <Card s={c11} t0={K("110")} t1={c12} title="ABOUT 110 SQ M" sub="OF SAIL" />
      </Scene>
      {/* Shallow draft. */}
      <Scene t0={c12} t1={c13} set={{ ...SEA, mast: 1, sail: 1, lens: 1.1 }} anims={{ go: [[c12, 0], [c13, 3]], ang: [[c12, 0.12], [c13, 0.3]], dist: [[c12, 17], [c13, 15]], h: [[c12, 0.4], [c13, 0.6]], tx: [[c12, 0], [c13, 3]], ty: [[c12, 1.5], [c13, 1.8]] }}>
        <Card s={c12} t0={K("three feet") - 0.2} t1={c13} title="ABOUT 3 FEET" sub="OF WATER" />
      </Scene>
      {/* Row up onto the beach. */}
      <Scene t0={c13} t1={c14} set={{ ...SEA, mast: 1, sail: 1, row: 1 }} anims={{ go: [[c13, 3], [c14, 19]], ang: [[c13, 0.9], [c14, 1.35]], dist: [[c13, 26], [c14, 24]], h: [[c13, 4], [c14, 4]], tx: [[c13, 3], [c14, 19]], ty: [[c13, 3], [c14, 3]] }} />
      {/* Hero. */}
      <Scene t0={c14} t1={DUR} set={{ ...SEA, mast: 1, sail: 1, go: 19 }} anims={{ ang: [[c14, -0.7], [DUR, 0.4]], dist: [[c14, 22], [DUR, 27]], h: [[c14, 4], [DUR, 6]], tx: [[c14, 19], [DUR, 19]], ty: [[c14, 3.5], [DUR, 3.5]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
