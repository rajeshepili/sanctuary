import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ANIM, OPACITY } from './scene-utils'

/**
 * Animated light source (sun/moon)—centered and breathing
 */
interface AnimatedLightProps {
  position: { top: string; left: string }
  size: string
  color: string
  intensity?: 'soft' | 'moderate' | 'bright'
  blur?: number
}

export function AnimatedLight({
  position,
  size,
  color,
  intensity = 'moderate',
  blur = 70,
}: AnimatedLightProps) {
  const opacityRange = {
    soft: [0.4, 0.65, 0.4],
    moderate: [0.6, 0.85, 0.6],
    bright: [0.75, 1, 0.75],
  }

  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: opacityRange[intensity],
      }}
      transition={ANIM.breathe.subtle}
      className="absolute rounded-full"
      style={{
        top: position.top,
        left: position.left,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Wide glow */}
      <div
        className="absolute inset-[-180px] rounded-full mix-blend-lighten pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}/20, transparent)`,
          filter: `blur(120px)`,
        }}
      />

      {/* Main body */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: color,
          opacity: 0.7,
          filter: `blur(${blur}px)`,
        }}
      />

      {/* Core highlight */}
      <div
        className="absolute inset-[25%] rounded-full"
        style={{
          background: 'rgba(255,255,255,0.6)',
          filter: 'blur(12px)',
        }}
      />
    </motion.div>
  )
}

/**
 * Gentle fog/mist layer
 */
interface MistLayerProps {
  position: string
  height: string
  color?: string
  animationDuration?: number
  delay?: number
}

export function MistLayer({
  position,
  height,
  color = 'white',
  animationDuration = 24,
  delay = 0,
}: MistLayerProps) {
  return (
    <motion.div
      animate={{
        x: [-30, 30, -30],
        opacity: [OPACITY.soft.min, OPACITY.soft.max, OPACITY.soft.min],
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className="absolute left-[-5%] w-[110%] rounded-full"
      style={{
        bottom: position,
        height,
        background: `${color}/35`,
        filter: 'blur(36px)',
      }}
    />
  )
}

/**
 * Water shimmer with subtle ripple
 */
interface WaterShimmerProps {
  position: string
  height: string
  opacity?: number
}

export function WaterShimmer({
  position,
  height,
  opacity = OPACITY.faint.min,
}: WaterShimmerProps) {
  return (
    <motion.div
      animate={{
        x: [-15, 15, -15],
        opacity: [opacity, opacity * 2, opacity],
      }}
      transition={ANIM.shimmer.wave}
      className="absolute left-0 right-0"
      style={{
        bottom: position,
        height,
        background: `repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,0.22) 0px,
          rgba(255,255,255,0.22) 1px,
          transparent 2px,
          transparent 8px
        )`,
        filter: 'blur(1px)',
      }}
    />
  )
}

/**
 * Rising/floating particles (subtle depth)
 */
interface ParticleSystemProps {
  count?: number
  baseY?: number
  color?: string
}

export function ParticleSystem({
  count = 8,
  baseY = 55,
  color = 'white',
}: ParticleSystemProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + (i % 2)}px`,
            height: `${2 + (i % 2)}px`,
            left: `${8 + i * 7}%`,
            top: `${baseY + (i % 4) * 5}%`,
            background: `${color}/50`,
            filter: 'blur(2px)',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </>
  )
}

/**
 * Sky gradient base (for consistent layering)
 */
interface SkyBaseProps {
  variant: 'alpine-dawn' | 'desert-sunrise' | 'coastal-dawn'
  children?: ReactNode
}

const skyGradients = {
  'alpine-dawn': 'from-sky-200 via-cyan-100 to-emerald-50',
  'desert-sunrise': 'from-orange-100 via-amber-50 to-yellow-50',
  'coastal-dawn': 'from-sky-200 via-cyan-100 to-blue-200',
}

export function SkyBase({ variant, children }: SkyBaseProps) {
  return (
    <div className={`absolute inset-0 bg-linear-to-b ${skyGradients[variant]}`}>
      {children}
    </div>
  )
}

/**
 * Atmospheric glow layer (soft, non-directional)
 */
interface GlowLayerProps {
  position: string
  height: string
  color: string
}

export function GlowLayer({ position, height, color }: GlowLayerProps) {
  return (
    <motion.div
      animate={{
        opacity: [OPACITY.faint.min, OPACITY.faint.max, OPACITY.faint.min],
      }}
      transition={ANIM.breathe.subtle}
      className="absolute left-0 right-0 rounded-full"
      style={{
        top: position,
        height,
        background: `linear-gradient(to bottom, ${color}, transparent)`,
        filter: 'blur(40px)',
      }}
    />
  )
}
