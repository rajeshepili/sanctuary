import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

// ── JSON / Backup ─────────────────────────────────────────────────────────────

export const exportAllData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findAllExportData } = await import('./export.repository')
    const { buildFullBackupPayload } = await import('./export.import')
    const data = await findAllExportData()
    return buildFullBackupPayload(data)
  },
)

export const getExportData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findAllExportData } = await import('./export.repository')
    return findAllExportData()
  },
)

const importBackupSchema = z.object({
  json: z.string(),
  mode: z.enum(['merge', 'replace']),
})

export const importBackupFromJson = createServerFn({ method: 'POST' })
  .validator(importBackupSchema)
  .handler(async ({ data }) => {
    const { parseBackupPayload, importBackupPayload } =
      await import('./export.import')
    const parsed = parseBackupPayload(JSON.parse(data.json))
    return importBackupPayload(parsed, data.mode)
  })

// ── Markdown ──────────────────────────────────────────────────────────────────

export const exportMarkdown = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { findEntriesForExport } = await import('./export.repository')
    const { buildExportMarkdown } = await import('./export.lib')
    const entries = await findEntriesForExport()
    return buildExportMarkdown(entries)
  },
)
