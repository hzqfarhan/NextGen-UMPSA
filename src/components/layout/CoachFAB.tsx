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

const COMPANION_EASTER_EGGS: Record<string, Array<{ text: string; animation: string }>> = {
  uteh: [
    { text: "Don't spend it all in one place! Uteh is watching! 👀", animation: "blink" },
    { text: "RM1 a day keeps the budget-roasters away! Bop!", animation: "wave" },
    { text: "Let's check our pockets! Every penny counts! 🪙", animation: "think" }
  ],
  zuko: [
    { text: "Hmph. That's a decent streak you got there. Keep it up.", animation: "blink" },
    { text: "Pro saver status unlocked. Let's make some smart money moves.", animation: "think" },
    { text: "Need a roaster check? Don't let me catch you spending on junk.", animation: "angry" }
  ],
  oreo: [
    { text: "Yay! Pockets are looking yummy today! 🍪", animation: "happy" },
    { text: "Double tap me again! I dare you! Spin-bop! 💫", animation: "excited" },
    { text: "Psst... want a Grab coupon? Check out the rewards hub!", animation: "blink" }
  ],
  oyen: [
    { text: "Oyen demands you keep that 30-day streak active. Or else... 🐾", animation: "angry" },
    { text: "A 5.2% MaxCash rate? Now that's royalty. Oyen approves.", animation: "think" },
    { text: "Keep saving! I need my premium kibble! 👑", animation: "excited" }
  ],
  yunn: [
    { text: "True wealth is built day by day, streak by streak. Relax, you're doing great.", animation: "happy" },
    { text: "Let's sit together and think about our long-term runway.", animation: "think" },
    { text: "A legend status is earned with patience. I'm proud of you.", animation: "wave" }
  ],
  lico: [
    { text: "NextGen Score is looking optimized! System checks are in the green.", animation: "blink" },
    { text: "Data shows you are in the top 5% of university saver sheets! 📊", animation: "excited" },
    { text: "Let's automate that savings split. Efficiency is key.", animation: "think" }
  ]
}

export function CoachFAB() {
  const pathname = usePathname()
  const [msgIndex, setMsgIndex] = useState(0)
  const { message: petMessage, animation: petAnimation } = useStore((state) => state.pet)
  const selectedCompanion = useStore((state) => state.selectedCompanion)
  const constraintsRef = useRef(null)
  
  const fabRef = useRef<HTMLDivElement>(null)
  const eggTimeoutRef = useRef<any>(null)
  
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left')
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)
  const [activeAnimation, setActiveAnimation] = useState<string>("idle")
  const [eggIndex, setEggIndex] = useState<number>(-1)
  
  const prevCompanionRef = useRef(selectedCompanion)

  // Rotating tips loop
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Welcome message when switching companions
  useEffect(() => {
    if (prevCompanionRef.current !== selectedCompanion) {
      const name = COMPANION_NAMES[selectedCompanion] || "Uteh"
      setWelcomeMessage(`Hi, I'm ${name}! ✨`)
      setEggIndex(-1)
      setActiveAnimation("wave")
      
      const timeout = setTimeout(() => {
        setWelcomeMessage(null)
        setActiveAnimation(petAnimation || "idle")
      }, 5000)
      
      prevCompanionRef.current = selectedCompanion
      return () => clearTimeout(timeout)
    }
  }, [selectedCompanion, petAnimation])

  // Sync pet animation when no Easter Egg is active
  useEffect(() => {
    if (eggIndex === -1 && !welcomeMessage) {
      setActiveAnimation(petAnimation || "idle")
    }
  }, [petAnimation, eggIndex, welcomeMessage])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (eggTimeoutRef.current) clearTimeout(eggTimeoutRef.current)
    }
  }, [])

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

  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent drag trigger or weird events
    
    const eggs = COMPANION_EASTER_EGGS[selectedCompanion] || COMPANION_EASTER_EGGS.uteh
    const nextIndex = (eggIndex + 1) % eggs.length
    setEggIndex(nextIndex)
    
    const selectedEgg = eggs[nextIndex]
    setWelcomeMessage(selectedEgg.text)
    setActiveAnimation(selectedEgg.animation)
    
    if (eggTimeoutRef.current) clearTimeout(eggTimeoutRef.current)
    eggTimeoutRef.current = setTimeout(() => {
      setWelcomeMessage(null)
      setEggIndex(-1)
      setActiveAnimation(petAnimation || "idle")
    }, 5000)
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
          {/* Chat Bubble - Clicking bubble navigates to Council Chat */}
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className={cn(
                "absolute bottom-[85px] w-28 bg-[#FFE9F2]/95 border-[#F3C7D8] backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg border cursor-pointer text-center flex flex-col items-center justify-center min-h-[32px] z-50 hover:bg-[#FFE9F2] active:scale-95 transition-all select-none",
                bubbleSide === 'left' 
                  ? "right-[60px] rounded-br-none" 
                  : "left-[60px] rounded-bl-none"
              )}
            >
              <Link href="/coach" className="w-full h-full block">
                <p className="text-[6.5px] font-bold text-[#CC0D5A] tracking-tight leading-normal" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  {message}
                </p>
              </Link>
              {/* Bubble Tail */}
              <div className={cn(
                "absolute -bottom-1 w-2 h-2 bg-[#FFE9F2]/95 border-b border-[#F3C7D8] rotate-45 pointer-events-none",
                bubbleSide === 'left'
                  ? "right-3 border-r"
                  : "left-3 border-l"
              )} />
            </motion.div>
          </AnimatePresence>

          {/* Interactive Mascot Pet - Click to cycle Easter Eggs */}
          <div 
            onClick={handlePetClick}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform select-none"
          >
            <div className="relative pointer-events-none">
              <Pet animation={activeAnimation as any} size={80} />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
