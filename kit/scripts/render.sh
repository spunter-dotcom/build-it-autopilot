#!/bin/bash
# render.sh ID N: render part N of 5 (each part is DUR/5 seconds). Run with sandbox_exec background:true, size xl.
# Writes renders/rN.mp4 and S/rN.status ("exit 0 secs 640" when done).
ID=$1; N=$2; S=/home/user/what-if/$ID; cd $S/edit || exit 1
DUR=$(grep -oP 'const DUR = \K[0-9.]+' edit.jsx)
A=$(python3 -c "print(round($DUR*($N-1)/5,3))"); B=$(python3 -c "print(round($DUR*$N/5,3))")
while pgrep -f "higgsedit render" > /dev/null; do sleep 20; done
rm -f $S/r$N.status; s=$(date +%s)
higgsedit render . --bitrate 8M --range $A:$B --out renders/r$N.mp4 > $S/r$N.log 2>&1
echo "exit $? secs $(( $(date +%s)-s ))" > $S/r$N.status
cat $S/r$N.status
