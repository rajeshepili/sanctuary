import { definePlugin } from 'nitro'
import { runJobs } from '../tasks/jobs'
import { createLogger } from '#/lib/logger'

const logger = createLogger('scheduler')

// How often to run background maintenance. Hourly is a safe default:
// the job runner itself checks dates internally and skips work that's
// already been done, so running it more frequently is cheap.
const TICK_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export default definePlugin((nitroApp) => {
  // Run once shortly after startup so the first backup isn't delayed by a full hour.
  const startupDelay = setTimeout(() => {
    void runJobs().catch((err: unknown) =>
      logger.error('Startup job run failed:', err),
    )
  }, 30_000) // 30 seconds after server is ready

  // Then tick on the regular interval.
  const interval = setInterval(() => {
    void runJobs().catch((err: unknown) =>
      logger.error('Scheduled job run failed:', err),
    )
  }, TICK_INTERVAL_MS)

  // Clean up timers when the server shuts down.
  nitroApp.hooks.hook('close', () => {
    clearTimeout(startupDelay)
    clearInterval(interval)
    logger.info('Scheduler stopped.')
  })

  logger.info(
    `Scheduler started — ticking every ${TICK_INTERVAL_MS / 60_000} min.`,
  )
})
