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
  if (!(await fs.pathExists(filePath))) return null

  return { filePath, mimeType: media.mimeType }
}
