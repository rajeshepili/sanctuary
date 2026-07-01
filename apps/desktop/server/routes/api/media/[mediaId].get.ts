import { HTTPError, defineHandler, getQuery, getRouterParam } from 'nitro/h3'
import { openAsBlob } from 'node:fs'
import { resolveMediaFile } from '#/infrastructure/media/media.files'

export default defineHandler(async (event) => {
  const mediaId = Number(getRouterParam(event, 'mediaId'))
  if (!Number.isFinite(mediaId) || mediaId <= 0) {
    throw new HTTPError({ statusCode: 400, message: 'Invalid media id' })
  }

  const query = getQuery(event)
  const thumbnailParam = String(query.thumbnail ?? '')
  const thumbnailOnly = thumbnailParam === '1' || thumbnailParam === 'true'

  const resolved = await resolveMediaFile(mediaId, thumbnailOnly)
  if (!resolved) {
    throw new HTTPError({ statusCode: 404, message: 'Media not found' })
  }

  const blob = await openAsBlob(resolved.filePath, { type: resolved.mimeType })

  return new Response(blob, {
    headers: {
      'Content-Type': resolved.mimeType,
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  })
})
