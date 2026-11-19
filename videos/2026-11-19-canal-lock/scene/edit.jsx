// edit.jsx: canal lock timeline (from kit/template).
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 68;

const def = { site: 0, bx: -8, tilt: 0, spill: 0, crack: 0, work: 0, work2: 0, level: 0, walls: 0, gates: 0, uo: 0, lo: 0, mitre: 0, mopen: 0, pad: 0, crank: 0, pour: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("your barges"), c2 = C("but the land"), c3 = C("so you build a ramp"), c4 = C("but hulls"),
    c5 = C("so you build two"), c6 = C("between them"), c7 = C("this is a lock"), c8 = C("a boat floats"),
    c9 = C("then you lift"), c10 = C("water pours"), c11 = C("when the levels"), c12 = C("to go down"),
    c13 = C("but a gate"), c14 = C("so you hang"), c15 = C("the water pushes"), c16 = C("this is a miter"),
    c17 = C("leonardo"), c18 = C("then you add"), c19 = C("a chinese"), c20 = C("gates like"), c21 = C("congratulations");
  const LOCK = { site: 1, walls: 1, gates: 1, ground: 1 };
  const MITRE = { ...LOCK, mitre: 1, bx: 30 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={c1} set={{ site: 0, tx: -1, ty: -0.5 }} anims={{ bx: [[0, -6], [c1, -5]], ang: [[0, 0.6], [c1, 0.4]], dist: [[0, 12], [c1, 10]], h: [[0, 15], [c1, 13]] }} />
      <Scene t0={c1} t1={c2} set={{ site: 0, tx: -8.5, ty: -1 }} anims={{ bx: [[c1, -11], [c2, -7]], ang: [[c1, 0.9], [c2, 0.5]], dist: [[c1, 7], [c2, 6]], h: [[c1, 2], [c2, 1.5]] }} />
      <Scene t0={c2} t1={c3} set={{ site: 0, bx: -6, ty: -0.8 }} anims={{ ang: [[c2, 0.15], [c3, 0.05]], dist: [[c2, 13], [c3, 11]], h: [[c2, 0.8], [c3, 1.2]] }} />
      <Scene t0={c3} t1={c4} set={{ site: 0, work: 1, ty: -0.5 }} anims={{ bx: [[K("haul"), -5], [c4, 0.5]], ang: [[c3, 0.5], [c4, 0.8]], dist: [[c3, 12], [c4, 10]], h: [[c3, 3], [c4, 4]] }} />
      <Scene t0={c4} t1={c5} set={{ site: 0, work: 1, tx: 1.5, ty: -0.2 }} anims={{ bx: [[c4, 0.5], [c5, 1.5]], tilt: [[c4, 0], [K("crack") + 0.3, -0.25]], crack: [[K("crack"), 0], [K("crack") + 0.3, 1]], spill: [[K("spills"), 0], [K("spills") + 0.8, 1]], ang: [[c4, -0.4], [c5, -0.6]], dist: [[c4, 8], [c5, 7]], h: [[c4, 2], [c5, 1.6]] }} />
      <Scene t0={c5} t1={c6} set={{ site: 1, ground: 1, lo: 1, bx: -10, ty: -1 }} anims={{ gates: [[K("two gates") - 0.1, 0], [K("two gates") + 0.9, 1]], ang: [[c5, 0.6], [c6, 0.3]], dist: [[c5, 14], [c6, 12]], h: [[c5, 10], [c6, 9]] }} />
      <Scene t0={c6} t1={c7} set={{ site: 1, ground: 1, gates: 1, lo: 1, bx: -10, ty: -1 }} anims={{ walls: [[c6 + 0.2, 0], [K("chamber") + 0.3, 1]], ang: [[c6, -0.5], [c7, -0.25]], dist: [[c6, 11], [c7, 10]], h: [[c6, 10], [c7, 9]] }} />
      <Scene t0={c7} t1={c8} set={{ ...LOCK, lo: 1, bx: -10, ty: -1 }} anims={{ ang: [[c7, 0.25], [c8, 0.15]], dist: [[c7, 6], [c8, 5]], h: [[c7, 14], [c8, 12.5]] }}>
        <Label s={c7} t0={K("lock")} t1={c8} text="LOCK" />
      </Scene>
      <Scene t0={c8} t1={c9} set={{ ...LOCK, tx: -3, ty: -1 }} anims={{ bx: [[c8, -10], [K("shut") - 0.1, 0]], lo: [[K("shut"), 1], [c9 - 0.15, 0]], ang: [[c8, 0.9], [c9, 0.7]], dist: [[c8, 14], [c9, 12]], h: [[c8, 5], [c9, 4]] }} />
      <Scene t0={c9} t1={c10} set={{ ...LOCK, bx: 0, work: 1, tx: 4, ty: 0 }} anims={{ uo: [[K("lift"), 0], [K("top"), 0.3]], ang: [[c9, -0.7], [c10, -0.9]], dist: [[c9, 7], [c10, 6]], h: [[c9, 1.5], [c10, 2]] }} />
      <Scene t0={c10} t1={c11} set={{ ...LOCK, bx: 0, uo: 0.3, ty: -1 }} anims={{ pour: [[c10, 0], [c10 + 0.4, 1], [c11 - 0.4, 1], [c11 - 0.1, 0]], level: [[c10 + 0.2, 0], [c11 - 0.1, 1]], ang: [[c10, 0.6], [c11, 0.45]], dist: [[c10, 9], [c11, 8]], h: [[c10, 5], [c11, 5.5]] }} />
      <Scene t0={c11} t1={c12} set={{ ...LOCK, level: 1, tx: 3, ty: 0 }} anims={{ uo: [[K("open"), 0.3], [K("sail"), 1]], bx: [[K("sail") - 0.3, 0], [c12, 10]], ang: [[c11, 0.9], [c12, 1.2]], dist: [[c11, 13], [c12, 14]], h: [[c11, 4], [c12, 4.5]] }} />
      <Scene t0={c12} t1={c13} set={{ ...LOCK, bx: 30, tx: -1, ty: -1 }} anims={{ uo: [[c12, 1], [c12 + 0.6, 0]], lo: [[K("let"), 0], [K("let") + 0.4, 0.3]], level: [[K("let"), 1], [c13 - 0.1, 0]], ang: [[c12, -0.3], [c13, -0.1]], dist: [[c12, 14], [c13, 12]], h: [[c12, 6], [c13, 5]] }} />
      <Scene t0={c13} t1={c14} set={{ ...LOCK, bx: 30, work2: 1, tx: -4, ty: 0.5 }} anims={{ lo: [[c13, 0.3], [c14, 1]], ang: [[c13, 2.6], [c14, 2.85]], dist: [[c13, 7.5], [c14, 6.5]], h: [[c13, 1], [c14, 1.5]] }} />
      <Scene t0={c14} t1={c15} set={{ ...MITRE, mopen: 0.5, tx: -4, ty: -1 }} anims={{ mitre: [[K("hang"), 0], [K("meet"), 1]], ang: [[c14, 0.3], [c15, 0.1]], dist: [[c14, 4], [c15, 3.5]], h: [[c14, 9], [c15, 8]] }} />
      <Scene t0={c15} t1={c16} set={{ ...MITRE, tx: -4, ty: -0.8 }} anims={{ mopen: [[c15, 0.5], [K("shut", 1), 0]], level: [[K("shut", 1), 0], [c16, 0.6]], ang: [[c15, 1.7], [c16, 1.5]], dist: [[c15, 7], [c16, 6]], h: [[c15, 5], [c16, 4.5]] }} />
      <Scene t0={c16} t1={c17} set={{ ...MITRE, level: 0.6, tx: -4, ty: -0.3, lens: 1.2 }} anims={{ ang: [[c16, 1.2], [c17, 1.0]], dist: [[c16, 6], [c17, 5]], h: [[c16, 1.5], [c17, 1.8]] }}>
        <Label s={c16} t0={K("miter")} t1={c17} text="MITRE GATE" />
      </Scene>
      <Scene t0={c17} t1={c18} set={{ ...MITRE, level: 0.6, tx: -4, ty: -0.5 }} anims={{ ang: [[c17, -1.2], [c18, -1.5]], dist: [[c17, 9], [c18, 8]], h: [[c17, 3], [c18, 3.2]] }}>
        <Card s={c17} t0={K("leonardo") + 0.2} t1={c18} title="LATE 1400s" sub="MILAN, ITALY" />
      </Scene>
      <Scene t0={c18} t1={c19} set={{ ...MITRE, level: 0.6, tx: -3.2, ty: 0.4 }} anims={{ pad: [[K("paddles"), 0], [K("paddles") + 0.8, 1]], crank: [[K("crank") - 0.2, 0], [c19, 1]], ang: [[c18, 1.0], [c19, 0.8]], dist: [[c18, 4], [c19, 3.5]], h: [[c18, 1.2], [c19, 1.3]] }} />
      <Scene t0={c19} t1={c20} set={{ ...MITRE, pad: 1, crank: 1, bx: -10, ty: 0 }} anims={{ ang: [[c19, 0.8], [c20, 0.5]], dist: [[c19, 14], [c20, 12]], h: [[c19, 17], [c20, 15]] }}>
        <Card s={c19} t0={K("chinese") + 0.2} t1={c20} title="984 AD" sub="QIAO WEIYUE, SONG CHINA" />
      </Scene>
      <Scene t0={c20} t1={c21} set={{ ...MITRE, pad: 1, crank: 1, mopen: 1, tx: -4, ty: -0.5 }} anims={{ bx: [[c20, 0], [c21, -8]], ang: [[c20, -0.5], [c21, -0.3]], dist: [[c20, 12], [c21, 11]], h: [[c20, 3], [c21, 3]] }} />
      <Scene t0={c21} t1={DUR} set={{ ...MITRE, pad: 1, crank: 1, mopen: 1, ty: 0 }} anims={{ bx: [[c21, -8], [DUR, -12]], ang: [[c21, 0.4], [DUR, -0.2]], dist: [[c21, 12], [DUR, 16]], h: [[c21, 10], [DUR, 15]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
