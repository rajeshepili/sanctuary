import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { useMood } from '#/hooks/use-mood'

interface LiveClockProps {
  use24Hour?: boolean
}

const moodStyles = {
  morning: {
    time: 'text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
    date: 'text-foreground/60',
  },
  day: {
    time: 'text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)]',
    date: 'text-foreground/70',
  },
  evening: {
    time: 'text-foreground/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]',
    date: 'text-foreground/60',
  },
  night: {
    time: 'text-foreground/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]',
    date: 'text-foreground/40',
  },
} as const

export const LiveClock = memo(function LiveClockComponent({
  use24Hour = false,
}: LiveClockProps) {
  const [time, setTime] = useState(() => new Date())
  const mood = useMood()

  const currentMoodStyle = moodStyles[mood]

  const scheduleNextRef = useRef<() => void>(() => {})

  const tick = () => {
    const now = new Date()
    setTime(now)

    const delay = getMsToNextMinute(now)

    scheduleNextRef.current = () => {
      tick()
    }

    setTimeout(() => {
      scheduleNextRef.current()
    }, delay)
  }

  useEffect(() => {
    const now = new Date()
    setTime(now)

    const delay = getMsToNextMinute(now)

    const id = setTimeout(() => tick(), delay)

    return () => clearTimeout(id)
  }, [])

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const timeFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    })
  }, [use24Hour])

  const formattedTime = timeFormatter.format(time)
  const formattedDate = dateFormatter.format(time)

  return (
    <div className="flex flex-col items-center text-center select-none space-y-1">
      <span
        className={`
          font-black
          text-3xl md:text-4xl
          tracking-tight
          ${currentMoodStyle.time}
        `}
      >
        {formattedTime}
      </span>

      <span
        className={`
          text-xs
          font-medium
          tracking-wide
          ${currentMoodStyle.date}
          uppercase
          drop-shadow-sm
        `}
      >
        {formattedDate}
      </span>
    </div>
  )
})

function getMsToNextMinute(now: Date) {
  return (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
}
