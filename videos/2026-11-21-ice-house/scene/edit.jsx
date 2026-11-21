// edit.jsx: ice house timeline.
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 68;

const def = { site: 0, work: 0, blocks: 0, load: 0, melt: 0, dig: 0, brick: 0, pool: 0, drain: 0, dome: 0, earth: 0, ice: 0, pass: 0, cut: 1, px: 4.5, pz: 2.5 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("it is winter"), c2 = C("so you cut"), c3 = C("but in a"), c4 = C("so you dig"),
    c5 = C("but bare soil"), c6 = C("so you line"), c7 = C("but meltwater"), c8 = C("so you leave"),
    c9 = C("but an open"), c10 = C("so you close"), c11 = C("now you pack"), c12 = C("but every time"),
    c13 = C("kings built"), c14 = C("congratulations");
  // Every site 2 shot: all finished parts so far stay in place.
  const W = { site: 2, ground: 0 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* Hook: a frozen lake in a snowy field. */}
      <Scene t0={0} t1={c1} set={{ site: 0, ground: 5 }} anims={{ ang: [[0, 0.9], [c1, 0.5]], dist: [[0, 14], [c1, 11]], h: [[0, 5], [c1, 4]], tz: [[0, -2], [c1, -1]] }} />
      <Scene t0={c1} t1={c2} set={{ site: 0, ground: 5 }} anims={{ ang: [[c1, -0.3], [c2, 0.1]], dist: [[c1, 8], [c2, 6.5]], h: [[c1, 2.5], [c2, 2]], tx: [[c1, 0], [c2, 0.5]], ty: [[c1, 0.6], [c2, 0.6]] }} />
      <Scene t0={c2} t1={c3} set={{ site: 0, ground: 5, work: 1 }} anims={{ blocks: [[c2, 0], [c2 + 1.6, 1]], load: [[c2 + 1.6, 0], [c3 - 0.3, 1]], ang: [[c2, 0.4], [c3, 0.9]], dist: [[c2, 7], [c3, 8]], h: [[c2, 2], [c3, 2.6]], tx: [[c2, 0.5], [c3, 2.2]], ty: [[c2, 0.6], [c3, 0.8]], tz: [[c2, 1], [c3, 1.5]] }} />
      {/* The shed: the ice melts away. */}
      <Scene t0={c3} t1={c4} set={{ site: 1, ground: 0 }} anims={{ melt: [[c3, 0], [c4, 1]], ang: [[c3, 0.5], [c4, 0.1]], dist: [[c3, 8], [c4, 6]], h: [[c3, 2], [c4, 1.6]], ty: [[c3, 1], [c4, 0.8]] }} />
      {/* Cutaway of the hillside: dig the pit. */}
      <Scene t0={c4} t1={c5} set={{ ...W }} anims={{ dig: [[c4, 0], [c5, 1]], ang: [[c4, 0.5], [c5, 0.15]], dist: [[c4, 22], [c5, 24]], h: [[c4, 6], [c5, 3]], ty: [[c4, -2], [c5, -4.5]] }} />
      <Scene t0={c5} t1={c6} set={{ ...W, dig: 1 }} anims={{ ang: [[c5, -0.25], [c6, 0.0]], dist: [[c5, 11], [c6, 10]], h: [[c5, 1], [c6, 0]], ty: [[c5, -5], [c6, -6]] }} />
      <Scene t0={c6} t1={c7} set={{ ...W, dig: 1 }} anims={{ brick: [[c6, 0], [c6 + 2.6, 1]], ang: [[c6, 0.3], [c7, -0.25]], dist: [[c6, 24], [c7, 21]], h: [[c6, 2], [c7, 4]], ty: [[c6, -4.5], [c7, -4]] }}>
        <Card s={c6} t0={c6 + 0.6} t1={K("this is an")} title="UP TO 9 M DEEP" sub="HAMPTON COURT, 1625" />
        <Label s={c6} t0={K("this is an") + 0.1} t1={c7} text="ICE WELL" y={1500} />
      </Scene>
      <Scene t0={c7} t1={c8} set={{ ...W, dig: 1, brick: 1 }} anims={{ pool: [[c7, 0], [c8, 1]], ang: [[c7, -0.2], [c8, 0.1]], dist: [[c7, 9], [c8, 7.5]], h: [[c7, 1.5], [c8, 1]], ty: [[c7, -8], [c8, -8.2]] }} />
      <Scene t0={c8} t1={c9} set={{ ...W, dig: 1, brick: 1 }} anims={{ drain: [[c8, 0], [c8 + 0.8, 1]], pool: [[c8 + 0.6, 1], [c9, 0]], ang: [[c8, 0.2], [c9, 0.45]], dist: [[c8, 9], [c9, 11]], h: [[c8, 0.5], [c9, 0]], ty: [[c8, -9], [c9, -9.3]], tx: [[c8, 0.5], [c9, 1.8]] }} />
      {/* The open top, then the dome and earth. */}
      <Scene t0={c9} t1={c10} set={{ ...W, dig: 1, brick: 1, drain: 1 }} anims={{ ang: [[c9, 0.6], [c10, 0.3]], dist: [[c9, 10], [c10, 9]], h: [[c9, 8], [c10, 7]], ty: [[c9, -1], [c10, -1]] }} />
      <Scene t0={c10} t1={c11} set={{ ...W, dig: 1, brick: 1, drain: 1 }} anims={{ dome: [[c10, 0], [c10 + 1.4, 1]], earth: [[c10 + 1.6, 0], [K("this is the") - 0.2, 1]], ang: [[c10, -0.3], [c11, 0.2]], dist: [[c10, 20], [c11, 24]], h: [[c10, 3], [c11, 2]], ty: [[c10, -2], [c11, -3.5]] }}>
        <Label s={c10} t0={K("this is the") + 0.1} t1={c11} text="DOME AND CUP" y={1500} />
      </Scene>
      {/* Pack ice and straw. */}
      <Scene t0={c11} t1={c12} set={{ ...W, dig: 1, brick: 1, drain: 1, dome: 1, earth: 1, work: 1, px: -1.0, pz: 0.0 }} anims={{ ice: [[c11, 0], [c12 - 0.4, 1]], ang: [[c11, 0.25], [c12, -0.1]], dist: [[c11, 14], [c12, 12]], h: [[c11, -1], [c12, 1]], ty: [[c11, -6], [c12, -3]] }} />
      {/* The passage and its two sets of doors. */}
      <Scene t0={c12} t1={c13} set={{ ...W, dig: 1, brick: 1, drain: 1, dome: 1, earth: 1, ice: 1, px: -8.2, pz: 0.0 }} anims={{ pass: [[C("so you build"), 0], [c13 - 0.5, 1]], ang: [[c12, -0.15], [c13, 0.25]], dist: [[c12, 12], [c13, 10]], h: [[c12, 2], [c13, 3]], tx: [[c12, -3.5], [c13, -4.5]], ty: [[c12, 1.0], [c13, 1.0]] }} />
      {/* Outside: the finished ice house with the big house behind. */}
      <Scene t0={c13} t1={c14} set={{ ...W, dig: 1, brick: 1, drain: 1, dome: 1, earth: 1, ice: 1, pass: 1, cut: 0, px: -8.0, pz: 1.5 }} anims={{ ang: [[c13, -1.1], [c14, -0.6]], dist: [[c13, 16], [c14, 14]], h: [[c13, 3], [c14, 4]], tx: [[c13, -3], [c14, -4]], ty: [[c13, 1.5], [c14, 1.5]], tz: [[c13, -4], [c14, -5]] }}>
        <Card s={c13} t0={c13 + 0.2} t1={C("by the late")} title="1619" sub="GREENWICH PARK" />
        <Card s={c13} t0={C("and a full")} t1={c14} title="UP TO 18 MONTHS" sub="OF ICE IN ONE HOUSE" />
      </Scene>
      <Scene t0={c14} t1={DUR} set={{ ...W, dig: 1, brick: 1, drain: 1, dome: 1, earth: 1, ice: 1, pass: 1, cut: 0, px: -8.0, pz: 1.5 }} anims={{ ang: [[c14, -0.5], [DUR, 0.3]], dist: [[c14, 13], [DUR, 16]], h: [[c14, 4], [DUR, 6]], tx: [[c14, -2], [DUR, -2]], ty: [[c14, 1.5], [DUR, 1.5]], tz: [[c14, -3], [DUR, -4]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
