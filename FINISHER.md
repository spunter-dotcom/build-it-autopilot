# Finisher (render run): instructions for the scheduled run

You are running unattended. Nobody will answer questions. A build run (`PRODUCER.md`) already wrote the script, voice and scene. Your job is mechanical: render, upload, schedule, log. Keep it short: no research, no rewriting, no reading other docs. Each step below is one or two tool calls.

## 1. Find the work
- The build run that started you names the job in its message ("Finish job <id>"). Otherwise use `grep -l '"status": "built"' videos/*/job.json` and take the oldest. If there is none, end quietly (no notification). Set `ID` to the folder name. One job per run.

## 2. Prepare (one sandbox_exec)
`(git -C /home/user/bia pull -q 2>/dev/null || git clone -q --depth 1 https://github.com/spunter-dotcom/build-it-autopilot /home/user/bia) && bash /home/user/bia/kit/scripts/setup.sh $ID && cd /home/user/what-if/$ID/edit && higgsedit build edit.jsx | tail -3`
- setup restores the voice from `voice_url.txt` and the word timings if this is a fresh sandbox.

## 3. Render five parts, one at a time
For N = 1 to 5:
- `sandbox_exec` with `background: true`, `size: "xl"`: `bash /home/user/bia/kit/scripts/render.sh $ID N`
- Wait with a local shell `sleep 420` (never a sleep inside sandbox_exec), then one check: `cat /home/user/what-if/$ID/rN.status`. If it isn't there yet, `sleep 120` and check again. `exit 0` means done.
- A part that fails or isn't done after 16 minutes: run it once more. If it fails again, go to step 7.
- Skip any part whose `rN.status` already says `exit 0` (a resumed job).

## 4. Upload (two calls)
- `media_upload` with `filename: "$ID.mp4"`. Keep its `upload_url`, `media_id` and read URL.
- One `sandbox_exec` (timeout 120) with `image_paths` set to `/home/user/what-if/$ID/prev/out5.jpg`, `out30.jpg`, `out55.jpg`:
  `bash /home/user/bia/kit/scripts/finish.sh $ID '<upload_url>'`
  It joins the parts, sets loudness, checks 1080x1920 + audio + length, and uploads. It must print `upload HTTP 200` and a duration of at least 62 s; the three frames must show the scene, not black or broken images.
- `media_confirm` (`type: "video"`), then `register_what_if_result` with the `media_id` (no `preset_id`).

## 5. Schedule (only when job.json says `"mode": "schedule"`)
- Metricool `createScheduledPost` for TikTok: brand `blogId` 8019616, timezone America/New_York, `autoPublish: true`, `providers: [{"network": "tiktok"}]`, the Higgsfield read URL in `media`, the text of `videos/$ID/caption.txt`, and `tiktokData` with `privacyOption: "PUBLIC_TO_EVERYONE"`, `isAigc: true` and `title` from job.json. Time: the next free slot from `getBestTimeToPostByNetwork`, otherwise 18:30.
- If Metricool rejects the URL, retry once; if it fails again, leave the video unscheduled, note it, and still finish step 6.
- `"mode": "manual"` jobs are never posted: the owner posts them by hand.

## 6. Log and notify
- Update `videos/$ID/job.json`: `"status": "done"`, plus `media_id`, `url`, and the Metricool post id and time if scheduled.
- Update the video's `log.csv` row: status `scheduled` or `manual-not-scheduled`, duration, post time, video URL, Metricool post id.
- `git pull --rebase`, commit, push (retry a rejected push).
- One push notification: "<title> ready" plus when it posts, or "post it by hand" for manual jobs.

## 7. Failures
- After 2 failed attempts at any step: set `"status": "failed"` with the reason in job.json and log.csv, commit, push, and send one short push notification. Never post a video that failed a check.
