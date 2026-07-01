import { createServerFn } from '@tanstack/react-start'
import { findEntriesForExport, findAllExportData } from './export.repository'
import { buildExportMarkdown } from './export.lib'
import { buildFullBackupPayload, importBackupPayload, parseBackupPayload } from './export.import'
import z from 'zod'

// ── JSON / Backup ─────────────────────────────────────────────────────────────

export const exportAllData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const data = await findAllExportData()
    return buildFullBackupPayload(data)
  },
)

export const getExportData = createServerFn({ method: 'GET' }).handler(
  () => findAllExportData(),
)

const importBackupSchema = z.object({
  json: z.string(),
  mode: z.enum(['merge', 'replace']),
})

export const importBackupFromJson = createServerFn({ method: 'POST' })
  .validator(importBackupSchema)
  .handler(async ({ data }) => {
    const parsed = parseBackupPayload(JSON.parse(data.json))
    return importBackupPayload(parsed, data.mode)
  })

// ── Markdown ──────────────────────────────────────────────────────────────────

export const exportMarkdown = createServerFn({ method: 'GET' }).handler(
  async () => {
    const entries = await findEntriesForExport()
    return buildExportMarkdown(entries)
  },
)
