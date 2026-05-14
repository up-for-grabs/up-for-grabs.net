/**
 * Core filtering logic for projects.
 * Calculates filtered projects and updates tag counts dynamically.
 */

export interface Project {
  name: string;
  tags: string[];
  // ... other properties
}

/**
 * Calculates the frequency of tags based on a provided list of projects.
 * This is used to update the "Popular Tags" section dynamically.
 */
export function getTagCounts(projects: Project[]): Record<string, number> {
  const counts: Record<string, number> = {};

  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return counts;
}

/**
 * Filters projects based on selected tags and returns the filtered list.
 */
export function filterProjects(projects: Project[], selectedTags: string[]): Project[] {
  if (selectedTags.length === 0) {
    return projects;
  }

  return projects.filter((project) =>
    selectedTags.every((tag) => project.tags.includes(tag))
  );
}