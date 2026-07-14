import {
  exportAllData,
  exportMarkdown,
  getExportData,
} from '#/features/export/export.api'
import {
  buildExportJsonPayload,
  buildExportMarkdown,
  EXPORT_VERSION,
} from '#/features/export/export.lib'
import { FULL_BACKUP_VERSION } from '#/features/export/export.import'
import type { ExportEntry } from '#/features/export/export.lib'
import * as exportRepo from '#/features/export/export.repository'
import { describe, expect, it, vi } from 'vitest'

const FIXTURE_ENTRIES: ExportEntry[] = [
  {
    content: 'Morning reflection #gratitude',
    tags: 'gratitude,calm',
    isPinned: true,
    createdAt: new Date('2026-01-10T08:30:00.000Z'),
    media: [{ filePath: '/data/media/photo.webp' }],
  },
  {
    content: 'Evening note',
    tags: null,
    isPinned: false,
    createdAt: new Date('2026-01-09T20:00:00.000Z'),
    media: [],
  },
]

describe('journal export format', () => {
  it('builds a versioned JSON export payload', () => {
    const payload = buildExportJsonPayload(
      FIXTURE_ENTRIES,
      '2026-01-15T00:00:00.000Z',
    )

    expect(payload).toEqual({
      exportedAt: '2026-01-15T00:00:00.000Z',
      version: EXPORT_VERSION,
      entries: FIXTURE_ENTRIES,
    })
  })

  it('builds stable markdown frontmatter and attachment sections', () => {
    const { content, count } = buildExportMarkdown(FIXTURE_ENTRIES)

    expect(count).toBe(2)
    expect(content).toContain('date: "2026-01-10T08:30:00.000Z"')
    expect(content).toContain('tags: ["gratitude", "calm"]')
    expect(content).toContain('pinned: true')
    expect(content).toContain('Morning reflection #gratitude')
    expect(content).toContain('## Memories Attached')
    expect(content).toContain('- ![Memory](/data/media/photo.webp)')
    expect(content).toContain('date: "2026-01-09T20:00:00.000Z"')
    expect(content).toContain('tags: []')
    expect(content).toContain('pinned: false')
    expect(content).toContain('Evening note')

    const [, eveningBlock] = content.split('\n\n\n')
    expect(eveningBlock).not.toContain('## Memories Attached')
  })
})

describe('journal export server functions', () => {
  it('exportAllData returns valid JSON payload', async () => {
    vi.spyOn(exportRepo, 'findAllExportData').mockResolvedValue({
      entries: FIXTURE_ENTRIES as never,
      habits: [],
      categories: [],
      preferences: undefined,
      exportedAt: '2026-01-15T00:00:00.000Z',
    })

    const result = await exportAllData()
    expect(result.version).toBe(FULL_BACKUP_VERSION)
    expect(result.entries).toEqual(FIXTURE_ENTRIES)
  })

  it('exportMarkdown returns generated markdown string', async () => {
    vi.spyOn(exportRepo, 'findEntriesForExport').mockResolvedValue(
      FIXTURE_ENTRIES as never,
    )

    const result = await exportMarkdown()
    expect(result.count).toBe(2)
    expect(result.content).toContain('Morning reflection #gratitude')
  })

  it('getExportData returns comprehensive backup payload', async () => {
    const mockHabits = [{ id: 1, title: 'Read', completions: [] }]
    const mockPrefs = { theme: 'dark' }

    vi.spyOn(exportRepo, 'findAllExportData').mockResolvedValue({
      entries: FIXTURE_ENTRIES as never,
      habits: mockHabits as never,
      categories: [],
      preferences: mockPrefs as never,
      exportedAt: '2026-01-15T00:00:00.000Z',
    })

    const result = await getExportData()
    expect(result.entries).toEqual(FIXTURE_ENTRIES)
    expect(result.habits).toEqual(mockHabits)
    expect(result.preferences).toEqual(mockPrefs)
    expect(typeof result.exportedAt).toBe('string')
  })
})
