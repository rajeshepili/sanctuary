import { describe, expect, it } from 'vitest'
import {
  buildExportJsonPayload,
  buildExportMarkdown,
  EXPORT_VERSION,
} from './journal.export.lib'
import type { ExportEntry } from './journal.export.lib'

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
