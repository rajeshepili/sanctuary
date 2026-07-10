import { useEffect, useCallback, useRef, useState } from 'react'
import { localStore } from '#/lib/storage'

export type DraftStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseDraftProps {
  key: string
  value: string
  onRestore?: (value: string) => void
  debounceMs?: number
  resetDelayMs?: number
}

interface UseDraftReturn {
  hasDraft: boolean
  status: DraftStatus
  error: string | null
  clearDraft: () => void
  retrySave: () => void
}

export function useDraft({
  key,
  value,
  onRestore,
  debounceMs = 300,
  resetDelayMs = 1500,
}: UseDraftProps): UseDraftReturn {
  const storageKey = `draft_${key}`

  const [hasDraft, setHasDraft] = useState(() => {
    return !!getDraft(key)
  })

  const [status, setStatus] = useState<DraftStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const timersRef = useRef<{
    save?: ReturnType<typeof setTimeout>
    reset?: ReturnType<typeof setTimeout>
  }>({})

  const hydratedRef = useRef(false)
  const lastSavedValueRef = useRef<string | null>(null)
  const onRestoreRef = useRef(onRestore)

  // Update ref when onRestore changes
  useEffect(() => {
    onRestoreRef.current = onRestore
  }, [onRestore])

  const setSafeStatus = useCallback((next: DraftStatus) => {
    setStatus((prev) => (prev === next ? prev : next))
  }, [])

  const clearTimers = useCallback(() => {
    if (timersRef.current.save) {
      clearTimeout(timersRef.current.save)
      timersRef.current.save = undefined
    }

    if (timersRef.current.reset) {
      clearTimeout(timersRef.current.reset)
      timersRef.current.reset = undefined
    }
  }, [])

  const setIdleLater = useCallback(() => {
    if (timersRef.current.reset) {
      clearTimeout(timersRef.current.reset)
    }

    timersRef.current.reset = setTimeout(() => {
      setSafeStatus('idle')
    }, resetDelayMs)
  }, [resetDelayMs, setSafeStatus])

  const setDraftError = useCallback(
    (message: string) => {
      setSafeStatus('error')
      setError(message)
    },
    [setSafeStatus],
  )

  const saveDraft = useCallback(() => {
    const trimmed = value.trim()

    if (!trimmed) return

    if (lastSavedValueRef.current === value) {
      setSafeStatus('saved')
      return
    }

    const success = localStore.set(storageKey, value)

    if (!success) {
      setDraftError('Failed to save draft')
      return
    }

    lastSavedValueRef.current = value

    setHasDraft(true)
    setSafeStatus('saved')
    setError(null)

    setIdleLater()
  }, [value, storageKey, setIdleLater, setDraftError, setSafeStatus])

  const clearDraft = useCallback(() => {
    clearTimers()

    localStore.remove(storageKey)

    lastSavedValueRef.current = null

    setHasDraft(false)
    setSafeStatus('idle')
    setError(null)
  }, [clearTimers, storageKey, setSafeStatus])

  useEffect(() => {
    const stored = localStore.get(storageKey)

    if (!stored) return

    hydratedRef.current = true
    lastSavedValueRef.current = stored

    setHasDraft(true)
    setSafeStatus('saved')

    onRestoreRef.current?.(stored)

    setIdleLater()
  }, [storageKey, setIdleLater, setSafeStatus])

  useEffect(() => {
    clearTimers()

    if (hydratedRef.current) {
      hydratedRef.current = false
      return
    }

    const trimmed = value.trim()

    if (!trimmed) {
      clearDraft()
      return
    }

    setSafeStatus('saving')
    setError(null)

    timersRef.current.save = setTimeout(() => {
      saveDraft()
    }, debounceMs)

    return clearTimers
  }, [value, debounceMs, saveDraft, clearDraft, clearTimers, setSafeStatus])

  useEffect(() => {
    return clearTimers
  }, [clearTimers])

  return {
    hasDraft,
    status,
    error,
    clearDraft,
    retrySave: saveDraft,
  }
}

export function getDraft(key: string): string | null {
  return localStore.get(`draft_${key}`)
}

export function removeDraft(key: string): void {
  localStore.remove(`draft_${key}`)
}
