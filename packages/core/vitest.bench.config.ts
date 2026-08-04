import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const packageRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: packageRoot,
  test: {
    name: '@watchstop/core-bench',
    environment: 'node',
    include: ['bench/**/*.bench.ts'],
    testTimeout: 120_000,
    disableConsoleIntercept: true,
  },
})
