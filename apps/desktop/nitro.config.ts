import { defineConfig } from 'nitro/config'

export default defineConfig({
  // `server/` holds the Nitro file-system routes and middleware. Telling Nitro
  // about it lets the dev plugin scan `server/routes/**` and serve them
  // (e.g. /api/media/:id for <img> requests) without falling through to Vite.
  serverDir: 'server',
  handlers: [
    {
      route: '/**',
      handler: './server/middleware/session-auth.ts',
      middleware: true,
    },
  ],
})
