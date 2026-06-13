import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import { prepareMediaAsset } from '../media.service'

/** 1×1 PNG */
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('prepareMediaAsset', () => {
  let mediaDir: string

  beforeEach(async () => {
    mediaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sanctuary-media-'))
    process.env.MEDIA_STORAGE_PATH = mediaDir
  })

  afterEach(async () => {
    delete process.env.MEDIA_STORAGE_PATH
    await fs.remove(mediaDir).catch(() => {})
  })

  it('writes webp original and thumbnail files', async () => {
    const result = await prepareMediaAsset(TINY_PNG)

    expect(result.mimeType).toBe('image/webp')
    expect(result.fileSize).toBeGreaterThan(0)
    expect(path.basename(result.filePath)).toMatch(/\.webp$/)
    expect(path.basename(result.thumbnailPath)).toMatch(/_thumb\.webp$/)
    expect(await fs.pathExists(result.filePath)).toBe(true)
    expect(await fs.pathExists(result.thumbnailPath)).toBe(true)

    const originalSize = (await fs.stat(result.filePath)).size
    const thumbSize = (await fs.stat(result.thumbnailPath)).size
    expect(thumbSize).toBeLessThanOrEqual(originalSize)
  })

  it('rejects invalid base64 payloads', async () => {
    await expect(prepareMediaAsset('not-valid')).rejects.toThrow(
      'Invalid media format',
    )
  })

  it('rejects non-image content', async () => {
    const textPayload = `data:text/plain;base64,${Buffer.from('hello').toString('base64')}`
    await expect(prepareMediaAsset(textPayload)).rejects.toThrow(
      'Only images are allowed',
    )
  })
})
