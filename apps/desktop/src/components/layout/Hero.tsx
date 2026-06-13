import { motion } from 'framer-motion'
import { PageHeader } from './PageHeader'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  description: string
  icon?: LucideIcon
  greeting?: string
  children?: React.ReactNode
}

export function Hero({ title, description, greeting, children }: Props) {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col min-h-dvh px-6 pb-12">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 mt-8">
        <PageHeader
          title={title}
          description={description}
          greeting={greeting}
        />

        {children}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="flex justify-center mt-auto pb-4"
      >
        <div className="w-px h-12 bg-linear-to-b from-primary/50 to-transparent" />
      </motion.div>
    </div>
  )
}
