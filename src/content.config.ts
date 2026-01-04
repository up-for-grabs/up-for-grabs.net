// 1. Import utilities from `astro:content`
import { defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob } from 'astro/loaders';

// 3. Import Zod
import { ProjectSchema } from './components/data/schema';

// 4. Define your collection(s)
const projects = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: '_data/projects/' }),
  schema: ProjectSchema,
});

// 5. Export a single `collections` object to register your collection(s)
export const collections = { projects };
