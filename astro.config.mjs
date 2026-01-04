// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  outDir: '_site/beta/',
  integrations: [vue()],
});
