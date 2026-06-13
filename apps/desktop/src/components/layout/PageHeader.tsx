import { motion } from 'framer-motion'
import { LiveClock } from './Clock'

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
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-2"
    >
      {/* Optional personalised greeting */}
      {greeting && (
        <p className="text-sm font-semibold text-foreground/90 drop-shadow-sm tracking-wide">
          {greeting}
        </p>
      )}

      {/* Main title */}
      <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)]">
        {title}
      </h1>

      {/* Description */}
      <p className="text-sm font-medium text-foreground max-w-md mx-auto mb-2 drop-shadow-sm">
        {description}
      </p>

      {/* Clock */}
      <LiveClock use24Hour={use24Hour} />
    </motion.div>
  )
}
