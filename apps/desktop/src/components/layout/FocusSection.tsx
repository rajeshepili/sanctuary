import { motion } from 'framer-motion'

export function FocusSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="
        relative z-20 w-full
        bg-background/70
        backdrop-blur-3xl
        border-t border-border/20
        pt-32 pb-16
        min-h-dvh
      "
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="max-w-[80dvw] mx-auto px-6">{children}</div>
    </motion.div>
  )
}
