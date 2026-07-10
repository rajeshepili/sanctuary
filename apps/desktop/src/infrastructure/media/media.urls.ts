/** Loopback URL for a stored media asset (served by /api/media, not base64). */
export function getMediaAssetUrl(
  mediaId: number,
  thumbnailOnly = false,
): string {
  const suffix = thumbnailOnly ? '?thumbnail=1' : ''
  return `/api/media/${mediaId}${suffix}`
}
