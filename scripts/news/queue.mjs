// Queues an approved story draft: adds posts/<slug> for its slot (LinkedIn only), records it in
// sources/roster.json and drops any post it replaces. Commit and push afterwards.
// Usage: node scripts/news/queue.mjs <slug> [...more slugs]
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const root = new URL("../../", import.meta.url).pathname;
const rosterPath = `${root}sources/roster.json`;

for (const slug of process.argv.slice(2)) {
  const deck = `${root}decks/${slug}`;
  const d = JSON.parse(fs.readFileSync(`${deck}/draft.json`, "utf8"));
  const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));

  if (d.replaces) {
    fs.rmSync(`${root}posts/${d.replaces}`, { recursive: true, force: true });
    roster.posts = roster.posts.filter((p) => p.slug !== d.replaces);
  }
  fs.mkdirSync(`${deck}/gif`, { recursive: true });
  fs.copyFileSync(`${deck}/story.gif`, `${deck}/gif/01.gif`);
  execFileSync("node", [`${root}scripts/add-post.mjs`, slug, `${deck}/gif`, d.slot, `${deck}/caption.txt`, "linkedin"], { stdio: "inherit" });

  const postPath = `${root}posts/${slug}/post.json`;
  const post = JSON.parse(fs.readFileSync(postPath, "utf8"));
  Object.assign(post, { altText: d.altText, title: d.title.slice(0, 60) });
  fs.writeFileSync(postPath, JSON.stringify(post, null, 2) + "\n");

  const { category, title, url, source, hnPoints, hnUrl, beginner } = d;
  roster.posts.push({ slot: d.slot, slug, items: [{ category, title, url, source, hnPoints, hnUrl, beginner }] });
  roster.posts.sort((a, b) => Date.parse(a.slot) - Date.parse(b.slot));
  fs.writeFileSync(rosterPath, JSON.stringify(roster, null, 2) + "\n");
  fs.renameSync(`${deck}/draft.json`, `${deck}/queued.json`);
}
execFileSync("node", [`${root}scripts/news/sync.mjs`], { stdio: "inherit" });
