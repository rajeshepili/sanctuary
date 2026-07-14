import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'

const ANGLE_DEG = 30
const RAD = (ANGLE_DEG * Math.PI) / 180
const DISTANCE = 200

const DX = -(Math.cos(RAD) * DISTANCE)
const DY = Math.sin(RAD) * DISTANCE

const STREAK_LEN = 220
const STREAK_ROTATE = -ANGLE_DEG

function getSeededConfig(index: number) {
  const r = (seed: number) => {
    const x = Math.sin(seed + index) * 10000
    return Number((x - Math.floor(x)).toFixed(4))
  }
  return {
    x: Number((58 + r(1) * 32).toFixed(4)),
    y: Number((1 + r(2) * 13).toFixed(4)),
    delay: Number((0.5 + r(3) * 11).toFixed(4)),
    duration: Number((1.3 + r(4) * 0.7).toFixed(4)),
  }
}

function getRandomConfig() {
  return {
    x: 58 + Math.random() * 32,
    y: 1 + Math.random() * 13,
    delay: 0.5 + Math.random() * 11,
    duration: 1.3 + Math.random() * 0.7,
  }
}

export function ShootingStar({ index }: { index: number }) {
  const [cfg, setCfg] = useState(() => getSeededConfig(index))
  const [key, setKey] = useState(0)

  const handleComplete = useCallback(() => {
    setCfg(getRandomConfig())
    setKey((k) => k + 1)
  }, [])

  const gradId = `ss-g-${index}`

  return (
    <motion.div
      key={key}
      className="absolute overflow-visible pointer-events-none"
      style={{ left: `${cfg.x}%`, top: `${cfg.y}%` }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: DX,
        y: DY,
        opacity: [0, 0.85, 0.85, 0],
      }}
      transition={{
        duration: cfg.duration,
        delay: cfg.delay,
        ease: 'linear',
        opacity: {
          duration: cfg.duration,
          delay: cfg.delay,
          times: [0, 0.18, 0.78, 1],
          ease: 'linear',
        },
      }}
      onAnimationComplete={handleComplete}
    >
      <div
        style={{
          transform: `rotate(${STREAK_ROTATE}deg)`,
          transformOrigin: '0 50%',
        }}
      >
        <svg
          width={STREAK_LEN}
          height={5}
          viewBox={`0 0 ${STREAK_LEN} 5`}
          overflow="visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <stop offset="30%" stopColor="white" stopOpacity="0.6" />
              <stop offset="70%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect
            x={0}
            y={1.5}
            width={STREAK_LEN}
            height={2}
            rx={1}
            fill={`url(#${gradId})`}
          />

          <ellipse cx={4} cy={2.5} rx={10} ry={5} fill="white" opacity={0.12} />
        </svg>

        {/* Bright glowing dot at the head */}
        <div
          style={{
            position: 'absolute',
            left: -1,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 6px 3px rgba(180, 210, 255, 0.65)',
          }}
        />
      </div>
    </motion.div>
  )
}
