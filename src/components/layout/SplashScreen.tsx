"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useMemo } from "react"

// Floating particle component for ambient AI atmosphere
function Particle({ delay, duration, x, y, size }: { delay: number; duration: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        scale: [0.5, 1, 0.8, 1, 0.5],
        x: [x, x + 30, x - 20, x + 10, x],
        y: [y, y - 40, y - 80, y - 120, y - 160],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(223,0,89,0.8) 0%, rgba(224,110,156,0.4) 50%, transparent 100%)`,
        filter: `blur(${size > 3 ? 1 : 0}px)`,
      }}
    />
  )
}

// Neural connection line
function NeuralLine({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) {
  return (
    <motion.line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke="url(#neural-gradient)"
      strokeWidth="0.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.3, 0.3, 0] }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

export function SplashScreen() {
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(true)
  const [phase, setPhase] = useState(0) // 0: init, 1: logo, 2: text, 3: ready

  useEffect(() => {
    setMounted(true)
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 800)
    const t3 = setTimeout(() => setPhase(3), 1400)
    const t4 = setTimeout(() => setShow(false), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  // Generate stable particles
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1.5,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 5,
    })), [])

  // Neural network connection points
  const neuralLines = useMemo(() => [
    { x1: 10, y1: 20, x2: 35, y2: 40, delay: 0 },
    { x1: 65, y1: 15, x2: 50, y2: 45, delay: 0.8 },
    { x1: 80, y1: 30, x2: 60, y2: 55, delay: 1.6 },
    { x1: 20, y1: 70, x2: 45, y2: 50, delay: 2.4 },
    { x1: 75, y1: 75, x2: 55, y2: 50, delay: 1.2 },
    { x1: 30, y1: 85, x2: 50, y2: 60, delay: 2.0 },
    { x1: 85, y1: 55, x2: 65, y2: 45, delay: 0.4 },
    { x1: 15, y1: 45, x2: 40, y2: 50, delay: 3.0 },
  ], [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#FFE9F2' }}
        >
          {/* === LAYER 1: Deep Gradient Mesh Background === */}
          <div className="absolute inset-0">
            {/* Primary deep gradient */}
            <div className="absolute inset-0" style={{
              background: `
                radial-gradient(ellipse 80% 55% at 50% 38%, rgba(255,255,255,0.92) 0%, rgba(255,233,242,0.72) 48%, transparent 72%),
                radial-gradient(ellipse 55% 70% at 18% 78%, rgba(223,0,89,0.24) 0%, transparent 54%),
                radial-gradient(ellipse 55% 70% at 85% 18%, rgba(224,110,156,0.32) 0%, transparent 56%),
                linear-gradient(180deg, #FFFFFF 0%, #FFE9F2 46%, #F5CFDE 100%)
              `
            }} />
          </div>

          {/* === LAYER 2: Aurora Flowing Light === */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(ellipse 100% 42% at 30% 50%, rgba(223,0,89,0.16) 0%, transparent 70%)',
                'radial-gradient(ellipse 100% 42% at 70% 50%, rgba(224,110,156,0.20) 0%, transparent 70%)',
                'radial-gradient(ellipse 100% 42% at 50% 50%, rgba(255,193,7,0.16) 0%, transparent 70%)',
                'radial-gradient(ellipse 100% 42% at 30% 50%, rgba(223,0,89,0.16) 0%, transparent 70%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />

          {/* === LAYER 3: Ambient Light Orbs === */}
          <motion.div
            animate={{
              x: [0, 30, -20, 10, 0],
              y: [0, -20, 10, -30, 0],
              scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(223,0,89,0.42) 0%, rgba(223,0,89,0.16) 42%, transparent 72%)',
              filter: 'blur(60px)',
            }}
          />
          <motion.div
            animate={{
              x: [0, -25, 15, -10, 0],
              y: [0, 15, -25, 20, 0],
              scale: [1, 0.9, 1.15, 0.95, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full opacity-45"
            style={{
              background: 'radial-gradient(circle, rgba(224,110,156,0.42) 0%, rgba(224,110,156,0.14) 42%, transparent 72%)',
              filter: 'blur(50px)',
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1, 1.2, 1],
              opacity: [0.18, 0.32, 0.18, 0.24, 0.18],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,193,7,0.20) 0%, transparent 60%)',
              filter: 'blur(80px)',
            }}
          />

          {/* === LAYER 4: Neural Network Lines === */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.22 }}>
            <defs>
              <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(223,0,89,0.6)" />
                <stop offset="50%" stopColor="rgba(224,110,156,0.4)" />
                <stop offset="100%" stopColor="rgba(255,193,7,0.2)" />
              </linearGradient>
            </defs>
            {neuralLines.map((line, i) => (
              <NeuralLine key={i} {...line} />
            ))}
          </svg>

          {/* === LAYER 5: Floating Particles === */}
          <div className="absolute inset-0 overflow-hidden">
            {mounted && particles.map(p => (
              <Particle key={p.id} {...p} />
            ))}
          </div>

          {/* === LAYER 6: Grid Overlay (subtle fintech dashboard feel) === */}
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(204,13,90,0.22) 1px, transparent 1px),
                linear-gradient(90deg, rgba(204,13,90,0.22) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* === MAIN CONTENT === */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Logo Container — Glassmorphism Hero */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={phase >= 1 ? { scale: 1, opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-8"
            >
              {/* Outer glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 rounded-[32px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(223,0,89,0.34), rgba(224,110,156,0.24), rgba(255,193,7,0.18))',
                  filter: 'blur(20px)',
                }}
              />

              {/* Secondary pulse ring */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -inset-8 rounded-[40px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(223,0,89,0.18), transparent, rgba(224,110,156,0.14))',
                  filter: 'blur(30px)',
                }}
              />

              {/* Glass card container */}
              <div className="relative w-28 h-28 rounded-[28px] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #DF0059 0%, #CC0D5A 62%, #221F20 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.5),
                    0 0 36px rgba(223,0,89,0.20),
                    0 24px 60px rgba(204,13,90,0.22),
                    inset 0 1px 0 rgba(255,255,255,0.22)
                  `,
                }}
              >
                {/* Animated border gradient */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-[1px] rounded-[28px]"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(255,255,255,0.78), transparent, rgba(255,193,7,0.38), transparent, rgba(255,255,255,0.62), transparent, rgba(255,255,255,0.78))',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1.5px',
                  }}
                />

                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full h-full flex items-center justify-center p-3"
                >
                  <div className="text-center leading-none">
                    <div className="text-3xl font-black text-white">BeU</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#FFE9F2]">NextGen</div>
                  </div>
                </motion.div>

                {/* Glass reflection */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 50%)',
                  }}
                />
              </div>
            </motion.div>

            {/* Title: BeU NextGen */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <h1
                className="text-4xl font-black tracking-tight mb-2"
                style={{
                  background: 'linear-gradient(135deg, #DF0059 0%, #CC0D5A 52%, #221F20 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 12px 30px rgba(223,0,89,0.22))',
                }}
              >
                NextGen
              </h1>

              {/* Subtitle: AGENT */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={phase >= 2 ? { opacity: 1, letterSpacing: '0.35em' } : {}}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="text-[11px] font-semibold uppercase text-[#CC0D5A]/70"
              >
                TEAM ITC
              </motion.p>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="mt-6 text-[10px] text-[#727272] font-semibold tracking-wider text-center max-w-[220px]"
            >
              AI-powered financial companion for youth money habits
            </motion.p>
          </div>

          {/* === LOADING INDICATOR — AI Pulse Ring === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="absolute bottom-16 flex flex-col items-center gap-4"
          >
            {/* Thin gradient progress line */}
            <div className="w-32 h-[2px] rounded-full overflow-hidden bg-[#DF0059]/10">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(223,0,89,0.95), rgba(224,110,156,0.72), transparent)',
                }}
              />
            </div>

            {/* Subtle pulse dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.8, 0.2],
                    backgroundColor: [
                      'rgba(223,0,89,0.6)',
                      'rgba(224,110,156,0.8)',
                      'rgba(223,0,89,0.6)',
                    ]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* === BOTTOM BRANDING === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-6 text-center"
          >
            <p className="text-[9px] text-[#CC0D5A]/45 font-semibold tracking-widest uppercase">
              BeU Pulse UI
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
