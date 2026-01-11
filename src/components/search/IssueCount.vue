<script setup lang="ts">
import { formatDistance } from 'date-fns';

const props = defineProps<{
  issueCount?: number;
  lastUpdated?: Date;
}>();

const now = new Date();

const relativeLastUpdated = props.lastUpdated
  ? `Last updated ${formatDistance(now, props.lastUpdated)}`
  : 'No recent activity';
</script>

<style lang="css">
.count {
  text-align: center;
  vertical-align: middle;
  margin-left: 8px;
}
</style>

<template>
  <span
    class="count"
    v-bind:title="relativeLastUpdated"
    v-if="issueCount && issueCount > 0"
  >
    {{ issueCount }}
  </span>
</template>
