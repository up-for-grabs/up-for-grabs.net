<template>
  <div class="search-results">
    <div class="filters">
      <!-- Filter inputs would be here -->
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
      <ProjectEntry v-for="project in filteredProjects" :key="project.id" :project="project" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProjectEntry from './ProjectEntry.vue';

interface Project {
  id: string;
  tags: string[];
  // ... other properties
}

const props = defineProps<{
  projects: Project[];
  activeFilters: string[];
}>();

/**
 * Filters projects based on active filters.
 */
const filteredProjects = computed(() => {
  if (props.activeFilters.length === 0) return props.projects;
  return props.projects.filter(project =>
    props.activeFilters.every(filter => project.tags.includes(filter))
  );
});

/**
 * Dynamically calculates tag counts based on the currently filtered projects.
 * This ensures the popular tags update when the user changes filters.
 */
const popularTags = computed(() => {
  const counts: Record<string, number> = {};
  
  filteredProjects.value.forEach(project => {
    project.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency descending
  return Object.fromEntries(
    Object.entries(counts).sort(([, a], [, b]) => b - a)
  );
});
</script>