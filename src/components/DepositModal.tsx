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

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  pocket: SavingsPocket | null
}

export function DepositModal({ isOpen, onClose, pocket }: DepositModalProps) {
  const { addFundsToPocket, language, calculateDailyLimitForBalance, user } = useStore()
  const strings = t[language]
  
  const [amount, setAmount] = useState("")

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
    
    addFundsToPocket(pocket.id, parsedAmount)
    setAmount("")
    onClose()
  }

  if (!pocket) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
  )
}
