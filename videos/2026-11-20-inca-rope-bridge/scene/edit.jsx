// edit.jsx: Inca grass-rope bridge timeline (from kit/template).
import { readFileSync } from "node:fs";
import { makeKit } from "./kit.jsx";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./parts.glsl") + read("./scene.glsl") + read("./render.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 69;

const def = { site: 0, bases: 0, cab: 0, haul: 0, sticks: 0, mats: 0, sway: 0, old: 0, fall: 0, work: 0, crowd: 0, walk: -30, cut: 0, cord: 0, stage: 0, snap: 0, six: 0 };
const { Scene, Label, Card, Captions, K, C } = makeKit({ glsl: GLSL, words: WORDS, dur: DUR, def });

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c1 = C("but all you have"), c2 = C("so you build two"), c3 = C("but stone alone"), c4 = C("so you cut"),
    c5 = C("you twist it"), c6 = C("but one cord"), c7 = C("so you twist the thin"), c8 = C("then you braid"),
    c9 = C("this is a main"), c10 = C("your neighbours"), c11 = C("some cables"), c12 = C("but the floor"),
    c13 = C("so you weave"), c14 = C("then you cover"), c15 = C("this is a suspension"), c16 = C("it stretches"),
    c17 = C("but grass"), c18 = C("so every june"), c19 = C("then they cut"), c20 = C("people have"),
    c21 = C("congratulations");
  const GORGE = { site: 0, bases: 1, ground: 0 };
  const BRIDGE = { ...GORGE, cab: 1, haul: 1, sticks: 1, mats: 1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={c1} set={{ site: 0, ty: -4, lens: 1.0 }} anims={{ ang: [[0, -1.3], [c1, -1.15]], dist: [[0, 26], [c1, 23]], h: [[0, 9], [c1, 7]] }} />
      <Scene t0={c1} t1={c2} set={{ site: 1, tz: 1, ty: 0.6 }} anims={{ ang: [[c1, 0.7], [c2, 0.35]], dist: [[c1, 10], [c2, 8]], h: [[c1, 2.5], [c2, 2]] }} />
      <Scene t0={c2} t1={c3} set={{ site: 0, work: 1, ty: 0.5 }} anims={{ bases: [[K("two stone"), 0], [K("one on") , 0.5], [K("cliff") + 0.3, 1]], tx: [[c2, -15], [c3, -11]], ang: [[c2, 0.8], [c3, 0.55]], dist: [[c2, 10], [c3, 14]], h: [[c2, 3], [c3, 5]] }} />
      <Scene t0={c3} t1={c4} set={{ ...GORGE, ty: -1, lens: 1.0 }} anims={{ tx: [[c3, -8], [c4, -4]], ang: [[c3, -1.4], [c4, -1.3]], dist: [[c3, 13], [c4, 17]], h: [[c3, 4], [c4, 5]] }} />
      <Scene t0={c4} t1={c5} set={{ site: 1, work: 1, tx: 0, ty: 0.7, tz: 1.3, lens: 1.3 }} anims={{ cut: [[K("mountain grass") + 0.2, 0], [K("called") + 0.5, 1]], ang: [[c4, 0.9], [c5, 0.6]], dist: [[c4, 5], [c5, 4]], h: [[c4, 1.2], [c5, 1.5]] }}>
        <Label s={c4} t0={K("called")} t1={c5} text="ICHU GRASS" />
      </Scene>
      <Scene t0={c5} t1={c6} set={{ site: 1, work: 1, cut: 1, ty: 0.3, tz: 2.6 }} anims={{ cord: [[K("twist"), 0], [c6 - 0.2, 1]], tx: [[c5, 0.5], [c6, 4.5]], ang: [[c5, 0.5], [c6, 0.2]], dist: [[c5, 7], [c6, 8]], h: [[c5, 2.5], [c6, 3]] }}>
        <Card s={c5} t0={K("70")} t1={c6} title="70 M" sub="EACH THIN CORD" />
      </Scene>
      <Scene t0={c6} t1={c7} set={{ site: 2, stage: 0, ty: 1.1, tz: 0.2, lens: 1.3 }} anims={{ snap: [[K("snaps"), 0], [K("snaps") + 0.25, 1]], ang: [[c6, 0.3], [c7, 0.15]], dist: [[c6, 3.2], [c7, 2.6]], h: [[c6, 0.6], [c7, 0.5]] }} />
      <Scene t0={c7} t1={c8} set={{ site: 2, stage: 1, work: 1, ty: 1.1, tz: 0.4, lens: 1.3 }} anims={{ ang: [[c7, -0.4], [c8, -0.15]], dist: [[c7, 3.4], [c8, 3]], h: [[c7, 1.0], [c8, 0.8]] }} />
      <Scene t0={c8} t1={c9} set={{ site: 2, stage: 2, work: 1, ty: 1.1, tz: 0.0, lens: 1.2 }} anims={{ ang: [[c8, 0.6], [c9, 0.35]], dist: [[c8, 4.2], [c9, 3.6]], h: [[c8, 1.2], [c9, 0.9]] }} />
      <Scene t0={c9} t1={c10} set={{ site: 2, stage: 2, ty: 1.1, tz: 1.0, lens: 1.2 }} anims={{ six: [[K("six"), 0], [c10 - 0.1, 1]], ang: [[c9, 0.15], [c10, 0.0]], dist: [[c9, 3.2], [c10, 4.6]], h: [[c9, 0.6], [c10, 1.8]] }}>
        <Label s={c9} t0={K("main cable")} t1={K("six")} text="MAIN CABLE" />
      </Scene>
      <Scene t0={c10} t1={c11} set={{ ...GORGE, cab: 4 / 6, crowd: 1, work: 1, ty: 0, lens: 1.0 }} anims={{ haul: [[K("haul"), 0], [K("tie") + 0.4, 1]], tx: [[c10, -6], [c11, -2]], ang: [[c10, -1.35], [c11, -1.2]], dist: [[c10, 17], [c11, 17]], h: [[c10, 4], [c11, 4.5]] }} />
      <Scene t0={c11} t1={c12} set={{ ...GORGE, haul: 1, crowd: 1, tx: -9, ty: 0 }} anims={{ cab: [[K("the others") - 0.1, 4 / 6], [K("handrails") + 0.2, 1]], ang: [[c11, 0.9], [c12, 0.7]], dist: [[c11, 7], [c12, 6]], h: [[c11, 2.5], [c12, 2.2]] }} />
      <Scene t0={c12} t1={c13} set={{ ...GORGE, cab: 1, haul: 1, ty: 0 }} anims={{ sway: [[c12, 0], [K("sways"), 1]], ang: [[c12, -1.15], [c13, -1.25]], dist: [[c12, 18], [c13, 15]], h: [[c12, 3], [c13, 2.5]] }} />
      <Scene t0={c13} t1={c14} set={{ ...GORGE, cab: 1, haul: 1, ty: 0 }} anims={{ sticks: [[K("weave"), 0], [c14, 1]], sway: [[c13, 1], [c14, 0]], tx: [[c13, -9], [c14, 0]], ang: [[c13, 0.7], [c14, 0.6]], dist: [[c13, 6], [c14, 6]], h: [[c13, 3], [c14, 3.2]] }} />
      <Scene t0={c14} t1={c15} set={{ ...GORGE, cab: 1, haul: 1, sticks: 1, ty: -0.3 }} anims={{ mats: [[K("cover"), 0], [c15 - 0.2, 1]], tx: [[c14, -10], [c15, 2]], ang: [[c14, 0.4], [c15, 0.5]], dist: [[c14, 5], [c15, 5]], h: [[c14, 4.5], [c15, 4]] }} />
      <Scene t0={c15} t1={c16} set={{ ...BRIDGE, crowd: 1, ty: -1, lens: 1.0 }} anims={{ ang: [[c15, -0.95], [c16, -1.15]], dist: [[c15, 28], [c16, 25]], h: [[c15, 7], [c16, 5]] }}>
        <Label s={c15} t0={K("suspension")} t1={c16} text="SUSPENSION BRIDGE" />
      </Scene>
      <Scene t0={c16} t1={c17} set={{ ...BRIDGE, ty: -4 }} anims={{ ang: [[c16, 0.2], [c17, 0.0]], dist: [[c16, 22], [c17, 18]], h: [[c16, -9], [c17, -8]] }}>
        <Card s={c16} t0={K("stretches") + 0.2} t1={c17} title="28 M" sub="APURÍMAC RIVER, PERU" />
      </Scene>
      <Scene t0={c17} t1={c18} set={{ ...BRIDGE, ty: -0.2, tx: 3, lens: 1.3 }} anims={{ ang: [[c17, 0.9], [c18, 1.15]], dist: [[c17, 4], [c18, 3.4]], h: [[c17, 1.6], [c18, 1.3]] }} />
      <Scene t0={c18} t1={c19} set={{ ...GORGE, old: 1, crowd: 1, work: 1, ty: 0, lens: 1.0 }} anims={{ cab: [[K("june"), 0], [K("rebuild"), 1]], haul: [[K("rebuild") - 0.3, 0], [K("days"), 1]], sticks: [[K("days") - 0.3, 0], [c19 - 0.1, 1]], tx: [[c18, -3], [c19, 0]], ang: [[c18, -1.3], [c19, -1.2]], dist: [[c18, 24], [c19, 22]], h: [[c18, 7], [c19, 6]] }}>
        <Card s={c18} t0={K("june") + 0.1} t1={c19} title="EVERY JUNE" sub="4 COMMUNITIES, 3 DAYS" />
      </Scene>
      <Scene t0={c19} t1={c20} set={{ ...BRIDGE, old: 1, crowd: 1, ty: -3, lens: 1.0 }} anims={{ fall: [[K("loose") - 0.2, 0], [K("into the river") + 0.3, 1]], ang: [[c19, -1.3], [c20, -1.2]], dist: [[c19, 24], [c20, 22]], h: [[c19, 5], [c20, 4]] }} />
      <Scene t0={c20} t1={c21} set={{ ...BRIDGE, crowd: 1, ty: 0, lens: 1.2 }} anims={{ walk: [[c20, -12], [c21, -7]], tx: [[c20, -12], [c21, -7]], ang: [[c20, 1.1], [c21, 0.9]], dist: [[c20, 8], [c21, 7]], h: [[c20, 2], [c21, 1.8]] }}>
        <Card s={c20} t0={K("500")} t1={c21} title="500 YEARS" sub="AN INCA TRADITION" />
      </Scene>
      <Scene t0={c21} t1={DUR} set={{ ...BRIDGE, crowd: 1, ty: 0 }} anims={{ walk: [[c21, -7], [DUR, 1]], tx: [[c21, -6], [DUR, 0]], ang: [[c21, -0.9], [DUR, -1.2]], dist: [[c21, 10], [DUR, 28]], h: [[c21, 3], [DUR, 9]] }} />
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
