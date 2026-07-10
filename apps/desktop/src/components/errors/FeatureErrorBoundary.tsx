import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorSection } from './ErrorSection'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

interface FeatureErrorBoundaryProps {
  children: ReactNode
  title?: string
  message?: string
  compact?: boolean
  className?: string
  onRetry?: () => void
  /**
   * Optional keys that trigger an automatic reset when changed.
   */
  resetKeys?: Array<unknown>
}

/**
 * A specialized ErrorBoundary for features or sections of a page.
 * Integrated with TanStack Query for automatic query resets on retry.
 */
export function FeatureErrorBoundary({
  children,
  title,
  message,
  compact = false,
  className,
  onRetry,
  resetKeys,
}: FeatureErrorBoundaryProps) {
  const { reset: resetQueries } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary
      resetKeys={resetKeys}
      fallback={({ error, reset: resetBoundary }) => (
        <ErrorSection
          title={title}
          message={message}
          error={error}
          compact={compact}
          className={className}
          onRetry={() => {
            // 1. Reset failing TanStack queries in this boundary's scope
            resetQueries()
            // 2. Clear the Error Boundary's internal state
            resetBoundary()
            // 3. Call any custom retry logic (e.g. tracking or specific refetching)
            onRetry?.()
          }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
