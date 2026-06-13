import { getDb } from './index'
import { purgeStaleEntries, purgeOrphanedMediaFiles } from './purge'
import { reactivateHabits } from '#/features/habits/habits.service'
import { exportAllData } from '#/features/journal/journal.export'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'

let jobsInterval: NodeJS.Timeout | null = null

const JOBS_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function startBackgroundJobs() {
  if (jobsInterval) return

  console.log('[jobs] Starting background jobs scheduler...')
  runJobs()

  jobsInterval = setInterval(runJobs, JOBS_INTERVAL_MS)
}

export function stopBackgroundJobs() {
  if (jobsInterval) {
    clearInterval(jobsInterval)
    jobsInterval = null
  }
}

async function runJobs() {
  console.log('[jobs] Running background jobs tick...')
  try {
    const db = await getDb()

    await purgeStaleEntries(db)
    await purgeOrphanedMediaFiles(db)
    await reactivateHabits(db)
    await runDailyBackup()
  } catch (error) {
    console.error('[jobs] Error running background jobs:', error)
  }
}

let lastBackupDate = ''

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
    console.log(`[jobs] Automated backup saved to ${filepath}`)

    lastBackupDate = today
  } catch (error) {
    console.error('[jobs] Automated backup failed:', error)
  }
}
