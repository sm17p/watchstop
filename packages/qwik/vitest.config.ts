import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@watchstop/qwik',
    environment: 'happy-dom',
  },
})
