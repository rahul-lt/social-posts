# Nugget learnings

What we know about short LinkedIn nugget posts for Frontend Master (linkedin.com/in/frontendmaster, 2.5K followers).
The `tech-nugget` skill reads this file before writing anything. Update it after every review round.

**Audience:** B.Tech CS students and developers with 0-2 years of experience, mostly India.
**Pillars:** frontend (core, ~50%), AI for developers (~25%), backend basics (~15%), career (~10%).

## Competitor research (scraped 2026-10-14, posts 3 weeks to 3 months old)

| Profile | Followers | What they post | What actually gets reactions |
|---|---|---|---|
| Arpit Bhayani | 295K | Daily. Deep "here's how X works" explainers (Zanzibar, LSM trees, G1 GC, subagents), one-line takes, own product updates (px0, tdd.cat) | One-liners and opinions: "Soft skills are not really soft anymore" 2,181 / 86 comments; "Just because something is written in Rust, does not make it better" 1,007; product launch with a bold number (px0, "20MB RAM, starts in 1ms") 1,486. Deep explainers: 180-880. Product changelogs: 100-200 |
| Akshay Saini | 664K | X-style screenshot cards (white or black) with one career/AI thought, AI opinion posts, course launches | Image-only posts get 330-1,600. Questions to students ("Is B.Tech CS still worth it?") 282 / 24 comments. Teachers' Day personal story 1,234. Launch/sale posts: 11-600 |
| Yomesh Gupta | 31K | Almost every post promotes devtools.tech (courses, roadmaps, sales) | 10-55 reactions. Promo every day kills reach. Best: AI-and-thinking opinion (24) and a Claude Code-from-scratch video (53) |
| Anuj Sharma | 18K | Job lists with links, ads for FrontendGeek, tool links | 2-84 reactions. Link-heavy job dumps barely move. Same post reposted 3x the same day |

### Patterns worth copying
1. **One sharp line beats a long post** for reach. Arpit's and Akshay's top posts are 1-3 lines. The card IS the post; the caption adds depth for people who stop.
2. **X-style card image.** Akshay's main format: avatar, name, handle, 1-3 sentences, plain white or black background, nothing else. Easy to read in the feed and easy to reshare.
3. **"Here's how X works... Hope this helps."** Arpit's explainer formula: name the thing, the problem, the mechanism in plain steps, the broader lesson. We do the beginner version of this every morning.
4. **Ask students a real question.** Questions about college, AI and careers pull comments, and comments drive reach.
5. **Fundamentals language.** "Fundamentals outlive frameworks" lands well with this audience on both profiles.
6. **AI + engineering judgement** is the hottest topic right now (reviewing AI code, agents as loops, what to learn).

### Patterns to avoid
- Daily promotion (Yomesh, Anuj): reactions drop into single digits. Keep promo to at most 1 post in 10.
- Link-dump job lists and posting the same thing several times a day.
- Changelog posts for our own tools unless there is a bold, concrete number.

### Reference posts (paraphrased, for tone)
- Arpit, one-liner, 1,007 reactions: being written in Rust doesn't make software better.
- Arpit, opinion, 2,181: AI can write code, docs, tests and PR descriptions; it can't decide what to build or ask the uncomfortable question, so soft skills are now hard requirements.
- Arpit, explainer, 884: Google Zanzibar's Leopard index explained step by step (groups inside groups, two lookup tables).
- Akshay, card: most developers don't need a better roadmap, they need to stop changing roadmaps every two weeks.
- Akshay, card: students think they need more time; experienced engineers wish they had started with the time students already have.
- Akshay, question, 282 + 24 comments: is 4 years of B.Tech CS still worth it?

## Our format (v1)

- **Card:** X-style card, 1080px wide, height follows the content with equal padding on all four sides
  (between ~1.6:1 and 4:5). Name "Frontend Master", handle "allahabadi.dev" (no verified tick, no fake X handle).
  Morning posts are light cards (teaching, may include code), evening posts are dark cards (takes, questions).
  Avatar is `nuggets/card/avatar.jpg`; until it exists the card shows an "FM" monogram.
- **Proof on the card (from round 1):** a teaching card carries its own evidence: code, a concrete example, real
  values or numbers. A bare claim ("X is not broken") gets rejected. Captions name their source (MDN, react.dev, OWASP...).
- **Schedule:** 2 a day, 08:00 and 20:00 IST. Morning = teach (nugget, myth, compare, predict-the-output).
  Evening = engage (one-liner, take, question).
- **Caption:** hook already on the card, so the caption explains the why in 4-8 short lines, ends with a
  question, a "save this" or a small task, and a "Source:" line for any technical claim. No em-dashes, no hype
  words, no emoji confetti. Footer from `footer.txt` is appended automatically. A predict-the-output caption
  never starts with the answer (LinkedIn shows the first lines above "see more").
- **Card text limits:** ~280 characters of text; code lines at most 36 characters, at most ~9 lines.
  `render.py` fails if text drops below 35px or a code line would render below 35px.

## Taste log (from review votes)

Updated by the skill after each review round. Newest first.

- 2026-10-14, round 1 (11 of 60 voted: 10 agree, 1 disagree, 0 discard).
  - Design, 3 notes: code text too small to read. Design, 2 notes: top and bottom space much bigger than the
    sides. Both marked "applicable to all".
    → Card now hugs its content with equal padding; code renders at 35px+ (lines capped at 36 chars).
  - Disagree n03 (StrictMode myth): "just a random line, nothing to back, missing facts and example".
    → Every teaching card now carries proof (code, example, values) and every caption names a source.
  - Liked across all 4 pillars and 6 formats: predict-output (n01, n09), compare (n05), nugget with a concrete
    analogy and its catch (n07, n11), one-liners with a reason (n04, n06, n10), question (n08). No format was
    rejected, so the format mix stays.
  - User asked for a fresh 60 rather than a sync: batch 1 moved to `archive/batch-1.json` (its 10 agreed posts are
    a backlog), batch 2 = n61-n120 for the same dates.
- 2026-10-14: batch 1 (n01-n60) published for review.
