import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, Calendar, Activity } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { isScheduledOn, getTodayStr } from '#/utils/streak'
import { buildCompletionMap } from '#/features/habits/habits.selectors'
import { useHabitsMutations } from '#/features/habits/habits.mutations'
import { ScrollArea } from '#/components/ui/scroll-area'
import type { Habit, HabitCompletion } from '#/types'

interface Props {
  habits: Habit[]
  completions: HabitCompletion[]
}

export function HabitsSidebarWidget({ habits, completions }: Props) {
  const { toggleCompletion } = useHabitsMutations()
  const today = getTodayStr()

  const todaysHabits = habits.filter((habit) => {
    if (habit.status !== 'active') return false
    return isScheduledOn(today, habit.frequency, habit.daysOfWeek)
  })

  const completionMap = buildCompletionMap(completions)

  const isCompletedToday = useCallback(
    (habitId: number) => completionMap.get(habitId)?.has(today),
    [completionMap, today],
  )

  const completedCount = todaysHabits.filter((h) =>
    isCompletedToday(h.id),
  ).length
  const totalCount = todaysHabits.length
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (todaysHabits.length === 0) {
    return (
      <Card className="p-6 border border-border/60 bg-card/60 backdrop-blur-xl shadow-lg flex flex-col items-center text-center space-y-3">
        <Activity className="w-8 h-8 text-muted-foreground/50" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            No Habits Today
          </h4>
          <p className="text-[11px] text-muted-foreground leading-normal mt-1 max-w-[200px]">
            No habits are scheduled for today. Rest and take a quiet moment for
            yourself.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/60 bg-card/60 backdrop-blur-xl shadow-lg flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/70">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Today's Routine</span>
        </div>
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
          <span>Daily Consistency</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Habits List Checklist */}
      <ScrollArea className="max-h-[220px]">
        <div className="space-y-2 pt-1 pr-3">
          <AnimatePresence mode="popLayout">
            {todaysHabits.map((habit) => {
              const completed = isCompletedToday(habit.id)
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/40 hover:bg-card/80 hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Custom Checkbox Button */}
                    <button
                      onClick={() => toggleCompletion(habit.id, today)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        completed
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20'
                          : 'border-muted-foreground/30 hover:border-primary/50'
                      }`}
                    >
                      {completed && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <span
                        onClick={() => toggleCompletion(habit.id, today)}
                        className={`text-xs font-bold leading-normal cursor-pointer transition-colors block truncate ${
                          completed
                            ? 'text-muted-foreground line-through decoration-muted-foreground/45'
                            : 'text-foreground'
                        }`}
                      >
                        {habit.name}
                      </span>
                      {habit.intention && (
                        <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">
                          "{habit.intention}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Streak Count Badge */}
                  {habit.currentStreak > 0 && (
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
                      <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                      <span className="font-mono text-[10px]">
                        {habit.currentStreak}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}
