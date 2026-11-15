# Daily producer: instructions for the scheduled run

You are running unattended. Nobody will answer questions. Make one original 65-second "you build it" explainer with Higgsfield's `/content-factory` and schedule it on TikTok through the Metricool connector. If you can't do that safely, skip the day. A skipped day is fine; a bad post is not.

Read `playbook.md` first. Its rules override the defaults below.

The old three.js engine in `engine/` is retired (kept for reference). Do not run `engine/setup.sh` or `engine/make_video.sh`. Only `engine/pronunciations.json` is still used.

## Fixed settings (owner decisions, 2026-11-14)
- **Tool:** the Higgsfield connector, `/content-factory`. Load it with `get_preset_instructions {"preset":"/content-factory", "media":[{"media_id":"79814186-bdc0-4392-9803-0669ea6b7cf2","type":"video"}]}` and follow those instructions and the references they name (what-if-reference, what-if-voiceover, higgsedit, and glsl-3d if the reference is 3D), with the overrides below.
- **Style reference video:** media_id `79814186-bdc0-4392-9803-0669ea6b7cf2` (the owner's own video). Use it as the reference every time. No `STYLE` block, so no `preset_id`.
- **Prompt (owner's wording, `[TOPIC]` filled from step 2):** "[TOPIC]. Create a fresh script with a strong opening hook, accurate facts, engaging animated visuals, voice over, and captions."
- **Length:** `duration_seconds` 65, one episode.
- **Voice:** ElevenLabs v4, preset **Desmond**, voice_id `563f728c-e249-5a85-97ab-8461e8c09da6`. This overrides any voice the voiceover reference would pick. One take; follow the reference's check and revision rules. Budget: about 4–5 credits.
- **Format override:** content-factory is written for "what if…" stories. This channel is not. Keep the reference video's look, pacing and caption style, but write the story as a "you build it" explainer following `playbook.md` rules 3–6 (state the need, chain "So you…" / "But…" build beats, 2–3 "This is a ___." naming beats, end on "Congratulations. You have built a ___."). Never copy the reference's wording, premise or characters.
- **Never** call `generate_image` or `generate_video`. The only paid call is the voiceover.

## 0. Setup
- Set the video id: `ID=$(date +%F)-<slug>`. Use `<slug>` as the content-factory slug too.
- Create the folder `videos/$ID/`.

## 1. Check limits
- Call Metricool `getScheduledPosts` for this calendar month.
- If 20 or more TikTok posts are already scheduled or published (the free-plan cap), stop. Append a `skipped: monthly cap` row to `log.csv`, commit, and end.
- Call Higgsfield `balance`. If fewer than 10 credits remain, stop and log `skipped: low Higgsfield credits`.

## 2. Pick the topic
- Take the first unchecked item under **Next** in `topics.md`.
- If that list is empty, choose a pre-industrial machine or structure that is built from beams, posts, planks, logs, wheels, gears, rope, stone or brick and isn't already in `log.csv`.
- Never remake a specific video from another creator.

## 3. Research and fact-check
- Run 2–4 web searches.
- Write the facts you'll use, each with its source URL, to `videos/$ID/sources.md`.
- If a number or date can't be sourced, use softer wording ("about", "often") or cut it.
- Avoid health, safety or legal claims.

## 4. Script
- Write the narration to `videos/$ID/script.md` before requesting the voice: about 150–175 words for 65 s (check the pace the voiceover reference recommends), in the second person.
- Plain English. Translate Latin or Greek terms unless the name itself is the point. For a name the voice may garble, use the respelling in `engine/pronunciations.json` (or add a lowercase, hyphenated one there) in the text sent to the voice only. On-screen captions keep the real spelling. Never write respellings in capital letters.

## 5. Make the video (content-factory)
- Work in the Higgsfield sandbox as content-factory says: study the reference, voice the script with Desmond, build with Higgsedit, preview frames, render on an XL sandbox, bring loudness to about -14 LUFS, check with ffprobe (1080x1920, 62–80 s, has audio), look at 2–3 frames.
- Fix in preview, not after the render. Up to 3 preview rounds. Re-voicing is allowed once if the take fails its check.
- Upload with `media_upload` → curl PUT → `media_confirm` (type video). Then `register_what_if_result` with the `media_id` (no `preset_id`). Skip `show_result` if it errors; nobody is watching.
- Record the `media_id` and the hosted file URL from `media_confirm` in `videos/$ID/higgsfield.json`. If `media_confirm` does not return a URL, get it with `show_medias` / `resolve_project_assets`.

## 6. Backup copy on the media branch
Metricool needs a public URL. Use the Higgsfield URL first; keep a GitHub copy as the fallback.
- In the sandbox, the final file is the loudness-fixed `out.mp4`. Bring it into this workspace: if the Higgsfield URL is reachable from the shell (`curl -fsSLo videos/$ID/final.mp4 <url>`), download it; if the shell can't reach it, skip this step and rely on the Higgsfield URL.
- If you have the file, host it on the `media` branch, keeping the 3 newest videos:
   ```bash
   git fetch --depth 1 origin media && git worktree add --detach ../media-wt FETCH_HEAD && cd ../media-wt
   git checkout -q -B media-new
   ls *.mp4 | sort | head -n -2 | xargs -r git rm -q       # keep the 2 newest old videos
   cp ../build-it-autopilot/videos/$ID/final.mp4 $ID.mp4
   git add -f *.mp4 README.md && git commit -qm "media: $ID" && git pull --rebase -q origin media && git push -q origin HEAD:media
   git ls-tree -r --name-only HEAD   # must list $ID.mp4
   cd ../build-it-autopilot && git worktree remove --force ../media-wt
   ```
   Its URL is `https://raw.githubusercontent.com/spunter-dotcom/build-it-autopilot/media/$ID.mp4`.

## 7. Publish
1. Write the caption to `videos/$ID/caption.txt` exactly as `playbook.md` rule 9 describes. No AI mention in the caption; the platform label covers it. Every number must be in `sources.md`.
2. Post with Metricool `createScheduledPost` for TikTok. The brand is `blogId` 8019616 ("how_it_happened0"), timezone America/New_York. Use `autoPublish: true`, `providers: [{"network": "tiktok"}]`, the Higgsfield video URL in `media`, and `tiktokData` with `privacyOption: "PUBLIC_TO_EVERYONE"`, `isAigc: true` and a non-empty `title` (the script title). Comments on. Time: the next slot from `getBestTimeToPostByNetwork` not already taken, otherwise 18:30 America/New_York. Metricool copies the video when you schedule, so a success response means the file was fetched.
3. If Metricool rejects the Higgsfield URL, retry once with the media-branch URL from step 6 (if it exists), then once with `https://github.com/spunter-dotcom/build-it-autopilot/raw/media/$ID.mp4`. If all fail, don't post; record the error.
4. YouTube Shorts: call `getBrandSettings`. If the brand's `networksData` includes a YouTube channel, add `{"network": "youtube"}` to the same post with `youtubeData: {"title": <script title, under 100 chars, plus " #shorts">, "type": "short", "privacy": "public", "madeForKids": false, "category": "EDUCATION", "isAiGeneratedContent": true}`. Never let a YouTube error block the TikTok post: if the combined post fails, retry with TikTok alone.

## 8. Log and save
- Append a row to `log.csv`: date, id, status (`scheduled`), title, category, `statement`, duration, word count, naming beats, voice `desmond-elevenlabs-v4`, post time, video URL, then the Metricool post id, Higgsfield media_id and credits used in the notes column.
- Tick the topic in `topics.md`.
- Commit `videos/$ID/` (never `*.mp4` or `*.wav`) to `main`. Run `git pull --rebase` before pushing; retry the push if it is rejected.

## 9. Failures
- After 2 failed attempts at any step, don't post.
- Log the reason in `log.csv`, commit, and send one short push notification saying what broke.

## 10. Lessons from the first run (2026-11-15) — read before step 5
- Claude usage is the bottleneck. Keep tool calls few: batch sandbox work into one command, look at 4 frames per call, and don't re-read instructions you already have.
- Render time is about 2.5–3 s per frame on XL. Render the 65 s in four `--range` parts of 16.25 s (r1..r4), one background call at a time (each takes about 7–8 minutes), then join with the ffmpeg concat demuxer (`-c copy`). Wait with one long local `sleep 420` between polls, not many short polls. Never put a `sleep` longer than about 40 s inside `sandbox_exec`; it returns Bad Gateway.
- Call `media_upload` while the last part renders and save the upload URL to a file in the sandbox, so the final command can concat, fix loudness, check and upload in one go.
- Loudness: aim for -14 LUFS but keep the true peak under -1 dB. If the gain needed would clip, use a smaller gain (-16 LUFS is acceptable). Never limit or compress.
- GLSL scenes: when repeating objects in grid cells, apply the cell-boundary step limit to every cell (also empty ones), and keep objects well inside their cell. Otherwise shapes render hollow or broken. Check a preview frame of every scene for hollow shells, holes and broken parts before rendering.
- This workspace's shell cannot reach Higgsfield's file host, so step 6 (media-branch backup) is normally skipped. Record the hosted URL from `media_upload` ("Read url") in `higgsfield.json`.
- If a run is cut off, its sandbox files under `/home/user/what-if/<slug>/` survive for 24 hours. A later run should resume from them (reuse `voice.mp3`; never re-voice a take that passed).
- The Higgsfield sandbox is shared by every run on this account, and another run may be working in it at the same time. Stay inside your own `/home/user/what-if/<slug>/` folder. Before starting each render part, run `pgrep -f "higgsedit render"`; if a render is already running, wait (local `sleep 240`) and check again, so two renders never share the CPUs and overrun the 15-minute background limit.
