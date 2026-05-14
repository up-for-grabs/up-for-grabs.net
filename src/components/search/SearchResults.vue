<template>
  <div class="search-results">
    <div class="popular-tags">
      <h3>Popular Tags</h3>
      <ul>
        <li v-for="(count, tag) in popularTags" :key="tag">
          {{ tag }} ({{ count }})
        </li>
      </ul>
    </div>
    <div class="projects">
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

interface Project {
  id: string;
  tags: string[];
  // ... other properties
}

const props = defineProps<{
  filteredProjects: Project[];
}>();

/**
 * Computes the frequency of tags based on the currently filtered projects.
 * This ensures the popular tags count updates dynamically when filters change.
 */
const popularTags = computed(() => {
  const tagCounts: Record<string, number> = {};
  
  props.filteredProjects.forEach((project) => {
    project.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency descending
  return Object.fromEntries(
    Object.entries(tagCounts).sort(([, a], [, b]) => b - a)
  );
});
</script>