import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string().trim().min(1),
    date: z.coerce.date(),
    publication: z.string().trim().min(1),
    originalUrl: z.string().url().refine(value => /^https?:\/\//.test(value), 'Use an http or https URL').optional(),
    videoUrl: z.string().url().refine(value => /^https:\/\/player\.vimeo\.com\/video\/\d+(?:\?.*)?$/.test(value), 'Use a Vimeo player URL').optional(),
    type: z.enum(['analysis', 'feature', 'news']),
    featured: z.boolean().default(false),
  }),
});
export const collections = { writing };
