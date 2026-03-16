<script setup lang="ts">
import ProjectForkCount from './ForkCount.vue';
import ProjectIssueCount from './IssueCount.vue';
import { type WebsiteProject } from '../data/schema';

const props = defineProps<{
  project: WebsiteProject;
}>();

const { project } = props;
const stats = project.stats;

const linkTitle = `View open issues for ${project.name}`;
</script>

<style lang="css">
.project {
  background: #e2e2e2;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 8px;
}

.project .header {
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 1em;
}

.project .title {
  font-weight: bold;
  flex-grow: 1;
  font-size: 1.5em;
}

.project .title a {
  color: #2a3a40;
}

.project .label {
  margin-left: 8px;
}

.project .tags {
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding-inline-start: 0px;
  margin-bottom: 0;
}

.project .tags li {
  margin: 0.3em 0.3em;
  border: 1px solid black;
  border-radius: 5px;
  background: #bfd1d9;
  padding: 0.3em;
}

.label {
  color: rgb(255, 255, 255);
  background: #4c6c73;
  border-radius: 4px;
  padding-block: 0.1rem;
  padding: 4px 12px;
}

.label a {
  color: rgb(255, 255, 255);
}
</style>

<template>
  <div class="project" :class="stats ? 'counted' : ''">
    <div class="header">
      <div class="title">
        <a v-bind:href="project.site" target="_blank">{{ project.name }}</a>
      </div>

      <ProjectForkCount :fork-count="stats.forkCount" />

      <div class="label">
        <a
          v-bind:href="project.upforgrabs.link"
          v-bind:title="linkTitle"
          target="_blank"
          tabindex="-1"
        >
          {{ project.upforgrabs.name }}
        </a>
        <ProjectIssueCount
          :issue-count="stats.issueCount"
          :last-updated="stats.lastUpdated"
        />
      </div>
    </div>

    <div class="description" v-if="project.desc">{{ project.desc }}</div>

    <ul class="tags" v-if="project.tags" aria-label="project tags">
      <li v-for="tag in project.tags" v-bind:key="tag">{{ tag }}</li>
    </ul>
  </div>
</template>
