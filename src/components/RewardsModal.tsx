"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Gift, Lock, Unlock, Ticket, Award, Calendar, Coffee, Coins, Check, HelpCircle, Flame } from "lucide-react"
import { useStore } from "@/store/useStore"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface RewardsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  const {
    currentStreak,
    membershipTier,
    awfarDrawTickets,
    isBimbMigrated,
    streakShieldActive,
    user,
    moveFundsToAwfarNest,
    triggerBimbMigration,
    activateStreakShield,
    language,
    transactions
  } = useStore()

  const [activeTab, setActiveTab] = useState<'tiers' | 'awfar' | 'maxcash' | 'migration'>('tiers')
  const [awfarAmount, setAwfarAmount] = useState<number>(10)
  const [maxCashAmount, setMaxCashAmount] = useState<number>(1000)
  const [nestedMessage, setNestedMessage] = useState<string>("")
  const [nestedError, setNestedError] = useState<string>("")

  const strings = t[language]

  const todayStr = new Date().toDateString();
  const todaySavings = transactions
    .filter(t => t.type === 'saving' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // Handlers
  const handleAwfarDeposit = () => {
    try {
      setNestedError("")
      setNestedMessage("")
      if (awfarAmount <= 0) {
        setNestedError("Please enter a valid amount.");
        return;
      }
      moveFundsToAwfarNest(awfarAmount)
      setNestedMessage(`Successfully moved RM ${awfarAmount.toFixed(2)} to your Awfar Nest! Unlocked ${Math.floor(awfarAmount / 10)} tickets!`);
    } catch (e: any) {
      setNestedError(e.message || "Failed to transfer funds.");
    }
  }

  // Tiers descriptions
  const tiers = [
    {
      id: 'Bronze',
      name: language === 'en' ? 'Novice' : 'Novice',
      milestone: 'Base level (0–6 Day Streak)',
      perks: [
        'Baseline conversational access to 4 specialized AI Council Agents.',
        'Standard financial diagnostics and roasts.'
      ],
      color: 'from-[#DF0059] to-[#CC0D5A]',
      textColor: 'text-[#DF0059]',
      bg: 'bg-[#FFE9F2]',
      active: true // default
    },
    {
      id: 'Silver',
      name: language === 'en' ? 'Pro' : 'Pro',
      milestone: 'Maintain 7-Day Streak',
      perks: [
        'Unlocks Be U Awfar Nest integration prompts.',
        'Simulate Bank Islam\'s RM15 Million Prize Draw entries (win a Porsche Taycan/BMW i4!).',
        'Unlocks GrabFood RM5 OFF coupon code (BIMBYOUTH5).',
        'Unlocks Koppiku 10% OFF beverage coupon code (KOPIBEU10).'
      ],
      color: 'from-[#237AF9] to-[#1C62C7]',
      textColor: 'text-[#237AF9]',
      bg: 'bg-[#E9F2FE]',
      active: currentStreak >= 7
    },
    {
      id: 'Gold',
      name: language === 'en' ? 'Legend' : 'Legend',
      milestone: 'Maintain 30-Day Streak',
      perks: [
        'Unlocks premium BeU MaxCash Term Deposit-i Hybrid Simulator.',
        'Boosts simulated Growth Starter pocket profit yield rate modifier by +0.5% p.a. (from 6.5% to 7.0% p.a.).',
        'Double entries multiplier into monthly simulated prize raffles.'
      ],
      color: 'from-[#FFC107] to-[#CBA024]',
      textColor: 'text-[#CBA024]',
      bg: 'bg-[#FFFAEA]',
      active: currentStreak >= 30
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50"
          />
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto"
          >
            <Card className="liquid-glass border-primary/20 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="relative p-5 text-center flex-1 overflow-y-auto space-y-4">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="space-y-1 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
                    {currentStreak === 0 ? (
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-slate-400 shrink-0" />
                      </div>
                    ) : (
                      <img
                        src="/assets/API-streak.gif"
                        alt="Streak Mascot"
                        className="w-12 h-12 object-contain"
                        style={{
                          filter: currentStreak < 7
                            ? "hue-rotate(15deg) saturate(2.5) drop-shadow(0 0 6px rgba(249, 115, 22, 0.4))"
                            : currentStreak < 30
                            ? "hue-rotate(200deg) saturate(2.2) drop-shadow(0 0 6px rgba(37, 99, 235, 0.4))"
                            : "hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))"
                        }}
                      />
                    )}
                  </div>
                  <h2 className="text-xl font-black text-black">NextGen Rewards Hub</h2>
                  <p className="text-xs text-slate-500">
                    Your savings streak defines your tier and unlocks institutional privileges.
                  </p>
                </div>

                {/* Quick Info bar */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-1 text-[11px] w-full overflow-hidden">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 font-medium">Streak:</span>
                    <span className="font-extrabold text-black ml-0.5">🔥 {currentStreak} Days</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 font-medium font-bold">Tier:</span>
                    <Badge className={cn(
                      "ml-0.5 font-bold text-[9px] px-1.5 py-0.5 rounded-lg border shrink-0",
                      membershipTier === 'Gold' ? "bg-purple-100 text-purple-700 border-purple-200" :
                      membershipTier === 'Silver' ? "bg-blue-100 text-blue-700 border-blue-200" :
                      "bg-orange-100 text-orange-700 border-orange-200"
                    )}>
                      {membershipTier === 'Gold' ? 'Legend' : membershipTier === 'Silver' ? 'Pro' : 'Novice'}
                    </Badge>
                  </div>
                  {streakShieldActive && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 animate-pulse shrink-0">
                      🛡️ Shield Active
                    </Badge>
                  )}
                </div>

                {/* Today's Saving Quota Progress Bar */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[#FFF7FA] border border-pink-100 shadow-inner w-full">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-600 font-extrabold flex items-center gap-1.5">
                      🎯 {language === 'en' ? "Today's Savings Progress" : "Kemajuan Simpanan Hari Ini"}
                    </span>
                    <span className={cn(
                      "font-black text-xs",
                      todaySavings >= 1.0 ? "text-emerald-600" : "text-[#DF0059]"
                    )}>
                      RM {todaySavings.toFixed(2)} / RM 1.00
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (todaySavings / 1.0) * 100)} 
                    className={cn(
                      "h-2 transition-all duration-500",
                      todaySavings >= 1.0 
                        ? "[&_[data-slot=progress-indicator]]:bg-emerald-500 bg-emerald-100" 
                        : "[&_[data-slot=progress-indicator]]:bg-[#DF0059] bg-pink-100"
                    )}
                  />
                  <p className="text-[8.5px] text-slate-500 font-bold text-center mt-1">
                    {todaySavings >= 1.0 
                      ? (language === 'en' ? "✨ Daily quota met! Tap 'Simulate Next Day' on the dashboard to grow your streak!" : "✨ Kuota harian dipenuhi! Ketik 'Simulasi Hari Seterusnya' di papan pemuka untuk tambahkan streak!")
                      : (language === 'en' ? "💡 Save RM 1.00 or more today to grow your streak tomorrow!" : "💡 Simpan RM 1.00 atau lebih hari ini untuk tingkatkan streak esok!")
                    }
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#F8F8F8] border border-[#F1F1F1] p-1 rounded-xl gap-1">
                  {[
                    { id: 'tiers', label: 'Tiers' },
                    { id: 'awfar', label: 'Awfar Nest' },
                    { id: 'maxcash', label: 'MaxCash TD-i' },
                    { id: 'migration', label: 'BIMB Mig' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setNestedError("");
                        setNestedMessage("");
                      }}
                      className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-sm shadow-[#DF0059]/20'
                          : 'text-[#727272] hover:text-[#DF0059] hover:bg-[#FFE9F2]/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="text-left space-y-3 min-h-[260px]">
                  {activeTab === 'tiers' && (
                    <div className="space-y-3">
                      {tiers.map((t) => {
                        const isCurrent = membershipTier === t.id;
                        return (
                          <div
                            key={t.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-[#FCF0F1] border-[#DF0059]/30 shadow-md ring-2 ring-[#DF0059]/10'
                                : t.active
                                ? 'bg-white border-[#F1F1F1]'
                                : 'bg-[#F8F8F8] border-[#F1F1F1] opacity-60'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-[#221F20]">{t.name}</h4>
                                  {isCurrent && (
                                    <Badge className="bg-[#DF0059] text-white font-bold text-[8px] h-fit border-none shadow-sm">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#727272] font-medium">{t.milestone}</p>
                              </div>
                              <div className={`p-1.5 rounded-lg ${t.bg}`}>
                                {t.active ? (
                                  <Unlock className={`w-3.5 h-3.5 ${t.textColor}`} />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-[#B2B2B2]" />
                                )}
                              </div>
                            </div>

                            <ul className="space-y-1.5 pl-1">
                              {t.perks.map((perk, idx) => (
                                <li key={idx} className="text-[10px] text-[#555555] flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-[#49B9B3] shrink-0 mt-0.5" />
                                  <span>{perk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {activeTab === 'awfar' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-500 to-[#237AF9] rounded-2xl p-4 text-white space-y-3 relative overflow-hidden shadow-lg shadow-blue-500/10">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                          <Ticket className="w-32 h-32" />
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black tracking-widest uppercase opacity-75">BIMB PROMOTION</span>
                            <h4 className="text-base font-black">Awfar RM15 Million Draw</h4>
                          </div>
                          <Badge className="bg-white/20 text-white border-none font-bold text-[9px] px-2 py-0.5">
                            Active Campaign
                          </Badge>
                        </div>
                        <p className="text-[10px] text-white/90 leading-relaxed font-medium">
                          Simulating the real-world prize draw where university savers stand a chance to win a Porsche Taycan, BMW i4, or cash bonuses. Every RM10 saved in your Be U Awfar Nest gains you 1 ticket.
                        </p>
                        <div className="flex items-center gap-4 pt-1.5">
                          <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                            <Ticket className="w-4 h-4 text-yellow-300" />
                            <div>
                              <p className="text-[8px] text-white/70 leading-none">Your Draw Tickets</p>
                              <p className="text-sm font-black tabular-nums">{awfarDrawTickets} tickets</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Locked check for Silver Saver (7+ Days) */}
                      {currentStreak < 7 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
                          <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-800">Awfar Nest Locked</h4>
                          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                            Requires a **7-Day Saving Streak** (Silver Saver Tier) to unlock Awfar Nest saving triggers. Keep staying in the green!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Simulate Awfar Lock (RM)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={awfarAmount}
                                onChange={(e) => setAwfarAmount(Number(e.target.value))}
                                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-black font-semibold"
                                placeholder="Amount to lock"
                              />
                              <button
                                onClick={handleAwfarDeposit}
                                className="px-4 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-95 transition-opacity"
                              >
                                Lock to Nest
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-400">Available Wallet Balance: RM {user.currentBalance.toFixed(2)}</span>
                          </div>

                          {nestedMessage && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] rounded-xl font-medium">
                              {nestedMessage}
                            </div>
                          )}

                          {nestedError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] rounded-xl font-medium">
                              {nestedError}
                            </div>
                          )}

                          <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-3 space-y-2">
                            <h5 className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-primary" /> Active Merchant Coupons Unlocked</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 border border-slate-200 rounded-lg bg-white space-y-0.5">
                                <p className="text-[8px] text-slate-400 font-bold uppercase">GrabFood RM5 OFF</p>
                                <p className="text-xs font-black text-black">BIMBYOUTH5</p>
                              </div>
                              <div className="p-2 border border-slate-200 rounded-lg bg-white space-y-0.5">
                                <p className="text-[8px] text-slate-400 font-bold uppercase">Koppiku 10% OFF</p>
                                <p className="text-xs font-black text-black">KOPIBEU10</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'maxcash' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-amber-500 to-[#CBA024] rounded-2xl p-4 text-white space-y-3 relative overflow-hidden shadow-lg shadow-amber-500/10">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                          <Coins className="w-32 h-32" />
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black tracking-widest uppercase opacity-75">PREMIUM PRODUCT</span>
                            <h4 className="text-base font-black">TD-i MaxCash 2026</h4>
                          </div>
                          <Badge className="bg-white/20 text-white border-none font-bold text-[9px] px-2 py-0.5">
                            5.20% p.a. Simulated
                          </Badge>
                        </div>
                        <p className="text-[10px] text-white/90 leading-relaxed font-medium">
                          The simulated Be U Term Deposit-i (TD-i) MaxCash campaign allows you to place idle funds in 6-month deposits. Normal yield: 3.5%, MaxCash yield: 5.2% p.a.
                        </p>
                      </div>

                      {/* Locked check for Gold Guardian (30+ Days) */}
                      {currentStreak < 30 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
                          <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-800">MaxCash TD-i Locked</h4>
                          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                            Requires a **30-Day Saving Streak** (Gold Guardian Tier) to unlock simulated access to fixed Term Deposit instruments. Keep going!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">TD-i Interest Optimizer Simulator</label>
                            <div className="space-y-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Investment Amount:</span>
                                <input
                                  type="number"
                                  value={maxCashAmount}
                                  onChange={(e) => setMaxCashAmount(Number(e.target.value))}
                                  className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-bold text-black"
                                />
                              </div>

                              <div className="border-t border-slate-200 my-2 pt-2 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Standard Yield (3.5% p.a.):</span>
                                  <span className="font-semibold text-slate-700">RM {(maxCashAmount * 0.035 / 2).toFixed(2)} (6-mos)</span>
                                </div>
                                <div className="flex justify-between font-bold text-primary">
                                  <span>MaxCash Hybrid Yield (5.2% p.a.):</span>
                                  <span>RM {(maxCashAmount * 0.052 / 2).toFixed(2)} (6-mos)</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-emerald-600 font-bold border-t border-dashed border-slate-200 pt-1.5">
                                  <span>Your Gold Profit Increment:</span>
                                  <span>+ RM {((maxCashAmount * 0.052 / 2) - (maxCashAmount * 0.035 / 2)).toFixed(2)} Extra!</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-normal">
                              * Note: Tying your savings to Gold Guardian tier also automatically boosts your standard savings pockets rate in the store from 6.5% to 7.0% p.a.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'migration' && (
                    <div className="space-y-4">
                      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-2.5">
                        <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                          July 31, 2026 Migration Countdown
                        </h4>
                        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                          Bank Islam will officially transition Be U app accounts into the main BIMB Mobile app. Protect your data now! Export your simulated "Financial Passport" records to ensure seamless migration.
                        </p>
                      </div>

                      <Card className="border border-slate-200 shadow-inner p-4 bg-slate-50 rounded-xl space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-bold text-slate-800">Financial Passport Data</h4>
                            <p className="text-[9px] text-slate-500">Includes Streaks, Tier Records & Savings Pockets</p>
                          </div>
                          <Badge className={isBimbMigrated ? "bg-emerald-500 text-white font-bold" : "bg-slate-300 text-slate-700"}>
                            {isBimbMigrated ? "Linked to BIMB" : "Not Linked"}
                          </Badge>
                        </div>

                        {isBimbMigrated ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center space-y-2">
                            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                            <h5 className="text-xs font-bold text-emerald-800">Migration Confirmed!</h5>
                            <p className="text-[9px] text-emerald-600 leading-normal max-w-xs mx-auto">
                              Your streak data, Awfar draw tickets, and active loyalty bonuses are secured for BIMB Mobile App integration.
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={triggerBimbMigration}
                            className="w-full h-10 bg-primary text-white font-extrabold text-xs rounded-xl hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                          >
                            Migrate Data to BIMB Mobile
                          </button>
                        )}
                      </Card>

                      <div className="p-3 bg-blue-50 border border-blue-100 text-[10px] text-blue-800 rounded-xl space-y-1">
                        <p className="font-extrabold flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> What is a Streak Shield?</p>
                        <p className="leading-relaxed">
                          Sharing your custom de-influencing roast quote or passport milestones on TikTok or Instagram generates a "Streak Shield". You can activate it once a week to protect your savings streak for 24 hours if you overspend!
                        </p>
                        <div className="pt-1.5">
                          {streakShieldActive ? (
                            <Badge className="bg-blue-500 text-white border-none font-bold text-[9px]">
                              Shield Ready
                            </Badge>
                          ) : (
                            <button
                              onClick={activateStreakShield}
                              className="px-2.5 py-1 bg-blue-600 text-white font-bold text-[9px] rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Simulate Claiming Streak Shield
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>

              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
