"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Award, Calendar, Target, Shield, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const spendingData = [
  { name: 'Mon', amount: 45 },
  { name: 'Tue', amount: 52 },
  { name: 'Wed', amount: 38 },
  { name: 'Thu', amount: 65 },
  { name: 'Fri', amount: 48 },
  { name: 'Sat', amount: 70 },
  { name: 'Sun', amount: 42 },
]

// Harmonious category palette utilizing BeU's core pinks, blue, yellow, and supporting accent colors
const categoryData = [
  { name: 'Food', value: 450, color: '#DF0059' },      // BeU Pink
  { name: 'Transport', value: 120, color: '#237AF9' }, // Blue Accent
  { name: 'Shopping', value: 300, color: '#FFC107' },  // Yellow Accent
  { name: 'Sub', value: 80, color: '#E06E9C' },       // Soft Pink
]

const marketData = [
  { label: 'Stock Portfolio', value: '+4.2%', trend: 'up', color: 'text-emerald-600' },
  { label: 'Crypto Assets', value: '-1.8%', trend: 'down', color: 'text-[#FF6B6B]' },
  { label: 'Gold Savings', value: '+0.5%', trend: 'up', color: 'text-emerald-600' },
]

export function Insights() {
  const { 
    nextGenScore, 
    language, 
    debtRiskScore, 
    savingsPockets, 
    currentStreak, 
    highestStreak, 
    membershipTier, 
    transactions, 
    user 
  } = useStore()
  const bills = useStore(state => state.bills)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // 1. Dynamic Savings Rate Calculation from Savings page
  const totalSavingsCurrent = savingsPockets.reduce((sum, p) => sum + p.current, 0)
  const totalSavingsTarget = savingsPockets.reduce((sum, p) => sum + p.target, 0)
  const overallSavingsProgress = totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0

  const defaultHeights = [40, 60, 30, 80, 50, 70, 90]
  const dynamicSavingsHeights = defaultHeights.map((fallback, idx) => {
    if (idx < savingsPockets.length) {
      const pocket = savingsPockets[idx]
      return pocket.target > 0 ? Math.min(100, Math.max(10, Math.round((pocket.current / pocket.target) * 100))) : 0
    }
    return fallback
  })

  // 2. Dynamic Debt Health based on Dashboard NextGen Score
  let nextGenRating = "At Risk"
  if (nextGenScore >= 75) {
    nextGenRating = "Strong"
  } else if (nextGenScore >= 50) {
    nextGenRating = "Healthy"
  } else {
    nextGenRating = "Weak"
  }

  // 3. Dynamic NextGen Trend Graph tracking Today's Score
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const simulatedDayOffset = useStore(state => state.simulatedDayOffset) || 0;
  const today = new Date();
  today.setDate(today.getDate() + simulatedDayOffset);
  const todayName = dayNames[today.getDay()]

  let dynamicSpendingData = spendingData.map(item => {
    if (item.name === todayName) {
      return { ...item, amount: nextGenScore }
    }
    return item
  })

  const todayIndex = dynamicSpendingData.findIndex(d => d.name === todayName);
  if (todayIndex !== -1 && todayIndex !== dynamicSpendingData.length - 1) {
    dynamicSpendingData = [
      ...dynamicSpendingData.slice(todayIndex + 1),
      ...dynamicSpendingData.slice(0, todayIndex + 1)
    ];
  }

  const lockedAmount = bills
    .filter(b => b.isLocked && b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const paidCount = bills.filter(b => b.status === 'paid').length;
  const nextBill = bills.filter(b => b.status !== 'paid')
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

  const strings = t[language]

  // Dynamic Category Breakdown
  const expenses = transactions.filter(t => t.type === 'expense')
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const colorPalette = ['#6366f1', '#818cf8', '#fbbf24', '#f87171', '#34d399', '#f472b6'];
  const dynamicCategoryData = Object.entries(categoryTotals)
    .map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: colorPalette[i % colorPalette.length]
    }))
    .sort((a, b) => b.value - a.value);

  const displayCategoryData = dynamicCategoryData;

  // Dynamic Projected Balance
  const upcomingBillsTotal = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const projectedBalance = Math.max(0, user.currentBalance - upcomingBillsTotal);
  const projectedSavings = savingsPockets.reduce((sum, p) => sum + p.current, 0);

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header section with vivid gradient title */}
      <header className="space-y-1 relative overflow-hidden z-10">
        <h1 className="text-2xl font-black bg-gradient-to-r from-[#DF0059] via-[#CC0D5A] to-[#FF6B6B] bg-clip-text text-transparent">
          {strings.reportHeader}
        </h1>
        <p className="text-[#727272] text-xs font-semibold tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DF0059] animate-pulse" />
          {strings.reportSubheader}
        </p>
      </header>

      {/* High-Contrast Light Mode Grid Cards (Savings Rate & Debt Health) */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {/* Savings Rate Card - Premium Glassmorphic Light Pink styling */}
        <Card className="relative overflow-hidden bg-white/80 border border-[#F5CFDE] shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-0.5 rounded-3xl">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#DF0059]/5 blur-md rounded-full pointer-events-none" />
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-[#DF0059]/10 text-[#DF0059] rounded-xl">
                <Target className="w-4 h-4" />
              </div>
              <Badge className="text-[9px] font-black bg-gradient-to-r from-[#DF0059] to-[#E06E9C] text-white border-none shadow-sm shadow-[#DF0059]/20">
                +{overallSavingsProgress}%
              </Badge>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#727272] uppercase tracking-widest">Savings Rate</p>
              <p className="text-xs font-extrabold text-[#221F20]">Active Progress</p>
            </div>
            <div className="h-8 flex items-end gap-1.5 pt-1">
              {dynamicSavingsHeights.map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-gradient-to-t from-[#CC0D5A] to-[#DF0059] rounded-t-sm transition-all duration-500 hover:opacity-80 cursor-pointer" 
                  style={{ height: `${h}%` }} 
                  title={`Pocket ${i + 1}: ${h}%`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Debt Health Card - Premium Glassmorphic Light Blue styling */}
        <Card className="relative overflow-hidden bg-white/80 border border-[#D3E4FE] shadow-md shadow-blue-500/5 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5 rounded-3xl">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#237AF9]/5 blur-md rounded-full pointer-events-none" />
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-[#237AF9]/10 text-[#237AF9] rounded-xl">
                <Shield className="w-4 h-4" />
              </div>
              <Badge className={cn(
                "text-[9px] font-black border-none shadow-sm",
                nextGenRating === "Strong" ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-emerald-500/20" :
                nextGenRating === "Healthy" ? "bg-gradient-to-r from-[#237AF9] to-[#DF0059] text-white shadow-blue-500/20" :
                "bg-gradient-to-r from-[#DF0059] to-[#FF6B6B] text-white shadow-[#DF0059]/20"
              )}>
                {nextGenRating}
              </Badge>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#727272] uppercase tracking-widest">Debt Health</p>
              <p className="text-xs font-extrabold text-[#221F20]">NextGen Score</p>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[9px] font-black text-[#221F20]">
                <span>Score</span>
                <span>{nextGenScore}/100</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#237AF9] via-[#E06E9C] to-[#DF0059] rounded-full transition-all duration-500" 
                  style={{ width: `${nextGenScore}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart Card (NextGen Trend) */}
      <Card className="relative overflow-hidden bg-white/80 border border-[#F5CFDE] shadow-md shadow-pink-500/5 rounded-3xl relative z-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#DF0059]/5 blur-2xl rounded-full pointer-events-none" />
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold text-[#727272] uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#DF0059]" /> NextGen Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-48 w-full pr-4 pb-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicSpendingData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DF0059" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#DF0059" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#DF0059" />
                    <stop offset="50%" stopColor="#CC0D5A" />
                    <stop offset="100%" stopColor="#FF6B6B" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#727272', fontWeight: 600 }} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#727272', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(223, 0, 89, 0.15)', 
                    borderRadius: '16px', 
                    fontSize: '10px',
                    boxShadow: '0 10px 20px -3px rgba(223, 0, 89, 0.05)',
                    color: '#221F20'
                  }}
                  itemStyle={{ color: '#DF0059', fontWeight: 800 }}
                  labelStyle={{ color: '#727272', fontWeight: 700 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="url(#lineGradient)"
                  strokeWidth={3.5}
                  dot={{ fill: '#DF0059', stroke: '#fff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#DF0059', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/10 animate-pulse flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[#DF0059]/20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights List */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-xs font-bold text-[#727272] uppercase tracking-widest px-1">Market Insights</h3>
        <Card className="overflow-hidden bg-white/80 border border-[#F5CFDE] shadow-md rounded-3xl">
          <CardContent className="p-0">
            {marketData.map((item, i) => (
              <div key={item.label} className={cn(
                "p-4 flex justify-between items-center transition-all duration-300 hover:bg-[#FFE9F2]/20 cursor-pointer hover:translate-x-1",
                i !== marketData.length - 1 && "border-b border-slate-100"
              )}>
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center transition-transform duration-300",
                    item.trend === 'up' 
                      ? "bg-emerald-500/10 text-emerald-600 shadow-sm shadow-emerald-500/10" 
                      : "bg-[#FF6B6B]/10 text-[#FF6B6B] shadow-sm shadow-[#FF6B6B]/10"
                  )}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-[#221F20]">{item.label}</span>
                    <p className="text-[9px] text-[#727272] font-semibold uppercase tracking-wider">
                      {item.trend === 'up' ? 'Bullish' : 'Bearish'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-black px-2 py-0.5 rounded-lg",
                    item.trend === 'up' 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-[#FF6B6B]/10 text-[#FF6B6B]"
                  )}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Achievements / Nudge Milestones */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-xs font-bold text-[#727272] uppercase tracking-widest px-1">
          {strings.reportMilestones}
        </h3>
        <Card className="bg-white/80 border border-[#F5CFDE] shadow-md rounded-3xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-4 items-center p-2 rounded-2xl transition-all duration-300 hover:bg-slate-50 cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#DF0059] to-[#FF6B6B] flex items-center justify-center text-white shadow-md shadow-[#DF0059]/20">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-black text-[#221F20]">{strings.reportMileEmerg}</p>
                <p className="text-[9.5px] text-[#727272] font-medium leading-tight">{strings.reportMileEmergDesc}</p>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-[9px] border-none shadow-sm shadow-emerald-500/15 py-1 px-2.5">
                +12 Pts
              </Badge>
            </div>
            <div className="flex gap-4 items-center p-2 rounded-2xl transition-all duration-300 hover:bg-slate-50 cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#237AF9] to-[#E06E9C] flex items-center justify-center text-white shadow-md shadow-[#237AF9]/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-black text-[#221F20]">Savings Streak</p>
                <p className="text-[9.5px] text-[#727272] font-medium leading-tight">Current Tier: {membershipTier}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge className="bg-gradient-to-r from-[#DF0059] to-[#E06E9C] text-white font-black text-[9px] border-none shadow-sm shadow-[#DF0059]/15 py-1 px-2.5">
                  {currentStreak} Days
                </Badge>
                {highestStreak > 0 && <span className="text-[8px] text-[#727272] font-bold">Highest: {highestStreak}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown with BeU Palette and Inner Donut Value */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-xs font-bold text-[#727272] uppercase tracking-widest px-1">
          {strings.reportBreakdown}
        </h3>
        <Card className="bg-white/80 border border-[#F5CFDE] shadow-md rounded-3xl p-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
              {mounted ? (
                displayCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayCategoryData}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {displayCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-full border-4 border-slate-100/20 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Empty</span>
                  </div>
                )
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100/10 animate-pulse" />
              )}
              {/* Inner donut balance label */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full shadow-inner flex flex-col items-center justify-center pointer-events-none border border-[#F5CFDE]">
                <span className="text-[7px] text-[#727272] font-bold uppercase tracking-tighter">Total</span>
                <span className="text-[9px] font-black text-[#DF0059]">RM 950</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {displayCategoryData.length > 0 ? displayCategoryData.map((cat) => (
                <div key={cat.name} className="flex justify-between items-center text-[10px] p-1 rounded-lg transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#727272] font-extrabold">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[#221F20]">RM {cat.value}</span>
                    <span className="text-[8px] font-semibold text-[#727272]">({Math.round((cat.value / 950) * 100)}%)</span>
                  </div>
                  <span className="font-bold">RM {cat.value.toFixed(2)}</span>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground text-center py-4">No expenses recorded yet.</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Projected Balance - High Fidelity Neo-Digital Bank Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#DF0059] via-[#CC0D5A] to-[#221F20] text-white shadow-xl shadow-[#DF0059]/25 rounded-3xl border-none relative z-10">
        {/* Abstract glowing premium circle overlay */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-white/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FF6B6B]/20 blur-3xl rounded-full pointer-events-none" />
        
        <CardContent className="p-5 flex justify-between items-stretch gap-6 relative z-10">
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-black text-white/70 tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {strings.reportProjBal}
              </p>
              <p className="text-2xl font-black tracking-tight text-white drop-shadow-sm">RM 124.50</p>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white rounded-full font-black text-[9px] shadow-md shadow-emerald-500/20 w-fit">
              <TrendingUp className="w-3 h-3" /> + RM 20.00
            </div>
          </div>

          <div className="flex flex-col justify-end text-right space-y-1.5 min-w-[140px]">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl text-[9.5px] space-y-1 text-white/90">
              <div className="flex justify-between gap-2 border-b border-white/10 pb-1">
                <span className="font-bold opacity-80">{strings.billsProtected}:</span>
                <span className="font-extrabold text-emerald-300">RM {lockedAmount.toFixed(2)}</span>
              </div>
              {paidCount > 0 && (
                <div className="flex justify-between gap-2 pt-0.5">
                  <span className="font-bold opacity-80">{strings.billsPaid}:</span>
                  <span className="font-extrabold text-white">{paidCount}</span>
                </div>
              )}
              {nextBill && (
                <div className="flex flex-col items-end border-t border-white/10 pt-1 mt-0.5">
                  <span className="text-[8px] opacity-75 font-semibold uppercase tracking-wider">{strings.billsNext}</span>
                  <span className="font-extrabold text-[#FFF4D5] truncate max-w-[120px]">{nextBill.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
