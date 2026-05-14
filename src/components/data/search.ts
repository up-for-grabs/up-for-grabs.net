import { reactive, computed } from 'vue';

// Assuming the store structure looks like this
export const useSearchStore = () => {
  const state = reactive({
    allProjects: [] as any[],
    activeFilters: [] as string[],
  });

  const filteredProjects = computed(() => {
    if (state.activeFilters.length === 0) return state.allProjects;
    
    return state.allProjects.filter((project) =>
      state.activeFilters.every((filter) => project.tags.includes(filter))
    );
  });

  return {
    state,
    filteredProjects,
  };
};