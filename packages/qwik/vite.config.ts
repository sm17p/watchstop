import { defineConfig } from 'vite'
import { qwikVite } from '@qwik.dev/core/optimizer'

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        `index.qwik.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        '@qwik.dev/core',
        '@qwik.dev/core/jsx-runtime',
        '@qwik.dev/core/server',
        '@watchstop/core',
      ],
    },
  },
  plugins: [qwikVite({ lint: false })],
})
