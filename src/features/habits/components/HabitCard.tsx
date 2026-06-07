import { memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '#/components/ui/card'
import { Trash2, Flame, Trophy, Moon, Sun } from 'lucide-react'
import { format } from 'date-fns'
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
import { IconButton } from '#/components/ui/icon-button'

import {
  isScheduledOn,
  getLast30DaysList,
  getTodayStr,
  fromLocalDateString,
} from '#/utils/streak'

import { formatScheduleLabel } from '#/utils/habits'

import type { Habit, HabitStatus } from '#/types'

import { HabitDayCell } from '#/features/habits/components/HabitDayCell'

interface HabitCardProps {
  habit: Habit
  completionSet: Set<string>

  onToggleDate: (habitId: number, dateStr: string) => Promise<any>

  onUpdateStatus: (id: number, status: HabitStatus) => Promise<Habit>

  onDeleteHabit: (id: number) => Promise<void>
}

export const HabitCard = memo(function HabitCardComponent({
  habit,
  completionSet,
  onToggleDate,
  onUpdateStatus,
  onDeleteHabit,
}: HabitCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const today = getTodayStr()

  const scheduleLabel = useMemo(() => formatScheduleLabel(habit), [habit])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="p-6 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md shadow-sm transition-all duration-300 relative group overflow-hidden space-y-6">
        {/* Header */}

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-xl font-bold leading-none transition-colors ${
                  habit.status === 'resting'
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                }`}
              >
                {habit.name}
              </h2>

              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-border/50 bg-foreground/5 text-muted-foreground">
                {habit.category}
              </span>

              {habit.status === 'resting' && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                  Resting
                </span>
              )}
            </div>

            {habit.intention && (
              <p className="text-sm italic font-serif text-muted-foreground border-l-2 border-primary/30 pl-2">
                "{habit.intention}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              tooltip={
                habit.status === 'active' ? 'Rest habit' : 'Awaken habit'
              }
              onClick={() =>
                onUpdateStatus(
                  habit.id,
                  habit.status === 'active' ? 'resting' : 'active',
                )
              }
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {habit.status === 'active' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </IconButton>

            <IconButton
              tooltip="Delete habit"
              variant="danger"
              onClick={() => setConfirmDelete(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </IconButton>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{habit.name}"? This will
                    permanently erase its history and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteHabit(habit.id)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Metrics */}

        <div className="flex flex-wrap gap-3 items-center text-xs font-bold">
          <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{habit.currentStreak} day current streak</span>
          </div>

          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
            <Trophy className="w-3.5 h-3.5" />
            <span>{habit.longestStreak} day max streak</span>
          </div>

          <div className="text-muted-foreground/80 bg-foreground/5 px-3 py-1 rounded-full">
            {completionSet.size} completions total
          </div>

          <div className="text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full capitalize">
            {scheduleLabel}
          </div>
        </div>

        {/* Grid */}

        {habit.status === 'active' && (
          <div className="space-y-3 pt-5 mt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>30-Day History</span>
              <span className="opacity-60 normal-case font-medium">
                Tap or click to toggle
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {getLast30DaysList().map((dayStr) => {
                const isCompleted = completionSet.has(dayStr)
                const isToday = dayStr === today
                const activeOnDate = isScheduledOn(
                  dayStr,
                  habit.frequency,
                  habit.daysOfWeek,
                )
                const dateObj = fromLocalDateString(dayStr)

                return (
                  <HabitDayCell
                    key={dayStr}
                    dayStr={dayStr}
                    isCompleted={isCompleted}
                    isToday={isToday}
                    activeOnDate={activeOnDate}
                    dateLabel={format(dateObj, 'MMM d')}
                    dayNumber={dateObj.getDate()}
                    onToggle={(day) => onToggleDate(habit.id, day)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
})
