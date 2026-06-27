"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { Pet } from "@/components/ui/Pet"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Sparkles, X, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useStore } from "@/store/useStore"
import { useCoachChat } from "@/hooks/useCoachChat"
import { COMPANIONS, canUnlockCompanion } from "./coach/constants"
import { CoachInputBar } from "./coach/CoachInputBar"
import { VoiceOverlay } from "./coach/VoiceOverlay"
import { CoachMessages } from "./coach/CoachMessages"
import { RewardsModal } from "./RewardsModal"
import { Brain, Target, Shield, Send, TrendingUp } from "lucide-react"

export function Coach() {
  const { user, transactions, language, pet, currentStreak, membershipTier, selectedCompanion, setSelectedCompanion, safeDailySpend } = useStore()
  const strings = t[language]
  
  const todayStr = new Date().toDateString();
  const todaySavings = transactions
    .filter(t => t.type === 'saving' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [showCompanionModal, setShowCompanionModal] = useState(false)

  const {
    messages,
    input,
    setInput,
    isThinking,
    activeAgent,
    isExecuting,
    undoToast,
    setUndoToast,
    isListening,
    interimTranscript,
    toggleListening,
    handleAction,
    sendMessage,
    clearChat,
  } = useCoachChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setIsAtBottom(distFromBottom < 100)
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsAtBottom(true)
  }

  const starterPrompts = [
    { text: strings.coachChipSafe, icon: Brain, color: "text-amber-500" },
    { text: strings.coachChipSave, icon: Target, color: "text-emerald-500" },
    { text: strings.coachChipLimit, icon: Shield, color: "text-pink-600" },
    { text: strings.coachChipInvest, icon: TrendingUp, color: "text-blue-500" },
    { text: strings.coachChipTransfer, icon: Send, color: "text-primary" }
  ]

  return (
    <div className="fixed inset-0 flex flex-col max-w-lg mx-auto overflow-hidden bg-[#FFE9F2] text-[#221F20] z-50 [color-scheme:light]">
      <img
        src={`${basePath}/assets/bot.gif`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-18 mix-blend-soft-light pointer-events-none"
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,rgba(223,0,89,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.90),rgba(255,233,242,0.86))]" />
      
      {/* Top Header */}
      <header className="p-4 bg-white/88 backdrop-blur-xl border-b border-pink-100 shadow-sm shadow-pink-100/40 z-20 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F8F8F8] hover:bg-[#FFE9F2] border border-pink-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#727272]" />
            </Link>
            <div className="w-10 h-10 flex items-center justify-center">
              <Pet animation={(pet.animation as any) || (isThinking ? "think" : "idle")} size={40} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-[#221F20]">{strings.coachHeader}</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-[#727272] uppercase tracking-widest font-bold">
                  {COMPANIONS.find(c => c.id === selectedCompanion)?.name || "Uteh"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                const text = messages.map(m => {
                  let content = m.content;
                  if (m.structured) {
                    content = `[${m.structured.headline}] ${m.structured.insight}\n${m.structured.lesson ? `Lesson: ${m.structured.lesson}` : ''}`;
                  }
                  return `[${m.role.toUpperCase()}] ${m.agent ? m.agent + ': ' : ''}${content}`;
                }).join('\n\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'financial-coach-history.txt';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 100);
              }}
              className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center border border-pink-100 hover:bg-[#FFE9F2] transition-colors"
              title="Export Chat"
            >
              <Download className="w-4 h-4 text-[#727272]" />
            </button>
            <button
              onClick={clearChat}
              className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center border border-pink-100 hover:bg-rose-50 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
            <Badge 
              variant="outline" 
              className="text-[9px] font-black text-white tracking-widest px-2.5 py-1 rounded-full cursor-pointer transition-all duration-300 border-none bg-gradient-to-r from-[#DF0059] via-[#CC0D5A] to-[#FF6B6B] shadow-md shadow-[#DF0059]/40 hover:shadow-lg hover:shadow-[#DF0059]/60 hover:scale-110 active:scale-95 flex items-center gap-1 animate-pulse"
              style={{ animationDuration: '3s' }}
              onClick={() => setShowCompanionModal(true)}
            >
              <Sparkles className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
              CUSTOM
            </Badge>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* Dynamic Streak, Tier, and Rewards Pills */}
        <div className="px-4 py-2.5 bg-white/60 backdrop-blur-md border-b border-pink-100/40 shadow-sm shrink-0 z-20">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className={cn(
              "flex-1 px-2.5 py-1.5 rounded-full border text-center flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold transition-all duration-300 whitespace-nowrap backdrop-blur-md shadow-sm",
              todaySavings < 1.0 ? "bg-slate-100/80 border-slate-200 text-slate-400 grayscale opacity-70" :
              currentStreak < 7 ? "bg-gradient-to-r from-[#FFFAEA]/80 to-[#FFE9F2]/60 border-[#FFF4D5] text-[#CBA024]" :
              currentStreak < 30 ? "bg-gradient-to-r from-[#E9F2FE]/80 to-[#FFE9F2]/60 border-[#D3E4FE] text-[#1C62C7]" :
              "bg-gradient-to-r from-[#FAE7EF]/80 to-[#FFE9F2]/60 border-[#F3C7D8] text-[#CC0D5A]"
            )}>
              <span>🔥 {currentStreak} {language === 'en' ? 'Day Streak' : 'Hari Streak'}</span>
            </div>

            <div className={cn(
              "flex-1 px-2.5 py-1.5 rounded-full border text-center flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold transition-all duration-300 whitespace-nowrap backdrop-blur-md shadow-sm",
              membershipTier === 'Legend' ? "bg-gradient-to-r from-[#FAE7EF]/80 to-[#FFE9F2]/60 border-[#F3C7D8] text-[#DF0059]" :
              membershipTier === 'Pro' ? "bg-gradient-to-r from-[#E9F2FE]/80 to-[#FFE9F2]/60 border-[#D3E4FE] text-[#1C62C7]" :
              "bg-gradient-to-r from-[#FFFAEA]/80 to-[#FFE9F2]/60 border-[#FFF4D5] text-[#CBA024]"
            )}>
              <span>
                {membershipTier === 'Legend' ? '🏆 Legend' :
                 membershipTier === 'Pro' ? '🥈 Pro' :
                 '🥉 Novice'}
              </span>
            </div>

            <button 
              onClick={() => setShowRewardsModal(true)}
              className="flex-1 px-2.5 py-1.5 rounded-full border bg-gradient-to-r from-[#DF0059]/10 via-[#CC0D5A]/15 to-[#E06E9C]/10 border-[#E06E9C]/30 text-[#CC0D5A] shadow-sm flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold hover:bg-gradient-to-r hover:from-[#DF0059]/20 hover:to-[#CC0D5A]/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-[#DF0059] animate-pulse" />
              <span>{language === 'en' ? 'Rewards & Perks ✨' : 'Ganjaran ✨'}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!isAtBottom && (
            <motion.button
              key="scroll-btn"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 border border-pink-100 backdrop-blur-md flex items-center justify-center shadow-lg shadow-pink-100/60 hover:bg-white active:scale-95 transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronLeft className="w-4 h-4 text-primary rotate-[-90deg]" />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 scroll-smooth bg-transparent"
        >
          <div className="space-y-6 py-6 min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col justify-start h-full pt-2"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-medium text-[#727272] mb-1">Hi {user.name}</h2>
                    <h1 className="text-3xl font-black tracking-tight text-[#221F20]">Where should we start?</h1>
                  </div>

                  {/* A1: Financial Health Dashboard */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/80 border border-emerald-100 rounded-2xl shadow-sm">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Balance</div>
                      <div className="text-lg font-black text-[#221F20]">RM {user.currentBalance.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-white/80 border border-blue-100 rounded-2xl shadow-sm">
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Safe Daily Spend</div>
                      <div className="text-lg font-black text-[#221F20]">RM {safeDailySpend.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {starterPrompts.map((prompt, i) => (
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={prompt.text}
                        onClick={() => sendMessage(prompt.text)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/90 border border-white/80 hover:bg-white transition-all text-left group shadow-sm shadow-pink-100/50"
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-[#F8F8F8] shrink-0", prompt.color)}>
                          <prompt.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-[#555555] group-hover:text-primary transition-colors">
                          {prompt.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  <CoachMessages
                    messages={messages}
                    isExecuting={isExecuting}
                    handleAction={handleAction}
                  />
                  {(isThinking || isExecuting) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2 pt-6">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20">
                          <Pet animation="think" size={32} />
                        </div>
                        <div className="p-3 rounded-2xl bg-white/95 border border-pink-100 flex gap-1 items-center shadow-sm">
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                          <span className="text-[9px] text-muted-foreground ml-2 font-medium">
                            {isExecuting 
                              ? "Executing secure transaction..." 
                              : activeAgent 
                                ? `${activeAgent} is analyzing...` 
                                : "Council is deliberating..."}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
            <div ref={bottomRef} className="h-px" />
          </div>

          <AnimatePresence>
            {undoToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-4 right-4 z-40 bg-zinc-900 text-white rounded-xl shadow-xl px-4 py-3 flex items-center justify-between"
              >
                <span className="text-xs font-medium">{undoToast.message}</span>
                <button
                  onClick={() => {
                    undoToast.onUndo();
                    setUndoToast(null);
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-zinc-800 px-3 py-1.5 rounded-lg active:scale-95"
                >
                  UNDO
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CoachInputBar
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isThinking={isThinking}
        isExecuting={isExecuting}
        isListening={isListening}
        toggleListening={toggleListening}
        messagesLength={messages.length}
        strings={strings}
      />

      {showCompanionModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCompanionModal(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800">Customize Companion</h3>
                <p className="text-[10px] text-slate-500">Unlock more as you rank up!</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCompanionModal(false)} className="rounded-full w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {COMPANIONS.map(c => {
                const unlocked = canUnlockCompanion(c.tierRequired, membershipTier);
                const isSelected = selectedCompanion === c.id;
                return (
                  <button
                    key={c.id}
                    disabled={!unlocked}
                    onClick={() => {
                      setSelectedCompanion(c.id);
                      setShowCompanionModal(false);
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300",
                      isSelected ? "border-emerald-500 bg-emerald-50/50" : unlocked ? "border-slate-100 hover:border-slate-300 hover:bg-slate-50" : "border-slate-100 opacity-50 grayscale cursor-not-allowed bg-slate-50"
                    )}
                  >
                    <div className="w-14 h-14 relative flex items-center justify-center overflow-hidden">
                      <Pet animation="walk" companionId={c.id} size={56} />
                    </div>
                    <div className="text-center w-full">
                      <p className="text-sm font-black text-slate-800">{c.name}</p>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block",
                        c.tierRequired === 'Novice' ? "bg-orange-100 text-orange-700" :
                        c.tierRequired === 'Pro' ? "bg-blue-100 text-blue-700" :
                        "bg-pink-100 text-pink-700"
                      )}>
                        {c.label} {unlocked ? "" : "🔒"}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
      />

      <VoiceOverlay isListening={isListening} interimTranscript={interimTranscript} />
    </div>
  )
}
