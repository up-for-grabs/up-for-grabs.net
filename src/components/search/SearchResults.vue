<template>
  <div class="search-results">
    <div class="filters">
      <!-- Filter inputs would be here -->
    </div>
    <div class="popular-tags">
      <PopularTags :tags="filteredTags" />
    </div>
    <div class="results">
      <ProjectList :projects="filteredProjects" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSearch } from '../../components/data/search';
import PopularTags from './PopularTags.vue';
import ProjectList from './ProjectList.vue';

const { filteredProjects, allProjects } = useSearch();

/**
 * Computes the tag counts dynamically based on the currently filtered projects.
 * This ensures that when a user selects a filter, the tag counts reflect
 * only the projects remaining in the filtered set.
 */
const filteredTags = computed(() => {
  const tagMap: Record<string, number> = {};
  
  filteredProjects.value.forEach(project => {
    project.tags.forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });

  return Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Return top 10 popular tags
});
</script>