// Build-it kit: timeline components shared by every video. edit.jsx imports makeKit from here.
// Camera and look params every scene has (see render.glsl). A video adds its own params in `def`.
export const KIT_DEF = { ang: 0, dist: 10, h: 3, tx: 0, ty: 1, tz: 0, lens: 1.1, ground: 0, night: 0 };

export function makeKit({ glsl, words, dur, def = {} }) {
  const DEF = { ...KIT_DEF, ...def };
  const NAMES = Object.keys(DEF);
  const CW = words.map((w) => w.w.toLowerCase().replace(/[^a-z0-9']/g, ""));
  // K("so you fell") = start time of that phrase in the voiceover (n = which occurrence, from 0).
  const K = (s, n = 0) => {
    const t = s.toLowerCase().split(" ");
    let c = 0;
    for (let i = 0; i + t.length <= CW.length; i++)
      if (t.every((x, j) => CW[i + j] === x)) { if (c === n) return words[i].s; c++; }
    throw new Error("anchor not found in words.json: " + s);
  };
  // Cut point: a scene change just before the phrase starts.
  const C = (s, n = 0) => Math.max(K(s, n) - 0.08, 0);

  // One shot. set = fixed params, anims = { param: [[time, value], ...] } in global seconds.
  function Scene({ t0, t1, set = {}, anims = {}, children }) {
    const d = t1 - t0;
    const params = { glsl };
    for (const k of NAMES) params[k] = set[k] !== undefined ? set[k] : DEF[k];
    const animate = [];
    for (const [k, kf] of Object.entries(anims)) {
      if (!(k in DEF)) throw new Error("unknown scene param " + k + " (add it to def)");
      const keys = [];
      for (const [t, v] of kf) {
        const at = Math.min(Math.max(t - t0, 0), d - 0.01);
        if (keys.length && at <= keys[keys.length - 1].at + 0.001) { keys[keys.length - 1].value = v; continue; }
        keys.push({ at, value: v, easing: "ease-in-out" });
      }
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
  // Yellow-free ALL-CAPS naming label. Times are global; s = the parent Scene's t0.
  function Label({ s, t0, t1, text, y = 700, size = 54 }) {
    return (
      <frame at={t0 - s} duration={Math.max(t1 - t0, 0.2)} width={1080} height={1920} layout="none">
        <text x={0} y={y} width={1080} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={size} color="#FFFFFF" letterSpacing={3}
          strokeColor="#1A140C" strokeWidth={5} shadow={{ x: 0, y: 4, blur: 10, color: "#000000AA" }}
          animate={[{ property: "opacity", from: 0, to: 1, at: 0, duration: 0.25, easing: "ease-out" }, { property: "scale", from: 0.8, to: 1, at: 0, duration: 0.3, easing: "ease-out" }]}>{text}</text>
      </frame>
    );
  }
  // Fact card: dark panel with a title and a gold subtitle (dates, places, numbers).
  function Card({ s, t0, t1, title, sub, y = 260 }) {
    const d = Math.max(t1 - t0, 0.6);
    return (
      <frame at={t0 - s} duration={d} width={1080} height={1920} layout="none">
        <rect x={150} y={y} width={780} height={sub ? 190 : 130} radius={22} fill="#1A140CCC"
          animate={[{ property: "opacity", from: 0, to: 1, at: 0, duration: 0.3, easing: "ease-out" }]} />
        <text x={150} y={y + 34} width={780} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={58} color="#FFFFFF" letterSpacing={2}
          animate={[{ property: "opacity", from: 0, to: 1, at: 0.1, duration: 0.3, easing: "ease-out" }]}>{title}</text>
        {sub ? <text x={150} y={y + 112} width={780} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={38} color="#F2B544"
          animate={[{ property: "opacity", from: 0, to: 1, at: 0.3, duration: 0.3, easing: "ease-out" }]}>{sub}</text> : null}
      </frame>
    );
  }
  // One word at a time, centred, from words.json.
  function Captions() {
    const nodes = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const raw = w.w.replace(/[.,!?;:]/g, "");
      const t0 = w.s;
      const nxt = i + 1 < words.length ? Math.max(words[i + 1].s, w.e) : dur - 0.05;
      const end = i + 1 < words.length ? Math.min(nxt, w.e + 0.5) : Math.min(w.e + 1.2, dur - 0.05);
      nodes.push(
        <frame at={t0} duration={Math.max(end - t0, 0.12)} width={1080} height={1920} layout="none">
          <text x={40} y={960} width={1000} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={raw.length > 13 ? 76 : 92} color="#FFFFFF"
            strokeColor="#1A140C" strokeWidth={7} shadow={{ x: 0, y: 5, blur: 12, color: "#000000B0" }}
            animate={[{ property: "scale", from: 0.85, to: 1, at: 0, duration: 0.1, easing: "ease-out" }]}>{raw}</text>
        </frame>
      );
    }
    return <frame at={0} duration={dur} width={1080} height={1920} layout="none">{nodes}</frame>;
  }
  return { Scene, Label, Card, Captions, K, C };
}
