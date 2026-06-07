import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { Sprout } from 'lucide-react'

import { HabitCard } from './HabitCard'
import { buildCompletionMap } from '#/features/habits/habits.selectors'
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '#/components/ui/empty'

import type { Habit, HabitCompletion } from '#/types'

interface HabitsListProps {
  habitsList: Habit[]
  completions: HabitCompletion[]

  onToggleDate: (
    habitId: number,
    dateStr: string,
  ) => Promise<{
    habitId: number
    date: string
    completed: boolean
  }>

  onUpdateStatus: (id: number, status: 'active' | 'resting') => Promise<Habit>

  onDeleteHabit: (id: number) => Promise<void>
}

export function HabitsList({
  habitsList,
  completions,
  onToggleDate,
  onUpdateStatus,
  onDeleteHabit,
}: HabitsListProps) {
  const completionsMap = useMemo(
    () => buildCompletionMap(completions),
    [completions],
  )

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {habitsList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Empty className="p-12 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sprout className="w-12 h-12 text-accent-foreground/80" />
                </EmptyMedia>
                <EmptyTitle>No habits yet</EmptyTitle>
                <EmptyDescription>
                  Establish a new habit above to start tracking your daily
                  progress and building consistency.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </motion.div>
        ) : (
          habitsList.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completionSet={completionsMap.get(habit.id) ?? new Set()}
              onToggleDate={onToggleDate}
              onUpdateStatus={onUpdateStatus}
              onDeleteHabit={onDeleteHabit}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
