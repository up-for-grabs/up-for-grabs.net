<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Project } from '../../types';
import { filterProjects } from './search';
import IssueCount from './IssueCount.vue';

const props = defineProps<{
  projects: Project[];
}>();

const searchQuery = ref('');
const selectedTags = ref<string[]>([]);

const filteredProjects = computed(() => {
  return filterProjects(props.projects, searchQuery.value, selectedTags.value);
});

/**
 * Computes popular tags based on the current filtered project list.
 * This ensures that when filters are applied, the tag counts reflect
 * the remaining projects.
 */
const popularTags = computed(() => {
  const tagCounts: Record<string, number> = {};
  
  filteredProjects.value.forEach((project) => {
    project.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
});

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};
</script>

<template>
  <div class="search-container">
    <input v-model="searchQuery" placeholder="Search projects..." />
    
    <div class="popular-tags">
      <h3>Popular Tags</h3>
      <button 
        v-for="item in popularTags" 
        :key="item.tag"
        @click="toggleTag(item.tag)"
        :class="{ active: selectedTags.includes(item.tag) }"
      >
        {{ item.tag }} ({{ item.count }})
      </button>
    </div>

    <div class="results">
      <div v-for="project in filteredProjects" :key="project.id">
        {{ project.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.popular-tags button.active {
  background-color: var(--color-primary);
  color: white;
}
</style>