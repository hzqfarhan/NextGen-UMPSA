"use client"

import { Bill, useStore } from "@/store/useStore"
import { t } from "@/lib/translations"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ReceiptText, 
  Plus, 
  ChevronLeft, 
  ShieldCheck, 
  CalendarClock, 
  Zap, 
  Settings2,
  RefreshCcw
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useMemo } from "react"
import { BillCard } from "./bills/BillCard"
import { BillSetupModal } from "./bills/BillSetupModal"
import Link from "next/link"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

export function Bills() {
  const { bills, language, processAutoPay } = useStore()
  const strings = t[language]
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'paid'>('upcoming')

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingBill(null)
  }

  const lockedAmount = useMemo(() => 
    bills.filter(b => b.isLocked && b.status !== 'paid')
         .reduce((sum, b) => sum + b.amount, 0)
  , [bills])

  const nextBill = useMemo(() => {
    const upcoming = bills.filter(b => b.status !== 'paid')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    return upcoming[0];
  }, [bills])

  const autoPayCount = bills.filter(b => b.autopayEnabled).length;
  const needsSetupCount = bills.filter(b => b.status === 'needs_setup').length;

  const upcomingBills = bills.filter(b => b.status !== 'paid');
  const paidBills = bills.filter(b => b.status === 'paid');

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 pt-2">
        <Link href="/dashboard" className="p-2 rounded-xl bg-white border border-pink-100 text-[#727272] hover:bg-[#FFE9F2] hover:text-[#DF0059] transition-all hover:scale-105 active:scale-95 shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight text-slate-900">{strings.billsHeader}</h1>
          <p className="text-[#CC0D5A] text-[9px] font-black uppercase tracking-widest leading-tight">PROTECT YOUR ESSENTIALS</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] hover:opacity-95 flex items-center justify-center text-white shadow-lg shadow-[#DF0059]/25 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-[#FAE7EF] to-[#FFE9F2]/70 backdrop-blur-md rounded-[1.5rem] p-3 flex flex-col gap-1.5 border border-[#F3C7D8] shadow-[0_8px_30px_rgba(223,0,89,0.04)] hover:scale-[1.03] transition-all duration-300">
          <span className="text-[8px] font-black uppercase tracking-widest text-[#CC0D5A] leading-none">{strings.billsProtected}</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#DF0059] flex-shrink-0" />
            <p className="text-[12px] font-black text-[#221F20] leading-none whitespace-nowrap">RM {lockedAmount.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-[1.5rem] p-3 flex flex-col gap-1.5 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:scale-[1.03] transition-all duration-300">
          <span className="text-[8px] font-black uppercase tracking-widest text-[#727272] leading-none">{strings.billsNext}</span>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-[#727272] flex-shrink-0" />
            <p className="text-[10px] font-black leading-none text-[#221F20] truncate max-w-[70px]">{nextBill ? nextBill.name : '-'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#E8F6EF] to-emerald-50/40 backdrop-blur-md rounded-[1.5rem] p-3 flex flex-col gap-1.5 border border-emerald-200/80 shadow-[0_8px_30px_rgba(16,185,129,0.03)] hover:scale-[1.03] transition-all duration-300">
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700 leading-none">{strings.billsAutoPay}</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <p className="text-[12px] font-black leading-none text-[#221F20] whitespace-nowrap">{autoPayCount} {strings.billsActive}</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {needsSetupCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-center"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
            <Settings2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-amber-500 flex-1">
            {needsSetupCount} {strings.billsNeedsSetup}
          </p>
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            ACTION
          </Badge>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex p-1.5 bg-[#F8F8F8] border border-slate-200/70 rounded-2xl shadow-inner">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 select-none",
            activeTab === 'upcoming' 
              ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-md shadow-[#DF0059]/20' 
              : 'text-[#727272] hover:text-[#DF0059]'
          )}
        >
          {strings.billsUpcoming} ({upcomingBills.length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 select-none",
            activeTab === 'paid' 
              ? 'bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white shadow-md shadow-[#DF0059]/20' 
              : 'text-[#727272] hover:text-[#DF0059]'
          )}
        >
          {strings.billsPaid} ({paidBills.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {(activeTab === 'upcoming' ? upcomingBills : paidBills).map(bill => (
              <BillCard key={bill.id} bill={bill} onEdit={handleEdit} />
            ))}

            {(activeTab === 'upcoming' ? upcomingBills : paidBills).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center shadow-inner">
                  <ReceiptText className="w-8 h-8 text-slate-400/80" />
                </div>
                <p className="text-sm font-semibold tracking-wide text-slate-500">No {activeTab} bills found</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center">
        <motion.button 
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => processAutoPay()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-[#FFE9F2]/30 border border-[#F3C7D8]/80 text-[#CC0D5A] hover:text-[#DF0059] transition-all shadow-sm"
        >
          <RefreshCcw className="w-4 h-4 animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-widest">Process Simulated AutoPay</span>
        </motion.button>
      </div>

      <BillSetupModal 
        isOpen={showAddModal} 
        onClose={handleCloseModal}
        editingBill={editingBill}
      />
    </div>
  )
}
