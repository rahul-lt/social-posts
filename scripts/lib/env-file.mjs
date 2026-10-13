// Upserts KEY=value lines into .env.local so tokens never have to be printed or pasted.
import fs from 'node:fs';
import path from 'node:path';

export const ENV_FILE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../.env.local');

export function saveEnv(values) {
  let text = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';
  for (const [k, v] of Object.entries(values)) {
    const line = `${k}=${v}`;
    const re = new RegExp(`^${k}=.*$`, 'm');
    text = re.test(text) ? text.replace(re, line) : `${text}${text && !text.endsWith('\n') ? '\n' : ''}${line}\n`;
  }
  fs.writeFileSync(ENV_FILE, text, { mode: 0o600 });
}
