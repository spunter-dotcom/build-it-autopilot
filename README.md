# Build-it autopilot

This repo makes and posts a "you build it from scratch" 3D explainer to TikTok on a schedule, then learns from the results. Claude runs it unattended, at no extra cost:

| Part | What does it | Cost |
|---|---|---|
| Brain and scheduler | Claude scheduled tasks (daily producer and weekly analyst) | Uses your existing Claude plan |
| Script and fact-check | Claude with web search | Included |
| Voice | Kokoro-82M (Apache-2.0), runs offline in the session | Free |
| 3D animation | three.js rendered on the CPU in headless Chromium (`engine/`) | Free |
| Music and sound | Generated from code (`engine/pipeline/sound.py`) | Free |
| Quality checks | Claude reviews still frames, plus an offline Whisper listening test | Free |
| Video hosting | The `media` branch of this public repo | Free |
| Posting and analytics | Metricool free plan, through its Claude connector | Free, up to 20 posts a month |

## Files
- `PRODUCER.md` is the daily procedure.
- `ANALYST.md` is the weekly review procedure.
- `playbook.md` holds the current rules, learned from the data.
- `topics.md` is the topic queue.
- `log.csv` has one row per video, with its recipe and results.
- `engine/` contains the renderer, kit, voice, sound and QC scripts. Run `engine/make_video.sh videos/<id>` to build a video.
