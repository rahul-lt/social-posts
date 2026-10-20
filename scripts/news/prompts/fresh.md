You are running the hourly freshness check for allahabadi.dev LinkedIn story posts.
Working directory: ~/Documents/GitHub/social-posts. Run unattended; never ask questions. Do NOT queue, commit or push anything.

The next slot is {{SLOT}} IST. Find the post queued for it: the entry in sources/roster.json with that slot (or decks/story-*/draft.json with that slot if not yet approved).

1. `node scripts/news/candidates.mjs 6 > /tmp/news-fresh.json` then `node scripts/news/score.mjs /tmp/news-fresh.json > /tmp/news-fresh-scored.json`.
2. A replacement is worth it only if a story has beginner >= 2.3, topic != not_dev, and `engagement` at least 1.5x the queued story's. Otherwise print "fresh check: keep <slug>" and stop.
3. If worth it: verify the facts from the source, then build decks/story-<slug>/ exactly as scripts/news/prompts/batch.md step 4 describes, with "replaces": "<queued slug>" in draft.json.
4. Notify: osascript -e 'display notification "Fresher story for {{SLOT}}: <title>. Say: approve story batch" with title "allahabadi.dev"'
