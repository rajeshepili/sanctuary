import { motion, easeInOut } from 'framer-motion'

/**
 * A single bird silhouette with two independently-pivoting half-wings.
 * Each half-wing rotates around the body center point, creating a natural
 * flapping motion rather than a boomerang tilt.
 *
 * Physics:
 *  - Left wing extends LEFT from body. Rotating it CCW (negative) lifts the tip UP.
 *  - Right wing extends RIGHT from body. Rotating it CW (positive) lifts the tip UP.
 *  - Both are synced so tips rise and fall together.
 */
interface BirdProps {
  cx: number // body center X in SVG units
  cy: number // body center Y in SVG units
  span: number // half-wingspan (tip to body)
  color: string
  strokeWidth?: number
  opacity?: number
  duration?: number
  delay?: number
}

export function Bird({
  cx,
  cy,
  span,
  color,
  strokeWidth = 2,
  opacity = 1,
  duration = 1.4,
  delay = 0,
}: BirdProps) {
  const s = span
  const cpOffset = s * 0.35

  return (
    <g opacity={opacity}>
      {/* Left half-wing — pivots at body center, tips go UP on negative rotate */}
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        animate={{ rotate: [-22, 14, -22] }}
        transition={{ duration, repeat: Infinity, ease: easeInOut, delay }}
      >
        <path
          d={`M${cx},${cy} Q${cx - s * 0.5},${cy - cpOffset} ${cx - s},${cy}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </motion.g>

      {/* Right half-wing — mirrors left: tips go UP on positive rotate */}
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        animate={{ rotate: [22, -14, 22] }}
        transition={{ duration, repeat: Infinity, ease: easeInOut, delay }}
      >
        <path
          d={`M${cx},${cy} Q${cx + s * 0.5},${cy - cpOffset} ${cx + s},${cy}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </motion.g>

      {/* Tiny body dot */}
      <circle
        cx={cx}
        cy={cy}
        r={strokeWidth * 0.6}
        fill={color}
        opacity={0.6}
      />
    </g>
  )
}
