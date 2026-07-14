import { useEffect, useRef } from 'react'

/**
 * Type-safe event listener hook.
 * Uses a ref to ensure the handler is always fresh without re-binding.
 */
export function useEventListener<TKey extends keyof WindowEventMap>(
  eventName: TKey,
  handler: (event: WindowEventMap[TKey]) => void,
  element: Window | HTMLElement | null = typeof window !== 'undefined'
    ? window
    : null,
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const target = element
    if (!target) return

    // We rely on the browser's guarantee that the event type matches the event name.
    // To avoid explicit 'as' casting in the middle of the logic,
    // we use a local listener that accepts the base Event type.
    const eventListener = (event: Event) => {
      // We call the current handler.
      // The implicit conversion from WindowEventMap[TKey] to Event is safe.
      // The reverse requires some trust or narrowing.
      const fn = savedHandler.current as (ev: Event) => void
      fn(event)
    }

    target.addEventListener(eventName, eventListener)

    return () => {
      target.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}
