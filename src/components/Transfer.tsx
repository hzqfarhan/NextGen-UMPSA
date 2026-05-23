"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, BrainCircuit, AlertCircle, CheckCircle2, Wallet, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"

const CONTACTS = [
  { id: '1', name: 'Ahmad Ali', bank: 'Maybank', account: '1622 **** 8899', color: 'bg-yellow-500', initials: 'AA', avatar: '/assets/pfp/ahmad.png' },
  { id: '2', name: 'Khairul', bank: 'CIMB', account: '7021 **** 4422', color: 'bg-red-500', initials: 'KH', avatar: '/assets/pfp/khairul.png' },
  { id: '3', name: 'Aizat', bank: 'Public Bank', account: '3188 **** 1100', color: 'bg-rose-500', initials: 'AZ', avatar: '/assets/pfp/aizat.png' },
  { id: '4', name: 'Farhan', bank: 'RHB', account: '2144 **** 9911', color: 'bg-blue-600', initials: 'FH', avatar: '/assets/pfp/farhan.png' },
  { id: '5', name: 'Qaid', bank: 'Bank Islam', account: '1202 **** 5566', color: 'bg-emerald-600', initials: 'QA', avatar: '/assets/pfp/Qaid.png' },
  { id: '6', name: 'Danial', bank: 'Hong Leong', account: '0011 **** 7788', color: 'bg-sky-500', initials: 'DN', avatar: '/assets/pfp/Danial.png' },
]

interface TransferProposal {
  recipientId: string;
  amount: number;
  message: string;
}

const QUICK_AMOUNTS = [5, 10, 20, 50]

export function Transfer() {
  const router = useRouter()
  const { user, addTransaction, safeDailySpend, calculateDailyLimitForBalance } = useStore()
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState(CONTACTS[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // AI Assist State
  const [isAIAssistOpen, setIsAIAssistOpen] = useState(false)
  const [aiCommand, setAiCommand] = useState("")
  const [proposal, setProposal] = useState<TransferProposal | null>(null)
  const [aiStatus, setAiStatus] = useState<"idle" | "typing" | "suggesting">("idle")

  const numAmount = parseFloat(amount)
  const validAmount = !isNaN(numAmount) && numAmount > 0
  const hasInsufficientBalance = !isNaN(numAmount) && numAmount > user.currentBalance
  const remainingBalance = validAmount ? user.currentBalance - numAmount : user.currentBalance
  
  const safeDailyAfter = validAmount && !hasInsufficientBalance ? calculateDailyLimitForBalance(user.currentBalance - numAmount) : 0
  const isSurvivalRestricted = validAmount && !hasInsufficientBalance && safeDailyAfter < 10.0
  
  const prediction = validAmount && !hasInsufficientBalance
    ? numAmount > safeDailySpend * 3
      ? `Sending RM ${numAmount.toFixed(2)} will move your Broke Date 4 days earlier. Consider splitting this into smaller transfers.`
      : numAmount > safeDailySpend
        ? `This exceeds your safe daily limit of RM ${safeDailySpend.toFixed(2)}. Proceed with caution.`
        : null
    : null

  const handleTransfer = (manualAmount?: number, manualRecipientId?: string) => {
    const finalAmount = manualAmount !== undefined ? manualAmount : parseFloat(amount)
    const finalRecipient = manualRecipientId 
      ? CONTACTS.find(c => c.id === manualRecipientId) || selectedRecipient
      : selectedRecipient

    if (!finalAmount || isNaN(finalAmount) || finalAmount > user.currentBalance) return
    
    const postLimit = calculateDailyLimitForBalance(user.currentBalance - finalAmount)
    if (postLimit < 10.0) return
    
    setIsProcessing(true)
    setTimeout(() => {
      addTransaction({
        id: Date.now().toString(),
        title: `${finalRecipient.name} (${finalRecipient.bank})`,
        amount: finalAmount,
        date: new Date().toISOString(),
        category: "Transfer",
        type: 'expense',
        confidence: 0.95
      })
      setIsProcessing(false)
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2200)
    }, 1500)
  }

  const handleAICommand = (cmd: string) => {
    setAiStatus("typing")
    setAiCommand(cmd)
    
    setTimeout(() => {
      const lowerCmd = cmd.toLowerCase()
      // Rule-based parsing: "Send [amount] to [name]" or "Transfer to [name]"
      const amountMatch = lowerCmd.match(/(\d+(\.\d+)?)/)
      const targetAmount = amountMatch ? parseFloat(amountMatch[0]) : 50 // default to 50 if not specified
      
      const recipient = CONTACTS.find(c => lowerCmd.includes(c.name.toLowerCase().split(' ')[0]))
      
      if (recipient) {
        setProposal({
          recipientId: recipient.id,
          amount: targetAmount,
          message: `I've prepared a transfer of RM ${targetAmount.toFixed(2)} to ${recipient.name}. Shall I execute it?`
        })
        setAiStatus("suggesting")
      } else {
        setAiStatus("idle")
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto pb-32">

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
                <h2 className="text-xl font-black text-foreground">Transfer Successful</h2>
                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                  Successfully sent <span className="text-primary font-bold">RM {parseFloat(amount).toFixed(2)}</span> to {selectedRecipient.name}
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
                <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase tracking-widest opacity-50">Returning Home...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md px-4 pt-safe pb-3 sticky top-0 z-50 border-b border-border">
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-foreground/60 rounded-full hover:bg-foreground/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-foreground">Transfer</h1>
          </div>
          {/* Balance Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-border">
            <Wallet className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-bold text-foreground">RM {user.currentBalance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-5">
        
        {/* Recent Contacts */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Send to</p>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {CONTACTS.map((contact) => {
              const isSelected = selectedRecipient.id === contact.id
              return (
                <motion.button
                  key={contact.id}
                  onClick={() => setSelectedRecipient(contact)}
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className="relative">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 overflow-hidden",
                      contact.color,
                      isSelected 
                        ? "scale-105 ring-[3px] ring-primary ring-offset-2 ring-offset-background shadow-lg" 
                        : "opacity-50 scale-95"
                    )}>
                      {contact.avatar ? (
                        <img src={`${basePath}${contact.avatar}`} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        contact.initials
                      )}
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full border-[2.5px] border-background flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold transition-all duration-300",
                    isSelected ? "text-foreground" : "text-muted-foreground/50"
                  )}>
                    {contact.name.split(' ')[0]}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Selected Recipient Detail Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRecipient.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/[0.03] border border-border">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden", selectedRecipient.color)}>
                  {selectedRecipient.avatar ? (
                    <img src={`${basePath}${selectedRecipient.avatar}`} alt={selectedRecipient.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedRecipient.initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{selectedRecipient.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedRecipient.bank} · {selectedRecipient.account}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Amount Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Amount</p>
          
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/20 group-focus-within:text-muted-foreground/40 transition-colors">RM</span>
            <Input 
              type="number" 
              min="0"
              placeholder="0.00" 
              value={amount}
              onKeyDown={(e) => {
                if (['-', 'e', '+'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || parseFloat(val) >= 0) {
                  setAmount(val);
                }
              }}
              className="pl-16 h-[72px] text-[36px] font-black text-foreground bg-foreground/[0.03] border-border rounded-2xl placeholder:text-muted-foreground/10 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((val) => (
              <motion.button
                key={val}
                whileTap={{ scale: 0.92 }}
                onClick={() => setAmount(val.toString())}
                className={cn(
                  "flex-1 py-2.5 text-[11px] font-black rounded-xl border transition-all",
                  amount === val.toString()
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                    : "bg-foreground/[0.03] border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                )}
              >
                RM {val}
              </motion.button>
            ))}
          </div>

          {/* Remaining Balance Indicator */}
          <AnimatePresence>
            {validAmount && !hasInsufficientBalance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-[10px] text-muted-foreground">Remaining after transfer</span>
                  <span className={cn(
                    "text-[11px] font-bold",
                    remainingBalance < safeDailySpend ? "text-amber-500" : "text-emerald-500"
                  )}>
                    RM {remainingBalance.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Interception Alerts */}
        <AnimatePresence>
          {isSurvivalRestricted && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-500">🚨 Survival Threshold Blocked</p>
                  <p className="text-[11px] text-rose-500/70 leading-relaxed">
                    This transfer would drop your daily safe spending limit to <span className="font-bold text-rose-400">RM {safeDailyAfter.toFixed(2)}/day</span>, which is below the minimum survival limit of <span className="font-bold">RM 10.00/day</span>.
                  </p>
                  <p className="text-[11px] font-semibold text-rose-400">
                    Transaction restricted: Please lower the transfer amount to ensure you have enough daily funds to survive!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {hasInsufficientBalance && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-500">Insufficient Balance</p>
                  <p className="text-[11px] text-rose-500/70 leading-relaxed">
                    Your available balance is RM {user.currentBalance.toFixed(2)}. Please reduce the amount or top up your wallet.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {prediction && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <BrainCircuit className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-500">AI Cashflow Alert</p>
                  <p className="text-[11px] text-amber-500/70 leading-relaxed">{prediction}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reference */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reference (optional)</p>
            <button 
              onClick={() => setIsAIAssistOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-tight">AI Magic</span>
            </button>
          </div>
          <Input 
            placeholder="e.g. Dinner yesterday" 
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="h-12 bg-foreground/[0.03] border-border rounded-2xl text-sm"
          />
        </div>

        {/* AI Assist Modal/Overlay */}
        <AnimatePresence>
          {isAIAssistOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 z-[150] flex flex-col bg-background/95 backdrop-blur-xl p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Magic Transfer</h2>
                    <p className="text-xs text-muted-foreground">Ask me to send money to anyone</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setIsAIAssistOpen(false); setProposal(null); setAiStatus("idle"); setAiCommand(""); }} className="rounded-full">
                  <ArrowLeft className="w-5 h-5 rotate-90" />
                </Button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                {aiStatus === "idle" && (
                  <div className="w-full space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Try saying</p>
                    <div className="grid grid-cols-1 gap-2">
                      {["Send 50 to Aizat", "Transfer to Danial", "Pay Ahmad Ali RM 100"].map(hint => (
                        <button 
                          key={hint}
                          onClick={() => handleAICommand(hint)}
                          className="p-4 rounded-2xl bg-foreground/[0.03] border border-border text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all text-left flex justify-between items-center group"
                        >
                          {hint}
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {aiStatus === "typing" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-sm font-medium animate-pulse text-primary">Analyzing command...</p>
                  </div>
                )}

                {aiStatus === "suggesting" && proposal && (
                  <div className="flex flex-col gap-3 w-full max-w-[280px] items-center">
                    <div className="p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm w-fit bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 text-foreground">
                      {proposal.message}
                    </div>
                    
                    {/* Proposal Card */}
                    <div className="w-full overflow-hidden rounded-xl ring-1 ring-foreground/10 glass-card bg-slate-900/40 border-primary/20 p-4 space-y-3">
                      {(() => {
                        const rec = CONTACTS.find(c => c.id === proposal.recipientId)!
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden", rec.color)}>
                                {rec.avatar ? (
                                  <img src={`${basePath}${rec.avatar}`} alt={rec.name} className="w-full h-full object-cover" />
                                ) : (
                                  rec.initials
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-white">{rec.name}</p>
                                  <Badge variant="outline" className="text-[7px] h-3 bg-primary/20 text-primary border-primary/20 px-1 font-black uppercase">Magic Match</Badge>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                  <p className="text-[9px] text-slate-400">{rec.bank} • {rec.account}</p>
                                  <span className="text-[9px] text-emerald-500 font-bold">Verified</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-primary font-bold">Transfer Amount</span>
                                <span className="font-bold text-white">RM {proposal.amount.toFixed(2)}</span>
                              </div>
                              <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                              <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-1">
                                <Send className="w-2 h-2" /> Direct Bank Transfer
                              </span>
                              <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Proposal Preview</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    <div className="flex gap-2 w-full mt-2">
                      <button 
                        onClick={() => handleTransfer(proposal.amount, proposal.recipientId)}
                        className="flex-1 text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => { setProposal(null); setAiStatus("idle"); setAiCommand(""); }}
                        className="flex-1 text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6">
                <div className="relative group">
                  <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
                  <Input 
                    placeholder="Type your command..." 
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAICommand(aiCommand)}
                    className="pl-12 h-14 bg-foreground/[0.03] border-border rounded-2xl text-sm"
                  />
                  <button 
                    onClick={() => handleAICommand(aiCommand)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-24 left-0 right-0 p-4 z-40 bg-gradient-to-t from-background via-background/80 to-transparent pb-6">
        <div className="max-w-lg mx-auto">
          <Button 
            onClick={() => handleTransfer()}
            disabled={!validAmount || isProcessing || hasInsufficientBalance || isSurvivalRestricted}
            className={cn(
              "w-full h-14 font-black rounded-2xl shadow-xl flex gap-2 justify-center items-center transition-all active:scale-[0.97] text-sm",
              hasInsufficientBalance || isSurvivalRestricted
                ? "bg-rose-500/80 text-white cursor-not-allowed" 
                : validAmount
                  ? "bg-primary hover:bg-primary/90 text-white shadow-primary/25"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : hasInsufficientBalance ? (
              "Insufficient Balance"
            ) : isSurvivalRestricted ? (
              "Survival Limit Restricted"
            ) : validAmount ? (
              <>
                Send RM {numAmount.toFixed(2)}
                <Send className="w-4 h-4 ml-1" />
              </>
            ) : (
              "Enter amount to Transfer"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
