import { parseCommaList } from '#/utils/string'

export const EXPORT_VERSION = 1

export type ExportEntry = {
  content: string
  tags: string | null
  isPinned: boolean
  createdAt: Date
  media: Array<{ filePath: string }>
}

export function buildExportJsonPayload(
  entries: ExportEntry[],
  exportedAt: string,
) {
  return {
    exportedAt,
    version: EXPORT_VERSION,
    entries,
  }
}

export function buildExportMarkdown(entries: ExportEntry[]) {
  let allMarkdown = ''

  for (const entry of entries) {
    const date = new Date(entry.createdAt)
    const parsedTags = parseCommaList(entry.tags)
    const tags =
      parsedTags.length > 0 ? parsedTags.map((t) => `"${t}"`).join(', ') : ''

    const attachmentsList =
      entry.media.length > 0
        ? '\n\n---\n\n## Memories Attached\n\n' +
          entry.media.map((m) => `- ![Memory](${m.filePath})`).join('\n')
        : ''

    const frontmatter = [
      '---',
      `date: "${date.toISOString()}"`,
      tags ? `tags: [${tags}]` : 'tags: []',
      `pinned: ${entry.isPinned}`,
      '---',
      '',
    ].join('\n')

    allMarkdown += frontmatter + entry.content + attachmentsList + '\n\n\n'
  }

  return { content: allMarkdown, count: entries.length }
}
