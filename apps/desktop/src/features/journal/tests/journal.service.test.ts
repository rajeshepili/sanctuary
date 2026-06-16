import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import { createIsolatedTestDatabase, resetTestDatabase } from '#/test/database'
import { setDb } from '#/database'
import {
  getAllEntriesService,
  getDeletedEntriesService,
  createEntryService,
  permanentDeleteEntryService,
  togglePinService,
  updateEntryService,
  undeleteEntryService,
  deleteEntryService,
} from '../journal.service'

// Use an isolated (non-shared) in-memory DB so this file
// doesn't contaminate the shared singleton us0ed by integration tests.
let db: LibSQLDatabase<typeof schema>

describe('Journal Service Tests', () => {
  beforeAll(async () => {
    db = await createIsolatedTestDatabase()
  })

  beforeEach(() => {
    setDb(db)
  })

  afterEach(async () => {
    await resetTestDatabase(db)
  })

  it('creates a new journal entry', async () => {
    const entry = await createEntryService({ content: 'Test entry', media: [] })
    expect(entry.content).toBe('Test entry')
    expect(entry.isPinned).toBe(false)
  })

  it('returns only active entries from getAllEntriesService', async () => {
    await createEntryService({ content: 'Active', media: [] })
    const entries = await getAllEntriesService()
    expect(entries.length).toBe(1)
    expect(entries[0]?.content).toBe('Active')
  })

  it('soft-deletes an entry and hides it from active list', async () => {
    const entry = await createEntryService({ content: 'To delete', media: [] })
    await deleteEntryService({ id: entry.id })

    const active = await getAllEntriesService()
    const deleted = await getDeletedEntriesService()

    expect(active.length).toBe(0)
    expect(deleted.length).toBe(1)
    expect(deleted[0]?.id).toBe(entry.id)
  })

  it('permanently deletes an entry and removes it from all lists', async () => {
    const entry = await createEntryService({ content: 'Gone', media: [] })
    await deleteEntryService({ id: entry.id })
    await permanentDeleteEntryService(entry.id)

    expect(await getAllEntriesService()).toHaveLength(0)
    expect(await getDeletedEntriesService()).toHaveLength(0)
  })

  it('toggles the pin state of an entry', async () => {
    const entry = await createEntryService({ content: 'Pin me', media: [] })
    expect(entry.isPinned).toBe(false)

    const pinned = await togglePinService({ id: entry.id })
    expect(pinned.isPinned).toBe(true)

    const unpinned = await togglePinService({ id: entry.id })
    expect(unpinned.isPinned).toBe(false)
  })

  it('updates content and extracts tags', async () => {
    const entry = await createEntryService({ content: 'Original', media: [] })
    const updated = await updateEntryService({
      id: entry.id,
      content: 'Updated #journal',
      addedMedia: [],
      removedMediaIds: [],
    })
    expect(updated.content).toBe('Updated #journal')
    expect(updated.tags).toBe('journal')
  })

  it('undeletes a soft-deleted entry', async () => {
    const entry = await createEntryService({ content: 'Restore me', media: [] })
    await deleteEntryService({ id: entry.id })
    expect(await getAllEntriesService()).toHaveLength(0)

    await undeleteEntryService(entry.id)
    const active = await getAllEntriesService()
    expect(active.length).toBe(1)
    expect(active[0]?.id).toBe(entry.id)
  })
})