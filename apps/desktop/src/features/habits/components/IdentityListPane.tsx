import { Fingerprint, Plus, Moon, AlertTriangle } from 'lucide-react'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Button } from '#/components/ui/button'
import {
  isScheduledOn,
} from '#/utils/consistency'
import {
  getTodayStr,
  toLocalDateString,
  fromLocalDateString,
} from '#/utils/date'
import { addDays } from 'date-fns'
import { buildCompletionMap } from '../habits.selectors'
import type { Habit, HabitCompletion } from '#/types'

interface IdentityListPaneProps {
  habits: Habit[]
  completions: HabitCompletion[]
  activeHabitId: number | null
  onSelect: (id: number) => void
  onCreateNew: () => void
}

const CATEGORY_EMOJI: Record<string, string> = {
  mind: '🧠',
  body: '💪',
  connection: '🤝',
  rest: '😴',
  growth: '🌱',
}

export function IdentityListPane({
  habits,
  completions,
  activeHabitId,
  onSelect,
  onCreateNew,
}: IdentityListPaneProps) {
  const today = getTodayStr()
  const yesterday = toLocalDateString(addDays(fromLocalDateString(today), -1))
  const completionMap = buildCompletionMap(completions)

  return (
    <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-3 border border-border/40 bg-card/40 backdrop-blur-md rounded-[1.4rem] p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h2 className="text-sm font-bold text-foreground">My Identities</h2>
          <p className="text-[11px] text-muted-foreground">
            {habits.length} identit{habits.length !== 1 ? 'ies' : 'y'} adopted
          </p>
        </div>
        <Button size="sm" onClick={onCreateNew} className="gap-1.5 text-xs h-8">
          <Plus className="w-3.5 h-3.5" />
          New Identity
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 -mr-2 min-h-0">
        <div className="space-y-1.5 pr-2">
          {habits.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Fingerprint className="w-8 h-8 mx-auto opacity-20" />
              <p>No identities yet. Create your first one.</p>
            </div>
          )}

          {habits.map((habit) => {
            const habitCompletions = completionMap.get(habit.id) ?? new Map()
            const doneToday = habitCompletions.has(today)
            const scheduledToday = isScheduledOn(today, habit.frequency, habit.daysOfWeek)
            const missedYesterday =
              isScheduledOn(yesterday, habit.frequency, habit.daysOfWeek) &&
              !habitCompletions.has(yesterday) &&
              !doneToday

            const isActive = activeHabitId === habit.id

            return (
              <button
                key={habit.id}
                onClick={() => onSelect(habit.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                    : 'border-border/30 bg-background/30 hover:bg-background/60 hover:border-border/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">
                      {CATEGORY_EMOJI[habit.category] ?? '🌱'}
                    </span>
                    <span className={`text-sm font-semibold truncate ${habit.status === 'resting' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {habit.identityLabel ?? habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {missedYesterday && (
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                    )}
                    {habit.status === 'resting' ? (
                      <Moon className="w-3 h-3 text-blue-400" />
                    ) : scheduledToday && doneToday ? (
                      <span className="w-2 h-2 rounded-full bg-primary block" />
                    ) : scheduledToday ? (
                      <span className="w-2 h-2 rounded-full border border-muted-foreground/40 block" />
                    ) : null}
                  </div>
                </div>

                {habit.identityLabel && (
                  <p className="text-[11px] text-muted-foreground truncate pl-0.5">
                    {habit.name}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
