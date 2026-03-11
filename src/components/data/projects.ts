import { getCollection } from 'astro:content';
import { parseProject, type Project, type WebsiteProject } from './schema';
import { createHash } from 'node:crypto';
import { isBefore, subDays } from 'date-fns';
import { InitialDaysActive } from './config';

const projects = await getCollection('projects', ({ data }) => {
  if (data.stats) {
    if (data.stats?.['issue-count'] > 0) {
      return true;
    }
  }
  return false;
});

export const RawProjects: Array<Project> = projects
  .map((project) => {
    const hash = createHash('sha256');
    const id = hash.update(project.filePath!).digest('hex');

    return {
      id,
      ...project.data,
    };
  })
  .sort((left, right) => {
    const leftDate = left.stats?.['last-updated'];
    const rightDate = right.stats?.['last-updated'];
    if (!leftDate && !rightDate) return left.name.localeCompare(right.name);
    if (!leftDate) return 1;
    if (!rightDate) return -1;
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });

const lastUpdated = subDays(new Date(), InitialDaysActive);

export const InitialProjects: Array<WebsiteProject> = RawProjects.map(
  (project) => parseProject(project)
).filter((project) => {
  if (
    project.stats.lastUpdated &&
    isBefore(project.stats.lastUpdated, lastUpdated)
  ) {
    return false;
  }

  return true;
});
