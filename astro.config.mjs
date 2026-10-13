// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://atchen0027.github.io',
  base: '/jared-demo',
  build: {
    format: 'directory'
  }
});
