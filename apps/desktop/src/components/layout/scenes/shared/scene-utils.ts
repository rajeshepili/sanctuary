import { easeInOut } from 'framer-motion'

export const ANIM = {
  breathe: {
    subtle: { duration: 18, repeat: Infinity, ease: easeInOut },
  },
  shimmer: {
    wave: { duration: 16, repeat: Infinity, ease: easeInOut },
  },
}

export const OPACITY = {
  faint: { min: 0.08, max: 0.16 },
  soft: { min: 0.12, max: 0.28 },
}
