"use client"

import { useState, useEffect } from "react"
import { useStore, SavingsPocket } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Plus, ArrowUpRight, Pencil, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { SavingsModal } from "./SavingsModal"
import { DepositModal } from "./DepositModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { AutoSaveModal } from "./AutoSaveModal"

export function Savings() {
  const { savingsPockets, language, isAutoSaveActive, toggleAutoSave, autoSaveTargetIds, autoSaveFrequency, autoSaveAmount, pendingMainGoal } = useStore()
  const strings = t[language]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isAutoSaveModalOpen, setIsAutoSaveModalOpen] = useState(false)
  const [selectedPocket, setSelectedPocket] = useState<SavingsPocket | null>(null)
  const [editPocket, setEditPocket] = useState<SavingsPocket | null>(null)

  // Hydration guard for Next.js persisted state
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  // Auto-trigger modal on mount if onboarding goal is pending
  useEffect(() => {
    if (hasHydrated && pendingMainGoal) {
      setEditPocket(null)
      setIsModalOpen(true)
    }
  }, [pendingMainGoal, hasHydrated])

  const handleOpenDeposit = (pocket: SavingsPocket) => {
    setSelectedPocket(pocket)
    setIsDepositOpen(true)
  }

  const handleEditPocket = (pocket: SavingsPocket) => {
    setEditPocket(pocket)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (pocket: SavingsPocket) => {
    setSelectedPocket(pocket)
    setIsDeleteOpen(true)
  }

  const handleAddPocket = () => {
    setEditPocket(null)
    setIsModalOpen(true)
  }

  const handleToggleAutoSave = () => {
    if (isAutoSaveActive) {
      toggleAutoSave()
    } else {
      setIsAutoSaveModalOpen(true)
    }
  }

  if (!hasHydrated) return null;

  // Sort pockets: primary goals always on top
  const sortedPockets = [...savingsPockets].sort((a, b) => {
    const aMain = a.isMainGoal ? 1 : 0;
    const bMain = b.isMainGoal ? 1 : 0;
    return bMain - aMain;
  })

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header section with vivid gradient title and standout Add Button */}
      <header className="flex justify-between items-end relative overflow-hidden z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#DF0059] text-glow" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-[#DF0059] via-[#CC0D5A] to-[#FF6B6B] bg-clip-text text-transparent">
              {strings.saveHeader}
            </h1>
          </div>
          <p className="text-[#727272] text-xs font-semibold tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DF0059] animate-pulse" />
            {strings.saveSubheader}
          </p>
        </div>
        <button
          onClick={handleAddPocket}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DF0059] to-[#CC0D5A] hover:from-[#CC0D5A] hover:to-[#DF0059] flex items-center justify-center text-white shadow-lg shadow-[#DF0059]/20 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Redesigned Auto-Save Card with Standout Gradient Backdrop */}
      <div className="space-y-3 relative z-10">
        <Card className={cn(
          "border transition-all duration-300 rounded-3xl overflow-hidden",
          isAutoSaveActive 
            ? "bg-gradient-to-r from-[#FFE9F2] via-[#FAE7EF]/50 to-[#FFE9F2]/20 border-[#F5CFDE] shadow-lg shadow-[#DF0059]/5" 
            : "bg-white/70 border-slate-200/80 opacity-90 shadow-sm"

        )}>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("w-4 h-4", isAutoSaveActive ? "text-[#DF0059]" : "text-[#727272]")} />
                <p className={cn("text-xs font-black uppercase tracking-wider", isAutoSaveActive ? "text-[#DF0059]" : "text-[#727272]")}>{strings.saveSmartAuto}</p>
                {!isAutoSaveActive && (
                  <Badge variant="outline" className="text-[8px] h-4 border-slate-300 text-slate-500 bg-slate-50 font-bold">
                    PAUSED
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-[#727272] font-semibold leading-normal max-w-[240px]">
                {isAutoSaveActive 

                  ? `Moving RM ${autoSaveAmount.toFixed(2)} ${autoSaveFrequency} to ${autoSaveTargetIds.length === savingsPockets.length ? "All Pockets" : `${autoSaveTargetIds.length} Pockets`}`
                  : "Automatically grow your savings while you sleep."
                }
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {isAutoSaveActive && (
                <button
                  onClick={() => setIsAutoSaveModalOpen(true)}
                  className="p-1.5 rounded-xl hover:bg-[#FFE9F2] text-[#727272] hover:text-[#DF0059] transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <Button
                size="sm"
                onClick={handleToggleAutoSave}
                className={cn(
                  "text-[9px] h-7 font-black transition-all px-4 rounded-xl shadow-md uppercase tracking-wider",
                  isAutoSaveActive 
                    ? "bg-[#DF0059]/10 text-[#DF0059] border border-[#DF0059]/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 shadow-none" 
                    : "bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-[#DF0059]/20 hover:scale-105"

                )}
              >
                {isAutoSaveActive ? "Stop" : "Activate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redesigned Savings Hub */}
      <div className="space-y-4 relative z-10">
        <h3 className="text-xs font-bold text-[#727272] uppercase tracking-widest px-1">{strings.saveActiveGoals}</h3>
        {sortedPockets.map((pocket, i) => {
          const isTargeted = autoSaveTargetIds.includes(pocket.id);
          const isActive = isAutoSaveActive && isTargeted;
          const isGrowth = pocket.mode === 'growth';
          const isMain = pocket.isMainGoal;

          const pocketNameMap: Record<string, string> = {
            '1': strings.savePocketEmerg,
            '2': strings.savePocketLaptop,
            '3': strings.savePocketRent,
          };
          const displayName = pocketNameMap[pocket.id] || pocket.name;

          return (
            <motion.div
              key={pocket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(isMain && "sticky top-2 z-20")}
            >
              <Card className={cn(
                "overflow-hidden group transition-all duration-300 rounded-3xl border shadow-md",
                isActive && "border-[#DF0059]/20 bg-gradient-to-b from-[#FFE9F2]/30 to-white shadow-lg shadow-[#DF0059]/5",
                isMain 
                  ? "border-[#DF0059]/35 bg-gradient-to-b from-[#FFE9F2] to-white/95 shadow-xl shadow-pink-500/10 scale-[1.02] backdrop-blur-md" 
                  : "bg-white/80 border-[#F5CFDE] hover:border-[#DF0059]/30"
              )}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all duration-500",
                          isMain 
                            ? "bg-gradient-to-br from-[#DF0059] to-[#CC0D5A] text-white scale-110 shadow-md shadow-[#DF0059]/25 text-3xl" 
                            : isGrowth 
                              ? "bg-gradient-to-br from-[#FFE9F2] to-[#F5CFDE] text-[#DF0059] scale-105 shadow-inner" 
                              : "bg-[#F8F8F8] text-[#221F20]"

                        )}>
                          {pocket.icon}
                        </div>
                        {isActive && (
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"

                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn("text-sm font-black text-[#221F20]", isMain && "text-[#DF0059] text-base drop-shadow-sm")}>
                            {displayName}
                          </p>
                          {isMain && (
                            <Badge className="text-[8px] h-4 bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white border-none shadow-sm shadow-[#DF0059]/20 px-2 font-black uppercase tracking-wider animate-pulse shrink-0">

                              🎯 Primary
                            </Badge>
                          )}
                          {isGrowth && (
                            <Badge className="text-[8px] h-4 bg-[#E9F2FE] text-[#237AF9] border border-[#D3E4FE] px-1.5 font-black shrink-0">

                              {strings.saveInvestedBadge}
                            </Badge>
                          )}
                          {isActive && (
                            <span className="text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">

                              ✨ Funding
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-[#727272] font-bold">
                            RM {pocket.current.toFixed(2)} <span className="opacity-60">/</span> RM {pocket.target}
                          </p>
                          {isGrowth && (
                            <span className="text-[8px] text-emerald-600 font-extrabold">+4.2% p.a.</span>

                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEditPocket(pocket)}
                        className="p-1.5 rounded-xl hover:bg-[#FFE9F2] text-[#727272] hover:text-[#DF0059] transition-all duration-300"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(pocket)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/10 text-[#727272] hover:text-rose-500 transition-all duration-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#727272] font-bold">Progress</span>
                        {isGrowth && (
                          <span className="text-[9px] text-[#237AF9] font-bold capitalize">({pocket.riskLevel} Risk)</span>
                        )}
                      </div>
                      <span className={cn("font-black text-[#DF0059]", isMain && "text-[#CC0D5A] drop-shadow-sm")}>
                        {Math.round((pocket.current / pocket.target) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(pocket.current / pocket.target) * 100} 
                      className={cn(
                        "h-2 bg-[#FFE9F2]", 
                        isMain 
                          ? "[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[#DF0059] [&_[data-slot=progress-indicator]]:to-[#FF6B6B] [&_[data-slot=progress-track]]:bg-[#FFE9F2]/60" 
                          : "[&_[data-slot=progress-indicator]]:bg-[#DF0059]"
                      )} 
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {isGrowth && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">

                          <TrendingUp className="w-2.5 h-2.5" /> Growth Enabled
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleOpenDeposit(pocket)}
                      className={cn("text-[10px] text-[#DF0059] font-black flex items-center gap-1 hover:gap-1.5 transition-all duration-300", isMain && "text-[#CC0D5A]")}
                    >
                      {strings.saveAddFunds} <ArrowUpRight className="w-3.5 h-3.5" />

                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <SavingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editPocket={editPocket}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        pocket={selectedPocket}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        pocket={selectedPocket}
      />

      <AutoSaveModal
        isOpen={isAutoSaveModalOpen}
        onClose={() => setIsAutoSaveModalOpen(false)}
      />
    </div>
  )
}
