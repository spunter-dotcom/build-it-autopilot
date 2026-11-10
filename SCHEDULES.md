# Scheduled tasks (create once; they then run with nobody watching)

Both tasks run as Claude cloud sessions on the owner's existing plan, in the Default environment with Trusted network access. That's enough: PyPI, npm and GitHub are allowed, and the Metricool connector goes through Anthropic's servers.

## Daily producer
- **Schedule:** `CRON_TZ=America/New_York 47 2 * * 1,2,4,5,6`. That's 2:47 AM on Mon, Tue, Thu, Fri and Sat, about 21 posts a month.
- **Free-cap guard:** step 1 of `PRODUCER.md` skips the run once 20 posts exist in a calendar month.
- **Prompt:**

  > You are the unattended daily producer for the build-it TikTok autopilot. Attach the GitHub repository spunter-dotcom/build-it-autopilot with push access, clone it, and follow PRODUCER.md in it exactly, from start to finish. Post only through the Metricool connector. Don't ask questions. If a step fails twice, skip posting, record why in log.csv, commit, and send one push notification.

## Weekly analyst
- **Schedule:** `CRON_TZ=America/New_York 17 15 * * 0`, which is Sunday at 3:17 PM.
- **Prompt:**

  > You are the unattended weekly analyst for the build-it TikTok autopilot. Attach the GitHub repository spunter-dotcom/build-it-autopilot with push access, clone it, and follow ANALYST.md in it exactly. Use the Metricool connector for analytics. Don't ask questions. Finish with one push notification of no more than three lines.

## One-time setup (only the account owner can do these)
1. Create a personal TikTok account. Business accounts can't join Creator Rewards.
2. Create a free Metricool account, connect the TikTok account, and turn on **Auto publish**.
3. In Claude, connect the **Metricool** connector and GitHub, then create one empty **public** repository. It has to be public so Metricool can fetch the video files.
4. Let Claude push this repo and create both tasks. Then set them to **Automatically approve** in the task settings if your organization allows it.
