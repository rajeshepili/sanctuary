# Implementation Guide: Race Condition Management

**Target**: Sanctuary Application  
**Status**: Draft for Review  
**Last Updated**: June 6, 2026

---

## Overview

This guide provides step-by-step implementation instructions for addressing the race conditions identified in the analysis report. Each section includes before/after code examples and migration strategies.

---

## Part 1: Global Race Condition Manager

### 1.1 Create the Manager

**File**: `src/lib/race-condition-manager.ts`

```typescript
import { useCallback, useRef } from 'react'

/**
 * Manages concurrent operations to prevent race conditions
 * by automatically cancelling previous operations when new ones start.
 */
export class RaceConditionManager {
  private activeOperations = new Map<string, AbortController>()
  private operationTimeouts = new Map<string, NodeJS.Timeout>()

  /**
   * Start a new operation, automatically cancelling any existing operation with the same ID
   */
  startOperation(id: string, timeoutMs?: number): AbortSignal {
    // Cancel any existing operation
    const existing = this.activeOperations.get(id)
    if (existing) {
      existing.abort('Operation cancelled by new request')
      this.activeOperations.delete(id)
    }

    // Cancel any existing timeout
    const existingTimeout = this.operationTimeouts.get(id)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.operationTimeouts.delete(id)
    }

    // Create new abort controller
    const controller = new AbortController()
    this.activeOperations.set(id, controller)

    // Set up timeout if provided
    if (timeoutMs) {
      const timeout = setTimeout(() => {
        controller.abort('Operation timed out')
        this.operationTimeouts.delete(id)
        this.activeOperations.delete(id)
      }, timeoutMs)
      this.operationTimeouts.set(id, timeout)
    }

    return controller.signal
  }

  /**
   * Complete an operation successfully (cancels it and removes from tracking)
   */
  completeOperation(id: string): void {
    const controller = this.activeOperations.get(id)
    if (controller) {
      controller.abort('Operation completed')
      this.activeOperations.delete(id)
    }

    const timeout = this.operationTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.operationTimeouts.delete(id)
    }
  }

  /**
   * Check if an operation is currently active
   */
  isOperationActive(id: string): boolean {
    return this.activeOperations.has(id)
  }

  /**
   * Cancel all active operations (useful for cleanup)
   */
  cancelAll(): void {
    for (const [id, controller] of this.activeOperations.entries()) {
      controller.abort('All operations cancelled')
    }
    this.activeOperations.clear()

    for (const [id, timeout] of this.operationTimeouts.entries()) {
      clearTimeout(timeout)
    }
    this.operationTimeouts.clear()
  }

  /**
   * Get count of active operations
   */
  getActiveCount(): number {
    return this.activeOperations.size
  }
}

// Global instance
export const raceConditionManager = new RaceConditionManager()
```

### 1.2 Usage in Hooks

**Before** (with race condition):

```typescript
// src/hooks/use-draft.ts
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

**After** (with race condition manager):

```typescript
// src/hooks/use-draft.ts
import { raceConditionManager } from '#/lib/race-condition-manager'

useEffect(() => {
  clearTimers()
  if (hydratedRef.current) {
    hydratedRef.current = false
    return
  }

  // Cancel any pending save operation
  raceConditionManager.completeOperation(`draft_${key}`)

  const trimmed = value.trim()
  if (!trimmed) {
    clearDraft()
    return
  }

  setSafeStatus('saving')
  setError(null)

  // Start new operation with 5 second timeout
  const signal = raceConditionManager.startOperation(`draft_${key}`, 5000)

  timersRef.current.save = setTimeout(() => {
    if (signal.aborted) return

    saveDraft()
    raceConditionManager.completeOperation(`draft_${key}`)
  }, debounceMs)

  return () => {
    clearTimers()
    raceConditionManager.completeOperation(`draft_${key}`)
  }
}, [value, debounceMs, saveDraft, clearDraft, clearTimers, setSafeStatus, key])
```

---

## Part 2: Domain-Specific Race Managers

### 2.1 Journal Race Manager

**File**: `src/lib/journal-race-manager.ts`

```typescript
import { raceConditionManager } from './race-condition-manager'

/**
 * Manages race conditions specific to journal operations
 * Each entry ID gets its own operation slot
 */
export class JournalRaceManager {
  private static instance: JournalRaceManager
  private manager = raceConditionManager

  static getInstance(): JournalRaceManager {
    if (!JournalRaceManager.instance) {
      JournalRaceManager.instance = new JournalRaceManager()
    }
    return JournalRaceManager.instance
  }

  /**
   * Start an operation on a specific entry
   * Automatically cancels any previous operation on that entry
   */
  startEntryOperation(entryId: number, operation: string): AbortSignal {
    const id = `entry_${entryId}_${operation}`
    return this.manager.startOperation(id, 10000) // 10 second timeout
  }

  /**
   * Complete an operation on a specific entry
   */
  completeEntryOperation(entryId: number, operation: string): void {
    const id = `entry_${entryId}_${operation}`
    this.manager.completeOperation(id)
  }

  /**
   * Check if any operation is active on an entry
   */
  isEntryOperationActive(entryId: number): boolean {
    const prefix = `entry_${entryId}_`
    for (const [key] of this.manager.activeOperations.entries()) {
      if (key.startsWith(prefix)) return true
    }
    return false
  }

  /**
   * Cancel all operations on a specific entry
   */
  cancelAllForEntry(entryId: number): void {
    const prefix = `entry_${entryId}_`
    for (const [key] of this.manager.activeOperations.entries()) {
      if (key.startsWith(prefix)) {
        this.manager.completeOperation(key)
      }
    }
  }

  /**
   * Get all active entry operations
   */
  getActiveEntryOperations(): Map<string, AbortController> {
    const result = new Map<string, AbortController>()
    for (const [key, controller] of this.manager.activeOperations.entries()) {
      if (key.startsWith('entry_')) {
        result.set(key, controller)
      }
    }
    return result
  }
}

export const journalRaceManager = JournalRaceManager.getInstance()
```

### 2.2 Usage in Journal Mutations

**File**: `src/features/journal/journal.mutations.ts`

```typescript
import { journalRaceManager } from '#/lib/journal-race-manager'

export function useJournalMutations() {
  const queryClient = useQueryClient()

  const createEntry = useCallback(
    (value: string, pendingMedia: PendingMedia[]) =>
      toastAsync(
        async () => {
          // Cancel any pending operations
          journalRaceManager.cancelAllForEntry(0) // 0 for new entries

          const signal = journalRaceManager.startEntryOperation(0, 'create')

          try {
            const entry = await createEntryApi({
              data: {
                content: value.trim(),
                media: pendingMedia.map((m) => ({
                  base64Data: m.base64,
                })),
              },
            }).then((result) => {
              // Check if operation was cancelled
              if (signal.aborted) throw new Error('Operation cancelled')
              return result
            })

            journalCache.insert(queryClient, entry)
            journalRaceManager.completeEntryOperation(0, 'create')
            return entry
          } catch (error) {
            journalRaceManager.completeEntryOperation(0, 'create')
            throw error
          }
        },
        {
          loading: 'Recording thought…',
          success: 'Saved to sanctuary.',
          error: 'Failed to save.',
        },
      ),
    [queryClient],
  )

  const updateEntry = useCallback(
    (
      id: number,
      content: string,
      addedMedia: PendingMedia[] = [],
      removedMediaIds: number[] = [],
    ) => {
      // Cancel any pending operations on this entry
      journalRaceManager.cancelAllForEntry(id)

      const signal = journalRaceManager.startEntryOperation(id, 'update')

      return toastAsync(
        () =>
          withOptimistic(
            {
              snapshot: (qc) => journalCache.snapshot(qc),
              apply: (qc) =>
                journalCache.update(qc, id, {
                  content: content.trim(),
                  updatedAt: new Date(),
                }),
              execute: async () => {
                // Check if operation was cancelled before executing
                if (signal.aborted) throw new Error('Operation cancelled')

                const updated = await updateEntryApi({
                  data: {
                    id,
                    content: content.trim(),
                    addedMedia: addedMedia.map((m) => ({
                      base64Data: m.base64,
                    })),
                    removedMediaIds,
                  },
                }).then((result) => {
                  if (signal.aborted) throw new Error('Operation cancelled')
                  return result
                })

                journalCache.update(queryClient, id, updated)
                return updated
              },
              restore: (qc, snap) => journalCache.restore(qc, snap),
            },
            queryClient,
          ),
        {
          loading: 'Updating…',
          success: 'Entry updated.',
          error: 'Update failed.',
        },
      )
    },
    [queryClient],
  )

  // ... rest of mutations with similar pattern
}
```

---

## Part 3: Timer Cleanup Improvements

### 3.1 Improved useMood Hook

**File**: `src/hooks/use-mood.ts`

```typescript
import type { ThemeMood } from '#/types'
import SunCalc from 'suncalc'
import { useEffect, useRef, useState } from 'react'
import { raceConditionManager } from '#/lib/race-condition-manager'

function deriveMoodFromTime(): ThemeMood {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 19) return 'day'
  if (h >= 19 && h < 22) return 'evening'
  return 'night'
}

function deriveMoodFromSun(lat: number, lng: number): ThemeMood {
  const now = new Date()
  const times = SunCalc.getTimes(now, lat, lng)

  const ms = now.getTime()
  const dawn = times.dawn.getTime()
  const sunrise = times.sunrise.getTime()
  const noon = times.solarNoon.getTime()
  const sunset = times.sunset.getTime()
  const dusk = times.dusk.getTime()

  const isPolarDay =
    isNaN(times.sunrise.getTime()) && isNaN(times.sunset.getTime())

  if (isPolarDay) {
    return deriveMoodFromTime()
  }

  if (ms < dawn) return 'night'
  if (ms < sunrise) return 'morning'
  if (ms < noon) return 'day'
  if (ms < sunset) return 'day'
  if (ms < dusk) return 'evening'
  return 'night'
}

export interface UseMoodOptions {
  lat?: number | null
  lng?: number | null
}

export function useMood(options?: UseMoodOptions): ThemeMood {
  const hasPrefLocation = options?.lat != null && options.lng != null

  const getInitialMood = (): ThemeMood => {
    if (hasPrefLocation) {
      return deriveMoodFromSun(options.lat!, options.lng!)
    }
    return deriveMoodFromTime()
  }

  const [mood, setMood] = useState<ThemeMood>(getInitialMood)
  const latRef = useRef(options?.lat)
  const lngRef = useRef(options?.lng)
  const moodRef = useRef(mood) // Ref to current mood for interval callback

  // Update ref when mood changes
  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  // Update location refs
  useEffect(() => {
    latRef.current = options?.lat
    lngRef.current = options?.lng
  }, [options?.lat, options?.lng])

  // Geolocation effect
  useEffect(() => {
    if (hasPrefLocation) return

    // Cancel any pending geolocation
    raceConditionManager.completeOperation('geolocation')

    const signal = raceConditionManager.startOperation('geolocation', 10000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Check if operation was cancelled
        if (signal.aborted) return

        latRef.current = pos.coords.latitude
        lngRef.current = pos.coords.longitude
        setMood(deriveMoodFromSun(pos.coords.latitude, pos.coords.longitude))
      },
      () => {
        setMood(deriveMoodFromTime())
      },
    )

    return () => {
      raceConditionManager.completeOperation('geolocation')
    }
  }, [hasPrefLocation])

  // Interval effect
  useEffect(() => {
    // Cancel any existing interval operation
    raceConditionManager.completeOperation('mood-timer')

    const signal = raceConditionManager.startOperation('mood-timer')

    const tick = () => {
      // Check if operation was cancelled
      if (signal.aborted) return

      if (latRef.current != null && lngRef.current != null) {
        setMood(deriveMoodFromSun(latRef.current, lngRef.current))
      } else {
        setMood(deriveMoodFromTime())
      }
    }

    // Run immediately
    tick()

    const interval = setInterval(tick, 60 * 1000)

    return () => {
      clearInterval(interval)
      raceConditionManager.completeOperation('mood-timer')
    }
  }, [hasPrefLocation])

  return mood
}
```

### 3.2 Improved Background Jobs Cleanup

**File**: `src/database/jobs.ts`

```typescript
import { getDb } from './index'
import { purgeStaleEntries, purgeOrphanedMediaFiles } from './purge'
import { reactivateHabitsAndSyncStreaks } from '#/features/habits/habits.service'
import { exportAllData } from '#/features/journal/journal.export'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import { raceConditionManager } from '#/lib/race-condition-manager'

let jobsInterval: NodeJS.Timeout | null = null
let isRunningJobs = false

const JOBS_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function startBackgroundJobs() {
  if (jobsInterval) return

  console.log('[jobs] Starting background jobs scheduler...')

  // Cancel any pending jobs
  raceConditionManager.completeOperation('background-jobs')

  runJobs()

  jobsInterval = setInterval(() => {
    // Cancel any running jobs before starting new ones
    raceConditionManager.cancelAll()
    runJobs()
  }, JOBS_INTERVAL_MS)
}

export function stopBackgroundJobs() {
  if (jobsInterval) {
    clearInterval(jobsInterval)
    jobsInterval = null
  }

  // Cancel all active operations
  raceConditionManager.cancelAll()
  isRunningJobs = false
}

async function runJobs() {
  // Prevent concurrent runs
  if (isRunningJobs) {
    console.log('[jobs] Previous job run still in progress, skipping')
    return
  }

  isRunningJobs = true

  // Start operation with 5 minute timeout
  const signal = raceConditionManager.startOperation(
    'background-jobs',
    5 * 60 * 1000,
  )

  console.log('[jobs] Running background jobs tick...')
  try {
    const db = await getDb()

    // Check if cancelled before each operation
    if (signal.aborted) {
      console.log('[jobs] Background jobs cancelled')
      isRunningJobs = false
      return
    }

    await purgeStaleEntries(db)

    if (signal.aborted) {
      console.log('[jobs] Background jobs cancelled')
      isRunningJobs = false
      return
    }

    await purgeOrphanedMediaFiles(db)

    if (signal.aborted) {
      console.log('[jobs] Background jobs cancelled')
      isRunningJobs = false
      return
    }

    await reactivateHabitsAndSyncStreaks(db)

    if (signal.aborted) {
      console.log('[jobs] Background jobs cancelled')
      isRunningJobs = false
      return
    }

    await runDailyBackup(signal)

    isRunningJobs = false
    raceConditionManager.completeOperation('background-jobs')
  } catch (error) {
    isRunningJobs = false
    raceConditionManager.completeOperation('background-jobs')
    console.error('[jobs] Error running background jobs:', error)
  }
}

async function runDailyBackup(signal: AbortSignal) {
  const today = new Date().toISOString().split('T')[0]
  if (lastBackupDate === today) {
    return
  }

  try {
    const result = await exportAllData()
    const backupDir = path.join(os.homedir(), 'Documents', 'Sanctuary_Backups')
    await fs.ensureDir(backupDir)

    const filename = `sanctuary-backup-${today}.json`
    const filepath = path.join(backupDir, filename)

    await fs.writeJson(filepath, result, { spaces: 2 })
    console.log(`[jobs] Automated backup saved to ${filepath}`)

    lastBackupDate = today
  } catch (error) {
    console.error('[jobs] Automated backup failed:', error)
  }
}

// Add cleanup on Electron quit (if applicable)
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', () => {
    stopBackgroundJobs()
  })

  process.on('SIGINT', () => {
    stopBackgroundJobs()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    stopBackgroundJobs()
    process.exit(0)
  })
}
```

---

## Part 4: Optimistic Update Improvements

### 4.1 Enhanced withOptimistic

**File**: `src/lib/with-optimistic.ts`

```typescript
import type { QueryClient } from '@tanstack/react-query'
import { raceConditionManager } from './race-condition-manager'

/**
 * Generic helper for optimistic mutations with race condition protection.
 *
 * Usage:
 *   await withOptimistic(queryClient, {
 *     snapshot: () => cache.snapshot(queryClient),
 *     apply:    () => cache.patch(queryClient, data),
 *     restore:  (snap) => cache.restore(queryClient, snap),
 *     execute:  () => api({ data }),
 *     operationId: 'unique-id', // Optional: for race condition management
 *   })
 */
export async function withOptimistic<TSnapshot, TResult = void>(
  {
    apply,
    execute,
    restore,
    snapshot,
    queryKey,
    operationId,
  }: {
    snapshot: (queryClient: QueryClient) => TSnapshot
    apply: (queryClient: QueryClient) => void
    execute: () => Promise<TResult>
    restore: (queryClient: QueryClient, snap: TSnapshot) => void
    queryKey?: unknown[]
    operationId?: string // New parameter for race condition management
  },
  queryClient: QueryClient,
): Promise<TResult> {
  // Cancel any pending queries for this key
  if (queryKey) {
    await queryClient.cancelQueries({ queryKey })
  }

  // Start race condition operation if ID provided
  let signal: AbortSignal | undefined
  if (operationId) {
    signal = raceConditionManager.startOperation(operationId, 15000) // 15s timeout
  }

  const snap = snapshot(queryClient)
  apply(queryClient)

  try {
    const result = await execute()

    // Check if operation was cancelled
    if (signal && signal.aborted) {
      restore(queryClient, snap)
      throw new Error('Operation cancelled')
    }

    return result
  } catch (err) {
    restore(queryClient, snap)

    // Complete operation on error
    if (signal) {
      raceConditionManager.completeOperation(operationId!)
    }

    throw err
  } finally {
    // Complete operation on success
    if (signal) {
      raceConditionManager.completeOperation(operationId!)
    }
  }
}
```

### 4.2 Updated Mutations with Operation IDs

**File**: `src/features/journal/journal.mutations.ts`

```typescript
const updateEntry = useCallback(
  (
    id: number,
    content: string,
    addedMedia: PendingMedia[] = [],
    removedMediaIds: number[] = [],
  ) => {
    const trimmed = content.trim()
    return toastAsync(
      () =>
        withOptimistic(
          {
            snapshot: (qc) => journalCache.snapshot(qc),
            apply: (qc) =>
              journalCache.update(qc, id, {
                content: trimmed,
                updatedAt: new Date(),
              }),
            execute: () =>
              updateEntryApi({
                data: {
                  id,
                  content: trimmed,
                  addedMedia: addedMedia.map((m) => ({
                    base64Data: m.base64,
                  })),
                  removedMediaIds,
                },
              }),
            restore: (qc, snap) => journalCache.restore(qc, snap),
            operationId: `entry_${id}_update`, // Add operation ID
          },
          queryClient,
        ).then((updated) => {
          journalCache.update(queryClient, id, updated)
          return updated
        }),
      {
        loading: 'Updating…',
        success: 'Entry updated.',
        error: 'Update failed.',
      },
    )
  },
  [queryClient],
)
```

---

## Part 5: Query Configuration Improvements

### 5.1 Enhanced Query Options

**File**: `src/features/journal/journal.options.ts`

```typescript
import { queryOptions } from '@tanstack/react-query'
import { journalKeys } from './journal.keys'
import { getAllEntries, getDeletedEntries } from './journal.api'
import { withTimeout } from '#/lib/with-timeout'

export const entriesQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.entries,
    queryFn: () =>
      withTimeout(() => getAllEntries(), { name: 'getAllEntries' }),
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    useErrorBoundary: true, // Use global error boundary
  })

export const trashQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.trash,
    queryFn: () =>
      withTimeout(() => getDeletedEntries(), { name: 'getDeletedEntries' }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    useErrorBoundary: true,
  })
```

### 5.2 Query Invalidation After Mutations

**File**: `src/features/journal/journal.mutations.ts`

```typescript
const createEntry = useCallback(
  (value: string, pendingMedia: PendingMedia[]) =>
    toastAsync(
      async () => {
        const entry = await createEntryApi({
          data: {
            content: value.trim(),
            media: pendingMedia.map((m) => ({
              base64Data: m.base64,
            })),
          },
        })

        // Optimistic update
        journalCache.insert(queryClient, entry)

        // Invalidate queries to ensure consistency
        await queryClient.invalidateQueries({
          queryKey: journalKeys.entries,
          exact: false,
        })

        return entry
      },
      {
        loading: 'Recording thought…',
        success: 'Saved to sanctuary.',
        error: 'Failed to save.',
      },
    ),
  [queryClient],
)

const deleteEntry = useCallback(
  (id: number) => {
    const snapshot = journalCache.snapshot(queryClient)
    const entry = snapshot?.find((e) => e.id === id)

    const promise = deleteEntryApi({ data: { id } }).then(() => {
      journalCache.remove(queryClient, id)
      if (entry) journalCache.moveToTrash(queryClient, entry)

      // Invalidate queries after successful deletion
      return queryClient.invalidateQueries({
        queryKey: journalKeys.entries,
      })
    })

    toast.promise(promise, {
      loading: 'Deleting…',
      success: 'Entry deleted.',
      error: 'Delete failed.',
      action: {
        label: 'Undo',
        onClick: async () => {
          try {
            await undeleteEntryApi({ data: { id } })
            journalCache.restoreFromTrash(queryClient, id)

            // Invalidate queries after restore
            await queryClient.invalidateQueries({
              queryKey: journalKeys.entries,
            })

            toast.success('Restored.', { duration: 2000 })
          } catch {
            toast.error('Failed to restore.', { duration: 2000 })
          }
        },
      },
      duration: 10000,
    })

    return promise
  },
  [queryClient],
)
```

---

## Part 6: Media Processing Improvements

### 6.1 Concurrency-Limited Media Processor

**File**: `src/features/media/media.service.ts`

```typescript
import { getDb } from '#/database'
import { entryMedia } from '#/database/schema'
import { eq } from 'drizzle-orm'
import { fileTypeFromBuffer } from 'file-type'
import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import sharp from 'sharp'
import type { EntryMedia } from '#/types'
import { raceConditionManager } from '#/lib/race-condition-manager'

type SaveMediaInput = {
  entryId: number
  base64Data: string
}

type PreparedMediaAsset = {
  filePath: string
  thumbnailPath: string
  mimeType: 'image/webp'
  fileSize: number
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024 // 25MB
const MAX_THUMB_WIDTH = 400

// Concurrency limit for media processing
const MAX_CONCURRENT_MEDIA_PROCESSING = 3
let activeMediaOperations = 0

export async function prepareMediaAsset(
  base64Data: string,
): Promise<PreparedMediaAsset> {
  // Wait if we're at capacity
  while (activeMediaOperations >= MAX_CONCURRENT_MEDIA_PROCESSING) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  activeMediaOperations++

  try {
    const mediaDir =
      process.env.MEDIA_STORAGE_PATH ||
      path.join(os.homedir(), '.config', 'sanctuary', 'media')

    await fs.ensureDir(mediaDir)

    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/)

    if (!match) {
      throw new Error('Invalid media format')
    }

    const buffer = Buffer.from(match[2], 'base64')

    if (buffer.length > MAX_SIZE_BYTES) {
      throw new Error('Image exceeds 25MB limit')
    }

    const fileType = await fileTypeFromBuffer(buffer)

    if (!fileType || !fileType.mime.startsWith('image/')) {
      throw new Error('Only images are allowed as media.')
    }

    const id = crypto.randomUUID()

    const originalPath = path.join(mediaDir, `${id}.webp`)
    const thumbPath = path.join(mediaDir, `${id}_thumb.webp`)

    const image = sharp(buffer, { failOn: 'none' }).rotate().withMetadata()

    const originalBuffer = await image
      .withMetadata()
      .webp({
        quality: 85,
      })
      .toBuffer()

    const thumbnailBuffer = await image
      .clone()
      .resize({
        width: MAX_THUMB_WIDTH,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 95 })
      .toBuffer()

    await fs.writeFile(originalPath, originalBuffer)
    await fs.writeFile(thumbPath, thumbnailBuffer)

    return {
      filePath: originalPath,
      thumbnailPath: thumbPath,
      mimeType: 'image/webp',
      fileSize: originalBuffer.length,
    }
  } finally {
    activeMediaOperations--
  }
}

export async function saveMediaService(
  input: SaveMediaInput,
): Promise<EntryMedia> {
  const db = await getDb()

  // Start operation with 30 second timeout
  const signal = raceConditionManager.startOperation(
    `media_${input.entryId}`,
    30000,
  )

  try {
    const media = await prepareMediaAsset(input.base64Data)

    // Check if cancelled
    if (signal.aborted) {
      await fs.remove(media.filePath)
      await fs.remove(media.thumbnailPath)
      throw new Error('Media processing cancelled')
    }

    try {
      const [savedMedia] = await db
        .insert(entryMedia)
        .values({
          entryId: input.entryId,
          filePath: media.filePath,
          thumbnailPath: media.thumbnailPath,
          mimeType: media.mimeType,
          fileSize: media.fileSize,
        })
        .returning()

      return savedMedia
    } catch (error) {
      await fs.remove(media.filePath)
      await fs.remove(media.thumbnailPath)
      throw error
    }
  } finally {
    raceConditionManager.completeOperation(`media_${input.entryId}`)
  }
}
```

---

## Part 7: Testing Strategy

### 7.1 Unit Tests for Race Condition Manager

**File**: `src/lib/race-condition-manager.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { raceConditionManager } from './race-condition-manager'

describe('RaceConditionManager', () => {
  beforeEach(() => {
    raceConditionManager.cancelAll()
  })

  it('should start a new operation', () => {
    const signal = raceConditionManager.startOperation('test-op')
    expect(raceConditionManager.getActiveCount()).toBe(1)
    expect(signal.aborted).toBe(false)
  })

  it('should cancel previous operation with same ID', () => {
    const signal1 = raceConditionManager.startOperation('test-op')
    const signal2 = raceConditionManager.startOperation('test-op')

    expect(signal1.aborted).toBe(true)
    expect(signal2.aborted).toBe(false)
    expect(raceConditionManager.getActiveCount()).toBe(1)
  })

  it('should complete an operation', () => {
    const signal = raceConditionManager.startOperation('test-op')
    raceConditionManager.completeOperation('test-op')

    expect(raceConditionManager.getActiveCount()).toBe(0)
    expect(signal.aborted).toBe(true)
  })

  it('should timeout and cancel operation', async () => {
    const signal = raceConditionManager.startOperation('test-op', 100)

    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(signal.aborted).toBe(true)
    expect(raceConditionManager.getActiveCount()).toBe(0)
  })

  it('should cancel all operations', () => {
    raceConditionManager.startOperation('op1')
    raceConditionManager.startOperation('op2')
    raceConditionManager.startOperation('op3')

    raceConditionManager.cancelAll()

    expect(raceConditionManager.getActiveCount()).toBe(0)
  })
})
```

### 7.2 Integration Test for Optimistic Updates

**File**: `src/features/journal/journal.mutations.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useJournalMutations } from './journal.mutations'

describe('Journal Mutations', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
  })

  it('should handle rapid successive updates', async () => {
    const { result } = renderHook(
      () => useJournalMutations(),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    )

    // Simulate rapid updates
    const updatePromises = []
    for (let i = 0; i < 5; i++) {
      updatePromises.push(
        result.current.updateEntry(1, `Content ${i}`, [], []),
      )
    }

    // All updates should complete
    await Promise.all(updatePromises)

    // Only the last update should be in cache
    const entries = queryClient.getQueryData(['journal', 'entries'])
    expect(entries).toBeDefined()
    expect(entries?.[0]?.content).toBe('Content 4')
  })

  it('should rollback on failure', async () => {
    const { result } = renderHook(
      () => useJournalMutations(),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    )

    // Mock failed update
    jest.spyOn(require('./journal.api'), 'updateEntryApi').mockRejectedValue(
      new Error('Network error'),
    )

    const snapshot = queryClient.getQueryData(['journal', 'entries'])

    try {
      await result.current.updateEntry(1, 'New content', [], [])
      expect(false).toBe(true) // Should not reach here
    } catch (error) {
      // Verify rollback occurred
      await waitFor(() => {
        const updatedSnapshot = queryClient.getQueryData(['journal', 'entries'])
        expect(updatedSnapshot).toEqual(snapshot)
      })
    }
  })
})
```

---

## Part 8: Migration Checklist

### Phase 1: Core Infrastructure (Week 1)

- [ ] Create `src/lib/race-condition-manager.ts`
- [ ] Create `src/lib/journal-race-manager.ts`
- [ ] Update `package.json` dependencies if needed
- [ ] Add tests for race condition manager

### Phase 2: Critical Hooks (Week 2)

- [ ] Update `useMood` hook with AbortController
- [ ] Update `useDraft` hook with race condition manager
- [ ] Update background jobs cleanup
- [ ] Add tests for updated hooks

### Phase 3: Mutations (Week 3)

- [ ] Update `withOptimistic` with operation IDs
- [ ] Update journal mutations with race condition management
- [ ] Update habits mutations with race condition management
- [ ] Add tests for optimistic updates

### Phase 4: Query Configuration (Week 4)

- [ ] Configure TanStack Query with proper `staleTime`
- [ ] Add query invalidation after mutations
- [ ] Configure `gcTime` and `refetchOnWindowFocus`
- [ ] Add query tests

### Phase 5: Media Processing (Week 5)

- [ ] Add concurrency limit to media processing
- [ ] Add AbortController to media operations
- [ ] Add progress indicators for media uploads
- [ ] Add tests for media processing

### Phase 6: Testing & Documentation (Week 6)

- [ ] Write integration tests for race conditions
- [ ] Update developer documentation
- [ ] Add race condition patterns to team wiki
- [ ] Performance testing and optimization

---

## Part 9: Monitoring & Maintenance

### 9.1 Add Monitoring

```typescript
// src/lib/race-condition-manager.ts
export class RaceConditionManager {
  // ... existing code ...

  getStats() {
    return {
      activeOperations: this.activeOperations.size,
      activeTimeouts: this.operationTimeouts.size,
      operationIds: Array.from(this.activeOperations.keys()),
    }
  }
}

// Add to devtools or logging
console.log('Race Condition Stats:', raceConditionManager.getStats())
```

### 9.2 Regular Audits

- **Weekly**: Check for timer leaks in development
- **Monthly**: Review race condition manager stats
- **Quarterly**: Audit all hooks for proper cleanup
- **Annually**: Comprehensive security and performance review

---

## Conclusion

This implementation guide provides a comprehensive approach to addressing race conditions in the Sanctuary application. By following these steps:

1. **Start small**: Implement the race condition manager first
2. **Iterate**: Update hooks and mutations one at a time
3. **Test**: Add comprehensive tests for each change
4. **Monitor**: Track operation counts and timeouts
5. **Document**: Keep this guide updated with new patterns

The hybrid approach (global + domain-specific managers) provides the best balance of control and maintainability while ensuring race conditions are properly handled throughout the application.

---

_Implementation guide created: June 6, 2026_
