// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://knuspermixx.github.io',
  base: 'astro-edit-starter',

  vite: {
    plugins: [tailwindcss()],
  },
});