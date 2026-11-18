#!/bin/bash
# preview.sh ID t1 t2 t3 t4: build, then render up to 4 frames as small JPEGs (cheap to look at).
# Prints the seconds per frame, so you can check the render will fit (keep it under about 1.0 s on XL).
ID=$1; shift; S=/home/user/what-if/$ID; cd $S/edit || exit 1
higgsedit build edit.jsx > $S/build.log 2>&1 || { tail -30 $S/build.log; exit 1; }
grep -q '"diagnostics": \[\]' $S/build.log || { grep -A8 diagnostics $S/build.log | head -30; }
for t in "$@"; do
  s=$(date +%s%N)
  higgsedit frame . $t --out $S/prev/f$t.png > $S/frame.log 2>&1 || { tail -20 $S/frame.log; exit 1; }
  e=$(( ($(date +%s%N)-s)/1000000 ))
  ffmpeg -v error -y -i $S/prev/f$t.png -vf scale=360:640 -q:v 7 $S/prev/f$t.jpg
  echo "frame $t: ${e} ms -> $S/prev/f$t.jpg"
done
