import { fileTypeFromBuffer } from 'file-type'
import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import sharp from 'sharp'
import { MediaError } from './media.errors'

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
    throw new MediaError('MEDIA_INVALID_FORMAT', 'Invalid media format')
  }

  const buffer = Buffer.from(match[2], 'base64')
  const bytes = new Uint8Array(buffer)

  if (bytes.length > MAX_SIZE_BYTES) {
    throw new MediaError('MEDIA_TOO_LARGE', 'Image exceeds 25MB limit')
  }

  const fileType = await fileTypeFromBuffer(bytes)

  if (!fileType || !fileType.mime.startsWith('image/')) {
    throw new MediaError('MEDIA_INVALID_FORMAT', 'Only images are allowed as media.')
  }

  const id = crypto.randomUUID()

  const originalPath = path.join(mediaDir, `${id}.webp`)
  const thumbPath = path.join(mediaDir, `${id}_thumb.webp`)

  try {
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
  } catch (error) {
    throw new MediaError('MEDIA_PREPARATION_FAILED', 'Failed to process image', { cause: error })
  }
}


