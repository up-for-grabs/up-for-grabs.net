<template>
  <ul class="tags-list">
    <li v-for="[tag, count] in tags" :key="tag">
      <button @click="selectTag(tag)">
        {{ tag }} ({{ count }})
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useSearch } from '../../components/data/search';

interface Props {
  tags: [string, number][];
}

defineProps<Props>();

const { setFilter } = useSearch();

const selectTag = (tag: string) => {
  setFilter('tag', tag);
};
</script>