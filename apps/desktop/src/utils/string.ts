/**
 * Safely parses a comma-separated string into an array of lowercase, trimmed values.
 * Removes any empty strings from the result.
 */
export function parseCommaList(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
}
