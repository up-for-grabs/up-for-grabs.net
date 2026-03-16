<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { subDays } from 'date-fns';

import { InitialDaysActive } from '../data/config';
import { Init, SearchProjects } from '../data/search';
import { type WebsiteProject } from '../data/schema';

import ProjectEntry from './ProjectEntry.vue';

const props = defineProps<{
  projects: ReadonlyArray<WebsiteProject>;
}>();

const currentProjects = ref(props.projects);

const searchText = ref('');
const lastUpdated = ref(InitialDaysActive);

const lastUpdatedDate = computed(() => {
  if (lastUpdated.value < 0) {
    return new Date(2000, 0, 1);
  }

  return subDays(new Date(), lastUpdated.value);
});

onMounted(() => {
  Init(lastUpdatedDate.value).then((result) => {
    if (result instanceof Error) {
      console.error('error observed during init', result);
    } else if (result) {
      currentProjects.value = result;
    }
  });
});

async function search() {
  const response = await SearchProjects(
    searchText.value,
    lastUpdatedDate.value
  );

  if (response.type == 'search-results') {
    currentProjects.value = response.list;
  } else {
    console.error('error observed during search', response.message);
  }
}

async function onTextChanged(ev: Event) {
  const element = ev.target as HTMLInputElement;
  if (!element) {
    return;
  }

  const text = element.value;
  searchText.value = text;
  await search();
}

async function onPeriodChanged(ev: Event) {
  const element = ev.target as HTMLSelectElement;
  if (!element) {
    return;
  }

  const text = element.value;
  const parsedValue = parseInt(text, 10);
  if (Number.isNaN(parsedValue)) {
    return;
  }
  lastUpdated.value = parsedValue;
  await search();
}
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
        v-on:input="onTextChanged"
        placeholder="Enter text to filter projects..."
      />
      <div>
        <label id="activity-filter"
          >Choose projects active within the previous</label
        >

        <select v-on:change="onPeriodChanged" aria-labelledby="activity-filter">
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
  <div class="results-count" aria-live="polite">
    {{ currentProjects.length }} projects found
  </div>
  <div class="projects">
    <ProjectEntry
      v-for="project in currentProjects"
      :key="project.id"
      :project="project"
    />
  </div>
</template>
