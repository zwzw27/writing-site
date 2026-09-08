import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string().trim().min(1),
    date: z.coerce.date(),
    publication: z.string().trim().min(1),
    originalUrl: z.string().url().refine(value => /^https?:\/\//.test(value), 'Use an http or https URL').optional(),
    featured: z.boolean().default(false),
  }),
});
export const collections = { writing };
