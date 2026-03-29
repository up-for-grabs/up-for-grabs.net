<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { subDays } from 'date-fns';

import { InitialDaysActive } from '../data/config';
import { fetchProjects } from '../data/search';
import { type WebsiteProject } from '../data/schema';

import ProjectEntry from './ProjectEntry.vue';

const props = defineProps<{
  initialProjects: Array<WebsiteProject>;
}>();

const isMounted = ref(false);

const searchText = defineModel('searchText', { default: '' });
const lastUpdatedDays = defineModel('lastUpdatedDays', {
  default: InitialDaysActive,
});

function parseLastUpdated(key: string | number): Date | Error {
  if (typeof key === 'number') {
    return subDays(new Date(), key);
  }

  if (typeof key === 'string') {
    const intValue = parseInt(key, 10);

    if (isNaN(intValue)) {
      return new Date(2000, 0, 1);
    }

    return subDays(new Date(), intValue);
  }

  return new Error(`lastUpdated query token could not be parsed: ${key}`);
}

const { data, error, isPending, isError, refetch } = useQuery({
  queryKey: ['projects', searchText, lastUpdatedDays],
  queryFn: ({ queryKey }) => {
    const text = queryKey[1];
    if (typeof text !== 'string') {
      return Promise.reject(new Error('search text placeholder broken'));
    }

    const lastUpdated = parseLastUpdated(queryKey[2]);
    if (lastUpdated instanceof Error) {
      return Promise.reject(lastUpdated);
    }

    return fetchProjects(text, lastUpdated);
  },
  placeholderData: props.initialProjects,
  enabled: isMounted,
});

onMounted(() => (isMounted.value = true));

watch(searchText, () => refetch());
watch(lastUpdatedDays, () => refetch());
</script>

<style>
menu {
  padding: 0;
}

.form-wrapper {
  overflow: hidden;
  width: 600px;
}

.form-wrapper #search {
  border: 1px solid #ccc;
  box-shadow:
    0 1px 1px #ddd inset,
    0 1px 0 #fff;
  border-radius: 3px;
  float: left;
  height: 20px;
  padding: 10px;
  width: 560px;
}

.form-wrapper #search:focus {
  border-color: #aaa;
  box-shadow: 0 1px 1px #bbb inset;
  outline: 0;
}

.form-wrapper #submit {
  border-radius: 3px;
  cursor: pointer;
  height: 42px;
  float: right;
  padding: 0;
  text-transform: uppercase;
  width: 100px;
}

.form-wrapper #submit:active {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5) inset;
  outline: 0;
}

.results-count {
  margin: 2em 0;
}
</style>

<template>
  <menu>
    <form class="form-wrapper">
      <label id="search-by-text"> Search projects by text... </label>
      <input
        type="text"
        id="search"
        aria-labelledby="search-by-text"
        v-model="searchText"
        placeholder="Enter text to filter projects..."
      />
      <div>
        <label id="activity-filter"
          >Choose projects active within the previous</label
        >

        <select v-model="lastUpdatedDays" aria-labelledby="activity-filter">
          <option value="7">1 week</option>
          <option selected value="30">1 month</option>
          <!-- TODO: how to keep selected in sync with items? onMount? -->
          <option value="180">6 months</option>
          <option value="365">1 year</option>
          <option value="730">2 years</option>
          <option value="-1">forever</option>
        </select>
      </div>
    </form>
  </menu>
  <span v-if="isPending">Loading...</span>
  <span v-else-if="isError">Error: {{ error?.message }}</span>
  <!-- We can assume by this point that `isSuccess === true` -->
  <div v-else-if="data" class="results-count" aria-live="polite">
    {{ data.length }} projects found
  </div>
  <div v-if="data" class="projects">
    <ProjectEntry
      v-for="project in data"
      :key="project.id"
      :project="project"
    />
  </div>
</template>
