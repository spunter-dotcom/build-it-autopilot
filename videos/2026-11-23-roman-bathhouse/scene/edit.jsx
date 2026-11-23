// edit.jsx: Roman bathhouse timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 71;

const def = { site: 0, work: 0, hall: 0, cpool: 0, fire: 0, smoke: 0, furn: 0, pilae: 0, heat: 0, layers: 0, tubes: 0, hpool: 0, bench: 0, tank: 0, roof: 0, cut: 1, px: 7.5, py: 0, pz: 1.8 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("your town wants"), c2 = C("so you build a long"), k1 = C("this is a frigidarium"), c3 = C("but in winter"),
    c4 = C("so you light"), c5 = C("but the room fills"), c6 = C("so you build a furnace"), c7 = C("but how does"),
    c8 = C("so you lift"), k2 = C("this is a hypocaust"), c9 = C("now hot air"), c10 = C("on top you"),
    c11 = C("but the walls"), c12 = C("hot air rises"), c13 = C("but the room by"), c14 = C("so you put"),
    k3 = C("this is a caldarium"), c15 = C("over the furnace"), c16 = C("in the biggest"), c17 = C("congratulations");
  const G = { ground: 5 };
  const HALL = { ...G, hall: 1, cpool: 1 };
  const FURN = { ...HALL, furn: 1, work: 1 };
  const HYPO = { ...FURN, pilae: 1 };
  const FLOOR = { ...HYPO, heat: 1, layers: 1 };
  const WALLS = { ...FLOOR, tubes: 1 };
  const ROOMS = { ...WALLS, hpool: 1, bench: 1 };
  const DONE = { ...ROOMS, tank: 1, roof: 1, cut: 0, px: 7.0, pz: 5.0 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* Hook: the finished bathhouse in the snow, smoke stacks on the roof. */}
      <Scene t0={0} t1={c1} set={{ ...DONE }} anims={{ ang: [[0, 0.9], [c1, 0.6]], dist: [[0, 30], [c1, 25]], h: [[0, 8], [c1, 6]], ty: [[0, 2.5], [c1, 2.5]], tx: [[0, -1], [c1, -1]] }} />
      {/* An empty snowy plot, one shivering townsperson. */}
      <Scene t0={c1} t1={c2} set={{ ...G }} anims={{ ang: [[c1, 0.5], [c2, 0.25]], dist: [[c1, 16], [c2, 13]], h: [[c1, 4], [c2, 3]], tx: [[c1, 4], [c2, 5]], ty: [[c1, 1], [c2, 1]] }} />
      {/* The hall rises, then the cold pool. */}
      <Scene t0={c2} t1={k1} set={{ ...G }} anims={{ hall: [[c2, 0], [c2 + 2.2, 1]], cpool: [[c2 + 2.2, 0], [k1 - 0.3, 1]], ang: [[c2, 0.7], [k1, 0.4]], dist: [[c2, 28], [k1, 24]], h: [[c2, 10], [k1, 8]], ty: [[c2, 1.5], [k1, 1.5]], tx: [[c2, 1], [k1, 2]] }} />
      <Scene t0={k1} t1={c3} set={{ ...HALL }} anims={{ ang: [[k1, 0.35], [c3, 0.0]], dist: [[k1, 9], [c3, 7.5]], h: [[k1, 3.5], [c3, 3]], tx: [[k1, 6], [c3, 6]], ty: [[k1, 0.6], [c3, 0.6]], tz: [[k1, -0.6], [c3, -0.6]] }}>
        <Label s={k1} t0={k1 + 0.1} t1={c3} text="FRIGIDARIUM" y={1500} />
      </Scene>
      {/* Too cold to get in. */}
      <Scene t0={c3} t1={c4} set={{ ...HALL }} anims={{ ang: [[c3, -0.3], [c4, -0.1]], dist: [[c3, 5.5], [c4, 4.5]], h: [[c3, 1.5], [c4, 1.2]], tx: [[c3, 7], [c4, 7.2]], ty: [[c3, 1], [c4, 1]], tz: [[c3, 1], [c4, 1.2]], lens: [[c3, 1.3], [c4, 1.3]] }} />
      {/* A fire on the floor, then smoke fills the room. */}
      <Scene t0={c4} t1={c5} set={{ ...HALL, px: 1.4, pz: 1.4 }} anims={{ fire: [[c4, 0], [c4 + 0.8, 1]], ang: [[c4, 0.3], [c5, 0.1]], dist: [[c4, 7], [c5, 6]], h: [[c4, 2], [c5, 1.8]], tx: [[c4, 0.5], [c5, 0.5]], ty: [[c4, 0.8], [c5, 0.8]] }} />
      <Scene t0={c5} t1={c6} set={{ ...HALL, fire: 1, px: 1.4, pz: 1.4 }} anims={{ smoke: [[c5, 0], [c6 - 0.2, 1]], ang: [[c5, 0.1], [c6, 0.35]], dist: [[c5, 9], [c6, 13]], h: [[c5, 2.5], [c6, 3.5]], ty: [[c5, 1.5], [c6, 2.2]] }} />
      {/* The furnace outside the end wall. */}
      <Scene t0={c6} t1={c7} set={{ ...HALL, work: 1 }} anims={{ furn: [[c6, 0], [c6 + 1.8, 1]], ang: [[c6, -0.9], [c7, -1.2]], dist: [[c6, 10], [c7, 8]], h: [[c6, 3], [c7, 2.5]], tx: [[c6, -10.5], [c7, -11]], ty: [[c6, 1], [c7, 1]], tz: [[c6, 0.5], [c7, 0.8]] }} />
      {/* The cold floor of the hot room. */}
      <Scene t0={c7} t1={c8} set={{ ...FURN }} anims={{ ang: [[c7, 0.5], [c8, 0.2]], dist: [[c7, 13], [c8, 11]], h: [[c7, 4], [c8, 3]], tx: [[c7, -6], [c8, -5]], ty: [[c7, 1], [c8, 1]] }} />
      {/* Lift the floor on stacks of tiles. */}
      <Scene t0={c8} t1={k2} set={{ ...FURN }} anims={{ pilae: [[c8, 0], [c8 + 2.8, 1]], ang: [[c8, 0.35], [k2, 0.15]], dist: [[c8, 10], [k2, 8.5]], h: [[c8, 1.5], [k2, 1.0]], tx: [[c8, -4], [k2, -4]], ty: [[c8, 0.6], [k2, 0.6]] }} />
      <Scene t0={k2} t1={c9} set={{ ...HYPO }} anims={{ ang: [[k2, 0.15], [c9, 0.4]], dist: [[k2, 7.5], [c9, 6.5]], h: [[k2, 0.6], [c9, 0.5]], tx: [[k2, -5], [c9, -5.5]], ty: [[k2, 0.6], [c9, 0.6]], tz: [[k2, 1.0], [c9, 1.0]] }}>
        <Label s={k2} t0={k2 + 0.1} t1={c9} text="HYPOCAUST" y={1500} />
      </Scene>
      {/* Hot air flows between the stacks. */}
      <Scene t0={c9} t1={c10} set={{ ...HYPO }} anims={{ heat: [[c9, 0], [c10 - 0.3, 1]], ang: [[c9, -0.25], [c10, 0.05]], dist: [[c9, 8], [c10, 7]], h: [[c9, 0.3], [c10, 0.3]], tx: [[c9, -5], [c10, -3]], ty: [[c9, 0.5], [c10, 0.5]], tz: [[c9, 1], [c10, 1]] }} />
      {/* Concrete and big square tiles on top. */}
      <Scene t0={c10} t1={c11} set={{ ...HYPO, heat: 1 }} anims={{ layers: [[C("then concrete"), 0], [C("then big") + 0.9, 1]], ang: [[c10, 0.5], [c11, 0.25]], dist: [[c10, 11], [c11, 9]], h: [[c10, 4], [c11, 3.5]], tx: [[c10, -3], [c11, -3.5]], ty: [[c10, 1], [c11, 1]] }}>
        <Card s={c10} t0={C("then big")} t1={c11} title="60 CM TILES" sub="TWO ROMAN FEET ACROSS" />
      </Scene>
      {/* Hollow clay tubes up the walls. */}
      <Scene t0={c11} t1={c12} set={{ ...FLOOR }} anims={{ tubes: [[C("so you line"), 0], [c12 - 0.2, 1]], ang: [[c11, 0.25], [c12, -0.1]], dist: [[c11, 9], [c12, 8]], h: [[c11, 1.0], [c12, 1.2]], tx: [[c11, -5], [c12, -4.5]], ty: [[c11, 2.6], [c12, 2.6]], tz: [[c11, -2.5], [c12, -2.5]] }} />
      {/* Outside: chimneys on the roof. */}
      <Scene t0={c12} t1={c13} set={{ ...WALLS, roof: 1, cut: 0, px: 7.0, pz: 5.0 }} anims={{ ang: [[c12, 1.0], [c13, 0.75]], dist: [[c12, 20], [c13, 18]], h: [[c12, 7], [c13, 6]], tx: [[c12, -3], [c13, -3]], ty: [[c12, 4], [c13, 4]] }} />
      {/* The room by the fire. */}
      <Scene t0={c13} t1={c14} set={{ ...WALLS }} anims={{ ang: [[c13, 0.6], [c14, 0.4]], dist: [[c13, 14], [c14, 12]], h: [[c13, 5], [c14, 4.5]], tx: [[c13, -7], [c14, -6.5]], ty: [[c13, 1.5], [c14, 1.5]] }} />
      {/* Hot pool there, warm room beside it, cold room furthest away. */}
      <Scene t0={c14} t1={k3} set={{ ...WALLS }} anims={{ hpool: [[c14, 0], [c14 + 1.2, 1]], bench: [[C("a warm room"), 0], [C("a warm room") + 1.0, 1]], ang: [[c14, 0.35], [k3, 0.2]], dist: [[c14, 26], [k3, 27]], h: [[c14, 12], [k3, 11]], tx: [[c14, -1], [k3, 0]], ty: [[c14, 1], [k3, 1]] }} />
      <Scene t0={k3} t1={c15} set={{ ...ROOMS, px: -3.8, py: 1.2, pz: 1.2 }} anims={{ ang: [[k3, 0.4], [c15, 0.15]], dist: [[k3, 8], [c15, 6.5]], h: [[k3, 3], [c15, 2.6]], tx: [[k3, -6], [c15, -6]], ty: [[k3, 1.8], [c15, 1.8]], tz: [[k3, -0.5], [c15, -0.5]] }}>
        <Label s={k3} t0={k3 + 0.1} t1={c15} text="CALDARIUM" y={1500} />
      </Scene>
      {/* Bronze tank on the furnace. */}
      <Scene t0={c15} t1={c16} set={{ ...ROOMS }} anims={{ tank: [[c15 + 0.6, 0], [c15 + 1.8, 1]], ang: [[c15, -0.7], [c16, -1.0]], dist: [[c15, 8], [c16, 7]], h: [[c15, 2.5], [c16, 2.2]], tx: [[c15, -10.3], [c16, -10.3]], ty: [[c15, 2.2], [c16, 2.2]] }} />
      {/* The biggest baths in Rome. */}
      <Scene t0={c16} t1={c17} set={{ ...DONE }} anims={{ ang: [[c16, -0.8], [c17, -0.4]], dist: [[c16, 24], [c17, 22]], h: [[c16, 6], [c17, 5]], tx: [[c16, -2], [c17, -2]], ty: [[c16, 2.5], [c17, 2.5]] }}>
        <Card s={c16} t0={c16 + 0.3} t1={K("10")} title="50 FURNACES" sub="BATHS OF CARACALLA, ROME" />
        <Card s={c16} t0={K("10")} t1={c17} title="10 TONS OF WOOD" sub="EVERY DAY" />
      </Scene>
      <Scene t0={c17} t1={DUR} set={{ ...DONE }} anims={{ ang: [[c17, 0.4], [DUR, 0.9]], dist: [[c17, 22], [DUR, 27]], h: [[c17, 5], [DUR, 8]], tx: [[c17, -1], [DUR, -1]], ty: [[c17, 2.5], [DUR, 2.5]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
