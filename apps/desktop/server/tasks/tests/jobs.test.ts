import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'

import { runJobs } from '#/../server/tasks/jobs'
import * as purgeModule from '#/database/purge'
import * as habitsService from '#/features/habits/habits.repository'
import * as exportRepo from '#/features/export/export.repository'
import { FULL_BACKUP_VERSION } from '#/features/export/export.import'
import * as prefsRepo from '#/features/preferences/preferences.repository'
import { createIsolatedTestDatabase } from '#/test/database'
import * as dbModule from '#/database'

// Default prefs stub — backup enabled, daily frequency, no prior backup.
const makePrefsStub = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: null,
  onboardedAt: null,
  disclaimerAgreed: true,
  privacyPin: null,
  latitude: null,
  longitude: null,
  locationLabel: null,
  syncDirectory: null,
  syncPassphraseHash: null,
  lastSyncedAt: null,
  backupEnabled: true,
  backupPath: null,
  backupFrequency: 'daily',
  lastBackupAt: null,
  backupKeepCount: 30,
  layoutMode: 'standard',
  ...overrides,
})

describe('Scheduled Backup (via Nitro Task)', () => {
  let backupDir: string

  beforeEach(async () => {
    const db = await createIsolatedTestDatabase()
    vi.spyOn(dbModule, 'getDb').mockResolvedValue(db)
    vi.spyOn(purgeModule, 'purgeStaleEntries').mockResolvedValue(undefined)
    vi.spyOn(purgeModule, 'purgeOrphanedMediaFiles').mockResolvedValue(
      undefined,
    )
    vi.spyOn(habitsService, 'reactivateHabits').mockResolvedValue(undefined)
    vi.spyOn(exportRepo, 'findAllExportData').mockResolvedValue({
      entries: [],
      habits: [],
      categories: [],
      preferences: undefined,
      exportedAt: new Date().toISOString(),
    })
    vi.spyOn(prefsRepo, 'updatePreferencesService').mockResolvedValue(
      makePrefsStub() as never,
    )

    backupDir = path.join(os.homedir(), 'Documents', 'Sanctuary Backups')
    await fs.remove(backupDir).catch(() => {})
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await fs.remove(backupDir).catch(() => {})
  })

  it('creates a backup file when lastBackupAt is null', async () => {
    vi.spyOn(prefsRepo, 'getPreferencesService').mockResolvedValue(
      makePrefsStub() as never,
    )

    await runJobs()

    const today = new Date().toISOString().split('T')[0]
    const backupFile = path.join(backupDir, `sanctuary-backup-${today}.json`)
    expect(await fs.pathExists(backupFile)).toBe(true)

    const content = await fs.readJson(backupFile)
    expect(content.version).toBe(FULL_BACKUP_VERSION)
  })

  it('skips backup when lastBackupAt is already today', async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    vi.spyOn(prefsRepo, 'getPreferencesService').mockResolvedValue(
      makePrefsStub({ lastBackupAt: todayStart }) as never,
    )

    await runJobs()

    // exportAllData should not be called since backup already ran today
    expect(exportRepo.findAllExportData).not.toHaveBeenCalled()
  })

  it('skips backup when backupEnabled is false', async () => {
    vi.spyOn(prefsRepo, 'getPreferencesService').mockResolvedValue(
      makePrefsStub({ backupEnabled: false }) as never,
    )

    await runJobs()

    expect(exportRepo.findAllExportData).not.toHaveBeenCalled()
  })

  it('skips backup when backupFrequency is manual', async () => {
    vi.spyOn(prefsRepo, 'getPreferencesService').mockResolvedValue(
      makePrefsStub({ backupFrequency: 'manual' }) as never,
    )

    await runJobs()

    expect(exportRepo.findAllExportData).not.toHaveBeenCalled()
  })

  it('runs export pipeline on a successful backup', async () => {
    vi.spyOn(prefsRepo, 'getPreferencesService').mockResolvedValue(
      makePrefsStub() as never,
    )

    await runJobs()

    expect(exportRepo.findAllExportData).toHaveBeenCalled()
  })
})
