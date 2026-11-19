// edit.jsx: Roman road timeline (from kit/template).
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 72;

const def = { site: 0, end: 0, trench: 0, drain: 0, mud: 0, legion: 0, march: 0, ly: 0, line: 0, workers: 0, work: 0,
  rudus: 0, spread: 0, curb: 0, nuc: 0, camber: 0, flood: 0, pave: 0, path: 0, guard: 0, mile: 0,
  carts: 0, ca: 0, cb: 0, cax: 0, walk: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("but dirt"), c2 = C("so your surveyors"), c3 = C("then you dig"), c4 = C("you fill"),
    c5 = C("this is the rudus"), c6 = C("but loose"), c7 = C("so you set upright"), c8 = C("then you spread"),
    c9 = C("this is the nucleus"), c10 = C("but water"), c11 = C("so you shape"), c12 = C("then you lay"),
    c13 = C("you make it"), c14 = C("but carts keep"), c15 = C("so every few"), c16 = C("and every thousand"),
    c17 = C("this is a milestone"), c18 = C("each one"), c19 = C("in 312"), c20 = C("congratulations");
  // fixed state once each stage is done
  const TR = { trench: 1 };
  const RU = { ...TR, rudus: 1 };
  const CU = { ...RU, curb: 1 };
  const NU = { ...CU, nuc: 1 };
  const CA = { ...NU, camber: 1, drain: 1 };
  const PV = { ...CA, pave: 1, path: 1 };
  const DONE = { ...PV, guard: 1, mile: 1, end: 40 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={c1} set={{ ground: 1, mud: 0.5, legion: 1, tz: -5 }} anims={{ march: [[0, -2], [c1, 4]], ang: [[0, 0.55], [c1, 0.3]], dist: [[0, 16], [c1, 12]], h: [[0, 4], [c1, 3]] }} />
      <Scene t0={c1} t1={c2} set={{ ground: 1, legion: 1, tz: -3, ty: 0.5 }} anims={{ mud: [[c1, 0.6], [c2, 1]], march: [[c1, 4], [c2, 6]], ang: [[c1, -0.7], [c2, -0.5]], dist: [[c1, 7], [c2, 6]], h: [[c1, 1.2], [c2, 1.0]] }} />
      <Scene t0={c2} t1={c3} set={{ tz: -8 }} anims={{ line: [[c2 + 0.2, 0], [c3 - 0.2, 1]], ang: [[c2, 0.2], [c3, 0.1]], dist: [[c2, 20], [c3, 16]], h: [[c2, 6], [c3, 5]] }} />
      <Scene t0={c3} t1={c4} set={{ workers: 1, tz: -3, ty: -0.3 }} anims={{ trench: [[c3 + 0.1, 0], [c4 - 0.1, 1]], work: [[c3, 0], [c3 + 0.6, 1], [c3 + 1.2, 0], [c4, 1]], ang: [[c3, 0.75], [c4, 0.5]], dist: [[c3, 12], [c4, 10]], h: [[c3, 5], [c4, 4]] }} />
      <Scene t0={c4} t1={c5} set={{ ...TR, workers: 1, tz: -1, ty: -0.4 }} anims={{ rudus: [[c4 + 0.1, 0], [K("pounded"), 1]], work: [[K("pounded"), 0], [K("pounded") + 0.4, 1], [c5, 0]], ang: [[c4, 0.35], [c5, 0.15]], dist: [[c4, 9], [c5, 8]], h: [[c4, 3], [c5, 2.5]] }} />
      <Scene t0={c5} t1={c6} set={{ ...RU, tz: 0, ty: -0.5, lens: 1.0 }} anims={{ ang: [[c5, 0.05], [c6, 0.15]], dist: [[c5, 5.2], [c6, 4.6]], h: [[c5, 0.45], [c6, 0.3]] }}>
        <Label s={c5} t0={K("rudus")} t1={c6} text="RUDUS" y={520} />
      </Scene>
      <Scene t0={c6} t1={c7} set={{ ...RU, tz: -1, ty: -0.5 }} anims={{ spread: [[K("spreads"), 0], [c7 - 0.1, 1]], ang: [[c6, -0.4], [c7, -0.6]], dist: [[c6, 7.5], [c7, 7]], h: [[c6, 2.2], [c7, 2]] }} />
      <Scene t0={c7} t1={c8} set={{ ...RU, tz: -2, ty: -0.4 }} anims={{ spread: [[c7, 1], [K("upright") + 0.4, 0]], curb: [[K("curb"), 0], [K("lock"), 1]], ang: [[c7, 0.6], [c8, 0.4]], dist: [[c7, 9], [c8, 8]], h: [[c7, 3], [c8, 2.6]] }} />
      <Scene t0={c8} t1={c9} set={{ ...CU, tz: -1, ty: -0.3 }} anims={{ nuc: [[K("layer"), 0], [c9 - 0.2, 1]], ang: [[c8, -0.3], [c9, -0.1]], dist: [[c8, 8], [c9, 7]], h: [[c8, 2.5], [c9, 2.2]] }} />
      <Scene t0={c9} t1={c10} set={{ ...NU, tz: 0, ty: -0.45, lens: 1.0 }} anims={{ ang: [[c9, -0.15], [c10, -0.05]], dist: [[c9, 5.2], [c10, 4.6]], h: [[c9, 0.45], [c10, 0.3]] }}>
        <Label s={c9} t0={K("nucleus")} t1={c10} text="NUCLEUS" y={520} />
      </Scene>
      <Scene t0={c10} t1={c11} set={{ ...NU, night: 0.35, tz: -2, ty: -0.2 }} anims={{ flood: [[c10 + 0.2, 0], [c11 - 0.2, 1]], ang: [[c10, 0.8], [c11, 1.0]], dist: [[c10, 8.5], [c11, 7.5]], h: [[c10, 3], [c11, 2.6]] }} />
      <Scene t0={c11} t1={c12} set={{ ...NU, tz: -1, ty: -0.3 }} anims={{ night: [[c11, 0.35], [c12, 0]], camber: [[K("higher"), 0], [K("rain"), 1]], flood: [[K("rain"), 1], [K("drains"), 0]], drain: [[K("rain"), 0], [K("drains") + 0.4, 1]], ang: [[c11, 0.3], [c12, 0.1]], dist: [[c11, 12], [c12, 11]], h: [[c11, 3.2], [c12, 3]] }} />
      <Scene t0={c12} t1={c13} set={{ ...CA, tz: -10 }} anims={{ pave: [[c12 + 0.2, 0], [c13 - 0.2, 1]], ang: [[c12, 0.25], [c13, 0.15]], dist: [[c12, 16], [c13, 12]], h: [[c12, 4.5], [c13, 3.5]] }} />
      <Scene t0={c13} t1={c14} set={{ ...PV, carts: 1, walk: -30, tz: -9 }} anims={{ ca: [[c13, -2], [c14, -14]], cb: [[c13, -17], [c14, -5]], ang: [[c13, 0.05], [c14, -0.1]], dist: [[c13, 14], [c14, 12]], h: [[c13, 5], [c14, 4.5]] }}>
        <Card s={c13} t0={K("four meters")} t1={c14} title="4.2 M" sub="ROOM FOR TWO CARTS" />
      </Scene>
      <Scene t0={c14} t1={c15} set={{ ...PV, carts: 1, cb: -30, tz: -8, ty: 0.8 }} anims={{ ca: [[c14, -5], [c15, -8]], cax: [[c14 + 0.3, 0], [c15 - 0.2, 1.8]], walk: [[c14, -13], [c15, -10.5]], ang: [[c14, 1.25], [c15, 1.1]], dist: [[c14, 10], [c15, 9]], h: [[c14, 2.5], [c15, 2.2]] }} />
      <Scene t0={c15} t1={c16} set={{ ...PV, carts: 1, cb: -30, walk: -10.5, tz: -7, ty: 0.6 }} anims={{ guard: [[K("taller") - 0.3, 0], [K("curb", 1), 1]], cax: [[c15, 1.8], [K("taller"), 0]], ca: [[c15, -8], [c16, -9]], ang: [[c15, 0.9], [c16, 0.6]], dist: [[c15, 8], [c16, 7.5]], h: [[c15, 2], [c16, 1.8]] }} />
      <Scene t0={c16} t1={c17} set={{ ...DONE, tx: 2, tz: 2, ty: 0.8 }} anims={{ mile: [[K("plant") - 0.1, 0], [K("plant") + 0.6, 1]], ang: [[c16, 0.3], [c17, 0.75]], dist: [[c16, 13], [c17, 9]], h: [[c16, 3], [c17, 2]] }} />
      <Scene t0={c17} t1={c18} set={{ ...DONE, tx: 3.3, tz: 6, ty: 1.2, lens: 1.3 }} anims={{ ang: [[c17, 1.15], [c18, 0.85]], dist: [[c17, 4.8], [c18, 4.2]], h: [[c17, 0.5], [c18, 0.6]] }}>
        <Label s={c17} t0={K("milestone")} t1={c18} text="MILESTONE" y={420} />
      </Scene>
      <Scene t0={c18} t1={c19} set={{ ...DONE, tx: 2, tz: 4, ty: 1 }} anims={{ ang: [[c18, -0.3], [c19, 0.25]], dist: [[c18, 8], [c19, 7]], h: [[c18, 1.6], [c19, 1.4]] }} />
      <Scene t0={c19} t1={c20} set={{ ...DONE, legion: 1, ly: 0.1, tz: -2 }} anims={{ march: [[c19, -6], [c20, -1]], ang: [[c19, 0.35], [c20, 0.2]], dist: [[c19, 22], [c20, 18]], h: [[c19, 8], [c20, 7]] }}>
        <Card s={c19} t0={K("in 312")} t1={c20} title="312 BC" sub="VIA APPIA: ROME TO CAPUA" />
      </Scene>
      <Scene t0={c20} t1={DUR} set={{ ...DONE, legion: 1, ly: 0.1, tz: -4 }} anims={{ march: [[c20, -1], [DUR, 5]], ang: [[c20, -0.25], [DUR, -0.05]], dist: [[c20, 16], [DUR, 30]], h: [[c20, 5], [DUR, 11]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
