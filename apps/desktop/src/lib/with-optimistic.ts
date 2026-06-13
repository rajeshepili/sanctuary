import type { QueryClient } from '@tanstack/react-query'

/**
 * Generic helper for optimistic mutations.
 *
 * Usage:
 *   await withOptimistic(queryClient, {
 *     snapshot: () => cache.snapshot(queryClient),
 *     apply:    () => cache.patch(queryClient, data),
 *     restore:  (snap) => cache.restore(queryClient, snap),
 *     execute:  () => api({ data }),
 *   })
 *
 * Applies the optimistic update immediately, executes the async work,
 * and restores the snapshot on failure — without repeating this pattern
 * in every mutation hook.
 */
export async function withOptimistic<TSnapshot, TResult = void>(
  {
    apply,
    execute,
    restore,
    snapshot,
    queryKey,
  }: {
    snapshot: (queryClient: QueryClient) => TSnapshot
    apply: (queryClient: QueryClient) => void
    execute: () => Promise<TResult>
    restore: (queryClient: QueryClient, snap: TSnapshot) => void
    queryKey?: unknown[]
  },
  queryClient: QueryClient,
): Promise<TResult> {
  if (queryKey) {
    await queryClient.cancelQueries({ queryKey })
  }
  const snap = snapshot(queryClient)
  apply(queryClient)

  try {
    return await execute()
  } catch (err) {
    restore(queryClient, snap)
    throw err
  }
}
