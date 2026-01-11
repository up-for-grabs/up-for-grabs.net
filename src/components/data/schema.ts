import { z } from 'astro/zod';

const StatsInputSchema = z
  .object({
    'issue-count': z.number(),
    'last-updated': z.string().datetime().optional(),
    'fork-count': z.number().optional(),
  })
  .optional();

const StatsWebsiteSchema = z.object({
  issueCount: z.number().optional(),
  lastUpdated: z.date().optional(),
  forkCount: z.number().optional(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  desc: z.string(),
  site: z.string(),
  tags: z.array(z.string()),
  upforgrabs: z.object({
    name: z.string(),
    link: z.string(),
  }),
  stats: StatsInputSchema,
});

export const WebsiteProjectSchema = z.object({
  name: z.string(),
  desc: z.string(),
  site: z.string(),
  tags: z.array(z.string()),
  upforgrabs: z.object({
    name: z.string(),
    link: z.string(),
  }),
  stats: StatsWebsiteSchema,
});

export type Project = z.infer<typeof ProjectSchema> & { id: string };

export type WebsiteProject = z.infer<typeof WebsiteProjectSchema> & {
  id: string;
};

export function parseProject(input: Project): WebsiteProject {
  let parsedDate: Date | undefined;

  if (input.stats && input.stats['last-updated']) {
    parsedDate = new Date(input.stats['last-updated']);
  }

  return {
    ...input,
    stats: {
      issueCount: input.stats?.['issue-count'],
      lastUpdated: parsedDate,
      forkCount: input.stats?.['fork-count'],
    },
  };
}
