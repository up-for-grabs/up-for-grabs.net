<template>
  <div class="search-results">
    <div class="filters">
      <!-- Filter UI components -->
    </div>
    
    <div class="popular-tags">
      <span v-for="tag in popularTags" :key="tag.name">
        {{ tag.name }} ({{ tag.count }})
      </span>
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
import { computed, ref } from 'vue';
import ProjectEntry from './ProjectEntry.vue';

// Assuming projects and filters are provided via props or composables
const props = defineProps<{
  allProjects: any[];
  selectedFilters: string[];
}>();

/**
 * Filters projects based on selected criteria.
 */
const filteredProjects = computed(() => {
  if (props.selectedFilters.length === 0) return props.allProjects;
  return props.allProjects.filter(project => 
    props.selectedFilters.every(filter => project.tags.includes(filter))
  );
});

/**
 * Calculates tag counts dynamically based on the current filtered project list.
 * This ensures the counts reflect only the projects matching the active filters.
 */
const popularTags = computed(() => {
  const tagCounts: Record<string, number> = {};
  
  filteredProjects.value.forEach(project => {
    project.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Return top 10 popular tags
});
</script>