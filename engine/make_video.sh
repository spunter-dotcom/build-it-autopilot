#!/usr/bin/env bash
# usage: engine/make_video.sh videos/<id> [stage]   stages: voice | qc | render | finish | all (default)
# Expects videos/<id>/script.json whose "topic" points at /topics/<id>.js inside engine/.
set -euo pipefail
ENG=$(cd "$(dirname "$0")" && pwd); V=$(cd "$1" && pwd); STAGE=${2:-all}; M=${MODELS:-$ENG/.models}
REL=$(python3 -c "import os,sys;print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$V" "$ENG")
mkdir -p "$V/qc"; [ -e "$ENG/v_$(basename "$V")" ] || ln -s "$V" "$ENG/v_$(basename "$V")"
SPEC="v_$(basename "$V")/spec.json"
if [[ $STAGE == voice || $STAGE == all ]]; then
  python3 "$ENG/pipeline/voice.py" "$V/script.json" "$V" --models "$M/kokoro" --voice "${VOICE:-am_fenrir}" --speed "${SPEED:-1.15}"
  python3 "$ENG/pipeline/make_spec.py" "$V"; fi
if [[ $STAGE == qc || $STAGE == all ]]; then
  (cd "$ENG" && node render.mjs "$SPEC" "$V/qc/f.mp4" --frames "$(cat "$V/qc_times.txt")")
  (cd "$V/qc" && rm -rf seq && mkdir seq && i=0 && for f in $(ls f_*.jpg | sort -t_ -k2 -g); do cp "$f" seq/$(printf %03d $i).jpg; i=$((i+1)); done && \
   ffmpeg -v error -y -i seq/%03d.jpg -vf "scale=240:426,tile=6x2:padding=4" sheet_%d.jpg); echo "QC sheets: $V/qc/sheet_*.jpg"; fi
if [[ $STAGE == render || $STAGE == all ]]; then
  (cd "$ENG" && node render.mjs "$SPEC" "$V/picture.mp4" > "$V/render.log" 2>&1); tail -1 "$V/render.log"; fi
if [[ $STAGE == finish || $STAGE == all ]]; then
  D=$(python3 -c "import json;print(json.load(open('$V/spec.json'))['duration'])")
  python3 "$ENG/pipeline/sound.py" "$V/narration.wav" "$V/picture.events.json" "$D" "$V/mix.wav"
  python3 "$ENG/pipeline/qc_audio.py" "$V/mix.wav" "$V/script.json" "$M/sherpa-onnx-whisper-base.en" | tee "$V/qc/audio.json"
  ffmpeg -v error -y -i "$V/picture.mp4" -i "$V/mix.wav" -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$V/final.part.mp4"
  mv "$V/final.part.mp4" "$V/final.mp4"
  ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact "$V/final.mp4"; fi
