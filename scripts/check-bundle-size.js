#!/usr/bin/env node
/**
 * Warns when client JS bundles exceed configured budgets after `pnpm build`.
 */

import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const assetsDir = join(root, '.output', 'public', 'assets')

const BUDGETS = {
  maxSingleChunkKb: 550,
  maxTotalJsKb: 1800,
}

async function collectJsSizes(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue
    const filePath = join(dir, entry.name)
    const { size } = await stat(filePath)
    files.push({ name: entry.name, size })
  }

  return files
}

async function main() {
  let files
  try {
    files = await collectJsSizes(assetsDir)
  } catch {
    console.error(
      'Bundle size check skipped: run `pnpm build` first (.output/public/assets missing).',
    )
    process.exit(0)
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  const largest = files.reduce(
    (max, file) => (file.size > max.size ? file : max),
    { name: '', size: 0 },
  )

  const totalKb = Math.round(totalBytes / 1024)
  const largestKb = Math.round(largest.size / 1024)

  console.log(`Client JS: ${files.length} chunks, ${totalKb} KB total`)
  console.log(`Largest chunk: ${largest.name} (${largestKb} KB)`)

  let failed = false

  if (largestKb > BUDGETS.maxSingleChunkKb) {
    console.error(
      `FAIL: largest chunk ${largestKb} KB exceeds ${BUDGETS.maxSingleChunkKb} KB`,
    )
    failed = true
  }

  if (totalKb > BUDGETS.maxTotalJsKb) {
    console.error(
      `FAIL: total JS ${totalKb} KB exceeds ${BUDGETS.maxTotalJsKb} KB`,
    )
    failed = true
  }

  if (!failed) {
    console.log('Bundle size check passed.')
  }

  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
