"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function Landing() {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center justify-between p-8 overflow-hidden relative font-sans">
      
      {/* Background Liquid blobs - Subtle overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            x: [0, -30, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full"
        />
        
        {/* The "Ribbon" - Using SVGs and filters to create a liquid look */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70 scale-110">
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-2xl filter blur-sm">
            <defs>
              <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DF0059" />
                <stop offset="52%" stopColor="#E06E9C" />
                <stop offset="100%" stopColor="#FFC107" />
              </linearGradient>
            </defs>
            <motion.path 
              animate={{
                d: [
                  "M45,-67.2C58.9,-61.1,71.2,-49.2,77.5,-34.8C83.8,-20.5,84.1,-3.7,79.5,11.5C74.9,26.7,65.3,40.3,53.2,50.7C41.1,61.1,26.5,68.4,10.6,71.3C-5.3,74.2,-22.4,72.7,-37.8,65.5C-53.2,58.3,-66.8,45.4,-73.4,30.1C-80,14.8,-79.6,-2.9,-73.9,-18.8C-68.2,-34.7,-57.2,-48.9,-44.1,-55.4C-31,-61.9,-15.5,-60.7,0.1,-60.8C15.7,-60.9,31.1,-73.3,45,-67.2Z",
                  "M38.5,-55.2C49.9,-46.8,59.3,-35.6,64.2,-22.6C69.1,-9.6,69.5,5.2,65.2,19.2C60.9,33.2,51.8,46.4,39.6,54.8C27.4,63.2,12.2,66.8,-2.8,70.5C-17.8,74.2,-32.5,78,-44.7,72.5C-56.9,67,-66.6,52.2,-71.4,36.5C-76.2,20.8,-76.1,4.2,-71.9,-10.8C-67.7,-25.8,-59.4,-39.2,-47.8,-47.6C-36.2,-56,-21.3,-59.4,-6.6,-50.2C8.1,-41.1,27.1,-63.6,38.5,-55.2Z",
                  "M45,-67.2C58.9,-61.1,71.2,-49.2,77.5,-34.8C83.8,-20.5,84.1,-3.7,79.5,11.5C74.9,26.7,65.3,40.3,53.2,50.7C41.1,61.1,26.5,68.4,10.6,71.3C-5.3,74.2,-22.4,72.7,-37.8,65.5C-53.2,58.3,-66.8,45.4,-73.4,30.1C-80,14.8,-79.6,-2.9,-73.9,-18.8C-68.2,-34.7,-57.2,-48.9,-44.1,-55.4C-31,-61.9,-15.5,-60.7,0.1,-60.8C15.7,-60.9,31.1,-73.3,45,-67.2Z"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              transform="translate(100 100)" 
              fill="url(#liquidGrad)" 
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="w-full max-w-lg z-10 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1"
        >
          <span className="text-2xl font-black tracking-tight text-primary">NextGen</span>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2" />
        </motion.div>
        
        {/* iPhone Style Top Indicators Mockup (Time, Signal, Wifi, Battery) */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold opacity-60">
          <span>9:41</span>
          <div className="flex gap-0.5">
            <div className="w-0.5 h-2 bg-foreground rounded-full" />
            <div className="w-0.5 h-2.5 bg-foreground rounded-full" />
            <div className="w-0.5 h-3 bg-foreground rounded-full" />
            <div className="w-0.5 h-3.5 bg-foreground rounded-full" />
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-lg z-10 flex flex-col items-start gap-6 mt-12 sm:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight leading-[0.95] max-w-xs">
            Can I afford this <span className="text-primary italic">right now?</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xs leading-snug">
            BeU NextGen helps you protect must-pay money, calculate Safe Daily Spend, and pause risky purchases before future-you feels it.
          </p>
        </motion.div>
      </main>

      {/* Actions */}
      <footer className="w-full max-w-lg z-10 flex flex-col items-center gap-6 pb-4 sm:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full flex items-center gap-4"
        >
          <Link href="/setup" className="flex-1">
            <Button className="w-full h-16 bg-foreground text-background hover:bg-foreground/90 rounded-[2rem] text-lg font-bold flex items-center justify-between px-8 group">
              Start NextGen
              <ArrowUpRight className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-foreground/10 bg-background/50 backdrop-blur-xl hover:bg-foreground/5">
              <ShieldCheck className="w-7 h-7" />
            </Button>
          </div>
        </motion.div>
        
        {/* Swipe indicator mockup */}
        <div className="w-32 h-1 bg-foreground/10 rounded-full mt-4" />
      </footer>
      
      {/* Decorative Blur for Notch/Island feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-slate-900 rounded-b-3xl z-20 hidden sm:block" />

    </div>
  )
}
