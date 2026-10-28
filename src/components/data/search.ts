import { isBefore } from 'date-fns';

import { parseProject, type WebsiteProject } from './schema';

export type TagWithFrequency = {
  name: string;
  frequency: number;
};

export function filterProject(
  project: WebsiteProject,
  searchText: string,
  lastUpdated: Date,
  selectedTags: Array<string> = []
): boolean {
  const normalizedSearchText = searchText.toLowerCase().trim();

  if (
    project.stats.lastUpdated &&
    isBefore(project.stats.lastUpdated, lastUpdated)
  ) {
    return false;
  }

  const tagsLower = selectedTags
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean);

  if (tagsLower.length > 0) {
    const projectTags = (project.tags || []).map((t) => t.toLowerCase());
    const hasMatchingTag = tagsLower.some((tag) => projectTags.includes(tag));
    if (!hasMatchingTag) {
      return false;
    }
  }

  if (!normalizedSearchText) {
    return true;
  }

  if (project.name.toLowerCase().indexOf(normalizedSearchText) > -1) {
    return true;
  }

  if (project.desc.toLowerCase().indexOf(normalizedSearchText) > -1) {
    return true;
  }

  return false;
}

function buildTagsMap(
  projects: Array<WebsiteProject>
): Map<string, TagWithFrequency> {
  const tagsMap = new Map<string, TagWithFrequency>();

  for (const project of projects) {
    for (const tag of project.tags || []) {
      const tagLower = tag.toLowerCase();
      const existing = tagsMap.get(tagLower);
      if (existing) {
        existing.frequency += 1;
      } else {
        tagsMap.set(tagLower, {
          name: tag,
          frequency: 1,
        });
      }
    }
  }

  return tagsMap;
}

let allProjects: Array<WebsiteProject> | null = null;

function getDataUrl(): string {
  const baseDir = import.meta.env.BASE_URL;

  if (baseDir === '' || baseDir === '/') {
    return '/data.json';
  }

  return `${import.meta.env.BASE_URL}/data.json`;
}

const fetchAllProjects = async (): Promise<Array<WebsiteProject>> => {
  const url = getDataUrl();
  const response = await fetch(url);
  if (response.ok) {
    const rawProjects = await response.json();
    return rawProjects.map(parseProject);
  }
  return Promise.reject(Error('Failed to load project data'));
};

export const fetchPopularTags = async (
  lastUpdated: Date,
  count = 10
): Promise<Array<TagWithFrequency>> => {
  if (allProjects == null) {
    allProjects = await fetchAllProjects();
  }

  const filtered = allProjects.filter((project) => {
    if (
      project.stats.lastUpdated &&
      isBefore(project.stats.lastUpdated, lastUpdated)
    ) {
      return false;
    }
    return true;
  });

  const tagsMap = buildTagsMap(filtered);
  return Array.from(tagsMap.values())
    .sort((a, b) => {
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      return a.name.localeCompare(b.name);
    })
    .slice(0, count);
};

export const fetchProjects = async (
  text: string,
  lastUpdated: Date,
  selectedTags: Array<string> = []
): Promise<Array<WebsiteProject>> => {
  if (allProjects == null) {
    allProjects = await fetchAllProjects();
  }

  return allProjects
    .filter((project) =>
      filterProject(project, text, lastUpdated, selectedTags)
    )
    .sort((left, right) => {
      return left.name.localeCompare(right.name);
    });
};
