import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@watchstop/react',
    environment: 'jsdom',
  },
})
