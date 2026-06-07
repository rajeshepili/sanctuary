export const mediaKeys = {
  all: ['media'] as const,
  detail: (mediaId: number, thumbnailOnly = false) =>
    ['media', mediaId, thumbnailOnly] as const,
}
