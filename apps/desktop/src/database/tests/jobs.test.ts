import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'

import {
  startBackgroundJobs,
  stopBackgroundJobs,
  runJobs,
  resetLastBackupDate,
} from '#/database/jobs'
import * as purgeModule from '#/database/purge'
import * as habitsService from '#/features/habits/habits.service'
import * as journalExport from '#/features/journal/journal.export'
import { createIsolatedTestDatabase } from '#/test/database'
import * as dbModule from '#/database'

describe('Background Jobs Scheduling', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    const db = await createIsolatedTestDatabase()
    vi.spyOn(dbModule, 'getDb').mockResolvedValue(db)
    vi.spyOn(purgeModule, 'purgeStaleEntries').mockResolvedValue(undefined)
    vi.spyOn(purgeModule, 'purgeOrphanedMediaFiles').mockResolvedValue(
      undefined,
    )
    vi.spyOn(habitsService, 'reactivateHabits').mockResolvedValue(undefined)
    vi.spyOn(journalExport, 'exportAllData').mockResolvedValue({
      version: 1,
      entries: [],
      exportedAt: new Date().toISOString(),
    })
    resetLastBackupDate()
  })

  afterEach(() => {
    stopBackgroundJobs()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('runs jobs immediately upon start and then on interval', async () => {
    // startBackgroundJobs calls runJobs() synchronously
    startBackgroundJobs()

    // We can also call runJobs directly to await its completion for testing
    await runJobs()

    expect(purgeModule.purgeStaleEntries).toHaveBeenCalled()
    expect(purgeModule.purgeOrphanedMediaFiles).toHaveBeenCalled()
    expect(habitsService.reactivateHabits).toHaveBeenCalled()
    expect(journalExport.exportAllData).toHaveBeenCalled()

    vi.clearAllMocks()

    // Advance timer by 1 hour
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)

    expect(purgeModule.purgeStaleEntries).toHaveBeenCalled()
    expect(purgeModule.purgeOrphanedMediaFiles).toHaveBeenCalled()
    expect(habitsService.reactivateHabits).toHaveBeenCalled()
  })

  it('does not create duplicate intervals if started multiple times', async () => {
    startBackgroundJobs()
    startBackgroundJobs()

    await new Promise((resolve) => process.nextTick(resolve))
    vi.clearAllMocks()
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)

    expect(purgeModule.purgeStaleEntries).toHaveBeenCalledTimes(1)
  })

  it('stops running jobs after stopBackgroundJobs is called', async () => {
    startBackgroundJobs()
    stopBackgroundJobs()

    await new Promise((resolve) => process.nextTick(resolve))
    vi.clearAllMocks()
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)

    expect(purgeModule.purgeStaleEntries).not.toHaveBeenCalled()
  })
})

describe('runDailyBackup (via jobs tick)', () => {
  let backupDir: string

  beforeEach(async () => {
    const db = await createIsolatedTestDatabase()
    vi.spyOn(dbModule, 'getDb').mockResolvedValue(db)
    vi.spyOn(purgeModule, 'purgeStaleEntries').mockResolvedValue(undefined)
    vi.spyOn(purgeModule, 'purgeOrphanedMediaFiles').mockResolvedValue(
      undefined,
    )
    vi.spyOn(habitsService, 'reactivateHabits').mockResolvedValue(undefined)
    vi.spyOn(journalExport, 'exportAllData').mockResolvedValue({
      version: 1,
      entries: [],
      exportedAt: new Date().toISOString(),
    })

    backupDir = path.join(os.homedir(), 'Documents', 'Sanctuary_Backups')
    await fs.remove(backupDir).catch(() => {})
    resetLastBackupDate()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await fs.remove(backupDir).catch(() => {})
  })

  it('creates a backup file on the first run of the day', async () => {
    await runJobs()

    const today = new Date().toISOString().split('T')[0]
    const backupFile = path.join(backupDir, `sanctuary-backup-${today}.json`)

    expect(await fs.pathExists(backupFile)).toBe(true)

    const content = await fs.readJson(backupFile)
    expect(content.version).toBe(1)
  })

  it('does not create duplicate backups on the same day', async () => {
    await runJobs()
    expect(journalExport.exportAllData).toHaveBeenCalledTimes(1)

    // Call it again immediately
    await runJobs()

    // exportAllData should still have only been called once because date is same
    expect(journalExport.exportAllData).toHaveBeenCalledTimes(1)
  })
})
