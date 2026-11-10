"""make_spec.py — merge script.json + timing.json into the render spec, and list QC moments (2 per line + label pops)."""
import json, sys, os
V = sys.argv[1]; s = json.load(open(os.path.join(V, 'script.json'))); t = json.load(open(os.path.join(V, 'timing.json')))
spec = {"topic": s["topic"], "w": 720, "h": 1280, "fps": 30, "duration": t["duration"], "words": t["words"], "labels": t["labels"], "lines": t["lines"], "aiTag": True}
json.dump(spec, open(os.path.join(V, 'spec.json'), 'w'))
qc = []
for L in t["lines"].values():
    d = L["t1"] - L["t0"]; qc += [L["t0"] + 0.35 * d, L["t0"] + 0.85 * d]
qc += [l["t0"] + 0.35 for l in t["labels"]]
open(os.path.join(V, 'qc_times.txt'), 'w').write(','.join(f'{x:.2f}' for x in sorted(qc)))
print(f'spec ok: {t["duration"]:.1f}s, {len(qc)} QC moments')
