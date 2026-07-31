import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte({ configFile: false })],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    name: '@watchstop/svelte',
    environment: 'happy-dom',
  },
})
