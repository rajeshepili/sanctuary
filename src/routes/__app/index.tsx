import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import {
  entriesQueryOptions,
  trashQueryOptions,
} from '#/features/journal/journal.options'
import { habitsQueryOptions } from '#/features/habits/habits.options'
import { preferencesQueryOptions } from '#/features/preferences/preferences.options'
import { promptsQueryOptions } from '#/features/prompts/prompts.options'
import { useJournalEntryState } from '#/hooks/use-journal-entry-state'
import { useJournalMutations } from '#/features/journal/journal.mutations'

import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '#/config/branding'

import { DailyIntention } from '#/features/dashboard/components/DailyIntention'
import { PromptInspireWidget } from '#/features/dashboard/components/PromptInspireWidget'
import { JournalEditor } from '#/features/journal/components/editor/JournalEditor'
import { PastEntriesList } from '#/features/dashboard/components/PastEntriesList'
import { BreathingSpace } from '#/features/dashboard/components/BreathingSpace'
import { HabitsSidebarWidget } from '#/features/habits/components/HabitsSidebarWidget'
import { FocusSection } from '#/components/layout/FocusSection'
import { Hero } from '#/components/layout/Hero'
import { injectPromptIntoContent } from '#/utils/journal'

export const Route = createFileRoute('/__app/')({
  component: App,
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(entriesQueryOptions()),
      queryClient.ensureQueryData(habitsQueryOptions()),
      queryClient.ensureQueryData(preferencesQueryOptions()),
      queryClient.prefetchQuery(trashQueryOptions()),
      queryClient.prefetchQuery(promptsQueryOptions()),
    ])
  },
})

function App() {
  const { data: entries } = useSuspenseQuery(entriesQueryOptions())
  const { data: prefs } = useSuspenseQuery(preferencesQueryOptions())
  const { data: habitsData } = useSuspenseQuery(habitsQueryOptions())

  const {
    value,
    setValue,
    pendingMedia,
    setPendingMedia,
    draftStatus,
    draftError,
    handleRetryDraftSave,
    handleCopyDraft,
    handleSave,
  } = useJournalEntryState()

  const { deleteEntry, updateEntry, togglePin } = useJournalMutations()

  useEffect(() => {
    import('#/lib/session-store').then(({ sessionStore }) => {
      const prompt = sessionStore.consumePendingPrompt()
      if (prompt) {
        setValue((prev) => injectPromptIntoContent(prev, prompt))
      }
    })
  }, [setValue])

  const handleDelete = useCallback(
    (id: number) => deleteEntry(id),
    [deleteEntry],
  )

  const handleUpdateEntry = useCallback(
    (
      id: number,
      content: string,
      addedMedia: { file: File; base64: string }[] = [],
      removedMediaIds: number[] = [],
    ) => updateEntry(id, content, addedMedia, removedMediaIds),
    [updateEntry],
  )

  const handleTogglePin = useCallback(
    (id: number) => togglePin(id),
    [togglePin],
  )

  const showSidebar = prefs.showHabits || prefs.showBreathingSpace

  const greeting = prefs.firstName
    ? `Welcome back, ${prefs.firstName}.`
    : undefined

  return (
    <>
      <Hero
        title={PAGE_TITLES.home}
        description={PAGE_DESCRIPTIONS.home}
        greeting={greeting}
      >
        {prefs.showDailyIntention && <DailyIntention />}
      </Hero>

      <FocusSection>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div
            className={`${showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-8`}
          >
            {prefs.showPromptInspire && (
              <PromptInspireWidget
                onUsePrompt={(text) =>
                  setValue((prev) => injectPromptIntoContent(prev, text))
                }
              />
            )}
            <JournalEditor
              value={value}
              setValue={setValue}
              onSave={handleSave}
              pendingMedia={pendingMedia}
              onAddMedia={(items) =>
                setPendingMedia((prev) => [...prev, ...items])
              }
              onRemovePending={(idx) =>
                setPendingMedia((prev) => prev.filter((_, i) => i !== idx))
              }
              draftStatus={draftStatus}
              draftError={draftError}
              retryDraftSave={handleRetryDraftSave}
              copyDraft={handleCopyDraft}
            />
            <PastEntriesList
              entries={entries}
              onDelete={handleDelete}
              onUpdate={handleUpdateEntry}
              onTogglePin={handleTogglePin}
            />
          </div>

          {/* Sidebar Section */}
          {showSidebar && (
            <div className="lg:col-span-1 space-y-8">
              {prefs.showBreathingSpace && <BreathingSpace />}
              {prefs.showHabits && (
                <HabitsSidebarWidget
                  habits={habitsData.habits}
                  completions={habitsData.completions}
                />
              )}
            </div>
          )}
        </div>
      </FocusSection>
    </>
  )
}
