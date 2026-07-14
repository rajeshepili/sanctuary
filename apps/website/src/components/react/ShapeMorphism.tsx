import { motion } from 'framer-motion'

export function ShapeMorphism() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
      <motion.div
        className="w-[40vw] h-[40vw] max-w-2xl max-h-2xl bg-primary/10 blur-3xl absolute mix-blend-screen"
        animate={{
          borderRadius: [
            '40% 60% 70% 30% / 40% 50% 60% 50%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '40% 60% 70% 30% / 40% 50% 60% 50%',
          ],
          rotate: [0, 90, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="w-[30vw] h-[30vw] max-w-xl max-h-xl bg-secondary/10 blur-3xl absolute mix-blend-screen -translate-x-1/4 translate-y-1/4"
        animate={{
          borderRadius: [
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '40% 60% 70% 30% / 40% 50% 60% 50%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
          ],
          rotate: [0, -90, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
