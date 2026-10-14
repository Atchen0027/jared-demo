// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://atchen0027.github.io',
  base: '/jared-demo',
  integrations: [sitemap()],
  build: {
    format: 'directory'
  }
});
