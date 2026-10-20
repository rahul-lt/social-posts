You are preparing a batch of 3 LinkedIn news-story posts for allahabadi.dev (audience: students and 0-2 year developers in India).
Working directory: ~/Documents/GitHub/social-posts. Run unattended; never ask questions. Do NOT queue, commit or push anything.

Slots for this batch: {{SLOTS}} (IST, today or after midnight).

1. Candidates: `node scripts/news/candidates.mjs 30 > /tmp/news-cand.json` then `node scripts/news/score.mjs /tmp/news-cand.json > /tmp/news-scored.json`.
   Candidates already exclude every URL in sources/roster.json and in existing decks/story-*/draft.json files (check those drafts too).
2. Pick 3 stories: beginner >= 2, topic != not_dev, highest `engagement` (HN points, else Bluesky likes+reposts+quotes, else Substack likes x3), 3 different topics where possible.
   Prefer stories that are funny, strange or relatable for a student (apps they use, AI tools, jobs, everyday things getting hacked). Skip politics, lawsuits and sponsor posts.
3. Verify every fact you will use by reading the source (WebFetch, or curl when blocked). Use only facts you read. If a source cannot be read, pick another story.
4. For each story create decks/story-<short-slug>/:
   - anim.html: copy the structure of decks/story-fridge-hack/anim.html and decks/story-whatsapp-hidden-ai/anim.html (LinkedIn illustration style: thin dark outlines, offset flat colour fills, simple friendly characters, confetti backdrop, floor band, no header/footer/brand). Use scripts/news/story.css and story.js helpers. Headline = one friendly question hook (<= 9 words). Sub-line = one short sentence. Animate the key idea in render(t); the final frame (t=1) must show the payoff clearly.
   - Render: `python3 scripts/news/gif.py decks/<slug>/anim.html decks/<slug>/story.gif`. Extract the last frame and one middle frame to PNG and look at them. Fix any overlap, clipped text or text outside its box, then re-render.
   - caption.txt: the hook question, 2 short friendly paragraphs with the verified facts, one "The lesson:" line for developers, then `Full story: <url>`. No hashtags or footer (added later). No em-dashes.
   - draft.json: {"slot": "<ISO with +05:30>", "category", "title", "url", "source", "hnPoints", "hnUrl", "engagement", "beginner", "altText"}.
5. Finish with: osascript -e 'display notification "3 story GIFs ready for {{SLOTS}}. Open Claude and say: approve story batch" with title "allahabadi.dev"'
   and print a one-line summary per draft.
