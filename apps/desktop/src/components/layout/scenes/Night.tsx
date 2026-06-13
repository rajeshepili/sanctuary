import { motion, easeInOut } from 'framer-motion'
import { ShootingStar } from './shared/ShootingStar'
import Moon from './shared/Moon'
import { SceneShell } from './shared/scene-shell'

const prng = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000
  return Number((x - Math.floor(x)).toFixed(4))
}

const DENSE_STARS = Array.from({ length: 40 }, (_, i) => ({
  x: Number((prng(i * 10 + 1) * 300).toFixed(4)),
  y: Number((prng(i * 10 + 2) * 300).toFixed(4)),
  r: Number((prng(i * 10 + 3) * 0.8 + 0.3).toFixed(4)),
  op: Number((prng(i * 10 + 4) * 0.6 + 0.2).toFixed(4)),
}))

const BRIGHT_STARS: [number, number, number][] = [
  [12, 18, 1.8],
  [25, 35, 1.5],
  [42, 12, 2.0],
  [68, 22, 1.6],
  [75, 8, 1.9],
  [88, 40, 1.5],
  [18, 55, 1.4],
  [58, 45, 1.7],
  [85, 65, 1.5],
]

export function Night() {
  return (
    <SceneShell mood="night">
      <div className="absolute inset-0 bg-linear-to-b from-[#010410] via-[#090e2b] to-[#0d1430]" />

      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
        <motion.svg
          className="absolute top-0 w-[150%] h-[60vh] left-[-25%]"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          animate={{ x: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 45, repeat: Infinity, ease: easeInOut }}
        >
          <path
            d="M0,150 C200,50 400,250 600,150 C800,50 1000,250 1200,150 L1200,0 L0,0 Z"
            fill="url(#auroraGradient)"
          />
          <defs>
            <linearGradient
              id="auroraGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: easeInOut }}
        className="absolute top-[71%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-blue-200/20 blur-[140px]"
      />
      <Moon className="absolute top-[71%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-[2.2]" />

      <div
        className="absolute top-[20%] left-[15%] w-[70vw] h-[50vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[20%] right-[10%] w-[65vw] h-[55vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(109,40,217,0.07) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="absolute inset-0 w-full h-full origin-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 800, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="stars-n"
              x="0"
              y="0"
              width="300"
              height="300"
              patternUnits="userSpaceOnUse"
            >
              {DENSE_STARS.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill={`rgba(255,255,255,${s.op})`}
                />
              ))}
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#stars-n)"
            opacity="0.8"
          />
        </svg>

        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {BRIGHT_STARS.map(([cx, cy, r], i) => (
            <motion.circle
              key={i}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r={r}
              fill="white"
              animate={{ opacity: [0.15, 0.95, 0.15] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: easeInOut,
                delay: i * 0.3,
              }}
            />
          ))}
        </svg>
      </motion.div>

      <svg
        className="absolute bottom-0 w-full h-[50vh]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="water-ripple"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1440"
            height="600"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.15"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur stdDeviation="0.5" in="displaced" />
          </filter>

          <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#040b20" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="moonReflection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#a5b4fc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>

          <mask id="smoothReflectionMask">
            <ellipse
              cx="720"
              cy="425"
              rx="250"
              ry="175"
              fill="white"
              style={{ filter: 'blur(25px)' }}
            />
          </mask>
        </defs>

        {/* Sea base */}
        <path fill="#040b20" d="M0,250 L1440,250 L1440,600 L0,600 Z" />

        {/* Wave layer 1 — slowest, deepest */}
        <motion.path
          fill="#06102e"
          d="M-400,310 Q0,290 400,310 T1200,310 T2000,310 L2000,600 L-400,600 Z"
          animate={{ x: [0, -200, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: easeInOut }}
        />

        {/* Wave layer 2 — medium speed, opposite direction */}
        <motion.path
          fill="#03091f"
          d="M-400,360 Q-100,340 200,360 T800,355 T1400,360 T2000,355 L2000,600 L-400,600 Z"
          animate={{ x: [0, 180, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: easeInOut }}
        />

        {/* Wave layer 3 — fastest, closest */}
        <motion.path
          fill="#020714"
          d="M-400,420 Q100,440 500,420 T1200,425 T2200,420 L2200,600 L-400,600 Z"
          animate={{ x: [0, -140, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: easeInOut }}
        />

        {/* Horizon mist */}
        <rect
          x="0"
          y="250"
          width="1440"
          height="150"
          fill="url(#horizonGlow)"
        />

        {/* Moon reflection */}
        <rect
          x="0"
          y="250"
          width="1440"
          height="350"
          fill="url(#moonReflection)"
          filter="url(#water-ripple)"
          mask="url(#smoothReflectionMask)"
          opacity="0.85"
        />

        {/* Corner mountains */}
        <path
          fill="#020512"
          fillOpacity="0.9"
          d="M0,250 L0,50 Q100,60 200,120 T400,250 Z"
        />
        <path
          fill="#020512"
          fillOpacity="0.9"
          d="M1440,250 L1440,80 Q1340,90 1240,150 T1040,250 Z"
        />

        {/* Sitting ledge */}
        <path
          fill="#010208"
          d="M0,450 Q200,450 400,520 T720,560 T1040,520 Q1240,450 1440,450 L1440,600 L0,600 Z"
        />
        <path
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          opacity="0.6"
          d="M0,450 Q200,450 400,520 T720,560 T1040,520 Q1240,450 1440,450"
        />

        {/* Immediate foreground rock */}
        <path
          fill="#000000"
          d="M0,520 Q200,520 400,580 T720,600 T1040,580 Q1240,520 1440,520 L1440,600 L0,600 Z"
        />
        <path
          stroke="#0f172a"
          strokeWidth="4"
          fill="none"
          opacity="0.5"
          d="M0,520 Q200,520 400,580 T720,600 T1040,580 Q1240,520 1440,520"
        />
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-linear-to-t from-indigo-950/60 to-transparent" />
      <motion.div
        animate={{ x: [-30, 30, -30] }}
        transition={{ duration: 40, repeat: Infinity, ease: easeInOut }}
        className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[35vh] bg-blue-900/30 blur-[90px] rounded-[100%] mix-blend-screen"
      />

      {Array.from({ length: 2 }).map((_, i) => (
        <ShootingStar key={i} index={i} />
      ))}
    </SceneShell>
  )
}
