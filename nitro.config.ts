import { defineConfig } from 'nitro/config'

export default defineConfig({
  handlers: [
    {
      route: '/**',
      handler: './server/middleware/session-auth.ts',
      middleware: true,
    },
  ],
})
