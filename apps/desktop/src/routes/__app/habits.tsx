import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Kbd } from '#/components/ui/kbd'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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
import { buildCompletionMap, calculateConsistency, calculateIdentityVotes } from '#/features/habits/habits.selectors'

import { IdentityListPane } from '#/features/habits/components/IdentityListPane'
import { IdentityViewerPane } from '#/features/habits/components/IdentityViewerPane'
import { HabitDayCell } from '#/features/habits/components/HabitDayCell'
import { Hero } from '#/components/layout/Hero'
import { FocusSection } from '#/components/layout/FocusSection'
import { FeatureErrorBoundary } from '#/components/errors/FeatureErrorBoundary'
import { IconButton } from '#/components/ui/icon-button'

import {
  isScheduledOn,
} from '#/utils/consistency'
import {
  getLast30DaysList,
  getTodayStr,
  fromLocalDateString,
  toLocalDateString,
} from '#/utils/date'
import { formatScheduleLabel } from '#/utils/habits'
import { format, addDays } from 'date-fns'

import type { HabitFrequency, HabitPriority, HabitCategory } from '#/types'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '#/config/branding'
import {
  Moon, Sun, Trash2, Target, Fingerprint, AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/__app/habits')({
  component: HabitsPage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(habitsQueryOptions())
  },
})

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'every_day', label: 'Every Day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom Days' },
]

const CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'mind', label: 'Mind', emoji: '🧠' },
  { value: 'body', label: 'Body', emoji: '💪' },
  { value: 'connection', label: 'Connection', emoji: '🤝' },
  { value: 'rest', label: 'Rest', emoji: '😴' },
  { value: 'growth', label: 'Growth', emoji: '🌱' },
]

const PRIORITIES: { value: HabitPriority; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'text-green-500 bg-green-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10' },
  { value: 'hard', label: 'Hard', color: 'text-red-500 bg-red-500/10' },
]

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function HabitsPage() {
  const { data } = useSuspenseQuery(habitsQueryOptions())
  const { createHabit, updateHabitStatus, deleteHabit, toggleCompletion } = useHabitsMutations()

  useEffect(() => { void syncHabits() }, [])

  // Which habit is selected (null = nothing, 'new' = create form)
  const [activeHabitId, setActiveHabitId] = useState<number | 'new' | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [identityLabel, setIdentityLabel] = useState('')
  const [miniDesc, setMiniDesc] = useState('')
  const [plusDesc, setPlusDesc] = useState('')
  const [eliteDesc, setEliteDesc] = useState('')
  const [intention, setIntention] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('every_day')
  const [customDays, setCustomDays] = useState<string[]>([])
  const [priority, setPriority] = useState<HabitPriority>('medium')
  const [category, setCategory] = useState<HabitCategory>('growth')

  const resetForm = () => {
    setName(''); setIdentityLabel(''); setMiniDesc(''); setPlusDesc('')
    setEliteDesc(''); setIntention(''); setFrequency('every_day')
    setCustomDays([]); setPriority('medium'); setCategory('growth')
  }

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim()) return
      const created = await createHabit({
        name: name.trim(),
        identityLabel: identityLabel.trim() || null,
        miniDesc: miniDesc.trim() || null,
        plusDesc: plusDesc.trim() || null,
        eliteDesc: eliteDesc.trim() || null,
        intention: intention.trim() || null,
        frequency,
        daysOfWeek: frequency === 'custom' ? customDays.join(',') : null,
        priority,
        category,
      })
      resetForm()
      // Select the newly created habit
      if (created?.id) setActiveHabitId(created.id)
    },
    [name, identityLabel, miniDesc, plusDesc, eliteDesc, intention, frequency, customDays, priority, category, createHabit],
  )

  const toggleCustomDay = (day: string) =>
    setCustomDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])

  // Derive active habit
  const activeHabit = typeof activeHabitId === 'number'
    ? data.habits.find((h) => h.id === activeHabitId)
    : null

  const completionMap = buildCompletionMap(data.completions)

  // Viewer content
  const today = getTodayStr()

  return (
    <>
      <Hero title={PAGE_TITLES.habits} description={PAGE_DESCRIPTIONS.habits} />

      <FocusSection>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-12rem)] min-h-[600px]">

          {/* LEFT PANE — identity list */}
          <FeatureErrorBoundary title="Identity List" className="w-full lg:w-80 shrink-0">
            <IdentityListPane
              habits={data.habits}
              completions={data.completions}
              activeHabitId={typeof activeHabitId === 'number' ? activeHabitId : null}
              onSelect={(id) => { setActiveHabitId(id); }}
              onCreateNew={() => { resetForm(); setActiveHabitId('new'); }}
            />
          </FeatureErrorBoundary>

          {/* RIGHT PANE — viewer or creation form */}
          <FeatureErrorBoundary title="Identity Viewer" className="flex-1 min-w-0">
            <IdentityViewerPane
              hasContent={activeHabitId !== null}
              activeKey={activeHabitId ?? 'empty'}
            >
              {/* ── CREATE MODE ── */}
              {activeHabitId === 'new' && (
                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Adopt New Identity</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Decide who you wish to become, then prove it with a small daily action.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Who do you wish to become?</Label>
                    <Input
                      value={identityLabel}
                      onChange={(e) => setIdentityLabel(e.target.value)}
                      placeholder='e.g. "I am a runner", "I am a mindful person"'
                      className="bg-background/60 border-border/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Daily Action <span className="font-normal text-muted-foreground">(the habit that proves it)</span></Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Put on my running shoes"
                      required
                      className="bg-background/60 border-border/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Your 'Why' <span className="font-normal text-muted-foreground">(optional)</span></Label>
                    <Input
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      placeholder="e.g. Because I want to feel strong and capable"
                      className="bg-background/60 border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>2-Minute Version</Label>
                      <Input value={miniDesc} onChange={(e) => setMiniDesc(e.target.value)} placeholder="e.g. Read 1 page" className="bg-background/60 border-border/50 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Target Action</Label>
                      <Input value={plusDesc} onChange={(e) => setPlusDesc(e.target.value)} placeholder="e.g. Read 15 mins" className="bg-background/60 border-border/50 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bonus Action</Label>
                      <Input value={eliteDesc} onChange={(e) => setEliteDesc(e.target.value)} placeholder="e.g. Read a chapter" className="bg-background/60 border-border/50 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${category === c.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                            {c.emoji} {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <div className="flex gap-2">
                        {PRIORITIES.map((p) => (
                          <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${priority === p.value ? `${p.color} border-current` : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Schedule</Label>
                    <div className="flex flex-wrap gap-2">
                      {FREQUENCIES.map((f) => (
                        <button key={f.value} type="button" onClick={() => setFrequency(f.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${frequency === f.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {frequency === 'custom' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 pt-2">
                          {WEEKDAYS.map((day) => (
                            <button key={day} type="button" onClick={() => toggleCustomDay(day)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all border ${customDays.includes(day) ? 'bg-primary text-primary-foreground border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={!name.trim()} className="flex-1">
                      Adopt Identity
                      <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">↵</Kbd>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setActiveHabitId(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* ── VIEW MODE ── */}
              {activeHabit && (() => {
                const habitCompletions = completionMap.get(activeHabit.id) ?? new Map()
                const consistency = calculateConsistency(activeHabit, habitCompletions)
                const votes = calculateIdentityVotes(habitCompletions)
                const scheduleLabel = formatScheduleLabel(activeHabit)
                const yesterdayStr = toLocalDateString(addDays(fromLocalDateString(today), -1))
                const missedYesterday =
                  isScheduledOn(yesterdayStr, activeHabit.frequency, activeHabit.daysOfWeek) &&
                  !habitCompletions.has(yesterdayStr) &&
                  !habitCompletions.has(today)

                return (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-border/40 pb-5">
                      <div className="space-y-1.5">
                        <h2 className={`text-2xl font-bold ${activeHabit.status === 'resting' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {activeHabit.identityLabel ?? activeHabit.name}
                        </h2>
                        {activeHabit.identityLabel && (
                          <div className="flex items-center gap-1.5 text-sm text-primary/80 font-semibold">
                            <Target className="w-4 h-4" />
                            <span>Daily Action: {activeHabit.name}</span>
                          </div>
                        )}
                        {activeHabit.intention && (
                          <p className="text-sm italic text-muted-foreground font-serif border-l-2 border-primary/30 pl-3 mt-2">
                            "{activeHabit.intention}"
                          </p>
                        )}
                        {missedYesterday && activeHabit.status === 'active' && (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 uppercase tracking-widest mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Never Miss Twice
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 ml-4">
                        <IconButton
                          tooltip={activeHabit.status === 'active' ? 'Rest this habit' : 'Resume this habit'}
                          onClick={() => updateHabitStatus(activeHabit.id, activeHabit.status === 'active' ? 'resting' : 'active')}
                        >
                          {activeHabit.status === 'active' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </IconButton>
                        <IconButton tooltip="Delete this identity" variant="danger" onClick={() => setDeleteId(activeHabit.id)}>
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                        <Target className="w-3.5 h-3.5" />
                        {consistency}% Consistency
                      </div>
                      <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                        <Fingerprint className="w-3.5 h-3.5" />
                        {votes} Votes cast
                      </div>
                      <div className="text-muted-foreground bg-foreground/5 px-3 py-1.5 rounded-full capitalize border border-border/40">
                        {scheduleLabel}
                      </div>
                    </div>

                    {/* Tier descriptions */}
                    {(activeHabit.miniDesc || activeHabit.plusDesc || activeHabit.eliteDesc) && (
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        {activeHabit.miniDesc && (
                          <div className="p-3 rounded-xl bg-foreground/5 border border-border/40 space-y-1">
                            <p className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">2-Minute Version</p>
                            <p className="text-foreground">{activeHabit.miniDesc}</p>
                          </div>
                        )}
                        {activeHabit.plusDesc && (
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                            <p className="font-bold text-primary/70 uppercase tracking-wider text-[9px]">Target Action</p>
                            <p className="text-foreground">{activeHabit.plusDesc}</p>
                          </div>
                        )}
                        {activeHabit.eliteDesc && (
                          <div className="p-3 rounded-xl bg-foreground/5 border border-border/40 space-y-1">
                            <p className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Bonus Action</p>
                            <p className="text-foreground">{activeHabit.eliteDesc}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence log */}
                    {activeHabit.status === 'active' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          <span>30-Day Evidence Log</span>
                          <span className="opacity-60 normal-case font-medium">Tap to cast a vote</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {getLast30DaysList().map((dayStr) => {
                            const tier = habitCompletions.get(dayStr)
                            const dateObj = fromLocalDateString(dayStr)
                            return (
                              <HabitDayCell
                                key={dayStr}
                                dayStr={dayStr}
                                isCompleted={!!tier}
                                tier={tier as 'mini' | 'plus' | 'elite'}
                                isToday={dayStr === today}
                                activeOnDate={isScheduledOn(dayStr, activeHabit.frequency, activeHabit.daysOfWeek)}
                                dateLabel={format(dateObj, 'MMM d')}
                                dayNumber={dateObj.getDate()}
                                onToggle={(day) => toggleCompletion(activeHabit.id, day)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </IdentityViewerPane>
          </FeatureErrorBoundary>
        </div>
      </FocusSection>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Identity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently erase all evidence logs for this identity and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={async () => {
                if (deleteId !== null) {
                  await deleteHabit(deleteId)
                  if (activeHabitId === deleteId) setActiveHabitId(null)
                  setDeleteId(null)
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
