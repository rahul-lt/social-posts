Weekly LinkedIn performance review for Frontend Master (allahabadi.dev). Working directory: ~/Documents/GitHub/social-posts.
Run unattended; never ask questions. The user approved acting on the results without review. Today: {{DATE}}.

1. Scrape. Load the Claude in Chrome tools in one ToolSearch (tabs_context_mcp, tabs_create_mcp, navigate, javascript_tool,
   get_page_text, tabs_close_mcp); use your own tab and close it at the end. Read-only. Open
   https://www.linkedin.com/analytics/creator/top-posts/?metricType=IMPRESSIONS&timeRange=past_28_days , scroll to load all
   (never click "…show more", it opens a post), parse each card (caption first line, reactions, comments, impressions) from
   document.querySelector('main').innerText split on "Frontend Master posted this • ". Script output truncates at ~1KB:
   keep data in window and read it back in chunks. Save to plans/reviews/{{DATE}}-top-28d.tsv. If LinkedIn shows a login
   wall, notify (step 5) and stop.
2. Analyze. Match posts to nuggets/posts.json by caption text (format, hookFamily, slot, publishAt) and to
   published.json for actual post time. Compare with plans/30day-2026-11/analysis-linkedin.md: which formats, hooks,
   topics and slots won or flopped in the last 7-28 days, including x-news posts (format "x-news"). Write
   plans/reviews/{{DATE}}.md (under 80 lines) and add a dated entry to the Taste log in nuggets/LEARNINGS.md with the rule
   changes. A pattern needs 3+ posts pointing the same way.
3. Act on queued posts that are not yet published (posts/nugget-* with publishAt more than 24h ahead and not in
   published.json): if a format or hook pattern clearly flopped (3+ posts), rewrite up to 6 upcoming posts in that pattern
   toward what won (edit nuggets/posts.json, `/usr/bin/python3 nuggets/render.py <ids>`, then delete posts/nugget-<id> and
   rerun `node nuggets/queue.mjs <ids>`). Keep publishAt. Every technical claim and code line must stay correct (run JS in node).
4. Refill. If the last queued nugget publishAt is less than 10 days away, write the next 14 days (3/day: 07:00 interview
   code-review, 19:30 evening, 23:30 "The AI built..." code-review) following analysis-linkedin.md, the latest review and
   ~/.claude/skills/tech-nugget/SKILL.md: ids continue after the highest n-id, no repeated bugs (check posts.json and
   nuggets/archive), card gate max ~12 code lines total across both panels. Render, queue.
5. Commit only what you changed: `git pull -q --rebase --autostash && git add plans/reviews nuggets/posts.json nuggets/LEARNINGS.md posts && git commit -m "review: {{DATE}}" && git push`.
   Notify: osascript -e 'display notification "<one line summary>" with title "allahabadi.dev weekly review"'.
