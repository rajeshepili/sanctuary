import { defineHandler } from 'nitro/h3'
import {
  runBackupNow,
  getBackupStatus,
  backupFailureCount,
} from '../../tasks/jobs'
import { getPreferencesService } from '#/features/preferences/preferences.repository'
import path from 'node:path'
import os from 'node:os'

function getDefaultBackupDir(backupPath: string | null | undefined): string {
  return backupPath ?? path.join(os.homedir(), 'Documents', 'Sanctuary Backups')
}

export default defineHandler(async (event) => {
  const url = new URL(event.req.url, `http://localhost`)
  const action = url.searchParams.get('action') ?? 'status'

  const prefs = await getPreferencesService()
  const backupDir = getDefaultBackupDir(prefs.backupPath)

  if (action === 'run') {
    await runBackupNow()
    const status = await getBackupStatus(backupDir)
    return {
      ok: true,
      lastBackupAt: prefs.lastBackupAt,
      ...status,
    }
  }

  // Default: return current backup status
  const status = await getBackupStatus(backupDir)
  return {
    ok: true,
    backupEnabled: prefs.backupEnabled,
    backupPath: backupDir,
    backupFrequency: prefs.backupFrequency,
    backupKeepCount: prefs.backupKeepCount,
    lastBackupAt: prefs.lastBackupAt,
    failureCount: backupFailureCount,
    ...status,
  }
})
