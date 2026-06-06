# Race Conditions & State Management Analysis Report

**Sanctuary Application**  
_Generated: June 6, 2026_

---

## Executive Summary

This report provides a comprehensive analysis of race conditions, state management issues, performance concerns, and memory leaks in the Sanctuary codebase. The analysis covers hooks, services, mutations, cache management, and integration patterns with TanStack Query.

**Key Findings:**

- **Moderate Risk**: Several race conditions exist in async operations and state synchronization
- **High Risk**: Memory leaks in interval timers and event listeners in some components
- **Medium Risk**: Optimistic updates may cause UI inconsistencies under rapid interactions
- **Overall**: The codebase has good patterns but needs systematic improvements

---

## 1. Race Condition Analysis

### 1.1 Database Operations

#### Issue: Concurrent Database Access

**Location**: `src/database/index.ts`, `src/database/jobs.ts`

```typescript
// Current implementation
let dbInstance: Database | null = null
let initPromise: Promise<Database> | null = null
```

**Risk**: While the singleton pattern prevents multiple instances, background jobs running concurrently with UI operations can cause:

- Lock contention on SQLite WAL mode
- Transaction conflicts during simultaneous writes
- Race conditions in `startBackgroundJobs()` vs UI queries

**Evidence**:

- Background jobs run every 60 minutes (`JOBS_INTERVAL_MS`)
- No rate limiting or queuing mechanism
- `purgeStaleEntries()` and `reactivateHabitsAndSyncStreaks()` run concurrently

#### Issue: Transaction Isolation

**Location**: `src/features/journal/journal.service.ts`

```typescript
export async function createEntryService(data: CreateEntryInput) {
  const db = await getDb()
  const preparedMedia = await Promise.all(
    data.media.map((media) => prepareMediaAsset(media.base64Data)),
  )

  try {
    const createdEntry = await db.transaction(async (tx) => {
      // ... transaction logic
    })
    return createdEntry
  } catch (error) {
    // Rollback media files on failure
    await Promise.allSettled(
      preparedMedia.map((media) =>
        Promise.all([
          fs.remove(media.filePath),
          fs.remove(media.thumbnailPath),
        ]),
      ),
    )
    throw error
  }
}
```

**Risk**:

- Media preparation happens **outside** the transaction
- If transaction fails after media preparation, orphaned files may remain
- No atomicity between media files and database records

### 1.2 Optimistic Updates & Cache Synchronization

#### Issue: Cache Inconsistency During Rapid Updates

**Location**: `src/features/journal/journal.cache.ts`, `src/features/habits/habits.cache.ts`

```typescript
// Current implementation
togglePin(queryClient: QueryClient, id: number) {
  queryClient.setQueryData<Entry[]>(journalKeys.entries, (old) => {
    if (!old) return old
    const updated = old.map((e) =>
      e.id === id ? { ...e, isPinned: !e.isPinned } : e,
    )
    return [...updated].sort(
      (a, b) => Number(b.isPinned) - Number(a.isPinned),
    )
  })
}
```

**Risk**:

- No locking mechanism for rapid successive updates
- If user toggles pin 5 times quickly, last write wins but intermediate states may be lost
- No optimistic update rollback on network failure

#### Issue: Snapshot Rollback Race

**Location**: `src/lib/with-optimistic.ts`

```typescript
export async function withOptimistic<TSnapshot, TResult = void>(
  { snapshot, apply, execute, restore, queryKey },
  queryClient: QueryClient,
): Promise<TResult> {
  if (queryKey) {
    await queryClient.cancelQueries({ queryKey }) // ⚠️ Race condition here
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
```

**Risk**:

- `cancelQueries()` doesn't guarantee no new queries will be fetched
- Between `cancelQueries()` and `snapshot()`, another query could update cache
- Snapshot may not reflect actual state at time of apply

### 1.3 Media Asset Processing

#### Issue: Concurrent Media Preparation

**Location**: `src/features/media/media.service.ts`

```typescript
export async function prepareMediaAsset(
  base64Data: string,
): Promise<PreparedMediaAsset> {
  // ... validation and processing
  const buffer = Buffer.from(match[2], 'base64')
  const fileType = await fileTypeFromBuffer(buffer)
  // ... image processing with sharp
  await fs.writeFile(originalPath, originalBuffer)
  await fs.writeFile(thumbPath, thumbnailBuffer)
  return { filePath, thumbnailPath, mimeType, fileSize }
}
```

**Risk**:

- No concurrency limit on media processing
- Multiple simultaneous uploads can exhaust memory
- No cancellation mechanism for abandoned uploads

---

## 2. State Management Issues

### 2.1 React State Synchronization

#### Issue: Stale Closure in Event Handlers

**Location**: `src/components/layout/PinModal.tsx`, `src/components/layout/LockScreen.tsx`

```typescript
const handleInput = async (val: string) => {
  if (error) setError(false)
  const next = input + val // ⚠️ Stale closure if input is updated rapidly
  if (next.length <= 4) {
    setInput(next)
    // ... more logic
  }
}
```

**Risk**:

- `input` state may be stale when async operations complete
- Multiple rapid inputs can cause PIN validation issues

#### Issue: Ref vs State Mismatch

**Location**: `src/hooks/use-mood.ts`

```typescript
const latRef = useRef(options?.lat)
const lngRef = useRef(options?.lng)

useEffect(() => {
  latRef.current = options?.lat
  lngRef.current = options?.lng
}, [options?.lat, options?.lng])

useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latRef.current = pos.coords.latitude
      lngRef.current = pos.coords.longitude
      setMood(deriveMoodFromSun(pos.coords.latitude, pos.coords.longitude))
    },
    () => {
      setMood(deriveMoodFromTime())
    },
  )
}, [hasPrefLocation])

useEffect(() => {
  const tick = () => {
    if (latRef.current != null && lngRef.current != null) {
      setMood(deriveMoodFromSun(latRef.current, lngRef.current))
    }
  }
  const interval = setInterval(tick, 60 * 1000)
  return () => clearInterval(interval)
}, []) // ⚠️ Missing dependencies
```

**Risk**:

- Interval callback captures stale ref values
- Mood may not update correctly when location changes

### 2.2 Local Storage Synchronization

#### Issue: Storage Event Race

**Location**: `src/hooks/use-local-state.ts`

```typescript
useEventListener('storage', (e: StorageEvent) => {
  if (e.key === key && e.newValue !== null) {
    try {
      const newValue = JSON.parse(e.newValue) as T
      setState(newValue)
    } catch {}
  }
})
```

**Risk**:

- No debouncing for rapid storage events
- Multiple tabs can cause state thrashing
- No conflict resolution for simultaneous updates

#### Issue: Draft Save Race

**Location**: `src/hooks/use-draft.ts`

```typescript
useEffect(() => {
  clearTimers()
  if (hydratedRef.current) {
    hydratedRef.current = false
    return
  }
  // ... debounce logic
  timersRef.current.save = setTimeout(() => {
    saveDraft()
  }, debounceMs)
  return clearTimers
}, [value, debounceMs, saveDraft, clearDraft, clearTimers, setSafeStatus])
```

**Risk**:

- `saveDraft` function is recreated on every render (missing `useCallback`)
- Can cause infinite loops or missed saves
- Multiple timers can accumulate if cleanup fails

---

## 3. Performance Issues

### 3.1 Query Optimization

#### Issue: Unnecessary Re-renders

**Location**: `src/features/journal/journal.service.ts`

```typescript
export async function getAllEntriesService() {
  const db = await getDb()
  const entries = await db.query.journalEntries.findMany({
    with: WITH_MEDIA_COLUMNS,
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.isPinned), desc(journalEntries.createdAt)],
  })
  return entries
}
```

**Risk**:

- No pagination for large datasets
- All entries loaded into memory at once
- No caching layer between DB and UI

#### Issue: Repeated Database Queries

**Location**: `src/features/habits/habits.service.ts`

```typescript
export async function getAllHabitsService() {
  const db = await getDb()
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoffStr = ninetyDaysAgo.toISOString().split('T')[0]

  const [allHabits, completions] = await Promise.all([
    db.select().from(habits),
    db.select().from(habitCompletions).where(gte(...)),
  ])

  await reactivateHabitsAndSyncStreaks(db, allHabits)  // ⚠️ Side effect in query
  return { habits: allHabits, completions }
}
```

**Risk**:

- Side effects in service layer (streak updates)
- No query result caching
- Repeated queries for same data

### 3.2 Media Asset Performance

#### Issue: Large Buffer Processing

**Location**: `src/features/media/media.service.ts`

```typescript
const buffer = Buffer.from(match[2], 'base64')
if (buffer.length > MAX_SIZE_BYTES) {
  throw new Error('Image exceeds 25MB limit')
}
// ... sharp processing
const originalBuffer = await image.webp({ quality: 85 }).toBuffer()
const thumbnailBuffer = await image.clone().resize(...).webp({ quality: 95 }).toBuffer()
```

**Risk**:

- No streaming for large files
- Memory spikes during buffer conversion
- No progress indication for user

---

## 4. Memory Leaks

### 4.1 Timer Leaks

#### Issue: Uninterrupted Intervals

**Location**: `src/hooks/use-mood.ts`

```typescript
useEffect(() => {
  const tick = () => {
    /* ... */
  }
  const interval = setInterval(tick, 60 * 1000)
  return () => clearInterval(interval)
}, []) // ⚠️ Component unmounts but interval may persist
```

**Risk**:

- If component unmounts during geolocation request, interval cleanup may not run
- Multiple components using `useMood()` create multiple intervals

#### Issue: Background Jobs Never Stopped

**Location**: `src/database/jobs.ts`

```typescript
export function startBackgroundJobs() {
  if (jobsInterval) return
  console.log('[jobs] Starting background jobs scheduler...')
  runJobs()
  jobsInterval = setInterval(runJobs, JOBS_INTERVAL_MS)
}

export function stopBackgroundJobs() {
  if (jobsInterval) {
    clearInterval(jobsInterval)
    jobsInterval = null
  }
}
```

**Risk**:

- `stopBackgroundJobs()` is never called on app shutdown
- Background jobs continue running in dev mode
- No cleanup on Electron quit

### 4.2 Event Listener Leaks

#### Issue: Missing Cleanup

**Location**: `src/hooks/use-event-listener.ts`

```typescript
useEffect(() => {
  const eventListener = (event: Event) => {
    savedHandler.current(event as WindowEventMap[TKey])
  }
  element.addEventListener(eventName, eventListener)
  return () => {
    element.removeEventListener(eventName, eventListener)
  }
}, [eventName, element])
```

**Risk**:

- If `element` is null/undefined, cleanup may not run
- No check for duplicate listeners

### 4.3 Audio Context Leaks

#### Issue: Audio Context Not Closed

**Location**: `src/components/dashboard/BreathingSpace.tsx`

```typescript
const audioCtxRef = useRef<AudioContext | null>(null)

useEffect(() => {
  return () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
  }
}, [])
```

**Risk**:

- Audio context may not close if component unmounts during animation
- Multiple instances can accumulate

---

## 5. TanStack Query Integration Analysis

### 5.1 Current Query Configuration

#### Issue: No Query Invalidation Strategy

**Location**: `src/features/journal/journal.options.ts`

```typescript
export const entriesQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.entries,
    queryFn: () =>
      withTimeout(() => getAllEntries(), { name: 'getAllEntries' }),
  })
```

**Risk**:

- No `staleTime` or `gcTime` configuration
- Queries may refetch unnecessarily
- No cache eviction strategy

#### Issue: Timeout Handling

**Location**: `src/lib/with-timeout.ts`

```typescript
export function withTimeout<T>(
  fn: () => Promise<T>,
  { ms = 15_000, name = 'Server request' } = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${name} timed out after ${ms}ms.`))
    }, ms)
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer))
  })
}
```

**Risk**:

- Timeout doesn't cancel underlying fetch
- Network requests continue after timeout
- Resource waste on abandoned requests

### 5.2 Optimistic Update Strategy

#### Issue: No Query Invalidation After Optimistic Update

**Location**: `src/features/journal/journal.mutations.ts`

```typescript
const deleteEntry = useCallback(
  (id: number) => {
    const snapshot = journalCache.snapshot(queryClient)
    const entry = snapshot?.find((e) => e.id === id)

    const promise = deleteEntryApi({ data: { id } }).then(() => {
      journalCache.remove(queryClient, id)
      if (entry) journalCache.moveToTrash(queryClient, entry)
    })
    // ... toast with undo
    return promise
  },
  [queryClient],
)
```

**Risk**:

- No `invalidateQueries()` after successful mutation
- UI may show stale data
- Cache inconsistency with server state

---

## 6. Proposed Solutions

### 6.1 Race Condition Manager Architecture

#### Option A: Global Race Condition Manager

**Pros**:

- Centralized control over concurrent operations
- Single source of truth for operation state
- Easy to add logging and monitoring
- Consistent error handling

**Cons**:

- Global state complexity
- Potential performance bottleneck
- Tight coupling between modules
- Harder to test in isolation

**Implementation**:

```typescript
// src/lib/race-condition-manager.ts
export class RaceConditionManager {
  private activeOperations = new Map<string, AbortController>()

  startOperation(id: string, timeoutMs?: number) {
    const existing = this.activeOperations.get(id)
    if (existing) {
      existing.abort()
      this.activeOperations.delete(id)
    }
    const controller = new AbortController()
    this.activeOperations.set(id, controller)

    if (timeoutMs) {
      setTimeout(() => {
        controller.abort()
        this.activeOperations.delete(id)
      }, timeoutMs)
    }

    return controller.signal
  }

  completeOperation(id: string) {
    const controller = this.activeOperations.get(id)
    if (controller) {
      controller.abort()
      this.activeOperations.delete(id)
    }
  }

  isOperationActive(id: string) {
    return this.activeOperations.has(id)
  }
}
```

#### Option B: Domain-Specific Managers

**Pros**:

- Better separation of concerns
- Easier to optimize per domain
- Less global state
- Better testability

**Cons**:

- Code duplication
- Inconsistent patterns across domains
- More complex architecture

**Implementation**:

```typescript
// src/lib/journal-race-manager.ts
export class JournalRaceManager {
  private activeEntryOperations = new Map<number, AbortController>()

  startEntryOperation(entryId: number, operation: string) {
    // Cancel previous operations on this entry
    const existing = this.activeEntryOperations.get(entryId)
    if (existing) {
      existing.abort()
    }
    const controller = new AbortController()
    this.activeEntryOperations.set(entryId, controller)
    return controller.signal
  }

  completeEntryOperation(entryId: number) {
    this.activeEntryOperations.delete(entryId)
  }
}
```

### 6.2 State Management Improvements

#### Recommendation: Use Zustand with Middleware

**Current**: Mixed state management (Zustand, React useState, refs)

**Proposed**:

```typescript
// src/stores/operation-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface OperationState {
  activeOperations: Set<string>
  isOperationActive: (id: string) => boolean
  startOperation: (id: string) => () => void
  completeOperation: (id: string) => void
}

export const useOperationStore = create<OperationState>()(
  devtools(
    persist(
      (set, get) => ({
        activeOperations: new Set(),
        isOperationActive: (id) => get().activeOperations.has(id),
        startOperation: (id) => {
          set((state) => ({
            activeOperations: new Set(state.activeOperations).add(id),
          }))
          return () => {
            set((state) => {
              const next = new Set(state.activeOperations)
              next.delete(id)
              return { activeOperations: next }
            })
          }
        },
        completeOperation: (id) => {
          set((state) => {
            const next = new Set(state.activeOperations)
            next.delete(id)
            return { activeOperations: next }
          })
        },
      }),
      { name: 'operation-store' },
    ),
  ),
)
```

### 6.3 TanStack Query Integration

#### Recommended Configuration

```typescript
// src/lib/query-config.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      useErrorBoundary: true,
    },
    mutations: {
      useOptimistic: true,
      onError: (error, variables, context) => {
        console.error('Mutation failed:', error)
      },
    },
  },
})
```

#### Query Invalidation Strategy

```typescript
// src/features/journal/journal.cache.ts
export const journalCache = {
  // ... existing methods

  async invalidateAll(queryClient: QueryClient) {
    // Cancel any pending queries
    await queryClient.cancelQueries({ queryKey: journalKeys.entries })
    await queryClient.cancelQueries({ queryKey: journalKeys.trash })

    // Invalidate and force refetch
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: journalKeys.entries,
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: journalKeys.trash,
        refetchType: 'all',
      }),
    ])
  },
}
```

---

## 7. Priority Action Items

### Critical (Immediate)

1. **Fix timer leaks**: Ensure all `setInterval`/`setTimeout` have proper cleanup
2. **Add AbortController**: Cancel pending operations on component unmount
3. **Implement query invalidation**: Add `invalidateQueries()` after mutations
4. **Fix stale closures**: Use functional updates in event handlers

### High (Within 2 weeks)

1. **Add rate limiting**: Limit concurrent media processing
2. **Implement optimistic update rollback**: Ensure cache consistency
3. **Add loading states**: Prevent rapid successive interactions
4. **Configure TanStack Query**: Set appropriate `staleTime` and `gcTime`

### Medium (Within 1 month)

1. **Add query pagination**: Implement infinite scroll for large datasets
2. **Implement caching layer**: Add Redis/Memory cache for repeated queries
3. **Add monitoring**: Track operation duration and failure rates
4. **Code splitting**: Lazy load heavy components

### Low (Ongoing)

1. **Memory profiling**: Regular audits with Chrome DevTools
2. **Performance testing**: Automated benchmarks for critical paths
3. **Documentation**: Add race condition patterns to team wiki
4. **Testing**: Add integration tests for concurrent operations

---

## 8. Testing Recommendations

### Unit Tests

- Test optimistic update rollback scenarios
- Verify cleanup on component unmount
- Test concurrent operation handling

### Integration Tests

- Simulate rapid successive interactions
- Test network failure recovery
- Verify cache consistency

### Manual Testing

- Open multiple tabs and verify sync
- Test with slow network conditions
- Monitor memory usage over time

---

## 9. Conclusion

The Sanctuary codebase demonstrates good practices in many areas but has several race conditions and state management issues that could lead to:

- **Data inconsistency** under rapid user interactions
- **Memory leaks** from timer and event listener accumulation
- **Performance degradation** from unoptimized queries
- **User experience issues** from stale UI states

**Recommended Approach**: Implement a **hybrid solution** with:

1. Domain-specific race managers for critical operations
2. Zustand store for global operation state
3. Proper TanStack Query configuration with invalidation
4. Comprehensive cleanup patterns across all hooks and components

This approach balances centralized control with domain-specific optimization while maintaining testability and separation of concerns.

---

## Appendix: Files Requiring Attention

### High Priority

- `src/hooks/use-mood.ts` - Timer and ref issues
- `src/hooks/use-draft.ts` - Race conditions in debounce
- `src/features/journal/journal.service.ts` - Transaction isolation
- `src/features/media/media.service.ts` - Concurrency control
- `src/database/jobs.ts` - Background job cleanup

### Medium Priority

- `src/lib/with-optimistic.ts` - Snapshot race condition
- `src/features/journal/journal.cache.ts` - Cache invalidation
- `src/features/habits/habits.service.ts` - Side effects in queries
- `src/components/layout/PinModal.tsx` - Stale closures
- `src/components/dashboard/BreathingSpace.tsx` - Audio context cleanup

### Low Priority

- `src/hooks/use-local-state.ts` - Storage event debouncing
- `src/features/preferences/preferences.cache.ts` - Query configuration
- `src/features/prompts/prompts.cache.ts` - Cache management

---

_Report generated by automated analysis. Last updated: June 6, 2026_
