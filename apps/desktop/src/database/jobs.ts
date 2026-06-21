import { getDb } from '#/database'
import { purgeStaleEntries, purgeOrphanedMediaFiles } from '#/database/purge'
import { reactivateHabits } from '#/features/habits/habits.service'
import { exportAllData } from '#/features/journal/journal.export'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import { createLogger } from '#/lib/logger'

const logger = createLogger('jobs')
let jobsInterval: NodeJS.Timeout | null = null

const JOBS_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function startBackgroundJobs() {
  if (jobsInterval) return

  logger.info('Starting background jobs scheduler...')
  runJobs()

  jobsInterval = setInterval(runJobs, JOBS_INTERVAL_MS)
}

export function stopBackgroundJobs() {
  if (jobsInterval) {
    clearInterval(jobsInterval)
    jobsInterval = null
  }
}

export async function runJobs() {
  logger.info('Running background jobs tick...')
  try {
    const db = await getDb()

    await purgeStaleEntries(db)
    await purgeOrphanedMediaFiles(db)
    await reactivateHabits(db)
    await runDailyBackup()
  } catch (error) {
    logger.error('Error running background jobs:', error)
    console.error('RUN_JOBS_ERROR:', error)
    throw error // Re-throw so tests fail properly instead of silently ignoring
  }
}

let lastBackupDate = ''

export function resetLastBackupDate() {
  lastBackupDate = ''
}

async function runDailyBackup() {
  const today = new Date().toISOString().split('T')[0]
  if (lastBackupDate === today) {
    return
  }

  try {
    const result = await exportAllData()
    const backupDir = path.join(os.homedir(), 'Documents', 'Sanctuary_Backups')
    await fs.ensureDir(backupDir)

    const filename = `sanctuary-backup-${today}.json`
    const filepath = path.join(backupDir, filename)

    await fs.writeJson(filepath, result, { spaces: 2 })
    logger.info(`Automated backup saved to ${filepath}`)

    lastBackupDate = today
  } catch (error) {
    logger.error('Automated backup failed:', error)
  }
}
