# Build-it autopilot: handoff (updated 2026-11-19)

Read this first in any new chat about the TikTok video operation. To start a new chat, paste:

> Read HANDOFF.md in the GitHub repo spunter-dotcom/build-it-autopilot (attach it with push access) and take over operations. Keep Claude usage low.

## What it is
An unattended system that makes 62–68 second "you built a ___" 3D explainer videos for TikTok **@how_it_happened0**, posts them through Metricool, and learns from the results each week.

## Accounts and connectors
| Service | Details |
|---|---|
| GitHub | `spunter-dotcom/build-it-autopilot` (public). `main` holds everything. The old `media` branch is unused (safe to delete on GitHub). |
| Higgsfield | Connector "Higgsfield". Starter plan, about 247 credits left on 2026-11-18. Hosts finished videos, runs the render sandbox, records the voice. |
| Voice | ElevenLabs v4 via Higgsfield `generate_audio`, preset **Desmond**, voice_id `563f728c-e249-5a85-97ab-8461e8c09da6`, stability 0.45. About 4.5–5 credits per take. |
| Metricool | Connector "Metricool". Free plan, **20 posts a month**. Brand blogId `8019616`, timezone America/New_York. Posts with TikTok's AI label on (`isAigc: true`). |
| TikTok | @how_it_happened0, connected to Metricool (not to Higgsfield). |

## Scheduled tasks
| Task | ID | Model | Schedule | State |
|---|---|---|---|---|
| Producer (build run) | `trig_019oJNZC1SvQnTkdGnQxYk3n` | Opus 5.5 | 2:47 AM ET Mon/Tue/Thu/Fri/Sat | **paused** |
| Finisher (render run) | `trig_017NL8BdJXkDq7oMXa7ymQWU` | Sonnet 5.5 | none; the build run starts it with `fire_trigger` | **keep paused** (it still runs when fired) |
| Weekly analyst | `trig_01BDfa5m6dNeMkdMEZwWVTjR` | Opus 5.5 | Sunday 3:17 PM ET | on |

All run in the cloud with automatic approval and push notifications.

## How a video is made
1. **Build run** (`PRODUCER.md`): topic from `topics.md` → 2–4 web searches into `sources.md` → 190–210 word script → one voice take → scene built from `kit/` (two files: `scene.glsl` and `edit.jsx` in `videos/<id>/scene/`) → up to 3 preview rounds → `caption.txt` and `job.json` (`"status": "built"`, `"mode": "schedule"` or `"manual"`) → fires the finisher. Took 13 minutes in the test.
2. **Finisher** (`FINISHER.md`): renders five parts in the Higgsfield sandbox (about 8–11 min each), joins them, sets loudness, uploads to Higgsfield, schedules in Metricool if mode is `schedule`, updates `job.json` to `done` and `log.csv`, sends a push notification. About an hour, mostly waiting.
3. **Analyst** (`ANALYST.md`): Metricool numbers into `log.csv`, at most 2 rule changes a week in `playbook.md`, one experiment at a time (currently question vs statement hook), rewrites the Next list in `topics.md`.

## Repo map
- `PRODUCER.md`, `FINISHER.md`, `ANALYST.md`: the run procedures.
- `playbook.md`: rules. Its "Safety and honesty rules" section must never be changed by a run.
- `topics.md`, `log.csv`, `analytics/`.
- `kit/`: `lib.glsl`, `parts.glsl` (about 25 parts and the material ids), `render.glsl`, `kit.jsx`, `template/`, `scripts/` (setup, align, preview, render, finish), `pronunciations.json`. See `kit/README.md`.
- `videos/<id>/`: sources, script, caption, `job.json`, `scene/`.
- In the Higgsfield sandbox: the repo is cloned at `/home/user/bia`; each video works in `/home/user/what-if/<id>/`. Sandbox files last about 24 hours.

## Owner's standing decisions
- No on-screen AI tag and no AI mention in captions; TikTok's own AI label is always on for scheduled posts. Remind the owner to switch it on for manual posts.
- Captions: hook line with emoji, a fact line with real numbers ending in a 👇 question, 6–8 hashtags. Every number must be in `sources.md`.
- Plain English in scripts; Latin/Greek names get lowercase respellings in `kit/pronunciations.json` (voice only).
- No engagement bots. Never use Higgsfield's TikTok publish tools (they need a person to submit each post). Never call Higgsfield `generate_image` or `generate_video` for these videos.
- Manual videos are delivered in chat with their caption and are never posted by the system.

## Common requests
- **Turn the autopilot on:** enable the producer task only. Leave the finisher paused.
- **Queue a manual video:** `fire_trigger` the producer with text: `Topic: <topic>. Mode: manual. Use video id <YYYY-MM-DD-slug>.` When done, show it with Higgsfield `show_result` (`action: "content_factory_video"`, the `media_id` from `job.json`) and give the caption. Space several manual videos 45+ minutes apart, or run them one after another.
- **A run failed:** check `list_triggers` (`last_run.failure_reason`). `USAGE_LIMIT_REACHED` means the Claude plan ran out; don't rerun until usage resets. Work in the sandbox survives about 24 hours: rendered parts are in `/home/user/what-if/<id>/edit/renders/rN.mp4` with `rN.status`; `bash /home/user/bia/kit/scripts/finish.sh <id> '<upload_url>'` finishes from there (get the URL from `media_upload`, then `media_confirm`).
- **Check status cheaply:** `git pull`, read `videos/<id>/job.json`, and `list_triggers`. Don't reload big instructions or view many images.

## Videos ready to post by hand (in Higgsfield, not posted by the system)
| Video | Higgsfield media_id |
|---|---|
| Log cabin | `c9d4363c-e4e4-4713-8991-d8ae26625504` |
| Colosseum | `0da036c0-2264-45c1-bc1c-b82666220d7f` |
| Roman macellum | `e819c895-9a1b-4a2f-9bb9-f74b6da5f17c` |
| Statue of David | `91a0e922-5b12-4edb-bb7a-d54bd446f627` |
| Stone arch bridge (test) | `7b5da0d8-23ee-404e-a7a4-af746402da79` |

Captions are in `videos/<id>/caption.txt`. The Colosseum, macellum and David videos are about -19 LUFS (quieter); the Colosseum voice was slowed 5%.

## Known limits and lessons
- **Claude usage is the bottleneck.** The old one-run system hit the limit on 3 of 5 runs. The split (build on Opus, finish on Sonnet) fixed it in testing. Keep chats like this one short; long chats re-read their whole history on every step.
- Metricool can't attach trending TikTok sounds.
- In the 2026-11-18 test the build run ignored extra per-run instructions (mode, firing the finisher). The procedure now makes both required steps; verify on the first real runs.
- Repeated scene parts (forests) must use `cellXZ`/`cellBound` and never sit inside an `if`, or they render hollow (fixed in the kit).
- Don't `sleep` longer than about 40 s inside `sandbox_exec` (it returns Bad Gateway); wait with a local shell `sleep`.
- This workspace can't download from Higgsfield's file host; show videos with `show_result` instead.

## Open items on 2026-11-19
- Producer is paused. Turn it on when ready, then check the first real run (did it fire the finisher? did it schedule?).
- Optional: delete the unused `media` branch on GitHub.
- The five videos above are waiting to be posted by hand.
