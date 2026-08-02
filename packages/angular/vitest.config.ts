import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@watchstop/angular',
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
