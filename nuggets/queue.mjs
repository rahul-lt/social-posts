// Usage: node nuggets/queue.mjs <id> [id ...]
// Queues rendered nuggets (nuggets/out/<id>/) as LinkedIn image posts: posts/nugget-<id>/ at the post's publishAt.
// Render first: python3 nuggets/render.py <id> ...
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const posts = JSON.parse(fs.readFileSync(path.join(here, 'posts.json'), 'utf8'));

for (const id of process.argv.slice(2)) {
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error(`Unknown nugget ${id}`);
  const out = path.join(here, 'out', id);
  const slug = `nugget-${id}`;
  execFileSync('node', [path.join(root, 'scripts/add-post.mjs'), slug, out, post.publishAt, path.join(out, 'caption.txt'), 'linkedin'], { stdio: 'inherit' });
  // The card text is the image's real content, so it is the alt text.
  const metaFile = path.join(root, 'posts', slug, 'post.json');
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  meta.altText = [post.card.text, post.card.code].filter(Boolean).join('\n\n');
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
}
