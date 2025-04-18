// @ts-check
import { defineConfig } from 'astro/config';

<<<<<<< HEAD
import svelte from '@astrojs/svelte';
=======
import tailwindcss from '@tailwindcss/vite';
>>>>>>> test

// https://astro.build/config
export default defineConfig({
  site: 'https://knuspermixx.github.io',
  base: 'astro-edit-starter',
<<<<<<< HEAD
  integrations: [svelte()],
=======

  vite: {
    plugins: [tailwindcss()],
  },
>>>>>>> test
});