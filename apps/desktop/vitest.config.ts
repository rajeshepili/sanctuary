import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    isolate: false,
  },
  resolve: {
    alias: {
      '#': resolve(__dirname, './src'),
    },
  },
})
