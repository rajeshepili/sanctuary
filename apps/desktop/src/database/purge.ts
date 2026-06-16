import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import { journalEntries } from '#/database/schema'
import { and, isNotNull, lt } from 'drizzle-orm'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import { createLogger } from '#/lib/logger'
import { deleteMediaAssets } from '#/features/media/media.service'

const logger = createLogger('purge')
const SOFT_DELETE_GRACE_DAYS = 30

type Database = LibSQLDatabase<typeof schema>

export async function purgeOrphanedMediaFiles(db: Database): Promise<void> {
  try {
    const mediaDir =
      process.env.MEDIA_STORAGE_PATH ||
      path.join(os.homedir(), '.config', 'sanctuary', 'media')

    const exists = await fs.pathExists(mediaDir)
    if (!exists) return

    const files = await fs.readdir(mediaDir)
    if (files.length === 0) return

    const mediaRecords = await db.query.entryMedia.findMany({
      columns: { filePath: true, thumbnailPath: true },
    })

    const validPaths = new Set<string>()
    for (const record of mediaRecords) {
      validPaths.add(record.filePath)
      validPaths.add(record.thumbnailPath)
    }

    let purged = 0
    for (const file of files) {
      const fullPath = path.join(mediaDir, file)
      if (!validPaths.has(fullPath)) {
        await fs.remove(fullPath)
        purged++
      }
    }

    if (purged > 0) {
      logger.info(`Purged ${purged} orphaned media file${purged === 1 ? '' : 's'}`)
    }
  } catch (err) {
    logger.error('Failed to purge orphaned media:', err)
  }
}

export async function purgeStaleEntries(db: Database): Promise<void> {
  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - SOFT_DELETE_GRACE_DAYS)

    const stale = await db.query.journalEntries.findMany({
      with: { media: true },
      where: and(
        isNotNull(journalEntries.deletedAt),
        lt(journalEntries.deletedAt, cutoff),
      ),
    })

    if (stale.length > 0) {
      logger.info(
        `Permanently deleting ${stale.length} stale entr${stale.length === 1 ? 'y' : 'ies'} (>${SOFT_DELETE_GRACE_DAYS} days old)`,
      )

      await deleteMediaAssets(stale.flatMap((entry) => entry.media))

      await db
        .delete(journalEntries)
        .where(
          and(
            isNotNull(journalEntries.deletedAt),
            lt(journalEntries.deletedAt, cutoff),
          ),
        )
    }
  } catch (purgeErr) {
    logger.error('Failed to purge stale entries:', purgeErr)
  }
}
