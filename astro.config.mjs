import { defineConfig } from 'astro/config';

// GitHub supplies its actual Pages URL during deployment (including repository path).
const pagesUrl = process.env.PAGES_URL;
const url = pagesUrl ? new URL(pagesUrl) : undefined;
export default defineConfig({
  output: 'static',
  site: url?.origin,
  base: url?.pathname || '/',
  trailingSlash: 'always',
});
