export function getFirstOrThrow<T>(results: T[], error: Error): T {
  if (!results || results.length === 0 || !results[0]) {
    throw error
  }
  return results[0]
}

export function ensureRowsAffected<T>(results: T[], error: Error): void {
  if (!results || results.length === 0) {
    throw error
  }
}
