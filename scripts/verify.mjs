import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve('dist');
const base = process.env.PAGES_URL ? new URL(process.env.PAGES_URL).pathname.replace(/\/$/, '') : '';
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(join(dir, e.name)) : join(dir, e.name)))).flat();
}
const pages = (await walk(root)).filter(f => f.endsWith('.html'));
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  assert(html.includes('lang="en"'), `Missing page language: ${page}`);
  assert(!/<script\b/.test(html), `Unexpected browser JavaScript: ${page}`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(raw)) continue;
    const path = decodeURIComponent(raw.split(/[?#]/)[0]);
    if (!path.startsWith('/')) continue;
    assert(path === base || path.startsWith(`${base}/`), `Link missing repository prefix: ${path}`);
    const local = join(root, path.slice(base.length));
    await access(path.endsWith('/') ? join(local, 'index.html') : local);
  }
}
const home = await readFile(join(root, 'index.html'), 'utf8');
const selected = home.match(/<ol class="writing-list selected">([\s\S]*?)<\/ol>/)?.[1];
assert(selected, 'Selected Writing missing');
assert.equal([...selected.matchAll(/<li\b/g)].length, 5, 'Expected five selected pieces');
const archive = await readFile(join(root, 'writing/index.html'), 'utf8');
const dates = [...archive.matchAll(/datetime="([^"]+)"/g)].map(m => m[1]);
assert.deepEqual(dates, [...dates].sort().reverse(), 'Archive must be newest first');
assert.equal(pages.length, dates.length + 4, 'Every article needs its own page');
console.log(`Verified ${pages.length} pages: local links, repository prefix, selected count, archive order, and no browser JavaScript.`);
