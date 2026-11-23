// edit.jsx: blacksmith's forge timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 71.5;

const def = { site: 0, hearth: 0, coal: 0, fire: 0, bel: 0, puff: 0, bar: 0, hot: 0, barx: 0, anvil: 0, ham: 0, bend: 0, weld: 0, trough: 0, blade: 0, steam: 0, smoke: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("it needed"), c2 = C("so you lay"), c3 = C("you heap"), c4 = C("but charcoal"), c5 = C("so you build a bellows"),
    c6 = C("squeeze it"), k1 = C("this is a bellows"), c7 = C("now you push"), c8 = C("it never melts"), c9 = C("but soft iron"),
    c10 = C("so you set"), k2 = C("this is an anvil"), c11 = C("you grip"), c12 = C("draw it out"), c13 = C("when it cools"),
    c14 = C("heat two bars"), k3 = C("that is a forge"), c15 = C("last you plunge"), c16 = C("congratulations");
  const V = { site: 0, ground: 0 };
  const S = { site: 1, ground: 1 };
  const HEARTH = { ...S, hearth: 1 };
  const LIT = { ...HEARTH, coal: 1, fire: 0.3 };
  const BEL = { ...LIT, bel: 1, puff: 1, fire: 1, smoke: 1 };
  const ANV = { ...BEL, anvil: 1 };
  const DONE = { ...ANV, trough: 1, bar: 1, hot: 1, barx: 0 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* Hook: a village, a farmer and a broken plough. */}
      <Scene t0={0} t1={c1} set={{ ...V }} anims={{ ang: [[0, 0.5], [c1, 0.2]], dist: [[0, 9], [c1, 6]], h: [[0, 2.5], [c1, 1.8]], tx: [[0, -0.4], [c1, -0.4]], ty: [[0, 0.6], [c1, 0.5]] }} />
      {/* An empty smithy yard and the smith. */}
      <Scene t0={c1} t1={c2} set={{ ...S }} anims={{ ang: [[c1, -0.5], [c2, -0.2]], dist: [[c1, 9], [c2, 8]], h: [[c1, 3], [c2, 2.6]], tx: [[c1, 0.8], [c2, 0.8]], ty: [[c1, 1], [c2, 1]] }} />
      {/* The hearth rises. */}
      <Scene t0={c2} t1={c3} set={{ ...S }} anims={{ hearth: [[c2 + 0.3, 0], [c3 - 0.8, 1]], ang: [[c2, 0.5], [c3, 0.2]], dist: [[c2, 7], [c3, 6]], h: [[c2, 3], [c3, 2.5]], ty: [[c2, 0.6], [c3, 0.8]] }} />
      {/* Charcoal heaped and lit. */}
      <Scene t0={c3} t1={c4} set={{ ...HEARTH }} anims={{ coal: [[c3 + 0.2, 0], [c3 + 1.0, 1]], fire: [[c3 + 1.4, 0], [c4, 0.3]], ang: [[c3, -0.3], [c4, 0.1]], dist: [[c3, 4], [c4, 3.5]], h: [[c3, 1.8], [c4, 1.5]], ty: [[c3, 0.9], [c4, 0.9]] }} />
      {/* It only smoulders. */}
      <Scene t0={c4} t1={c5} set={{ ...LIT }} anims={{ fire: [[c4, 0.3], [c5, 0.22]], ang: [[c4, 0.25], [c5, 0.45]], dist: [[c4, 3], [c5, 2.4]], h: [[c4, 1.0], [c5, 0.8]], ty: [[c4, 1.0], [c5, 1.0]], lens: [[c4, 1.3], [c5, 1.3]] }} />
      {/* The bellows arrives with its pipe. */}
      <Scene t0={c5} t1={c6} set={{ ...LIT }} anims={{ bel: [[c5 + 0.3, 0], [c5 + 1.8, 1]], ang: [[c5, -0.9], [c6, -0.6]], dist: [[c5, 5.5], [c6, 4.5]], h: [[c5, 2.2], [c6, 1.6]], tx: [[c5, -1.3], [c6, -1.3]], ty: [[c5, 0.8], [c6, 0.8]] }} />
      {/* Squeeze: the fire roars. */}
      <Scene t0={c6} t1={k1} set={{ ...LIT, bel: 1, puff: 1 }} anims={{ fire: [[c6, 0.3], [c6 + 1.4, 1]], smoke: [[c6 + 0.8, 0], [k1, 1]], ang: [[c6, 0.3], [k1, 0.0]], dist: [[c6, 6], [k1, 7]], h: [[c6, 2], [k1, 2.8]], ty: [[c6, 1.4], [k1, 1.6]] }} />
      <Scene t0={k1} t1={c7} set={{ ...BEL }} anims={{ ang: [[k1, -1.1], [c7, -0.8]], dist: [[k1, 3.2], [c7, 2.8]], h: [[k1, 1.0], [c7, 0.9]], tx: [[k1, -1.8], [c7, -1.8]], ty: [[k1, 0.8], [c7, 0.8]], lens: [[k1, 1.3], [c7, 1.3]] }}>
        <Label s={k1} t0={K("this is a bellows") + 0.1} t1={c7} text="BELLOWS" y={560} />
      </Scene>
      {/* The bar goes in and heats: red, orange, nearly white. */}
      <Scene t0={c7} t1={c8} set={{ ...BEL, bar: 1 }} anims={{ hot: [[K("glows"), 0], [K("red"), 0.35], [K("orange"), 0.7], [K("white"), 1]], ang: [[c7, 0.5], [c8, 0.2]], dist: [[c7, 3.5], [c8, 2.6]], h: [[c7, 1.6], [c8, 1.1]], tx: [[c7, 0.5], [c8, 0.5]], ty: [[c7, 1.0], [c8, 1.0]], lens: [[c7, 1.3], [c8, 1.3]] }} />
      <Scene t0={c8} t1={c9} set={{ ...BEL, bar: 1, hot: 1 }} anims={{ ang: [[c8, 1.0], [c9, 1.3]], dist: [[c8, 2.2], [c9, 2.0]], h: [[c8, 0.5], [c9, 0.4]], tx: [[c8, 1.0], [c9, 1.0]], ty: [[c8, 1.05], [c9, 1.05]], lens: [[c8, 1.3], [c9, 1.3]] }} />
      {/* Nothing to work it on: the empty spot by the hearth. */}
      <Scene t0={c9} t1={c10} set={{ ...BEL, bar: 1, hot: 1 }} anims={{ ang: [[c9, 0.6], [c10, 0.4]], dist: [[c9, 6], [c10, 5]], h: [[c9, 2.2], [c10, 1.8]], tx: [[c9, 1.4], [c10, 1.6]], ty: [[c9, 0.8], [c10, 0.8]] }} />
      {/* The anvil drops onto its stump. */}
      <Scene t0={c10} t1={k2} set={{ ...BEL, bar: 1, hot: 1 }} anims={{ anvil: [[c10 + 0.6, 0], [c10 + 2.0, 1]], ang: [[c10, 0.9], [k2, 0.6]], dist: [[c10, 4.5], [k2, 3.6]], h: [[c10, 1.8], [k2, 1.3]], tx: [[c10, 2.0], [k2, 2.0]], ty: [[c10, 0.7], [k2, 0.7]] }} />
      <Scene t0={k2} t1={c11} set={{ ...ANV, bar: 1, hot: 1 }} anims={{ ang: [[k2, 1.6], [c11, 1.3]], dist: [[k2, 2.6], [c11, 2.3]], h: [[k2, 0.6], [c11, 0.5]], tx: [[k2, 2.0], [c11, 2.0]], ty: [[k2, 0.75], [c11, 0.75]], lens: [[k2, 1.3], [c11, 1.3]] }}>
        <Label s={k2} t0={K("this is an anvil") + 0.1} t1={c11} text="ANVIL" y={560} />
      </Scene>
      {/* Onto the anvil and hammered. */}
      <Scene t0={c11} t1={c12} set={{ ...ANV, bar: 1, hot: 1 }} anims={{ barx: [[c11 + 0.2, 0], [c11 + 1.0, 1]], ham: [[c11 + 1.2, 0], [c11 + 1.3, 1]], ang: [[c11, 0.4], [c12, 0.7]], dist: [[c11, 4.2], [c12, 3.4]], h: [[c11, 1.8], [c12, 1.4]], tx: [[c11, 1.4], [c12, 2.0]], ty: [[c11, 0.9], [c12, 0.9]] }} />
      <Scene t0={c12} t1={c13} set={{ ...ANV, bar: 1, hot: 1, barx: 1, ham: 1 }} anims={{ bend: [[K("bend"), 0], [K("punch"), 1]], ang: [[c12, -0.2], [c13, 0.2]], dist: [[c12, 2.6], [c13, 2.3]], h: [[c12, 1.0], [c13, 0.9]], tx: [[c12, 2.2], [c13, 2.2]], ty: [[c12, 0.95], [c13, 0.95]], lens: [[c12, 1.3], [c13, 1.3]] }} />
      {/* It cools, back in the fire. */}
      <Scene t0={c13} t1={c14} set={{ ...ANV, bar: 1 }} anims={{ hot: [[c13, 1], [c13 + 1.2, 0.1], [K("back") + 0.3, 0.1], [c14, 0.7]], barx: [[c13, 1], [K("back"), 1], [K("back") + 0.6, 0]], ang: [[c13, 0.5], [c14, 0.2]], dist: [[c13, 4.5], [c14, 4.0]], h: [[c13, 1.8], [c14, 1.6]], tx: [[c13, 1.2], [c14, 0.8]], ty: [[c13, 0.9], [c14, 0.9]] }} />
      {/* Two white-hot bars hammered into one. */}
      <Scene t0={c14} t1={k3} set={{ ...ANV, bar: 1, hot: 1, barx: 1 }} anims={{ weld: [[K("strike"), 0], [K("fuse"), 1]], ham: [[K("strike"), 0], [K("strike") + 0.1, 1]], ang: [[c14, -0.3], [k3, 0.1]], dist: [[c14, 3.0], [k3, 2.6]], h: [[c14, 1.2], [k3, 1.0]], tx: [[c14, 2.6], [k3, 2.6]], ty: [[c14, 0.9], [k3, 0.9]], lens: [[c14, 1.3], [k3, 1.3]] }} />
      <Scene t0={k3} t1={c15} set={{ ...ANV, bar: 1, hot: 1, barx: 1, weld: 1, ham: 1 }} anims={{ ang: [[k3, 0.9], [c15, 1.2]], dist: [[k3, 2.4], [c15, 2.2]], h: [[k3, 1.2], [c15, 1.0]], tx: [[k3, 2.7], [c15, 2.7]], ty: [[k3, 0.9], [c15, 0.9]], lens: [[k3, 1.3], [c15, 1.3]] }}>
        <Label s={k3} t0={K("that is a forge") + 0.1} t1={c15} text="FORGE WELD" y={560} />
      </Scene>
      {/* The trough, the blade, the hiss. */}
      <Scene t0={c15} t1={c16} set={{ ...ANV }} anims={{ trough: [[c15, 0], [c15 + 0.9, 1]], blade: [[K("plunge"), 0.01], [K("hiss") - 0.2, 1]], steam: [[K("hiss") - 0.3, 0], [K("hiss") + 0.4, 1], [c16, 0.6]], ang: [[c15, 0.5], [c16, 0.25]], dist: [[c15, 4.2], [c16, 3.2]], h: [[c15, 2.0], [c16, 1.6]], tx: [[c15, 0.9], [c16, 0.9]], ty: [[c15, 0.7], [c16, 0.8]], tz: [[c15, 1.4], [c16, 1.4]] }} />
      {/* The finished forge. */}
      <Scene t0={c16} t1={DUR} set={{ ...DONE }} anims={{ ang: [[c16, -0.6], [DUR, 0.5]], dist: [[c16, 8], [DUR, 9]], h: [[c16, 3], [DUR, 3.5]], tx: [[c16, 0.2], [DUR, 0.2]], ty: [[c16, 1.2], [DUR, 1.3]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
