// edit.jsx: stone arch bridge timeline (from kit/template).
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 62;

const def = { site: 0, rot: 0, posts: 0, clay: 0, dry: 0, pier: 0, nose: 0, hole: 0, abut: 0, cent: 0, strike: 0, stones: 0, key: 0, arch2: 0, fill: 0, deck: 0, people: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("your town"), c2 = C("but wooden"), c3 = C("so you build in"), c4 = C("so you drive"),
    c5 = C("this is a cofferdam"), c6 = C("you empty"), c7 = C("you give"), c8 = C("you even"),
    c9 = C("but stone can't"), c10 = C("so you build a wooden"), c11 = C("this is centering"), c12 = C("then you lay"),
    c13 = C("the last one"), c14 = C("this is a keystone"), c15 = C("now you knock"), c16 = C("so you add"),
    c17 = C("more than"), c18 = C("people still"), c19 = C("congratulations");
  // fixed state once each stage is done
  const PIER = { pier: 1, nose: 1, hole: 1, abut: 1 };
  const ARCH = { ...PIER, stones: 1, key: 1 };
  const DONE = { ...ARCH, site: 3, arch2: 1, fill: 1, deck: 1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={c1} set={{ site: 0, ty: -1 }} anims={{ ang: [[0, 0.9], [c1, 0.5]], dist: [[0, 30], [c1, 25]], h: [[0, 12], [c1, 9]] }} />
      <Scene t0={c1} t1={c2} set={{ site: 0, tx: 14, ty: 1 }} anims={{ ang: [[c1, -0.6], [c2, -0.2]], dist: [[c1, 14], [c2, 12]], h: [[c1, 3], [c2, 2.5]] }} />
      <Scene t0={c2} t1={c3} set={{ site: 0, ty: -1 }} anims={{ rot: [[c2 + 0.4, 0], [c3 - 0.4, 1]], ang: [[c2, 0.25], [c3, -0.1]], dist: [[c2, 17], [c3, 14]], h: [[c2, 6], [c3, 4.5]] }} />
      <Scene t0={c3} t1={c4} set={{ site: 1, ty: -1.5 }} anims={{ ang: [[c3, -0.5], [c4, 0.3]], dist: [[c3, 18], [c4, 12]], h: [[c3, 5], [c4, 3]] }} />
      <Scene t0={c4} t1={c5} set={{ site: 1, ty: -2 }} anims={{ posts: [[c4 + 0.2, 0], [K("seal") - 0.1, 1]], clay: [[K("seal"), 0], [c5 - 0.1, 1]], ang: [[c4, 0.6], [c5, 1.1]], dist: [[c4, 13], [c5, 11]], h: [[c4, 6], [c5, 5]] }} />
      <Scene t0={c5} t1={c6} set={{ site: 1, posts: 1, clay: 1, ty: -2 }} anims={{ ang: [[c5, -0.3], [c6, -0.6]], dist: [[c5, 10], [c6, 9]], h: [[c5, 3.5], [c6, 3.8]] }}>
        <Label s={c5} t0={K("cofferdam")} t1={c6} text="COFFERDAM" />
      </Scene>
      <Scene t0={c6} t1={c7} set={{ site: 1, posts: 1, clay: 1 }} anims={{ dry: [[c6 + 0.1, 0], [K("build a stone") , 1]], pier: [[K("build a stone"), 0], [c7 - 0.2, 1]], ang: [[c6, 0.4], [c7, 0.8]], dist: [[c6, 11], [c7, 10]], h: [[c6, 7], [c7, 5]], ty: [[c6, -3], [c7, -2]] }} />
      <Scene t0={c7} t1={c8} set={{ site: 1, posts: 1, clay: 1, dry: 1, pier: 1, ty: -2, tz: -1 }} anims={{ nose: [[K("pointed"), 0], [K("splits") , 1]], ang: [[c7, 2.4], [c8, 2.9]], dist: [[c7, 10], [c8, 9]], h: [[c7, 4], [c8, 3]] }} />
      <Scene t0={c8} t1={c9} set={{ site: 1, posts: 1, clay: 1, dry: 1, pier: 1, nose: 1, ty: -1 }} anims={{ hole: [[K("hole"), 0], [K("floodwater"), 1]], ang: [[c8, 0.5], [c9, 0.15]], dist: [[c8, 9], [c9, 7.5]], h: [[c8, 1.5], [c9, 1]] }} />
      <Scene t0={c9} t1={c10} set={{ site: 2, ...PIER, ty: -1 }} anims={{ ang: [[c9, -0.3], [c10, 0.1]], dist: [[c9, 22], [c10, 19]], h: [[c9, 3], [c10, 2]] }} />
      <Scene t0={c10} t1={c11} set={{ site: 2, ...PIER, tx: -4, ty: -1 }} anims={{ cent: [[K("wooden frame"), 0], [K("half") , 1]], ang: [[c10, 0.6], [c11, 0.3]], dist: [[c10, 13], [c11, 11]], h: [[c10, 4], [c11, 2.5]] }} />
      <Scene t0={c11} t1={c12} set={{ site: 2, ...PIER, cent: 1, tx: -4, ty: -1 }} anims={{ ang: [[c11, -0.4], [c12, -0.7]], dist: [[c11, 10], [c12, 9]], h: [[c11, 1], [c12, 1.5]] }}>
        <Label s={c11} t0={K("centering")} t1={c12} text="CENTERING" />
      </Scene>
      <Scene t0={c12} t1={c13} set={{ site: 2, ...PIER, cent: 1, tx: -4, ty: -0.5 }} anims={{ stones: [[K("wedge"), 0], [c13 - 0.15, 1]], ang: [[c12, 0.3], [c13, 0.05]], dist: [[c12, 12], [c13, 10.5]], h: [[c12, 2], [c13, 1.5]] }} />
      <Scene t0={c13} t1={c14} set={{ site: 2, ...PIER, cent: 1, stones: 1, tx: -4, ty: 0.8 }} anims={{ key: [[K("drops") - 0.2, 0], [K("locks"), 1]], ang: [[c13, -0.35], [c14, -0.15]], dist: [[c13, 9], [c14, 7.5]], h: [[c13, 3.5], [c14, 2.8]] }} />
      <Scene t0={c14} t1={c15} set={{ site: 2, ...ARCH, cent: 1, tx: -4, ty: 1 }} anims={{ ang: [[c14, 0.35], [c15, 0.15]], dist: [[c14, 5], [c15, 4.2]], h: [[c14, 0.8], [c15, 0.6]] }}>
        <Label s={c14} t0={K("keystone")} t1={c15} text="KEYSTONE" y={420} />
      </Scene>
      <Scene t0={c15} t1={c16} set={{ site: 2, ...ARCH, cent: 1, tx: -4, ty: -0.5 }} anims={{ strike: [[K("knock"), 0], [K("and the arch") + 0.2, 1]], ang: [[c15, -0.2], [c16, 0.45]], dist: [[c15, 13], [c16, 10]], h: [[c15, 0.5], [c16, 1.5]] }} />
      <Scene t0={c16} t1={c17} set={{ site: 3, ...ARCH, ty: -0.5 }} anims={{ arch2: [[K("second") - 0.2, 0], [K("fill"), 1]], fill: [[K("fill"), 0], [K("pave"), 1]], deck: [[K("pave"), 0], [c17 - 0.1, 1]], ang: [[c16, 0.5], [c17, 0.2]], dist: [[c16, 18], [c17, 16]], h: [[c16, 6], [c17, 5]] }} />
      <Scene t0={c17} t1={c18} set={{ ...DONE, ty: 0 }} anims={{ ang: [[c17, -0.9], [c18, -0.5]], dist: [[c17, 28], [c18, 24]], h: [[c17, 10], [c18, 7]] }}>
        <Card s={c17} t0={K("more than")} t1={c18} title="62 BC" sub="PONS FABRICIUS, ROME" />
      </Scene>
      <Scene t0={c18} t1={c19} set={{ ...DONE, tx: -2, ty: 2.2 }} anims={{ people: [[c18, 0], [c19, 0.6]], ang: [[c18, 1.45], [c19, 1.35]], dist: [[c18, 10], [c19, 9]], h: [[c18, 1.2], [c19, 1.5]] }} />
      <Scene t0={c19} t1={DUR} set={{ ...DONE, ty: -0.5 }} anims={{ people: [[c19, 0.6], [DUR, 1]], ang: [[c19, 0.3], [DUR, -0.4]], dist: [[c19, 20], [DUR, 25]], h: [[c19, 2], [DUR, 5]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
