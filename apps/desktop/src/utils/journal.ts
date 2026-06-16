import { addDays } from 'date-fns'
import { toLocalDateString } from '#/utils/date'
import type { Entry } from '#/types'
import { CONSISTENCY_WINDOW_DAYS } from '#/config/constants'

export function injectPromptIntoContent(
  currentContent: string,
  prompt: string,
): string {
  return currentContent.trim()
    ? `${currentContent}\n\n## ${prompt}\n\n`
    : `## ${prompt}\n\n`
}

/**
 * Computes journaling consistency (%) over the last 30 days.
 * Skips soft-deleted entries.
 */
export function computeJournalConsistency(entries: Entry[], daysWindow: number = CONSISTENCY_WINDOW_DAYS): number {
  if (entries.length === 0) return 0

  const completionDays = new Set(
    entries
      .filter((e) => !e.deletedAt)
      .map((e) => toLocalDateString(e.createdAt)),
  )

  const today = new Date()
  let completedCount = 0

  for (let i = 0; i < daysWindow; i++) {
    const d = addDays(today, -i)
    if (completionDays.has(toLocalDateString(d))) {
      completedCount++
    }
  }

  return Math.round((completedCount / daysWindow) * 100)
}
