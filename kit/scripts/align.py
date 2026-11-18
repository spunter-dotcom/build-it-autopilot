# align.py ID: word timings for captions and cut points. Writes edit/words.json, prints duration and transcript.
import sys, json, subprocess
from faster_whisper import WhisperModel
S = f"/home/user/what-if/{sys.argv[1]}"
m = WhisperModel("small", device="cpu", compute_type="int8", download_root="/opt/whisper-models")
segs, _ = m.transcribe(f"{S}/voice.mp3", language="en", word_timestamps=True, beam_size=5)
words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
json.dump(words, open(f"{S}/edit/words.json", "w"))
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{S}/voice.mp3"], capture_output=True, text=True).stdout.strip()
print("voice seconds:", dur, "| words:", len(words))
print(" ".join(w["w"] for w in words))
