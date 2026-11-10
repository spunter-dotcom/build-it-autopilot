#!/usr/bin/env bash
# One-shot environment setup for a fresh cloud session (~2-3 min). Everything comes from PyPI, npm or GitHub releases.
set -euo pipefail
ENG=$(cd "$(dirname "$0")" && pwd); M=${MODELS:-$ENG/.models}; mkdir -p "$M/kokoro"
pip install --break-system-packages -q kokoro-onnx soundfile librosa sherpa-onnx scipy >/dev/null 2>&1
(cd "$ENG" && npm install --silent >/dev/null 2>&1)
dl() { [ -s "$2" ] || curl -sSfL --retry 3 -o "$2" "$1"; }
dl https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx "$M/kokoro/kokoro-v1.0.int8.onnx"
dl https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin "$M/kokoro/voices-v1.0.bin"
if [ ! -d "$M/sherpa-onnx-whisper-base.en" ]; then
  dl https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-base.en.tar.bz2 "$M/whisper.tar.bz2" && tar xjf "$M/whisper.tar.bz2" -C "$M" && rm "$M/whisper.tar.bz2"
fi
echo "setup ok"
