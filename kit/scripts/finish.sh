#!/bin/bash
# finish.sh ID 'UPLOAD_URL': join r1..r5, set loudness (about -14 LUFS, true peak kept under -1.2 dB),
# check 1080x1920 + audio + length, save 3 check frames, then PUT the file to the Higgsfield upload URL.
set -e
ID=$1; URL=$2; S=/home/user/what-if/$ID; cd $S/edit/renders
for n in 1 2 3 4 5; do [ -f r$n.mp4 ] || { echo "missing r$n.mp4"; exit 1; }; done
printf "file 'r%s.mp4'\n" 1 2 3 4 5 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy final.mp4
M=$(ffmpeg -i final.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12)
I=$(echo "$M" | awk '/I:/{print $2}' | tail -1); P=$(echo "$M" | awk '/Peak:/{print $2}' | tail -1)
G=$(awk -v i="$I" -v p="$P" 'BEGIN{g=-14-i; m=-1.2-p; if(g>m)g=m; printf "%.2f",g}')
ffmpeg -v error -y -i final.mp4 -c:v copy -af volume=${G}dB -c:a aac -b:a 192k out.mp4
L=$(ffmpeg -i out.mp4 -af ebur128 -f null - 2>&1 | tail -12 | awk '/I:/{print $2}' | tail -1)
ffprobe -v error -show_entries stream=codec_type,width,height:format=duration -of compact out.mp4
echo "loudness $L LUFS (gain ${G} dB)"
for t in 5 30 55; do ffmpeg -v error -y -ss $t -i out.mp4 -frames:v 1 -vf scale=360:640 -q:v 7 $S/prev/out$t.jpg; done
curl -sS -f -X PUT -H "Content-Type: video/mp4" --upload-file out.mp4 "$URL" -o /dev/null -w "upload HTTP %{http_code}\n"
