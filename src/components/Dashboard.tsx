"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, AlertTriangle, ShieldCheck, Wallet, Settings as SettingsIcon, Send, History, CalendarClock, RefreshCw, Eye, EyeOff, Sparkles, Flame, X, Download, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { SpendGuardModal } from "./BudgetGuardModal"
import { NextGenModal } from "./NextGenModal"
import { TopUpModal } from "./TopUpModal"
import { RewardsModal } from "./RewardsModal"
import Link from "next/link"
import { t } from "@/lib/translations"
import { BalanceDetailDrawer } from "./BalanceDetailDrawer"
import { Switch } from "@/components/ui/switch"
import { useRef } from "react"
import { StreakShareCard } from "./StreakShareCard"

export function Dashboard() {
  const {
    user,
    nextGenScore,
    safeDailySpend,
    initialSafeDaily,
    transactions,
    cashflowRisk,
    debtRiskScore,
    language,
    processAutoSave,
    simulateGrowth,
    isSpendGuardActive,
    showSpendOnly,
    savingsPockets,
    hideBalance,
    setHideBalance,
    currentStreak,
    highestStreak,
    membershipTier,
    streakShieldActive,
    simulateNextDay
  } = useStore()
  const bills = useStore(state => state.bills)

  const lockedAmount = bills
    .filter(b => b.isLocked && b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const spendableBalance = user.currentBalance - lockedAmount;
  const totalAssets = user.currentBalance + savingsPockets.reduce((sum, p) => sum + p.current, 0);
  const todaySavings = transactions
    .filter(t => t.type === 'saving' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);
  const [showGuardModal, setShowGuardModal] = useState(false)
  const [showNextGenModal, setShowNextGenModal] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showRewardsModal, setShowRewardsModal] = useState(false)

  const shareCardRef = useRef<HTMLDivElement>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleShareNative = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsGenerating(true);
      const domtoimage = (await import('dom-to-image')).default;
      const dataUrl = await domtoimage.toPng(shareCardRef.current, { quality: 1.0 });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'streak.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Saving Streak',
          text: `I just hit a ${currentStreak}-day streak on Be U: NextGen! 🚀`,
          files: [file]
        });
      } else {
        const link = document.createElement('a');
        link.download = 'my-streak.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error sharing streak:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleDownloadImage = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsGenerating(true);
      const domtoimage = (await import('dom-to-image')).default;
      const dataUrl = await domtoimage.toPng(shareCardRef.current, { quality: 1.0 });

      const link = document.createElement('a');
      link.download = 'my-streak.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading streak image:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false)
  const [safeDailyView, setSafeDailyView] = useState<'quota' | 'average'>('quota')
  const strings = t[language]

  // Calculate today's spending & quota remaining
  const todayStr = new Date().toDateString()
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0)
  const quotaRemaining = initialSafeDaily - todayExpenses

  // Hydration guard for Next.js persisted state
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    setHasHydrated(true)
    useStore.getState().checkAndRefreshDailyQuota()
    processAutoSave()
    simulateGrowth()
    useStore.getState().updateNextGenScore()
  }, [])

  const getDaysRemaining = () => {
    if (user.incomeSource === "fixed" && user.fixedFrequency === "weekly" && user.weeklyPayDay) {
      const daysMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
      };
      const targetIndex = daysMap[user.weeklyPayDay.toLowerCase()] ?? 5;
      const today = new Date();
      const todayIndex = today.getDay();
      let diff = targetIndex - todayIndex;
      if (diff <= 0) {
        diff += 7;
      }
      return diff;
    }

    if (!user.nextAllowanceDate) return 14;
    const today = new Date();
    const nextDate = new Date(user.nextAllowanceDate);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 30;
  }

  const getPlanName = () => {
    if (!user.incomeSource) return "Monthly Plan"

    if (user.incomeSource === "fixed") {
      if (user.fixedFrequency === "weekly") {
        return "Weekly Plan"
      } else {
        return "Monthly Plan"
      }
    } else if (user.incomeSource === "lump-sum") {
      const dur = user.lumpDuration || 6
      const unit = user.lumpDurationUnit || "month"
      const capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1)
      const pluralSuffix = dur > 1 ? "s" : ""
      return `${dur} ${capitalizedUnit}${pluralSuffix} Plan`
    } else {
      // irregular / none
      const dur = user.runwayDuration || 3
      const unit = user.runwayDurationUnit || "month"
      const capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1)
      const pluralSuffix = dur > 1 ? "s" : ""
      return `${dur} ${capitalizedUnit}${pluralSuffix} Plan`
    }
  }

  if (!hasHydrated) return null;


  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #DF0059 0%, #CC0D5A 52%, #221F20 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 12px 30px rgba(223,0,89,0.22))'
            }}
          >
            NextGen
          </h1>
          <p className="text-sm font-medium text-black">{strings.dashGreeting}, {user.name} · {getPlanName()}</p>
        </div>
        <div className="flex items-center gap-3">

          <Link href="/settings" className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-primary transition-colors">
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNextGenModal(true)}
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs relative overflow-hidden group shadow-sm shadow-primary/20 hover:bg-primary/20 transition-colors"
          >
            <span className="absolute inset-0 bg-white/20 blur-sm translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            {nextGenScore}%
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowBalanceDrawer(true)}
          className="cursor-pointer"
        >
          <Card className="glass-card hover:ring-primary/30 transition-all active:scale-[0.98] h-full flex flex-col justify-between">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <Wallet className="w-3 h-3" /> {showSpendOnly ? "Spendable Balance" : "Total Balance"}
              </CardTitle>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHideBalance(!hideBalance);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-center">
              <div>
                <p className="text-xl font-black tracking-tight leading-none transition-colors duration-300 text-black">
                  {hideBalance ? "••••••" : `RM ${(showSpendOnly ? spendableBalance : totalAssets).toFixed(2)}`}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <CalendarClock className="w-2.5 h-2.5 shrink-0" />
                    {language === 'en' ? 'Next in' : 'Seterusnya dlm'} {getDaysRemaining()} {language === 'en' ? (getDaysRemaining() === 1 ? 'day' : 'days') : 'hari'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={cn(
              "glass-card border-primary/20 transition-all duration-300 cursor-pointer select-none relative overflow-hidden h-full flex flex-col justify-between",
              safeDailyView === 'quota' && quotaRemaining < 0 && "border-rose-500/30 bg-rose-500/5 shadow-lg shadow-rose-500/5"
            )}
            onClick={() => setSafeDailyView(safeDailyView === 'quota' ? 'average' : 'quota')}
          >
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className={cn(
                "text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors whitespace-nowrap min-w-0",
                safeDailyView === 'quota' && quotaRemaining < 0 ? "text-rose-400" : "text-primary"
              )}>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {safeDailyView === 'quota' ? "Today's Quota" : "Safe Daily"}
              </CardTitle>
              {/* Segment Pill indicator */}
              <div className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground/80 border border-border">
                {safeDailyView === 'quota' ? "Quota" : "Average"}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-center">
              <div>
                {safeDailyView === 'quota' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-xl font-black tracking-tight leading-none",
                        quotaRemaining < 0 ? "text-rose-500" : "text-primary"
                      )}>
                        {quotaRemaining < 0 ? "-" : ""}RM {Math.abs(quotaRemaining).toFixed(2)}
                      </p>
                      <RefreshCw className={cn(
                        "w-4 h-4 shrink-0 opacity-40 hover:opacity-100 transition-opacity",
                        quotaRemaining < 0 ? "text-rose-400" : "text-primary"
                      )} />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                      {quotaRemaining < 0
                        ? `Overspent by RM ${Math.abs(quotaRemaining).toFixed(2)} today!`
                        : `Daily spend limit: RM ${initialSafeDaily.toFixed(2)}`
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-primary tracking-tight leading-none">
                        RM {safeDailySpend.toFixed(2)}
                      </p>
                      <RefreshCw className="w-4 h-4 shrink-0 text-primary opacity-40 hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                      {strings.dashLimitsImpulse}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-1">
        {[
          { icon: History, label: strings.actionTransaction, href: "/transactions", color: "text-[#237AF9]", bg: "bg-[#237AF9]/10" },
          { icon: Send, label: strings.actionTransfer, href: "/transfer", color: "text-[#CC0D5A]", bg: "bg-primary/10" },
          { icon: CalendarClock, label: strings.billsHeader, href: "/bills", color: "text-primary", bg: "bg-primary/10", isBills: true },
          { icon: Wallet, label: strings.actionTopUp, href: "#", color: "text-[#CC0D5A]", bg: "bg-primary/10" },
        ].map((action) => {
          const isTopUp = action.label === strings.actionTopUp;
          const label = action.isBills ? strings.billsHeader.split(' ')[0] : action.label;
          const content = (
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{label}</span>
            </div>
          );

          if (isTopUp) {
            return (
              <button key={action.label} onClick={() => setShowTopUpModal(true)} className="focus:outline-none flex flex-col items-center gap-2">
                {content}
              </button>
            );
          }

          return (
            <Link key={action.label} href={action.href}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Gamification / Saving Momentum Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="glass-card overflow-hidden border-primary/20 relative">
          <CardContent className="p-4 space-y-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStreak === 0 ? (
                  <Flame className="w-12 h-12 text-slate-300 shrink-0" />
                ) : (
                  <img
                    src="/assets/API-streak.gif"
                    alt="Streak Icon"
                    className="w-12 h-12 object-contain transition-all duration-500"
                    style={{
                      filter: todaySavings < 1.0
                        ? "grayscale(1) opacity(0.4)"
                        : currentStreak < 7
                          ? "hue-rotate(15deg) saturate(2.5) drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))"
                          : currentStreak < 30
                            ? "hue-rotate(200deg) saturate(2.2) drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))"
                            : "hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))"
                    }}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-black">{currentStreak} {language === 'en' ? 'Days Streak' : 'Hari Streak'}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {language === 'en' ? 'Highest Streak:' : 'Streak Tertinggi:'} <span className="font-bold text-black">{highestStreak} {language === 'en' ? 'days' : 'hari'}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Badge className={cn(
                  "font-bold text-xs px-2.5 py-1 rounded-lg border shadow-sm",
                  membershipTier === 'Gold' ? "bg-purple-100 text-purple-700 border-purple-300" :
                    membershipTier === 'Silver' ? "bg-blue-100 text-blue-700 border-blue-200" :
                      "bg-orange-100 text-orange-700 border-orange-300"
                )}>
                  {membershipTier === 'Gold' ? '🏆 Legend' :
                    membershipTier === 'Silver' ? '🥈 Pro' :
                      '🥉 Novice'}
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-3">
                {/* 1:1 Circle Share Streak button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareModal(true)}
                  className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#DF0059] via-[#CC0D5A] to-[#221F20] text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
                  title={language === 'en' ? 'Share My Streak 📸' : 'Kongsi Streak 📸'}
                >
                  <Send className="w-4 h-4" />
                </motion.button>

                {/* 1:1 Circle Simulate Next Day button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => simulateNextDay()}
                  className="w-9 h-9 shrink-0 rounded-full bg-[#221F20] text-white flex items-center justify-center hover:bg-[#221F20]/90 transition-colors shadow-sm"
                  title={language === 'en' ? 'Simulate Next Day' : 'Simulasi Hari Seterusnya'}
                >
                  <CalendarClock className="w-4 h-4" />
                </motion.button>

                {/* Rewards & Perks button (takes up remaining width) */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRewardsModal(true)}
                  className="flex-1 h-9 rounded-xl bg-primary text-white font-bold text-[11px] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Rewards & Perks' : 'Ganjaran & Kelebihan'}
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* NextGen Demo Digest */}
      <PromoCarousel />

      {/* Mini Transactions */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold">{strings.sectionRecent}</h3>
          <Link href="/transactions">
            <button className="text-[10px] text-primary uppercase font-bold tracking-wider hover:opacity-70 transition-opacity">{strings.viewAll}</button>
          </Link>
        </div>
        <Card className="glass-card">
          <CardContent className="p-0">
            {transactions.slice(0, 3).map((t, i) => (
              <div key={t.id} className={cn(
                "p-4 flex justify-between items-center",
                i !== 2 && "border-b border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {t.type === 'saving' ? '🛡️' : t.category === 'Food' ? '🍱' : t.category === 'Transport' ? '🚗' : '🛍️'}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">{t.category}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-xs font-bold",
                  t.type === 'expense' ? "text-rose-500" : t.type === 'saving' ? "text-amber-400" : "text-emerald-400"
                )}>
                  {t.type === 'expense' ? '- RM' : t.type === 'saving' ? 'RM' : '+ RM'}{t.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SpendGuardModal
        isOpen={showGuardModal}
        onClose={() => setShowGuardModal(false)}
      />

      <NextGenModal
        isOpen={showNextGenModal}
        onClose={() => setShowNextGenModal(false)}
        score={nextGenScore}
      />

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />

      <BalanceDetailDrawer
        open={showBalanceDrawer}
        onClose={() => setShowBalanceDrawer(false)}
      />

      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
      />

      {/* Share Streak Modal Overlay */}
      <AnimatePresence>
        {showShareModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto flex flex-col items-center"
            >
              <Card className="liquid-glass border-slate-200/80 shadow-2xl overflow-hidden p-6 w-full flex flex-col items-center gap-4 relative bg-white/90 backdrop-blur-xl rounded-[2rem]">
                {/* Close button */}
                <button
                  onClick={() => setShowShareModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1 text-center w-full">
                  <h3 className="text-base font-black text-slate-900">Share Your Saving Streak!</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Preview your light-mode milestone card below</p>
                </div>

                {/* Card Container with responsive scaling */}
                <div className="scale-[0.65] sm:scale-75 origin-center my-[-90px] shadow-lg rounded-[2.5rem]">
                  <StreakShareCard
                    currentStreak={currentStreak}
                    highestStreak={highestStreak}
                    membershipTier={membershipTier}
                    streakShieldActive={streakShieldActive}
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShareNative}
                    disabled={isGenerating}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[11px] flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    {language === 'en' ? 'Share to Socials ' : 'Kongsi ke Sosial '}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadImage}
                    disabled={isGenerating}
                    className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Download Image ' : 'Muat Turun '}
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="absolute left-[-9999px] top-[-9999px]">
        <StreakShareCard
          ref={shareCardRef}
          currentStreak={currentStreak}
          highestStreak={highestStreak}
          membershipTier={membershipTier}
          streakShieldActive={streakShieldActive}
        />
      </div>
    </div>
  )
}

function PromoCarousel() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  const slides = [
    {
      image: `${basePath}/assets/banner/banner1.png`,
      link: "https://www.instagram.com/hackathonx2026?igsh=MThuaDExazdjazNmdQ%3D%3D",
      accent: "bg-[#DF0059]"
    },
    {
      image: `${basePath}/assets/banner/banner2.png`,
      link: "https://getbeu.com/product/nextchapter",
      accent: "bg-[#CC0D5A]"
    },
    {
      image: `${basePath}/assets/banner/banner3.png`,
      link: "https://www.ipserverone.com/",
      accent: "bg-[#E06E9C]"
    },
    {
      image: `${basePath}/assets/banner/banner4.png`,
      link: "https://www.instagram.com/hackathonx2026?igsh=MThuaDExazdjazNmdQ%3D%3D",
      accent: "bg-[#221F20]"
    }
  ]

  const [index, setIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const goTo = (i: number) => { setIndex(i); setProgressKey(prev => prev + 1) }
  const goNext = () => goTo((index + 1) % slides.length)
  const goPrev = () => goTo((index - 1 + slides.length) % slides.length)

  useEffect(() => {
    const timer = setInterval(goNext, 5000)
    return () => clearInterval(timer)
  }, [index])

  const current = slides[index]

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5 rounded-full bg-primary" />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">HIGHLIGHTS</h3>
        </div>
        <span className="text-[9px] text-muted-foreground/60 font-medium tabular-nums">{index + 1}/{slides.length}</span>
      </div>

      <div className="relative w-full h-36 overflow-hidden rounded-2xl shadow-lg border border-white/60 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={current.image}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute inset-0 z-20 cursor-pointer"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startTime = Date.now();
            const onMouseUp = (upEvent: MouseEvent) => {
              const diff = startX - upEvent.clientX;
              const duration = Date.now() - startTime;
              if (Math.abs(diff) > 40) {
                if (diff > 40) goNext();
                if (diff < -40) goPrev();
              } else if (duration < 250) {
                window.open(current.link, '_blank', 'noopener,noreferrer');
              }
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mouseup', onMouseUp);
          }}
          onTouchStart={(e) => {
            const startX = e.touches[0].clientX;
            const startTime = Date.now();
            const onTouchEnd = (endEvent: TouchEvent) => {
              const diff = startX - endEvent.changedTouches[0].clientX;
              const duration = Date.now() - startTime;
              if (Math.abs(diff) > 40) {
                if (diff > 40) goNext();
                if (diff < -40) goPrev();
              } else if (duration < 250) {
                window.open(current.link, '_blank', 'noopener,noreferrer');
              }
              window.removeEventListener('touchend', onTouchEnd);
            };
            window.addEventListener('touchend', onTouchEnd);
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-30">
          <motion.div key={progressKey} className={cn("h-full rounded-r-full", current.accent)} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5, ease: "linear" }} />
        </div>
      </div>

      <div className="flex justify-center gap-1.5 pt-0.5">
        {slides.map((slide, i) => (
          <button key={i} onClick={() => goTo(i)} className={cn("rounded-full transition-all duration-400", i === index ? cn("w-5 h-1.5", slide.accent, "shadow-sm") : "w-1.5 h-1.5 bg-foreground/10 hover:bg-foreground/20")} />
        ))}
      </div>
    </div>
  )
}
