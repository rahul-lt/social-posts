You are making today's "yesterday on X" LinkedIn news post for Frontend Master (allahabadi.dev; audience: Indian B.Tech
students and 0-2 year developers). Working directory: ~/Documents/GitHub/social-posts. Run unattended; never ask questions.
The user approved auto-posting: a pick that passes every check below is queued and pushed without review.

Window: yesterday IST = since_time:{{SINCE}} until_time:{{UNTIL}} (Unix seconds). Post slot: {{SLOT}}. Post id: {{ID}}.
Full design and examples: plans/30day-2026-11/x-daily-news.md (sections 2, 3, 6, 8). Read it first.

1. Collect in Chrome (logged-in X). Load the Claude in Chrome tools in one ToolSearch (tabs_context_mcp, tabs_create_mcp,
   navigate, javascript_tool, get_page_text, browser_batch, tabs_close_mcp). Create your own tab; close it at the end.
   Read-only: never like, reply, follow, post or type credentials. Run the 8 queries from section 2 of the plan, each with
   ` since_time:{{SINCE}} until_time:{{UNTIL}} lang:en -filter:replies` and its min_faves, using
   ~/.claude/skills/x-pulse/collect.js (prepend `const Q = "<key>";`), at most 3 queries per browser_batch. Then dump with
   ~/.claude/skills/x-pulse/dump.js (prepend `const CUTOFF = "<since as ISO>"; const TOPN = 120;`) in its own call and read
   it with get_page_text. If X shows a login wall or every query is empty: notify (step 6) "X login or layout problem" and stop.
2. Score and filter exactly as section 3 of the plan (score formula, R and S multipliers, drop rules, reply farms, clustering).
   Dedupe: skip stories already covered in sources/x-daily/*.json (last 30 days), sources/roster.json, and topics of
   nuggets/posts.json posts with publishAt in the last 14 days.
3. Take the best story and fact-check it on a first-party page (company blog, docs, changelog, release notes, the author's own
   post or repo) with WebFetch (curl if blocked). Use only facts you read there or in the lead tweet. If it can't be verified,
   or is satire, rumour, politics, crypto or markets, take the next story. If none of the top 5 passes, notify "no story
   passed checks today" and stop without queueing anything.
4. Write the post into nuggets/posts.json (append one object; keep the file's 2-space JSON):
   {"id": "{{ID}}", "day": 0, "slot": "12:00", "style": "ours", "theme": "light", "pillar": "news", "format": "x-news",
    "card": {"text": "<= 280 chars: line 1 states the news as a hook, then the one idea a student should learn from it. Use [[...]] to highlight one phrase. No handle, no link>"},
    "caption": "<see rules>", "publishAt": "{{SLOT}}", "source": {"tweet": "<url>", "primary": "<url>", "author": "@handle"}}
   Caption rules (follow plan section 6 examples): first line = the news in one plain sentence; "What happened:" with the
   verified facts and the author credited by name and @handle; "Why it matters for you:" for a student/junior; one takeaway
   (interview angle when there is one); end with one question. At most one quote under 15 words. Last line:
   `Source: <tweet url>` and, if different, the first-party url. 90-170 words, no em/en dashes, no hype words, no hashtags,
   no emoji (footer is appended automatically). No tweet screenshots or media.
5. Render and queue: `/usr/bin/python3 nuggets/render.py {{ID}}` (shorten the card text until it passes), look at
   nuggets/out/{{ID}}/card.png, then `node nuggets/queue.mjs {{ID}}`. Save picks 2-5 with metrics and links to
   sources/x-daily/{{DATE}}.json as {"date","picked":{...},"reserve":[...]}. Then:
   `git pull -q --rebase --autostash && git add nuggets/posts.json posts/nugget-{{ID}} sources/x-daily && git commit -m "post: x-news {{DATE}}" && git push`
   Only add those paths; never commit other files. If the push fails, retry pull+push twice.
6. Notify: osascript -e 'display notification "<one line: queued story or the problem>" with title "allahabadi.dev x-news"'
   and print a 3-line summary: story + author, score, post slot.
