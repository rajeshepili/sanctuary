import { getDb } from '#/database'
import { purgeStaleEntries, purgeOrphanedMediaFiles } from '#/database/purge'
import { reactivateHabits } from '#/features/habits/habits.repository'
import { findAllExportData } from '#/features/export/export.repository'
import { buildFullBackupPayload } from '#/features/export/export.import'
import {
  getPreferencesService,
  updatePreferencesService,
} from '#/features/preferences/preferences.repository'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import { createLogger } from '#/lib/logger'
import { getTodayStr, toLocalDateString } from '#/utils/date'

const logger = createLogger('jobs')

// Tracks consecutive backup failures to surface an alert badge in Settings.
export let backupFailureCount = 0

function getDefaultBackupDir(): string {
  return path.join(os.homedir(), 'Documents', 'Sanctuary Backups')
}

// Removes backup files beyond the user's configured retention window.
async function pruneOldBackups(dir: string, keepCount: number): Promise<void> {
  try {
    const files = await fs.readdir(dir)
    const backups = files
      .filter((f) => /^sanctuary-backup-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .reverse()

    for (const file of backups.slice(keepCount)) {
      await fs.remove(path.join(dir, file))
      logger.info(`Pruned old backup: ${file}`)
    }
  } catch {
    // Non-fatal — pruning must not block the main backup run.
  }
}

// Returns file count and date range of existing backups.
export async function getBackupStatus(backupDir: string): Promise<{
  count: number
  oldest: string | null
  newest: string | null
}> {
  try {
    const files = await fs.readdir(backupDir)
    const backups = files
      .filter((f) => /^sanctuary-backup-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()

    return {
      count: backups.length,
      oldest: backups[0] ?? null,
      newest: backups[backups.length - 1] ?? null,
    }
  } catch {
    return { count: 0, oldest: null, newest: null }
  }
}

// Runs a backup immediately, bypassing the date guard. Used by the manual
// "Back Up Now" button in Settings and by the scheduled runner after its own check.
export async function runBackupNow(): Promise<void> {
  const prefs = await getPreferencesService()
  const backupDir = prefs.backupPath ?? getDefaultBackupDir()
  await fs.ensureDir(backupDir)

  const result = buildFullBackupPayload(await findAllExportData())
  const today = getTodayStr()
  const filename = `sanctuary-backup-${today}.json`
  await fs.writeJson(path.join(backupDir, filename), result, { spaces: 2 })
  await updatePreferencesService({ lastBackupAt: new Date() })
  await pruneOldBackups(backupDir, prefs.backupKeepCount ?? 30)

  backupFailureCount = 0
  logger.info(`Backup saved: ${filename}`)
}

// Checks the user's backup schedule and runs a backup only when due.
async function runScheduledBackup(): Promise<void> {
  const prefs = await getPreferencesService()

  if (!prefs.backupEnabled || prefs.backupFrequency === 'manual') return

  const today = getTodayStr()

  if (prefs.backupFrequency === 'weekly') {
    if (prefs.lastBackupAt) {
      const daysSinceLast = Math.floor(
        (Date.now() - new Date(prefs.lastBackupAt).getTime()) / 86_400_000,
      )
      if (daysSinceLast < 7) return
    }
  } else {
    // Daily — skip if already backed up today (local calendar date).
    const lastDay = prefs.lastBackupAt
      ? toLocalDateString(prefs.lastBackupAt)
      : null
    if (lastDay === today) return
  }

  try {
    await runBackupNow()
    backupFailureCount = 0
  } catch (error) {
    backupFailureCount++
    logger.error(`Backup failed (${backupFailureCount} consecutive):`, error)
  }
}

// Entry point called by the scheduler plugin on each tick.
export async function runJobs(): Promise<void> {
  logger.info('Running background maintenance...')
  try {
    const db = await getDb()
    await purgeStaleEntries(db)
    await purgeOrphanedMediaFiles(db)
    await reactivateHabits()
    await runScheduledBackup()
  } catch (error) {
    logger.error('Error in background jobs:', error)
    throw error
  }
}
