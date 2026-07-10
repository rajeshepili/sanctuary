import { getDb } from '#/database'
import { entryMedia } from '#/database/schema'
import { eq } from 'drizzle-orm'
import fs from 'fs-extra'

export async function resolveMediaFile(
  mediaId: number,
  thumbnailOnly: boolean,
): Promise<{ filePath: string; mimeType: string } | null> {
  const db = await getDb()
  const media = await db.query.entryMedia.findFirst({
    where: eq(entryMedia.id, mediaId),
  })

  if (!media) return null

  const filePath = thumbnailOnly ? media.thumbnailPath : media.filePath

  if (await fs.pathExists(filePath)) {
    return { filePath, mimeType: media.mimeType }
  }

  // Fallback: if the thumbnail is missing, try serving the full-size image instead
  if (thumbnailOnly && (await fs.pathExists(media.filePath))) {
    return { filePath: media.filePath, mimeType: media.mimeType }
  }

  return null
}
