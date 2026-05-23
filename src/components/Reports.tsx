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
import { Progress } from "@/components/ui/progress"
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

const categoryData = [
  { name: 'Food', value: 450, color: '#6366f1' },
  { name: 'Transport', value: 120, color: '#818cf8' },
  { name: 'Shopping', value: 300, color: '#fbbf24' },
  { name: 'Sub', value: 80, color: '#f87171' },
]

const marketData = [
  { label: 'Stock Portfolio', value: '+4.2%', trend: 'up', color: 'text-emerald-500' },
  { label: 'Crypto Assets', value: '-1.8%', trend: 'down', color: 'text-rose-500' },
  { label: 'Gold Savings', value: '+0.5%', trend: 'up', color: 'text-emerald-500' },
]

export function Insights() {
  const { nextGenScore, language, debtRiskScore, savingsPockets } = useStore()
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
  const todayName = dayNames[new Date().getDay()]

  const dynamicSpendingData = spendingData.map(item => {
    if (item.name === todayName) {
      return { ...item, amount: nextGenScore }
    }
    return item
  })

  const lockedAmount = bills
    .filter(b => b.isLocked && b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const paidCount = bills.filter(b => b.status === 'paid').length;
  const nextBill = bills.filter(b => b.status !== 'paid')
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

  const strings = t[language]

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{strings.reportHeader}</h1>
        <p className="text-muted-foreground text-sm">{strings.reportSubheader}</p>
      </header>

      {/* Health Metrics Insights - MOVED FROM COACH */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Target className="w-4 h-4 text-emerald-500" />
              <Badge className="text-[8px] bg-emerald-500/10 text-emerald-500 border-none">+{overallSavingsProgress}%</Badge>
            </div>
            <p className="text-[10px] font-bold">Savings Rate</p>
            <div className="h-8 flex items-end gap-1">
              {dynamicSavingsHeights.map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-pink-600/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Shield className="w-4 h-4 text-pink-600" />
              <Badge className="text-[8px] bg-pink-600/10 text-pink-600 border-none">{nextGenRating}</Badge>
            </div>
            <p className="text-[10px] font-bold">Debt Health</p>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[8px] font-bold">
                <span>Score</span>
                <span>{nextGenScore}/100</span>
              </div>
              <Progress value={nextGenScore} className="h-1 bg-pink-600/10" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NextGen Trend */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> NextGen Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-48 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicSpendingData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111114', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/10 animate-pulse flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary/20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights - MOVED FROM COACH */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">Market Insights</h3>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            {marketData.map((item, i) => (
              <div key={item.label} className={cn(
                "p-4 flex justify-between items-center",
                i !== marketData.length - 1 && "border-b border-slate-100 dark:border-white/5"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    item.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className={cn("text-xs font-bold", item.color)}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Achievements / Nudge History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">{strings.reportMilestones}</h3>
        <Card className="glass-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">{strings.reportMileEmerg}</p>
                <p className="text-[10px] text-muted-foreground">{strings.reportMileEmergDesc}</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">+12 Pts</Badge>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">{strings.reportMileDebt}</p>
                <p className="text-[10px] text-muted-foreground">{strings.reportMileDebtDesc}</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">RM 45 Saved</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">{strings.reportBreakdown}</h3>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100/10 animate-pulse" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-bold">RM {cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Projected Balance */}
      <Card className="glass-card bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-primary tracking-widest">{strings.reportProjBal}</p>
            <p className="text-xl font-bold">RM 124.50</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] text-emerald-500 font-bold uppercase">+ RM 20.00</p>
            <p className="text-xs text-muted-foreground mt-1">
              {strings.billsProtected}: <span className="font-bold text-primary">RM {lockedAmount.toFixed(2)}</span>
            </p>
            {paidCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {strings.billsPaid}: <span className="font-bold text-emerald-500">{paidCount}</span>
              </p>
            )}
            {nextBill && (
              <p className="text-xs text-muted-foreground mt-1">
                {strings.billsNext}: <span className="font-bold">{nextBill.name}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
