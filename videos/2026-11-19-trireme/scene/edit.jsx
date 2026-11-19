// edit.jsx: Greek trireme timeline (from kit/template).
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 68.4;

const def = { site: 0, work: 0, keel: 0, planks: 0, rope: 0, deck: 0, sag: 0, o1: 0, o2: 0, o3: 0, ram: 0, row: 0, rowspd: 0.5, go: 0, enemy: 0, hit: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("but you have"), c2 = C("so you build a ship"), c3 = C("you lay"), c4 = C("then you fit"),
    c5 = C("but a hull"), c6 = C("so you stretch"), c7 = C("now it needs"), c8 = C("but one row"),
    c9 = C("so you stack"), c10 = C("62 on top"), c11 = C("170 people"), c12 = C("this is a tri"),
    c13 = C("but how does"), c14 = C("so you cast"), c15 = C("this is a ram"), c16 = C("now you row"),
    c17 = C("about 2500"), c18 = C("and in 1987"), c19 = C("congratulations");
  const Y = { site: 2, ground: 3 };
  const HULL = { ...Y, keel: 1, planks: 1, rope: 1, deck: 1 };
  const ALL = { ...HULL, o1: 1, o2: 1, o3: 1 };
  const SEA = { site: 3, row: 1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={c1} set={{ site: 0, ty: 2, tz: 0, lens: 1.3 }} anims={{ tx: [[0, 0], [c1, -6]], ang: [[0, 1.3], [c1, 1.48]], dist: [[0, 78], [c1, 66]], h: [[0, 14], [c1, 9]] }} />
      <Scene t0={c1} t1={c2} set={{ site: 1, ground: 3, tx: 0, ty: 1, tz: 2.8 }} anims={{ work: [[c1 + 0.5, 0], [c1 + 1.2, 1]], ang: [[c1, 0.35], [c2, -0.05]], dist: [[c1, 10], [c2, 7.5]], h: [[c1, 2.5], [c2, 1.6]] }} />
      <Scene t0={c2} t1={c3} set={{ site: 1, ground: 3, work: 1, tx: 0, ty: 0.4, tz: -1 }} anims={{ ang: [[c2, 0.9], [c3, 0.45]], dist: [[c2, 15], [c3, 11]], h: [[c2, 5], [c3, 3.5]] }} />
      <Scene t0={c3} t1={c4} set={{ ...Y, ty: 1 }} anims={{ keel: [[c3 + 0.3, 0], [c4 - 0.4, 1]], ang: [[c3, 0.55], [c4, 0.2]], dist: [[c3, 21], [c4, 18]], h: [[c3, 5], [c4, 4]] }}>
        <Card s={c3} t0={K("37")} t1={c4} title="37 M" sub="SHIP LENGTH" />
      </Scene>
      <Scene t0={c4} t1={c5} set={{ ...Y, keel: 1, ty: 1.2 }} anims={{ planks: [[c4 + 0.3, 0], [c5 - 0.3, 1]], ang: [[c4, -0.45], [c5, -0.15]], dist: [[c4, 17], [c5, 15]], h: [[c4, 3.5], [c5, 3]] }} />
      <Scene t0={c5} t1={c6} set={{ ...Y, keel: 1, planks: 1, ty: 0.8 }} anims={{ sag: [[K("bends") - 0.2, 0], [K("waves") + 0.3, 1]], ang: [[c5, 0.12], [c6, 0.04]], dist: [[c5, 27], [c6, 24]], h: [[c5, 3], [c6, 2.2]] }} />
      <Scene t0={c6} t1={c7} set={{ ...Y, keel: 1, planks: 1, ty: 1.2 }} anims={{ rope: [[K("ropes"), 0], [K("stern") + 0.3, 1]], sag: [[c6, 1], [K("twist"), 1], [c7 - 0.2, 0]], ang: [[c6, 0.6], [c7, 0.35]], dist: [[c6, 12], [c7, 11]], h: [[c6, 4.2], [c7, 3.5]] }} />
      <Scene t0={c7} t1={c8} set={{ ...HULL, deck: 0, ty: 1.2 }} anims={{ deck: [[c7 + 0.1, 0], [c8 - 0.05, 1]], ang: [[c7, -0.6], [c8, -0.45]], dist: [[c7, 18], [c8, 16]], h: [[c7, 5], [c8, 4]] }} />
      <Scene t0={c8} t1={c9} set={{ ...HULL, ty: 1 }} anims={{ o2: [[c8 + 0.2, 0], [K("enough"), 1]], ang: [[c8, 0.35], [c9, 0.2]], dist: [[c8, 16], [c9, 14]], h: [[c8, 2.5], [c9, 2]] }} />
      <Scene t0={c9} t1={c10} set={{ ...HULL, o2: 1, tx: 3, ty: 1 }} anims={{ o3: [[K("stack"), 0], [K("rowers"), 1]], o1: [[K("rowers"), 0], [c10 - 0.1, 1]], ang: [[c9, 0.18], [c10, 0.32]], dist: [[c9, 9.5], [c10, 8]], h: [[c9, 0.8], [c10, 1.0]] }} />
      <Scene t0={c10} t1={c11} set={{ ...ALL, tx: 1 }} anims={{ ty: [[c10, 1.5], [c11, 0.6]], h: [[c10, 2.5], [c11, 0.4]], ang: [[c10, -0.3], [c11, -0.15]], dist: [[c10, 14], [c11, 12.5]], lens: [[c10, 1.4], [c11, 1.4]] }}>
        <Card s={c10} t0={K("62")} t1={c11} title="62 / 54 / 54" sub="TOP / MIDDLE / BOTTOM" />
      </Scene>
      <Scene t0={c11} t1={c12} set={{ ...ALL, rowspd: 0.55, ty: 1 }} anims={{ row: [[c11, 0], [c11 + 0.6, 1]], ang: [[c11, -0.55], [c12, -0.25]], dist: [[c11, 24], [c12, 21]], h: [[c11, 6], [c12, 4.5]] }}>
        <Card s={c11} t0={K("170")} t1={c12} title="170" sub="ROWERS" />
      </Scene>
      <Scene t0={c12} t1={c13} set={{ ...SEA, ty: 1 }} anims={{ ang: [[c12, 0.75], [c13, 0.4]], dist: [[c12, 25], [c13, 21]], h: [[c12, 4], [c13, 3]] }}>
        <Label s={c12} t0={K("tri") + 0.2} t1={c13} text="TRIREME" />
      </Scene>
      <Scene t0={c13} t1={c14} set={{ ...SEA, enemy: 1, ty: 1, tz: 0 }} anims={{ tx: [[c13, 6], [c14, 9]], ang: [[c13, -1.25], [c14, -1.4]], dist: [[c13, 30], [c14, 26]], h: [[c13, 6], [c14, 4]] }} />
      <Scene t0={c14} t1={c15} set={{ ...SEA, tx: 10.5, ty: 0.4 }} anims={{ ram: [[K("bronze"), 0], [K("waterline"), 1]], ang: [[c14, 0.6], [c15, 0.85]], dist: [[c14, 8.5], [c15, 7]], h: [[c14, 1.8], [c15, 1.3]] }} />
      <Scene t0={c15} t1={c16} set={{ ...SEA, ram: 1, tx: 10.8, ty: 0.3 }} anims={{ ang: [[c15, 1.2], [c16, 0.9]], dist: [[c15, 6.5], [c16, 6]], h: [[c15, 0.9], [c16, 1.1]] }}>
        <Label s={c15} t0={K("ram")} t1={c16} text="RAM" />
      </Scene>
      <Scene t0={c16} t1={c17} set={{ ...SEA, ram: 1, enemy: 1, rowspd: 0.8, ty: 1 }} anims={{ go: [[c16 + 0.3, 0], [K("punch") + 0.3, 2.5]], hit: [[K("punch") + 0.3, 0], [K("hull") + 0.4, 1]], tx: [[c16, 9], [c17, 12]], ang: [[c16, 0.55], [c17, 0.35]], dist: [[c16, 30], [c17, 26]], h: [[c16, 13], [c17, 10]] }} />
      <Scene t0={c17} t1={c18} set={{ site: 4, row: 1, ty: 0 }} anims={{ ang: [[c17, 0.45], [c18, 0.15]], dist: [[c17, 110], [c18, 95]], h: [[c17, 40], [c18, 32]], lens: [[c17, 1.0], [c18, 1.0]] }}>
        <Card s={c17} t0={K("salamis")} t1={c18} title="480 BC" sub="BATTLE OF SALAMIS" />
      </Scene>
      <Scene t0={c18} t1={c19} set={{ ...SEA, ram: 1, rowspd: 0.9, ty: 1 }} anims={{ go: [[c18, 0], [c19, 7]], tx: [[c18, 0], [c19, 5]], ang: [[c18, 0.95], [c19, 0.6]], dist: [[c18, 19], [c19, 17]], h: [[c18, 3], [c19, 2.5]] }}>
        <Card s={c18} t0={K("1987")} t1={c19} title="9 KNOTS" sub="OLYMPIAS, 1987" />
      </Scene>
      <Scene t0={c19} t1={DUR} set={{ ...SEA, ram: 1, ty: 1 }} anims={{ ang: [[c19, -0.5], [DUR, 0.3]], dist: [[c19, 22], [DUR, 33]], h: [[c19, 4], [DUR, 9]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
