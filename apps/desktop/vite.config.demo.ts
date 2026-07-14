/**
 * Demo build configuration — produces a fully static SPA for Vercel.
 *
 * Key differences from vite.config.ts:
 *  - No tanstackStart() / nitro(): the full-stack SSR stack is removed
 *  - Uses demo.html + src/demo-entry.tsx as the SPA entry point
 *  - VITE_DEMO_MODE=true is baked in so MSW starts before React mounts
 *  - Base is "/" — Vercel serves from root, no subpath needed
 *  - SPA routing is handled by vercel.json rewrites (no 404.html hack needed)
 *
 * Usage:
 *   pnpm build:demo           → builds to dist-demo/
 *   pnpm preview:demo         → preview the static output locally
 */

import { defineConfig } from 'vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },

  // Vercel serves from root, so base is '/'.
  base: process.env.VITE_BASE_URL ?? '/',

  // Bake VITE_DEMO_MODE into the bundle at build time.
  define: {
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true'),
  },

  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      input: './demo.html',
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-tiptap', test: /@tiptap|prosemirror/ },
            { name: 'vendor-motion', test: /framer-motion/ },
            { name: 'vendor-ui', test: /radix-ui|lucide-react|sonner/ },
            { name: 'vendor-query', test: /@tanstack\/react-query/ },
          ],
        },
      },
    },
  },

  plugins: [
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
