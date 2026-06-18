import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
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
import { Hero } from '#/components/layout/Hero'
import { FocusSection } from '#/components/layout/FocusSection'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'

import { getTodayStr } from '#/utils/date'

import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '#/config/branding'

export const Route = createLazyFileRoute('/__app/habits')({
  component: HabitsPage,
})

function HabitsPage() {
  const { data } = useSuspenseQuery(habitsQueryOptions())
  const { createHabit, updateHabit, updateHabitStatus, deleteHabit, toggleCompletion } =
    useHabitsMutations()

  useEffect(() => { void syncHabits() }, [])

  const [activeHabitId, setActiveHabitId] = useState<number | 'new' | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const activeHabit =
    typeof activeHabitId === 'number'
      ? data.habits.find((h) => h.id === activeHabitId)
      : null

  const completionMap = buildCompletionMap(data.completions)
  const today = getTodayStr()

  return (
    <>
      <Hero title={PAGE_TITLES.habits} description={PAGE_DESCRIPTIONS.habits} />

      <FocusSection>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-12rem)] min-h-[600px]">
          <FeatureErrorBoundary title="Identity List" className="w-full lg:w-80 shrink-0">
            <IdentityListPane
              habits={data.habits}
              completions={data.completions}
              activeHabitId={typeof activeHabitId === 'number' ? activeHabitId : null}
              onSelect={(id) => { setActiveHabitId(id) }}
              onCreateNew={() => { setActiveHabitId('new') }}
            />
          </FeatureErrorBoundary>

          <FeatureErrorBoundary title="Identity Viewer" className="flex-1 min-w-0">
            <IdentityViewerPane
              hasContent={activeHabitId !== null}
              activeKey={activeHabitId ?? 'empty'}
            >
              {activeHabitId === 'new' ? (
                <HabitCreateForm
                  onCreate={async (habit) => {
                    toast.promise(createHabit.mutateAsync(habit), {
                      loading: 'Establishing identity…',
                      success: (created) => {
                        if (created?.id) setActiveHabitId(created.id)
                        return 'Identity adopted!'
                      },
                      error: 'Failed to create identity.',
                    })
                  }}
                  onCancel={() => setActiveHabitId(null)}
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
                  onUpdateStatus={(id, status) => {
                    toast.promise(updateHabitStatus.mutateAsync({ id, status }), {
                      loading: 'Updating habit…',
                      success:
                        status === 'resting'
                          ? 'Habit resting for 7 days.'
                          : 'Habit awakened.',
                      error: 'Failed to update habit.',
                    })
                  }}
                  onDelete={setDeleteId}
                  onToggleCompletion={(habitId, date, tier) => {
                    toggleCompletion.mutate({ habitId, date, tier })
                  }}
                  onUpdateHabit={async (data) => {
                    toast.promise(updateHabit.mutateAsync(data), {
                      loading: 'Saving changes…',
                      success: 'Identity updated.',
                      error: 'Failed to update identity.',
                    })
                  }}
                />
              ) : null}
            </IdentityViewerPane>
          </FeatureErrorBoundary>
        </div>
      </FocusSection>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Identity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently erase all evidence logs for this
              identity and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={async () => {
                if (deleteId !== null) {
                  toast.promise(deleteHabit.mutateAsync(deleteId), {
                    loading: 'Removing identity…',
                    success: () => {
                      if (activeHabitId === deleteId) setActiveHabitId(null)
                      setDeleteId(null)
                      return 'Identity removed.'
                    },
                    error: 'Failed to remove identity.',
                  })
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
