import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const GLSL = read("./lib.glsl") + read("./david.glsl");
const WORDS = JSON.parse(read("./words.json"));
const DUR = 66;
const CW = WORDS.map((w) => w.w.toLowerCase().replace(/[^a-z0-9']/g, ""));
const K = (s, n = 0) => { const t = s.split(" "); let c = 0;
  for (let i = 0; i + t.length <= CW.length; i++) if (t.every((x, j) => CW[i + j] === x)) { if (c === n) return WORDS[i].s; c++; }
  throw new Error("anchor " + s); };
const DEF = { ang: 0, dist: 12, h: 5, tx: 0, ty: 1, tz: 0, lens: 1.1, site: 0, lie: 0, carve: 0, flaw: 0, dirty: 0, pit: 0, claw: 0, gloss: 0, men: 0, manx: 1.55, tap: 0, taph: 1.1, tool: 1, slide: 0, mx: 0 };
const NAMES = Object.keys(DEF);

function Scene({ t0, t1, set = {}, anims = {}, children }) {
  const d = t1 - t0;
  const params = { glsl: GLSL };
  for (const k of NAMES) params[k] = set[k] !== undefined ? set[k] : DEF[k];
  const animate = [];
  for (const [k, kf] of Object.entries(anims)) {
    const keys = [];
    for (const [t, v] of kf) { const at = Math.min(Math.max(t - t0, 0), d - 0.01); if (keys.length && at <= keys[keys.length - 1].at + 0.001) { keys[keys.length - 1].value = v; continue; } keys.push({ at, value: v, easing: "ease-in-out" }); }
    params[k] = keys[0].value;
    if (keys.length >= 2) animate.push({ property: "effectParam", effectIndex: 0, effectParam: k, keyframes: keys });
  }
  return (
    <frame at={t0} duration={d} width={1080} height={1920} layout="none">
      <rect x={0} y={0} width={1080} height={1920} fill="#000000" effects={[{ kind: "shader", params }]} animate={animate} />
      {children}
    </frame>
  );
}
function Label({ s, t0, t1, text, y = 700, size = 54 }) {
  return (
    <frame at={t0 - s} duration={t1 - t0} width={1080} height={1920} layout="none">
      <text x={0} y={y} width={1080} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={size} color="#FFFFFF" letterSpacing={3}
        strokeColor="#1A140C" strokeWidth={5} shadow={{ x: 0, y: 4, blur: 10, color: "#000000AA" }}
        animate={[{ property: "opacity", from: 0, to: 1, at: 0, duration: 0.25, easing: "ease-out" }, { property: "scale", from: 0.8, to: 1, at: 0, duration: 0.3, easing: "ease-out" }]}>{text}</text>
    </frame>
  );
}
function Captions() {
  const nodes = [];
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i];
    const raw = w.w.replace(/[.,!?]/g, "");
    const t0 = w.s;
    const t1 = i + 1 < WORDS.length ? Math.max(WORDS[i + 1].s, w.e) : DUR - 0.05;
    const end = i + 1 < WORDS.length ? Math.min(t1, w.e + 0.5) : Math.min(w.e + 1.2, DUR - 0.05);
    nodes.push(
      <frame at={t0} duration={Math.max(end - t0, 0.12)} width={1080} height={1920} layout="none">
        <text x={40} y={960} width={1000} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={raw.length > 13 ? 76 : 92} color="#FFFFFF"
          strokeColor="#1A140C" strokeWidth={7} shadow={{ x: 0, y: 5, blur: 12, color: "#000000B0" }}
          animate={[{ property: "scale", from: 0.85, to: 1, at: 0, duration: 0.1, easing: "ease-out" }]}>{raw}</text>
      </frame>
    );
  }
  return <frame at={0} duration={DUR} width={1080} height={1920} layout="none">{nodes}</frame>;
}

export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FB2E5" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice.mp3");
  const c = (s, n = 0) => K(s, n) - 0.08;
  const cAll = c("all it has"), cCut = c("cut from"), cLeft = c("and left lying"), cBut1 = c("but the stone"), cTwo = c("two sculptors");
  const cTake = c("so you take"), cPick = c("you pick up"), aPoint = K("this is a point"), cKnock = c("so you knock"), cPits = c("but the point");
  const cSwitch = c("so you switch"), aClaw = K("this is a claw"), cComb = c("you comb"), cThin = c("but the block is"), cKeep = c("so you keep");
  const cFile = c("then you file"), aRasp = K("this is a rasp"), cPol = c("and you polish"), cGiant = c("but the giant"), cHang = c("so you hang");
  const aForty = K("and forty"), cDays = c("it takes"), cCon = c("congratulations");
  const ST = { ty: 2.1 };
  p.compose(
    <frame width={1080} height={1920} layout="none">
      <Scene t0={0} t1={cAll} set={{ site: 1, ty: 3.2, tz: 0.5 }} anims={{ ang: [[0, 0.9], [cAll, 0.45]], dist: [[0, 17], [cAll, 14]], h: [[0, 5], [cAll, 3]] }}>
        <Label s={0} t0={0.5} t1={cAll} text="FLORENCE · 1501" />
      </Scene>
      <Scene t0={cAll} t1={cCut} set={{ lie: 1, ty: 0.6 }} anims={{ ang: [[cAll, 0.75], [cCut, 0.3]], dist: [[cAll, 7.5], [cCut, 5.8]], h: [[cAll, 3.2], [cCut, 2.2]] }}>
        <Label s={cAll} t0={K("one tall")} t1={cCut} text="ONE BLOCK OF MARBLE" size={48} />
      </Scene>
      <Scene t0={cCut} t1={cLeft} set={{ site: 2, ty: 2.2, tz: -3 }} anims={{ slide: [[cCut, 0], [cCut + 0.4, 0], [cLeft, 1]], ang: [[cCut, -0.35], [cLeft, 0.25]], dist: [[cCut, 15], [cLeft, 12]], h: [[cCut, 3], [cLeft, 2.2]] }}>
        <Label s={cCut} t0={K("carrara") - 0.2} t1={cLeft} text="CARRARA" />
      </Scene>
      <Scene t0={cLeft} t1={cBut1} set={{ lie: 1, ty: 0.6 }} anims={{ dirty: [[cLeft, 0], [cBut1 - 0.3, 1]], ang: [[cLeft, -0.6], [cBut1, -0.15]], dist: [[cLeft, 6], [cBut1, 8]], h: [[cLeft, 1.6], [cBut1, 3.4]] }}>
        <Label s={cLeft} t0={K("twentyfive")} t1={cBut1} text="25 YEARS" />
      </Scene>
      <Scene t0={cBut1} t1={cTwo} set={{ lie: 1, dirty: 1, tx: 0.4, ty: 0.75, lens: 1.3 }} anims={{ flaw: [[cBut1, 0.3], [K("tiny"), 1]], ang: [[cBut1, 0.5], [cTwo, 0.15]], dist: [[cBut1, 2.6], [cTwo, 1.9]], h: [[cBut1, 1.2], [cTwo, 0.9]] }}>
        <Label s={cBut1} t0={K("tiny")} t1={cTwo} text="HOLES AND VEINS" y={560} />
      </Scene>
      <Scene t0={cTwo} t1={cTake} set={{ lie: 1, dirty: 1, flaw: 1, men: 2, ty: 0.7, tx: 1.2 }} anims={{ manx: [[cTwo, 2.9], [cTake, 5.2]], ang: [[cTwo, 0.2], [cTake, 0.5]], dist: [[cTwo, 6.5], [cTake, 7.5]], h: [[cTwo, 2.0], [cTake, 2.6]] }}>
        <Label s={cTwo} t0={K("left it")} t1={cTake} text="LEFT UNFINISHED" size={48} />
      </Scene>
      <Scene t0={cTake} t1={cPick} set={{ ...ST, men: 1, manx: 1.7, flaw: 0.6, dirty: 0.6 }} anims={{ ang: [[cTake, -0.5], [cPick, 0.35]], dist: [[cTake, 6.5], [cPick, 8.5]], h: [[cTake, 1.2], [cPick, 2.2]] }}>
        <Label s={cTake} t0={K("you are")} t1={cPick} text="AGE 26" />
      </Scene>
      <Scene t0={cPick} t1={cKnock} set={{ site: 3, tool: 1, ty: 0, tz: -0.3 }} anims={{ ang: [[cPick, -0.5], [cKnock, 0.3]], dist: [[cPick, 2.6], [cKnock, 2.1]], h: [[cPick, 2.6], [cKnock, 2.0]] }}>
        <Label s={cPick} t0={aPoint + 0.3} t1={cKnock} text="POINT CHISEL" y={600} />
      </Scene>
      <Scene t0={cKnock} t1={cPits} set={{ ...ST, men: 1, tap: 1, dirty: 0.3 }} anims={{ carve: [[cKnock, 0], [cKnock + 0.3, 0], [cPits - 0.4, 0.5]], pit: [[cKnock, 0], [cPits - 0.6, 1]], taph: [[cKnock, 1.3], [cPits, 0.8]], ang: [[cKnock, 0.6], [cPits, -0.2]], dist: [[cKnock, 8], [cPits, 6.8]], h: [[cKnock, 2.4], [cPits, 1.4]] }} />
      <Scene t0={cPits} t1={cSwitch} set={{ carve: 0.5, pit: 1, ty: 2.8, lens: 1.3 }} anims={{ ang: [[cPits, 0.5], [cSwitch, 0.2]], dist: [[cPits, 3.2], [cSwitch, 2.5]], h: [[cPits, 0.8], [cSwitch, 0.5]] }}>
        <Label s={cPits} t0={K("deep")} t1={cSwitch} text="DEEP PITS" y={560} />
      </Scene>
      <Scene t0={cSwitch} t1={cComb} set={{ site: 3, tool: 2, ty: 0 }} anims={{ ang: [[cSwitch, 0.5], [cComb, -0.3]], dist: [[cSwitch, 2.5], [cComb, 2.0]], h: [[cSwitch, 2.4], [cComb, 1.9]] }}>
        <Label s={cSwitch} t0={aClaw + 0.3} t1={cComb} text="CLAW CHISEL" y={600} />
      </Scene>
      <Scene t0={cComb} t1={cThin} set={{ ...ST, ty: 2.4 }} anims={{ carve: [[cComb, 0.5], [cThin - 0.3, 0.78]], pit: [[cComb, 1], [cThin - 0.8, 0]], claw: [[cComb, 0], [cComb + 1.2, 1]], ang: [[cComb, -0.55], [cThin, 0.3]], dist: [[cComb, 5.2], [cThin, 6.6]], h: [[cComb, 1.0], [cThin, 1.8]] }} />
      <Scene t0={cThin} t1={cKeep} set={{ ...ST, carve: 0.78, claw: 1 }} anims={{ ang: [[cThin, 1.25], [cKeep, 1.57]], dist: [[cThin, 8.5], [cKeep, 7.5]], h: [[cThin, 1.6], [cKeep, 1.2]] }}>
        <Label s={cThin} t0={K("no stone")} t1={cKeep} text="NO STONE TO SPARE" size={46} />
      </Scene>
      <Scene t0={cKeep} t1={cFile} set={{ ...ST, claw: 1 }} anims={{ carve: [[cKeep, 0.78], [cFile - 0.3, 0.92]], ang: [[cKeep, 1.57], [cFile, 0.75]], dist: [[cKeep, 7.5], [cFile, 7]], h: [[cKeep, 1.2], [cFile, 1.6]] }}>
        <Label s={cKeep} t0={K("slender")} t1={cFile} text="SLENDER" />
      </Scene>
      <Scene t0={cFile} t1={cPol} set={{ site: 3, tool: 3, ty: 0 }} anims={{ ang: [[cFile, -0.4], [cPol, 0.35]], dist: [[cFile, 2.6], [cPol, 2.1]], h: [[cFile, 2.5], [cPol, 1.9]] }}>
        <Label s={cFile} t0={aRasp + 0.3} t1={cPol} text="RASP" y={600} />
      </Scene>
      <Scene t0={cPol} t1={cGiant} set={{ ty: 3.0, lens: 1.25 }} anims={{ carve: [[cPol, 0.92], [cPol + 0.8, 1]], claw: [[cPol, 1], [cPol + 0.9, 0]], gloss: [[cPol, 0], [cGiant - 0.3, 1]], ang: [[cPol, -0.5], [cGiant, 0.4]], dist: [[cPol, 3.6], [cGiant, 4.4]], h: [[cPol, 0.4], [cGiant, 0.9]] }}>
        <Label s={cPol} t0={K("fine grit")} t1={cGiant} text="POLISHED" y={560} />
      </Scene>
      <Scene t0={cGiant} t1={cHang} set={{ ...ST, carve: 1, gloss: 1, men: 1, manx: 1.5 }} anims={{ ang: [[cGiant, 0.35], [cHang, -0.25]], dist: [[cGiant, 7], [cHang, 9]], h: [[cGiant, 1.0], [cHang, 1.8]] }}>
        <Label s={cGiant} t0={K("seventeen")} t1={K("half a mile")} text="17 FEET TALL" />
        <Label s={cGiant} t0={K("half a mile")} t1={cHang} text="HALF A MILE TO GO" size={48} />
      </Scene>
      <Scene t0={cHang} t1={cDays} set={{ site: 4, gloss: 1, ty: 2.5 }} anims={{ mx: [[cHang, 0], [cDays, 2.6]], tx: [[cHang, 0], [cDays, 2.6]], ang: [[cHang, 1.25], [cDays, 1.8]], dist: [[cHang, 8], [cDays, 10]], h: [[cHang, 2.0], [cDays, 3.4]] }}>
        <Label s={cHang} t0={K("wooden frame")} t1={aForty} text="WOODEN FRAME" />
        <Label s={cHang} t0={aForty + 0.2} t1={K("greased")} text="40 MEN" />
        <Label s={cHang} t0={K("greased")} t1={cDays} text="GREASED LOGS" />
      </Scene>
      <Scene t0={cDays} t1={cCon} set={{ site: 4, gloss: 1, ty: 2.2 }} anims={{ mx: [[cDays, 2.6], [cCon, 3.6]], tx: [[cDays, 3.2], [cCon, 4.0]], ang: [[cDays, 1.45], [cCon, 1.3]], dist: [[cDays, 13], [cCon, 11.5]], h: [[cDays, 0.9], [cCon, 1.3]] }}>
        <Label s={cDays} t0={K("four days")} t1={cCon} text="4 DAYS" />
      </Scene>
      <Scene t0={cCon} t1={DUR} set={{ site: 5, gloss: 1, ty: 3.0 }} anims={{ ang: [[cCon, -0.45], [DUR, 0.4]], dist: [[cCon, 7], [DUR, 10]], h: [[cCon, 0.6], [DUR, 1.6]] }}>
        <Label s={cCon} t0={K("sculpted")} t1={DUR} text="DAVID · FLORENCE, 1504" size={48} />
      </Scene>
      <Captions />
    </frame>,
    { at: 0, dur: DUR }
  );
  p.cut(voice, { at: 0 });
};
