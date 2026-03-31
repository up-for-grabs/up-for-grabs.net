<script setup lang="ts">
import type { PopularTag } from '../data/schema';

defineProps<{
  tags: PopularTag[];
  selectedTags: string[];
}>();

defineEmits<{
  toggleTag: [tagName: string];
}>();
</script>

<template>
  <div v-if="tags.length > 0">
    <label class="filter-label">Filter by tags:</label>
    <div class="radio-btn-row">
      <button
        v-for="tag in tags"
        :key="tag.name"
        :class="['radio-btn', { 'radio-btn-selected': selectedTags.includes(tag.name) }]"
        type="button"
        @click="$emit('toggleTag', tag.name)"
      >
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>
