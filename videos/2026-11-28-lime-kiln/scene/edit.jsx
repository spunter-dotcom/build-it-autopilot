// edit.jsx: lime kiln timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 68.3;

const def = { site: 0, fall: 0, wash: 0, work: 0, lumps: 0, smoke: 0, white: 0, kiln: 1, cut: 0, fill: 0, fire: 0, burnt: 0, heap: 0, load: 0, pour: 0, slake: 0, steam: 0, wall: 0, spread: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("your new barn"), c2 = C("you need mortar"), c3 = C("but mud"), c4 = C("so you look"), c5 = C("you break"),
    c6 = C("you dig"), c7 = C("this is a lime"), c8 = C("so you fill"), c9 = C("you light"), c10 = C("but it has"),
    c11 = C("so you feed"), c12 = C("then you let"), c13 = C("it's white"), c14 = C("this is quicklime"), c15 = C("pour on water"),
    c16 = C("so you mix"), c17 = C("slowly it"), c18 = C("paint the rest"), c19 = C("congratulations");
  const KS = { site: 1, ground: 1 };
  const KC = { tx: 0, ty: 1.8, tz: -1.4 };
  const Y = { site: 2, ground: 1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* hook: village barn, kiln far behind */}
      <Scene t0={0} t1={c1} set={{ site: 0 }} anims={{ ang: [[0, 0.7], [c1, 0.35]], dist: [[0, 20], [c1, 15]], h: [[0, 6], [c1, 4]], ty: [[0, 1.5], [c1, 1.5]], tz: [[0, -2], [c1, 0]] }} />
      {/* storm knocks stones down */}
      <Scene t0={c1} t1={c2} set={{ site: 0 }} anims={{ fall: [[K("every storm"), 0], [K("down") + 0.2, 1]], ang: [[c1, 0.5], [c2, 0.25]], dist: [[c1, 8], [c2, 7]], h: [[c1, 1.5], [c2, 1.2]], tx: [[c1, 1.9], [c2, 1.9]], ty: [[c1, 1.3], [c2, 1.2]], tz: [[c1, 2.2], [c2, 2.4]] }} />
      {/* need mortar: the gap */}
      <Scene t0={c2} t1={c3} set={{ site: 0, fall: 1 }} anims={{ ang: [[c2, -0.2], [c3, 0.05]], dist: [[c2, 4.5], [c3, 4]], h: [[c2, 0.8], [c3, 1.0]], tx: [[c2, 1.9], [c3, 1.9]], ty: [[c2, 1.6], [c3, 1.6]], tz: [[c2, 2.3], [c3, 2.3]], lens: [[c2, 1.2], [c3, 1.2]] }} />
      {/* mud washes out */}
      <Scene t0={c3} t1={c4} set={{ site: 0, fall: 1 }} anims={{ wash: [[c3 + 0.5, 0], [c4 - 0.2, 1]], ang: [[c3, -0.25], [c4, -0.05]], dist: [[c3, 4.2], [c4, 3.6]], h: [[c3, 0.3], [c4, 0.3]], tx: [[c3, -1.9], [c4, -1.9]], ty: [[c3, 1.3], [c4, 1.3]], tz: [[c3, 2.3], [c4, 2.3]], lens: [[c3, 1.2], [c4, 1.2]] }} />
      {/* limestone outcrop */}
      <Scene t0={c4} t1={c5} set={{ site: 0, fall: 1, wash: 1 }} anims={{ ang: [[c4, 0.9], [c5, 0.5]], dist: [[c4, 9], [c5, 7]], h: [[c4, 2.5], [c5, 1.8]], tx: [[c4, 8.4], [c5, 8.4]], ty: [[c4, 0.8], [c5, 0.8]], tz: [[c4, 1.4], [c5, 1.4]] }}>
        <Label s={c4} t0={K("limestone")} t1={c5} text="LIMESTONE" />
      </Scene>
      {/* break into lumps */}
      <Scene t0={c5} t1={c6} set={{ site: 0, fall: 1, wash: 1, work: 1 }} anims={{ lumps: [[c5 + 0.3, 0.3], [c6 - 0.3, 1]], ang: [[c5, 1.0], [c6, 1.3]], dist: [[c5, 5], [c6, 4.4]], h: [[c5, 1.2], [c6, 1.0]], tx: [[c5, 7.5], [c6, 7.5]], ty: [[c5, 0.6], [c6, 0.6]], tz: [[c5, 3.4], [c6, 3.4]], lens: [[c5, 1.3], [c6, 1.3]] }} />
      {/* dig into the hill, kiln rises */}
      <Scene t0={c6} t1={c7} set={{ ...KS, ...KC }} anims={{ kiln: [[K("build a"), 0], [c7 - 0.2, 1]], ang: [[c6, 0.8], [c7, 0.45]], dist: [[c6, 15], [c7, 12]], h: [[c6, 4], [c7, 3]] }} />
      {/* LIME KILN hero */}
      <Scene t0={c7} t1={c8} set={{ ...KS, ...KC }} anims={{ ang: [[c7, -0.35], [c8, -0.15]], dist: [[c7, 13], [c8, 11.5]], h: [[c7, 3.5], [c8, 3.0]], ty: [[c7, 2.2], [c8, 2.2]] }}>
        <Label s={c7} t0={K("lime kiln") + 0.1} t1={c8} text="LIME KILN" />
      </Scene>
      {/* cutaway: layers of wood and limestone */}
      <Scene t0={c8} t1={c9} set={{ ...KS, ...KC, cut: 1, load: 1, work: 1 }} anims={{ fill: [[K("wood"), 0.13], [K("top") + 0.3, 1]], ang: [[c8, 0.25], [c9, 0.0]], dist: [[c8, 8], [c9, 7]], h: [[c8, 1.5], [c9, 1.0]], ty: [[c8, 1.6], [c9, 2.0]] }} />
      {/* light the bottom, fire climbs */}
      <Scene t0={c9} t1={c10} set={{ ...KS, ...KC, cut: 1, fill: 1 }} anims={{ fire: [[K("light it"), 0.01], [c10, 1]], ang: [[c9, -0.15], [c10, 0.1]], dist: [[c9, 6], [c10, 6.5]], h: [[c9, 0.2], [c10, 0.8]], ty: [[c9, 1.4], [c10, 2.0]] }} />
      {/* 900 degrees, three days: smoking kiln */}
      <Scene t0={c10} t1={c11} set={{ ...KS, ...KC, fill: 1, fire: 1 }} anims={{ smoke: [[c10, 0.6], [c11, 1]], ang: [[c10, 0.6], [c11, 0.9]], dist: [[c10, 12], [c11, 13]], h: [[c10, 2.5], [c11, 3.5]], ty: [[c10, 2.5], [c11, 2.8]] }}>
        <Card s={c10} t0={K("hotter") } t1={K("three days")} title="900 °C+" sub="INSIDE THE KILN" />
        <Card s={c10} t0={K("three days")} t1={c11} title="3 DAYS" sub="OF FIRING" />
      </Scene>
      {/* feed it day and night */}
      <Scene t0={c11} t1={c12} set={{ ...KS, ...KC, fill: 1, fire: 1, smoke: 1, work: 1 }} anims={{ night: [[c11, 0], [K("night"), 0.85]], ang: [[c11, 0.45], [c12, 0.3]], dist: [[c11, 5], [c12, 4.5]], h: [[c11, 0.6], [c12, 0.5]], tx: [[c11, 0.5], [c12, 0.5]], ty: [[c11, 0.9], [c12, 0.9]], tz: [[c11, 0.6], [c12, 0.6]], lens: [[c11, 1.2], [c12, 1.2]] }} />
      {/* cool and rake out */}
      <Scene t0={c12} t1={c13} set={{ ...KS, ...KC, fill: 1, burnt: 1, work: 1 }} anims={{ heap: [[K("rake"), 0.2], [c13, 1]], ang: [[c12, -0.5], [c13, -0.3]], dist: [[c12, 7], [c13, 6]], h: [[c12, 1.5], [c13, 1.3]], ty: [[c12, 0.8], [c13, 0.7]], tz: [[c12, 0.6], [c13, 0.8]] }} />
      {/* white and lighter: cutaway shows the white stack */}
      <Scene t0={c13} t1={c14} set={{ ...KS, ...KC, fill: 0.62, burnt: 1, cut: 1, heap: 1, work: 1 }} anims={{ ang: [[c13, 0.15], [c14, -0.1]], dist: [[c13, 7.5], [c14, 7]], h: [[c13, 1.0], [c14, 1.2]], ty: [[c13, 1.4], [c14, 1.4]], tz: [[c13, -0.5], [c14, -0.3]] }} />
      {/* QUICKLIME close-up */}
      <Scene t0={c14} t1={c15} set={{ ...KS, ...KC, fill: 0.62, burnt: 1, heap: 1 }} anims={{ ang: [[c14, 0.3], [c15, 0.55]], dist: [[c14, 3.6], [c15, 3.2]], h: [[c14, 1.3], [c15, 1.1]], tx: [[c14, -0.6], [c15, -0.6]], ty: [[c14, 0.3], [c15, 0.3]], tz: [[c14, 2.0], [c15, 2.0]], lens: [[c14, 1.3], [c15, 1.3]] }}>
        <Label s={c14} t0={K("quicklime")} t1={c15} text="QUICKLIME" />
      </Scene>
      {/* water: hiss, steam, putty */}
      <Scene t0={c15} t1={c16} set={{ ...Y, pour: 1 }} anims={{ steam: [[K("hisses"), 0], [K("hisses") + 0.6, 1], [c16, 0.7]], slake: [[K("turns into"), 0], [c16 - 0.2, 1]], ang: [[c15, 0.5], [c16, 0.25]], dist: [[c15, 4.5], [c16, 4]], h: [[c15, 2.0], [c16, 1.8]], tx: [[c15, 0.4], [c16, 0.4]], ty: [[c15, 0.6], [c16, 0.6]], lens: [[c15, 1.2], [c16, 1.2]] }} />
      {/* mix with sand, build the wall */}
      <Scene t0={c16} t1={c17} set={{ ...Y, slake: 1, work: 1 }} anims={{ wall: [[c16 + 0.3, 0.17], [c17 - 0.1, 1]], ang: [[c16, 0.6], [c17, 0.3]], dist: [[c16, 9], [c17, 8]], h: [[c16, 2.5], [c17, 2.0]], tx: [[c16, -0.5], [c17, -0.5]], ty: [[c16, 1.0], [c17, 1.2]], tz: [[c16, -1.5], [c17, -1.6]] }} />
      {/* turns back into stone: close on the joints */}
      <Scene t0={c17} t1={c18} set={{ ...Y, slake: 1, wall: 1 }} anims={{ ang: [[c17, -0.45], [c18, -0.2]], dist: [[c17, 3.4], [c18, 3.0]], h: [[c17, 0.2], [c18, 0.3]], tx: [[c17, 1.2], [c18, 0.8]], ty: [[c17, 1.4], [c18, 1.4]], tz: [[c17, -2.3], [c18, -2.3]], lens: [[c17, 1.2], [c18, 1.2]] }} />
      {/* whitewash and lime the field */}
      <Scene t0={c18} t1={c19} set={{ ...Y, slake: 1, wall: 1 }} anims={{ white: [[K("paint"), 0], [K("paint") + 0.4, 1]], spread: [[K("spread some"), 0], [c19, 1]], ang: [[c18, 0.9], [c19, 1.1]], dist: [[c18, 14], [c19, 13]], h: [[c18, 4], [c19, 3.5]], tx: [[c18, 3.0], [c19, 3.5]], ty: [[c18, 0.8], [c19, 0.8]], tz: [[c18, -0.8], [c19, -0.5]] }} />
      {/* hero: the white barn, kiln smoking on the hill */}
      <Scene t0={c19} t1={DUR} set={{ site: 0, white: 1, smoke: 1, wash: 1 }} anims={{ ang: [[c19, -0.45], [DUR, 0.05]], dist: [[c19, 21], [DUR, 18]], h: [[c19, 5], [DUR, 4]], tx: [[c19, -4.5], [DUR, -4.5]], ty: [[c19, 1.5], [DUR, 1.5]], tz: [[c19, -5.5], [DUR, -5.5]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
