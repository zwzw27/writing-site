import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = resolve('dist');
const contentRoot = resolve('src/content/writing');
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

const articleFiles = (await walk(contentRoot)).filter(f => f.endsWith('.md'));
assert.equal(articleFiles.length, dates.length, 'Every source article must appear in the archive');
const seenTitles = new Set();
const seenUrls = new Set();
const seenBodies = new Set();
const furniture = /^(?:#{1,6}\s+)?(?:subscribe(?: to (?:our email newsletter|the current))?|related stor(?:y|ies)|read more:?|daily debrief\s+newsletter|coingecko|more\s+bitcoin news and projections\s*→|gain free and exclusive access to:.*)$/im;
const privateData = /(?:Claude-Session:|\/Users\/|github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]+|-----BEGIN .*PRIVATE KEY-----)/i;
const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
for (const file of articleFiles) {
  const source = await readFile(file, 'utf8');
  const parsed = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/);
  assert(parsed, `Invalid or empty article: ${file}`);
  const [, frontmatter, body] = parsed;
  const title = frontmatter.match(/^title:\s*(.+)$/m)?.[1];
  const url = frontmatter.match(/^originalUrl:\s*(.+)$/m)?.[1];
  assert(title && !seenTitles.has(title), `Missing or duplicate title: ${file}`);
  assert(url && !seenUrls.has(url), `Missing or duplicate original URL: ${file}`);
  seenTitles.add(title);
  seenUrls.add(url);
  const bodyHash = createHash('sha256').update(body.trim()).digest('hex');
  assert(!seenBodies.has(bodyHash), `Duplicate article body: ${file}`);
  seenBodies.add(bodyHash);
  assert(body.trim().split(/\s+/).length >= 100, `Article body is unusually short: ${file}`);
  assert(!furniture.test(body), `Publisher page furniture found: ${file}`);
  assert(!privateData.test(source), `Private data or credential marker found: ${file}`);
  assert(!email.test(source), `Email address found in article: ${file}`);
}
console.log(`Verified ${pages.length} pages and ${articleFiles.length} unique articles: local links, repository prefix, selected count, archive order, content hygiene, and no browser JavaScript.`);
