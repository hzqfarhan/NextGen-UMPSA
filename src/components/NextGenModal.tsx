import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, HeartPulse, Wallet, Target, X, Zap } from "lucide-react"
import { useStore } from "@/store/useStore"
import { t } from "@/lib/translations"

interface NextGenModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
}

export function NextGenModal({ isOpen, onClose, score }: NextGenModalProps) {
  const { language, nextGenCashflowScore, nextGenSavingsScore, nextGenDebtScore } = useStore()
  const strings = t[language]

  // Determine status color and text based on score
  const statusColor = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-primary" : "text-amber-500"
  const statusBg = score >= 80 ? "bg-emerald-500/10" : score >= 60 ? "bg-primary/10" : "bg-amber-500/10"
  const statusText = score >= 80 ? strings.resModalExcellent : score >= 60 ? strings.resModalStable : strings.resModalNeedsAttention

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50"
          >
            <Card className="liquid-glass border-primary/20 shadow-2xl overflow-hidden">
              <div className="relative p-6 text-center space-y-6">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <div className={`mx-auto w-24 h-24 rounded-full ${statusBg} flex items-center justify-center mb-4 ring-8 ring-white/50`}>
                    <HeartPulse className={`w-10 h-10 ${statusColor}`} />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">{score}%</h2>
                  <p className={`text-sm font-bold uppercase tracking-widest ${statusColor}`}>{statusText}</p>
                  <p className="text-xs text-slate-500 pt-1 px-4">
                    {strings.resModalDesc}
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-primary" /> {strings.resModalCashflow}</span>
                      <span className="text-primary font-bold">{nextGenCashflowScore}%</span>
                    </div>
                    <Progress value={nextGenCashflowScore} className="h-2 bg-primary/10" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-emerald-500" /> {strings.resModalSavings}</span>
                      <span className="text-emerald-600">{nextGenSavingsScore}%</span>
                    </div>
                    <Progress value={nextGenSavingsScore} className="h-2 bg-emerald-100" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-pink-600" /> {strings.resModalDebt}</span>
                      <span className="text-pink-700">{nextGenDebtScore}%</span>
                    </div>
                    <Progress value={nextGenDebtScore} className="h-2 bg-pink-100" />
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-left flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg h-fit">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary mb-1">{strings.resModalAI}</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      {strings.resModalAIDesc}
                    </p>
                  </div>
                </div>

              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
