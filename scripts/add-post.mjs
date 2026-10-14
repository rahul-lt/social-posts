// Usage: node scripts/add-post.mjs <slug> <slides-dir> <publishAt ISO, e.g. 2026-10-20T09:30:00+05:30> <caption.txt> [platforms]
// Copies up to 10 slides into posts/<slug>/ as JPEG (Instagram accepts JPEG only) and writes post.json
// with footer.txt appended to the caption.
// Uses macOS `sips` for PNG→JPEG so no npm deps are needed.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [slug, srcDir, publishAt, captionFile, platforms = 'instagram,linkedin'] = process.argv.slice(2);
if (!slug || !srcDir || !publishAt || !captionFile) {
  console.error('Usage: node scripts/add-post.mjs <slug> <slides-dir> <publishAt> <caption.txt> [instagram,linkedin]');
  process.exit(1);
}
if (Number.isNaN(Date.parse(publishAt))) throw new Error(`Bad publishAt: ${publishAt}`);

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'posts', slug);
if (fs.existsSync(outDir)) throw new Error(`posts/${slug} already exists`);

const slides = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!slides.length) throw new Error(`No PNG/JPEG slides in ${srcDir}`);
if (slides.length > 10) throw new Error(`${slides.length} slides — max is 10`);

fs.mkdirSync(outDir, { recursive: true });
slides.forEach((f, i) => {
  const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}.jpg`);
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', path.join(srcDir, f), '--out', out], {
    stdio: 'ignore',
  });
});

// Every post ends with the shared footer (footer.txt); skip if the caption already has it.
const footer = fs.readFileSync(path.join(root, 'footer.txt'), 'utf8').trim();
const body = fs.readFileSync(captionFile, 'utf8').trim();
const caption = body.includes(footer.split('\n')[0]) ? body : `${body}\n\n${footer}`;

const post = {
  publishAt: new Date(publishAt).toISOString(),
  platforms: platforms.split(','),
  caption,
  altText: slug.replace(/-/g, ' '),
  // Shown as the document name on the LinkedIn PDF carousel; edit in post.json.
  title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
};
fs.writeFileSync(path.join(outDir, 'post.json'), JSON.stringify(post, null, 2) + '\n');
console.log(`Added posts/${slug} (${slides.length} slides) → publishes ${post.publishAt}`);
