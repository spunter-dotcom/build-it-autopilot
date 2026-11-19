# Build-it autopilot

Makes "you build it from scratch" 3D explainers for TikTok (@how_it_happened0), posts them through Metricool, and learns from the results. Claude runs it unattended with scheduled tasks.

## How a video gets made
1. **Build run** (`PRODUCER.md`, Opus 5.5, 2:47 AM Mon/Tue/Thu/Fri/Sat): picks a topic, researches it, writes the script and caption, records the voiceover on Higgsfield (Desmond, ElevenLabs v4, about 5 credits), and builds the 3D scene from the kit. It ends by starting the finisher.
2. **Finisher** (`FINISHER.md`, Sonnet 5.5, started by the build run): renders the video in Higgsfield's sandbox, uploads it to Higgsfield, schedules it in Metricool with TikTok's AI label on, and logs it.
3. **Weekly analyst** (`ANALYST.md`, Sunday 3:17 PM): pulls TikTok numbers from Metricool, updates `playbook.md` and the topic queue.

## Files
- `HANDOFF.md`: everything a new chat needs to take over operations.
| File | What it is |
|---|---|
| `PRODUCER.md`, `FINISHER.md`, `ANALYST.md` | the three run procedures |
| `playbook.md` | the current rules (script shape, caption style, safety rules) |
| `topics.md` | the topic queue |
| `log.csv` | one row per video: recipe and results |
| `kit/` | the shared 3D scene kit, scripts and voice respellings; see `kit/README.md` |
| `videos/<id>/` | each video's sources, script, caption, `job.json` and scene files |
| `analytics/` | TikTok exports kept by the analyst |

## Making a manual video (posted by hand)
Ask Claude in chat to "queue a manual video about X". It runs the build with `"mode": "manual"` in `job.json`; the finisher then renders and uploads it but never posts it.
