import { getCollection } from 'astro:content';
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const articleHref = (id: string) => href(`writing/${id.split('/').map(encodeURIComponent).join('/')}/`);
export const dateLabel = (date: Date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
export async function getWriting() {
  const articles = (await getCollection('writing')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
  const selected = articles.filter(article => article.data.featured);
  if (selected.length !== 5) throw new Error(`Selected Writing requires exactly 5 articles with featured: true; found ${selected.length}. Update the Markdown frontmatter.`);
  for (const article of articles) {
    if (!article.body?.trim()) throw new Error(`Article "${article.id}" must contain its full text below the frontmatter.`);
  }
  return articles;
}
