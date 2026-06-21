import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('rejects images exceeding 25MB', async () => {
    // Temporarily mock Buffer.from to return a huge buffer to trigger the check
    const mockFrom = vi
      .spyOn(Buffer, 'from')
      .mockImplementationOnce(((..._args: any[]) => {
        return { length: 26214401 } as unknown as Buffer<ArrayBuffer>
      }) as any)

    await expect(prepareMediaAsset(TINY_PNG)).rejects.toThrow(
      'Image exceeds 25MB limit',
    )

    mockFrom.mockRestore()
  })
  it('throws MEDIA_PREPARATION_FAILED if processing fails', async () => {
    const writeSpy = vi
      .spyOn(fs, 'writeFile')
      .mockRejectedValueOnce(new Error('Disk full'))
    await expect(prepareMediaAsset(TINY_PNG)).rejects.toThrow(
      'Failed to process image',
    )
    writeSpy.mockRestore()
  })
})

describe('deleteMediaAssets', () => {
  let mediaDir: string

  beforeEach(async () => {
    mediaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sanctuary-media-del-'))
    process.env.MEDIA_STORAGE_PATH = mediaDir
  })

  afterEach(async () => {
    delete process.env.MEDIA_STORAGE_PATH
    await fs.remove(mediaDir).catch(() => {})
  })

  it('deletes provided media assets without throwing', async () => {
    // Import deleteMediaAssets inline since it might not be imported at the top
    const { deleteMediaAssets } = await import('../media.service')

    const file1 = path.join(mediaDir, '1.webp')
    const thumb1 = path.join(mediaDir, '1_thumb.webp')

    await fs.writeFile(file1, 'data')
    await fs.writeFile(thumb1, 'data')

    await deleteMediaAssets([{ filePath: file1, thumbnailPath: thumb1 }])

    expect(await fs.pathExists(file1)).toBe(false)
    expect(await fs.pathExists(thumb1)).toBe(false)
  })

  it('ignores paths that do not exist', async () => {
    const { deleteMediaAssets } = await import('../media.service')
    const missing = path.join(mediaDir, 'missing.webp')

    // Should resolve without throwing
    await expect(
      deleteMediaAssets([{ filePath: missing, thumbnailPath: missing }]),
    ).resolves.toBeUndefined()
  })
})
