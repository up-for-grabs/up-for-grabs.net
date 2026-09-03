<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { subDays } from 'date-fns';

import { InitialDaysActive } from '../data/config';
import { fetchProjects, calculatePopularTags } from '../data/search';
import { type WebsiteProject } from '../data/schema';

import ProjectEntry from './ProjectEntry.vue';
import PopularTags from './PopularTags.vue';

const QUERY_PARAM = 'q';
const LAST_UPDATED_PARAM = 'lastUpdated';
const TAGS_PARAM = 'tags';

const props = defineProps<{
  initialProjects: Array<WebsiteProject>;
}>();

const isMounted = ref(false);

const searchText = defineModel('searchText', { default: '' });
const lastUpdatedDays = defineModel('lastUpdatedDays', {
  default: InitialDaysActive,
});
const selectedTags = ref<string[]>([]);

function updateQueryString() {
  const params = new URLSearchParams(window.location.search);

  const query = searchText.value.trim();
  if (query.length > 0) {
    params.set(QUERY_PARAM, query);
  } else {
    params.delete(QUERY_PARAM);
  }

  params.set(LAST_UPDATED_PARAM, String(lastUpdatedDays.value));

  if (selectedTags.value.length > 0) {
    params.set(TAGS_PARAM, selectedTags.value.join(','));
  } else {
    params.delete(TAGS_PARAM);
  }

  const queryString = params.toString();
  const nextUrl = queryString
    ? `${window.location.pathname}?${queryString}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`;

  window.history.replaceState({}, '', nextUrl);
}

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
  queryKey: ['projects', searchText, lastUpdatedDays, selectedTags],
  queryFn: ({ queryKey }) => {
    const text = queryKey[1] as string;
    const days = queryKey[2] as number;
    const tags = queryKey[3] as string[];

    const lastUpdated = parseLastUpdated(days);
    if (lastUpdated instanceof Error) {
      return Promise.reject(lastUpdated);
    }

    return fetchProjects(text, lastUpdated, tags.length > 0 ? tags : undefined);
  },
  placeholderData: props.initialProjects,
  enabled: isMounted,
});

onMounted(() => {
  isMounted.value = true;

  const params = new URLSearchParams(window.location.search);

  const initialQuery = params.get(QUERY_PARAM);
  if (initialQuery) {
    searchText.value = initialQuery;
  }

  const lastUpdatedParam = params.get(LAST_UPDATED_PARAM);
  if (lastUpdatedParam) {
    const parsedValue = parseInt(lastUpdatedParam, 10);
    if (!Number.isNaN(parsedValue)) {
      lastUpdatedDays.value = parsedValue;
    }
  }

  const tagsParam = params.get(TAGS_PARAM);
  if (tagsParam) {
    selectedTags.value = tagsParam.split(',').filter((t) => t.length > 0);
  }

  updateQueryString();
});

watch(searchText, () => {
  updateQueryString();
  refetch();
});

watch(lastUpdatedDays, () => {
  updateQueryString();
  refetch();
});

watch(
  selectedTags,
  () => {
    updateQueryString();
    refetch();
  },
  { deep: true }
);

const initialPopularTags = computed(() =>
  calculatePopularTags(props.initialProjects, 6)
);

function handleToggleTag(tagName: string) {
  if (selectedTags.value[0] === tagName) {
    selectedTags.value = [];
  } else {
    selectedTags.value = [tagName];
  }
}
</script>

<style>
menu {
  padding: 0;
}

.form-wrapper {
  overflow: hidden;
  width: min(100%, 600px);
}

.form-wrapper #search {
  border: 1px solid #ccc;
  box-shadow:
    0 1px 1px #ddd inset,
    0 1px 0 #fff;
  border-radius: 3px;
  box-sizing: border-box;
  display: block;
  height: 42px;
  padding: 10px;
  width: 100%;
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

@media (max-width: 640px) {
  .form-wrapper {
    width: 100%;
  }

  .form-wrapper #search {
    font-size: 16px;
  }
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

        <select
          v-model="lastUpdatedDays"
          id="last-updated"
          aria-labelledby="activity-filter"
        >
          <option value="7">1 week</option>
          <option value="30">1 month</option>
          <option value="180">6 months</option>
          <option value="365">1 year</option>
          <option value="730">2 years</option>
          <option value="-1">forever</option>
        </select>
      </div>
    </form>
    <PopularTags
      :tags="initialPopularTags"
      :selectedTags="selectedTags"
      @toggle-tag="handleToggleTag"
    />
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
