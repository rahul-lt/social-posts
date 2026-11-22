// Mirrors posts/*/post.json (publishAt) and published.json into Supabase every 10 minutes.
import { db, gh, REPO } from "../lib.mts";

const raw = (p: string) => fetch(`https://raw.githubusercontent.com/${REPO}/main/${p}`).then((r) => r.json());

export default async () => {
  const [tree, published] = await Promise.all([(await gh("git/trees/main?recursive=1")).json(), raw("published.json")]);
  const pub = (slug: string) => published[slug]?.linkedin;
  const files = new Map<string, string>();
  for (const f of tree.tree) {
    const m = f.path.match(/^posts\/([^/]+)\/post\.json$/);
    if (m) files.set(m[1], f.sha);
  }

  const rows: { slug: string; sha: string; published_at: string | null }[] =
    await db("sp_scheduled_posts?select=slug,sha,published_at");
  const known = new Map(rows.map((r) => [r.slug, r]));

  // New or edited post.json: (re)load it. A moved publishAt re-arms the dispatcher.
  const changed = [...files].filter(([slug, sha]) => known.get(slug)?.sha !== sha);
  const upserts = await Promise.all(changed.map(async ([slug, sha]) => ({
    slug, sha, publish_at: (await raw(`posts/${slug}/post.json`)).publishAt,
    dispatched_at: null, attempts: 0, published_at: pub(slug)?.at ?? null, linkedin_url: pub(slug)?.url ?? null,
    updated_at: new Date().toISOString(),
  })));
  if (upserts.length) await db("sp_scheduled_posts", { method: "POST", body: JSON.stringify(upserts) });

  const gone = [...known.keys()].filter((s) => !files.has(s));
  if (gone.length) await db(`sp_scheduled_posts?slug=in.(${gone.map(encodeURIComponent).join(",")})`, { method: "DELETE" });

  const done = rows.filter((r) => !r.published_at && pub(r.slug)?.at);
  for (const r of done) {
    await db(`sp_scheduled_posts?slug=eq.${encodeURIComponent(r.slug)}`, {
      method: "PATCH", body: JSON.stringify({ published_at: pub(r.slug).at, linkedin_url: pub(r.slug).url }),
    });
  }
  console.log(`sync: ${upserts.length} upserted, ${gone.length} removed, ${done.length} marked published`);
};

export const config = { schedule: "*/10 * * * *" };
