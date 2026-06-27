import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"
import { cn } from "@/lib/utils"
import { Message } from "./types"

interface StructuredCardProps {
  message: Message;
}

export function StructuredCard({ message: m }: StructuredCardProps) {
  const router = useRouter();
  const { isSpendGuardActive, toggleSpendGuard, activateStreakShield, user } = useStore();

  if (!m.structured) return null;

  return (
    <div className="bg-white/95 border border-pink-100 rounded-2xl shadow-sm overflow-hidden w-fit max-w-[100%]">
      {/* Status header strip */}
      <div className={cn(
        "px-3 py-1.5 flex items-center justify-between gap-2 border-b",
        m.structured.status === 'good' ? "bg-emerald-50 border-emerald-100" :
          m.structured.status === 'warning' ? "bg-amber-50 border-amber-100" :
            m.structured.status === 'critical' ? "bg-red-50 border-red-100" :
              "bg-slate-50 border-slate-100"
      )}>
        <span className="text-[11px] font-black text-[#221F20] leading-tight">{m.structured.headline}</span>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
          m.structured.status === 'good' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
            m.structured.status === 'warning' ? "bg-amber-100 text-amber-700 border-amber-200" :
              m.structured.status === 'critical' ? "bg-red-100 text-red-700 border-red-200" :
                "bg-slate-100 text-slate-500 border-slate-200"
        )}>
          {m.structured.status === 'good' ? '✓ OK' :
            m.structured.status === 'warning' ? '⚠ Caution' :
              m.structured.status === 'critical' ? '🔴 Alert' : 'Info'}
        </span>
      </div>

      <div className="p-3 space-y-2">
        {/* Insight sentence */}
        <p className="text-[11px] text-[#555555] leading-relaxed">{m.structured.insight}</p>

        {/* Educational Lesson */}
        {m.structured.lesson && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2 flex gap-2 items-start mt-1">
            <span className="text-[10px]">💡</span>
            <p className="text-[9px] text-blue-800 leading-relaxed italic">{m.structured.lesson}</p>
          </div>
        )}

        {/* Metric chip */}
        {m.structured.metric && (
          <div className="flex items-center gap-1.5 bg-[#F8F8F8] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 w-fit">
            <span className="text-[9px] font-bold text-[#727272] uppercase tracking-wider">{m.structured.metric.label}</span>
            <span className="text-[10px] font-black text-[#221F20]">{m.structured.metric.value}</span>
            {m.structured.metric.trend === 'up' && <span className="text-emerald-500 text-[10px]">↑</span>}
            {m.structured.metric.trend === 'down' && <span className="text-red-500 text-[10px]">↓</span>}
            {m.structured.metric.trend === 'flat' && <span className="text-slate-400 text-[10px]">→</span>}
          </div>
        )}

        {/* CTA action button */}
        {m.structured.action && (() => {
          const handleAction = () => {
            switch (m.structured?.actionType) {
              case 'toggle_spend_guard':
                toggleSpendGuard();
                break;
              case 'go_savings':
                router.push('/savings');
                break;
              case 'go_bills':
                router.push('/bills');
                break;
              case 'go_transfer':
                router.push('/transfer');
                break;
            }
          };

          const label = m.structured?.actionType === 'toggle_spend_guard'
            ? (isSpendGuardActive ? 'Disable Spend Guard' : 'Enable Spend Guard')
            : m.structured.action;

          return (
            <button
              onClick={handleAction}
              className="w-full mt-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white text-[10px] font-black hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-[#DF0059]/20 text-left flex items-center justify-between gap-1"
            >
              <span>{label}</span>
              <span>→</span>
            </button>
          );
        })()}
      </div>

      {/* Share footer */}
      <div className="px-3 py-2 border-t border-pink-100 flex justify-between items-center gap-4 bg-pink-50/30">
        <span className="text-[8px] text-[#727272]">Share to get Streak Shield + RM10!</span>
        <button
          onClick={() => {
            activateStreakShield();
            useStore.setState((s) => ({ user: { ...s.user, currentBalance: s.user.currentBalance + 10 } }));
            alert("Passport generated! 🛡️ Streak Shield activated & RM10 simulated referral bounty added to wallet!");
          }}
          className="px-2 py-0.5 rounded-lg bg-pink-100 text-[#CC0D5A] hover:bg-pink-200 text-[8px] font-extrabold transition-all"
        >
          📢 Share Roast
        </button>
      </div>
    </div>
  );
}
