import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vue from '@astrojs/vue'
import svelte from '@astrojs/svelte'
import solid from '@astrojs/solid-js'
import alpinejs from '@astrojs/alpinejs'
import angular from '@analogjs/astro-angular'
import { qwikVite } from '@qwik.dev/core/optimizer'

export default defineConfig({
  integrations: [
    react({ include: ['**/react/**'] }),
    vue(),
    svelte(),
    solid({ include: ['**/solid/**'] }),
    alpinejs({ entrypoint: '/src/alpine-entrypoint' }),
    angular({
      vite: {
        transformFilter: (_code, id) => id.includes('/angular/'),
      },
    }),
  ],
  vite: {
    define: {
      __EXPERIMENTAL__: JSON.stringify({ suspense: false }),
    },
    ssr: {
      noExternal: [
        '@watchstop/angular',
        '@watchstop/core',
        '@angular/core',
        '@angular/common',
      ],
    },
    plugins: [
      qwikVite({
        csr: true,
        fileFilter: (id) => id.includes('/qwik/'),
      }),
    ],
  },
})
