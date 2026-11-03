# Content playbook (LinkedIn + Instagram)

Built 2026-11-04 from three teardowns. Read this before writing any post or batch.

| Source | What I looked at |
|---|---|
| Frontend Master (us), LinkedIn | 160 posts with owner-only impressions, 4 post-analytics pages |
| Piyush Agarwal (`linkedin.com/in/piyush-eon`, ~70K followers) | 80 posts: reactions / comments / reposts, image grid |
| `@codewithnishchal`, Instagram (324K) | 90 photo/carousel posts: likes, comments, captions, 20 cards viewed |

Report links: our LinkedIn https://claude.ai/artifact/2PsHMTLdh6NK8x3nBavcd1 ·
Nishchal https://claude.ai/artifact/GcS8i6pUvqr9QWhnEf8TTE

---

## 1. Our numbers (LinkedIn, to 4 Nov)

| Format | Posts | Median impressions | Best |
|---|---|---|---|
| Teaching nugget (card + explanation) | 35 | 163 | 21,535 |
| Opinion question, no "comment" command | 8 | 136 | 3,561 |
| Promo / link | 5 | 109 | 183 |
| News story GIF / explainer | 12 | 91 | 289 |
| **"Comment your guess first. Answer below."** | 6 | **21** | 24 |

- Guess-bait posts reached **8 members** (sort() post, 0 reactions). That's suppression, not a weak topic.
  Same 08:00 slot, other posts: median 166. The command + dot padding is the cause.
- Winners went 97-98% **out-of-network**: n90 (`NEXT_PUBLIC_` vars leak into the bundle, 22 saves),
  n66 (AI won't take your job, the AI-fluent teammate will), n64 (₹6 LPA startup vs ₹9 LPA service co).
- A typical post reaches ~124 people, 72% in-network. Breakout needs saves/comments from that first batch.
- Volume: per-post median fell 481 → 131 when we went to 2-3/day, but weekly total reach rose ~3x.
- Breakouts converted badly: ~25K reached, 32 followers gained.

## 2. Piyush Agarwal: what to copy

**Context first.** He has 27x our followers, but his median post gets ~40 reactions. He's a style
benchmark, not a reach benchmark. On the same topics we both covered, results were similar:
`NEXT_PUBLIC_` leak (his 82 reactions vs our 86), eMudhra (his 290 vs our 1), setCount batching
(his 26 reactions / 4 comments vs our guess-bait version: 0 / 0).

| His format | Posts | Median reactions | Median comments | Best |
|---|---|---|---|---|
| Interview-stakes hook + code card | 13 | 59 | **9** | 185 |
| Explainer with bold-unicode headings (older style) | 29 | 48 | 2 | 471 |
| Motivational one-liner image | 8 | 60 | 0 | 142 |
| Same-day tech news (with meme or stat card) | 18 | 13 | 1 | 290 |
| Interview Q&A document carousel | 3 | 16 | 2 | 22 |
| Promo / course / tutorial link | 9 | 17 | 1 | 94 |

His newest format (last ~3 weeks) gets the most comments. Its parts:

### 2a. Hook: interview stakes, first line
The first line names a specific thing the reader might do and the consequence in an interview.
Shapes (our wording):
- "Do X in a machine coding round and you'll fail that round."
- "If your answer to 'A or B?' is still the 2021 answer, you've already lost the round."
- "Your AI assistant wrote this. It works. Would you approve the PR?"

The stakes are concrete (rejection, a broken demo, a leaked key), the reader is "you", and the
claim is checkable. **There's no command to comment.**

### 2b. Caption: one walk-through
1. Hook (above "…more").
2. Scenario: "a product list, a sort button, 20 minutes on the clock".
3. "Look at the card." Point at the bad snippet.
4. Mechanism in plain words, step by step (what React / the browser actually does).
5. Authority: "the React docs call this out", "Next.js 16 changed this".
6. Fix in one line.
7. Close: a one-line principle ("AI writes code that works; spotting code that shouldn't be
   merged is still your job"). Sometimes a real question. Promo only as "link in the comments".

### 2c. Card design
- Dark navy card. A **bold question headline** at the top (2 lines max).
- **Two editor-window panels** (traffic-light dots + filename): top one labelled red ("AI-generated",
  "Typical AI output", "Promise.all"), bottom one labelled green ("What I'd merge", "allSettled").
- Red / green **line highlights** on the exact lines that matter; `// comments` inside the code
  explain the outcome.
- **One-line takeaway** under the panels, small `@handle` watermark.
- News gets a different card: a big orange number + dot-grid stat graphic (Microsoft 60,000).
  Light/funny news gets a meme (butterfly or Drake templates).

### 2d. What doesn't work for him either
- Same-day news: median 13 reactions. Same as our story trial (median 91 impressions).
- Document carousels of interview Q&A: 16.
- Promo posts: 17.
- Bold-unicode text everywhere: an older style he has since dropped.

## 3. @codewithnishchal: what to copy

- **One X-style card template, every time:** black background, avatar + name + handle,
  1-3 lines of white text, **one keyword in green**.
- **One line, one tension.** All 10K+ cards contrast something: 2026 vs 2016, 10 LPA vs 4 LPA,
  loyal to work vs to company, a serious list that turns into a joke.
- **Indian context wins:** cricket news turned into a career moral (his top post, 97K), LPA/salary,
  Hinglish idioms, service → product company.
- **Generic motivation is his weakest type** (median 727 likes). Specific motivation works
  ("one day you'll reject the companies rejecting you", 42K).
- **"Comment KEYWORD for the PDF" = lead capture, not reach.** Up to 3.5K comments but low likes,
  and none reached 10K. The comments are 🙌 with automated "Sent!" replies.
- A false "hack" got 20K. **Don't copy that.** The fact-check rule stays.

## 4. Rules for our posts (merged)

### Always
- **Hook = stakes + specificity in line 1.** Interview rejection, a leaked key, a blank screen,
  money, your first offer. Name the API/tool (`NEXT_PUBLIC_`, `.sort()`, `Promise.all`).
- **The card shows the bug; the caption explains it.** Prefer a red/green two-panel card
  ("AI wrote this" vs "what I'd merge"). This is the strongest code format seen across all three accounts.
- **Make it saveable:** a check the reader can run in 30 seconds ("open DevTools, search your bundle for `sk-`").
- **One authority line** (MDN, react.dev, the Next.js docs) plus a `Source:` line.
- **Close with a principle or a real question**: "which one, and why?" when the post is a choice.
- **AI angle where it's natural:** "the AI wrote it, would you merge it?" frames code review as the
  skill that matters. It works for both Piyush and us (n66).

### Never
- "Comment your guess", "comment X", "drop a 🙌", dot padding (`.\n.\n.`), answer-below tricks.
- Bold-unicode text (𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀). Not searchable, unreadable for screen readers, and dated.
- Generic motivation ("trust your grind").
- Bursts: at most 2 posts a day; no 10-post news days.
- Promo as the post. Promo goes in the first comment, at most 1 post in 10.
- Unverified "hacks" or numbers.

### Predict-the-output, done right
Keep the puzzle and drop the command. Card: "You click once. What shows up? What gets logged?"
Caption line 1 states the stakes ("Most people say 3. It's 1, and the console says 0."), then the
walk-through. The reader can still guess from the card. We just don't ask them to comment.

## 5. Weekly plan (proposal)

| Slot | Format | Example |
|---|---|---|
| 08:00 IST, Mon-Fri | Stakes hook + red/green code card | AI-generated search filter vs what I'd merge |
| 20:00 IST, Mon/Wed/Fri | Career / AI / India take (Nishchal-style one-liner card) | First offer: 6 LPA startup vs 9 LPA service co |
| 20:00 IST, Tue/Thu | "Your app is leaking / slow" self-check | env vars in the bundle, source maps in prod |
| Sat | One carousel (PDF document post) | 6 interview questions with say-out-loud answers |
| Sun | Off, or the week's best evergreen post adapted from a winner | |

When a post passes ~2K impressions: pin a comment with the related resource and write a follow-up
within 48 h.

## 6. Pre-queue checklist

- [ ] Does line 1 carry stakes and name a specific API, tool or number?
- [ ] Does the card show a concrete bug/contrast (red vs green), not a bare claim?
- [ ] Can the reader run a check or save it for an interview?
- [ ] No "comment …" command, no dot padding, no answer-below?
- [ ] Facts checked, `Source:` line present?
- [ ] At most 2 posts today? No other promo in the last 10?

## 7. Open items

- Rewrite the queued guess posts `nugget-n107` (6 Nov) and `nugget-n117` (11 Nov) to section 4's
  predict-the-output pattern.
- Build a red/green two-panel code card variant in `nuggets/card/`.
- Re-check this table after 2 weeks of the new rules (impressions + saves per format).
