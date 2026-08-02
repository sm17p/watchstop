import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: [
    'packages/core',
    'packages/react',
    'packages/svelte',
    'packages/vue',
    'packages/solid',
    'packages/angular',
    'packages/alpine',
  ],
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
