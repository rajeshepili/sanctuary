import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDraft, getDraft, removeDraft } from '#/hooks/use-draft'

describe('useDraft Hook', () => {
  const draftKey = 'test_draft'

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })

    vi.useRealTimers()
    vi.restoreAllMocks()

    localStorage.clear()
  })

  const flushDraftSave = () => {
    act(() => {
      vi.advanceTimersByTime(1)
    })
  }

  it('should initialize with no draft if none exists', () => {
    const mockRestore = vi.fn()

    const { result } = renderHook(() =>
      useDraft({
        key: draftKey,
        value: '',
        onRestore: mockRestore,
        debounceMs: 1,
      }),
    )

    expect(result.current.hasDraft).toBe(false)
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
    expect(mockRestore).not.toHaveBeenCalled()
  })

  it('should restore draft from localStorage on mount', () => {
    const draftContent = 'Existing draft content'

    localStorage.setItem(`draft_${draftKey}`, draftContent)

    const mockRestore = vi.fn()

    const { result } = renderHook(() =>
      useDraft({
        key: draftKey,
        value: '',
        onRestore: mockRestore,
        debounceMs: 1,
      }),
    )

    expect(mockRestore).toHaveBeenCalledWith(draftContent)
    expect(result.current.hasDraft).toBe(true)
    expect(result.current.status).toBe('saved')
  })

  it('should save draft to localStorage when value changes', () => {
    const { rerender, result } = renderHook(
      ({ value }) =>
        useDraft({
          key: draftKey,
          value,
          debounceMs: 1,
        }),
      {
        initialProps: { value: '' },
      },
    )

    act(() => {
      rerender({ value: 'New draft content' })
    })

    expect(result.current.status).toBe('saving')

    flushDraftSave()

    expect(localStorage.getItem(`draft_${draftKey}`)).toBe('New draft content')

    expect(result.current.status).toBe('saved')
  })

  it('should not save empty draft to localStorage', () => {
    const { rerender } = renderHook(
      ({ value }) =>
        useDraft({
          key: draftKey,
          value,
          debounceMs: 1,
        }),
      {
        initialProps: { value: 'initial' },
      },
    )

    act(() => {
      rerender({ value: '' })
      vi.runOnlyPendingTimers()
    })

    expect(localStorage.getItem(`draft_${draftKey}`)).toBeNull()
  })

  it('should remove draft when value is cleared', () => {
    const { rerender } = renderHook(
      ({ value }) =>
        useDraft({
          key: draftKey,
          value,
          debounceMs: 1,
        }),
      {
        initialProps: { value: 'draft content' },
      },
    )

    flushDraftSave()

    expect(localStorage.getItem(`draft_${draftKey}`)).toBe('draft content')

    act(() => {
      rerender({ value: '   ' })
      vi.runOnlyPendingTimers()
    })

    expect(localStorage.getItem(`draft_${draftKey}`)).toBeNull()
  })

  it('should clear draft via clearDraft function', () => {
    localStorage.setItem(`draft_${draftKey}`, 'draft content')

    const { result } = renderHook(() =>
      useDraft({
        key: draftKey,
        value: 'draft content',
        debounceMs: 1,
      }),
    )

    flushDraftSave()

    expect(localStorage.getItem(`draft_${draftKey}`)).toBe('draft content')

    act(() => {
      result.current.clearDraft()
    })

    expect(localStorage.getItem(`draft_${draftKey}`)).toBeNull()
    expect(result.current.hasDraft).toBe(false)
    expect(result.current.status).toBe('idle')
  })

  it('should use different keys for different drafts', () => {
    const key1 = 'draft_1'
    const key2 = 'draft_2'

    const content1 = 'Content 1'
    const content2 = 'Content 2'

    renderHook(() =>
      useDraft({
        key: key1,
        value: content1,
        debounceMs: 1,
      }),
    )

    renderHook(() =>
      useDraft({
        key: key2,
        value: content2,
        debounceMs: 1,
      }),
    )

    flushDraftSave()

    expect(localStorage.getItem(`draft_${key1}`)).toBe(content1)

    expect(localStorage.getItem(`draft_${key2}`)).toBe(content2)
  })

  it('should recognize draft exists after restore', () => {
    const draftContent = 'Existing draft'

    localStorage.setItem(`draft_${draftKey}`, draftContent)

    const { result } = renderHook(() =>
      useDraft({
        key: draftKey,
        value: '',
        onRestore: () => {},
        debounceMs: 1,
      }),
    )

    expect(result.current.hasDraft).toBe(true)
    expect(result.current.status).toBe('saved')
  })

  it('should surface an error status when localStorage write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const { result } = renderHook(() =>
      useDraft({
        key: draftKey,
        value: 'draft content',
        debounceMs: 1,
      }),
    )

    flushDraftSave()

    expect(result.current.status).toBe('error')

    // updated hook now returns generic messages from safely()
    expect(result.current.error).toBe('Failed to save draft')
  })

  it('should retry saving when retrySave is called after an initial failure', () => {
    let attemptCount = 0

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key: string, value: string) {
        attemptCount += 1

        if (attemptCount === 1) {
          throw new Error('quota exceeded')
        }

        return Storage.prototype.setItem.call(this, key, value)
      })

    const { result } = renderHook(() =>
      useDraft({
        key: draftKey,
        value: 'retry draft content',
        debounceMs: 1,
      }),
    )

    flushDraftSave()

    expect(result.current.status).toBe('error')

    // updated hook now returns generic messages from safely()
    expect(result.current.error).toBe('Failed to save draft')

    expect(attemptCount).toBe(1)

    setItemSpy.mockRestore()

    act(() => {
      result.current.retrySave()
    })

    expect(result.current.status).toBe('saved')

    expect(localStorage.getItem(`draft_${draftKey}`)).toBe(
      'retry draft content',
    )
  })

  it('should avoid duplicate saves for unchanged values', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    const { rerender } = renderHook(
      ({ value }) =>
        useDraft({
          key: draftKey,
          value,
          debounceMs: 1,
        }),
      {
        initialProps: { value: 'same value' },
      },
    )

    flushDraftSave()

    expect(setItemSpy).toHaveBeenCalledTimes(1)

    act(() => {
      rerender({ value: 'same value' })
    })

    flushDraftSave()

    // should not save again
    expect(setItemSpy).toHaveBeenCalledTimes(1)
  })

  it('should not re-hydrate when onRestore changes', () => {
    const draftContent = 'Existing draft content'
    localStorage.setItem(`draft_${draftKey}`, draftContent)

    const mockRestore1 = vi.fn()
    const { rerender } = renderHook(
      ({ onRestore }) =>
        useDraft({
          key: draftKey,
          value: 'current content',
          onRestore,
          debounceMs: 1,
        }),
      {
        initialProps: { onRestore: mockRestore1 },
      },
    )

    expect(mockRestore1).toHaveBeenCalledTimes(1)
    expect(mockRestore1).toHaveBeenCalledWith(draftContent)

    const mockRestore2 = vi.fn()
    act(() => {
      rerender({ onRestore: mockRestore2 })
    })

    // Should NOT call mockRestore2 because we already hydrated
    expect(mockRestore2).not.toHaveBeenCalled()
  })
})

describe('getDraft function', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should retrieve draft from localStorage', () => {
    const content = 'Test draft'

    localStorage.setItem('draft_test', content)

    const retrieved = getDraft('test')

    expect(retrieved).toBe(content)
  })

  it('should return null if draft does not exist', () => {
    const retrieved = getDraft('nonexistent')

    expect(retrieved).toBeNull()
  })

  it('should return null when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage error')
    })

    expect(getDraft('test')).toBeNull()
  })
})

describe('removeDraft function', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should remove draft from localStorage', () => {
    const key = 'test'

    localStorage.setItem(`draft_${key}`, 'content')

    expect(localStorage.getItem(`draft_${key}`)).toBe('content')

    removeDraft(key)

    expect(localStorage.getItem(`draft_${key}`)).toBeNull()
  })

  it('should not error when removing nonexistent draft', () => {
    expect(() => removeDraft('nonexistent')).not.toThrow()
  })

  it('should silently fail when localStorage remove throws', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('remove failed')
    })

    expect(() => removeDraft('test')).not.toThrow()
  })
})
