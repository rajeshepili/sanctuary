import { getDb } from '#/database'
import { entryMedia } from '#/database/schema'
import { eq } from 'drizzle-orm'
import { fileTypeFromBuffer } from 'file-type'
import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import sharp from 'sharp'
import type { EntryMedia } from '#/types'

type SaveMediaInput = {
  entryId: number
  base64Data: string
}

type PreparedMediaAsset = {
  filePath: string
  thumbnailPath: string
  mimeType: 'image/webp'
  fileSize: number
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB
const MAX_THUMB_WIDTH = 400

export async function prepareMediaAsset(
  base64Data: string,
): Promise<PreparedMediaAsset> {
  const mediaDir =
    process.env.MEDIA_STORAGE_PATH ||
    path.join(os.homedir(), '.config', 'sanctuary', 'media')

  await fs.ensureDir(mediaDir)

  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/)

  if (!match) {
    throw new Error('Invalid media format')
  }

  const buffer = Buffer.from(match[2], 'base64')
  const bytes = new Uint8Array(buffer)

  if (bytes.length > MAX_SIZE_BYTES) {
    throw new Error('Image exceeds 25MB limit')
  }

  const fileType = await fileTypeFromBuffer(bytes)

  if (!fileType || !fileType.mime.startsWith('image/')) {
    throw new Error('Only images are allowed as media.')
  }

  const id = crypto.randomUUID()

  const originalPath = path.join(mediaDir, `${id}.webp`)
  const thumbPath = path.join(mediaDir, `${id}_thumb.webp`)

  const image = sharp(bytes, { failOn: 'none' }).rotate().withMetadata()

  const originalBuffer = await image
    .withMetadata()
    .webp({
      quality: 85,
    })
    .toBuffer()

  const thumbnailBuffer = await image
    .clone()
    .resize({
      width: MAX_THUMB_WIDTH,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 95 })
    .toBuffer()

  await fs.writeFile(originalPath, originalBuffer)
  await fs.writeFile(thumbPath, thumbnailBuffer)

  return {
    filePath: originalPath,
    thumbnailPath: thumbPath,
    mimeType: 'image/webp',
    fileSize: originalBuffer.length,
  }
}

export async function saveMediaService(
  input: SaveMediaInput,
): Promise<EntryMedia> {
  const db = await getDb()
  const media = await prepareMediaAsset(input.base64Data)

  try {
    const [savedMedia] = await db
      .insert(entryMedia)
      .values({
        entryId: input.entryId,
        filePath: media.filePath,
        thumbnailPath: media.thumbnailPath,
        mimeType: media.mimeType,
        fileSize: media.fileSize,
      })
      .returning()

    return savedMedia
  } catch (error) {
    await fs.remove(media.filePath)
    await fs.remove(media.thumbnailPath)
    throw error
  }
}

export async function getMediaService(
  mediaId: number,
  thumbnailOnly = false,
): Promise<string | null> {
  const { resolveMediaFile } = await import('./media.files')
  const resolved = await resolveMediaFile(mediaId, thumbnailOnly)
  if (!resolved) return null

  try {
    const buffer = await fs.readFile(resolved.filePath)
    return `data:${resolved.mimeType};base64,${buffer.toString('base64')}`
  } catch (error) {
    console.error('Failed to read media:', error)
    return null
  }
}

export async function deleteMediaService(mediaId: number): Promise<void> {
  try {
    const db = await getDb()
    const media = await db.query.entryMedia.findFirst({
      where: eq(entryMedia.id, mediaId),
    })

    if (!media) return

    await fs.remove(media.filePath)
    await fs.remove(media.thumbnailPath)

    await db.delete(entryMedia).where(eq(entryMedia.id, mediaId))
  } catch (error) {
    console.error('Failed to delete media:', error)
    throw error
  }
}
