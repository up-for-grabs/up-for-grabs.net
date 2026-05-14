<template>
  <div class="search-results">
    <!-- Filter UI components would be here -->
    <div class="popular-tags">
      <span v-for="(count, tag) in filteredTagCounts" :key="tag">
        {{ tag }} ({{ count }})
      </span>
    </div>
    
    <div class="results-list">
      <ProjectEntry v-for="project in filteredProjects" :key="project.id" :project="project" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProjectEntry from './ProjectEntry.vue';
import { useSearchStore } from '../data/search';

const searchStore = useSearchStore();

/**
 * Computed property to get the list of projects currently matching the filters.
 */
const filteredProjects = computed(() => searchStore.filteredProjects);

/**
 * Computed property to dynamically calculate tag counts based on the currently filtered projects.
 * This ensures that when a user selects a filter, the tag counts reflect the subset of projects.
 */
const filteredTagCounts = computed(() => {
  const counts: Record<string, number> = {};
  
  filteredProjects.value.forEach((project) => {
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