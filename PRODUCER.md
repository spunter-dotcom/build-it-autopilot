# Daily producer: instructions for the scheduled run

You are running unattended. Nobody will answer questions. Make one original 62–80 second "you build it" 3D video and publish it to TikTok through the Metricool connector. If you can't do that safely, skip the day. A skipped day is fine; a bad post is not.

Read `playbook.md` first. Its rules override the defaults below.

## 0. Setup (about 3 minutes)
- `bash engine/setup.sh` installs everything from PyPI, npm and GitHub releases. Nothing is paid and no keys are needed.
- Set the video id: `ID=$(date +%F)-<slug>`.
- Create the folder `videos/$ID/`.

## 1. Check limits
- Call Metricool `getScheduledPosts` for this calendar month.
- If 20 or more TikTok posts are already scheduled or published (the free-plan cap), stop. Append a `skipped: monthly cap` row to `log.csv`, commit, and end.

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
Write `videos/$ID/script.json`, using `videos/2026-11-10-well/script.json` as the model.
- Format: 16–20 lines, 240–300 words, in the second person ("you").
- Shape: open with a need, then chain "So you …" and "But …" beats.
- Naming lines: include 2–3 lines like "This is a ___." Each gets `"label": {"word": "...", "text": "..."}`.
- Ending: the last line is exactly "Congratulations. You have built a ___."
- Point `"topic"` at `/topics/$ID.js`.

## 5. Voice
- Run `engine/make_video.sh videos/$ID voice`.
- The narration must be at least 61 s. If it's shorter, add a beat and run it again.

## 6. Scene
Write `engine/topics/$ID.js`. Copy the structure of `engine/topics/well.js`:
- Use the kit (`World`, `dropIn`, `popIn`, `stoneBlock`, `post`, `log`, `gear`, `bucket`, `Dust`, shot lists).
- Keep everything a pure function of `t`.
- Every script line needs a visible change, ideally a part dropping in with dust and a sound.
- Give each "This is a ___" line a clean hero shot.
- Keep the camera off posts and out of walls.
- Add new geometry to `kit.js` only if the topic really needs a new part type.

## 7. Visual QC (up to 3 rounds)
- Run `engine/make_video.sh videos/$ID qc`, then open every `videos/$ID/qc/sheet_*.jpg`.
- Fix:
  - empty or blocked shots
  - parts floating or overlapping
  - holes showing the sky or the ground plane
  - captions colliding with key action
  - anything that doesn't match the line being spoken
- Re-render only the frames you changed.

## 8. Render
- Run `engine/make_video.sh videos/$ID render` in the background. It takes about 45 minutes on 2 CPUs.

## 9. Sound, listening test, final file
- Run `engine/make_video.sh videos/$ID finish`.
- `qc/audio.json` must show `"pass": true` (word error rate ≤ 0.15). If it doesn't, adjust the wording and redo steps 5 and 8–9.
- Check that `final.mp4` is 720x1280, has an audio stream and runs at least 61 s.

## 10. Publish
1. Host the file on the `media` branch. It holds the 3 newest videos in a single commit, so the repo stays small: only the new file is uploaded and old ones drop out. Run from the repo root:
   ```bash
   git fetch --depth 1 origin media && git worktree add --detach ../media-wt FETCH_HEAD && cd ../media-wt
   git checkout -q --orphan media-new && git rm -rfq --cached .
   ls *.mp4 | sort | head -n -2 | xargs -r rm -f          # keep the 2 newest old videos
   cp ../build-it-autopilot/videos/$ID/final.mp4 $ID.mp4
   git add -f *.mp4 README.md && git commit -qm "media: $ID" && git push -qf origin HEAD:media
   git ls-remote origin media && git ls-tree -r --name-only HEAD   # must list $ID.mp4
   cd ../build-it-autopilot && git worktree remove --force ../media-wt
   ```
   The public URL is `https://raw.githubusercontent.com/spunter-dotcom/build-it-autopilot/media/$ID.mp4`. This workspace can't open raw.githubusercontent.com itself, so trust the `ls-tree` check above.
2. Write the caption exactly as `playbook.md` rule 9 describes. Don't add an AI mention to the caption; the platform label covers it.
3. Post with Metricool `createScheduledPost` for TikTok. The brand is `blogId` 8019616 ("how_it_happened0"), timezone America/New_York. Use `autoPublish: true`, `providers: [{"network": "tiktok"}]`, the video URL in `media`, and `tiktokData` with `privacyOption: "PUBLIC_TO_EVERYONE"`, `isAigc: true` and a non-empty `title` (required; use the script title). Metricool copies the video to its own storage when you schedule, so a success response means the file was fetched:
   - the video URL
   - privacy public, comments on
   - the AI-generated content label on (`isAigc: true`). Keep it on; the video carries no on-screen tag
   - the next slot from `getBestTimeToPostByNetwork`, otherwise 18:30 America/New_York
4. YouTube Shorts: call `getBrandSettings` first. If the brand's `networksData` includes a YouTube channel, add `{"network": "youtube"}` to the same post's `providers` with `youtubeData: {"title": <script title, under 100 chars, plus " #shorts">, "type": "short", "privacy": "public", "madeForKids": false, "category": "EDUCATION", "isAiGeneratedContent": true}`. The same caption is used as the description. If YouTube isn't connected, post to TikTok only. Never let a YouTube error block the TikTok post: if the combined post fails, retry with TikTok alone.
5. If Metricool rejects the media URL, try once with `https://github.com/spunter-dotcom/build-it-autopilot/raw/media/$ID.mp4`. If that fails too, skip and record the error.

## 11. Log and save
- Append a row to `log.csv`.
- Tick the topic in `topics.md`.
- Commit `videos/$ID/` (everything except `*.mp4` and `*.wav`), `engine/topics/$ID.js` and any kit changes to the default branch, then push.

## 12. Failures
- After 2 failed attempts at any step, don't post.
- Log the reason in `log.csv`, commit, and send one short push notification saying what broke.
