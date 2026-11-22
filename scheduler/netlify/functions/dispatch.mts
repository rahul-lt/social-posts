// Every minute: if any post is due and not yet published, start the "Publish scheduled posts" workflow once.
// The workflow publishes everything due, so one dispatch covers all due slugs.
import { db, gh } from "../lib.mts";

const RETRY_MIN = 20;  // re-dispatch if the post still isn't published this long after the last try
const MAX_ATTEMPTS = 3;

export default async () => {
  const now = new Date();
  const retryBefore = new Date(now.getTime() - RETRY_MIN * 60e3).toISOString();
  const due: { slug: string; attempts: number }[] = await db(
    `sp_scheduled_posts?select=slug,attempts&published_at=is.null&publish_at=lte.${now.toISOString()}` +
    `&attempts=lt.${MAX_ATTEMPTS}&or=(dispatched_at.is.null,dispatched_at.lt.${retryBefore})`,
  );
  if (!due.length) return;

  const res = await gh("actions/workflows/publish.yml/dispatches", { method: "POST", body: JSON.stringify({ ref: "main" }) });
  const slugs = due.map((d) => d.slug);
  await db("sp_dispatch_log", { method: "POST", body: JSON.stringify({ slugs, status: res.status, note: res.ok ? null : await res.text() }) });
  if (!res.ok) throw new Error(`dispatch failed: ${res.status}`);

  for (const d of due) {
    await db(`sp_scheduled_posts?slug=eq.${encodeURIComponent(d.slug)}`, {
      method: "PATCH", body: JSON.stringify({ dispatched_at: now.toISOString(), attempts: d.attempts + 1 }),
    });
  }
  console.log(`dispatched for ${slugs.join(", ")}`);
};

export const config = { schedule: "* * * * *" };
