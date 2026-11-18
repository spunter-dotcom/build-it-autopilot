# Producer (build run): instructions for the scheduled run

You are running unattended. Nobody will answer questions. Your job is to BUILD one 65-second "you build it" video with the scene kit in `kit/` and stop before rendering. A separate, smaller run (`FINISHER.md`) renders, uploads and schedules it. A skipped day is fine; a bad post is not.

Claude usage is the bottleneck, so work lean:
- Do not load Higgsfield's `/content-factory` instructions or study the reference video. Everything you need is in this file and `kit/README.md`.
- Do not write 3D code from scratch. Build scenes from the parts in `kit/parts.glsl`.
- Batch sandbox work into few `sandbox_exec` calls. Look only at the small preview JPEGs, at most 4 per call and at most 3 preview rounds.
- Read `playbook.md` and `kit/README.md` once. List the parts with `grep -n "^vec2 p\|^// " kit/parts.glsl` instead of reading the whole file.

## 0. Setup and limits
- `ID=$(date +%F)-<slug>`; create `videos/$ID/scene/`.
- Metricool `getScheduledPosts` for this calendar month: if 20 or more TikTok posts exist (free-plan cap), stop, log `skipped: monthly cap`, commit, end. Manual-post runs skip this check.
- Higgsfield `balance`: if under 10 credits, stop and log `skipped: low Higgsfield credits`.

## 1. Topic
- The topic your prompt names, else the first unchecked item under **Next** in `topics.md`. If that is empty, pick a pre-industrial machine or structure not already in `log.csv`. Never remake another creator's video.

## 2. Research
- 2–4 web searches. Facts with source URLs go to `videos/$ID/sources.md`. Soften or cut anything you can't source. No health, safety or legal claims.

## 3. Script
- Write `videos/$ID/script.md`: 165–180 words, second person, following `playbook.md` rules 3–6 (state the need; chain "So you…" / "But…" beats; 2–3 "This is a ___." naming beats; end "Congratulations. You have built a ___.").
- Plain English. For a name the voice may garble, use the lowercase respelling from `engine/pronunciations.json` (add one if missing) in the voice text only. Spell numbers out in the voice text.

## 4. Voice (the only paid call, about 4–5 credits)
- One `generate_audio` call, exactly:
  `{"params": {"model": "elevenlabs_v4", "prompt": TAKE, "stability": 0.45, "batch_size": 1, "dialogue": [{"text": TAKE, "voice_id": "563f728c-e249-5a85-97ab-8461e8c09da6", "voice_type": "preset"}]}}`
  where TAKE = `[warm, confident storyteller, brisk pace] ` followed by the whole script joined with spaces (Desmond voice). Never ask for a slow pace.
- `jobs_wait` until done; never resubmit a job that already has an id. Save the audio URL to `videos/$ID/scene/voice_url.txt`.
- One `sandbox_exec`:
  `mkdir -p /home/user/what-if/$ID && curl -sfL -o /home/user/what-if/$ID/voice.mp3 '<audio url>' && (git -C /home/user/bia pull -q 2>/dev/null || git clone -q --depth 1 https://github.com/spunter-dotcom/build-it-autopilot /home/user/bia) && bash /home/user/bia/kit/scripts/setup.sh $ID`
  (setup runs the word alignment and prints the voice length and transcript).
- Check the transcript against the script. If words are missing, a bracket tag was read aloud, or the take is under 58 s (add a beat first), re-voice the whole take once.

## 5. Scene
- Copy `kit/template/edit.jsx` and `kit/template/scene.glsl` into `videos/$ID/scene/` and edit them there (how: `kit/README.md`):
  - `scene.glsl`: only `map()`, built from kit parts, one `u_site` value per set. A few dozen parts per site at most.
  - `edit.jsx`: `DUR` (voice length + about 1.5 s, at least 62), `def` with your own params, cut points from phrases in the transcript, one `Scene` per shot. Every script line gets a visible change and every shot moves the camera. `Label`s for the naming beats, `Card`s for dates and numbers.
- Commit and push, then in one `sandbox_exec`: `git -C /home/user/bia pull -q && bash /home/user/bia/kit/scripts/setup.sh $ID && bash /home/user/bia/kit/scripts/preview.sh $ID t1 t2 t3 t4`, with `image_paths` set to the four `/home/user/what-if/$ID/prev/f<t>.jpg` files.
- Fix and repeat (push, then the same command) for at most 3 rounds. Look for empty or blocked shots, floating or overlapping parts, hollow shells or holes, labels over key action, and anything that doesn't match the line being spoken.
- Speed: preview prints milliseconds per frame on the standard sandbox. If any frame is over 6000 ms, simplify that site (fewer parts, nothing heavy behind a close-up) or the render will not fit its time limit.

## 6. Hand over to the finisher
- Write `videos/$ID/caption.txt` exactly as `playbook.md` rule 9 says. No AI mention. Every number in it must be in `sources.md`.
- Write `videos/$ID/job.json`: `{"status": "built", "mode": "schedule", "title": "<script title>", "dur": <DUR>, "voice_job": "<job id>", "credits": <credits used>}`. Use `"mode": "manual"` when your prompt says the owner posts by hand.
- Append a `log.csv` row with status `built`. Tick the topic in `topics.md`. Commit and push (`git pull --rebase` first; retry a rejected push). Never commit video or audio files.
- Do not render and do not send a notification; the finisher does both.

## 7. Failures
- After 2 failed attempts at any step, stop. Put `"status": "failed"` and the reason in `job.json` (if it exists) and in `log.csv`, commit, and send one short push notification saying what broke.
