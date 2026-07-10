import { motion, easeInOut } from 'framer-motion'
import { SceneShell } from './shared/scene-shell'

const prng = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000
  return Number((x - Math.floor(x)).toFixed(4))
}

const POLLEN = Array.from({ length: 15 }, (_, i) => ({
  startY: Number((prng(i * 10 + 1) * 80 + 20).toFixed(4)),
  midY: Number((prng(i * 10 + 2) * 80 + 10).toFixed(4)),
  endY: Number((prng(i * 10 + 3) * 80 + 30).toFixed(4)),
  scale: Number((prng(i * 10 + 4) * 1.5 + 0.5).toFixed(4)),
  opacity: Number((prng(i * 10 + 5) * 0.7 + 0.3).toFixed(4)),
  duration: Number((prng(i * 10 + 6) * 20 + 25).toFixed(4)),
  delay: Number((prng(i * 10 + 7) * 20).toFixed(4)),
}))

const SUN_RAYS = [0, 60, 120, 180, 240, 300].map((deg, i) => {
  const rad = (deg * Math.PI) / 180
  const len = 90 + (i % 3) * 15
  return {
    x1: Number((125 + Math.cos(rad) * 65).toFixed(4)),
    y1: Number((125 + Math.sin(rad) * 65).toFixed(4)),
    x2: Number((125 + Math.cos(rad) * len).toFixed(4)),
    y2: Number((125 + Math.sin(rad) * len).toFixed(4)),
    thick: i % 2 === 0,
  }
})

export function Day() {
  return (
    <SceneShell mood="day" grainOpacity={0.03}>
      <div className="absolute inset-0 bg-linear-to-b from-sky-300/90 via-sky-100/70 to-emerald-50/80" />

      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-yellow-100/60 blur-[130px]" />
      <motion.div
        className="absolute top-[8%] right-[12%]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
        style={{ opacity: 0.2 }}
      >
        <svg
          width="250"
          height="250"
          viewBox="0 0 250 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.g
            animate={{ opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: easeInOut }}
          >
            {SUN_RAYS.map((ray, i) => (
              <line
                key={i}
                x1={ray.x1}
                y1={ray.y1}
                x2={ray.x2}
                y2={ray.y2}
                stroke="#f59e0b"
                strokeWidth={ray.thick ? 4 : 2}
                strokeLinecap="round"
              />
            ))}
          </motion.g>
          <circle cx="125" cy="125" r="55" fill="#fbbf24" opacity="0.9" />
          <circle cx="110" cy="110" r="20" fill="#fde68a" opacity="0.7" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: [-50, 100, -50] }}
        transition={{ duration: 120, repeat: Infinity, ease: easeInOut }}
        className="absolute top-[15%] left-[5%] opacity-60"
        style={{ filter: 'blur(4px)' }}
      >
        <svg
          width="350"
          height="150"
          viewBox="0 0 350 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100,120 Q80,120 80,100 Q80,70 120,70 Q130,30 180,30 Q220,30 240,60 Q280,60 280,90 Q280,120 250,120 Z"
            fill="#ffffff"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: [50, -100, 50] }}
        transition={{
          duration: 150,
          repeat: Infinity,
          ease: easeInOut,
          delay: 10,
        }}
        className="absolute top-[35%] right-[10%] opacity-50"
        style={{ filter: 'blur(6px)' }}
      >
        <svg
          width="400"
          height="180"
          viewBox="0 0 400 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M120,150 Q90,150 90,120 Q90,80 140,80 Q160,40 220,40 Q280,40 290,80 Q330,80 330,120 Q330,150 290,150 Z"
            fill="#ffffff"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-[30%] left-[60%]"
        animate={{ y: [0, -20, 0], x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 60, repeat: Infinity, ease: easeInOut }}
      >
        <svg
          width="24"
          height="34"
          viewBox="0 0 24 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-40"
        >
          <path
            d="M12,0 C20,0 24,6 24,14 C24,22 16,28 12,28 C8,28 0,22 0,14 C0,6 4,0 12,0 Z"
            fill="#f87171"
          />
          <path
            d="M12,0 C16,0 18,6 18,14 C18,22 14,28 12,28 C10,28 6,22 6,14 C6,6 8,0 12,0 Z"
            fill="#fca5a5"
          />
          <rect x="9" y="30" width="6" height="4" fill="#78350f" />
          <line
            x1="10"
            y1="28"
            x2="10"
            y2="30"
            stroke="#78350f"
            strokeWidth="0.5"
          />
          <line
            x1="14"
            y1="28"
            x2="14"
            y2="30"
            stroke="#78350f"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      <svg
        className="absolute bottom-0 w-full h-[60vh]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#6ee7b7"
          fillOpacity="0.7"
          d="M0,192L48,202.7C96,213,192,235,288,234.7C384,235,480,213,576,213.3C672,213,768,235,864,240C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <path
          fill="#34d399"
          fillOpacity="0.5"
          d="M0,160L60,176C120,192,240,224,360,218.7C480,213,600,171,720,165.3C840,160,960,192,1080,197.3C1200,203,1320,181,1380,170.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
        <path
          fill="#10b981"
          fillOpacity="0.4"
          d="M0,256L80,245.3C160,235,320,213,480,197.3C640,181,800,171,960,181.3C1120,192,1280,224,1360,240L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </svg>

      <motion.div
        animate={{ rotate: [-1, 2, -1] }}
        transition={{ duration: 8, repeat: Infinity, ease: easeInOut }}
        className="absolute top-0 left-0 w-[50vw] max-w-[500px] opacity-[0.25]"
        style={{ transformOrigin: 'top left', filter: 'blur(5px)' }}
      >
        <svg
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMinYMin meet"
        >
          <path
            d="M0,0 L300,0 C250,50 280,100 200,150 C150,180 180,250 100,300 C50,350 20,450 0,500 Z"
            fill="#047857"
          />
          <path
            d="M0,0 L180,0 C150,50 160,80 100,120 C50,160 30,220 0,280 Z"
            fill="#064e3b"
          />
        </svg>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-[25vh] bg-linear-to-t from-emerald-100/70 to-transparent" />
      <motion.div
        animate={{ x: [-20, 20, -20], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: easeInOut }}
        className="absolute bottom-[-10%] right-[10%] w-[60vw] h-[30vh] rounded-[100%] bg-emerald-300/30 blur-[100px]"
      />

      <div className="absolute inset-0 pointer-events-none">
        {POLLEN.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/80 blur-[1px]"
            initial={{
              x: '-10vw',
              y: `${p.startY}vh`,
              scale: p.scale,
              opacity: 0,
            }}
            animate={{
              x: '120vw',
              y: [`${p.startY}vh`, `${p.midY}vh`, `${p.endY}vh`],
              opacity: [0, p.opacity, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay,
            }}
          />
        ))}
      </div>
    </SceneShell>
  )
}
