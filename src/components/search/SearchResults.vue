<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { subDays } from 'date-fns';

import { InitialDaysActive } from '../data/config';
import {
  fetchPopularTags,
  fetchProjects,
  type TagWithFrequency,
} from '../data/search';
import { type WebsiteProject } from '../data/schema';

import ProjectEntry from './ProjectEntry.vue';

const QUERY_PARAM = 'q';
const LAST_UPDATED_PARAM = 'lastUpdated';

const props = defineProps<{
  initialProjects: Array<WebsiteProject>;
}>();

const isMounted = ref(false);

const searchText = defineModel('searchText', { default: '' });
const lastUpdatedDays = defineModel('lastUpdatedDays', {
  default: InitialDaysActive,
});

const selectedTags = ref<Array<string>>([]);
const popularTags = ref<TagWithFrequency[]>([]);

function updateQueryString() {
  const params = new URLSearchParams(window.location.search);

  const query = searchText.value.trim();
  if (query.length > 0) {
    params.set(QUERY_PARAM, query);
  } else {
    params.delete(QUERY_PARAM);
  }

  params.set(LAST_UPDATED_PARAM, String(lastUpdatedDays.value));

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
    const text = queryKey[1];
    if (typeof text !== 'string') {
      return Promise.reject(new Error('search text placeholder broken'));
    }

    const lastUpdated = parseLastUpdated(queryKey[2]);
    if (lastUpdated instanceof Error) {
      return Promise.reject(lastUpdated);
    }

    const tags = queryKey[3];
    const tagList = Array.isArray(tags) ? tags : [];

    return fetchProjects(text, lastUpdated, tagList);
  },
  placeholderData: props.initialProjects,
  enabled: isMounted,
});

async function loadPopularTags() {
  const lastUpdated = parseLastUpdated(lastUpdatedDays.value);
  if (lastUpdated instanceof Error) {
    return;
  }
  popularTags.value = await fetchPopularTags(lastUpdated, 10);
}

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
  updateQueryString();
  loadPopularTags();
});

watch(searchText, () => {
  updateQueryString();
  refetch();
});

watch(lastUpdatedDays, () => {
  updateQueryString();
  refetch();
  loadPopularTags();
});

function addTag(tag: string) {
  const tagLower = tag.toLowerCase();
  if (!selectedTags.value.includes(tagLower)) {
    selectedTags.value = [...selectedTags.value, tagLower];
  }
}

function removeTag(tag: string) {
  selectedTags.value = selectedTags.value.filter(
    (t) => t !== tag.toLowerCase()
  );
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

.tag-filter-section,
.selected-tags-section {
  margin-top: 1em;
  clear: both;
}

.filter-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5em;
}

.popular-tags,
.selected-tags {
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5em;
  padding-inline-start: 0;
  margin: 0;
}

.tag-button {
  cursor: pointer;
  border: 1px solid #4c6c73;
  border-radius: 4px;
  background: #bfd1d9;
  padding: 0.3em 0.6em;
  font-size: 0.9em;
}

.tag-button:hover {
  background: #4c6c73;
  color: white;
}

.tag-frequency {
  opacity: 0.8;
  font-size: 0.9em;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  background: #4c6c73;
  color: white;
  border-radius: 4px;
  padding: 0.2em 0.5em;
  font-size: 0.9em;
}

.remove-tag {
  cursor: pointer;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2em;
  line-height: 1;
  padding: 0 0.2em;
}

.remove-tag:hover {
  opacity: 0.8;
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
      <div v-if="popularTags.length > 0" class="tag-filter-section">
        <label id="tag-filter-label" class="filter-label"
          >Filter by tag (click to add):</label
        >
        <ul class="popular-tags" aria-labelledby="tag-filter-label">
          <li v-for="tag in popularTags" :key="tag.name">
            <button
              type="button"
              class="tag-button"
              :title="`Filter by ${tag.name} (${tag.frequency} projects)`"
              @click="addTag(tag.name)"
            >
              {{ tag.name }}
              <span class="tag-frequency">({{ tag.frequency }})</span>
            </button>
          </li>
        </ul>
      </div>
      <div v-if="selectedTags.length > 0" class="selected-tags-section">
        <span class="filter-label">Active tag filters:</span>
        <ul class="selected-tags">
          <li v-for="tag in selectedTags" :key="tag">
            <span class="selected-tag">
              {{ tag }}
              <button
                type="button"
                class="remove-tag"
                :aria-label="`Remove ${tag} filter`"
                @click="removeTag(tag)"
              >
                ×
              </button>
            </span>
          </li>
        </ul>
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
      @add-tag="addTag"
    />
  </div>
</template>
