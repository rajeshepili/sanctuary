import { motion, easeInOut } from 'framer-motion'
import { Bird } from './shared/Bird'
import { SceneShell } from './shared/scene-shell'

const prng = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000
  return Number((x - Math.floor(x)).toFixed(4))
}

const FIREFLIES = Array.from({ length: 20 }, (_, i) => ({
  startX: Number((prng(i * 10 + 1) * 100).toFixed(4)),
  endX: Number((prng(i * 10 + 2) * 100).toFixed(4)),
  endY: Number((prng(i * 10 + 3) * 50 + 40).toFixed(4)),
  scale: Number((prng(i * 10 + 4) * 1 + 0.5).toFixed(4)),
  opacity: Number((prng(i * 10 + 5) * 0.9 + 0.2).toFixed(4)),
  duration: Number((prng(i * 10 + 6) * 15 + 15).toFixed(4)),
  delay: Number((prng(i * 10 + 7) * 15).toFixed(4)),
}))

export function Evening() {
  return (
    <SceneShell mood="evening" grainOpacity={0.045}>
      <div className="absolute inset-0 bg-linear-to-b from-indigo-950/90 via-purple-900/70 to-rose-400/70" />

      <div className="absolute bottom-[10%] left-[40%] -translate-x-1/2 w-[65vw] h-[45vw] blur-[120px]">
        <motion.div
          animate={{
            y: [0, 15, 0],
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: easeInOut }}
          className="w-full h-full rounded-full bg-orange-500/50"
        />
      </div>
      <div className="absolute bottom-[-5%] left-[10%] w-[80vw] h-[50vh] blur-[110px]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 25, repeat: Infinity, ease: easeInOut }}
          className="w-full h-full rounded-[100%] bg-rose-600/40"
        />
      </div>

      <motion.div
        animate={{ x: [-30, 30, -30] }}
        transition={{ duration: 100, repeat: Infinity, ease: easeInOut }}
        className="absolute top-[20%] left-[5%] opacity-40 mix-blend-overlay"
        style={{ filter: 'blur(8px)' }}
      >
        <svg
          width="500"
          height="200"
          viewBox="0 0 500 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M120,160 Q80,160 80,120 Q80,70 140,70 Q160,20 220,20 Q280,20 300,60 Q360,60 360,100 Q360,140 320,160 Z"
            fill="#fca5a5"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: [30, -40, 30] }}
        transition={{
          duration: 140,
          repeat: Infinity,
          ease: easeInOut,
          delay: 10,
        }}
        className="absolute top-[10%] right-[5%] opacity-30 mix-blend-overlay"
        style={{ filter: 'blur(12px)' }}
      >
        <svg
          width="600"
          height="250"
          viewBox="0 0 600 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M150,200 Q100,200 100,150 Q100,90 170,90 Q190,30 270,30 Q350,30 370,80 Q450,80 450,130 Q450,180 400,200 Z"
            fill="#fbcfe8"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-[20%] left-[-15%]"
        animate={{
          x: ['-15vw', '120vw'],
          y: [0, -80, 20],
          opacity: [0, 0.85, 0],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: 'linear',
          delay: 2,
        }}
      >
        <svg
          width="200"
          height="90"
          viewBox="0 0 200 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Bird
            cx={25}
            cy={45}
            span={20}
            color="#1e1b4b"
            strokeWidth={2.5}
            opacity={0.9}
            duration={1.6}
            delay={0.0}
          />
          <Bird
            cx={75}
            cy={15}
            span={17}
            color="#1e1b4b"
            strokeWidth={2.0}
            opacity={0.75}
            duration={1.4}
            delay={0.3}
          />
          <Bird
            cx={115}
            cy={60}
            span={18}
            color="#1e1b4b"
            strokeWidth={2.0}
            opacity={0.8}
            duration={1.8}
            delay={0.5}
          />
          <Bird
            cx={165}
            cy={30}
            span={15}
            color="#1e1b4b"
            strokeWidth={1.5}
            opacity={0.6}
            duration={1.5}
            delay={0.2}
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-[12%] right-[15%]"
        animate={{ opacity: [0.15, 0.3, 0.15], y: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: easeInOut }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M65 15 A 38 38 0 1 0 65 85 A 28 28 0 1 1 65 15 Z"
            fill="#fef3c7"
            opacity="0.95"
          />
          <circle cx="45" cy="50" r="35" fill="#fef3c7" opacity="0.15" />
        </svg>
      </motion.div>

      <svg
        className="absolute bottom-0 w-full h-[55vh]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4c1d95"
          fillOpacity="0.7"
          d="M0,192L60,208C120,224,240,256,360,256C480,256,600,224,720,208C840,192,960,192,1080,213.3C1200,235,1320,277,1380,298.7L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
        <path
          fill="#312e81"
          fillOpacity="0.85"
          d="M0,224L80,234.7C160,245,320,267,480,256C640,245,800,203,960,208C1120,213,1280,267,1360,293.3L1440,320L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
        <path
          fill="#1e1b4b"
          fillOpacity="1.0"
          d="M0,256L120,277.3C240,299,480,341,720,320C960,299,1200,213,1320,170.7L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        />
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {FIREFLIES.map((f, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-orange-300/90 blur-[1.5px]"
            initial={{
              x: `${f.startX}vw`,
              y: '110vh',
              scale: f.scale,
              opacity: 0,
            }}
            animate={{
              y: ['110vh', `${f.endY}vh`],
              x: [`${f.startX}vw`, `${f.endX}vw`],
              opacity: [0, f.opacity, 0],
            }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: f.delay,
            }}
          />
        ))}
      </div>
    </SceneShell>
  )
}
