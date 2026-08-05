import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const packageRoot = dirname(fileURLToPath(import.meta.url))
const coreSrc = resolve(packageRoot, '../../packages/core/src/index.ts')

export default defineConfig({
  root: packageRoot,
  resolve: {
    alias: {
      '@watchstop/core': coreSrc,
    },
  },
  test: {
    name: '@watchstop/bench-core',
    environment: 'node',
    include: ['**/*.bench.ts'],
    testTimeout: 120_000,
    disableConsoleIntercept: true,
  },
})
