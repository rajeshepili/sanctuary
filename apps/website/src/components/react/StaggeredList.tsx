import { motion, spring } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: spring, stiffness: 100 } },
}

export function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className="space-y-4 pt-4"
    >
      {items.map((text, i) => (
        <motion.li
          key={i}
          variants={itemVariants}
          className="flex items-center gap-3 font-bold text-sm"
        >
          <CheckCircle2 className="text-primary w-5 h-5" />
          {text}
        </motion.li>
      ))}
    </motion.ul>
  )
}
