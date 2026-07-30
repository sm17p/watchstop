import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@watchstop/svelte',
    environment: 'happy-dom',
  },
})
