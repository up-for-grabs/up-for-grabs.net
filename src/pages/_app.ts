import type { App } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';

export default (app: App) => {
  app.use(VueQueryPlugin);
};
