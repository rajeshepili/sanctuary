import { createLogger } from '#/lib/logger'

const logger = createLogger('db-metrics')

// Database performance profiling utilities

interface QueryMetrics {
  name: string
  duration: number
  rowCount?: number
  success: boolean
  error?: string
}

const metrics: QueryMetrics[] = []

export function startQueryMetrics() {
  metrics.length = 0
}

export function recordQueryMetric(metric: QueryMetrics) {
  metrics.push(metric)
}

export function getQueryMetrics(): QueryMetrics[] {
  return [...metrics]
}

export function getMetricsSummary() {
  const total = metrics.length
  const avgDuration =
    total > 0 ? metrics.reduce((sum, m) => sum + m.duration, 0) / total : 0
  const slowQueries = metrics.filter((m) => m.duration > 100) // >100ms = slow
  const failed = metrics.filter((m) => !m.success)

  return {
    total,
    avgDuration: Math.round(avgDuration * 100) / 100,
    slowCount: slowQueries.length,
    slowQueries: slowQueries.sort((a, b) => b.duration - a.duration),
    failedCount: failed.length,
    failedQueries: failed,
  }
}

export function logMetricsSummary() {
  const summary = getMetricsSummary()

  if (summary.total === 0) return

  logger.info(
    `Database Summary: ${summary.total} queries, avg ${summary.avgDuration}ms, ${summary.slowCount} slow`,
  )

  if (summary.slowQueries.length > 0) {
    logger.warn('Slow Queries Detected', summary.slowQueries)
  }
  if (summary.failedQueries.length > 0) {
    logger.error('Failed Queries Detected', undefined, summary.failedQueries)
  }
}
