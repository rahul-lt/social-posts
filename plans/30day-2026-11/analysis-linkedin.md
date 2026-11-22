# LinkedIn analysis: what works for Frontend Master (allahabadi.dev)

Data: top 50 posts of the last 90 days by impressions (scraped 2026-11-22, `linkedin-top50-90d.tsv`), matched by caption to
`posts/<slug>/post.json`, `published.json` (actual post time) and `nuggets/posts.json` (format, pillar, card style).
Anything not in the top 50 got **<238 impressions** (exact number unknown). 111 posts went out through the repo
(98 nuggets, 8 GIF stories, 4 PDF explainers, 1 carousel); 31 of the top 50 are repo posts, the other 19 are manual posts
(links, digests, text, promo).

Caveats:
- Flops have no exact number, so medians treat them as "<238" and means are a lower bound (flops = 0).
- Format, slot, card style and hook type were assigned together in the Nov 4-17 plan (every 23:30 post was an "AI wrote this"
  code-review, every 07:00 post an interview-hook code-review, every 12:00 post a career one-liner). Slot and hook effects
  cannot be fully separated from format.
- n173-n176 were 4-5 days old at scrape time.

## 1. Formats ranked (repo posts, Oct 13 - Nov 17)

| # | Format | n | >=238 | >=4k | Median | Mean (lower bound) | Best |
|---|---|---|---|---|---|---|---|
| 1 | **Code-review card** (navy, 2 panels red/green, title = symptom + "Why?") | 28 | 16 | 10 | **741** | **4,338** | 19,215 (n137) |
| 1a | ...week 2 (Nov 10-17) | 15 | 14 | 9 | **6,940** | 7,027 | 13,582 |
| 1b | ...week 1 (Nov 4-10) | 13 | 2 | 1 | <238 | 1,543 | 19,215 |
| 2 | Career dilemma question ("Pick one: A) B)") | 11 | 5 | 1 | <238 | 3,563 | 34,650 (n147) |
| 3 | Take (AI / career opinion) | 10 | 2 | 1 | <238 | 1,432 | 14,029 (n66) |
| 4 | One-liner card (dark, no code) | 22 | 6 | 1 | <238 | 1,049 | 21,582 (n90, env-var leak) |
| 4a | ...12:00 career one-liners | 14 | 3 | 0 | <238 | 62 | 360 |
| 5 | Self-check ("open your live app and...") | 6 | 1 | 0 | <238 | 267 | 1,603 (n151) |
| 6 | PDF explainer carousel (security news) | 4 | 2 | 0 | ~120 | 136 | 297 |
| 7 | Light teaching nugget | 10 | 1 | 0 | <238 | 28 | 280 |
| 8 | Compare (A vs B code) | 5 | 0 | 0 | <238 | 0 | <238 |
| 9 | Predict-output with "Comment your guess first. Answer below." | 6 | 0 | 0 | ~21 | 0 | <238 |
| 10 | News GIF story | 8 | 0 | 0 | ~91 | 0 | <238 |

Manual posts: weekly digest 785 / 249, blog links 784 / 628 / 306, own-tool promo 509 / 377 / 264 / 261 / 238, text 617 / 393 / 268.
Link posts land at 250-800: never a breakout.

## 2. Winners vs losers inside the same format

**Code-review (28).** Winners (>=4k): n137 await-in-forEach 19,215 · n165 var/let setTimeout 13,582 · n161 div-as-button a11y
13,157 · n172 100vh vs dvh 13,003 · n168 `fill([])` seat map 12,964 · n152 useEffect fetch loop 11,526 · n169 Promise.all
dashboard 10,580 · n160 z-index stacking context 10,557 · n148 `type="number"` "2"+1 6,940 · n156 indexOf truthiness 4,744.
Middle (~1k): n149 0.1+0.2 · n153 early return before hook · n157 map(parseInt) · n141 key resets state 840 · n164 fetch try/catch 642 · n176 lazy-load 238.
Flops (<238): n121 index as key · n124 timer stuck at 1 · n125 resize listener leak · n128 async effect · n129 fetch on every
render · n132 catch before then · n133 button type submit · n136 object keys · n140 buildIndex per keystroke · n144 innerHTML XSS
· n145 JSON deep copy · n173 layout shift.

**Career question (11).** Winners: n147 deep React vs full-stack (34,650, 20 comments), n64 ₹6 LPA startup vs ₹9 LPA service
(3,563). Same shape that failed: n131 remote, n159 hike vs senior (404), n171 placements, n68, n78 DSA vs projects, n84, n88.

**Take / one-liner (32).** Winners: n90 "Your React app cannot keep a secret" (21,582), n66 "AI won't take your job; the AI-fluent
teammate will" (14,029). Every later AI-and-career take flopped (7 posts, all <=296). Fourteen 12:00 career one-liners: best 360.

**Self-check (6).** Only n151 (form without method sends password in URL, 1,603) cleared 238.

## 3. The split inside code-review cards

1. **Time / format momentum (strong, n=28).** Week 1: 2 of 13 cleared 238. Week 2: 14 of 15, 9 above 4k. Nothing in the pipeline
   changed. The turn came after n137 and n147 broke out. Other formats did not rise in week 2, so it is format-specific.
2. **Weekend mornings (suggestive, n=14).** 07:00 interview-hook cards: Sat/Sun 3 of 4 broke out, weekdays 1 of 10.
   The ~1.1k plateau (n149, n153, n157, n141) is all weekday mornings.
3. **Hook: state the symptom, don't ask "would you merge it?" (n=6).** All "Would you merge/approve/catch it?" first lines
   underperformed. Winners end line 1 on a consequence: "...your backend team is about to message you."
4. **Product scenario + visible symptom in the card title (plausible).** "Add a seat to row 1. Why did every row get it?",
   "The Pay button is hidden on phones. Why?" beat language puzzles like map(parseInt).
5. **"The AI built..." vs "in your machine coding round"**: confounded with slot. Both produced 10k+ posts. Use both.
6. **No effect found:** posting delay (rho -0.04, n=56), hour, hashtags, ending with a question. Shorter captions very slightly better.

## 4. Cadence

| Period | Cadence | Posts | >=238 | >=4k | Top-50 impressions/day |
|---|---|---|---|---|---|
| Oct 14 - Nov 3 | 2/day | 42 | 19% | 3 | ~1.9k |
| Nov 4 - 10 | 4/day | 28 | 14% | 2 | ~7.9k |
| Nov 10 - 17 | 4/day | 28 | 68% | 9 | ~14.9k |

4/day did not hurt neighbours (posts seconds apart still broke out). The 12:00 one-liner slot gave nothing.
**Recommendation: 3/day** (07:00, 19:00-21:00, 23:30 IST). Not proven, just "remove the slot that never worked".

## 5. Posting times (IST)

| Slot | Use for |
|---|---|
| 07:00-09:00 | Interview-hook code-review; strongest topics on Sat/Sun |
| 19:00-21:00 | Career dilemma question / leak self-check / weekly link post |
| 23:30 | "The AI built..." code-review |
| 12:00 | stop |

## 6. Stop doing

- "Comment your guess first. Answer below." + dot padding.
- 12:00 career one-liners; generic "AI changed the junior role" takes.
- News GIF stories and news bursts.
- Light teaching nuggets and compare cards without a bug/symptom framing.
- Hooks ending in "Would you merge it?".
- Self-checks about tooling chores. Keep only leak/security consequences.
- Promo as the post. Promo in first comment, max 1 in 10.

## 7. Recommended 30-day mix (3/day = 90 posts)

| Format | Share | Posts | Slot |
|---|---|---|---|
| Code-review card, "The AI built X..." hook | 30% | 27 | 23:30 |
| Code-review card, interview / machine-coding hook | 30% | 27 | 07:00 |
| Career dilemma question | 13% | 12 | 19:00-21:00 |
| Leak / user-visible-consequence self-check | 10% | 9 | 19:00-21:00 |
| Link post (blog / weekly digest) | 7% | 6 | 19:00 weekly |
| Experiments (take with hard number, follow-up to breakout, PDF of top code-reviews) | 10% | 9 | evening |

Follow-up rule: when a post passes ~5k in 48h, schedule a sibling within 3 days.

## 8. Rules for writers

1. Default post = navy two-panel code-review card: red "AI-generated"/"Common answer" panel, green "What I'd merge" panel, 1-2 highlighted lines, one-line note.
2. Card title = product scenario + visible symptom + "Why?". Max 2 lines.
3. Real product in the scenario: checkout, cart, seat map, dashboard, dropdown, login form, booking page.
4. Prefer bugs visible on screen over language trivia.
5. Caption line 1 states the consequence and stops. Never "Would you merge/approve/catch it?".
6. Alternate hook families: "The AI built a <feature>. <What breaks>." and "<Do X> in your machine coding round and <consequence>."
7. Concrete stakes: backend team messages you, interviewer follow-up, senior round, leaked password.
8. Caption: "Look at the card." → mechanism in plain steps → fix → where it bites → "Source: MDN/react.dev ...". 550-700 chars.
9. No comment commands, no "answer below", no dot padding, no bold-unicode, no emoji lists.
10. Fact-check every claim and code line; run the snippet.
11. Classic interview questions go on Sat/Sun 07:00-09:00.
12. Each week, the 2 strongest code-review topics go on Saturday and Sunday mornings.
13. Career question: two named paths a 0-2 yr dev faces now, real trade-off. "Pick one: A) ... B) ...".
14. Career caption opens balanced ("Both paths get people hired..."), then the trade-off for each. Max 3/week.
15. Don't repeat dilemmas already run (startup vs service, deep vs full-stack, hike vs senior, DSA vs projects).
16. AI takes need a concrete number, named tool or specific workflow.
17. Self-checks only for leaks or user-facing failures.
18. 3 posts/day: 07:00, 19:00-21:00, 23:30 IST.
19. Links only in the weekly link post or first comment.
20. Keep the 5 hashtags and footer.
21. No news GIF stories. Security incidents only as a PDF carousel, max 1/week.
22. Topic pool: React hooks/effects, async, CSS layout, forms/a11y, JS reference/equality traps, perf with a visible symptom.
23. Breakout (>5k in 48h) → sibling within 3 days.
24. Never reuse a bug already posted; check `nuggets/posts.json` and `nuggets/archive` first.
