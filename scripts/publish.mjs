// Publishes every due post in posts/<slug>/ that isn't recorded in published.json yet.
// Dependency-free so the GitHub Action needs no npm install.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const STATE_FILE = path.join(ROOT, 'published.json');
const DRY_RUN = process.env.DRY_RUN === '1';
const ONLY = process.env.ONLY_POST; // publish one slug immediately, ignoring publishAt
const MAX_SLIDES = 10;

const IG_API = 'https://graph.instagram.com/v23.0';
const LI_API = 'https://api.linkedin.com/rest';
const LI_VERSION = process.env.LINKEDIN_VERSION || '202609';

const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function http(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${url.split('?')[0]} → ${res.status}: ${text}`);
  return { res, body: text ? safeJson(text) : null };
}

function safeJson(t) {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(POSTS_DIR, d.name);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, 'post.json'), 'utf8'));
      const slides = fs
        .readdirSync(dir)
        .filter((f) => /\.jpe?g$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (!slides.length) throw new Error(`${d.name}: no .jpg slides`);
      if (slides.length > MAX_SLIDES) throw new Error(`${d.name}: ${slides.length} slides, max ${MAX_SLIDES}`);
      return { slug: d.name, dir, slides, ...meta };
    });
}

// ---------- Instagram ----------

// Meta downloads each image itself, so slides must be reachable at a public URL
// pinned to the commit that contains them.
function rawUrl(post, file) {
  const repo = env('GITHUB_REPOSITORY');
  const sha = process.env.COMMIT_SHA || env('GITHUB_SHA');
  return `https://raw.githubusercontent.com/${repo}/${sha}/posts/${encodeURIComponent(post.slug)}/${encodeURIComponent(file)}`;
}

async function igCreate(params) {
  const body = new URLSearchParams({ ...params, access_token: env('IG_ACCESS_TOKEN') });
  const { body: json } = await http(`${IG_API}/${env('IG_USER_ID')}/media`, { method: 'POST', body });
  return json.id;
}

async function igWaitReady(containerId) {
  for (let i = 0; i < 30; i++) {
    const { body } = await http(
      `${IG_API}/${containerId}?fields=status_code,status&access_token=${env('IG_ACCESS_TOKEN')}`
    );
    if (body.status_code === 'FINISHED') return;
    if (body.status_code === 'ERROR' || body.status_code === 'EXPIRED')
      throw new Error(`IG container ${containerId} ${body.status_code}: ${body.status}`);
    await sleep(5000);
  }
  throw new Error(`IG container ${containerId} not ready after 150s`);
}

async function publishInstagram(post) {
  const caption = post.instagramCaption ?? post.caption;
  const urls = post.slides.map((f) => rawUrl(post, f));
  if (DRY_RUN) return { dryRun: true, urls };

  let containerId;
  if (urls.length === 1) {
    containerId = await igCreate({ image_url: urls[0], caption });
  } else {
    const children = [];
    for (const url of urls) children.push(await igCreate({ image_url: url, is_carousel_item: 'true' }));
    containerId = await igCreate({ media_type: 'CAROUSEL', children: children.join(','), caption });
  }
  await igWaitReady(containerId);

  const body = new URLSearchParams({ creation_id: containerId, access_token: env('IG_ACCESS_TOKEN') });
  const { body: published } = await http(`${IG_API}/${env('IG_USER_ID')}/media_publish`, { method: 'POST', body });
  const { body: media } = await http(
    `${IG_API}/${published.id}?fields=permalink&access_token=${env('IG_ACCESS_TOKEN')}`
  );
  return { id: published.id, url: media.permalink };
}

// ---------- LinkedIn ----------

const liHeaders = () => ({
  Authorization: `Bearer ${env('LINKEDIN_ACCESS_TOKEN')}`,
  'LinkedIn-Version': LI_VERSION,
  'X-Restli-Protocol-Version': '2.0.0',
  'Content-Type': 'application/json',
});

// Posts API commentary is "little text": these characters must be escaped or the post gets truncated.
const escapeLittleText = (s) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`);

async function liUploadImage(file) {
  const { body } = await http(`${LI_API}/images?action=initializeUpload`, {
    method: 'POST',
    headers: liHeaders(),
    body: JSON.stringify({ initializeUploadRequest: { owner: env('LINKEDIN_AUTHOR_URN') } }),
  });
  const { uploadUrl, image } = body.value;
  await http(uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${env('LINKEDIN_ACCESS_TOKEN')}` },
    body: fs.readFileSync(file),
  });
  return image;
}

async function publishLinkedIn(post) {
  const caption = post.linkedinCaption ?? post.caption;
  if (DRY_RUN) return { dryRun: true, slides: post.slides.length };

  const ids = [];
  for (const f of post.slides) ids.push(await liUploadImage(path.join(post.dir, f)));
  const altText = post.altText || post.slug;
  const content =
    ids.length === 1
      ? { media: { id: ids[0], altText } }
      : { multiImage: { images: ids.map((id, i) => ({ id, altText: `${altText} – slide ${i + 1}` })) } };

  const { res } = await http(`${LI_API}/posts`, {
    method: 'POST',
    headers: liHeaders(),
    body: JSON.stringify({
      author: env('LINKEDIN_AUTHOR_URN'),
      commentary: escapeLittleText(caption),
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content,
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  const id = res.headers.get('x-restli-id');
  return { id, url: `https://www.linkedin.com/feed/update/${id}/` };
}

// ---------- main ----------

const PUBLISHERS = { instagram: publishInstagram, linkedin: publishLinkedIn };

const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
const now = Date.now();
let failed = false;

for (const post of loadPosts()) {
  if (ONLY ? post.slug !== ONLY : new Date(post.publishAt).getTime() > now) continue;
  for (const platform of post.platforms ?? Object.keys(PUBLISHERS)) {
    if (state[post.slug]?.[platform]) continue;
    try {
      const result = await PUBLISHERS[platform](post);
      console.log(`✓ ${post.slug} → ${platform}`, result);
      if (!DRY_RUN) {
        state[post.slug] = { ...state[post.slug], [platform]: { ...result, at: new Date().toISOString() } };
        // Persist after each platform so a later failure never causes a double post on retry.
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
      }
    } catch (e) {
      failed = true;
      console.error(`✗ ${post.slug} → ${platform}: ${e.message}`);
    }
  }
}

process.exit(failed ? 1 : 0);
