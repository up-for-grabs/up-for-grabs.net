<template>
  <div class="search-results">
    <!-- Filter UI components would trigger updateFilteredProjects -->
    <div v-for="tag in popularTags" :key="tag.name">
      {{ tag.name }} ({{ tag.count }})
    </div>
    
    <div v-for="project in filteredProjects" :key="project.name">
      {{ project.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { filterProjects, getTagCounts, type Project } from '../data/search';

const props = defineProps<{ projects: Project[] }>();
const selectedTags = ref<string[]>([]);

// Reactive filtered projects
const filteredProjects = computed(() => 
  filterProjects(props.projects, selectedTags.value)
);

// Reactive tag counts based on the current filtered results
const popularTags = computed(() => {
  const counts = getTagCounts(filteredProjects.value);
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});
</script>