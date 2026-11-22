# Playbook (read by the producer before every video; rewritten weekly by the analyst)

## Current rules
1. **Length:** 65 s target (62–80 s allowed). Creator Rewards only counts videos over 1 minute.
2. **Voice and look:** ElevenLabs v4 preset Desmond (voice_id 563f728c-e249-5a85-97ab-8461e8c09da6), 3D scenes from the shared kit in `kit/`. Keep a brisk pace with very short pauses.
3. **Opening:** the first line states the need in under 3 seconds ("Your village needs water…"). While the active experiment runs, its arm decides whether that line is a statement or a question.
4. **Shape:** a chain of "So you…" and "But…" beats, with 6–9 build steps.
5. **Naming beats:** 2–3 per video ("This is a ___."), each with an on-screen label and a clear hero shot.
6. **Ending:** "Congratulations. You have built a ___."
7. **Pacing on screen:** something new appears at least every 3 seconds, with a cut or camera move every 3–6 seconds.
8. **Topics:** pre-industrial machines and structures built from wood, stone and rope.
9. **Caption:** three parts, in this shape:
   - **Line 1:** a punchy hook of 2–4 short fragments plus 1–2 emoji ("No pumps. No engines. Just gravity. 🏛️💧").
   - **Line 2:** one or two sentences carrying the video's most surprising sourced facts, with real numbers, then a question to the viewer ending in 👇 ("Would you have figured out the keystone? 👇").
   - **Line 3:** 6–8 hashtags: 2–3 broad (#history #engineering), 2–3 topic-specific (#romanempire #aqueduct), plus #howitsmade #learnontiktok #historytok.
   - Every number in the caption must be in `sources.md`.
10. **Cadence:** 4–5 videos a week, under Metricool's free cap of 20 per month.

## Active experiment
**Opening: question vs statement** (started 2026-11-15; one variable only).
- **Arms:** A = statement ("Your village needs water."), B = question ("How did a village get water before pipes?"). Both still name the need in under 3 seconds; everything else follows the rules above.
- **Assignment:** alternate by the order videos are produced. The next new video is B, then A, then B, and so on. Write `hook_style` in `log.csv` as `question` or `statement`.
- **Measure:** 72h views and 72h engagement rate, (likes + comments + shares) / views; completion rate too if Metricool starts returning it.
- **Close:** when each arm has 8 videos made on the Higgsfield pipeline (log cabin onward). Count so far (2026-11-22): A 5 (log cabin, macellum, David, trireme, Roman road), B 5 (Colosseum, stone arch bridge, ballista, canal lock, ice house); the failed Inca bridge is not counted. Only 4 of the 10 went through Metricool (ballista B, canal lock B, ice house B; shaduf predates the test), so the arms cannot be compared until Metricool returns numbers for them and the owner's hand posts are logged.

## Changelog
- 2026-11-22 (weekly review): no rule changes. Metricool's post analytics still return only the 2026-11-15 snapshot (same 7 videos, same numbers) and nothing for the 4 videos it published 11-16..11-21 (shaduf, ballista, canal lock, ice house), so there is no new evidence. Updated the experiment count to A 5, B 5. Recipe comparisons stay at n≤3 per group (see 2026-11-15). Noted for the owner: the shaduf and canal lock posts have no isAigc flag in Metricool's tiktokData.
- 2026-11-19: production moved to the scene kit with a separate build run and finisher; the old engine and the content-factory reference video are retired.
- 2026-11-15 (weekly review): started the question-vs-statement opening experiment and added the arm note to rule 3. Why now: the account has 7 posts, the shaduf makes 8 on Monday, and the switch to Higgsfield is a clean break, so the test starts with the new pipeline instead of mixing two pipelines. Evidence so far (5 autopilot posts, snapshot 2026-11-15 15:18 ET, ages 5–101 h): Syracusia 2,227 views (21 h, 4.9% engagement), insula 1,012 (69 h, 6.3%), Archimedes screw 974 (45 h, 6.7%), trebuchet 355 (5 h, 6.8%), well 294 (101 h, 6.1%). The only question-hook video is the well (n=1), the weakest, so no conclusion; every group is far below 8. Leads to test, not rules: 18:00 ET posts (3) beat 10:00 ET posts (2), and the ship topic (Syracusia, n=1) beat everything.
- 2026-11-14: owner moved production to Higgsfield `/content-factory` (65 s, Desmond voice, owner's reference video). Metricool stays the poster.
- 2026-11-10: owner asked for the new caption style, with no on-screen AI tag and no AI mention in the caption. TikTok's platform AI label stays on.
- 2026-11-10: seeded from an analysis of the reference video (80 s, about 233 wpm, chained "But/So" beats, one-word captions, labelled terms).

## Safety and honesty rules (the analyst must not change these)
- Every post keeps TikTok's own AI-generated label switched on (`isAigc: true`). No on-screen tag or caption mention is needed.
- No copying another creator's videos, characters, names, logos or voice.
- Facts must come from `sources.md`. When unsure, soften the wording or cut the claim.
- No content about real living people, politics, medicine or anything dangerous to imitate.
- If quality checks fail, skip the day.
