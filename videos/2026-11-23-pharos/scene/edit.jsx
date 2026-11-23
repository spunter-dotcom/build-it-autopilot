// edit.jsx: Lighthouse of Alexandria (Pharos) timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 73;

const def = { ship: 0, shipx: 0, wreck: 0, bfire: 0, cw: 0, t1: 0, t2: 0, t3: 0, cut: 0, men: 0, lan: 0, fire: 0, mir: 0, zeus: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("you rule"), c2 = C("but the coast"), c3 = C("so you light"), c4 = C("but far out"),
    c5 = C("so you raise"), c6 = C("you join"), k1 = C("this is the heptastadion"), c7 = C("there you stack"),
    c8 = C("but you need"), c9 = C("but fuel"), c10 = C("so you build a ramp"), c11 = C("wide enough"),
    c12 = C("at the top"), c13 = C("and later"), c14 = C("on the roof"), k2 = C("this is the pharos"),
    c15 = C("it rises"), c16 = C("even today"), c17 = C("congratulations");
  const G = { ground: 3 };
  const T1 = { ...G, cw: 1, t1: 1 };
  const T3 = { ...T1, t2: 1, t3: 1 };
  const TOP = { ...T3, lan: 1, fire: 1 };
  const ALL = { ...TOP, mir: 1, zeus: 1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* A ship at sea in the dark. */}
      <Scene t0={0} t1={c1} set={{ ...G, ship: 1, night: 0.7 }} anims={{ shipx: [[0, -9], [c1, -5]], ang: [[0, 0.7], [c1, 0.45]], dist: [[0, 10], [c1, 9]], h: [[0, 1.5], [c1, 1.8]], tx: [[0, -8], [c1, -5]], ty: [[0, 1.6], [c1, 1.6]], tz: [[0, 17.5], [c1, 17.5]], lens: [[0, 1.2], [c1, 1.2]] }} />
      {/* Alexandria on the shore. */}
      <Scene t0={c1} t1={c2} set={{ ...G }} anims={{ ang: [[c1, 1.35], [c2, 1.1]], dist: [[c1, 24], [c2, 21]], h: [[c1, 7], [c2, 6]], tx: [[c1, -41], [c2, -41]], ty: [[c1, 2], [c2, 2]], tz: [[c1, 0], [c2, 0]] }}>
        <Card s={c1} t0={K("alexandria")} t1={c2} title="ALEXANDRIA" sub="EGYPT" />
      </Scene>
      {/* Flat coast, hidden shoals: the ship hits the rocks. */}
      <Scene t0={c2} t1={c3} set={{ ...G, ship: 1, night: 0.5 }} anims={{ shipx: [[c2, 1], [K("wreck"), 6.5]], wreck: [[K("wreck"), 0], [K("wreck") + 0.8, 1]], ang: [[c2, 0.25], [c3, 0.45]], dist: [[c2, 13], [c3, 11]], h: [[c2, 2.5], [c3, 2.2]], tx: [[c2, 5], [c3, 7]], ty: [[c2, 1], [c3, 1]], tz: [[c2, 17.5], [c3, 17.5]], lens: [[c2, 1.1], [c3, 1.1]] }} />
      {/* A fire on the beach. */}
      <Scene t0={c3} t1={c4} set={{ ...G, night: 0.7 }} anims={{ bfire: [[c3 + 0.4, 0], [K("fire") + 0.3, 1]], ang: [[c3, 1.0], [c4, 0.75]], dist: [[c3, 5], [c4, 4.5]], h: [[c3, 1.2], [c4, 1.0]], tx: [[c3, -34.8], [c4, -34.8]], ty: [[c3, 1.2], [c4, 1.2]], tz: [[c3, 8], [c4, 8]], lens: [[c3, 1.3], [c4, 1.3]] }} />
      {/* From far out at sea the fire is too low to see. */}
      <Scene t0={c4} t1={c5} set={{ ...G, night: 0.7, bfire: 1 }} anims={{ ang: [[c4, 1.25], [c5, 1.2]], dist: [[c4, 62], [c5, 56]], h: [[c4, 0.5], [c5, 0.5]], tx: [[c4, -34.8], [c5, -34.8]], ty: [[c4, 1], [c5, 1]], tz: [[c4, 8], [c5, 8]], lens: [[c4, 1.4], [c5, 1.4]] }} />
      {/* The island of Pharos offshore. */}
      <Scene t0={c5} t1={c6} set={{ ...G }} anims={{ ang: [[c5, 0.4], [c6, 0.65]], dist: [[c5, 32], [c6, 27]], h: [[c5, 11], [c6, 9]], tx: [[c5, -4], [c6, -6]], ty: [[c5, 1], [c6, 1]], tz: [[c5, 0], [c6, 0]] }}>
        <Card s={c5} t0={K("island")} t1={c6} title="PHAROS" sub="THE ISLAND" />
      </Scene>
      {/* The causeway grows from the city to the island. */}
      <Scene t0={c6} t1={k1} set={{ ...G }} anims={{ cw: [[K("stone"), 0], [K("long"), 1]], ang: [[c6, 0.9], [k1, 0.75]], dist: [[c6, 42], [k1, 38]], h: [[c6, 16], [k1, 14]], tx: [[c6, -15], [k1, -15]], ty: [[c6, 1], [k1, 1]], tz: [[c6, 0], [k1, 0]] }}>
        <Card s={c6} t0={K("kilometre")} t1={k1} title="1.2 KM" sub="STONE CAUSEWAY" />
      </Scene>
      <Scene t0={k1} t1={c7} set={{ ...G, cw: 1 }} anims={{ ang: [[k1, 0.45], [c7, 0.25]], dist: [[k1, 20], [c7, 18]], h: [[k1, 3.5], [c7, 3]], tx: [[k1, -22], [c7, -20]], ty: [[k1, 1], [c7, 1]], tz: [[k1, 0], [c7, 0]] }}>
        <Label s={k1} t0={k1 + 0.1} t1={c7} text="HEPTASTADION" y={1500} />
      </Scene>
      {/* A square tower of limestone and granite. */}
      <Scene t0={c7} t1={c8} set={{ ...G, cw: 1 }} anims={{ t1: [[K("stack"), 0], [K("tower"), 1]], ang: [[c7, 0.75], [c8, 0.5]], dist: [[c7, 30], [c8, 27]], h: [[c7, 4], [c8, 3]], ty: [[c7, 6], [c8, 6]] }}>
        <Card s={c7} t0={K("30")} t1={c8} title="30 M" sub="EACH SIDE" />
      </Scene>
      {/* An eight-sided tier, then a round one. */}
      <Scene t0={c8} t1={c9} set={{ ...T1 }} anims={{ t2: [[K("narrower"), 0], [K("tier"), 1]], t3: [[K("round"), 0], [K("top") + 0.3, 1]], ang: [[c8, 0.95], [c9, 0.6]], dist: [[c8, 44], [c9, 42]], h: [[c8, 4], [c9, 3]], ty: [[c8, 13], [c9, 13]] }} />
      {/* Fuel has to get to the top: looking up the tower. */}
      <Scene t0={c9} t1={c10} set={{ ...T3 }} anims={{ ang: [[c9, 0.35], [c10, 0.2]], dist: [[c9, 22], [c10, 20]], h: [[c9, -12], [c10, -13]], ty: [[c9, 16], [c10, 17]], lens: [[c9, 0.9], [c10, 0.9]] }} />
      {/* Cutaway: the ramp inside. */}
      <Scene t0={c10} t1={c11} set={{ ...T3, cut: 1 }} anims={{ ang: [[c10, 0.3], [c11, 0.1]], dist: [[c10, 20], [c11, 17]], h: [[c10, 2], [c11, 1]], ty: [[c10, 6], [c11, 6]], tz: [[c10, 1], [c11, 1]] }} />
      {/* Two horsemen side by side. */}
      <Scene t0={c11} t1={c12} set={{ ...T3, cut: 1 }} anims={{ men: [[K("two") - 0.3, 0], [K("two") - 0.2, 1]], ang: [[c11, 0.35], [c12, 0.15]], dist: [[c11, 7.5], [c12, 6.5]], h: [[c11, 0.8], [c12, 0.6]], ty: [[c11, 6.5], [c12, 6.5]], tz: [[c11, 2.1], [c12, 2.1]], lens: [[c11, 1.2], [c12, 1.2]] }} />
      {/* The furnace at the top; at night the fire burns. */}
      <Scene t0={c12} t1={c13} set={{ ...T3 }} anims={{ lan: [[K("build a furnace"), 0], [K("furnace") + 0.4, 1]], night: [[K("at night") - 0.2, 0], [K("fire", 2), 0.7]], fire: [[K("fire", 2), 0], [K("burns") + 0.3, 1]], ang: [[c12, 0.55], [c13, 0.3]], dist: [[c12, 10], [c13, 9]], h: [[c12, 1.5], [c13, 1]], ty: [[c12, 24.6], [c13, 24.6]], lens: [[c12, 1.2], [c13, 1.2]] }} />
      {/* A bronze mirror. */}
      <Scene t0={c13} t1={c14} set={{ ...TOP, night: 0.7 }} anims={{ mir: [[K("bronze"), 0], [K("mirror") + 0.4, 1]], ang: [[c13, 2.7], [c14, 2.9]], dist: [[c13, 8], [c14, 7]], h: [[c13, 1], [c14, 0.8]], ty: [[c13, 24.5], [c14, 24.5]], lens: [[c13, 1.2], [c14, 1.2]] }} />
      {/* A statue of Zeus on the roof. */}
      <Scene t0={c14} t1={k2} set={{ ...TOP, mir: 1, night: 0.7 }} anims={{ zeus: [[K("statue"), 0], [K("zeus") + 0.3, 1]], ang: [[c14, 0.4], [k2, 0.6]], dist: [[c14, 9], [k2, 8]], h: [[c14, 0.5], [k2, 0.3]], ty: [[c14, 26], [k2, 26]], lens: [[c14, 1.2], [k2, 1.2]] }} />
      <Scene t0={k2} t1={c15} set={{ ...ALL, night: 0.6 }} anims={{ ang: [[k2, 0.95], [c15, 0.7]], dist: [[k2, 46], [c15, 43]], h: [[k2, 3], [c15, 2]], ty: [[k2, 13.5], [c15, 13.5]] }}>
        <Label s={k2} t0={k2 + 0.1} t1={c15} text="PHAROS" y={1500} />
      </Scene>
      {/* Over a hundred metres. */}
      <Scene t0={c15} t1={c16} set={{ ...ALL, night: 0.4 }} anims={{ ang: [[c15, 0.15], [c16, 0.45]], dist: [[c15, 28], [c16, 26]], h: [[c15, -11], [c16, -11]], ty: [[c15, 14], [c16, 14]], lens: [[c15, 0.9], [c16, 0.9]] }}>
        <Card s={c15} t0={K("100")} t1={c16} title="100+ M" sub="TALL" />
      </Scene>
      {/* A ship passes safely; the name lives on. */}
      <Scene t0={c16} t1={c17} set={{ ...ALL, ship: 1, night: 0.6 }} anims={{ shipx: [[c16, -22], [c17, -14]], ang: [[c16, 0.7], [c17, 0.5]], dist: [[c16, 34], [c17, 31]], h: [[c16, 4], [c17, 4]], tx: [[c16, -6], [c17, -4]], ty: [[c16, 10], [c17, 10]], tz: [[c16, 6], [c17, 6]] }}>
        <Card s={c16} t0={K("french")} t1={c17} title="PHARE · FARO" sub="FRENCH · ITALIAN · SPANISH" />
      </Scene>
      <Scene t0={c17} t1={DUR} set={{ ...ALL, night: 0.6 }} anims={{ ang: [[c17, 0.4], [DUR, -0.3]], dist: [[c17, 50], [DUR, 54]], h: [[c17, 8], [DUR, 10]], tx: [[c17, -4], [DUR, -3]], ty: [[c17, 13], [DUR, 13]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
