"""voice.py — script JSON -> narration.wav + timing.json (word-level timings for captions & animation beats).
Free & offline: Kokoro-82M (Apache-2.0) via kokoro-onnx. Usage:
  python3 voice.py script.json outdir --models MODELDIR [--voice am_fenrir] [--speed 1.15]
"""
import argparse, json, re, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

def syllables(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    if not w: return 1
    if w.isdigit(): return 2
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups) - (1 if w.endswith("e") and len(groups) > 1 and not w.endswith("le") else 0)
    return max(1, n)

def rms_env(y, sr, hop=0.01):
    h = int(sr * hop); n = len(y) // h
    return np.sqrt(np.mean(y[: n * h].reshape(n, h) ** 2, axis=1) + 1e-12), hop

def trim(y, sr, thr_db=-42):
    env, hop = rms_env(y, sr); db = 20 * np.log10(env / (env.max() + 1e-9) + 1e-9)
    idx = np.where(db > thr_db)[0]
    if len(idx) == 0: return y
    a = max(0, int((idx[0] - 2) * hop * sr)); b = min(len(y), int((idx[-1] + 3) * hop * sr))
    return y[a:b]

def word_times(text, y, sr):
    """Estimate word boundaries: syllable/punctuation-weighted split, snapped to energy dips."""
    words = text.split()
    w8 = []
    for w in words:
        s = syllables(w) + 0.35
        pause = 1.3 if w.endswith((",", ";", ":")) else 2.2 if w.endswith((".", "?", "!")) else 0.0
        w8.append((s, pause))
    total = sum(s + p for s, p in w8); dur = len(y) / sr
    env, hop = rms_env(y, sr)
    t, bounds = 0.0, []
    for i, (s, p) in enumerate(w8):
        start = t; t += s / total * dur; end = t; t += p / total * dur
        bounds.append([start, end])
    # snap internal starts to the lowest-energy point within +-90 ms
    for i in range(1, len(bounds)):
        c = bounds[i][0]; a, b = int((c - 0.09) / hop), int((c + 0.09) / hop)
        a, b = max(0, a), min(len(env) - 1, b)
        if b > a: bounds[i][0] = (a + int(np.argmin(env[a:b]))) * hop
    out = []
    for i, w in enumerate(words):
        t0 = bounds[i][0]; t1 = bounds[i + 1][0] if i + 1 < len(words) else dur
        out.append({"w": w, "t0": round(t0, 3), "t1": round(t1, 3)})
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("outdir"); ap.add_argument("--models", required=True)
    ap.add_argument("--voice", default="am_fenrir"); ap.add_argument("--speed", type=float, default=1.15); ap.add_argument("--gap", type=float, default=0.14)
    a = ap.parse_args(); os.makedirs(a.outdir, exist_ok=True)
    script = json.load(open(a.script))
    k = Kokoro(os.path.join(a.models, "kokoro-v1.0.int8.onnx"), os.path.join(a.models, "voices-v1.0.bin"))
    sr = 24000; parts = []; lines = {}; words_all = []; labels = []; t = 0.25
    parts.append(np.zeros(int(0.25 * sr), np.float32))
    for L in script["lines"]:
        y, sr = k.create(L["text"], voice=a.voice, speed=a.speed, lang="en-us")
        y = trim(y.astype(np.float32), sr)
        ws = word_times(L["text"], y, sr)
        for w in ws:
            disp = re.sub(r"[^\w'\-]", "", w["w"]); disp = disp[:1].upper() + disp[1:]
            words_all.append({"w": disp, "t0": round(t + w["t0"], 3), "t1": round(t + w["t1"], 3), "line": L["id"]})
        lines[L["id"]] = {"t0": round(t, 3), "t1": round(t + len(y) / sr, 3), "words": [dict(w, t0=round(t + w["t0"], 3), t1=round(t + w["t1"], 3)) for w in ws]}
        if L.get("label"):
            lw = [w for w in lines[L["id"]]["words"] if re.sub(r"[^\w]", "", w["w"]).lower() == L["label"]["word"]]
            if lw: labels.append({"text": L["label"]["text"], "t0": lw[-1]["t0"], "t1": round(t + len(y) / sr + 0.9, 3)})
        parts.append(y); parts.append(np.zeros(int(a.gap * sr), np.float32)); t += len(y) / sr + a.gap
    # hold last word on screen a bit
    words_all[-1]["t1"] = round(words_all[-1]["t1"] + 0.6, 3)
    parts.append(np.zeros(int(1.6 * sr), np.float32))
    audio = np.concatenate(parts); sf.write(os.path.join(a.outdir, "narration.wav"), audio, sr)
    dur = len(audio) / sr
    n_words = sum(len(L["text"].split()) for L in script["lines"])
    json.dump({"duration": round(dur, 3), "words": words_all, "labels": labels, "lines": lines, "voice": a.voice, "speed": a.speed,
               "wpm": round(n_words / (dur / 60), 1)}, open(os.path.join(a.outdir, "timing.json"), "w"), indent=1)
    print(f"narration {dur:.1f}s, {n_words} words, {n_words / (dur / 60):.0f} wpm, {len(labels)} labels")

if __name__ == "__main__":
    main()
