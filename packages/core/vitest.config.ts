import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@watchstop/core',
    environment: 'node',
    exclude: ['**/bench/**', '**/node_modules/**', '**/dist/**'],
  },
})
