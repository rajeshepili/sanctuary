import { Fingerprint, Plus, Moon, AlertTriangle } from 'lucide-react'
import { ScrollArea } from '#/components/ui/scroll-area'
import { Button } from '#/components/ui/button'
import { isScheduledOn } from '#/utils/consistency'
import {
  getTodayStr,
  toLocalDateString,
  fromLocalDateString,
} from '#/utils/date'
import { addDays } from 'date-fns'
import { buildCompletionMap } from '../habits.selectors'
import type { Habit, HabitCompletion } from '#/types'
import { motion } from 'framer-motion'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '#/components/ui/empty'

interface IdentityListPaneProps {
  habits: Habit[]
  completions: HabitCompletion[]
  activeHabitId: number | null
  onSelect: (id: number) => void
  onCreateNew: () => void
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
            <Empty className="py-12 border-none px-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Fingerprint />
                </EmptyMedia>
                <EmptyTitle>No identities yet</EmptyTitle>
                <EmptyDescription>Create your first one.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {habits.map((habit) => {
            const habitCompletions = completionMap.get(habit.id) ?? new Map()
            const doneToday = habitCompletions.has(today)
            const scheduledToday = isScheduledOn(
              today,
              habit.frequency,
              habit.interval,
              habit.daysOfWeek,
              habit.createdAt.toISOString().split('T')[0]
            )
            const missedYesterday =
              isScheduledOn(
                yesterday, 
                habit.frequency, 
                habit.interval,
                habit.daysOfWeek,
                habit.createdAt.toISOString().split('T')[0]
              ) &&
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
                      🌱
                    </span>
                    <span
                      className={`text-sm font-semibold truncate ${habit.status === 'resting' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                    >
                      {habit.identityLabel ?? habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {missedYesterday && (
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    )}
                    {habit.status === 'resting' ? (
                      <Moon className="w-3 h-3 text-blue-400" />
                    ) : (
                      <div className="relative flex items-center justify-center w-4 h-4">
                        {scheduledToday && (
                          <div
                            className={`w-2 h-2 rounded-full border border-muted-foreground/40 ${doneToday ? 'hidden' : 'block'}`}
                          />
                        )}
                        {doneToday && (
                          <motion.div
                            layoutId={`glow-${habit.id}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-2.5 h-2.5 rounded-full bg-primary relative"
                            style={{
                              boxShadow: `0 0 12px rgba(var(--primary), 0.5)`,
                            }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0, 0.3],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 rounded-full bg-inherit"
                            />
                          </motion.div>
                        )}
                      </div>
                    )}
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
