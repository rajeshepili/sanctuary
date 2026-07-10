import { definePlugin } from 'nitro'
import { shutdownDatabase } from '#/database/index'

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    console.log('[server] Gracefully shutting down services...')
    await shutdownDatabase()
  })

  // Also handle process signals directly to be safe
  process.on('SIGTERM', async () => {
    console.log('[server] Received SIGTERM, shutting down...')
    await shutdownDatabase()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('[server] Received SIGINT, shutting down...')
    await shutdownDatabase()
    process.exit(0)
  })
})
