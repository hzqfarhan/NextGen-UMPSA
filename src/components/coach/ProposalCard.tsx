import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Target, TrendingUp, ChevronRight, ChevronLeft, ExternalLink, ShoppingBag, Store, Globe, Send, Brain } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Message, ChatAction } from "./types"
import { useStore } from "@/store/useStore"

interface ProposalCardProps {
  message: Message;
  index?: number;
  totalMessages?: number;
  isExecuting: boolean;
  handleAction?: (action: ChatAction) => void;
  onAction?: (action: ChatAction) => void;
}

export function ProposalCard({
  message: m,
  index: i,
  totalMessages = 1,
  isExecuting,
  handleAction,
  onAction,
}: ProposalCardProps) {
  const store = useStore();
  const { 
    user, 
    savingsPockets, 
    calculateDailyLimitForBalance,
    affordItem,
    setAffordItem,
    affordPrice,
    setAffordPrice,
    saveTarget,
    setSaveTarget,
    saveDeposit,
    setSaveDeposit,
    selectedPlatform,
    setSelectedPlatform
  } = store;
  
  const userBalance = user.currentBalance;
  const actionHandler = onAction || handleAction || (() => {});
  const isLast = i === totalMessages - 1;

  if (m.proposal.type === 'list_pockets') {
    return (
      <Card className="glass-card bg-white/95 border-emerald-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          {savingsPockets.map((pocket) => (
            <div key={pocket.id} className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                  {pocket.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#221F20]">{pocket.name}</h4>
                    <span className="text-[10px] font-black text-emerald-500">
                      {Math.round((pocket.current / pocket.target) * 100)}%
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
                    RM {pocket.current.toFixed(0)} / RM {pocket.target.toFixed(0)}
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(pocket.current / pocket.target) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Link 
              href="/savings"
              className="inline-flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black h-9 gap-2 shadow-lg shadow-emerald-500/20 transition-all text-center"
            >
              Manage Savings <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'affordability') {
    return (
      <Card className="glass-card bg-white/95 border-pink-600/20 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-pink-600" />
            <p className="text-xs font-bold text-[#221F20] uppercase tracking-wider">Affordability Simulator</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-muted-foreground">Item Name</label>
              <Input
                placeholder="e.g. New Shoes"
                value={m.proposal.item || (isLast ? affordItem : "")}
                onChange={(e) => setAffordItem(e.target.value)}
                disabled={isExecuting || !isLast}
                className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-muted-foreground">Price (RM)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={m.proposal.price || (isLast ? affordPrice : "")}
                onChange={(e) => setAffordPrice(e.target.value)}
                disabled={isExecuting || !isLast}
                className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
              />
            </div>

            {isLast && (
              <Button
                className="w-full h-8 text-[10px] bg-pink-700 hover:bg-pink-700 text-white font-bold"
                onClick={() => actionHandler({ id: 'sim_afford', label: 'Simulate', type: 'simulate_affordability' })}
                disabled={!affordPrice || isExecuting}
              >
                {isExecuting ? "Simulating..." : "Simulate Impact"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'affordability_result') {
    return (
      <Card className="glass-card bg-white/95 border-pink-600/20 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                m.proposal.recommendation === "Avoid" ? "bg-rose-500" :
                  m.proposal.recommendation === "Caution" ? "bg-amber-500" : "bg-emerald-500"
              )} />
              <p className="text-[10px] font-bold text-[#221F20]">{m.proposal.item}</p>
            </div>
            <Badge className={cn(
              "text-[7px] h-4 px-2 font-black uppercase tracking-wider border",
              m.proposal.recommendation === "Avoid"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : m.proposal.recommendation === "Caution"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            )}>
              {m.proposal.recommendation === "Avoid" ? "Not Recommended" :
                m.proposal.recommendation === "Caution" ? "Proceed with Care" : "Good to Go"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="p-2 rounded-lg bg-[#F8F8F8] border border-pink-100 text-center">
              <p className="text-[7px] text-muted-foreground uppercase font-bold">Price</p>
              <p className="text-[11px] font-bold text-[#221F20]">RM {m.proposal.price?.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-[#F8F8F8] border border-pink-100 text-center">
              <p className="text-[7px] text-muted-foreground uppercase font-bold">Daily After</p>
              <p className={cn("text-[11px] font-bold",
                parseFloat(m.proposal.newDailySpend) < 5 ? "text-rose-400" :
                  parseFloat(m.proposal.newDailySpend) < 12 ? "text-amber-400" : "text-emerald-400"
              )}>RM {m.proposal.newDailySpend}</p>
            </div>
            <div className="p-2 rounded-lg bg-[#F8F8F8] border border-pink-100 text-center">
              <p className="text-[7px] text-muted-foreground uppercase font-bold">% Balance</p>
              <p className={cn("text-[11px] font-bold",
                (m.proposal.price / userBalance * 100) > 30 ? "text-rose-400" : "text-emerald-400"
              )}>{Math.round(m.proposal.price / userBalance * 100)}%</p>
            </div>
          </div>

          <p className="text-[9px] text-[#555555] leading-relaxed">
            {m.proposal.adviceSummary}
          </p>

          {(m.proposal.recommendation === "Avoid" || m.proposal.recommendation === "Caution") && (
            <div className="pt-2 border-t border-pink-100 flex items-center gap-2">
              <Brain className="w-3 h-3 text-amber-500 animate-pulse" />
              <p className="text-[8px] text-amber-400 font-bold">Handing off to Finance Strategist...</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'strategist_alternative') {
    return (
      <Card className="glass-card bg-white/95 border-amber-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Marketplace Comparison</p>
            </div>
            <Badge className="text-[7px] h-4 px-2 bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold">
              {m.proposal.alternatives?.length} options
            </Badge>
          </div>

          <p className="text-[8px] text-[#727272]">Safe limit: RM {m.proposal.budgetLimit} (30% of balance). Tap to expand:</p>

          <div className="space-y-2">
            {m.proposal.alternatives?.map((alt: any, idx: number) => {
              const colorMap: Record<string, any> = {
                orange: { bg: 'bg-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400', activeBg: 'bg-orange-500/15', gradient: 'from-orange-500/10 to-transparent', btnFrom: 'from-orange-500', btnTo: 'to-orange-600', shadow: 'shadow-orange-500/20' },
                blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', activeBg: 'bg-blue-500/15', gradient: 'from-blue-500/10 to-transparent', btnFrom: 'from-blue-500', btnTo: 'to-blue-600', shadow: 'shadow-blue-500/20' },
                indigo: { bg: 'bg-[#237AF9]/5', border: 'border-[#237AF9]/20', text: 'text-indigo-400', activeBg: 'bg-[#237AF9]/15', gradient: 'from-[#237AF9]/10 to-transparent', btnFrom: 'from-[#237AF9]', btnTo: 'to-indigo-600', shadow: 'shadow-[#237AF9]/20' },
              };
              const colors = colorMap[alt.color] || colorMap.orange;
              const isSelected = selectedPlatform === idx;

              const originalPrice = allMessages.find(msg => msg.proposal?.type === 'affordability_result')?.proposal?.price || 1;
              const savePercent = Math.round((originalPrice - alt.price) / originalPrice * 100);

              const PlatformIcon = alt.platform.toLowerCase().includes('shopee') ? ShoppingBag :
                alt.platform.toLowerCase().includes('lazada') ? Store : Globe;

              return (
                <div key={idx} className="space-y-2">
                  <button
                    onClick={() => setSelectedPlatform(isSelected ? null : idx)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left",
                      isSelected
                        ? `${colors.activeBg} ${colors.border} ring-1 ring-white/10`
                        : "bg-[#F8F8F8] border-pink-100 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", colors.bg)}>
                        <PlatformIcon className={cn("w-4 h-4", colors.text)} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", isSelected ? colors.text : "text-[#555555]")}>
                          {alt.platform}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-black text-[#221F20] shrink-0">RM {alt.price}</span>
                          <Badge className="text-[6.5px] h-3 px-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/20 font-bold shrink-0">
                            Save {savePercent}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isSelected ? 180 : 0 }}
                      className="text-[#727272]/50 shrink-0 ml-2"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br border border-pink-100 flex flex-col gap-3", colors.gradient)}>
                          <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-pink-100 bg-[#F8F8F8]">
                            <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[11px] text-[#221F20] font-bold leading-tight">{alt.name}</p>
                            <p className="text-[9px] text-[#727272]">{alt.condition}</p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <div className="px-3 py-1.5 rounded-full bg-white border border-pink-100 shrink-0">
                              <span className="text-[10px] font-black text-[#221F20]">RM {alt.price}</span>
                            </div>
                            <Button
                              onClick={() => {
                                const originalPrice = parseFloat(affordPrice) || 1;
                                const limit = parseFloat(m.proposal.budgetLimit);
                                const maxSpend = Math.min(originalPrice, limit);
                                handleAction({ id: 'alt_buy', label: `Found alternative for RM ${alt.price}`, type: 'create_pocket', payload: { name: alt.title, target: alt.price, mode: 'savings', riskLevel: 'low' } })
                              }}
                              className={cn("h-8 px-4 flex-1 bg-gradient-to-r text-white text-[10px] font-black gap-2 rounded-full shadow-lg shrink-0", colors.btnFrom, colors.btnTo, colors.shadow)}
                            >
                              View Item <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'deposit_summary') {
    return (
      <Card className="glass-card bg-white/95 border-emerald-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-[#221F20] uppercase tracking-widest">Impact Summary</p>
          </div>
          
          <div className="rounded-xl bg-[#F8F8F8] border border-pink-100 overflow-hidden">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-left border-b border-pink-100 bg-white">
                  <th className="p-2.5 font-bold text-muted-foreground">Metric</th>
                  <th className="p-2.5 font-bold text-muted-foreground text-right">Before</th>
                  <th className="p-2.5 font-bold text-muted-foreground text-right">After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
                <tr>
                  <td className="p-2.5 text-[#221F20] font-medium">Spending Bal.</td>
                  <td className="p-2.5 text-right text-muted-foreground">RM {(m.proposal.before?.balance || 0).toFixed(2)}</td>
                  <td className="p-2.5 text-right text-emerald-400 font-bold">RM {(m.proposal.after?.balance || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-[#221F20] font-medium">Daily Quota</td>
                  <td className="p-2.5 text-right text-muted-foreground">
                    {(m.proposal.before?.quota || 0) < 0 ? "-" : ""}RM {Math.abs(m.proposal.before?.quota || 0).toFixed(2)}
                  </td>
                  <td className={cn(
                    "p-2.5 text-right font-bold",
                    (m.proposal.after?.quota || 0) < 0 ? "text-rose-400" : "text-emerald-400"
                  )}>
                    {(m.proposal.after?.quota || 0) < 0 ? "-" : ""}RM {Math.abs(m.proposal.after?.quota || 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 text-[#221F20] font-medium">Safe Daily (Avg)</td>
                  <td className="p-2.5 text-right text-muted-foreground">RM {(m.proposal.before?.safeDaily || 0).toFixed(2)}</td>
                  <td className="p-2.5 text-right text-emerald-400 font-bold">RM {(m.proposal.after?.safeDaily || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[9px] text-center text-muted-foreground italic px-2">
            Your daily spending power has been updated to reflect your new savings allocation.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'strategist_goal_planner') {
    return (
      <Card className="glass-card bg-white/95 border-amber-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-[#221F20] uppercase tracking-widest">Goal Acceleration Plan</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-amber-500/5 rounded-xl p-2 border border-amber-500/15 text-center">
              <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">Daily</p>
              <p className="text-[11px] font-black text-amber-400">RM {m.proposal.daily.toFixed(2)}</p>
            </div>
            <div className="bg-amber-500/5 rounded-xl p-2 border border-amber-500/15 text-center">
              <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">Weekly</p>
              <p className="text-[11px] font-black text-amber-400">RM {m.proposal.weekly.toFixed(2)}</p>
            </div>
            <div className="bg-amber-500/5 rounded-xl p-2 border border-amber-500/15 text-center">
              <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">Monthly</p>
              <p className="text-[11px] font-black text-amber-400">RM {m.proposal.monthly.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[8px] text-amber-500/80 uppercase font-bold tracking-wider">
                  {m.proposal.basedOnHistory ? 'Projected Achievement (Actual)' : 'Estimated Achievement Date'}
                </p>
                <p className="text-[11px] font-black text-amber-500">{m.proposal.targetDate}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-amber-500/50" />
            </div>
            {m.proposal.basedOnHistory && (
              <p className="text-[8px] text-amber-600 italic">Based on your savings velocity over the last 30 days.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'spending_breakdown') {
    const spending = m.proposal.spending || [];
    return (
      <Card className="glass-card bg-white/95 border-blue-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-[#221F20] uppercase tracking-widest">30-Day Spending</p>
          </div>
          
          <div className="space-y-3">
            {spending.slice(0, 4).map((s: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-[#221F20]">{s.category}</span>
                  <span className="font-bold text-blue-500">RM {s.total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] text-muted-foreground mb-1">
                  <span>{s.percentage}% of spending</span>
                  <span>RM {s.dailyAvg.toFixed(1)}/day</span>
                </div>
                <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'bill_timeline') {
    const bills = m.proposal.bills || [];
    return (
      <Card className="glass-card bg-white/95 border-purple-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-[10px] font-black text-[#221F20] uppercase tracking-widest">Upcoming Bills</p>
          </div>
          
          <div className="relative border-l-2 border-purple-100 ml-2 pl-4 space-y-4">
            {bills.slice(0, 3).map((b: any, idx: number) => (
              <div key={idx} className="relative">
                <div className={cn(
                  "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                  b.status === 'urgent' ? "bg-rose-500" : b.status === 'upcoming' ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <div className="bg-[#F8F8F8] border border-pink-50 p-2.5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-[#221F20]">{b.bill.title}</p>
                      <p className={cn(
                        "text-[8px] font-black uppercase tracking-wider",
                        b.status === 'urgent' ? "text-rose-500" : b.status === 'upcoming' ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {b.daysUntilDue === 0 ? "Due Today" : `Due in ${b.daysUntilDue} days`}
                      </p>
                    </div>
                    <p className="text-[11px] font-black text-purple-600">RM {b.bill.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'add_funds') {
    const nextSafeDaily = calculateDailyLimitForBalance(userBalance - m.proposal.amount);
    const isRestricted = m.proposal.amount > 0 && nextSafeDaily < 10.0;

    return (
      <Card className={cn(
        "glass-card bg-white/95 overflow-hidden",
        isRestricted ? "border-rose-500/20" : "border-emerald-500/20"
      )}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
              {m.proposal.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#221F20]">Quick Deposit to {m.proposal.pocketName}</p>
              <p className="text-[9px] text-emerald-500 font-bold">RM {m.proposal.amount.toFixed(2)}</p>
            </div>
            <Shield className="w-5 h-5 text-emerald-500/60" />
          </div>
          
          <div className="flex justify-between items-center bg-[#F8F8F8] p-2 rounded-lg border border-pink-100">
              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">NextGen Check</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[8px] h-4 px-1 font-bold",
                  isRestricted 
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}
              >
                {isRestricted ? "Risk Detected" : "Score Protected"}
              </Badge>
          </div>

          {isRestricted && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold leading-tight space-y-1">
              <p>🚨 Survival Threshold Restricted</p>
              <p className="text-[9px] font-medium text-rose-400/80">
                This deposit would drop your safe daily spend to RM {nextSafeDaily.toFixed(2)}/day, which is below the RM 10.00 survival limit.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className={cn(
                "flex-1 h-8 text-[10px] text-white font-bold",
                isRestricted 
                  ? "bg-rose-500/20 hover:bg-rose-500/20 cursor-not-allowed text-rose-300" 
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={() => actionHandler({
                id: 'approve_add_funds',
                label: 'Confirm Deposit',
                type: 'add_funds',
                payload: { pocketId: m.proposal.pocketId, amount: m.proposal.amount }
              })}
              disabled={isExecuting || isRestricted || !isLast}
            >
              {isExecuting ? "Processing..." : "Confirm Deposit"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-8 text-[10px] border-pink-100 text-[#555555] hover:bg-pink-50"
              onClick={() => actionHandler({ id: 'decline_save', label: 'Decline', type: 'postpone' })}
              disabled={isExecuting || !isLast}
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'create_pocket') {
    const currentDeposit = isLast ? parseFloat(saveDeposit) || 0 : m.proposal.current || 0;
    const nextSafeDaily = calculateDailyLimitForBalance(userBalance - currentDeposit);
    const isRestricted = currentDeposit > 0 && nextSafeDaily < 10.0;

    return (
      <Card className={cn(
        "glass-card bg-white/95 overflow-hidden",
        isRestricted ? "border-rose-500/20" : "border-emerald-500/20"
      )}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
              {m.proposal.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#221F20]">{m.proposal.name}</p>
            </div>
            <Badge className="text-[7px] h-3 bg-emerald-500/20 text-emerald-500 border-emerald-500/20 px-1 font-black">
              {m.proposal.mode?.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[8px] uppercase font-bold text-muted-foreground">Goal Target (RM)</label>
              <Input
                type="number"
                value={isLast ? saveTarget : m.proposal.target}
                onChange={(e) => setSaveTarget(e.target.value)}
                disabled={isExecuting || !isLast}
                className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] uppercase font-bold text-muted-foreground">Initial Deposit (RM)</label>
              <Input
                type="number"
                value={isLast ? saveDeposit : m.proposal.current}
                onChange={(e) => setSaveDeposit(e.target.value)}
                disabled={isExecuting || !isLast}
                className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
              />
            </div>
          </div>
          <p className="text-[7px] text-muted-foreground italic">Deducted from your RM {userBalance.toFixed(2)} balance</p>

          {isRestricted && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold leading-tight space-y-1">
              <p>🚨 Survival Threshold Restricted</p>
              <p className="text-[9px] font-medium text-rose-400/80">
                Depositing RM {currentDeposit.toFixed(2)} would reduce your safe daily spend to RM {nextSafeDaily.toFixed(2)}/day, which is below the RM 10.00 survival limit.
              </p>
            </div>
          )}

          {isLast && (
            <div className="flex gap-2">
              <Button
                className={cn(
                  "flex-1 h-8 text-[10px] text-white font-bold",
                  isRestricted 
                    ? "bg-rose-500/20 hover:bg-rose-500/20 cursor-not-allowed text-rose-300" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
                onClick={() => actionHandler({
                  id: 'approve_save',
                  label: 'Approve & Deposit',
                  type: 'create_pocket',
                  payload: { 
                    ...m.proposal, 
                    target: parseFloat(saveTarget) || 2500,
                    current: currentDeposit 
                  }
                })}
                disabled={isExecuting || isRestricted}
              >
                {isExecuting ? "Processing..." : "Approve"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-8 text-[10px] border-pink-100 text-[#555555] hover:bg-pink-50"
                onClick={() => actionHandler({ id: 'decline_save', label: 'Decline', type: 'postpone' })}
                disabled={isExecuting}
              >
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (m.proposal.type === 'otp_verification') {
    return (
      <Card className="glass-card bg-white/95 border-amber-500/20 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-bold text-[#221F20] uppercase tracking-wider">Security Verification</p>
          </div>
          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
            <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
              You are transferring RM {m.proposal.amount.toFixed(2)} to {m.proposal.recipient}. Please enter your 6-digit OTP to proceed.
            </p>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP (e.g. 123456)"
              className="h-10 text-center tracking-widest font-mono text-sm bg-white border-amber-200"
              maxLength={6}
              onChange={(e) => {
                if (e.target.value.length === 6) {
                  // Simulate verification delay
                  setTimeout(() => {
                    actionHandler({ 
                      id: 'approve_otp', 
                      label: 'Verified', 
                      type: 'transfer', 
                      payload: { amount: m.proposal.amount, recipient: m.proposal.recipient, otpConfirmed: true } 
                    });
                  }, 800);
                }
              }}
              disabled={isExecuting || !isLast}
            />
            {isExecuting && (
              <p className="text-[8px] text-center text-amber-500 font-bold animate-pulse mt-2">Verifying...</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card bg-white/95 border-primary/20 overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
            {m.proposal.icon || (m.proposal.type === 'transfer' ? '💸' : '🎯')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-[#221F20]">{m.proposal.name || (m.proposal.type === 'transfer' ? 'Transfer' : 'Pocket')}</p>
              <Badge className="text-[7px] h-3 bg-primary/20 text-primary border-primary/20 px-1 font-black">
                {m.proposal.type === 'transfer' ? 'Verified' : 'Managed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              {m.proposal.type === 'transfer' ? (
                <p className="text-[9px] text-muted-foreground">{m.proposal.bank} • 3188 **** 1100</p>
              ) : (
                <p className="text-[9px] text-muted-foreground">RM {m.proposal.current} / RM {m.proposal.target}</p>
              )}
            </div>
          </div>
        </div>

        {m.proposal.type !== 'transfer' && m.proposal.target && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-primary/80 font-bold capitalize">({m.proposal.riskLevel || 'Low'} Risk)</span>
              <span className="font-bold text-primary">{Math.round((m.proposal.current / m.proposal.target) * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(m.proposal.current / m.proposal.target) * 100}%` }}
              />
            </div>
          </div>
        )}

        {m.proposal.type === 'transfer' && (
          <div className="flex justify-between items-center text-[9px] py-1">
            <span className="text-muted-foreground">Amount to send</span>
            <span className="text-[#221F20] font-bold">RM {m.proposal.amount?.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-pink-100">
          <span className="text-[8px] text-emerald-500 font-bold flex items-center gap-1">
            {m.proposal.type === 'transfer' ? <Send className="w-2 h-2" /> : <TrendingUp className="w-2 h-2" />}
            {m.proposal.type === 'transfer' ? 'Security Cleared' : 'Growth Enabled'}
          </span>
          <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Proposal Preview</span>
        </div>
      </CardContent>
    </Card>
  );
}
