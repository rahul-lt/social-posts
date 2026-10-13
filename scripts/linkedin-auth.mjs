// One-time (every ~60 days) LinkedIn OAuth: node --env-file=.env.local scripts/linkedin-auth.mjs
// Needs LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET in .env.local and
// http://localhost:8799/callback registered as an Authorized redirect URL on the app.
import http from 'node:http';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { saveEnv } from './lib/env-file.mjs';

const { LINKEDIN_CLIENT_ID: clientId, LINKEDIN_CLIENT_SECRET: clientSecret } = process.env;
if (!clientId || !clientSecret) throw new Error('Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env.local');

const REDIRECT = 'http://localhost:8799/callback';
const stateParam = crypto.randomUUID();
const authUrl =
  'https://www.linkedin.com/oauth/v2/authorization?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT,
    state: stateParam,
    scope: 'openid profile w_member_social',
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== '/callback') return res.writeHead(404).end();
  try {
    if (url.searchParams.get('state') !== stateParam) throw new Error('State mismatch');
    if (url.searchParams.get('error')) throw new Error(url.searchParams.get('error_description'));

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: url.searchParams.get('code'),
        redirect_uri: REDIRECT,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(JSON.stringify(token));

    const me = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    }).then((r) => r.json());

    const expires = new Date(Date.now() + token.expires_in * 1000).toISOString().slice(0, 10);
    saveEnv({
      LINKEDIN_ACCESS_TOKEN: token.access_token,
      LINKEDIN_AUTHOR_URN: `urn:li:person:${me.sub}`,
      LINKEDIN_TOKEN_EXPIRES: expires,
    });
    res.end('LinkedIn connected. You can close this tab.');
    console.log(`✓ Saved LinkedIn token for ${me.name} to .env.local (expires ${expires})`);
  } catch (e) {
    res.writeHead(500).end(`Failed: ${e.message}`);
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(8799, () => {
  console.log(`Opening LinkedIn consent screen… (if the wrong browser opens, paste this URL into the right one)\n${authUrl}`);
  if (!process.env.NO_OPEN) execFile('open', [authUrl]);
});
