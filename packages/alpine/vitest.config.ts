import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@watchstop/alpine',
    environment: 'happy-dom',
  },
})
