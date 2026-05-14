<template>
  <div class="search-results">
    <div class="filters">
      <!-- Filter UI components -->
    </div>
    
    <div class="popular-tags">
      <h3>Popular Tags</h3>
      <ul>
        <li v-for="(count, tag) in popularTags" :key="tag">
          {{ tag }} ({{ count }})
        </li>
      </ul>
    </div>

    <div class="results">
      <ProjectEntry 
        v-for="project in filteredProjects" 
        :key="project.id" 
        :project="project" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProjectEntry from './ProjectEntry.vue';

// Assuming props or state providing allProjects and activeFilters
const props = defineProps<{
  allProjects: any[];
  activeFilters: string[];
}>();

const filteredProjects = computed(() => {
  if (props.activeFilters.length === 0) return props.allProjects;
  return props.allProjects.filter(project => 
    props.activeFilters.every(filter => project.tags.includes(filter))
  );
});

/**
 * Computes the frequency of tags based on the currently filtered project list.
 * This ensures the counts update dynamically when the user selects different filters.
 */
const popularTags = computed(() => {
  const counts: Record<string, number> = {};
  
  filteredProjects.value.forEach(project => {
    project.tags.forEach((tag: string) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency descending
  return Object.fromEntries(
    Object.entries(counts).sort(([, a], [, b]) => b - a)
  );
});
</script>