"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useStore } from "@/store/useStore"

export type PetAnimation = "idle" | "walk" | "run" | "wave" | "excited" | "sad" | "happy" | "angry" | "think" | "blink"

interface PetProps {
  animation?: PetAnimation
  size?: number
  className?: string
  companionId?: string
}

const ANIMATIONS: Record<PetAnimation, { row: number; frames: number }> = {
  idle: { row: 0, frames: 6 },
  walk: { row: 1, frames: 8 },
  run: { row: 2, frames: 8 },
  wave: { row: 3, frames: 4 },
  excited: { row: 4, frames: 5 },
  sad: { row: 5, frames: 8 },
  happy: { row: 6, frames: 6 },
  angry: { row: 7, frames: 6 },
  think: { row: 8, frames: 6 },
  blink: { row: 9, frames: 6 },
}

const ROWS = 10
const COLS = 8

export function Pet({ animation = "idle", size = 64, className, companionId }: PetProps) {
  const { petOffsets, selectedCompanion } = useStore()
  const [frame, setFrame] = useState(0)
  const anim = ANIMATIONS[animation]
  const currentOffset = petOffsets[animation] || { offsetY: 0, scale: 800 }

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % anim.frames)
    }, 120) // Frame rate
    return () => clearInterval(interval)
  }, [anim.frames])

  useEffect(() => {
    setFrame(0)
  }, [animation])

  // Standard pixel offsets calculation
  const xOffset = -frame * size
  const yOffset = -anim.row * size + (size * 0.0025) + (currentOffset.offsetY * (size / 64))

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className="absolute w-full h-full"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/nextgen-companion/${companionId || selectedCompanion || 'uteh'}.webp')`,
          backgroundSize: `${currentOffset.scale}% auto`,
          backgroundPosition: `${xOffset}px ${yOffset}px`,
        }}
      />
    </div>
  )
}

export const NextGenCompanion = Pet
