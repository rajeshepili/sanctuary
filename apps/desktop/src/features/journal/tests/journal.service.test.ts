import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import { createIsolatedTestDatabase, resetTestDatabase } from '#/test/database'
import { setDb } from '#/database'
import {
  findAll,
  findTrash,
  create,
  permanentRemove,
  togglePin,
  update,
  restore,
  remove,
} from '../journal.repository'

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
    const entry = await create({ content: 'Test entry', media: [] })
    expect(entry.content).toBe('Test entry')
    expect(entry.isPinned).toBe(false)
  })

  it('returns only active entries from findAll', async () => {
    await create({ content: 'Active', media: [] })
    const entries = await findAll()
    expect(entries.length).toBe(1)
    expect(entries[0]?.content).toBe('Active')
  })

  it('soft-deletes an entry and hides it from active list', async () => {
    const entry = await create({ content: 'To delete', media: [] })
    await remove({ id: entry.id })

    const active = await findAll()
    const deleted = await findTrash()

    expect(active.length).toBe(0)
    expect(deleted.length).toBe(1)
    expect(deleted[0]?.id).toBe(entry.id)
  })

  it('permanently deletes an entry and removes it from all lists', async () => {
    const entry = await create({ content: 'Gone', media: [] })
    await remove({ id: entry.id })
    await permanentRemove(entry.id)

    expect(await findAll()).toHaveLength(0)
    expect(await findTrash()).toHaveLength(0)
  })

  it('toggles the pin state of an entry', async () => {
    const entry = await create({ content: 'Pin me', media: [] })
    expect(entry.isPinned).toBe(false)

    const pinned = await togglePin({ id: entry.id })
    expect(pinned.isPinned).toBe(true)

    const unpinned = await togglePin({ id: entry.id })
    expect(unpinned.isPinned).toBe(false)
  })

  it('updates content and extracts tags', async () => {
    const entry = await create({ content: 'Original', media: [] })
    const updated = await update({
      id: entry.id,
      content: 'Updated #journal',
      addedMedia: [],
      removedMediaIds: [],
    })
    expect(updated.content).toBe('Updated #journal')
    expect(updated.tags).toBe('journal')
  })

  it('undeletes a soft-deleted entry', async () => {
    const entry = await create({ content: 'Restore me', media: [] })
    await remove({ id: entry.id })
    expect(await findAll()).toHaveLength(0)

    await restore(entry.id)
    const active = await findAll()
    expect(active.length).toBe(1)
    expect(active[0]?.id).toBe(entry.id)
  })

  it('lists entries with cursor pagination', async () => {
    const { list } = await import('../journal.repository')
    await create({ content: 'E1', media: [] })
    await create({ content: 'E2', media: [] })
    await create({ content: 'E3', media: [] })

    const page1 = await list({ limit: 2 })
    expect(page1.items).toHaveLength(2)
    expect(page1.nextCursor).toBe(2)

    const page2 = await list({
      cursor: page1.nextCursor!,
      limit: 2,
    })
    expect(page2.items).toHaveLength(1)
    expect(page2.nextCursor).toBeNull()
  })

  it('gets a single entry by id', async () => {
    const { findById } = await import('../journal.repository')
    const entry = await create({ content: 'Single', media: [] })
    const fetched = await findById({ id: entry.id })
    expect(fetched?.id).toBe(entry.id)
    expect(fetched?.content).toBe('Single')

    const missing = await findById({ id: 99999 })
    expect(missing).toBeNull()
  })

  it('throws JOURNAL_NOT_FOUND when updating non-existent entry', async () => {
    await expect(
      update({
        id: 99999,
        content: 'Update',
        addedMedia: [],
        removedMediaIds: [],
      }),
    ).rejects.toThrow('Entry 99999 not found')
  })

  it('throws JOURNAL_NOT_FOUND when deleting non-existent entry', async () => {
    await expect(remove({ id: 99999 })).rejects.toThrow('Entry 99999 not found')
  })

  it('throws JOURNAL_NOT_FOUND when toggling pin on non-existent entry', async () => {
    await expect(togglePin({ id: 99999 })).rejects.toThrow(
      'Entry 99999 not found',
    )
  })

  it('throws JOURNAL_NOT_FOUND when undeleting non-existent entry', async () => {
    await expect(restore(99999)).rejects.toThrow('Entry 99999 not found')
  })

  it('rolls back prepared media if create transaction fails', async () => {
    // We mock prepareMediaAsset to return a dummy asset so we can spy on deleteMediaAssets
    const mediaService =
      await import('../../../infrastructure/media/media.processor')
    const prepareSpy = vi
      .spyOn(mediaService, 'prepareMediaAsset')
      .mockResolvedValue({
        filePath: 'dummy',
        thumbnailPath: 'dummy_thumb',
        mimeType: 'image/webp',
        fileSize: 100,
      })
    const deleteSpy = vi
      .spyOn(mediaService, 'deleteMediaAssets')
      .mockResolvedValue(undefined)

    // Spy on db.transaction to force a failure
    const txSpy = vi
      .spyOn(db, 'transaction')
      .mockRejectedValueOnce(new Error('DB connection lost'))

    await expect(
      create({
        content: 'Fail',
        media: [{ base64Data: 'dummy_base64' }],
      }),
    ).rejects.toThrow('Failed to create journal entry')

    expect(prepareSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledWith([
      {
        filePath: 'dummy',
        thumbnailPath: 'dummy_thumb',
        mimeType: 'image/webp',
        fileSize: 100,
      },
    ])

    prepareSpy.mockRestore()
    deleteSpy.mockRestore()
    txSpy.mockRestore()
  })

  it('rolls back prepared media if update transaction fails', async () => {
    const entry = await create({ content: 'Update me', media: [] })

    const mediaService =
      await import('../../../infrastructure/media/media.processor')
    const prepareSpy = vi
      .spyOn(mediaService, 'prepareMediaAsset')
      .mockResolvedValue({
        filePath: 'dummy',
        thumbnailPath: 'dummy_thumb',
        mimeType: 'image/webp',
        fileSize: 100,
      })
    const deleteSpy = vi
      .spyOn(mediaService, 'deleteMediaAssets')
      .mockResolvedValue(undefined)

    const txSpy = vi
      .spyOn(db, 'transaction')
      .mockRejectedValueOnce(new Error('DB error'))

    await expect(
      update({
        id: entry.id,
        content: 'Failed update',
        addedMedia: [{ base64Data: 'dummy_base64' }],
        removedMediaIds: [],
      }),
    ).rejects.toThrow('Failed to update journal entry')

    expect(deleteSpy).toHaveBeenCalledTimes(1)

    prepareSpy.mockRestore()
    deleteSpy.mockRestore()
    txSpy.mockRestore()
  })

  it('deletes old media when updating an entry', async () => {
    // 1. Mock prepareMediaAsset so we can "upload" fake media
    const mediaService =
      await import('../../../infrastructure/media/media.processor')
    const prepareSpy = vi
      .spyOn(mediaService, 'prepareMediaAsset')
      .mockResolvedValue({
        filePath: 'dummy',
        thumbnailPath: 'dummy_thumb',
        mimeType: 'image/webp',
        fileSize: 100,
      })
    const deleteSpy = vi
      .spyOn(mediaService, 'deleteMediaAssets')
      .mockResolvedValue(undefined)

    // Create entry with 1 media
    const entry = await create({
      content: 'Has media',
      media: [{ base64Data: 'dummy_base64' }],
    })

    expect(entry.media).toHaveLength(1)
    const mediaId = entry.media[0].id

    // Update entry and remove that media
    await update({
      id: entry.id,
      content: 'No media now',
      addedMedia: [],
      removedMediaIds: [mediaId],
    })

    // Assert the media was deleted
    expect(deleteSpy).toHaveBeenCalled()

    prepareSpy.mockRestore()
    deleteSpy.mockRestore()
  })

  it('deletes media when permanently deleting an entry', async () => {
    const mediaService =
      await import('../../../infrastructure/media/media.processor')
    const prepareSpy = vi
      .spyOn(mediaService, 'prepareMediaAsset')
      .mockResolvedValue({
        filePath: 'dummy',
        thumbnailPath: 'dummy_thumb',
        mimeType: 'image/webp',
        fileSize: 100,
      })
    const deleteSpy = vi
      .spyOn(mediaService, 'deleteMediaAssets')
      .mockResolvedValue(undefined)

    const entry = await create({
      content: 'Will be permanent deleted',
      media: [{ base64Data: 'dummy_base64' }],
    })

    // Soft delete first
    await remove({ id: entry.id })
    // Then permanent delete
    await permanentRemove(entry.id)

    expect(deleteSpy).toHaveBeenCalled()

    prepareSpy.mockRestore()
    deleteSpy.mockRestore()
  })
})
