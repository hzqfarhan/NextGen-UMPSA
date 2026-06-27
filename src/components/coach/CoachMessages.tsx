import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Pet } from "@/components/ui/Pet"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { useStore } from "@/store/useStore"
import { AGENTS } from "./constants"
import { Message, ChatAction } from "./types"
import { StructuredCard } from "./StructuredCard"
import { ProposalCard } from "./ProposalCard"

interface CoachMessagesProps {
  messages: Message[];
  isExecuting: boolean;
  handleAction: (action: ChatAction) => void;
}

export function CoachMessages(props: CoachMessagesProps) {
  const { messages, isExecuting, handleAction } = props;
  const { user, savingsPockets, calculateDailyLimitForBalance, activateStreakShield } = useStore();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <motion.div
      key="chat-history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {messages.map((m, i) => {
        const agent = AGENTS.find(a => a.name === m.agent)
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col gap-1",
              m.role === 'user' ? "items-end" : "items-start"
            )}
          >
            {m.role === 'assistant' && (
              <span className={cn("text-[8px] font-bold uppercase tracking-widest ml-11", agent?.color)}>
                {m.agent}
              </span>
            )}
            <div className={cn(
              "flex gap-3",
              m.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                m.role === 'assistant' ? cn(agent?.bg, "border-pink-100") : "bg-[#F8F8F8] border-pink-100 text-[#727272]"
              )}>
                {m.role === 'assistant' ? (
                  agent ? <agent.icon className={cn("w-4 h-4", agent.color)} /> : <Pet animation="idle" size={32} />
                ) : (
                  <img
                    src={`${basePath}/assets/pfp/user.png`}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <div className={cn("flex flex-col gap-3 max-w-[90%]", m.role === 'user' ? "items-end" : "items-start")}>
                {m.structured ? (
                  <StructuredCard message={m} />
                ) : (
                  <div className={cn(
                    "p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm w-fit",
                    m.role === 'assistant' ? "bg-white/95 border border-pink-100 text-[#221F20]" : "bg-primary text-white font-medium"
                  )}>
                    {m.content}
                    {m.isFallbackModel && (
                      <div className="mt-2 text-[8px] text-amber-500 font-bold flex items-center gap-1">
                        ⚠️ High traffic. Using fallback model.
                      </div>
                    )}
                    {m.role === 'assistant' && (
                      <div className="mt-2.5 pt-2 border-t border-pink-100 flex justify-between items-center gap-4">
                        <span className="text-[8px] text-[#727272]">Share to get Streak Shield + RM10!</span>
                        <button
                          onClick={() => {
                            activateStreakShield();
                            useStore.setState((s) => ({
                              user: { ...s.user, currentBalance: s.user.currentBalance + 10 }
                            }));
                            showToast("Passport generated! 🛡️ Streak Shield activated & RM10 added!");
                          }}
                          className="px-2 py-0.5 rounded-lg bg-pink-100 text-[#CC0D5A] hover:bg-pink-200 text-[8px] font-extrabold transition-all"
                        >
                          📢 Share Roast
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {m.structured && m.isFallbackModel && (
                  <div className="mt-1 text-[8px] text-amber-500 font-bold flex items-center gap-1">
                    ⚠️ High traffic. Using fallback model.
                  </div>
                )}

                {/* Redirect Button */}
                {m.redirect && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      href={m.redirect.href}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                    >
                      {m.redirect.label}
                      <TrendingUp className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )}

                {/* Proposal Card Rendering */}
                {m.proposal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[280px]"
                  >
                    <ProposalCard 
                      message={m} 
                      onAction={handleAction} 
                      isExecuting={isExecuting}
                    />
                  </motion.div>
                )}

                {m.actions && m.actions.length > 0 && (
                  <div className="flex gap-2 mt-1 w-full max-w-[280px]">
                    {m.actions.map((action: ChatAction) => (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action)}
                        className={cn(
                          "flex-1 text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center",
                          (action.type === 'create_pocket' || action.type === 'transfer')
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                        )}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-50 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
