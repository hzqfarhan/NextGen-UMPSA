"use client"

import { useStore } from "@/store/useStore"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
  Wallet,
  ShieldCheck,
  PiggyBank,
  TrendingUp,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"

interface BalanceDetailDrawerProps {
  open: boolean
  onClose: () => void
}

export function BalanceDetailDrawer({ open, onClose }: BalanceDetailDrawerProps) {
  const { user, savingsPockets, language, showSpendOnly, setShowSpendOnly, hideBalance, setHideBalance } = useStore()
  const bills = useStore(state => state.bills)
  const strings = t[language]

  // Calculations
  const lockedForBills = bills
    .filter(b => b.isLocked && b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0)

  const savingsPocketsTotal = savingsPockets
    .filter(p => p.mode === 'savings')
    .reduce((sum, p) => sum + p.current, 0)

  const investmentPocketsTotal = savingsPockets
    .filter(p => p.mode === 'growth')
    .reduce((sum, p) => sum + p.current, 0)

  const totalAssets = user.currentBalance + savingsPocketsTotal + investmentPocketsTotal
  const spendableBalance = user.currentBalance - lockedForBills

  const displayBalance = showSpendOnly ? spendableBalance : totalAssets
  const formatRM = (v: number) => hideBalance ? '••••••' : `RM ${v.toFixed(2)}`

  // Growth pockets with returns
  const growthPockets = savingsPockets.filter(p => p.mode === 'growth')
  const savingsPocketsList = savingsPockets.filter(p => p.mode === 'savings')

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] max-w-lg mx-auto"
          >
            <div className="bg-card border-t border-border rounded-t-[28px] shadow-2xl overflow-hidden">
              {/* Drag Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Header Section */}
              <div className="px-6 pb-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {showSpendOnly ? 'Spendable' : 'Total Assets'}
                      </span>
                      <button 
                        onClick={() => setHideBalance(!hideBalance)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <motion.p
                      key={displayBalance}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-black tracking-tight"
                    >
                      {formatRM(displayBalance)}
                    </motion.p>
                  </div>

                  {/* Shield Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-emerald-500" />
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs text-muted-foreground font-medium">Show spend balance only</span>
                  <Switch
                    checked={showSpendOnly}
                    onCheckedChange={setShowSpendOnly}
                    size="sm"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border mx-6" />

              {/* Sections */}
              <div className="px-6 py-4 space-y-1 max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 pb-3">
                  <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Protected</span>
                    </div>
                    <p className="mt-1 text-sm font-black">{formatRM(lockedForBills)}</p>
                  </div>

                  <div className="rounded-full border border-pink-200 bg-pink-50/60 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-[#CC0D5A]">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Spendable</span>
                    </div>
                    <p className="mt-1 text-sm font-black text-[#CC0D5A]">{formatRM(spendableBalance)}</p>
                  </div>
                </div>
                
                {/* Spend Section */}
                <div className="py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-foreground" />
                      <span className="text-sm font-bold">Spend</span>
                    </div>
                    <span className="text-sm font-bold">{formatRM(user.currentBalance)}</span>
                  </div>

                  <div className="ml-6 space-y-2">
                    {/* eWallet row */}
                    <div className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">eWallet</p>
                        <p className="text-xs font-bold">{formatRM(spendableBalance)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>

                    {/* Smart Bill Lock row */}
                    {lockedForBills > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-500" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Locked for Bills</p>
                            <p className="text-[10px] text-amber-500 font-semibold">
                              {bills.filter(b => b.isLocked && b.status !== 'paid').length} active commitment{bills.filter(b => b.isLocked && b.status !== 'paid').length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">- {formatRM(lockedForBills)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Save Section */}
                <div className="py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold">Save</span>
                    </div>
                    <span className="text-sm font-bold">{formatRM(savingsPocketsTotal)}</span>
                  </div>

                  {savingsPocketsList.length > 0 ? (
                    <div className="ml-6 space-y-2">
                      {savingsPocketsList.map(pocket => (
                        <div key={pocket.id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pocket.icon}</span>
                            <div>
                              <p className="text-xs font-medium">{pocket.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {Math.round((pocket.current / pocket.target) * 100)}% of RM {pocket.target}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">{formatRM(pocket.current)}</p>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground ml-6">No Savings Hub yet</p>
                  )}

                  <div className="ml-6 mt-2 flex gap-2">
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Unlimited balance
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      3.42% p.a.
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Invest Section */}
                <div className="py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">Invest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatRM(investmentPocketsTotal)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>

                  {growthPockets.length > 0 ? (
                    <div className="ml-6 space-y-2">
                      {growthPockets.map(pocket => (
                        <div key={pocket.id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pocket.icon}</span>
                            <div>
                              <p className="text-xs font-medium">{pocket.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {pocket.riskLevel ? `${pocket.riskLevel} risk` : 'managed'} • RM {pocket.target} goal
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-bold">{formatRM(pocket.current)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground ml-6">No investments yet</p>
                  )}

                  {investmentPocketsTotal > 0 && (
                    <div className="ml-6 mt-2">
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Up to 6.5% returns
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Invest balance includes growth pockets and managed funds.
                  All balances are updated on {new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>

              {/* Safe area padding for bottom bar */}
              <div className="h-safe" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
