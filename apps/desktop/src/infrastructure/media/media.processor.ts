import { fileTypeFromBuffer } from 'file-type'
import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import sharp from 'sharp'
import { MediaError } from './media.errors'

export type PreparedMediaAsset = {
  filePath: string
  thumbnailPath: string
  mimeType: string
  fileSize: number
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB
// Cap on the longer side keeps the largest stored asset at ~4MP and
// prevents panorama / screenshot-style images from producing absurdly tall
// files that overflow the journal viewer.
const MAX_ORIGINAL_WIDTH = 2048
const MAX_ORIGINAL_HEIGHT = 2048
const MAX_THUMB_WIDTH = 400
const MAX_THUMB_HEIGHT = 600

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
    throw new MediaError(
      'MEDIA_INVALID_FORMAT',
      'Only images are allowed as media.',
    )
  }

  const id = crypto.randomUUID()
  const originalPath = path.join(mediaDir, `${id}.webp`)
  const thumbPath = path.join(mediaDir, `${id}_thumb.webp`)

  try {
    const pipeline = sharp(bytes, { failOn: 'none' }).rotate()

    const [originalImage, thumbImage] = await Promise.all([
      pipeline
        .clone()
        .resize({
          width: MAX_ORIGINAL_WIDTH,
          height: MAX_ORIGINAL_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer(),
      pipeline
        .clone()
        .resize({
          width: MAX_THUMB_WIDTH,
          height: MAX_THUMB_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer(),
    ])

    await Promise.all([
      fs.writeFile(originalPath, originalImage),
      fs.writeFile(thumbPath, thumbImage),
    ])

    return {
      filePath: originalPath,
      thumbnailPath: thumbPath,
      mimeType: 'image/webp',
      fileSize: originalImage.length,
    }
  } catch (error) {
    throw new MediaError(
      'MEDIA_PREPARATION_FAILED',
      'Failed to process image',
      { cause: error },
    )
  }
}

export async function deleteMediaAssets(
  paths: Array<{ filePath: string; thumbnailPath: string }>,
): Promise<void> {
  const allPaths = paths.flatMap((p) => [p.filePath, p.thumbnailPath])
  await Promise.allSettled(allPaths.map((p) => fs.remove(p)))
}
