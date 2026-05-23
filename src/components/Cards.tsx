"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Plus, ShieldCheck, Zap, ArrowUpRight, History, Eye, EyeOff, Copy, Check, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store/useStore"

export function Cards() {
  const { user } = useStore()
  const cardHolderName = (user?.name || "Aiman").toUpperCase()
  const cardLastFour = "1728"

  const [isDetailsVisible, setIsDetailsVisible] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [spendingLimit, setSpendingLimit] = useState("5000")

  const handleVerify = () => {
    if (password === "1234") {
      setIsDetailsVisible(true)
      setShowAuthDialog(false)
      setPassword("")
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`424288129901${cardLastFour}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleDetails = () => {
    if (isDetailsVisible) {
      setIsDetailsVisible(false)
    } else {
      setShowAuthDialog(true)
    }
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-xs text-muted-foreground">Manage your virtual and physical cards</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-slate-900 shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={(open) => {
        setShowAuthDialog(open)
        if (!open) {
          setPassword("")
          setError(false)
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Security Verification
            </DialogTitle>
            <DialogDescription>
              Please enter your security password to view sensitive card details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter Password (Hint: 1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? "border-destructive focus-visible:ring-destructive/20" : ""}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            {error && <p className="text-[10px] text-destructive mt-2 ml-1">Incorrect password. Please try again.</p>}
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAuthDialog(false)}>Cancel</Button>
            <Button onClick={handleVerify}>Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spending Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
              Adjust Spending Limit
            </DialogTitle>
            <DialogDescription>
              Set your maximum daily spending limit for this card.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Daily Limit (MYR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">RM</span>
                <Input
                  type="number"
                  placeholder="Enter Amount"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  className="pl-10 text-lg font-mono font-bold"
                  autoFocus
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1000", "5000", "10000"].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className={`text-[10px] h-8 ${spendingLimit === amount ? 'border-primary bg-primary/5 text-primary' : ''}`}
                  onClick={() => setSpendingLimit(amount)}
                >
                  RM {amount}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowLimitDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowLimitDialog(false)} className="bg-primary hover:bg-primary/90">Update Limit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Card Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative group perspective-1000"
      >
        <div className="w-full h-52 rounded-[2rem] bg-gradient-to-br from-primary via-[#CC0D5A] to-[#221F20] p-6 text-white shadow-2xl relative overflow-hidden transform-gpu transition-transform duration-500 hover:rotate-y-12">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E06E9C]/25 rounded-full -ml-10 -mb-10 blur-2xl" />

          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Bank Islam</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                  <p className="text-lg font-extrabold">Virtual Card</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.85) 50%, rgba(223,0,89,0.6) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                    filter: "drop-shadow(0 0 20px rgba(223,0,89,0.2))"
                  }}
                >
                  NextGen
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {isDetailsVisible ? (
                    <>
                      <span className="text-xl font-mono">4242</span>
                      <span className="text-xl font-mono">8812</span>
                      <span className="text-xl font-mono">9901</span>
                      <span className="text-xl font-mono">{cardLastFour}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-mono tracking-[0.2em]">••••</span>
                      <span className="text-xl font-mono tracking-[0.2em]">••••</span>
                      <span className="text-xl font-mono tracking-[0.2em]">••••</span>
                      <span className="text-xl font-mono">{cardLastFour}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isDetailsVisible && (
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Copy Card Number"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={toggleDetails}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title={isDetailsVisible ? "Hide Details" : "Show Details"}
                  >
                    {isDetailsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] opacity-70 uppercase tracking-tighter">Card Holder</p>
                  <p className="text-sm font-medium uppercase tracking-wide">{cardHolderName}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[8px] opacity-70 uppercase tracking-tighter">Expires</p>
                    <p className="text-sm font-medium">09/28</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] opacity-70 uppercase tracking-tighter">CVV</p>
                    <p className="text-sm font-medium font-mono">{isDetailsVisible ? "123" : "•••"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Freeze Card</p>
              <p className="text-[10px] text-muted-foreground">Instantly lock card</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="glass-card cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 border-transparent hover:border-amber-500/30"
          onClick={() => setShowLimitDialog(true)}
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Card Spending Limit</p>
              <p className="text-[10px] text-muted-foreground">Adjust daily limit (RM {spendingLimit})</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details List */}
      <section className="space-y-3">
        <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">Card Details</h3>
        <Card className="glass-card">
          <CardContent className="p-0">
            {[
              { icon: History, label: "Transaction History", value: "View All", color: "text-primary" },
              { icon: CreditCard, label: "Card Controls", value: "Locked", color: "text-emerald-500" },
            ].map((item, i) => (
              <div key={item.label} className={`p-4 flex items-center justify-between ${i === 0 ? 'border-b border-slate-200 dark:border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
