import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import { Language } from '@/lib/translations';
import { calculateNextDueDate, isBillDue, isAutoPaySafe } from '@/lib/billEngine';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income' | 'saving';
  confidence?: number;
}

export interface PetOffset {
  offsetY: number;
  scale: number;
}

export interface SavingsPocket {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  mode: 'savings' | 'growth';
  riskLevel?: 'low' | 'medium' | 'high';
  isMainGoal?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'analyzing' | 'alert' | 'action';
  latestFinding: string;
  confidence: number;
  recommendedAction: string;
  tools: string[];
}

export type BillFrequency = "one-time" | "weekly" | "monthly" | "yearly";

export type BillStatus =
  | "upcoming"
  | "paid"
  | "missed"
  | "paused"
  | "needs_setup"
  | "low_balance";

export type AutoPaySafety = "strict" | "balanced" | "flexible";

export type BillMode =
  | "simulated_autopay"
  | "auto_track"
  | "budget_lock"
  | "protected_only";

export type BillCategory =
  | "rent"
  | "phone"
  | "ptptn"
  | "internet"
  | "streaming"
  | "transport"
  | "petrol"
  | "custom";

export type BillPaymentRail =
  | "bank_transfer"
  | "duitnow"
  | "jompay"
  | "provider_account"
  | "card_subscription"
  | "ewallet"
  | "budget_only"
  | "none";

export interface BillPaymentRecord {
  id: string;
  billId: string;
  amount: number;
  paidAt: string;
  method: "manual" | "autopay" | "auto_track";
  status: "paid" | "failed" | "paused";
  transactionId?: string;
}

export interface Bill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDay?: number;
  dueDate?: string;
  nextDueDate: string;
  frequency: BillFrequency;

  isLocked: boolean;
  mode: BillMode;
  paymentRail: BillPaymentRail;

  autopayEnabled: boolean;
  autoTrackEnabled?: boolean;
  autopaySafety: AutoPaySafety;

  reminderDaysBefore: number;
  status: BillStatus;
  source: "onboarding" | "manual" | "detected";

  // Provider details
  provider?: string;
  serviceName?: string;
  productType?: string;

  // Payment details (masked)
  recipientName?: string;
  bankName?: string;
  accountNumber?: string; // used for bank or provider
  referenceNumber?: string; // general reference

  duitNowIdType?: "mobile" | "nric" | "passport" | "army_police" | "brn";
  duitNowId?: string;

  billerCode?: string;
  ref1?: string;
  ref2?: string;

  // Subscription / Auto-track details
  accountEmail?: string;
  planName?: string;
  paymentSourceLabel?: string;
  cardLast4?: string;

  // Transport details
  passType?: string;
  tngCardNickname?: string;
  tngCardLast4?: string;
  tngWalletPhone?: string;

  // Petrol details
  vehicleLabel?: string;

  lastPaidAt?: string;
  paymentHistory?: BillPaymentRecord[];
  createdAt: string;
  updatedAt?: string;
}

interface NextGenState {
  language: Language;
  user: {
    name: string;
    type: string;
    monthlyAllowance: number;
    currentBalance: number;
    nextAllowanceDate: string;
    emergencyFundGoal: number;
    currentEmergencyFund: number;
    spendingPersonality: string;
    incomeSource?: string;
    fixedFrequency?: string;
    setupDate?: string;
    durationDays?: number;
    lumpStartDate?: string;
    weeklyPayDay?: string;
    lumpDuration?: number;
    lumpDurationUnit?: string;
    runwayDuration?: number;
    runwayDurationUnit?: string;
    totalCommitments?: number;
    cardLastFour?: string;
    avatar?: string;
  };
  transactions: Transaction[];
  savingsPockets: SavingsPocket[];
  agents: Agent[];
  nextGenScore: number;
  nextGenCashflowScore: number;
  nextGenSavingsScore: number;
  nextGenDebtScore: number;
  debtRiskScore: number;
  cashflowRisk: 'low' | 'medium' | 'high';
  safeDailySpend: number;
  initialSafeDaily: number;
  isSpendGuardActive: boolean;
  isSurvivalModeActive: boolean;
  isAutoSaveActive: boolean;
  autoSaveTargetIds: string[];
  autoSaveFrequency: 'daily' | 'weekly' | 'monthly';
  autoSaveAmount: number;
  lastAutoSaveDate: string | null;
  pet: {
    message: string;
    animation?: string;
  };
  lastGrowthSimulationDate: string | null;
  isRoundUpActive: boolean;
  showSpendOnly: boolean;
  hideBalance: boolean;
  bills: Bill[];
  pendingMainGoal: string | null;
  hasNotificationSave: boolean;
  lastQuotaUpdateDate: string | null;
  
  // Gamification & BIMB Transition State
  currentStreak: number;
  highestStreak: number;
  lastCalculatedDate: string;
  membershipTier: 'Bronze' | 'Silver' | 'Gold';
  streakShieldActive: boolean;
  awfarDrawTickets: number;
  isBimbMigrated: boolean;
  
  // Actions
  setShowSpendOnly: (val: boolean) => void;
  setHideBalance: (val: boolean) => void;
  addTransaction: (t: Transaction, skipRoundUp?: boolean) => void;
  addSavingsPocket: (p: SavingsPocket) => void;
  updateSavingsPocket: (id: string, updates: Partial<SavingsPocket>) => void;
  deleteSavingsPocket: (id: string) => void;
  addFundsToPocket: (id: string, amount: number) => void;
  calculateDailyLimitForBalance: (balance: number) => number;
  checkAndRefreshDailyQuota: () => void;
  toggleSpendGuard: () => void;
  toggleSurvivalMode: () => void;
  toggleAutoSave: () => void;
  toggleRoundUp: () => void;
  setAutoSaveTargetIds: (ids: string[]) => void;
  processAutoSave: () => void;
  processRoundUp: (amount: number) => void;
  simulateGrowth: () => void;
  updateNextGenScore: () => void;
  setLanguage: (lang: Language) => void;
  
  // Gamification Actions
  incrementStreak: () => void;
  resetStreak: () => void;
  activateStreakShield: () => void;
  triggerBimbMigration: () => void;
  moveFundsToAwfarNest: (amount: number) => void;
  simulateNextDay: () => void;
  
  // Bills Actions
  addBill: (b: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  toggleBillLock: (id: string) => void;
  toggleBillAutopay: (id: string) => void;
  payBillNow: (id: string) => void;
  processAutoPay: () => void;

  // Pet Sprite Tuning
  petOffsets: Record<string, PetOffset>;
  updatePetOffset: (animation: string, offset: Partial<PetOffset>) => void;
}

const RISK_RETURNS = {
  low: 0.035, // 3.5% p.a.
  medium: 0.042, // 4.2% p.a.
  high: 0.065, // 6.5% p.a.
};

function getDaysRemaining(state: any) {
  if (state.user.incomeSource === "fixed" && state.user.fixedFrequency === "weekly" && state.user.weeklyPayDay) {
    const daysMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };
    const targetIndex = daysMap[state.user.weeklyPayDay.toLowerCase()] ?? 5;
    const today = new Date();
    const todayIndex = today.getDay();
    let diff = targetIndex - todayIndex;
    if (diff <= 0) diff += 7;
    return diff;
  }
  if (!state.user.nextAllowanceDate) return 14;
  const today = new Date();
  const nextDate = new Date(state.user.nextAllowanceDate);
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 30;
}

function calculateDailyLimit(state: any, updatedBalance: number, daysLeft: number) {
  const totalCommitments = state.user.totalCommitments || 0;
  let remainingCommitment = 0;

  if (state.user.incomeSource === "fixed") {
    if (state.user.fixedFrequency === "weekly") {
      remainingCommitment = totalCommitments / 4.33; // weekly commitment
    } else {
      remainingCommitment = totalCommitments; // monthly commitment
    }
  } else {
    const start = state.user.lumpStartDate ? new Date(state.user.lumpStartDate) : (state.user.setupDate ? new Date(state.user.setupDate) : new Date());
    const duration = state.user.durationDays || 30;
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const remainingDays = diffDays > 0 ? diffDays : duration;
    const remainingMonths = remainingDays / 30;
    remainingCommitment = totalCommitments * remainingMonths;
  }

  // Calculate smart auto save daily amount
  let dailyAutoSave = 0;
  if (state.isAutoSaveActive) {
    if (state.autoSaveFrequency === 'daily') {
      dailyAutoSave = state.autoSaveAmount;
    } else if (state.autoSaveFrequency === 'weekly') {
      dailyAutoSave = state.autoSaveAmount / 7;
    } else if (state.autoSaveFrequency === 'monthly') {
      dailyAutoSave = state.autoSaveAmount / 30;
    }
  }

  // Saving default commitment rate (0.1% of balance)
  const SAVING_DEFAULT_COMMITMENT_RATE = 0.001;
  const savingDefaultCommitment = updatedBalance * SAVING_DEFAULT_COMMITMENT_RATE;

  const remainingDays = daysLeft > 0 ? daysLeft : 1;
  const numerator = updatedBalance - (remainingCommitment + dailyAutoSave) - savingDefaultCommitment;
  const calculatedDaily = numerator / remainingDays;

  const flooredDaily = Math.round(calculatedDaily * 100) / 100;
  return flooredDaily > 0 ? flooredDaily : 0.0;
}

export const initialStoreState = {
  language: 'en' as Language,
  user: {
    name: 'Aiman',
    type: 'Student',
    monthlyAllowance: 800,
    currentBalance: 420,
    nextAllowanceDate: "2026-05-23T05:00:00.000Z",
    emergencyFundGoal: 500,
    currentEmergencyFund: 85,
    spendingPersonality: 'Food Overspender + Impulse Buyer',
    cardLastFour: '4292',
    avatar: "/assets/pfp/user.png",
  },
  transactions: [],
  savingsPockets: [],
  agents: [
    { id: 'orch', name: 'Orchestrator Agent', status: 'idle' as const, latestFinding: 'System nominal. Monitoring cashflow.', confidence: 0.99, recommendedAction: 'No action needed', tools: ['monitor_all', 'dispatch'] },
    { id: 'spend', name: 'Spend Guardian Agent', status: 'alert' as const, latestFinding: 'Food spending is 15% above average.', confidence: 0.92, recommendedAction: 'Limit GrabFood to RM15/day', tools: ['analyze_category', 'detect_anomaly'] },
    { id: 'cash', name: 'Cashflow Prediction Agent', status: 'alert' as const, latestFinding: 'Predicted broke date: 18 May', confidence: 0.87, recommendedAction: 'Activate Impulse Guard', tools: ['predict_cashflow', 'calculate_safe_daily_spend'] },
    { id: 'debt', name: 'Commitment Shield Agent', status: 'idle' as const, latestFinding: 'No new debt detected.', confidence: 0.95, recommendedAction: 'Continue monitoring', tools: ['scan_bnpl', 'check_installments'] },
  ],
  nextGenScore: 68,
  nextGenCashflowScore: 65,
  nextGenSavingsScore: 40,
  nextGenDebtScore: 95,
  debtRiskScore: 45,
  cashflowRisk: 'medium' as const,
  safeDailySpend: 18.5,
  initialSafeDaily: 18.5,
  isSpendGuardActive: false,
  isSurvivalModeActive: false,
  isAutoSaveActive: false,
  autoSaveTargetIds: ['1'],
  autoSaveFrequency: 'daily' as const,
  autoSaveAmount: 2.0,
  lastAutoSaveDate: null,
  pet: {
    message: 'Stay focused!',
    animation: "idle"
  },
  lastGrowthSimulationDate: null,
  isRoundUpActive: true,
  showSpendOnly: false,
  hideBalance: false,
  bills: [],
  pendingMainGoal: null,
  hasNotificationSave: false,
  lastQuotaUpdateDate: null,
  currentStreak: 0,
  highestStreak: 0,
  lastCalculatedDate: '',
  membershipTier: 'Bronze' as const,
  streakShieldActive: false,
  awfarDrawTickets: 0,
  isBimbMigrated: false,
  petOffsets: {
    idle: { offsetY: -2, scale: 800 },
    walk: { offsetY: -6.5, scale: 800 },
    run: { offsetY: -13, scale: 800 },
    wave: { offsetY: -15.9, scale: 800 },
    excited: { offsetY: -23.6, scale: 800 },
    sad: { offsetY: -27.5, scale: 800 },
    happy: { offsetY: -33.3, scale: 800 },
    angry: { offsetY: -39.7, scale: 800 },
    think: { offsetY: -44.3, scale: 800 },
    blink: { offsetY: 20.6, scale: 800 },
  },
};

// Persisted Zustand store using localStorage
const useStoreBase = create<NextGenState>()(
  persist(
    (set, get) => ({
      ...initialStoreState,
      setShowSpendOnly: (val) => set({ showSpendOnly: val }),
      setHideBalance: (val) => set({ hideBalance: val }),
      addTransaction: (t, skipRoundUp = false) => {
        const state = get();
        const updatedBalance = state.user.currentBalance - (t.type === 'income' ? -t.amount : t.amount);
        const daysLeft = getDaysRemaining(state);
        const nextSafeDaily = calculateDailyLimit(state, updatedBalance, daysLeft);

        set((state) => {
          const nextTransactions = [t, ...state.transactions];
          return {
            transactions: nextTransactions,
            user: { ...state.user, currentBalance: updatedBalance },
            safeDailySpend: nextSafeDaily,
            initialSafeDaily: nextSafeDaily
          };
        });
        
        if (!skipRoundUp && t.type === 'expense') {
          get().processRoundUp(t.amount);
        }
        get().updateNextGenScore();
      },
      addSavingsPocket: (p) => {
        const state = get();
        const updatedBalance = state.user.currentBalance - p.current;
        const daysLeft = getDaysRemaining(state);
        const nextSafeDaily = calculateDailyLimit(state, updatedBalance, daysLeft);

        if (p.current > 0 && nextSafeDaily < 10.0) {
          throw new Error("Survival protocol active: Creating this pocket is blocked as the initial deposit reduces your daily spend below RM 10.00.");
        }

        set((state) => {
          const cleanedPockets = p.isMainGoal
            ? state.savingsPockets.map(pocket => ({ ...pocket, isMainGoal: false }))
            : state.savingsPockets;
          
          const newTransactions = [...state.transactions];
          if (p.current > 0) {
            newTransactions.unshift({
              id: `save-init-${Date.now()}`,
              title: `Goal Start: ${p.name}`,
              amount: p.current,
              category: "Saving",
              date: new Date().toISOString(),
              type: "saving" as const,
              confidence: 1.0
            });
          }

          return {
            savingsPockets: [...cleanedPockets, p],
            user: { ...state.user, currentBalance: updatedBalance },
            transactions: newTransactions,
            safeDailySpend: nextSafeDaily,
            initialSafeDaily: nextSafeDaily
          };
        });
        get().updateNextGenScore();
      },
      updateSavingsPocket: (id, updates) => {
        set((state) => {
          const cleanedPockets = updates.isMainGoal
            ? state.savingsPockets.map(pocket => pocket.id === id ? pocket : { ...pocket, isMainGoal: false })
            : state.savingsPockets;
          return {
            savingsPockets: cleanedPockets.map(p =>
              p.id === id ? { ...p, ...updates } : p
            )
          };
        });
        get().updateNextGenScore();
      },
      deleteSavingsPocket: (id) => {
        const state = get();
        const pocket = state.savingsPockets.find(p => p.id === id);
        if (!pocket) return;
        
        const updatedBalance = state.user.currentBalance + pocket.current;
        const daysLeft = getDaysRemaining(state);
        const nextSafeDaily = calculateDailyLimit(state, updatedBalance, daysLeft);

        set((state) => {
          const newTransactions = [...state.transactions];
          if (pocket.current > 0) {
            newTransactions.unshift({
              id: `save-reclaim-${Date.now()}`,
              title: `Reclaimed from ${pocket.name}`,
              amount: pocket.current,
              category: "Income",
              date: new Date().toISOString(),
              type: "income" as const,
              confidence: 1.0
            });
          }

          return {
            savingsPockets: state.savingsPockets.filter(p => p.id !== id),
            user: { ...state.user, currentBalance: updatedBalance },
            transactions: newTransactions,
            safeDailySpend: nextSafeDaily,
            initialSafeDaily: nextSafeDaily
          };
        });
        get().updateNextGenScore();
      },
      addFundsToPocket: (id, amount) => {
        const state = get();
        const daysLeft = getDaysRemaining(state);
        const safeDailyAfter = calculateDailyLimit(state, state.user.currentBalance - amount, daysLeft);

        if (safeDailyAfter < 10.0) {
          throw new Error("Survival protocol active: This deposit is blocked as it would reduce your daily spending below the RM 10.00 survival limit.");
        }

        set((state) => {
          const nextPockets = state.savingsPockets.map(p =>
            p.id === id ? { ...p, current: p.current + amount } : p
          );
          const pocketName = nextPockets.find(p => p.id === id)?.name || "pocket";
          const newTx = {
            id: Date.now().toString(),
            title: `Saved to ${pocketName}`,
            amount: amount,
            category: "Saving",
            date: new Date().toISOString(),
            type: "saving" as const,
            confidence: 1.0
          };

          const todayStr = new Date().toDateString();
          const preSavingTx = state.transactions
            .filter(t => t.type === 'saving' && new Date(t.date).toDateString() === todayStr)
            .reduce((sum, t) => sum + t.amount, 0);
          const totalSavedToday = preSavingTx + amount;

          const isFirstTimeMeetingQuota = totalSavedToday >= 1.0 && preSavingTx < 1.0;
          const petMessage = isFirstTimeMeetingQuota
            ? `Awesome save! You've met today's savings quota of RM 1.00 and protected your streak! 🔥`
            : `Nice save! Moving RM ${amount.toFixed(2)} to ${pocketName}. Your daily quota remains stable for today, and your NextGen Score is fully protected!`;

          const petAnimation = isFirstTimeMeetingQuota ? "excited" : "happy";

          return {
            savingsPockets: nextPockets,
            transactions: [newTx, ...state.transactions],
            user: { ...state.user, currentBalance: state.user.currentBalance - amount },
            safeDailySpend: safeDailyAfter,
            initialSafeDaily: safeDailyAfter,
            pet: {
              message: petMessage,
              animation: petAnimation
            }
          };
        });
        get().updateNextGenScore();
      },
      calculateDailyLimitForBalance: (balance) => {
        const state = get();
        const daysLeft = getDaysRemaining(state);
        return calculateDailyLimit(state, balance, daysLeft);
      },
      checkAndRefreshDailyQuota: () => {
        const todayStr = new Date().toDateString();
        const state = get();
        
        if (state.lastQuotaUpdateDate === todayStr) return;

        const balance = state.user.currentBalance;
        const SAVING_DEFAULT_COMMITMENT_RATE = 0.001;
        const savingDefaultCommitment = balance * SAVING_DEFAULT_COMMITMENT_RATE;
        
        let nextPockets = state.savingsPockets;
        let nextBalance = balance;
        let addedSavingsTx = null;

        if (savingDefaultCommitment > 0) {
          const mainPocket = state.savingsPockets.find(p => p.isMainGoal);
          if (mainPocket) {
            nextPockets = state.savingsPockets.map(p =>
              p.isMainGoal ? { ...p, current: p.current + savingDefaultCommitment } : p
            );
            nextBalance = balance - savingDefaultCommitment;
            
            addedSavingsTx = {
              id: "auto-commitment-" + Date.now(),
              title: `Default Saving (${mainPocket.name})`,
              amount: savingDefaultCommitment,
              category: "Saving",
              date: new Date().toISOString(),
              type: "saving" as const,
              confidence: 1.0
            };
          }
        }

        const daysLeft = getDaysRemaining(state);
        // Calculate commitments
        let remainingCommitment = 0;
        if (state.user.incomeSource === "fixed" && state.user.fixedFrequency === "weekly") {
          remainingCommitment = (state.user.totalCommitments || 0) / 4.33;
        } else if (state.user.incomeSource === "fixed") {
          remainingCommitment = state.user.totalCommitments || 0;
        } else {
          const start = state.user.lumpStartDate ? new Date(state.user.lumpStartDate) : (state.user.setupDate ? new Date(state.user.setupDate) : new Date());
          const duration = state.user.durationDays || 30;
          const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
          const today = new Date();
          const diffTime = end.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const remainingDays = diffDays > 0 ? diffDays : duration;
          const remainingMonths = remainingDays / 30;
          remainingCommitment = (state.user.totalCommitments || 0) * remainingMonths;
        }

        // Calculate smart auto save daily amount
        let dailyAutoSave = 0;
        if (state.isAutoSaveActive) {
          if (state.autoSaveFrequency === 'daily') {
            dailyAutoSave = state.autoSaveAmount;
          } else if (state.autoSaveFrequency === 'weekly') {
            dailyAutoSave = state.autoSaveAmount / 7;
          } else if (state.autoSaveFrequency === 'monthly') {
            dailyAutoSave = state.autoSaveAmount / 30;
          }
        }

        const remainingDays = daysLeft > 0 ? daysLeft : 1;
        const numerator = nextBalance - (remainingCommitment + dailyAutoSave) - (nextBalance * SAVING_DEFAULT_COMMITMENT_RATE);
        const calculatedDaily = numerator / remainingDays;
        const flooredDaily = Math.round(Math.max(0, calculatedDaily) * 100) / 100;

        set((state) => ({
          lastQuotaUpdateDate: todayStr,
          savingsPockets: nextPockets,
          user: { ...state.user, currentBalance: nextBalance },
          transactions: addedSavingsTx ? [addedSavingsTx, ...state.transactions] : state.transactions,
          initialSafeDaily: flooredDaily > 0 ? flooredDaily : 10.0,
          safeDailySpend: flooredDaily > 0 ? flooredDaily : 10.0,
        }));
        
        get().updateNextGenScore();
      },
      toggleSpendGuard: () => set((state) => ({ isSpendGuardActive: !state.isSpendGuardActive })),
      toggleSurvivalMode: () => set((state) => ({ isSurvivalModeActive: !state.isSurvivalModeActive })),
      toggleAutoSave: () => set((state) => ({ isAutoSaveActive: !state.isAutoSaveActive })),
      toggleRoundUp: () => set((state) => ({ isRoundUpActive: !state.isRoundUpActive })),
      setAutoSaveTargetIds: (ids) => set({ autoSaveTargetIds: ids }),
      processAutoSave: () => set((state) => {
        const today = new Date();
        const todayStr = today.toDateString();

        if (!state.isAutoSaveActive || state.lastAutoSaveDate === todayStr || state.autoSaveTargetIds.length === 0) return state;

        // Mock frequency logic for demo
        if (state.autoSaveFrequency === 'weekly' && today.getDay() !== 1) return state; // Only Mondays
        if (state.autoSaveFrequency === 'monthly' && today.getDate() !== 1) return state; // Only 1st of month

        const totalAmount = state.autoSaveAmount;

        if (state.user.currentBalance < 20) {
          return {
            lastAutoSaveDate: todayStr,
            pet: { message: "Auto-save paused: Balance too low!" }
          };
        }

        const splitAmount = totalAmount / state.autoSaveTargetIds.length;
        const newPockets = state.savingsPockets.map(p => {
          if (state.autoSaveTargetIds.includes(p.id)) {
            return { ...p, current: p.current + splitAmount };
          }
          return p;
        });

        return {
          lastAutoSaveDate: todayStr,
          user: { ...state.user, currentBalance: state.user.currentBalance - totalAmount },
          savingsPockets: newPockets,
          pet: { 
            message: `Nice! Saved RM ${totalAmount.toFixed(2)} automatically today.`,
            animation: "happy"
          }
        };
      }),
      processRoundUp: (amount) => set((state) => {
        if (!state.isRoundUpActive || state.autoSaveTargetIds.length === 0) return state;
        
        const nextDollar = Math.ceil(amount);
        const roundUp = nextDollar - amount;
        
        if (roundUp <= 0) return state;
        if (state.user.currentBalance < roundUp) return state;

        const splitAmount = roundUp / state.autoSaveTargetIds.length;
        const newPockets = state.savingsPockets.map(p => {
          if (state.autoSaveTargetIds.includes(p.id)) {
            return { ...p, current: p.current + splitAmount };
          }
          return p;
        });

        return {
          user: { ...state.user, currentBalance: state.user.currentBalance - roundUp },
          savingsPockets: newPockets,
          pet: { 
            message: `Spare change alert! RM ${roundUp.toFixed(2)} rounded up into pockets.`,
            animation: "excited"
          }
        };
      }),
      simulateGrowth: () => set((state) => {
        const today = new Date().toDateString();
        if (state.lastGrowthSimulationDate === today) return state;

        let totalGrowth = 0;
        const newPockets = state.savingsPockets.map(p => {
          if (p.mode === 'growth' && p.riskLevel) {
            let annualRate = RISK_RETURNS[p.riskLevel];
            if (state.membershipTier === 'Gold') {
              annualRate += 0.005; // 0.5% yield boost for Gold Tier
            }
            // Simulate daily growth (compounded daily for effect)
            const dailyRate = annualRate / 365;
            const growth = p.current * dailyRate;
            totalGrowth += growth;
            return { ...p, current: p.current + growth };
          }
          return p;
        });

        if (totalGrowth === 0) return { lastGrowthSimulationDate: today };

        return {
          savingsPockets: newPockets,
          lastGrowthSimulationDate: today,
          pet: { 
            message: `Market update: Your growth pockets earned RM ${totalGrowth.toFixed(2)} today! 📈${state.membershipTier === 'Gold' ? ' (Gold 0.5% Yield Boost Active!)' : ''}`,
            animation: "excited"
          }
        };
      }),
      incrementStreak: () => set((state) => {
        const nextStreak = state.currentStreak + 1;
        const highest = Math.max(state.highestStreak, nextStreak);
        let tier = state.membershipTier;
        if (nextStreak >= 30) {
          tier = 'Gold';
        } else if (nextStreak >= 7) {
          tier = 'Silver';
        }
        return {
          currentStreak: nextStreak,
          highestStreak: highest,
          membershipTier: tier,
          pet: {
            message: `Streak increased to ${nextStreak} days! 🔥 Keep it up!`,
            animation: "excited"
          }
        };
      }),
      resetStreak: () => set((state) => ({
        currentStreak: 0,
        membershipTier: 'Bronze',
        pet: {
          message: "Streak reset to 0. Every day is a new chance to start saving! 🌱",
          animation: "sad"
        }
      })),
      activateStreakShield: () => set((state) => ({
        streakShieldActive: true,
        pet: {
          message: "Streak Shield activated! Your saving streak is protected for the next simulated day. 🛡️",
          animation: "happy"
        }
      })),
      triggerBimbMigration: () => set((state) => ({
        isBimbMigrated: true,
        pet: {
          message: "Financial Passport data successfully migrated to BIMB Mobile app! 🎓",
          animation: "excited"
        }
      })),
      moveFundsToAwfarNest: (amount) => {
        const state = get();
        if (state.user.currentBalance < amount) {
          throw new Error("Insufficient balance in your wallet.");
        }
        
        let nest = state.savingsPockets.find(p => p.name === "Be U Awfar Nest");
        let nextPockets = [...state.savingsPockets];

        if (!nest) {
          nest = {
            id: `awfar-${Date.now()}`,
            name: "Be U Awfar Nest",
            target: 1000,
            current: amount,
            icon: "Nest",
            mode: "growth",
            riskLevel: "low",
            isMainGoal: false
          };
          nextPockets.push(nest);
        } else {
          nextPockets = state.savingsPockets.map(p => 
            p.id === nest.id ? { ...p, current: p.current + amount } : p
          );
        }

        const ticketsEarned = Math.floor(amount / 10);

        set((s) => ({
          user: { ...s.user, currentBalance: s.user.currentBalance - amount },
          savingsPockets: nextPockets,
          awfarDrawTickets: s.awfarDrawTickets + ticketsEarned,
          pet: {
            message: `Locked RM ${amount.toFixed(2)} into Be U Awfar Nest! Unlocked ${ticketsEarned} tickets for the RM15 Million Draw! 🎟️`,
            animation: "excited"
          }
        }));

        get().updateNextGenScore();
      },
      simulateNextDay: () => {
        const state = get();
        const todayStr = new Date().toDateString();
        
        const todaySavings = state.transactions
          .filter(t => t.type === 'saving' && new Date(t.date).toDateString() === todayStr)
          .reduce((sum, t) => sum + t.amount, 0);
          
        let streakUpdated = state.currentStreak;
        let shieldActive = state.streakShieldActive;
        let petAnimation = 'idle';
        let petMessage = '';

        if (todaySavings >= 1.0) {
          streakUpdated += 1;
          petAnimation = 'excited';
          petMessage = `Awesome! You successfully saved RM ${todaySavings.toFixed(2)} today (met the RM 1.00 daily quota). Your saving streak is now ${streakUpdated} days! 🔥`;
        } else {
          if (shieldActive) {
            shieldActive = false;
            petAnimation = 'think';
            petMessage = `You saved only RM ${todaySavings.toFixed(2)} today (missed the RM 1.00 quota), but your Streak Shield protected your streak of ${streakUpdated} days! 🛡️`;
          } else {
            streakUpdated = 0;
            petAnimation = 'sad';
            petMessage = `Oh no! You saved only RM ${todaySavings.toFixed(2)} today, missing the RM 1.00 daily quota. Your streak has reset to 0. 😿`;
          }
        }

        const highest = Math.max(state.highestStreak, streakUpdated);
        
        let tier: 'Bronze' | 'Silver' | 'Gold' = 'Bronze';
        if (streakUpdated >= 30) {
          tier = 'Gold';
        } else if (streakUpdated >= 7) {
          tier = 'Silver';
        }

        if (tier !== state.membershipTier) {
          if (tier === 'Silver') {
            petMessage += ` Graduation! You've unlocked Silver Saver Tier. Access Be U Awfar Nest and merchant perks! 🥈`;
            petAnimation = 'happy';
          } else if (tier === 'Gold') {
            petMessage += ` Spectacular! You've reached Gold Guardian Tier. Boosted returns and MaxCash active! 🥇`;
            petAnimation = 'excited';
          } else if (tier === 'Bronze') {
            petMessage += ` You are back to Bronze Budgeter Tier. Keep saving to unlock rewards!`;
          }
        }

        const shiftedTransactions = state.transactions.map(t => ({
          ...t,
          date: new Date(new Date(t.date).getTime() - 24 * 60 * 60 * 1000).toISOString()
        }));

        set((s) => ({
          currentStreak: streakUpdated,
          highestStreak: highest,
          streakShieldActive: shieldActive,
          membershipTier: tier,
          transactions: shiftedTransactions,
          lastCalculatedDate: '',
          lastQuotaUpdateDate: '',
          pet: {
            message: petMessage,
            animation: petAnimation
          }
        }));

        get().updateNextGenScore();
        get().checkAndRefreshDailyQuota();
      },
      updateNextGenScore: () => {
        set((state) => {
          // 1. Cashflow Safety (50% Weight)
          // Compare Actual Daily Spending vs. Safe Daily Spend Quota. If Actual > Safe, the score drops.
          const todayStr = new Date().toDateString();
          const todayExpenses = state.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
            .reduce((sum, t) => sum + t.amount, 0);

          const safeQuota = state.initialSafeDaily || 15.0;
          const cashflowScore = todayExpenses <= safeQuota 
            ? 100 
            : Math.max(0, 100 - ((todayExpenses - safeQuota) / safeQuota) * 100);

          // 2. Savings Progress (20% Weight)
          // Current Saved Amount vs. Total Goal Target
          const currentSaved = state.savingsPockets.reduce((sum, p) => sum + p.current, 0) + (state.user.currentEmergencyFund || 0);
          const targetSaved = state.savingsPockets.reduce((sum, p) => sum + p.target, 0) + (state.user.emergencyFundGoal || 500);
          const savingsScore = targetSaved > 0 ? Math.min(100, (currentSaved / targetSaved) * 100) : 50;

          // 3. Debt Health (30% Weight)
          // Simple Formula: (1 - (total commitment / total balance)) * 100
          // Note: total balance includes both current wallet balance and current Savings Hub to protect score when saving!
          const commitments = state.user.totalCommitments || 0;
          const totalBalance = (state.user.currentBalance || 800) + currentSaved;
          const debtScore = totalBalance > 0 
            ? Math.max(0, Math.min(100, (1 - (commitments / totalBalance)) * 100)) 
            : 100;

          // Total NextGen Score weighted calculation
          const finalScore = Math.round((0.5 * cashflowScore) + (0.3 * debtScore) + (0.2 * savingsScore));
          
          return {
            nextGenScore: finalScore,
            nextGenCashflowScore: Math.round(cashflowScore),
            nextGenSavingsScore: Math.round(savingsScore),
            nextGenDebtScore: Math.round(debtScore)
          };
        });
      },
      setLanguage: (lang) => set({ language: lang }),

      // Bills Actions
      addBill: (b) => {
        set((state) => {
          const nextBills = [...state.bills, b];
          const totalCommitments = nextBills.reduce((sum, bill) => sum + bill.amount, 0);
          return { 
            bills: nextBills,
            user: { ...state.user, totalCommitments }
          };
        });
        get().updateNextGenScore();
      },
      updateBill: (id, updates) => {
        set((state) => {
          const nextBills = state.bills.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b);
          const totalCommitments = nextBills.reduce((sum, bill) => sum + bill.amount, 0);
          return { 
            bills: nextBills,
            user: { ...state.user, totalCommitments }
          };
        });
        get().updateNextGenScore();
      },
      deleteBill: (id) => {
        set((state) => {
          const nextBills = state.bills.filter(b => b.id !== id);
          const totalCommitments = nextBills.reduce((sum, bill) => sum + bill.amount, 0);
          return { 
            bills: nextBills,
            user: { ...state.user, totalCommitments }
          };
        });
        get().updateNextGenScore();
      },
      toggleBillLock: (id) => {
        set((state) => ({
          bills: state.bills.map(b => b.id === id ? { ...b, isLocked: !b.isLocked } : b)
        }));
        get().updateNextGenScore();
      },
      toggleBillAutopay: (id) => {
        set((state) => ({
          bills: state.bills.map(b => b.id === id ? { ...b, autopayEnabled: !b.autopayEnabled } : b)
        }));
        get().updateNextGenScore();
      },
      payBillNow: (id) => {
        const state = get();
        const bill = state.bills.find(b => b.id === id);
        if (!bill) return;

        const transactionId = Math.random().toString(36).substring(7);
        const paymentRecord: BillPaymentRecord = {
          id: Math.random().toString(36).substring(7),
          billId: id,
          amount: bill.amount,
          paidAt: new Date().toISOString(),
          method: 'manual',
          status: 'paid',
          transactionId
        };

        state.addTransaction({
          id: transactionId,
          title: `Bill: ${bill.name}`,
          amount: bill.amount,
          category: bill.category,
          date: new Date().toISOString(),
          type: 'expense'
        });

        set((state) => ({
          bills: state.bills.map(b => b.id === id ? {
            ...b,
            status: 'paid',
            lastPaidAt: paymentRecord.paidAt,
            nextDueDate: calculateNextDueDate(b.nextDueDate, b.frequency),
            paymentHistory: [paymentRecord, ...(b.paymentHistory || [])]
          } : b),
          pet: { 
            message: `Bill for ${bill.name} paid! Great job.`,
            animation: "happy"
          }
        }));
      },
      processAutoPay: () => {
        const state = get();
        const today = new Date();
        const nextAllowance = new Date(state.user.nextAllowanceDate);
        const daysUntilNextAllowance = Math.max(1, Math.ceil((nextAllowance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Calculate current locked amount for spendable balance logic
        const lockedAmount = state.bills
          .filter(b => b.isLocked && b.status !== 'paid')
          .reduce((sum, b) => sum + b.amount, 0);
        const spendableBalance = state.user.currentBalance - lockedAmount;

        state.bills.forEach(bill => {
          if (bill.autopayEnabled && bill.status !== 'paid' && isBillDue(bill.nextDueDate)) {
            // Check if setup is complete
            if (!bill.accountNumber && !bill.referenceNumber) {
              state.updateBill(bill.id, { status: 'needs_setup' });
              return;
            }

            const safety = isAutoPaySafe(bill, state.user.currentBalance, spendableBalance, daysUntilNextAllowance);
            
            if (safety.safe) {
              const transactionId = Math.random().toString(36).substring(7);
              const paymentRecord: BillPaymentRecord = {
                id: Math.random().toString(36).substring(7),
                billId: bill.id,
                amount: bill.amount,
                paidAt: new Date().toISOString(),
                method: 'autopay',
                status: 'paid',
                transactionId
              };

              state.addTransaction({
                id: transactionId,
                title: `AutoPay: ${bill.name}`,
                amount: bill.amount,
                category: bill.category,
                date: new Date().toISOString(),
                type: 'expense'
              });

              set((s) => ({
                bills: s.bills.map(b => b.id === bill.id ? {
                  ...b,
                  status: 'paid',
                  lastPaidAt: paymentRecord.paidAt,
                  nextDueDate: calculateNextDueDate(b.nextDueDate, b.frequency),
                  paymentHistory: [paymentRecord, ...(b.paymentHistory || [])]
                } : b),
                pet: { 
                  message: `AutoPay: ${bill.name} RM${bill.amount} paid successfully!`,
                  animation: "excited"
                }
              }));
            } else {
              state.updateBill(bill.id, { status: 'paused' });
              set({ 
                pet: { 
                  message: `AutoPay paused for ${bill.name}: ${safety.reason}`,
                  animation: "sad"
                } 
              });
            }
          }
        });
      },
      updatePetOffset: (animation, offset) => {
        set((state) => ({
          petOffsets: {
            ...state.petOffsets,
            [animation]: { ...state.petOffsets[animation], ...offset }
          }
        }));
      }
    }),
    {
      name: 'beu-nextgen-store',
    }
  )
);

interface UseStoreHook {
  (): NextGenState;
  <T>(selector: (state: NextGenState) => T): T;
  getState: typeof useStoreBase.getState;
  setState: typeof useStoreBase.setState;
  subscribe: typeof useStoreBase.subscribe;
}

// Safe Hydration Selector Hook wrapper with static Zustand bindings
export const useStore = (() => {
  const hook = <T>(selector?: (state: NextGenState) => T): T | NextGenState => {
    const storeState = useStoreBase();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setHydrated(true);
    }, []);

    const actions = {
      addTransaction: storeState.addTransaction,
      addSavingsPocket: storeState.addSavingsPocket,
      updateSavingsPocket: storeState.updateSavingsPocket,
      deleteSavingsPocket: storeState.deleteSavingsPocket,
      addFundsToPocket: storeState.addFundsToPocket,
      toggleSpendGuard: storeState.toggleSpendGuard,
      toggleSurvivalMode: storeState.toggleSurvivalMode,
      toggleAutoSave: storeState.toggleAutoSave,
      toggleRoundUp: storeState.toggleRoundUp,
      setAutoSaveTargetIds: storeState.setAutoSaveTargetIds,
      processAutoSave: storeState.processAutoSave,
      processRoundUp: storeState.processRoundUp,
      simulateGrowth: storeState.simulateGrowth,
      updateNextGenScore: storeState.updateNextGenScore,
      setLanguage: storeState.setLanguage,
      addBill: storeState.addBill,
      updateBill: storeState.updateBill,
      deleteBill: storeState.deleteBill,
      toggleBillLock: storeState.toggleBillLock,
      toggleBillAutopay: storeState.toggleBillAutopay,
      payBillNow: storeState.payBillNow,
      processAutoPay: storeState.processAutoPay,
      updatePetOffset: storeState.updatePetOffset,
      calculateDailyLimitForBalance: storeState.calculateDailyLimitForBalance,
      incrementStreak: storeState.incrementStreak,
      resetStreak: storeState.resetStreak,
      activateStreakShield: storeState.activateStreakShield,
      triggerBimbMigration: storeState.triggerBimbMigration,
      moveFundsToAwfarNest: storeState.moveFundsToAwfarNest,
      simulateNextDay: storeState.simulateNextDay,
    };

    const stateToUse = hydrated
      ? storeState
      : { ...initialStoreState, ...actions };

    // Apply selector if provided, otherwise cast whole state
    return selector ? selector(stateToUse as NextGenState) : (stateToUse as NextGenState);
  };

  hook.getState = useStoreBase.getState;
  hook.setState = useStoreBase.setState;
  hook.subscribe = useStoreBase.subscribe;

  return hook as unknown as UseStoreHook;
})();
