#!/bin/bash
# setup.sh ID: create /home/user/what-if/ID/edit with the newest kit, plus any saved scene files from the repo.
set -e
ID=$1; S=/home/user/what-if/$ID; R=/home/user/bia
if [ -d $R/.git ]; then git -C $R pull -q --ff-only; else git clone -q --depth 1 https://github.com/spunter-dotcom/build-it-autopilot $R; fi
mkdir -p $S/edit/renders $S/prev
cp $R/kit/lib.glsl $R/kit/parts.glsl $R/kit/render.glsl $R/kit/kit.jsx $S/edit/
V=$R/videos/$ID/scene
if [ -d $V ]; then cp $V/edit.jsx $V/scene.glsl $V/words.json $S/edit/ 2>/dev/null || true; fi
[ -f $S/edit/edit.jsx ] || cp $R/kit/template/edit.jsx $R/kit/template/scene.glsl $S/edit/
if [ ! -f $S/voice.mp3 ] && [ -f $V/voice_url.txt ]; then curl -sfL -o $S/voice.mp3 "$(cat $V/voice_url.txt)"; fi
echo "ready: $S"; ls $S $S/edit
