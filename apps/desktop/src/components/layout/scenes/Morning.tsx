import { motion, easeInOut } from 'framer-motion'
import { Bird } from './shared/Bird'
import { SceneShell } from './shared/scene-shell'

export function Morning() {
  return (
    <SceneShell mood="morning">
      <div className="absolute inset-0 bg-linear-to-b from-amber-100/90 via-orange-50/70 to-sky-100/80" />

      <motion.div
        animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: easeInOut }}
        className="absolute left-[30%] bottom-[30%] -translate-x-1/2 w-[70vw] h-[70vw] rounded-full bg-amber-300/40 blur-[120px]"
      />

      <svg
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ray-m" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polygon
          points="0,0 20%,0 100%,100% 0,100%"
          fill="url(#ray-m)"
          animate={{ opacity: [0.3, 0.5, 0.3], skewX: [0, 2, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: easeInOut }}
        />
        <motion.polygon
          points="40%,0 60%,0 100%,80% 50%,100%"
          fill="url(#ray-m)"
          animate={{ opacity: [0.1, 0.3, 0.1], skewX: [0, -1, 0] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: easeInOut,
            delay: 5,
          }}
        />
      </svg>

      <svg
        className="absolute bottom-0 w-full h-[55vh]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#fbcfe8"
          fillOpacity="0.8"
          d="M0,128L48,138.7C96,149,192,171,288,160C384,149,480,107,576,101.3C672,96,768,128,864,160C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <path
          fill="#f87171"
          fillOpacity="0.6"
          d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,218.7C840,235,960,245,1080,240C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
        <path
          fill="#d97706"
          fillOpacity="0.5"
          d="M0,256L80,245.3C160,235,320,213,480,218.7C640,224,800,256,960,261.3C1120,267,1280,245,1360,234.7L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-linear-to-t from-orange-50/90 via-white/50 to-transparent" />
      <motion.div
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 30, repeat: Infinity, ease: easeInOut }}
        className="absolute bottom-[-10%] left-[0%] w-[120%] h-[25vh] bg-white/60 blur-[80px] rounded-[100%]"
      />

      {/* Flock 1 */}
      <motion.div
        className="absolute top-[20%] left-[-10%]"
        animate={{
          x: ['-10vw', '120vw'],
          y: [0, -100, 20],
          opacity: [0, 0.8, 0],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          width="180"
          height="70"
          viewBox="0 0 180 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Bird
            cx={20}
            cy={30}
            span={18}
            color="#78350f"
            strokeWidth={2.0}
            opacity={0.85}
            duration={1.3}
            delay={0.0}
          />
          <Bird
            cx={60}
            cy={15}
            span={15}
            color="#78350f"
            strokeWidth={1.8}
            opacity={0.7}
            duration={1.5}
            delay={0.2}
          />
          <Bird
            cx={95}
            cy={42}
            span={16}
            color="#78350f"
            strokeWidth={1.8}
            opacity={0.75}
            duration={1.4}
            delay={0.4}
          />
          <Bird
            cx={140}
            cy={20}
            span={13}
            color="#78350f"
            strokeWidth={1.5}
            opacity={0.55}
            duration={1.6}
            delay={0.1}
          />
        </svg>
      </motion.div>

      {/* Flock 2 — smaller, further back */}
      <motion.div
        className="absolute top-[35%] left-[-20%]"
        animate={{
          x: ['-20vw', '120vw'],
          y: [0, 80, -20],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
          delay: 15,
        }}
      >
        <svg
          width="120"
          height="50"
          viewBox="0 0 120 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Bird
            cx={15}
            cy={20}
            span={12}
            color="#92400e"
            strokeWidth={1.5}
            opacity={0.8}
            duration={1.1}
            delay={0.0}
          />
          <Bird
            cx={50}
            cy={35}
            span={10}
            color="#92400e"
            strokeWidth={1.3}
            opacity={0.7}
            duration={1.3}
            delay={0.3}
          />
          <Bird
            cx={80}
            cy={15}
            span={11}
            color="#92400e"
            strokeWidth={1.3}
            opacity={0.6}
            duration={1.2}
            delay={0.1}
          />
        </svg>
      </motion.div>

      <div
        className="absolute top-0 left-0 w-[40vw] max-w-[400px] opacity-[0.25]"
        style={{ filter: 'blur(5px)' }}
      >
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMinYMin meet"
        >
          <path
            d="M0,0 L400,0 C380,40 320,60 280,100 C240,140 260,200 200,240 C140,280 80,260 40,320 C20,350 10,380 0,400 Z"
            fill="#78350f"
          />
          <path
            d="M0,0 L250,0 C220,50 180,80 120,120 C80,150 40,130 0,200 Z"
            fill="#451a03"
          />
        </svg>
      </div>
    </SceneShell>
  )
}
