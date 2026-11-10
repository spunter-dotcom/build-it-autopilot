"""sound.py — free, fully synthetic sound design: SFX from scene events, a soft music bed, wind ambience,
ducking under the narration, and loudness normalisation. Nothing licensed, nothing downloaded.
  python3 sound.py narration.wav events.json duration out.wav [--seed N] [--key A]
"""
import sys, json, argparse
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)

def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def band(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return signal.lfilter(b, a, x)

def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)

def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)

def noise(n): return rng.standard_normal(n)

def sweep(f0, f1, dur, shape='exp'):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur) if shape == 'exp' else np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def sfx(kind):
    p = 2 ** (rng.uniform(-0.25, 0.25))  # small pitch variation
    if kind == 'thud':
        n = int(0.45 * SR); body = sweep(120 * p, 48, 0.45) * env(n, 0.001, 0.12)
        knock = band(noise(int(0.05 * SR)), 250, 1100) * env(int(0.05 * SR), 0.0005, 0.012)
        out = body * 0.9; out[:len(knock)] += knock * 0.7; return out
    if kind == 'clack':
        n = int(0.12 * SR); click = band(noise(n), 1200 * p, 4200 * p) * env(n, 0.0003, 0.012)
        thump = sweep(190 * p, 90, 0.12) * env(n, 0.001, 0.03); return click * 0.6 + thump * 0.5
    if kind == 'click':
        n = int(0.06 * SR); tick = hp(noise(n), 3000) * env(n, 0.0002, 0.004)
        ping = np.sin(2 * np.pi * 2100 * p * np.arange(n) / SR) * env(n, 0.0005, 0.012); return tick * 0.8 + ping * 0.35
    if kind == 'scrape':
        n = int(0.32 * SR); g = np.clip(lp(np.abs(noise(n)), 30), 0, None); g /= g.max() + 1e-9
        return band(noise(n), 500, 2600) * env(n, 0.03, 0.12) * (0.4 + g) * 0.6
    if kind == 'rumble':
        n = int(1.4 * SR); t = np.arange(n) / SR; e = np.sin(np.pi * np.clip(t / 1.4, 0, 1)) ** 1.5
        return lp(noise(n), 160, 3) * e * 2.2 + band(noise(n), 300, 900) * e * 0.15
    if kind == 'creak':
        n = int(0.55 * SR); t = np.arange(n) / SR; f = 210 * p + 35 * np.sin(2 * np.pi * 3.2 * t) + rng.uniform(-8, 8)
        saw = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR); e = np.sin(np.pi * t / 0.55) ** 2
        return band(saw, 300, 1800) * e * 0.25
    if kind == 'whoosh':
        n = int(0.7 * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n); seg = 512
        for i in range(0, n, seg):
            c = 300 * (9 ** (i / n)); out[i:i + seg] = band(x[i:i + seg], c * 0.7, c * 1.6, 1)[:len(out[i:i + seg])]
        return out * np.sin(np.pi * t / 0.7) ** 2 * 1.4
    if kind == 'splash':
        n = int(1.0 * SR); t = np.arange(n) / SR
        out = lp(noise(n), 3500) * env(n, 0.002, 0.18) * 0.9
        for _ in range(14):  # bubbles
            st = int(rng.uniform(0.05, 0.7) * SR); m = int(0.05 * SR)
            if st + m < n: out[st:st + m] += sweep(rng.uniform(500, 1400), rng.uniform(1500, 2600), 0.05) * env(m, 0.001, 0.015) * 0.25
        return out
    if kind == 'rustle':
        n = int(1.3 * SR); g = (rng.random(n) < 0.004).astype(float); g = lp(g, 40) * 60
        return hp(noise(n), 2500) * np.clip(g, 0, 1) * np.sin(np.pi * np.arange(n) / n) * 0.5
    if kind == 'hop':
        n = int(0.07 * SR); return sweep(320 * p, 140, 0.07) * env(n, 0.001, 0.02) * 0.6
    if kind == 'plop':
        n = int(0.16 * SR); return sweep(1100 * p, 280, 0.16) * env(n, 0.001, 0.05) * 0.8
    if kind == 'slide':
        n = int(0.6 * SR); t = np.arange(n) / SR; return band(noise(n), 500, 1500) * np.sin(np.pi * t / 0.6) * 0.45
    if kind == 'pour':
        n = int(2.6 * SR); out = np.zeros(n)
        for _ in range(240):
            st = int(rng.uniform(0, 2.5) * SR); m = int(0.02 * SR); out[st:st + m] += band(noise(m), 1500, 5000) * env(m, 0.0002, 0.004) * rng.uniform(0.2, 0.6)
        return out * 0.8
    if kind == 'pop':
        n = int(0.09 * SR); return sweep(500 * p, 900, 0.09) * env(n, 0.001, 0.03) * 0.4
    return np.zeros(10)

def karplus(freq, dur, bright=0.5):
    n = int(dur * SR); N = int(SR / freq); x = np.zeros(n); x[:N] = lp(rng.uniform(-1, 1, N), 1500 + 3000 * bright, 1)
    a = np.zeros(N + 2); a[0] = 1; a[N] = a[N + 1] = -0.4985  # comb-filter Karplus-Strong
    return signal.lfilter([1.0], a, x)

def music(duration, key='A'):
    """Gentle pad + plucked arpeggio, ~92 BPM, Am-F-C-G (or transposed)."""
    base = {'A': 220.0, 'C': 261.63, 'D': 293.66, 'G': 196.0, 'E': 164.81}[key]
    semis = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]  # i, VI, III, VII in minor
    n = int(duration * SR); out = np.zeros(n); bar = 60 / 92 * 4; t = np.arange(n) / SR
    pad = np.zeros(n)
    for k in range(int(duration / bar) + 1):
        ch = semis[k % 4]; s0 = int(k * bar * SR); s1 = min(n, int((k + 1) * bar * SR) + int(0.4 * SR))
        if s0 >= n: break
        tt = np.arange(s1 - s0) / SR; e = np.minimum(1, tt / 0.8) * np.minimum(1, (s1 - s0) / SR - tt) ** 0.5
        for st in ch:
            f = base * 2 ** (st / 12) / 2
            for det in (-0.08, 0.0, 0.08):
                pad[s0:s1] += np.sin(2 * np.pi * f * 2 ** (det / 12) * tt + rng.uniform(0, 6)) * e * 0.06
        # arpeggio: 8 eighth notes per bar
        pat = [0, 1, 2, 1, 0, 2, 1, 2]
        for j, idx in enumerate(pat):
            st = ch[idx] + (12 if j in (2, 5) else 0); f = base * 2 ** (st / 12)
            a = int((k * bar + j * bar / 8) * SR); note = karplus(f, 0.9, 0.35) * (0.16 if j % 2 == 0 else 0.11)
            if a < n: out[a:a + len(note)] += note[: n - a]
    pad = lp(pad, 1800)
    return out + pad

def ambience(duration):
    n = int(duration * SR); b = np.cumsum(noise(n)); b = hp(b, 20); b /= np.abs(b).max() + 1e-9
    t = np.arange(n) / SR; am = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t) * np.sin(2 * np.pi * 0.023 * t + 1)
    wind = lp(b, 700) * am
    birds = np.zeros(n)
    for _ in range(int(duration / 6)):
        st = int(rng.uniform(0, duration - 1) * SR)
        for c in range(rng.integers(2, 5)):
            m = int(0.09 * SR); a = st + c * int(0.13 * SR)
            if a + m < n: birds[a:a + m] += sweep(rng.uniform(3200, 4200), rng.uniform(4500, 6000), 0.09) * np.sin(np.pi * np.arange(m) / m) ** 2 * 0.08
    return wind * 0.5 + birds

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('narration'); ap.add_argument('events'); ap.add_argument('duration', type=float); ap.add_argument('out')
    ap.add_argument('--key', default='A'); a = ap.parse_args()
    v, vsr = sf.read(a.narration); v = v if v.ndim == 1 else v.mean(1)
    v = signal.resample_poly(v, SR, vsr) if vsr != SR else v
    n = int(a.duration * SR); voice = np.zeros(n); voice[: min(n, len(v))] = v[:n]
    voice = hp(voice, 70); voice /= np.abs(voice).max() + 1e-9
    fx = np.zeros(n)
    for e in json.load(open(a.events)):
        s = sfx(e['type']) * e.get('gain', 1); st = int(e['t'] * SR)
        if st < n: fx[st:st + len(s)] += s[: n - st]
    mus = music(a.duration, a.key); mus = mus[:n] if len(mus) >= n else np.pad(mus, (0, n - len(mus)))
    amb = ambience(a.duration)
    # duck music under voice
    ve = lp(np.abs(voice), 6); ve /= ve.max() + 1e-9; duck = 1 - 0.55 * np.clip(ve * 4, 0, 1)
    def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
    vr = rms(voice[voice != 0]) if np.any(voice) else 0.1
    mix = voice + fx / (np.abs(fx).max() + 1e-9) * 0.55 + mus / (rms(mus) + 1e-9) * vr * 0.16 * duck + amb / (rms(amb) + 1e-9) * vr * 0.05
    # fade in/out
    f = int(0.4 * SR); mix[:f] *= np.linspace(0, 1, f); mix[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
    mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
    sf.write(a.out, np.stack([mix, mix], 1).astype(np.float32), SR)
    print('wrote', a.out, f'{a.duration:.1f}s')

if __name__ == '__main__':
    main()
