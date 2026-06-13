/**
 * Wraps an async function with a configurable timeout.
 *
 * TanStack Start's `createServerFn` makes HTTP calls to the embedded local
 * Nitro server. Without a timeout, if the server is deadlocked or overwhelmed
 * (e.g. during a long migration), the query hangs indefinitely and the UI
 * freezes with no feedback.
 *
 * Usage:
 *   queryFn: () => withTimeout(() => getAllEntries(), { name: 'getAllEntries' })
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  { ms = 15_000, name = 'Server request' }: { ms?: number; name?: string } = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `${name} timed out after ${ms}ms. The local server may be busy or unresponsive.`,
        ),
      )
    }, ms)

    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer))
  })
}
