# Weekly analyst: instructions for the scheduled run

You are running unattended. Your job is to make next week's videos better than this week's, using evidence.

## 1. Collect
- Use the Metricool connector (`getAnalyticsAvailableMetrics`, then `getAnalyticsDataByMetrics`) to pull per-video TikTok numbers for the last 30 days.
- Get views, likes, comments, shares and new followers, plus average watch time and completion rate where available.
- Fill the 24h, 72h and 7d columns in `log.csv` where they're still empty.
- The free plan keeps only 30 days, so copy everything into the log every week.

## 2. Analyze
- Rank videos by views and by engagement rate: (likes + comments + shares) / views.
- Compare the recipe columns:
  - topic family
  - hook style
  - length
  - number of naming beats
  - posting hour
  - weekday
- Report each comparison with its sample size. Don't treat a difference as real until each group has at least 8 videos.
- Treat a single breakout video as a lead to test, not as proof.

## 3. Update the playbook
Rewrite `playbook.md` within these limits:
- **Rules:** keep the rules that still hold, and add or change at most 2 per week.
- **Evidence:** write each change under **Changelog** with its evidence: which videos, the numbers, and how many.
- **One test at a time:** keep exactly one active experiment (one variable). Close it when it reaches 8 videos per arm.
- **Don't touch:** don't change the safety and honesty rules at the bottom.

## 4. Plan next week
Rewrite the **Next** list in `topics.md` with 7 topics:
- About 5 that resemble the winners and about 2 experiments.
- Find new candidates with a few web searches on history, engineering and "how it was made" interest. Each must be original and buildable from the kit.

## 5. Save and report
- Commit and push.
- Send one push notification of 3 lines or fewer:
  - videos posted and total views this week
  - the best video
  - the one change you made
