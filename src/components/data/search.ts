import { ref, computed } from 'vue';

// Mocking the structure based on project requirements
export interface Project {
  id: string;
  name: string;
  tags: string[];
}

const allProjects = ref<Project[]>([]);
const searchQuery = ref('');
const selectedTags = ref<string[]>([]);

/**
 * Core filtering logic.
 * Returns projects that match the search query and selected tags.
 */
export const filteredProjects = computed(() => {
  return allProjects.value.filter((project) => {
    const matchesQuery = project.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesTags = selectedTags.value.every((tag) => project.tags.includes(tag));
    return matchesQuery && matchesTags;
  });
});

export function useSearch() {
  return {
    allProjects,
    searchQuery,
    selectedTags,
    filteredProjects,
  };
}