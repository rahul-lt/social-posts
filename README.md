# social-posts

Scheduled carousel publishing to Instagram + LinkedIn (max 10 slides) via GitHub Actions.

## Add a post

```bash
node scripts/add-post.mjs react-hooks ~/carousels/react-hooks "2026-10-20T09:30:00+05:30" caption.txt
git add posts && git commit -m "post: react-hooks" && git push
```

- Slides are converted to JPEG (`posts/<slug>/01.jpg …`), sorted by filename.
- Optional `post.json` fields: `instagramCaption`, `linkedinCaption`, `platforms` (default both), `altText`,
  `title` (document name on LinkedIn).
- Instagram gets the slides as an image carousel; LinkedIn gets them as one PDF document post (swipeable carousel).
- The `Publish scheduled posts` workflow runs every 15 min and publishes posts whose `publishAt` has passed.
  Results land in `published.json`; a platform already recorded there is never posted again.
- Publish now: Actions → Publish scheduled posts → Run workflow → `only_post = <slug>` (tick dry run to test).

> Slides are public in this repo as soon as they're pushed — Instagram fetches them from `raw.githubusercontent.com`.

## One-time setup

1. `.env.local` (gitignored):
   ```
   LINKEDIN_CLIENT_ID=...
   LINKEDIN_CLIENT_SECRET=...
   IG_ACCESS_TOKEN=...   # Meta app → Instagram → API setup with Instagram login → Generate token
   ```
2. `node --env-file=.env.local scripts/linkedin-auth.mjs` → approve in browser.
3. `node --env-file=.env.local scripts/instagram-token.mjs`
4. Push secrets to Actions (values never printed):
   ```bash
   grep -E '^(IG_ACCESS_TOKEN|IG_USER_ID|LINKEDIN_ACCESS_TOKEN|LINKEDIN_AUTHOR_URN)=' .env.local \
     | gh secret set -f - -R rahul-lt/social-posts
   ```

## Token renewal (~every 55 days)

Both tokens last 60 days (`*_TOKEN_EXPIRES` in `.env.local`). Re-run steps 2–4.
