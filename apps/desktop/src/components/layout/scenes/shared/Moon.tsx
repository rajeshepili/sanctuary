import { motion, easeInOut } from 'framer-motion'

export default function Moon({
  className = 'absolute top-[7%] right-[10%]',
}: {
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 10, repeat: Infinity, ease: easeInOut }}
    >
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="pureMoonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="65%" stopColor="#f8fafc" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#e2e8f0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Outer soft edge */}
        <circle cx="80" cy="80" r="75" fill="url(#pureMoonGlow)" />
        {/* Intense, pure white core */}
        <circle cx="80" cy="80" r="60" fill="#ffffff" />
      </svg>
    </motion.div>
  )
}
