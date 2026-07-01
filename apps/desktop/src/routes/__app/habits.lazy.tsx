import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

import { habitsQueryOptions } from '#/features/habits/habits.options'
import { useHabitsMutations } from '#/features/habits/habits.mutations'
import { syncHabits } from '#/features/habits/habits.api'
import {
  buildCompletionMap,
  calculateConsistency,
  calculateIdentityVotes,
  calculateMissedYesterday,
} from '#/features/habits/habits.selectors'

import { IdentityListPane } from '#/features/habits/components/IdentityListPane'
import { IdentityViewerPane } from '#/features/habits/components/IdentityViewerPane'
import { HabitCreateForm } from '#/features/habits/components/HabitCreateForm'
import { HabitDetailView } from '#/features/habits/components/HabitDetailView'
import { PageLayout } from '#/components/layout/PageLayout'
import { PageSkeleton } from '#/components/layout/PageSkeleton'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

import { getTodayStr } from '#/utils/date'
import type { HabitStatus } from '#/types'

export const Route = createLazyFileRoute('/__app/habits')({
  component: HabitsPage,
  pendingComponent: PageSkeleton,
})

function HabitsPage() {
  const { data } = useSuspenseQuery(habitsQueryOptions())
  const {
    createHabit,
    updateHabit,
    updateHabitStatus,
    deleteHabit,
    toggleCompletion,
  } = useHabitsMutations()

  useEffect(() => {
    if (sessionStorage.getItem('habits_reactivated') === '1') return
    void syncHabits().then(() => {
      sessionStorage.setItem('habits_reactivated', '1')
    })
  }, [])

  const [activeHabitId, setActiveHabitId] = useState<number | 'new' | null>(
    null,
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const activeHabit =
    typeof activeHabitId === 'number'
      ? data.habits.find((h) => h.id === activeHabitId)
      : null

  const completionMap = buildCompletionMap(data.completions)
  const today = getTodayStr()

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelect = useCallback((id: number) => setActiveHabitId(id), [])
  const handleCreateNew = useCallback(() => setActiveHabitId('new'), [])
  const handleCancelCreate = useCallback(() => setActiveHabitId(null), [])

  const handleCreateSubmit = useCallback(
    (habit: Parameters<typeof createHabit.mutate>[0]) => {
      createHabit.mutate(habit, {
        onSuccess: (created) => {
          if (created.id) setActiveHabitId(created.id)
        },
      })
    },
    [createHabit],
  )

  const handleUpdateStatus = useCallback(
    (id: number, status: HabitStatus) => {
      updateHabitStatus.mutate({ id, status })
    },
    [updateHabitStatus],
  )

  const handleDeleteRequest = useCallback((id: number) => setDeleteId(id), [])

  const handleToggleCompletion = useCallback(
    (
      habitId: number,
      date: string,
      tier?: 'mini' | 'plus' | 'elite' | 'skipped',
    ) => {
      toggleCompletion.mutate({ habitId, date, tier })
    },
    [toggleCompletion],
  )

  const handleUpdateHabit = useCallback(
    (habitData: Parameters<typeof updateHabit.mutate>[0]) => {
      updateHabit.mutate(habitData)
    },
    [updateHabit],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId === null) return
    deleteHabit.mutate(deleteId, {
      onSuccess: () => {
        if (activeHabitId === deleteId) setActiveHabitId(null)
        setDeleteId(null)
      },
    })
  }, [deleteId, activeHabitId, deleteHabit])

  return (
    <>
      <PageLayout>
        <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100dvh-14rem)]">
          <FeatureErrorBoundary
            title="Identity List"
            className="w-full lg:w-80 shrink-0"
          >
            <IdentityListPane
              habits={data.habits}
              completions={data.completions}
              activeHabitId={
                typeof activeHabitId === 'number' ? activeHabitId : null
              }
              onSelect={handleSelect}
              onCreateNew={handleCreateNew}
            />
          </FeatureErrorBoundary>

          <FeatureErrorBoundary
            title="Identity Viewer"
            className="flex-1 min-w-0"
          >
            <IdentityViewerPane
              hasContent={activeHabitId !== null}
              activeKey={activeHabitId ?? 'empty'}
            >
              {activeHabitId === 'new' ? (
                <HabitCreateForm
                  onCreate={handleCreateSubmit}
                  onCancel={handleCancelCreate}
                />
              ) : activeHabit ? (
                <HabitDetailView
                  habit={activeHabit}
                  completions={completionMap.get(activeHabit.id) ?? new Map()}
                  consistency={calculateConsistency(
                    activeHabit,
                    completionMap.get(activeHabit.id) ?? new Map(),
                  )}
                  votes={calculateIdentityVotes(
                    completionMap.get(activeHabit.id) ?? new Map(),
                  )}
                  today={today}
                  missedYesterday={calculateMissedYesterday(
                    activeHabit,
                    completionMap.get(activeHabit.id) ?? new Map(),
                    today,
                  )}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteRequest}
                  onToggleCompletion={handleToggleCompletion}
                  onUpdateHabit={handleUpdateHabit}
                />
              ) : null}
            </IdentityViewerPane>
          </FeatureErrorBoundary>
        </div>
      </PageLayout>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Identity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently erase all evidence logs for
              this identity and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
