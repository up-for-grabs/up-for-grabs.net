import { isBefore } from 'date-fns';

import { parseProject, type WebsiteProject } from './schema';

export function filterProject(
  project: WebsiteProject,
  searchText: string,
  lastUpdated: Date
): boolean {
  if (
    project.stats.lastUpdated &&
    isBefore(project.stats.lastUpdated, lastUpdated)
  ) {
    return false;
  }

  const terms = searchText
    .toLowerCase()
    .split(' ')
    .filter((t) => t.length > 0);

  if (terms.length === 0) {
    return true;
  }

  return terms.every((term) => {
    const inName = project.name.toLowerCase().includes(term);
    const inDesc = project.desc.toLowerCase().includes(term);
    const inTags = project.tags?.some((tag) =>
      tag.toLowerCase().includes(term)
    ) ?? false;

    return inName || inDesc || inTags;
  });
}

let allProjects: WebsiteProject[] | null = null;

function getDataUrl(): string {
  const baseDir = import.meta.env.BASE_URL;

  if (baseDir === '' || baseDir === '/') {
    return '/data.json';
  }

  return `${import.meta.env.BASE_URL}/data.json`;
}

const fetchAllProjects = async (): Promise<WebsiteProject[]> => {
  const url = getDataUrl();
  const response = await fetch(url);
  if (response.ok) {
    const rawProjects = await response.json();
    return rawProjects.map(parseProject);
  }
  return Promise.reject(Error('Failed to load project data'));
};

export const fetchProjects = async (
  text: string,
  lastUpdated: Date
): Promise<WebsiteProject[]> => {
  if (allProjects == null) {
    allProjects = await fetchAllProjects();
  }

  return allProjects
    .filter((project) => filterProject(project, text, lastUpdated))
    .sort((left, right) => {
      return left.name.localeCompare(right.name);
    });
};
