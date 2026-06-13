import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import { createTestDatabase, resetTestDatabase } from '#/test/database'
import {
    getAllEntriesService,
    getDeletedEntriesService,
    createEntryService,
    permanentDeleteEntryService,
    togglePinService,
    updateEntryService,
    undeleteEntryService
} from '../journal.service'

describe('Journal Service Tests', () => {
    let db: LibSQLDatabase<typeof schema>

    beforeEach(async () => {
        db = await createTestDatabase()
    })

    afterEach(async () => {
        await resetTestDatabase(db)
    })

    it('creates a new journal entry', async () => {
        const entry = await createEntryService({
            content: 'Test entry',
            media: []
        })
        expect(entry).toBeDefined()
        expect(entry.content).toBe('Test entry')
    })

    it('get all entries', async () => {
        const entries = await getAllEntriesService()
        expect(entries).toBeDefined()
        expect(entries.length).toBe(0)
    })

    it('get deleted entries', async () => {
        const entries = await getDeletedEntriesService()
        expect(entries).toBeDefined()
        expect(entries.length).toBe(0)
    })

    it('permanent delete entry', async () => {
        const entry = await createEntryService({
            content: 'Test entry',
            media: []
        })
        await permanentDeleteEntryService(entry.id)
        const entries = await getDeletedEntriesService()
        expect(entries).toBeDefined()
        expect(entries.length).toBe(1)
    })

    it('toggle pin', async () => {
        const entry = await createEntryService({
            content: 'Test entry',
            media: []
        })
        await togglePinService({ id: entry.id })
        const entries = await getAllEntriesService()
        expect(entries).toBeDefined()
        expect(entry).toBe(1)
    })

    it('update entry', async () => {
        const entry = await createEntryService({
            content: 'Test entry',
            media: []
        })
        await updateEntryService({
          id: entry.id,
          content: 'Updated entry',
          addedMedia: [],
          removedMediaIds: [],
        })
        const entries = await getAllEntriesService()
        expect(entries).toBeDefined()
        expect(entries.length).toBe(1)
    })

    it('undelete entry', async () => {
        const entry = await createEntryService({
            content: 'Test entry',
            media: []
        })
        await permanentDeleteEntryService(entry.id)
        await undeleteEntryService(entry.id)
        const entries = await getAllEntriesService()
        expect(entries).toBeDefined()
        expect(entries.length).toBe(1)
    })
})