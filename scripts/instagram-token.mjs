// node --env-file=.env.local scripts/instagram-token.mjs
// Takes the token generated in the Meta app dashboard (IG_ACCESS_TOKEN in .env.local),
// refreshes it to a fresh 60-day lifetime and resolves IG_USER_ID. Re-run before it expires.
import { saveEnv } from './lib/env-file.mjs';

const token = process.env.IG_ACCESS_TOKEN;
if (!token) throw new Error('Set IG_ACCESS_TOKEN in .env.local (Meta app → Instagram API → Generate token)');

async function get(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json.error ?? json));
  return json;
}

const refreshed = await get(
  `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
);
const me = await get(
  `https://graph.instagram.com/v23.0/me?fields=user_id,username,account_type&access_token=${refreshed.access_token}`
);
if (!['BUSINESS', 'MEDIA_CREATOR'].includes(me.account_type))
  throw new Error(`@${me.username} is ${me.account_type}; switch to a Professional account first`);

const expires = new Date(Date.now() + refreshed.expires_in * 1000).toISOString().slice(0, 10);
saveEnv({ IG_ACCESS_TOKEN: refreshed.access_token, IG_USER_ID: me.user_id, IG_TOKEN_EXPIRES: expires });
console.log(`✓ Saved Instagram token for @${me.username} (${me.account_type}) to .env.local (expires ${expires})`);
