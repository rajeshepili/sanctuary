import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  site: 'https://rajeshepili.github.io',
  base: '/sanctuary',
  outDir: './dist',

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Required when Vite 8 is hoisted: @tailwindcss/vite spreads this object into
      // createResolver() and Vite 8 rejects resolve options without `tsconfigPaths`.
      tsconfigPaths: true,
    },
  },

  integrations: [react()],
})
