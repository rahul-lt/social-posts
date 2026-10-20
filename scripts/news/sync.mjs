// Writes sources/roster.data.js (roster.json + slot list + LinkedIn URLs from published.json)
// so sources/roster.html works when opened straight from disk.
import fs from "node:fs";

const root = new URL("../../", import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, root), "utf8"));
const roster = read("sources/roster.json");
const published = read("published.json");

const slots = [];
for (let d = new Date(`${roster.from}T00:00:00Z`); d <= new Date(`${roster.until}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
  for (const t of roster.slots) slots.push(`${d.toISOString().slice(0, 10)}T${t}:00${roster.timezone}`);
}
const posts = roster.posts.map((p) => ({ ...p, linkedin: published[p.slug]?.linkedin?.url || null }));
// Slots already gone by when the roster starts (the 14:00 on day one) are dropped, not shown as missed.
const firstPost = posts.length ? Date.parse(posts[0].slot) : Infinity;
const data = { generatedAt: new Date().toISOString(), slots: slots.filter((s) => Date.parse(s) >= firstPost), posts, manual: roster.manual };

fs.writeFileSync(new URL("sources/roster.data.js", root), `window.ROSTER = ${JSON.stringify(data, null, 1)};\n`);
console.log(`roster.data.js: ${data.slots.length} slots, ${posts.length} posts, ${posts.filter((p) => p.linkedin).length} live`);
