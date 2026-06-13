import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '#/database/schema'
import { journalEntries, entryMedia } from '#/database/schema'
import { and, isNotNull, lt } from 'drizzle-orm'
import fs from 'fs-extra'
import path from 'node:path'

const SOFT_DELETE_GRACE_DAYS = 30

type Database = LibSQLDatabase<typeof schema>

// Handles the edge case where `prepareMediaAsset` wrote files to disk but the
// process crashed before the DB transaction committed. On the next startup, any
// .webp file in the media directory with no corresponding DB record is deleted.
export async function purgeOrphanedMediaFiles(db: Database): Promise<void> {
  try {
    const mediaDir = process.env.MEDIA_STORAGE_PATH
    if (!mediaDir) return

    const dirExists = await fs.pathExists(mediaDir)
    if (!dirExists) return

    const filesOnDisk = await fs.readdir(mediaDir)
    const webpFiles = filesOnDisk.filter((f) => f.endsWith('.webp'))
    if (webpFiles.length === 0) return

    const knownMedia = await db.select().from(entryMedia)
    const knownPaths = new Set<string>()
    for (const m of knownMedia) {
      knownPaths.add(path.basename(m.filePath))
      knownPaths.add(path.basename(m.thumbnailPath))
    }

    const orphaned = webpFiles.filter((f) => !knownPaths.has(f))
    if (orphaned.length === 0) return

    console.log(
      `[media] Purging ${orphaned.length} orphaned file(s) from ${mediaDir}`,
    )
    for (const file of orphaned) {
      await fs.remove(path.join(mediaDir, file)).catch(() => {})
    }
  } catch (err) {
    console.error('[media] Orphaned file cleanup failed (non-fatal):', err)
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
      console.log(
        `[purge] Permanently deleting ${stale.length} stale entr${stale.length === 1 ? 'y' : 'ies'} (>${SOFT_DELETE_GRACE_DAYS} days old)`,
      )

      for (const entry of stale) {
        for (const m of entry.media) {
          await fs.remove(m.filePath).catch(() => {})
          await fs.remove(m.thumbnailPath).catch(() => {})
        }
      }

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
    console.error('[purge] Failed to purge stale entries:', purgeErr)
  }
}
