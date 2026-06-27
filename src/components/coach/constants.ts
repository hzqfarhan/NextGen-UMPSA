import { Shield, Brain, Target, TrendingUp } from "lucide-react"
import { Companion, Agent } from "./types"

export const COMPANIONS: Companion[] = [
  { id: 'uteh', name: 'Uteh', tierRequired: 'Novice', label: 'Novice' },
  { id: 'zuko', name: 'Zuko', tierRequired: 'Pro', label: 'Pro' },
  { id: 'oreo', name: 'Oreo', tierRequired: 'Pro', label: 'Pro' },
  { id: 'oyen', name: 'Oyen', tierRequired: 'Legend', label: 'Legend' },
  { id: 'yunn', name: 'Yunn', tierRequired: 'Legend', label: 'Legend' },
  { id: 'lico', name: 'Lico', tierRequired: 'Legend', label: 'Legend' },
]

export function canUnlockCompanion(tierRequired: string, userTier: string) {
  if (tierRequired === 'Novice') return true;
  if (tierRequired === 'Pro') return userTier === 'Pro' || userTier === 'Legend';
  if (tierRequired === 'Legend') return userTier === 'Legend';
  return false;
}

export const AGENTS: Agent[] = [
  { id: 'save', name: 'Savings Sentinel', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'debt', name: 'Commitment Shield', icon: Shield, color: 'text-pink-600', bg: 'bg-pink-600/10' },
  { id: 'invest', name: 'Growth Guru', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'finance', name: 'Finance Strategist', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
]
