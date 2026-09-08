# Writing portfolio

A static Astro portfolio hosted only on GitHub Pages. Markdown lives in this repository. There is no database, CMS, external font, or outside hosting service. A small inline script powers the archive filters. Astro is the only direct dependency; the lockfile keeps installations reproducible.

## Site details

- Edit `src/site.ts` for your name, role, introduction, and LinkedIn URL.
- Edit the headline in `src/pages/index.astro` if desired.
- `src/content/writing/` holds the full text of every archived article. Each file links back to the original via `originalUrl`.
- Keep **exactly five** articles marked `featured: true`. The build gives a readable error if the count differs or an article body is empty. Selected pieces are ordered newest first. The archive includes everything.
- Each article has a `type` of `analysis`, `feature`, or `news`; this powers the archive filters.

## Preview locally

Use Node.js 22. With a terminal opened in this project folder:

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal. To test the production output:

```sh
npm run build
npm run verify
npm run preview
```

To check a repository subpath locally:

```sh
PAGES_URL=https://example.github.io/writing-portfolio/ npm run build
PAGES_URL=https://example.github.io/writing-portfolio/ npm run verify
PAGES_URL=https://example.github.io/writing-portfolio/ npm run preview
```

Then open the preview address with `/writing-portfolio/` appended.

## Connect and deploy to GitHub Pages

1. Create an empty repository on GitHub, for example `writing-portfolio`. A public repository works with GitHub Pages on the free plan. A private source repository requires a GitHub plan that supports Pages from private repositories. Use `YOUR-USERNAME.github.io` as the repository name if you want the site at your account's root address instead.
2. Open a terminal **inside this project folder** (the folder containing `package.json`) and run the following, replacing YOUR-USERNAME and YOUR-REPOSITORY:

```sh
git init -b main
git add .
git commit -m "Create writing portfolio"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

3. In the GitHub repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
4. Open **Actions → Deploy to GitHub Pages → Run workflow**. If the first push started a run before Pages was enabled, rerun it now.
5. When deployment succeeds, open the address shown in **Settings → Pages** or the workflow deployment. It will normally be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The workflow reads GitHub's actual Pages URL and passes it into Astro as `PAGES_URL`. Astro derives `site` and `base` from that URL. Navigation, article links, styles, and canonical URLs therefore work for both project repositories and account root repositories without editing configuration. No personal access token or extra repository secret is needed by the deployment workflow. GitHub authentication is needed for your initial push.

Keep the `.github` folder in the repository; it contains the deployment workflow. All project files belong at the repository root, not inside an extra `writing-portfolio` subfolder. If you use GitHub Desktop, add this folder as a local repository, publish it, and complete steps 3–5.

## Add an article later

Every deployed article is public. This source repository can remain private with a GitHub plan that supports Pages from private repositories; otherwise it must be made public to use Pages. Keep private notes, spreadsheets,
credentials, and personal contact details outside the repository. In GitHub email settings, keep
email privacy enabled. Local commits must use your GitHub noreply email address;
check this before your first commit on another computer.

The simplest approach is entirely on GitHub:

1. Open `src/content/writing` in your repository.
2. Choose **Add file → Create new file** and name it `your-article-title.md`. Use unique lowercase filenames with hyphens; the filename determines the permanent article URL.
3. Paste the frontmatter below, then the **full article text**.
4. Commit to `main`. When you want the change live, open **Actions → Deploy to GitHub Pages → Run workflow**.

```yaml
---
title: "Article title"
date: 2025-06-14
publication: "Publication name"
originalUrl: "https://example.com/article"
type: "analysis"
featured: false
---

Full article text goes here.
```

`date` is the original publication date in `YYYY-MM-DD` form. Dates are displayed in UTC so they do not shift a day during builds. Set `type` to `analysis`, `feature`, or `news`. Omit `originalUrl` entirely if there is no source link; do not leave an empty value. `featured` defaults to false when omitted. To change the selected five, switch one existing selected article to false and another to true in the same commit. If a build fails, the previous successful deployment stays online; read the Actions log for the content error.

For local editing, copy `templates/article.md` into `src/content/writing`, rename it, edit it, then commit and push. The template is outside the content collection and is never published.

Use ordinary Markdown paragraphs, headings (`##` beneath the article title), lists, emphasis, and links. Avoid repeating the title as a body `#` heading. For local images, keep them alongside an article and reference them relatively, e.g. `![Descriptive alt text](./photo.jpg)`. Avoid root-relative Markdown links such as `/writing/example/`: within article text use `../example/` for another article, which also works under a repository subpath.

## Project map and backup

- `src/content/writing/*.md`: full articles and metadata
- `src/content.config.ts`: validated content schema
- `src/lib/writing.ts`: sorting, selection validation, and base-aware links
- `src/pages/index.astro`: homepage
- `src/pages/writing/index.astro`: archive
- `src/pages/writing/[...id].astro`: generated full article pages
- `src/site.ts`: personal details
- `src/styles/global.css`: responsive editorial styling
- `.github/workflows/deploy.yml`: GitHub Pages build and deployment

Back up the repository or download its ZIP from GitHub. It includes all content and source files. `node_modules`, `.astro`, and `dist` are generated and can be recreated with `npm ci` and `npm run build`. Keep `package-lock.json`. No external content service needs to be exported.

Deployment configuration follows the [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/), using GitHub's build, artifact, and deployment actions explicitly for clarity.
