"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, ScanLine, X, AlertTriangle, ArrowRight, Zap, AlertCircle, ChevronDown, Coffee, ShoppingBag, Gamepad2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TopUpModal } from "./TopUpModal"
import { cn } from "@/lib/utils"

export function Scanner() {
  const router = useRouter()
  const { user, addTransaction, safeDailySpend, initialSafeDaily, transactions } = useStore()
  
  const [scannedItem, setScannedItem] = useState<{ merchant: string, amount: number, category: string } | null>(null)
  const [isWarning, setIsWarning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)

  // Calculate remaining daily spending quota
  const todayStr = new Date().toDateString()
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const originalQuota = initialSafeDaily || 15.0
  const currentQuotaRemaining = originalQuota - todayExpenses

  const scanAmount = scannedItem ? scannedItem.amount : 0
  const quotaAfterPurchase = currentQuotaRemaining - scanAmount

  // Spend Guardian Alert Style Level:
  // 1. Green - when remaining spending quota is more than 50% than original quota
  // 2. Yellow - when it below 50% or the payment causing the remaining quota below 50%
  // 3. Red - exceed the quota
  const alertColor = quotaAfterPurchase < 0 
    ? "red" 
    : quotaAfterPurchase < (0.5 * originalQuota) 
      ? "yellow" 
      : "green"

  const alertStyles = {
    green: {
      bg: "bg-emerald-500/10",
      border: "border-b border-emerald-500/20",
      text: "text-emerald-600",
      darkText: "text-emerald-800/80",
      iconBg: "bg-emerald-500/20"
    },
    yellow: {
      bg: "bg-amber-500/10",
      border: "border-b border-amber-500/20",
      text: "text-amber-600",
      darkText: "text-amber-800/80",
      iconBg: "bg-amber-500/20"
    },
    red: {
      bg: "bg-rose-500/10",
      border: "border-b border-rose-500/20",
      text: "text-rose-600",
      darkText: "text-rose-800/80",
      iconBg: "bg-rose-500/20"
    }
  }[alertColor]

  // Custom Simulator States
  const [customMerchant, setCustomMerchant] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [customCategory, setCustomCategory] = useState("Shopping")

  const handleCustomScan = () => {
    const amt = parseFloat(customAmount)
    if (isNaN(amt) || amt <= 0) return

    setScannedItem({
      merchant: customMerchant.trim() || "Local Shop",
      amount: amt,
      category: customCategory
    })
    setIsWarning(true)
  }

  const handleConfirmPay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      if (scannedItem!.amount > user.currentBalance) {
        setIsProcessing(false)
        setIsFailed(true)
      } else {
        addTransaction({
          id: Date.now().toString(),
          title: scannedItem!.merchant,
          amount: scannedItem!.amount,
          date: new Date().toISOString(),
          category: scannedItem!.category,
          type: 'expense',
          confidence: 0.95
        })
        router.push("/dashboard")
      }
    }, 1500)
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Mock Camera View */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-50">
        <div className="w-64 h-64 border-2 border-primary/50 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
          <motion.div 
            animate={{ y: [0, 250, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-full h-1 bg-primary shadow-[0_0_15px_#A855F7]"
          />
        </div>
      </div>

      {/* Header */}
      <header className="z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-white font-bold">Scan DuitNow QR</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
            <X className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 z-10 flex flex-col justify-end p-4 pb-12">
        
        <AnimatePresence>
          {!scannedItem && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-h-[80vh] overflow-y-auto scrollbar-hide space-y-4 bg-slate-950/80 backdrop-blur-xl p-5 rounded-3xl border border-white/5 shadow-2xl"
            >
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">QR Code Simulator</h2>
                <p className="text-[10px] text-slate-400">Trigger quick QR demo checkout or build a custom scan value below</p>
              </div>

              {/* Quick Demos Panel */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 px-1">Quick-test Demos</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { merchant: "Starbucks Coffee", amount: 18.50, category: "Food", icon: Coffee, color: "text-emerald-400 bg-emerald-500/10" },
                    { merchant: "H&M Stores", amount: 150.00, category: "Shopping", icon: ShoppingBag, color: "text-pink-500 bg-pink-600/10" },
                    { merchant: "Steam Gaming", amount: 89.00, category: "Entertainment", icon: Gamepad2, color: "text-amber-400 bg-amber-500/10" },
                  ].map((demo, idx) => {
                    const IconComp = demo.icon
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setScannedItem({
                            merchant: demo.merchant,
                            amount: demo.amount,
                            category: demo.category
                          })
                          setIsWarning(true)
                        }}
                        className="w-full h-12 justify-between bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-white rounded-xl px-3.5 flex items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", demo.color)}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold leading-tight">{demo.merchant}</p>
                            <p className="text-[9px] text-slate-400 leading-tight">{demo.category}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-primary">RM {demo.amount.toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Checkout Creator */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 px-1">Simulate Custom Checkout</p>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-3">
                  
                  {/* Merchant name input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Merchant Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kedai Tomyam Jaya"
                      value={customMerchant}
                      onChange={(e) => setCustomMerchant(e.target.value)}
                      className="bg-slate-900/60 border border-white/10 text-xs text-white rounded-xl h-9 px-3 focus:outline-none focus:border-primary/50 placeholder-slate-500 font-medium"
                    />
                  </div>

                  {/* Amount & Category select */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Amount (RM)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={customAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || parseFloat(val) >= 0) {
                            setCustomAmount(val);
                          }
                        }}
                        className="bg-slate-900/60 border border-white/10 text-xs text-white rounded-xl h-9 px-3 focus:outline-none focus:border-primary/50 placeholder-slate-500 font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                      <div className="relative">
                        <select
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-slate-900/60 border border-white/10 text-xs text-white rounded-xl h-9 pl-3 pr-8 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer font-bold"
                        >
                          <option value="Food" className="bg-slate-900">🍔 Food</option>
                          <option value="Shopping" className="bg-slate-900">🛍️ Shopping</option>
                          <option value="Entertainment" className="bg-slate-900">🎮 Entertainment</option>
                          <option value="Transport" className="bg-slate-900">🚗 Transport</option>
                          <option value="Bills" className="bg-slate-900">⚡ Bills</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Simulate Scan Button */}
                  <Button
                    onClick={handleCustomScan}
                    disabled={!customAmount}
                    className="w-full h-10 bg-primary hover:bg-primary/95 text-slate-900 font-extrabold rounded-xl text-xs gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-1"
                  >
                    <QrCode className="w-4 h-4" /> Scan Custom Code
                  </Button>

                </div>
              </div>

            </motion.div>
          )}

          {scannedItem && isWarning && !isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl shadow-2xl"
            >
              <Card className="bg-white border-none rounded-3xl overflow-hidden">
                <div className={cn(alertStyles.bg, "p-4 flex gap-3", alertStyles.border)}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", alertStyles.iconBg, alertStyles.text)}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("text-sm font-bold", alertStyles.text)}>NextGen AI Council Decision</h3>
                    <p className={cn("text-xs leading-relaxed mt-1", alertStyles.darkText)}>
                      Spend Guardian flags this RM{scannedItem.amount.toFixed(2)} {scannedItem.category.toLowerCase()} payment as {alertColor === "red" ? "critical" : alertColor === "yellow" ? "medium" : "low"} risk. 
                      Your Safe Daily Spend after purchase becomes RM{quotaAfterPurchase.toFixed(2)}.
                    </p>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-sm text-slate-500 font-medium">Paying {scannedItem.merchant}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">RM {scannedItem.amount.toFixed(2)}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impulse Negotiator</p>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {["Need or dopamine?", "Worth how many hours of work?", "Will future you still thank you next week?"].map((question) => (
                          <div key={question} className="rounded-xl bg-white border border-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700">
                            {question}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#FFE9F2] to-white border border-pink-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#CC0D5A]">Future-Me Visualizer</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-slate-400 text-[10px]">Current</p>
                          <p className="font-black text-slate-900">RM {currentQuotaRemaining.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px]">After Purchase</p>
                          <p className={cn("font-black", quotaAfterPurchase < 10 ? "text-rose-600" : "text-emerald-600")}>RM {quotaAfterPurchase.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                        {quotaAfterPurchase < 10
                          ? "Future you may enter survival mode. Delay this purchase by 24 hours and your Safe Daily Spend stays healthier."
                          : "Future you still has breathing room, but NextGen recommends staying mindful."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Malay Dialect Roast & Toast</p>
                      <p className="mt-1 text-[11px] font-semibold text-amber-900 leading-relaxed">
                        {quotaAfterPurchase < 10
                          ? `Bossku, RM${scannedItem.amount.toFixed(2)} masa safe spend tinggal RM${currentQuotaRemaining.toFixed(2)}? Style ada, tapi bajet tengah tinggal separuh nyawa.`
                          : "Cun, masih dalam kawalan. NextGen approve, tapi jangan lupa matlamat simpanan hari ni."}
                      </p>
                      <p className="mt-2 text-[10px] font-bold text-amber-700">Next action: Move this into a 24-hour Cooling-Off Pocket.</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-amber-200/50">
                        <span className="text-[9px] text-amber-600 font-medium">Share to get Streak Shield + RM10!</span>
                        <button
                          onClick={() => {
                            useStore.getState().activateStreakShield();
                            useStore.setState((s) => ({
                              user: { ...s.user, currentBalance: s.user.currentBalance + 10 }
                            }));
                            alert("Passport generated! 🛡️ Streak Shield activated & RM10 simulated referral bounty added to wallet!");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold text-[9px] hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1"
                        >
                          📢 Share My Roast
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 border-slate-200 text-slate-600 rounded-xl"
                      onClick={() => setScannedItem(null)}
                    >
                      Cool Off
                    </Button>
                    <Button 
                      className="h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                      onClick={handleConfirmPay}
                    >
                      Pay Anyway
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
              <p className="font-medium text-slate-600">Processing Payment...</p>
            </motion.div>
          )}

          {isFailed && !isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white p-6 rounded-3xl shadow-2xl flex flex-col space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                  <AlertCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">Payment Declined</h3>
                  <p className="text-xs text-muted-foreground">
                    Insufficient funds in your virtual wallet.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Your Balance:</span>
                  <span className="font-bold text-slate-700">RM {user.currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Required:</span>
                  <span className="font-bold text-rose-600">RM {scannedItem!.amount.toFixed(2)}</span>
                </div>
                <div className="border-t border-rose-100/50 pt-2 flex justify-between text-xs font-bold text-rose-600">
                  <span>Shortfall:</span>
                  <span>RM {(scannedItem!.amount - user.currentBalance).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 border-slate-200 text-slate-600 rounded-xl"
                  onClick={() => {
                    setIsFailed(false)
                    setScannedItem(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
                  onClick={() => setShowTopUpModal(true)}
                >
                  Top Up
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TopUpModal 
          isOpen={showTopUpModal} 
          onClose={() => {
            setShowTopUpModal(false)
            if (user.currentBalance >= scannedItem!.amount) {
              setIsFailed(false)
            }
          }} 
        />
      </div>
    </div>
  )
}
