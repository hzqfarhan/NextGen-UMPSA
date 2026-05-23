"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useStore } from "@/store/useStore"
import { Pet } from "@/components/ui/Pet"
import { cn } from "@/lib/utils"

const MESSAGES = [
  "Click me!", 
  "Have a good day!", 
  "Need help?", 
  "Keep it up!", 
  "Doing great!", 
  "Check your stats!", 
  "Stay focused!",
  "Financial freedom!",
  "Save more today!",
  "Invest wisely!"
]

const COMPANION_NAMES: Record<string, string> = {
  uteh: "Uteh",
  zuko: "Zuko",
  oreo: "Oreo",
  oyen: "Oyen",
  yunn: "Yunn",
  lico: "Lico"
}

export function CoachFAB() {
  const pathname = usePathname()
  const [msgIndex, setMsgIndex] = useState(0)
  const { message: petMessage, animation: petAnimation } = useStore((state) => state.pet)
  const selectedCompanion = useStore((state) => state.selectedCompanion)
  const constraintsRef = useRef(null)
  
  const fabRef = useRef<HTMLDivElement>(null)
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left')
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const prevCompanionRef = useRef(selectedCompanion)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (prevCompanionRef.current !== selectedCompanion) {
      const name = COMPANION_NAMES[selectedCompanion] || "Uteh"
      setWelcomeMessage(`Hi, I'm ${name}! ✨`)
      
      const timeout = setTimeout(() => {
        setWelcomeMessage(null)
      }, 5000)
      
      prevCompanionRef.current = selectedCompanion
      return () => clearTimeout(timeout)
    }
  }, [selectedCompanion])

  const handleDrag = () => {
    if (!fabRef.current) return
    const rect = fabRef.current.getBoundingClientRect()
    const screenWidth = window.innerWidth
    if (rect.left + rect.width / 2 < screenWidth / 2) {
      setBubbleSide('right')
    } else {
      setBubbleSide('left')
    }
  }

  if (pathname === '/' || pathname === '/onboarding' || pathname === '/coach' || pathname === '/scan' || pathname === '/setup') return null
  const message = welcomeMessage || (msgIndex === 0 ? petMessage : MESSAGES[msgIndex])

  return (
    <>
      {/* Hidden constraint boundary */}
      <div ref={constraintsRef} className="fixed inset-0 top-20 bottom-24 pointer-events-none" />
      
      <motion.div 
        ref={fabRef}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        onDrag={handleDrag}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 z-40 cursor-grab active:cursor-grabbing flex items-center pointer-events-auto"
      >
        <div className="relative">
          {/* Chat Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className={cn(
                "absolute bottom-[85px] w-28 bg-[#FFE9F2]/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg border border-[#F3C7D8] whitespace-normal break-words pointer-events-none text-center flex flex-col items-center justify-center min-h-[32px] z-50",
                bubbleSide === 'left' 
                  ? "right-[60px] rounded-br-none" 
                  : "left-[60px] rounded-bl-none"
              )}
            >
              <p className="text-[6.5px] font-bold text-[#CC0D5A] tracking-tight leading-normal" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                {message}
              </p>
              {/* Bubble Tail */}
              <div className={cn(
                "absolute -bottom-1 w-2 h-2 bg-[#FFE9F2]/95 border-b border-[#F3C7D8] rotate-45",
                bubbleSide === 'left'
                  ? "right-3 border-r"
                  : "left-3 border-l"
              )} />
            </motion.div>
          </AnimatePresence>

          <Link 
            href="/coach"
            className="block hover:scale-110 transition-transform active:scale-95"
          >
            <div className="relative pointer-events-none">
              <Pet animation={(petAnimation as any) || "idle"} size={80} />
            </div>
          </Link>
        </div>
      </motion.div>
    </>
  )
}
