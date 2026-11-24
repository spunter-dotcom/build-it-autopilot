// edit.jsx: water clock (clepsydra) timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 75;

const def = { site: 0, bowl: 0, fill: 0, lvl: 1, hole: 0, drip: 0, marks: 0, cols: 0, slope: 0, cut: 0, work: 0, tool: 0, tank: 0, over: 0, jar: 0, flt: 0, ptr: 0, teeth: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("the sun is gone"), c2 = C("so you carve a stone"), c3 = C("you drill"), c4 = C("as it empties"), k1 = C("this is"),
    c5 = C("but as the water"), c6 = C("so you slope"), c7 = C("but egyptian"), c8 = C("so you carve"  , 1), c9 = C("a thousand"),
    c10 = C("you may speak"), c11 = C("but an emptying"), c12 = C("so in alexandria"), c13 = C("water flows in"), c14 = C("a big tank"),
    c15 = C("the steady stream"), c16 = C("you fix"), k2 = C("this is an inflow"), c17 = C("then you cut"), c18 = C("congratulations");
  const N = 0.35; // a moonlit temple
  const E = { site: 0, ground: 3, night: N };
  const B = { ...E, bowl: 1, fill: 1 };
  const BD = { ...B, hole: 1, drip: 1, cut: 1 };
  const A = { site: 1, ground: 2 };
  const X = { site: 2, ground: 2 };
  const XJ = { ...X, tank: 1, jar: 1, over: 1 };
  const close = (t0, t1, a0, a1, extra = {}) => ({ ang: [[t0, a0], [t1, a1]], lens: [[t0, 1.3], [t1, 1.3]], ...extra });
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* Hook: a temple at night, an empty stand. */}
      <Scene t0={0} t1={c1} set={{ ...E, night: 0.6 }} anims={{ ang: [[0, 0.35], [c1, 0.15]], dist: [[0, 16], [c1, 12]], h: [[0, 3.5], [c1, 2.5]], ty: [[0, 2.5], [c1, 2.2]], tz: [[0, -3], [c1, -3]] }}>
        <Card s={0} t0={0.4} t1={c1} title="ABOUT 1400 BC" sub="KARNAK, EGYPT" />
      </Scene>
      {/* No sun, no stars: look up the columns. */}
      <Scene t0={c1} t1={c2} set={{ ...E, night: 0.6 }} anims={{ ang: [[c1, -0.5], [c2, -0.2]], dist: [[c1, 6], [c2, 5]], h: [[c1, -0.6], [c2, -0.4]], ty: [[c1, 3.5], [c2, 4]], tz: [[c1, -6.5], [c2, -6.5]] }} />
      {/* The bowl arrives and fills. */}
      <Scene t0={c2} t1={c3} set={{ ...E, work: 1 }} anims={{ bowl: [[c2 + 0.3, 0], [c2 + 1.3, 1]], fill: [[K("fill"), 0.02], [c3 - 0.2, 1]], ang: [[c2, 0.3], [c3, 0.6]], dist: [[c2, 5.5], [c3, 4.2]], h: [[c2, 2.2], [c3, 1.8]], ty: [[c2, 1.2], [c3, 1.3]] }} />
      {/* A tiny hole, the drip starts. */}
      <Scene t0={c3} t1={c4} set={{ ...B }} anims={{ hole: [[K("hole"), 0], [K("hole") + 0.3, 1]], drip: [[K("starts"), 0], [K("drip"), 1]], ...close(c3, c4, 1.3, 1.0, { dist: [[c3, 2.8], [c4, 2.4]], h: [[c3, 0.2], [c4, 0.1]], tx: [[c3, 0.6], [c4, 0.6]], ty: [[c3, 0.8], [c4, 0.8]] }) }} />
      {/* It empties; a mark for each hour (cutaway). */}
      <Scene t0={c4} t1={k1} set={{ ...BD }} anims={{ lvl: [[c4, 0.95], [k1, 0.45]], marks: [[K("scratch"), 0], [k1 - 0.2, 0.55]], ...close(c4, k1, 0.6, 0.85, { dist: [[c4, 3.2], [k1, 2.8]], h: [[c4, 1.6], [k1, 1.3]], ty: [[c4, 1.3], [k1, 1.3]] }) }} />
      <Scene t0={k1} t1={c5} set={{ ...BD, marks: 0.55 }} anims={{ lvl: [[k1, 0.45], [c5, 0.4]], ang: [[k1, 0.4], [c5, 0.9]], dist: [[k1, 4.8], [c5, 4.4]], h: [[k1, 1.4], [c5, 1.2]], ty: [[k1, 1.2], [c5, 1.2]] }}>
        <Label s={k1} t0={K("this is") + 0.1} t1={c5} text="CLEPSYDRA" y={380} />
      </Scene>
      {/* Pressure drops, the drip slows. */}
      <Scene t0={c5} t1={c6} set={{ ...BD, marks: 0.55 }} anims={{ lvl: [[c5, 0.4], [c6, 0.25]], drip: [[c5, 1], [K("slows"), 0.15]], ...close(c5, c6, 1.0, 1.2, { dist: [[c5, 3.0], [c6, 2.6]], h: [[c5, 0.9], [c6, 0.6]], tx: [[c5, 0.4], [c6, 0.5]], ty: [[c5, 0.9], [c6, 0.9]] }) }} />
      {/* Sloped sides: wide top, narrow bottom. */}
      <Scene t0={c6} t1={c7} set={{ ...BD, marks: 0.55 }} anims={{ slope: [[K("slope") + 0.2, 0], [K("bottom", 1), 1]], lvl: [[c6, 1], [c7, 0.8]], ang: [[c6, 0.5], [c7, 0.95]], dist: [[c6, 4.2], [c7, 3.6]], h: [[c6, 1.0], [c7, 1.2]], ty: [[c6, 1.3], [c7, 1.3]] }} />
      {/* Hours stretch and shrink with the seasons: wide temple, day to night. */}
      <Scene t0={c7} t1={c8} set={{ ...BD, slope: 1, marks: 0.55 }} anims={{ night: [[c7, 0], [K("shrink"), 0], [c8, 0.6]], lvl: [[c7, 0.8], [c8, 0.65]], ang: [[c7, -0.3], [c8, 0.3]], dist: [[c7, 12], [c8, 10]], h: [[c7, 3], [c8, 2.5]], ty: [[c7, 2], [c8, 1.8]], tz: [[c7, -2], [c8, -2]] }} />
      {/* Twelve columns of marks, from above. */}
      <Scene t0={c8} t1={c9} set={{ ...BD, slope: 1, cols: 1 }} anims={{ marks: [[K("columns", 0), 0.1], [K("month") , 1]], lvl: [[c8, 0.4], [c9, 0.35]], ...close(c8, c9, 0.7, 1.1, { dist: [[c8, 2.2], [c9, 2.0]], h: [[c8, 2.2], [c9, 2.0]], ty: [[c8, 1.3], [c9, 1.3]] }) }} />
      {/* Athens: a court. */}
      <Scene t0={c9} t1={c10} set={{ ...A, lvl: 0.9 }} anims={{ ang: [[c9, -0.25], [c10, 0.15]], dist: [[c9, 13], [c10, 10]], h: [[c9, 3.5], [c10, 2.6]], ty: [[c9, 1.5], [c10, 1.3]], tz: [[c9, 0.5], [c10, 0.5]] }}>
        <Card s={c9} t0={K("athens")} t1={c10} title="ABOUT 430 BC" sub="ATHENS" />
      </Scene>
      {/* Speak until the water runs out. */}
      <Scene t0={c10} t1={c11} set={{ ...A, work: 1 }} anims={{ lvl: [[c10, 0.9], [c11, 0.35]], ang: [[c10, 0.3], [c11, 0.55]], dist: [[c10, 4.5], [c11, 3.8]], h: [[c10, 1.2], [c11, 1.0]], tx: [[c10, -0.5], [c11, -0.4]], ty: [[c10, 1.2], [c11, 1.2]] }} />
      {/* An emptying bowl always slows down. */}
      <Scene t0={c11} t1={c12} set={{ ...A }} anims={{ lvl: [[c11, 0.35], [c12, 0.12]], ...close(c11, c12, 0.75, 0.95, { dist: [[c11, 2.6], [c12, 2.3]], h: [[c11, 1.6], [c12, 1.4]], ty: [[c11, 1.2], [c12, 1.2]] }) }} />
      {/* Alexandria: an empty workshop. */}
      <Scene t0={c12} t1={c13} set={{ ...X }} anims={{ ang: [[c12, -0.3], [c13, 0.2]], dist: [[c12, 11], [c13, 9]], h: [[c12, 2.6], [c13, 2.2]], tx: [[c12, 0], [c13, 0]], ty: [[c12, 1.6], [c13, 1.6]] }}>
        <Card s={c12} t0={K("alexandria")} t1={c13} title="ABOUT 250 BC" sub="ALEXANDRIA" />
      </Scene>
      {/* Water flows in: tank and jar arrive. */}
      <Scene t0={c13} t1={c14} set={{ ...X }} anims={{ tank: [[c13 + 0.1, 0], [c13 + 1.0, 1]], jar: [[c13 + 0.9, 0], [c14 - 0.1, 1]], ang: [[c13, 0.5], [c14, 0.7]], dist: [[c13, 8], [c14, 7.4]], h: [[c13, 2.2], [c14, 2.0]], tx: [[c13, 0], [c14, 0]], ty: [[c13, 1.8], [c14, 1.8]] }} />
      {/* Tank stays full, overflow spills. */}
      <Scene t0={c14} t1={c15} set={{ ...X, tank: 1, jar: 1 }} anims={{ over: [[K("overflow"), 0], [K("spills"), 1]], ...close(c14, c15, 0.4, 0.75, { dist: [[c14, 3.6], [c15, 3.2]], h: [[c14, 1.2], [c15, 0.9]], tx: [[c14, -0.4], [c15, -0.4]], ty: [[c14, 3.3], [c15, 3.2]] }) }} />
      {/* Stream fills the jar, float rises. */}
      <Scene t0={c15} t1={c16} set={{ ...XJ }} anims={{ flt: [[K("fills"), 0.02], [c16, 0.3]], ...close(c15, c16, 0.65, 0.9, { dist: [[c15, 4.0], [c16, 3.6]], h: [[c15, 1.0], [c16, 1.0]], tx: [[c15, 1.1], [c16, 1.1]], ty: [[c15, 1.3], [c16, 1.3]] }) }} />
      {/* A pointer climbs past the hours. */}
      <Scene t0={c16} t1={k2} set={{ ...XJ }} anims={{ ptr: [[K("pointer"), 0.02], [K("pointer") + 0.8, 1]], flt: [[c16, 0.3], [k2, 0.5]], ang: [[c16, 0.3], [k2, 0.6]], dist: [[c16, 4.6], [k2, 4.4]], h: [[c16, 0.8], [k2, 0.8]], tx: [[c16, 1.5], [k2, 1.5]], ty: [[c16, 2.6], [k2, 2.8]], lens: [[c16, 1.2], [k2, 1.2]] }} />
      <Scene t0={k2} t1={c17} set={{ ...XJ, ptr: 1 }} anims={{ flt: [[k2, 0.5], [c17, 0.6]], ang: [[k2, 0.95], [c17, 0.65]], dist: [[k2, 8], [c17, 7.4]], h: [[k2, 1.6], [c17, 1.4]], tx: [[k2, 0.3], [c17, 0.3]], ty: [[k2, 2.0], [c17, 2.0]] }}>
        <Label s={k2} t0={K("this is an inflow") + 0.1} t1={c17} text="INFLOW WATER CLOCK" y={380} />
      </Scene>
      {/* Teeth on the bar turn a drum. */}
      <Scene t0={c17} t1={c18} set={{ ...XJ, ptr: 1 }} anims={{ teeth: [[K("teeth"), 0], [K("teeth") + 0.9, 1]], flt: [[c17, 0.6], [c18, 0.85]], ...close(c17, c18, 0.5, 0.75, { dist: [[c17, 2.8], [c18, 2.6]], h: [[c17, 0.4], [c18, 0.3]], tx: [[c17, 0.9], [c18, 0.9]], ty: [[c17, 2.7], [c18, 2.7]] }) }} />
      {/* The finished clock. */}
      <Scene t0={c18} t1={DUR} set={{ ...XJ, ptr: 1, teeth: 1 }} anims={{ flt: [[c18, 0.85], [DUR, 0.95]], ang: [[c18, -0.2], [DUR, 0.9]], dist: [[c18, 9], [DUR, 8]], h: [[c18, 2.4], [DUR, 2.8]], tx: [[c18, 0.3], [DUR, 0.3]], ty: [[c18, 1.9], [DUR, 2.0]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
