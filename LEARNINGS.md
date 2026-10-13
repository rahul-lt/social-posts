# Learnings

Everything we figured out while building this pipeline. Add to it whenever something surprises us.

## Post rules
- Captions stay very short: one hook line + one line of context.
- Every post ends with the footer in `footer.txt`. `scripts/add-post.mjs` appends it automatically.
- Max 10 slides per carousel (Instagram API cap, even though the app allows 20).
- Slides are built with the sticker-carousel skill in `decks/<topic>/` (shared kit in `decks/_kit/`),
  rendered to `decks/<topic>/out/*.png`, then added with `add-post.mjs`.
- Slide footer handle is `@allahabadi.dev` (the Instagram account we post to).

## Workflow
```bash
cd decks/<topic> && python3 build.py && python3 ../_kit/render.py   # must print "done. gate clean."
cd ../.. && node scripts/add-post.mjs <slug> decks/<topic>/out "<ISO time>" decks/<topic>/caption.txt
git add posts && git commit -m "post: <slug>" && git push            # cron publishes when due
```
Publish immediately: Actions → Publish scheduled posts → Run workflow → `only_post=<slug>`.

## Instagram
- API carousel limit is 10 items. JPEG only. Images must be at a public URL when the container is
  created; we use `raw.githubusercontent.com/<repo>/<commit-sha>/...` (pin the SHA, branch URLs cache).
- Account must be Professional (allahabadi.dev is MEDIA_CREATOR). Posting works via an Instagram
  Tester role on the Meta app, no app review needed for our own account.
- Meta app: "Frontend Master Publisher" (ID 2201071884123846), Instagram app "Frontend Master Publisher-IG".
- Quota: 100 API posts per rolling 24h.

## LinkedIn
- App: "Frontend Master Publisher" (client ID 78kmonj6vncx5u), linked to the FrontendMaster company page
  (a company page is mandatory to create an app; posts still go to the personal profile).
- Products: Share on LinkedIn (`w_member_social`) + Sign In with OpenID Connect.
- Redirect URL `http://localhost:8799/callback` (8765 was taken by an old local `python -m http.server`).
- The OAuth sign-in page has no "Continue with Google" button. Running the auth in the default browser
  where LinkedIn was already signed in worked.
- Run `scripts/linkedin-auth.mjs` from Terminal.app, not from Claude's sandboxed shell: the sandbox
  could not reach `www.linkedin.com` (token endpoint) and the exchange failed with "fetch failed".
- Paste multi-line commands as ONE line; a split line starts the Node REPL instead of the script.
- Commentary uses "little text": `( ) [ ] { } < > @ # * _ ~ | \` must be escaped or the post is cut off
  (handled in `publish.mjs`).

## Tokens
- Both tokens expire 2026-12-12 (see `*_TOKEN_EXPIRES` in `.env.local`). Renew ~Dec 5:
  re-run both auth scripts, then push secrets (README step 4).
- Never paste secrets via Claude's `!` prompt: it lands in the chat transcript.

## From the first live post (cache-control, 2026-10-13)
- LinkedIn `multiImage` renders as a GRID in the feed (cover cropped, "+N" tile), not a swipe carousel.
  A swipeable LinkedIn carousel needs a PDF document post (Documents API) instead.
  -> Switched: publish.mjs builds a PDF from the slide JPEGs (no deps, 2x JPEG = 1080x1350 pt page),
  uploads via /rest/documents, waits for AVAILABLE (~5 s), posts `content.media {id, title}`.
  Works with `w_member_social` for a personal profile.
- Publish "now" = add the post with a far-future `publishAt` and run the workflow with `only_post`;
  a past `publishAt` lets the 15-min cron race the manual run.
- Workflow checks out the branch tip (not the trigger SHA) so a queued run sees the previous run's
  `published.json` and never double-posts.
- LinkedIn read-back of posts returns 403 (needs restricted `r_member_social`); verify in the browser.

## Instagram audio
- Carousels cannot get Instagram library music via the API (Reels only). Music on carousels has to be
  added by hand in the app (after posting: not possible either; it must be chosen while posting).
- Licensed music via API exists only for Reels, through the Instagram Audio API, which requires the
  Facebook Login flavour of the API (Business/Creator account linked to a Facebook Page). We use
  Instagram Login, so not available today.
