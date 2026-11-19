// edit.jsx: ballista timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 72;

const def = { site: 0, bow: 0, push: 0, aim: 0, frame: 0, spring: 0, arms: 0, string: 0, winch: 0, ratchet: 0, draw: 0, slider: 0, trig: 0, stone: 0, fire: 0, fly: 0, crack: 0, work: 0, pos: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

// Build state so far (each shot starts from the previous one).
const G = { bow: 1, push: 1, aim: 1 };
const F1 = { ...G, frame: 1, spring: 1 };
const F2 = { ...F1, arms: 1, string: 1 };
const F3 = { ...F2, winch: 1, ratchet: 1, draw: 0.5 };
const F4 = { ...F3, slider: 1, trig: 1 };
const F5 = { ...F4, stone: 1 };

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("your king"), c2 = C("so you build"), c3 = C("this is a"), c4 = C("but wood"), c5 = C("so you stop"),
    c6 = C("you wind thick"), c7 = C("this is a", 1), c8 = C("joined by"), c9 = C("so you add"), c10 = C("and a ratchet"),
    c11 = C("then a slider"), c12 = C("this is a", 2), c13 = C("13 to"), c14 = C("but stones"), c15 = C("so you move"),
    c16 = C("the arms slam"), c17 = C("the wall cracks"), c18 = C("congratulations");
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={c1} set={{ tx: 0, ty: 3.5, tz: -34, lens: 1.0 }} anims={{ ang: [[0, 0.35], [c1, 0.12]], dist: [[0, 30], [c1, 23]], h: [[0, 1.0], [c1, 2.5]] }} />
      <Scene t0={c1} t1={c2} set={{ tx: 0, ty: 3, tz: -34, lens: 1.0 }} anims={{ ang: [[c1, -0.3], [c2, -0.12]], dist: [[c1, 19], [c2, 15]], h: [[c1, 3], [c2, 2]] }}>
        <Card s={c1} t0={K("your king") + 0.2} t1={c2} title="399 BC" sub="SYRACUSE" />
      </Scene>
      <Scene t0={c2} t1={c3} set={{ tx: -30, ty: 0.75, tz: 0.4, lens: 1.3 }} anims={{ bow: [[K("build a bigger"), 0], [K("build a bigger") + 0.9, 1]], push: [[K("brace it"), 0], [K("push"), 1]], ang: [[c2, 0.9], [c3, 0.55]], dist: [[c2, 4.2], [c3, 3.2]], h: [[c2, 0.5], [c3, 0.3]] }} />
      <Scene t0={c3} t1={c4} set={{ bow: 1, push: 1, tx: -30, ty: 0.95, tz: 0.6, lens: 1.3 }} anims={{ aim: [[c3, 0], [c3 + 1.0, 1]], ang: [[c3, 0.25], [c4, -0.35]], dist: [[c3, 3.0], [c4, 3.6]], h: [[c3, 0.3], [c4, 0.5]] }}>
        <Label s={c3} t0={K("this is a") + 0.4} t1={c4} text="GASTRAPHETES" />
      </Scene>
      <Scene t0={c4} t1={c5} set={{ bow: 1, aim: 1, tx: -30, ty: 1.0, tz: 1.3, lens: 1.3 }} anims={{ push: [[c4, 1], [K("so far"), 1.35]], ang: [[c4, 1.25], [c5, 1.5]], dist: [[c4, 2.0], [c5, 1.6]], h: [[c4, 0.4], [c5, 0.2]] }} />
      <Scene t0={c5} t1={c6} set={{ ...G, tx: 0, ty: 1.1, tz: -0.4, lens: 1.1 }} anims={{ frame: [[K("start twisting") - 0.3, 0], [K("start twisting") + 0.7, 1]], ang: [[c5, 0.75], [c6, 0.4]], dist: [[c5, 6.5], [c6, 5.2]], h: [[c5, 1.6], [c6, 1.2]] }} />
      <Scene t0={c6} t1={c7} set={{ ...G, frame: 1, tx: 0, ty: 1.25, tz: -1.0, lens: 1.3 }} anims={{ spring: [[K("wind thick"), 0], [K("tight"), 1]], ang: [[c6, -0.55], [c7, -0.2]], dist: [[c6, 2.8], [c7, 2.2]], h: [[c6, 0.4], [c7, 0.2]] }} />
      <Scene t0={c7} t1={c8} set={{ ...F1, tx: 0, ty: 1.25, tz: -0.8, lens: 1.2 }} anims={{ arms: [[K("wooden arms"), 0], [K("wooden arms") + 0.8, 1]], ang: [[c7, 0.25], [c8, -0.25]], dist: [[c7, 3.0], [c8, 4.6]], h: [[c7, 0.6], [c8, 1.4]] }}>
        <Label s={c7} t0={K("this is a", 1) + 0.3} t1={K("two stiff") + 0.6} text="TORSION SPRING" />
      </Scene>
      <Scene t0={c8} t1={c9} set={{ ...F1, arms: 1, tx: 0, ty: 1.2, tz: -0.6, lens: 1.1 }} anims={{ string: [[K("heavy sinew"), 0], [K("heavy sinew") + 0.7, 1]], work: [[K("nobody"), 0], [K("pull that"), 1]], ang: [[c8, 2.75], [c9, 3.25]], dist: [[c8, 5.0], [c9, 4.2]], h: [[c8, 0.9], [c9, 0.6]] }} />
      <Scene t0={c9} t1={c10} set={{ ...F2, tx: 0, ty: 1.05, tz: 1.7, lens: 1.3 }} anims={{ winch: [[K("a winch"), 0], [K("a winch") + 0.7, 1]], ang: [[c9, 0.55], [c10, 0.3]], dist: [[c9, 3.0], [c10, 2.5]], h: [[c9, 0.8], [c10, 0.6]] }} />
      <Scene t0={c10} t1={c11} set={{ ...F2, winch: 1, work: 1, tx: 0.3, ty: 1.0, tz: 1.8, lens: 1.3 }} anims={{ ratchet: [[K("ratchet"), 0], [K("ratchet") + 0.6, 1]], draw: [[K("every click"), 0], [K("where it is"), 0.5]], ang: [[c10, 1.35], [c11, 1.0]], dist: [[c10, 1.9], [c11, 1.6]], h: [[c10, 0.4], [c11, 0.25]] }} />
      <Scene t0={c11} t1={c12} set={{ ...F3, work: 1, tx: 0, ty: 1.2, tz: 0.0, lens: 1.2 }} anims={{ slider: [[K("slider"), 0], [K("slider") + 0.7, 1]], trig: [[K("trigger"), 0], [K("trigger") + 0.5, 1]], ang: [[c11, 0.95], [c12, 0.6]], dist: [[c11, 4.0], [c12, 3.4]], h: [[c11, 2.4], [c12, 2.0]] }} />
      <Scene t0={c12} t1={c13} set={{ ...F4, tx: 0, ty: 1.0, tz: 0.2, lens: 1.1 }} anims={{ stone: [[K("load a stone"), 0], [K("load a stone") + 0.7, 1]], ang: [[c12, -0.85], [c13, -0.35]], dist: [[c12, 7.5], [c13, 6.0]], h: [[c12, 2.2], [c13, 1.6]] }}>
        <Label s={c12} t0={K("this is a", 2) + 0.4} t1={K("so you load") + 0.4} text="BALLISTA" />
      </Scene>
      <Scene t0={c13} t1={c14} set={{ ...F5, tx: 0, ty: 1.42, tz: 0.15, lens: 1.3 }} anims={{ ang: [[c13, 0.6], [c14, 0.95]], dist: [[c13, 1.7], [c14, 2.1]], h: [[c13, 0.45], [c14, 0.6]] }}>
        <Card s={c13} t0={K("13 to") + 0.1} t1={c14} title="13–26 KG" sub="SOME UP TO 162 KG" />
      </Scene>
      <Scene t0={c14} t1={c15} set={{ ...F5, pos: 8, tx: 0, ty: 2.0, tz: -14, lens: 1.0 }} anims={{ ang: [[c14, 0.18], [c15, 0.08]], dist: [[c14, 32], [c15, 28]], h: [[c14, 7], [c15, 5]] }}>
        <Card s={c14} t0={K("within") + 0.1} t1={c15} title="150 M" sub="OR CLOSER TO THE WALL" />
      </Scene>
      <Scene t0={c15} t1={c16} set={{ ...F5, work: 1, tx: 0, ty: 1.2, lens: 1.1 }} anims={{ pos: [[K("move closer"), 8], [K("wind", 1), 0]], tz: [[K("move closer"), 8], [K("wind", 1), 0]], draw: [[K("wind", 1), 0.5], [K("aim"), 1]], ang: [[c15, 1.3], [c16, 1.0]], dist: [[c15, 7.0], [c16, 5.5]], h: [[c15, 1.5], [c16, 1.0]] }} />
      <Scene t0={c16} t1={c17} set={{ ...F5, draw: 1, tx: 0, ty: 2.5, tz: -14, lens: 1.0 }} anims={{ fire: [[K("arms slam"), 0], [K("arms slam") + 0.25, 1]], fly: [[K("arms slam") + 0.2, 0], [K("the wall cracks") + 0.1, 1]], ang: [[c16, 0.1], [c17, 0.05]], dist: [[c16, 20], [c17, 22]], h: [[c16, 1.2], [c17, 2.0]] }} />
      <Scene t0={c17} t1={c18} set={{ ...F5, draw: 1, fire: 1, fly: 1, tx: 0, ty: 3.2, tz: -33, lens: 1.1 }} anims={{ crack: [[K("wall cracks"), 0], [K("wall cracks") + 0.5, 1]], ang: [[c17, -0.3], [c18, -0.15]], dist: [[c17, 10], [c18, 8.5]], h: [[c17, 0.4], [c18, 0.8]] }} />
      <Scene t0={c18} t1={DUR} set={{ ...F5, draw: 1, fire: 1, fly: 1, crack: 1, tx: 0, ty: 1.0, tz: 0.2, lens: 1.1 }} anims={{ ang: [[c18, -1.0], [DUR, 0.35]], dist: [[c18, 6.0], [DUR, 7.2]], h: [[c18, 1.6], [DUR, 2.0]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
