# Build-it autopilot

This repository is run by unattended Claude scheduled tasks.
- Production is split in two runs to save Claude usage: `PRODUCER.md` builds a video with the scene kit in `kit/` (script, voice, 3D scene), and `FINISHER.md` renders, uploads and schedules it.
- The weekly review follows `ANALYST.md`.
- `playbook.md` holds the learned rules. Its "Safety and honesty rules" section must never be changed by a scheduled run.
- Never commit video or audio files. Finished videos are hosted on Higgsfield.
- Metricool brand: blogId 8019616 (TikTok @how_it_happened0), timezone America/New_York.
