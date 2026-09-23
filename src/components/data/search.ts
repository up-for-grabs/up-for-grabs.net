import { isBefore } from 'date-fns';

import { parseProject, type WebsiteProject, type PopularTag } from './schema';

export function filterProject(
  project: WebsiteProject,
  searchText: string,
  lastUpdated: Date
): boolean {
  const normalizedSearchText = searchText.toLowerCase();

  if (
    project.stats.lastUpdated &&
    isBefore(project.stats.lastUpdated, lastUpdated)
  ) {
    return false;
  }

  if (project.name.toLowerCase().indexOf(normalizedSearchText) > -1) {
    return true;
  }

  if (project.desc.toLowerCase().indexOf(normalizedSearchText) > -1) {
    return true;
  }

  return false;
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

export function calculatePopularTags(
  projects: WebsiteProject[],
  count: number = 6
): PopularTag[] {
  // Count tag frequencies
  const tagMap: Record<string, number> = {};
  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagMap[lowerTag] = (tagMap[lowerTag] || 0) + 1;
    });
  });

  // Convert to array and sort by frequency DESC, then name ASC
  return Object.entries(tagMap)
    .map(([name, frequency]) => ({ name, frequency }))
    .sort((a, b) => b.frequency - a.frequency || a.name.localeCompare(b.name))
    .slice(0, count);
}

function filterByTags(
  project: WebsiteProject,
  selectedTags: string[]
): boolean {
  if (selectedTags.length === 0) {
    return true;
  }
  // All selected tags must be in project tags
  const projectTagsLower = project.tags.map((t) => t.toLowerCase());
  return selectedTags.every((tag) =>
    projectTagsLower.includes(tag.toLowerCase())
  );
}

export const fetchProjects = async (
  text: string,
  lastUpdated: Date,
  tags?: string[]
): Promise<WebsiteProject[]> => {
  if (allProjects == null) {
    allProjects = await fetchAllProjects();
  }

  return allProjects
    .filter((project) => filterProject(project, text, lastUpdated))
    .filter((project) => filterByTags(project, tags || []))
    .sort((left, right) => {
      return left.name.localeCompare(right.name);
    });
};
