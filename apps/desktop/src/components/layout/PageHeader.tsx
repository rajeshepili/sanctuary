import { motion, AnimatePresence } from 'framer-motion'
import { LiveClock } from './Clock'
import { useState, useEffect } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  greeting?: string
  use24Hour?: boolean
}

export function PageHeader({
  title,
  description,
  greeting,
  use24Hour = false,
}: PageHeaderProps) {
  const [showGreeting, setShowGreeting] = useState(true)

  useEffect(() => {
    if (!greeting) return
    const timer = setTimeout(() => setShowGreeting(false), 5000)
    return () => clearTimeout(timer)
  }, [greeting])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-2"
    >
      <div className="h-5">
        <AnimatePresence>
          {greeting && showGreeting && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-foreground/90 drop-shadow-sm tracking-wide"
            >
              {greeting}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)]">
        {title}
      </h1>

      <p className="text-sm font-medium text-foreground max-w-md mx-auto mb-2 drop-shadow-sm">
        {description}
      </p>

      <LiveClock use24Hour={use24Hour} />
    </motion.div>
  )
}
