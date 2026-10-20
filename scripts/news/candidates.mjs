// Collect recent items from every source in sources/index.html, attach engagement, drop already-used URLs.
// Usage: node scripts/news/candidates.mjs [hours=30] > out.json
import fs from "node:fs";

const hours = Number(process.argv[2] || 30);
const since = Date.now() - hours * 3600e3;
const html = fs.readFileSync(new URL("../../sources/index.html", import.meta.url), "utf8");
const js = html.split("<script>")[1].split("</script>")[0];
const SOURCES = eval(js.match(/const SOURCES = (\[[\s\S]*?\n\]);/)[1].replace(/REDDIT_EXPIRY/g, '""'));
const roster = JSON.parse(fs.readFileSync(new URL("../../sources/roster.json", import.meta.url), "utf8"));

const norm = (u) => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + x.pathname.replace(/\/$/, "") + x.search).toLowerCase(); } catch { return u; } };
const decksDir = new URL("../../decks/", import.meta.url);
const drafts = fs.readdirSync(decksDir).filter((d) => fs.existsSync(new URL(`${d}/draft.json`, decksDir)))
  .map((d) => JSON.parse(fs.readFileSync(new URL(`${d}/draft.json`, decksDir), "utf8")));
const used = new Set([
  ...roster.posts.flatMap((p) => p.items.flatMap((i) => [i.url, i.hnUrl, ...(i.related || [])])),
  ...roster.manual.map((m) => m.url),
  ...drafts.flatMap((d) => [d.url, d.hnUrl]),
].filter(Boolean).map(norm));
const get = (u) => fetch(u, { headers: { "user-agent": "tech-digest/0.1" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
const tag = (x, t) => (x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";

function parse(xml) {
  return [...xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/g)].map(([b]) => ({
    title: tag(b, "title").replace(/&amp;/g, "&").replace(/&#39;|&#8217;/g, "'").replace(/&quot;/g, '"'),
    url: (b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || tag(b, "link"),
    date: Date.parse(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date")),
  }));
}

const hnSince = Math.floor(since / 1000);
const hnQuery = new URLSearchParams({ tags: "story", numericFilters: `created_at_i>${hnSince},points>20`, hitsPerPage: "1000" });
const hn = await (await get(`https://hn.algolia.com/api/v1/search_by_date?${hnQuery}`)).json();
if (!hn.hits?.length) throw new Error("Hacker News returned no stories; refusing to rank without it");
const hnByUrl = new Map(hn.hits.filter((h) => h.url).map((h) => [norm(h.url), h]));

// Bluesky posts: link to the shared article when there is one, so HN matching and dedupe work on it.
async function bskyItems(s) {
  const { feed } = await (await get(s.f)).json();
  return feed.filter((f) => !f.reason).map(({ post: p }) => {
    const ext = p.embed?.external?.uri || p.record.embed?.external?.uri;
    const bskyUrl = `https://bsky.app/profile/${p.author.handle}/post/${p.uri.split("/").pop()}`;
    return { title: p.record.text.replace(/\s+/g, " ").slice(0, 200), url: ext || bskyUrl, bskyUrl, date: Date.parse(p.record.createdAt),
      bsky: p.likeCount + p.repostCount + (p.quoteCount || 0) };
  });
}

const out = [];
for (const s of SOURCES.filter((s) => s.f && !/github\.com\/trending|hnrss|reddit\.com/.test(s.f))) {
  try {
    const items = (s.p === "Bluesky" ? await bskyItems(s) : parse(await (await get(s.f)).text())).filter((i) => i.date >= since);
    let subs = new Map();
    if (s.p === "Substack") {
      const a = await (await get(new URL("/api/v1/archive?sort=new&limit=20", s.f))).json().catch(() => []);
      subs = new Map(a.map((p) => [norm(p.canonical_url), p]));
    }
    for (const i of items) {
      const h = hnByUrl.get(norm(i.url)), sp = subs.get(norm(i.url));
      out.push({ source: s.n, category: s.c, title: i.title, url: i.url, date: new Date(i.date).toISOString(),
        hnPoints: h?.points ?? null, hnComments: h?.num_comments ?? null, hnUrl: h ? `https://news.ycombinator.com/item?id=${h.objectID}` : null,
        likes: sp?.reaction_count ?? null, paid: sp ? sp.audience !== "everyone" : null, bsky: i.bsky ?? null, bskyUrl: i.bskyUrl ?? null });
    }
  } catch (e) { console.error("ERR", s.n, e.message); }
}
// HN itself as a source: stories not already matched to a feed item
const seen = new Set(out.map((o) => norm(o.url)));
for (const h of hn.hits) if (h.url && !seen.has(norm(h.url))) out.push({ source: "Hacker News", category: "All-round", title: h.title, url: h.url,
  date: h.created_at, hnPoints: h.points, hnComments: h.num_comments, hnUrl: `https://news.ycombinator.com/item?id=${h.objectID}`, likes: null, paid: null });

// One comparable number per story: HN points, else Bluesky likes+reposts+quotes, else Substack likes x3.
for (const o of out) o.engagement = o.hnPoints ?? o.bsky ?? (o.likes ?? 0) * 3;
const fresh = out.filter((o) => !used.has(norm(o.url)) && !(o.hnUrl && used.has(norm(o.hnUrl))));
fresh.sort((a, b) => b.engagement - a.engagement);
console.log(JSON.stringify(fresh, null, 1));
