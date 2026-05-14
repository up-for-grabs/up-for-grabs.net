<template>
  <div class="search-results">
    <div class="tags-container">
      <span v-for="(count, tag) in filteredTagCounts" :key="tag" class="tag">
        {{ tag }} ({{ count }})
      </span>
    </div>
    <div class="projects-container">
      <ProjectEntry v-for="project in filteredProjects" :key="project.id" :project="project" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProjectEntry from './ProjectEntry.vue';
import { useSearch } from '../data/search';

const { filteredProjects } = useSearch();

/**
 * Calculates the frequency of tags based on the currently filtered projects.
 * This ensures the popular tag counts update dynamically when filters change.
 */
const filteredTagCounts = computed(() => {
  const counts: Record<string, number> = {};
  filteredProjects.value.forEach((project) => {
    project.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
});
</script>