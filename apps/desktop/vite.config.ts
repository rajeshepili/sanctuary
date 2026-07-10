import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    host: '127.0.0.1',
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-tiptap',
              test: /@tiptap|prosemirror|marked/,
            },
            {
              name: 'vendor-motion',
              test: /framer-motion/,
            },
            {
              name: 'vendor-viz',
              test: /recharts|d3/,
            },
            {
              name: 'vendor-ui',
              test: /radix-ui|lucide-react|sonner|vaul/,
            },
            {
              name: 'vendor-query',
              test: /@tanstack\/react-query/,
            },
          ],
        },
      },
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
