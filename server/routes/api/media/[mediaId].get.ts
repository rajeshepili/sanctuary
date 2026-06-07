import { HTTPError, defineHandler, getQuery, getRouterParam } from 'nitro/h3'
import { createReadStream } from 'node:fs'
import { resolveMediaFile } from '#/features/media/media.files'

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

  const stream = createReadStream(resolved.filePath)

  return new Response(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': resolved.mimeType,
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  })
})
