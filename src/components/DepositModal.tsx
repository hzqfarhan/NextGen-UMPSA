"use client"

import { useState } from "react"
import { useStore, SavingsPocket } from "@/store/useStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { t } from "@/lib/translations"
import { CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  pocket: SavingsPocket | null
}

export function DepositModal({ isOpen, onClose, pocket }: DepositModalProps) {
  const { addFundsToPocket, language, calculateDailyLimitForBalance, user } = useStore()
  const strings = t[language]
  
  const [amount, setAmount] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [successAmount, setSuccessAmount] = useState(0)

  const parsedAmount = parseFloat(amount) || 0
  const showBanner = parsedAmount > 0 && pocket !== null

  let safeDailyBefore = 0
  let safeDailyAfter = 0
  if (showBanner && pocket) {
    safeDailyBefore = calculateDailyLimitForBalance(user.currentBalance)
    safeDailyAfter = calculateDailyLimitForBalance(user.currentBalance - parsedAmount)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pocket) return
    
    // Add funds immediately to update local store state
    addFundsToPocket(pocket.id, parsedAmount)
    setSuccessAmount(parsedAmount)
    setIsSuccess(true)
    setAmount("")

    // Let the animation play for 2.2 seconds before closing
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2200)
  }

  if (!pocket) return null

  return (
    <>
      {/* Success Popup */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-xs bg-card border border-border shadow-2xl rounded-[32px] p-8 text-center space-y-6"
            >
              <div className="relative mx-auto w-20 h-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="absolute inset-0 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"
                />
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-foreground">Deposit Successful</h2>
                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                  Successfully added <span className="text-primary font-bold">RM {successAmount.toFixed(2)}</span> to {pocket.name}
                </p>
              </div>

              <div className="pt-2">
                <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-primary"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase tracking-widest opacity-50">Updating Savings...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isOpen && !isSuccess} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] glass-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {strings.saveAddFundsTo || "Add Funds to"} {pocket.name}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                {strings.saveAmountToSave || "Amount to Save (RM)"}
              </label>
              <Input
                required
                type="number"
                placeholder="e.g. 50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-lg text-center font-bold text-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {[10, 20, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-colors text-xs font-bold"
                >
                  +RM {val}
                </button>
              ))}
            </div>

            {showBanner && safeDailyAfter < 10.0 ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] leading-relaxed space-y-1 animate-fadeIn">
                <p className="font-bold text-rose-400 flex items-center gap-1">
                  🚨 Survival Threshold Blocked
                </p>
                <p className="text-muted-foreground">
                  This deposit would drop your daily safe spending limit to <span className="font-bold text-rose-400">RM {safeDailyAfter.toFixed(2)}/day</span>, which is below the minimum survival limit of <span className="font-bold">RM 10.00/day</span>.
                </p>
                <p className="font-semibold text-rose-400">
                  Transaction restricted: Please lower the savings amount to ensure you have enough daily funds to survive!
                </p>
              </div>
            ) : showBanner && (
              <div className="p-3.5 rounded-xl bg-pink-600/10 border border-pink-600/20 text-[10px] leading-relaxed space-y-1 animate-fadeIn">
                <p className="font-bold text-pink-500 flex items-center gap-1">
                  ⚠️ Daily Spend Plan Impact
                </p>
                <p className="text-muted-foreground">
                  Saving RM {parsedAmount.toFixed(2)} to {pocket.name} reduces your spendable wallet balance from RM {user.currentBalance.toFixed(2)} to RM {(user.currentBalance - parsedAmount).toFixed(2)}.
                </p>
                <p className="text-muted-foreground">
                  This will adjust your daily safe spending limit from <span className="font-bold text-primary">RM {safeDailyBefore.toFixed(2)}/day</span> to <span className="font-bold text-amber-400">RM {safeDailyAfter.toFixed(2)}/day</span>.
                </p>
                <p className="font-semibold text-emerald-400">
                  ✨ Your NextGen Score remains fully protected since savings count as assets!
                </p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button 
                type="submit" 
                disabled={parsedAmount <= 0 || safeDailyAfter < 10.0 || parsedAmount > user.currentBalance}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-lg shadow-primary/20 disabled:opacity-40"
              >
                {strings.saveConfirmDeposit || "Confirm Deposit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
