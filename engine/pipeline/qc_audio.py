"""qc_audio.py — automatic listening test: transcribe the final mix with an offline Whisper model and compare
it with the script. Fails (exit 1) if the word error rate is too high (garbled TTS, voice buried under music, etc).
  python3 qc_audio.py mix.wav script.json WHISPER_MODEL_DIR [--max-wer 0.15]
"""
import sys, json, re, argparse, difflib
import numpy as np, librosa, sherpa_onnx

def norm(s):
    s = s.lower().replace('-', ' ')
    s = re.sub(r"[^a-z0-9' ]", ' ', s)
    return [w for w in s.split() if w]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('mix'); ap.add_argument('script'); ap.add_argument('model'); ap.add_argument('--max-wer', type=float, default=0.15)
    a = ap.parse_args()
    y, sr = librosa.load(a.mix, sr=16000, mono=True)
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{a.model}/base.en-encoder.int8.onnx", decoder=f"{a.model}/base.en-decoder.int8.onnx",
                                                     tokens=f"{a.model}/base.en-tokens.txt", language="en", task="transcribe", num_threads=2)
    hop = 320; rms = librosa.feature.rms(y=y, frame_length=640, hop_length=hop)[0]
    cuts, t, dur = [0], 20.0, len(y) / sr
    while t < dur - 5:
        i0, i1 = int((t - 4) * sr / hop), int((t + 4) * sr / hop); i = i0 + int(np.argmin(rms[i0:i1])); cuts.append(i * hop); t = i * hop / sr + 20.0
    cuts.append(len(y)); hyp = []
    for s0, s1 in zip(cuts[:-1], cuts[1:]):
        st = rec.create_stream(); st.accept_waveform(sr, y[s0:s1]); rec.decode_stream(st); hyp += norm(st.result.text)
    ref = norm(' '.join(l['text'] for l in json.load(open(a.script))['lines']))
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False); errs = 0
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != 'equal': errs += max(i2 - i1, j2 - j1)
    wer = errs / max(1, len(ref))
    print(json.dumps({'wer': round(wer, 3), 'ref_words': len(ref), 'hyp_words': len(hyp), 'pass': wer <= a.max_wer}))
    bad = [(' '.join(ref[i1:i2]), ' '.join(hyp[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    for r, h in bad[:15]: print(f'  expected "{r}" heard "{h}"')
    sys.exit(0 if wer <= a.max_wer else 1)

if __name__ == '__main__':
    main()
