"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, Brain, Target, TrendingUp, Send, ChevronLeft, ChevronRight, ExternalLink, ShoppingBag, Store, Globe, Flame, Sparkles, Gift } from "lucide-react"
import { RewardsModal } from "./RewardsModal"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { Pet } from "@/components/ui/Pet"
import Link from "next/link"

const AGENTS = [
  { id: 'save', name: 'Savings Sentinel', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'debt', name: 'Commitment Shield', icon: Shield, color: 'text-pink-600', bg: 'bg-pink-600/10' },
  { id: 'invest', name: 'Growth Guru', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'finance', name: 'Finance Strategist', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

interface ChatAction {
  id: string;
  label: string;
  type: 'create_pocket' | 'postpone' | 'prioritize_emergency' | 'transfer' | 'simulate_affordability' | 'add_funds';
  payload?: any;
}

interface Message {
  role: 'user' | 'assistant';
  agent?: string;
  content: string;
  actions?: ChatAction[];
  proposal?: any; // New field for interactive card preview
  redirect?: { label: string; href: string }; // New field for post-action navigation
}

export function Coach() {
  const { user, safeDailySpend, initialSafeDaily, transactions, nextGenScore, language, addSavingsPocket, savingsPockets, bills, addTransaction, pet, currentStreak, membershipTier, streakShieldActive, awfarDrawTickets } = useStore()
  const strings = t[language]
  
  const todayStr = new Date().toDateString();
  const todaySavings = transactions
    .filter(t => t.type === 'saving' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showRewardsModal, setShowRewardsModal] = useState(false)

  // Affordability state
  const [affordItem, setAffordItem] = useState("")
  const [affordPrice, setAffordPrice] = useState("")
  const [affordResult, setAffordResult] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Savings state
  const [saveDeposit, setSaveDeposit] = useState("200")
  const [saveTarget, setSaveTarget] = useState("2500")

  // Platform selection state for Finance Strategist
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null)

  // ─── AI Function Call Handler ──────────────────────────────────────────────
  // Executes a Gemini function call response against the Zustand store
  const executeGeminiFunctionCall = (fnCall: { name: string; args: any }): { success: boolean; message: string; redirect?: { label: string; href: string }; proposal?: any } => {
    const store = useStore.getState();
    try {
      switch (fnCall.name) {
        case 'createSavingsPocket': {
          const deposit = fnCall.args.deposit || 0;
          const mode = fnCall.args.mode || 'savings';
          const riskLevel = mode === 'growth' ? 'medium' : 'low';
          addSavingsPocket({
            id: Math.random().toString(36).substring(2, 11),
            name: fnCall.args.name,
            target: fnCall.args.target,
            current: deposit,
            icon: '💰',
            mode: mode as 'savings' | 'growth',
            riskLevel: riskLevel as 'low' | 'medium',
          });
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "happy" } });
          return {
            success: true,
            message: `Done! I've created your "${fnCall.args.name}" pocket with a target of RM ${fnCall.args.target}${deposit > 0 ? ` and an initial deposit of RM ${deposit}` : ''}. Track it in the Savings tab!`,
            redirect: { label: 'Go to Savings', href: '/savings' },
            proposal: {
              type: 'create_pocket',
              name: fnCall.args.name,
              target: fnCall.args.target,
              current: deposit,
              icon: '💰',
              mode,
              riskLevel,
            }
          };
        }
        case 'addFundsToPocket': {
          const pocket = store.savingsPockets.find(p =>
            p.name.toLowerCase().includes(fnCall.args.pocketName.toLowerCase())
          );
          if (!pocket) {
            return { success: false, message: `I couldn't find a pocket named "${fnCall.args.pocketName}". Try listing your pockets first!` };
          }
          store.addFundsToPocket(pocket.id, fnCall.args.amount);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
          return {
            success: true,
            message: `Successfully deposited RM ${fnCall.args.amount.toFixed(2)} into your ${pocket.name}!`,
            redirect: { label: 'Go to Savings', href: '/savings' },
            proposal: {
              type: 'add_funds',
              pocketId: pocket.id,
              pocketName: pocket.name,
              amount: fnCall.args.amount,
              icon: pocket.icon,
            }
          };
        }
        case 'toggleSpendGuard': {
          const shouldEnable = fnCall.args.enable;
          const currentlyActive = store.isSpendGuardActive;
          if (shouldEnable !== currentlyActive) {
            store.toggleSpendGuard();
          }
          useStore.setState({ pet: { ...useStore.getState().pet, animation: shouldEnable ? "happy" : "idle" } });
          return {
            success: true,
            message: shouldEnable
              ? 'Spend Guard is now ON. Your daily spending will be capped to keep you on track.'
              : 'Spend Guard is now OFF. Stay mindful of your spending!',
          };
        }
        default:
          return { success: false, message: `Unknown function: ${fnCall.name}` };
      }
    } catch (error: any) {
      useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
      return { success: false, message: `Action blocked: ${error.message}` };
    }
  };

  // ─── Chat Logging Helper ───────────────────────────────────────────────────
  // Fire-and-forget POST to /api/chat/log (only works when DATABASE_URL is set)
  const logChat = (agentId: string, message: string, response: string, functionCalled?: string) => {
    fetch('/api/chat/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: user.name,
        agent_id: agentId,
        message,
        response,
        function_called: functionCalled || null,
      }),
    }).catch(() => { /* silently ignore logging failures */ });
  };

  // ─── Build user context for AI requests ────────────────────────────────────
  const buildAIContext = () => ({
    balance: user.currentBalance,
    safeDailySpend,
    nextGenScore,
    isSpendGuardActive: useStore.getState().isSpendGuardActive,
    savingsPockets: savingsPockets.map(p => ({ name: p.name, current: p.current, target: p.target })),
  });

  // Auto-scroll to bottom whenever messages or thinking state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Track whether the user is near the bottom of the chat
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setIsAtBottom(distFromBottom < 100)
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsAtBottom(true)
  }

  const handleAction = async (action: ChatAction) => {
    if (isExecuting) return;
    setIsExecuting(true);

    // 1. Immediately show user choice and remove buttons (except for local simulations)
    if (action.type !== 'simulate_affordability') {
      setMessages(prev => [
        ...prev.map(m => ({ ...m, actions: undefined })),
        { role: 'user', content: action.label }
      ]);
    }

    // 2. Artificial delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    let responseText = "";
    let redirect: { href: string; label: string } | undefined;
    let proposal: any = undefined;

    switch (action.type) {
      case 'create_pocket':
        try {
          const depositVal = parseFloat(saveDeposit) || 0;

          addSavingsPocket({
            id: Math.random().toString(36).substring(2, 11),
            name: action.payload.name,
            target: action.payload.target,
            current: depositVal,
            icon: action.payload.icon || '💰',
            mode: action.payload.mode || 'savings',
            riskLevel: action.payload.riskLevel
          });

          // Preserve values in history only after successful creation
          setMessages(prev => {
            const next = [...prev];
            for (let k = next.length - 1; k >= 0; k--) {
              if (next[k].proposal?.type === 'create_pocket') {
                next[k].proposal = { ...next[k].proposal, current: depositVal };
                break;
              }
            }
            return next;
          });

          responseText = `Success! I've initialized your ${action.payload.name} with RM ${depositVal}. You can track your progress in the Savings tab.`;
          redirect = { label: "Go to Savings", href: "/savings" };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "happy" } });
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'add_funds':
        try {
          const oldState = useStore.getState();
          const todayStr = new Date().toDateString();
          const todayExpenses = oldState.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
            .reduce((sum, t) => sum + t.amount, 0);

          const oldBalance = oldState.user.currentBalance;
          const oldQuota = oldState.initialSafeDaily - todayExpenses;
          const oldSafeDaily = oldState.safeDailySpend;

          useStore.getState().addFundsToPocket(action.payload.pocketId, action.payload.amount);
          
          const newState = useStore.getState();
          // Force calculation of new safe daily average since addFundsToPocket doesn't update it immediately
          const newSafeDaily = newState.calculateDailyLimitForBalance(newState.user.currentBalance);
          const newQuota = newState.initialSafeDaily - todayExpenses; // For today, quota stays based on initial, but safeDaily average changes

          responseText = `Successfully deposited RM ${action.payload.amount.toFixed(2)} into your pocket!`;
          
          proposal = {
            type: 'deposit_summary',
            amount: action.payload.amount,
            before: { balance: oldBalance, quota: oldQuota, safeDaily: oldSafeDaily },
            after: { balance: newState.user.currentBalance, quota: newQuota, safeDaily: newSafeDaily }
          };

          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
          redirect = { label: "Go to Savings", href: "/savings" };
          
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              agent: 'Savings Sentinel',
              content: responseText,
              proposal: proposal,
              redirect: redirect
            }
          ]);
          setIsExecuting(true);
          
          setTimeout(() => {
            const pocket = useStore.getState().savingsPockets.find(p => p.id === action.payload.pocketId);
            if (!pocket) {
              setIsExecuting(false);
              return;
            }
            
            const remaining = pocket.target - pocket.current;
            if (remaining <= 0) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                agent: 'Finance Strategist',
                content: `Incredible! You've successfully hit your ${pocket.name} target of RM ${pocket.target.toFixed(2)}. Your discipline is paying off!`,
              }]);
              setIsExecuting(false);
              return;
            }
            
            // Assume hitting the goal in 90 days
            const daily = remaining / 90;
            const weekly = remaining / 12;
            const monthly = remaining / 3;
            const date = new Date();
            date.setDate(date.getDate() + 90);
            
            setMessages(prev => [...prev, {
              role: 'assistant',
              agent: 'Finance Strategist',
              content: `Great job securing your savings! To reach your ${pocket.name} goal faster, I've calculated a structured plan. If you stay consistent, you'll hit your target by ${date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
              proposal: {
                type: 'strategist_goal_planner',
                daily: daily,
                weekly: weekly,
                monthly: monthly,
                targetDate: date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
                pocketName: pocket.name,
                remaining: remaining
              }
            }]);
            setIsExecuting(false);
          }, 2000);
          
          return;
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'postpone':
        responseText = "Understood. I've moved this suggestion to the backlog. We'll revisit this when your cashflow improves.";
        break;
      case 'prioritize_emergency':
        responseText = "Smart move. Prioritizing your Emergency Fund will significantly boost your NextGen Score. Let's manage it in your Savings Hub.";
        redirect = { label: "Go to Savings", href: "/savings" };
        break;
      case 'transfer':
        try {
          const oldState = useStore.getState();
          const parsedAmount = parseFloat(action.payload.amount) || 0;
          const nextSafeDaily = oldState.calculateDailyLimitForBalance(oldState.user.currentBalance - parsedAmount);

          if (nextSafeDaily < 10.0) {
            throw new Error(`Money Move blocked. Sending RM ${parsedAmount.toFixed(2)} would reduce your safe daily spending to RM ${nextSafeDaily.toFixed(2)}/day, which is below the RM 10.00 survival limit.`);
          }

          addTransaction({
            id: `txn-${Date.now()}`,
            title: `Money Move to ${action.payload.recipient}`,
            amount: parsedAmount,
            category: 'Money Move',
            date: new Date().toISOString(),
            type: 'expense',
            confidence: 1.0
          });
          responseText = `Money Move complete. RM ${parsedAmount.toFixed(2)} has been successfully sent to ${action.payload.recipient}. The transaction is now logged in your history.`;
          redirect = { label: "View Transactions", href: "/transactions" };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'simulate_affordability':
        const item = affordItem || "this item";
        const priceVal = affordPrice;

        // Push user message and preserve values in the previous assistant message
        setMessages(prev => {
          const next = [...prev];
          for (let k = next.length - 1; k >= 0; k--) {
            if (next[k].proposal?.type === 'affordability') {
              next[k].proposal = { ...next[k].proposal, item, price: priceVal };
              break;
            }
          }
          return [
            ...next.map(m => ({ ...m, actions: undefined })),
            { role: 'user', content: `Checking if I can afford ${item} for RM ${priceVal}` }
          ];
        });

        // 2. Perform Analysis
        await new Promise(resolve => setTimeout(resolve, 1500));

        const p = parseFloat(priceVal);
        const impact = p / 14;
        const newDailySpend = safeDailySpend - impact;
        let recommendation = "Safe";
        if (newDailySpend < 5) recommendation = "Avoid";
        else if (newDailySpend < 12) recommendation = "Caution";

        const budgetLimit = user.currentBalance * 0.3; // 30% rule
        const isRisky = recommendation === "Avoid" || recommendation === "Caution";

        // Build meaningful advice per recommendation level
        let adviceSummary = "";
        if (recommendation === "Avoid") {
          adviceSummary = `At RM ${p.toLocaleString()}, this purchase is ${Math.round(p / user.currentBalance * 100)}% of your total balance — well above the safe 30% threshold of RM ${budgetLimit.toFixed(0)}. This could push you into debt or force you to rely on Buy Now Pay Later.`;
        } else if (recommendation === "Caution") {
          adviceSummary = `This is within reach, but it will tighten your daily budget to RM ${Math.max(0, newDailySpend).toFixed(2)}. Consider saving up for a few weeks first.`;
        } else {
          adviceSummary = `Great news — this fits comfortably within your budget. Your daily spending power stays healthy at RM ${Math.max(0, newDailySpend).toFixed(2)}.`;
        }

        const analysisResult = {
          item,
          price: p,
          impact: impact.toFixed(2),
          newDailySpend: Math.max(0, newDailySpend).toFixed(2),
          recommendation,
          debtRiskImpact: (p / 20).toFixed(0),
          adviceSummary,
        };

        // Step 1: Commitment Shield posts the analysis
        const shieldReply = isRisky
          ? `I've reviewed your finances against this purchase. This exceeds your safety threshold — I'm calling in our Finance Strategist for an alternative path.`
          : `Looks good! This purchase is well within your means. Your shield remains strong:`;

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            agent: 'Commitment Shield',
            content: shieldReply,
            proposal: {
              type: 'affordability_result',
              ...analysisResult
            }
          }
        ]);

        // Step 2: If risky, Finance Strategist enters with alternative recommendation
        if (isRisky) {
          // Show thinking state briefly
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Build multi-platform alternatives
          let alternatives: any[] = [];
          if (item.toLowerCase().includes("iphone")) {
            alternatives = [
              {
                platform: "Shopee",
                name: "iPhone 11/16 Series (Pre-owned)",
                price: 899,
                condition: "Trusted Seller · 4.8★",
                color: "orange",
                image: `${basePath}/assets/dump/sp.png`,
                link: "https://shopee.com.my/11-16-Series-Device-Uknown-No-Face-id-(Promotions)-i.20670985.25040145074?extraParams=%7B%22display_model_id%22%3A410819009557%2C%22model_selection_logic%22%3A3%7D&sp_atk=c4356b81-18ef-4dac-8318-1ca783edce3d&xptdk=c4356b81-18ef-4dac-8318-1ca783edce3d",
              },
              {
                platform: "Lazada",
                name: "iPhone X (Refurbished)",
                price: 750,
                condition: "Refurbished · Free Shipping",
                color: "blue",
                image: `${basePath}/assets/dump/lz.png`,
                link: "https://www.lazada.com.my/products/pdp-i4776774349-s26934084186.html",
              },
              {
                platform: "FB Marketplace",
                name: "iPhone (Local Pickup)",
                price: 650,
                condition: "Used · Negotiable · KL Area",
                color: "indigo",
                image: `${basePath}/assets/dump/fb.png`,
                link: "https://www.facebook.com/share/1M1WuuUcWj/",
              },
            ];
          }

          const strategistMessage = alternatives.length > 0
            ? `I've reviewed the Commitment Shield's audit. I've sourced ${alternatives.length} alternatives that stay within your safe 30% spending limit of RM ${budgetLimit.toFixed(0)}:`
            : `I've reviewed the Commitment Shield's audit. I'd recommend holding off on this purchase and building a dedicated savings pocket first. Come back when you've saved at least 30% of the target price.`;

          setSelectedPlatform(null);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              agent: 'Finance Strategist',
              content: strategistMessage,
              proposal: alternatives.length > 0 ? {
                type: 'strategist_alternative',
                alternatives,
                budgetLimit: budgetLimit.toFixed(0),
              } : undefined
            }
          ]);
        }

        // Reset local inputs for next time
        setAffordItem("");
        setAffordPrice("");
        setIsExecuting(false);
        return;
    }

    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        agent: action.type === 'transfer' ? 'Finance Strategist' : 'Savings Sentinel',
        content: responseText,
        redirect: redirect,
        proposal: proposal
      }
    ]);

    setIsExecuting(false);
  }

  const sendMessage = (overrideText?: string) => {
    const textToSubmit = (overrideText || input).toLowerCase();
    if (!textToSubmit.trim() || isThinking) return

    const triggerFinance = textToSubmit.includes("spend") || textToSubmit.includes("safe") || textToSubmit.includes("limit") || textToSubmit.includes("daily") || textToSubmit.includes("budget") || textToSubmit.includes("money") || textToSubmit.includes("impulse")
    const triggerGrowth = textToSubmit.includes("invest") || textToSubmit.includes("stock") || textToSubmit.includes("crypto") || textToSubmit.includes("gold") || textToSubmit.includes("growth") || textToSubmit.includes("opportunity") || textToSubmit.includes("market")
    const isListingPockets = textToSubmit.includes("show") || textToSubmit.includes("list") || textToSubmit.includes("what") || textToSubmit.includes("pockets") || textToSubmit.includes("my goals")
    
    // Add Funds Parsing
    let isAddFundsTriggered = false;
    let addFundsAmount = 0;
    let targetPocket: any = null;
    const addFundsMatch = textToSubmit.match(/(?:add|deposit|save|put)\s+(?:rm\s*)?(\d+(\.\d+)?)\s+(?:to|in|into)\s+(my\s+)?(.+)/i);
    if (addFundsMatch) {
      const amountStr = addFundsMatch[1];
      const pocketStr = addFundsMatch[4].toLowerCase().replace("fund", "").replace("pocket", "").trim();
      addFundsAmount = parseFloat(amountStr);
      targetPocket = useStore.getState().savingsPockets.find(p => p.name.toLowerCase().includes(pocketStr));
      if (targetPocket && addFundsAmount > 0) {
         isAddFundsTriggered = true;
      }
    }

    const triggerSave = textToSubmit.includes("save") || textToSubmit.includes("goal") || textToSubmit.includes("fund") || textToSubmit.includes("laptop") || textToSubmit.includes("emergency") || isListingPockets || isAddFundsTriggered
    const triggerDebt = textToSubmit.includes("debt") || textToSubmit.includes("bnpl") || textToSubmit.includes("loan") || textToSubmit.includes("risk") || textToSubmit.includes("credit") || textToSubmit.includes("afford") || textToSubmit.includes("buy")
    const triggerBills = textToSubmit.includes("bill") || /\brent\b/.test(textToSubmit) || textToSubmit.includes("autopay") || textToSubmit.includes("commitment") || /\block\b/.test(textToSubmit) || textToSubmit.includes("protected")
    const triggerTransfer = textToSubmit.includes("money move") || textToSubmit.includes("transfer") || textToSubmit.includes("send") || (textToSubmit.includes("pay") && textToSubmit.includes("to"))

    // Reset & Replace: If a new request comes in, clean out any unsubmitted tasks of the same type
    let baseMessages: Message[] = [...messages]
    
    // Determine the type of task being triggered to clean up previous versions
    const taskType = triggerDebt ? 'affordability' : 
                     triggerSave ? 'create_pocket' : 
                     triggerTransfer ? 'transfer' : null;

    if (taskType) {
      const unsubmittedIndices = new Set<number>()
      baseMessages.forEach((msg, idx) => {
        // If it's the same task type and still has actions (meaning it's not completed)
        // Or if it's an affordability card without an item name yet
        if (msg.proposal?.type === taskType && (msg.actions || !msg.proposal?.item)) {
          unsubmittedIndices.add(idx)
          // Also remove the preceding user message that triggered it
          if (idx > 0 && baseMessages[idx - 1].role === 'user') {
            unsubmittedIndices.add(idx - 1)
          }
        }
      })
      baseMessages = baseMessages.filter((_, idx) => !unsubmittedIndices.has(idx))
    }

    const newMessages: Message[] = [...baseMessages, { role: 'user', content: overrideText || input }]
    setMessages(newMessages)
    if (!overrideText) setInput("")
    setIsThinking(true)
    useStore.setState({ pet: { ...useStore.getState().pet, animation: "think" } })

    // Council dispatch logic
    setTimeout(async () => {
      const responses: Message[] = []
      if (triggerTransfer) {
        responses.push({
          role: 'assistant',
          agent: 'Finance Strategist',
          content: "I can help with that. I've prepared a Money Move proposal based on your recent activity. Review the details below:",
          proposal: {
            name: 'Money Move to Aizat',
            type: 'transfer',
            amount: 50,
            recipient: 'Aizat',
            bank: 'Public Bank',
            icon: '💸'
          },
          actions: [
            {
              id: 'approve_Money Move',
              label: 'Approve & Send',
              type: 'transfer',
              payload: { amount: 50, recipient: 'Aizat' }
            },
            {
              id: 'postpone_Money Move',
              label: 'Decline',
              type: 'postpone'
            }
          ]
        })
      } else if (triggerBills) {
        const lockedAmount = bills.filter(b => b.isLocked && b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
        const nextBill = bills.filter(b => b.status !== 'paid').sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

        responses.push({
          role: 'assistant',
          agent: 'Finance Strategist',
          content: `You have RM ${lockedAmount.toFixed(2)} protected for bills. ${nextBill ? `Your next bill is ${nextBill.name} due soon.` : 'No upcoming bills detected.'} Protecting your bill money early is why your spendable balance might look lower than your total balance.`
        })
      } else if (isAddFundsTriggered && targetPocket) {
        if (addFundsAmount > user.currentBalance) {
           responses.push({
             role: 'assistant',
             agent: 'Savings Sentinel',
             content: `I can't deposit RM ${addFundsAmount.toFixed(2)} into your ${targetPocket.name} because it exceeds your current balance of RM ${user.currentBalance.toFixed(2)}.`
           });
        } else {
           const todayStr = new Date().toDateString();
            const todayExpenses = transactions
              .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
              .reduce((sum, t) => sum + t.amount, 0);
           const currentQuota = initialSafeDaily - todayExpenses;

           responses.push({
             role: 'assistant',
             agent: 'Savings Sentinel',
             content: `Got it! I've prepared a quick deposit for your ${targetPocket.name}. \n\nCurrent spending balance: RM ${user.currentBalance.toFixed(2)}\nDaily quota remaining: ${currentQuota < 0 ? "-" : ""}RM ${Math.abs(currentQuota).toFixed(2)}\n\nReview the impact below before approving.`,
             proposal: {
               type: 'add_funds',
               pocketId: targetPocket.id,
               pocketName: targetPocket.name,
               amount: addFundsAmount,
               icon: targetPocket.icon
             }
           });
        }
      } else if (triggerSave) {
        // Handle listing pockets vs creating new ones
        if (isListingPockets && savingsPockets.length > 0) {
          responses.push({
            role: 'assistant',
            agent: 'Savings Sentinel',
            content: `You currently have ${savingsPockets.length} active Savings Hub. Here is your progress:\n\n*Tip: Try saying "Add RM 50 to ${savingsPockets[0]?.name || 'Goals'}" to save instantly!*`,
            proposal: {
              type: 'list_pockets'
            }
          })
        } else if (textToSubmit.includes("laptop") || user.currentBalance > 1000) {
          responses.push({
            role: 'assistant',
            agent: 'Savings Sentinel',
            content: `I've analyzed your cashflow and your goals. I've prepared a growth-mode proposal for your Laptop Fund. How much would you like to deposit as a head start?`,
            proposal: {
              type: 'create_pocket',
              name: 'Laptop Fund',
              target: 2500,
              icon: '💻',
              mode: 'growth',
              riskLevel: 'medium'
            }
          })
        } else if (user.currentBalance < 500 || nextGenScore < 60) {
          responses.push({
            role: 'assistant',
            agent: 'Savings Sentinel',
            content: `Your current liquidity is tight (RM ${user.currentBalance.toFixed(2)}). I recommend focusing on your safety net first.`,
            actions: [
              {
                id: 'prioritize_emergency',
                label: '🛡️ Prioritize Emergency Fund instead',
                type: 'prioritize_emergency'
              },
              {
                id: 'postpone',
                label: '🕒 Remind me later',
                type: 'postpone'
              }
            ]
          })
        } else {
          // General saving fallback — with Gemini function calling support
          let agentId = 'save';
          let agentName = 'Savings Sentinel';
          try {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: overrideText || input, agentId, context: buildAIContext() })
            });
            const data = await res.json();

            // Handle Gemini function call responses
            if (data.functionCall) {
              const result = executeGeminiFunctionCall(data.functionCall);
              const replyText = data.reply
                ? `${data.reply}\n\n${result.message}`
                : result.message;
              responses.push({
                role: 'assistant',
                agent: agentName,
                content: replyText,
                redirect: result.redirect,
                proposal: result.proposal,
              });
              logChat(agentId, overrideText || input, replyText, data.functionCall.name);
            } else if (!data.fallback && data.reply) {
              responses.push({
                role: 'assistant',
                agent: agentName,
                content: data.reply,
              });
              logChat(agentId, overrideText || input, data.reply);
            } else {
              // Fallback when no API key or API error
              responses.push({
                role: 'assistant',
                agent: agentName,
                content: "I'm having trouble analyzing your savings goals right now. Let's try again in a bit."
              });
            }
          } catch (err) {
            responses.push({
              role: 'assistant',
              agent: agentName,
              content: `Analyzing your goals... I see you're saving for a Laptop. If you maintain your current pace, you'll reach your RM 2,500 target in approximately 4 months.`
            });
          }
        }
      } else if (triggerDebt || textToSubmit.includes("afford") || textToSubmit.includes("buy")) {
        responses.push({
          role: 'assistant',
          agent: 'Commitment Shield',
          content: "I can help you simulate the impact of a purchase on your financial health. What are you planning to buy?",
          proposal: {
            type: 'affordability'
          }
        })
      } else if (triggerGrowth) {
        let agentId = 'invest';
        let agentName = 'Growth Guru';
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: overrideText || input, agentId, context: buildAIContext() })
          });
          const data = await res.json();
          if (!data.fallback && data.reply) {
            responses.push({
              role: 'assistant',
              agent: agentName,
              content: data.reply,
            });
            logChat(agentId, overrideText || input, data.reply);
          } else {
            responses.push({
              role: 'assistant',
              agent: agentName,
              content: "I'm having trouble analyzing your investments right now. Let's try again in a bit."
            });
          }
        } catch (err) {
          responses.push({
            role: 'assistant',
            agent: agentName,
            content: `The best growth opportunity right now is your ASB or high-yield savings account. Market volatility in crypto makes it a high-risk move for your NextGen Score.`
          });
        }
      } else {
        let agentId = 'finance';
        let agentName = 'Finance Strategist';
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: overrideText || input, agentId, context: buildAIContext() })
          });
          const data = await res.json();

          // Handle Gemini function call responses (Finance Strategist also has tool access)
          if (data.functionCall) {
            const result = executeGeminiFunctionCall(data.functionCall);
            const replyText = data.reply
              ? `${data.reply}\n\n${result.message}`
              : result.message;
            responses.push({
              role: 'assistant',
              agent: agentName,
              content: replyText,
              redirect: result.redirect,
              proposal: result.proposal,
            });
            logChat(agentId, overrideText || input, replyText, data.functionCall.name);
          } else if (!data.fallback && data.reply) {
            responses.push({
              role: 'assistant',
              agent: agentName,
              content: data.reply,
            });
            logChat(agentId, overrideText || input, data.reply);
          } else {
            responses.push({
              role: 'assistant',
              agent: agentName,
              content: `Based on your current balance of RM ${user.currentBalance.toFixed(2)}, your absolute safe limit for today is RM ${safeDailySpend.toFixed(2)}.`
            });
          }
        } catch (err) {
          responses.push({
            role: 'assistant',
            agent: agentName,
            content: `Based on your current balance of RM ${user.currentBalance.toFixed(2)}, your absolute safe limit for today is RM ${safeDailySpend.toFixed(2)}. This ensures you stay on track for your upcoming bills.`
          });
        }
      }
      setMessages(prev => [...prev, ...responses]);
      setIsThinking(false);
      
      // Set appropriate animation based on response
      let nextAnim = "idle";
      if (responses.some(r => r.agent === 'Commitment Shield')) nextAnim = "blink";
      if (responses.some(r => r.agent === 'Savings Sentinel')) nextAnim = "happy";
      if (responses.some(r => r.agent === 'Growth Guru')) nextAnim = "excited";
      if (responses.some(r => r.agent === 'Finance Strategist')) nextAnim = "think";
      
      useStore.setState({ pet: { ...useStore.getState().pet, animation: nextAnim } });
    }, 1500)
  }

  const starterPrompts = [
    { text: strings.coachChipSafe, icon: Brain, color: "text-amber-500" },
    { text: strings.coachChipSave, icon: Target, color: "text-emerald-500" },
    { text: strings.coachChipLimit, icon: Shield, color: "text-pink-600" },
    { text: "Should I invest in crypto?", icon: TrendingUp, color: "text-blue-500" },
    { text: "Pay RM 50 to Aizat", icon: Send, color: "text-primary" }
  ]

  return (
    <div className="fixed inset-0 flex flex-col max-w-lg mx-auto overflow-hidden bg-[#FFE9F2] text-[#221F20] z-50 [color-scheme:light]">
      <img
        src={`${basePath}/assets/bot.gif`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-18 mix-blend-soft-light pointer-events-none"
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,rgba(223,0,89,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.90),rgba(255,233,242,0.86))]" />
      {/* Top Header */}
      <header className="p-4 bg-white/88 backdrop-blur-xl border-b border-pink-100 shadow-sm shadow-pink-100/40 z-20 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F8F8F8] hover:bg-[#FFE9F2] border border-pink-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#727272]" />
            </Link>
            <div className="w-10 h-10 flex items-center justify-center">
              <Pet animation={(pet.animation as any) || (isThinking ? "think" : "idle")} size={40} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-[#221F20]">{strings.coachHeader}</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-[#727272] uppercase tracking-widest font-bold">Active</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold px-2 py-1">
            HEALTH: {nextGenScore}%
          </Badge>
        </div>
      </header>

      {/* Chat Area — wrapped in relative for the floating button */}
      <div className="flex-1 overflow-hidden relative z-10">
        {/* Scroll-to-bottom floating button */}
        <AnimatePresence>
          {!isAtBottom && (
            <motion.button
              key="scroll-btn"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 border border-pink-100 backdrop-blur-md flex items-center justify-center shadow-lg shadow-pink-100/60 hover:bg-white active:scale-95 transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronLeft className="w-4 h-4 text-primary rotate-[-90deg]" />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 scroll-smooth bg-transparent"
        >
          <div className="space-y-6 py-6 min-h-full flex flex-col">

          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col justify-start h-full pt-2"
              >
                <div className="mb-8">
                  {/* Dynamic Streak, Tier, and Rewards Pills */}
                  <div className="flex items-center justify-between gap-2 mb-6 w-full">
                    {/* Streak Pill */}
                    <div className={cn(
                      "flex-1 px-2.5 py-1.5 rounded-full border text-center flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold transition-all duration-300 whitespace-nowrap backdrop-blur-md shadow-sm",
                      todaySavings < 1.0 ? "bg-slate-100/80 border-slate-200 text-slate-400 grayscale opacity-70" :
                      currentStreak < 7 ? "bg-gradient-to-r from-[#FFFAEA]/80 to-[#FFE9F2]/60 border-[#FFF4D5] text-[#CBA024]" :
                      currentStreak < 30 ? "bg-gradient-to-r from-[#E9F2FE]/80 to-[#FFE9F2]/60 border-[#D3E4FE] text-[#1C62C7]" :
                      "bg-gradient-to-r from-[#FAE7EF]/80 to-[#FFE9F2]/60 border-[#F3C7D8] text-[#CC0D5A]"
                    )}>
                      <span>🔥 {currentStreak} {language === 'en' ? 'Day Streak' : 'Hari Streak'}</span>
                    </div>

                    {/* Tier Pill */}
                    <div className={cn(
                      "flex-1 px-2.5 py-1.5 rounded-full border text-center flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold transition-all duration-300 whitespace-nowrap backdrop-blur-md shadow-sm",
                      membershipTier === 'Gold' ? "bg-gradient-to-r from-[#FAE7EF]/80 to-[#FFE9F2]/60 border-[#F3C7D8] text-[#DF0059]" :
                      membershipTier === 'Silver' ? "bg-gradient-to-r from-[#E9F2FE]/80 to-[#FFE9F2]/60 border-[#D3E4FE] text-[#1C62C7]" :
                      "bg-gradient-to-r from-[#FFFAEA]/80 to-[#FFE9F2]/60 border-[#FFF4D5] text-[#CBA024]"
                    )}>
                      <span>
                        {membershipTier === 'Gold' ? '🏆 Legend' :
                         membershipTier === 'Silver' ? '🥈 Pro' :
                         '🥉 Novice'}
                      </span>
                    </div>

                    {/* Rewards & Perks Interactive Pill */}
                    <button 
                      onClick={() => setShowRewardsModal(true)}
                      className="flex-1 px-2.5 py-1.5 rounded-full border bg-gradient-to-r from-[#DF0059]/10 via-[#CC0D5A]/15 to-[#E06E9C]/10 border-[#E06E9C]/30 text-[#CC0D5A] shadow-sm flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold hover:bg-gradient-to-r hover:from-[#DF0059]/20 hover:to-[#CC0D5A]/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap backdrop-blur-md"
                    >
                      <Sparkles className="w-3 h-3 text-[#DF0059] animate-pulse" />
                      <span>{language === 'en' ? 'Rewards & Perks ✨' : 'Ganjaran ✨'}</span>
                    </button>
                  </div>

                  <h2 className="text-xl font-medium text-[#727272] mb-1">Hi {user.name}</h2>
                  <h1 className="text-3xl font-black tracking-tight text-[#221F20]">Where should we start?</h1>
                </div>

                <div className="space-y-3">
                  {starterPrompts.map((prompt, i) => (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={prompt.text}
                      onClick={() => sendMessage(prompt.text)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/90 border border-white/80 hover:bg-white transition-all text-left group shadow-sm shadow-pink-100/50"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-[#F8F8F8] shrink-0", prompt.color)}>
                        <prompt.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-[#555555] group-hover:text-primary transition-colors">
                        {prompt.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {messages.map((m, i) => {
                  const agent = AGENTS.find(a => a.name === m.agent)
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col gap-1",
                        m.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      {m.role === 'assistant' && (
                        <span className={cn("text-[8px] font-bold uppercase tracking-widest ml-11", agent?.color)}>
                          {m.agent}
                        </span>
                      )}
                      <div className={cn(
                        "flex gap-3",
                        m.role === 'user' ? "flex-row-reverse" : ""
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                          m.role === 'assistant' ? cn(agent?.bg, "border-pink-100") : "bg-[#F8F8F8] border-pink-100 text-[#727272]"
                        )}>
                          {m.role === 'assistant' ? (
                            agent ? <agent.icon className={cn("w-4 h-4", agent.color)} /> : <Pet animation="idle" size={32} />
                          ) : (
                            <img
                              src={`${basePath}/assets/pfp/user.png`}
                              alt=""
                              aria-hidden="true"
                              className="w-full h-full rounded-full object-cover"
                            />
                          )}
                        </div>
                        <div className={cn("flex flex-col gap-3 max-w-[90%]", m.role === 'user' ? "items-end" : "items-start")}>
                          <div className={cn(
                            "p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm w-fit",
                            m.role === 'assistant' ? "bg-white/95 border border-pink-100 text-[#221F20]" : "bg-primary text-white font-medium"
                          )}>
                            {m.content}
                            {m.role === 'assistant' && (
                              <div className="mt-2.5 pt-2 border-t border-pink-100 flex justify-between items-center gap-4">
                                <span className="text-[8px] text-[#727272]">Share to get Streak Shield + RM10!</span>
                                <button
                                  onClick={() => {
                                    useStore.getState().activateStreakShield();
                                    useStore.setState((s) => ({
                                      user: { ...s.user, currentBalance: s.user.currentBalance + 10 }
                                    }));
                                    alert("Passport generated! 🛡️ Streak Shield activated & RM10 simulated referral bounty added to wallet!");
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-pink-100 text-[#CC0D5A] hover:bg-pink-200 text-[8px] font-extrabold transition-all"
                                >
                                  📢 Share Roast
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Redirect Button */}
                          {m.redirect && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Link
                                href={m.redirect.href}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                              >
                                {m.redirect.label}
                                <TrendingUp className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </motion.div>
                          )}

                          {/* Proposal Card Rendering */}
                          {m.proposal && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full max-w-[280px]"
                            >
                              {m.proposal.type === 'list_pockets' ? (
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
                              ) : m.proposal.type === 'affordability' ? (
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
                                          value={m.proposal.item || (i === messages.length - 1 ? affordItem : "")}
                                          onChange={(e) => setAffordItem(e.target.value)}
                                          disabled={isExecuting || i < messages.length - 1}
                                          className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[8px] uppercase font-bold text-muted-foreground">Price (RM)</label>
                                        <Input
                                          type="number"
                                          placeholder="0.00"
                                          value={m.proposal.price || (i === messages.length - 1 ? affordPrice : "")}
                                          onChange={(e) => setAffordPrice(e.target.value)}
                                          disabled={isExecuting || i < messages.length - 1}
                                          className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
                                        />
                                      </div>

                                      {i === messages.length - 1 && (
                                        <Button
                                          className="w-full h-8 text-[10px] bg-pink-700 hover:bg-pink-700 text-white font-bold"
                                          onClick={() => handleAction({ id: 'sim_afford', label: 'Simulate', type: 'simulate_affordability' })}
                                          disabled={!affordPrice || isExecuting}
                                        >
                                          {isExecuting ? "Simulating..." : "Simulate Impact"}
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : m.proposal.type === 'affordability_result' ? (
                                <Card className="glass-card bg-white/95 border-pink-600/20 overflow-hidden">
                                  <CardContent className="p-4 space-y-3">
                                    {/* Status Header */}
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

                                    {/* Metrics Row */}
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
                                          (m.proposal.price / user.currentBalance * 100) > 30 ? "text-rose-400" : "text-emerald-400"
                                        )}>{Math.round(m.proposal.price / user.currentBalance * 100)}%</p>
                                      </div>
                                    </div>

                                    {/* Advice */}
                                    <p className="text-[9px] text-[#555555] leading-relaxed">
                                      {m.proposal.adviceSummary}
                                    </p>

                                    {/* Handoff indicator for risky purchases */}
                                    {(m.proposal.recommendation === "Avoid" || m.proposal.recommendation === "Caution") && (
                                      <div className="pt-2 border-t border-pink-100 flex items-center gap-2">
                                        <Brain className="w-3 h-3 text-amber-500 animate-pulse" />
                                        <p className="text-[8px] text-amber-400 font-bold">Handing off to Finance Strategist...</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ) : m.proposal.type === 'strategist_alternative' ? (
                                <Card className="glass-card bg-white/95 border-amber-500/20 overflow-hidden">
                                  <CardContent className="p-4 space-y-3">
                                    {/* Strategist Header */}
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

                                    {/* Platform Accordion Stack */}
                                    <div className="space-y-2">
                                      {m.proposal.alternatives?.map((alt: any, idx: number) => {
                                        const colorMap: Record<string, { bg: string; border: string; text: string; activeBg: string; gradient: string; btnFrom: string; btnTo: string; shadow: string }> = {
                                          orange: { bg: 'bg-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400', activeBg: 'bg-orange-500/15', gradient: 'from-orange-500/10 to-transparent', btnFrom: 'from-orange-500', btnTo: 'to-orange-600', shadow: 'shadow-orange-500/20' },
                                          blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', activeBg: 'bg-blue-500/15', gradient: 'from-blue-500/10 to-transparent', btnFrom: 'from-blue-500', btnTo: 'to-blue-600', shadow: 'shadow-blue-500/20' },
                                          indigo: { bg: 'bg-[#237AF9]/5', border: 'border-[#237AF9]/20', text: 'text-indigo-400', activeBg: 'bg-[#237AF9]/15', gradient: 'from-[#237AF9]/10 to-transparent', btnFrom: 'from-[#237AF9]', btnTo: 'to-indigo-600', shadow: 'shadow-[#237AF9]/20' },
                                        };
                                        const colors = colorMap[alt.color] || colorMap.orange;
                                        const isSelected = selectedPlatform === idx;

                                        const originalPrice = messages.find(msg => msg.proposal?.type === 'affordability_result')?.proposal?.price || 1;
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
                                                    {/* Big Product Image */}
                                                    <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-pink-100 bg-[#F8F8F8]">
                                                      <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                                                    </div>

                                                    {/* Product Info Stack */}
                                                    <div className="space-y-0.5">
                                                      <p className="text-[11px] text-[#221F20] font-bold leading-tight">{alt.name}</p>
                                                      <p className="text-[9px] text-[#727272]">{alt.condition}</p>
                                                    </div>

                                                    {/* Interactive Row (Pills in one row) */}
                                                    <div className="flex items-center gap-1.5 pt-1">
                                                      <div className="px-3 py-1.5 rounded-full bg-white border border-pink-100 shrink-0">
                                                        <span className="text-[10px] font-black text-[#221F20]">RM {alt.price}</span>
                                                      </div>
                                                      <Button
                                                        onClick={() => window.open(alt.link, "_blank")}
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
                              ) : m.proposal.type === 'deposit_summary' ? (
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
                              ) : m.proposal.type === 'strategist_goal_planner' ? (
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
                                    
                                    <div className="flex justify-between items-center bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                      <div>
                                        <p className="text-[8px] text-amber-500/80 uppercase font-bold tracking-wider">Estimated Achievement Date</p>
                                        <p className="text-[11px] font-black text-amber-500">{m.proposal.targetDate}</p>
                                      </div>
                                      <TrendingUp className="w-5 h-5 text-amber-500/50" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : m.proposal.type === 'add_funds' ? (() => {
                                 const nextSafeDaily = useStore.getState().calculateDailyLimitForBalance(user.currentBalance - m.proposal.amount);
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
                                           onClick={() => handleAction({
                                             id: 'approve_add_funds',
                                             label: 'Confirm Deposit',
                                             type: 'add_funds',
                                             payload: { pocketId: m.proposal.pocketId, amount: m.proposal.amount }
                                           })}
                                           disabled={isExecuting || isRestricted || i < messages.length - 1}
                                         >
                                           {isExecuting ? "Processing..." : "Confirm Deposit"}
                                         </Button>
                                         <Button
                                           variant="outline"
                                           className="flex-1 h-8 text-[10px] border-pink-100 text-[#555555] hover:bg-pink-50"
                                           onClick={() => handleAction({ id: 'decline_save', label: 'Decline', type: 'postpone' })}
                                           disabled={isExecuting || i < messages.length - 1}
                                         >
                                           Decline
                                         </Button>
                                       </div>
                                     </CardContent>
                                   </Card>
                                 );
                               })()
                              : m.proposal.type === 'create_pocket' ? (() => {
                                const currentDeposit = i === messages.length - 1 ? parseFloat(saveDeposit) || 0 : m.proposal.current || 0;
                                const nextSafeDaily = useStore.getState().calculateDailyLimitForBalance(user.currentBalance - currentDeposit);
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
                                          {m.proposal.mode.toUpperCase()}
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                          <label className="text-[8px] uppercase font-bold text-muted-foreground">Goal Target (RM)</label>
                                          <Input
                                            type="number"
                                            value={i === messages.length - 1 ? saveTarget : m.proposal.target}
                                            onChange={(e) => setSaveTarget(e.target.value)}
                                            disabled={isExecuting || i < messages.length - 1}
                                            className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className="text-[8px] uppercase font-bold text-muted-foreground">Initial Deposit (RM)</label>
                                          <Input
                                            type="number"
                                            value={i === messages.length - 1 ? saveDeposit : m.proposal.current}
                                            onChange={(e) => setSaveDeposit(e.target.value)}
                                            disabled={isExecuting || i < messages.length - 1}
                                            className="h-10 text-sm bg-white border-pink-100 text-[#221F20] placeholder:text-[#727272] disabled:!opacity-70"
                                          />
                                        </div>
                                      </div>
                                      <p className="text-[7px] text-muted-foreground italic">Deducted from your RM {user.currentBalance.toFixed(2)} balance</p>

                                      {isRestricted && (
                                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold leading-tight space-y-1">
                                          <p>🚨 Survival Threshold Restricted</p>
                                          <p className="text-[9px] font-medium text-rose-400/80">
                                            Depositing RM {currentDeposit.toFixed(2)} would reduce your safe daily spend to RM {nextSafeDaily.toFixed(2)}/day, which is below the RM 10.00 survival limit.
                                          </p>
                                        </div>
                                      )}

                                      {i === messages.length - 1 && (
                                        <div className="flex gap-2">
                                          <Button
                                            className={cn(
                                              "flex-1 h-8 text-[10px] text-white font-bold",
                                              isRestricted 
                                                ? "bg-rose-500/20 hover:bg-rose-500/20 cursor-not-allowed text-rose-300" 
                                                : "bg-emerald-600 hover:bg-emerald-700"
                                            )}
                                            onClick={() => handleAction({
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
                                            onClick={() => handleAction({ id: 'decline_save', label: 'Decline', type: 'postpone' })}
                                            disabled={isExecuting}
                                          >
                                            Decline
                                          </Button>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                );
                              })()
                              : (
                                <Card className="glass-card bg-white/95 border-primary/20 overflow-hidden">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
                                        {m.proposal.icon || (m.proposal.type === 'transfer' ? '💸' : '🎯')}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs font-bold text-[#221F20]">{m.proposal.name || (m.proposal.type === 'transfer' ? 'Money Move' : 'Pocket')}</p>
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
                              )}
                            </motion.div>
                          )}

                          {m.actions && m.actions.length > 0 && (
                            <div className="flex gap-2 mt-1 w-full max-w-[280px]">
                              {m.actions.map((action: ChatAction) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleAction(action)}
                                  className={cn(
                                    "flex-1 text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center",
                                    (action.type === 'create_pocket' || action.type === 'transfer')
                                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                                  )}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {(isThinking || isExecuting) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20">
                        <Pet animation="think" size={32} />
                      </div>
                      <div className="p-3 rounded-2xl bg-white/95 border border-pink-100 flex gap-1 items-center shadow-sm">
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[9px] text-muted-foreground ml-2 font-medium">
                          {isExecuting ? "Executing secure transaction..." : "Council is deliberating..."}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom sentinel — auto-scroll target */}
          <div ref={bottomRef} className="h-px" />
        </div>
      </div>
      </div>

      {/* Sticky Chat Input Area — OUTSIDE the scroll container so it never disappears */}
      <div className="bg-white/88 backdrop-blur-xl border-t border-pink-100 p-4 pb-safe space-y-3 shrink-0 z-20 shadow-[0_-12px_40px_rgba(204,13,90,0.08)]">
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[strings.coachChipLimit, strings.coachChipSafe, strings.coachChipSave, "Pay RM 50 to Aizat"].map((suggestion) => (
                  <button
                    key={suggestion}
                    disabled={isThinking}
                    onClick={() => sendMessage(suggestion)}
                    className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#555555] hover:bg-primary hover:text-white transition-colors border border-pink-100 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <Input
            placeholder={isThinking || isExecuting ? "Wait for the council..." : strings.coachInputPlaceholder}
            disabled={isThinking || isExecuting}
            className="pr-12 bg-white border-pink-100 h-12 rounded-2xl text-xs text-[#221F20] placeholder:text-[#727272] shadow-sm shadow-pink-100/60 focus:border-primary focus:ring-primary/20 disabled:bg-[#F8F8F8]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button
            size="icon"
            disabled={isThinking || isExecuting || !input.trim()}
            className="absolute right-1 top-1 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
            onClick={() => sendMessage()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
      />
    </div>
  )
}
