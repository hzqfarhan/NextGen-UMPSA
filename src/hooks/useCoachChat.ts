import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Message, ChatAction } from "@/components/coach/types";
import { parseTransferIntent } from "@/lib/transferParser";
import { fetchWithRetry } from "@/lib/apiRetry";
import { analyzeSpending, detectSubscriptions } from "@/lib/spendingAnalysis";
import { analyzeBills, checkBillCoverage } from "@/lib/billIntelligence";
import { calculateSavingsVelocity } from "@/lib/savingsProjection";
import { haptic } from "@/lib/utils";

export function useCoachChat() {
  const { user, safeDailySpend, transactions, nextGenScore, addSavingsPocket, savingsPockets, bills, addTransaction } = useStore();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [undoToast, setUndoToast] = useState<{ message: string; onUndo: () => void } | null>(null);

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const hasGreetedRef = useRef(false);

  // Load persisted chat and Handle Proactive Greetings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coach_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setIsLoaded(true);
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved messages", e);
        }
      }
    }

    if (hasGreetedRef.current || messages.length > 0) {
      setIsLoaded(true);
      return;
    }
    hasGreetedRef.current = true;

    const store = useStore.getState();
    const urgentBills = analyzeBills(store.bills).filter(b => b.status === 'urgent').length;
    const isBroke = store.safeDailySpend < 5;
    
    let greetingMessage: Message | null = null;

    if (urgentBills > 0) {
      greetingMessage = {
        timestamp: new Date().toISOString(),
        role: 'assistant',
        agent: 'Commitment Shield',
        content: `Hey! You have ${urgentBills} urgent bill(s) due soon. Want me to check if you have enough balance to cover them?`,
        actions: [{ id: 'check_bills', label: 'Check Bills', type: 'postpone' }]
      };
    } else if (isBroke) {
      greetingMessage = {
        timestamp: new Date().toISOString(),
        role: 'assistant',
        agent: 'Finance Strategist',
        content: `Warning: Your safe daily spend is critically low (RM ${store.safeDailySpend.toFixed(2)}). Let's review your recent spending or turn on Spend Guard.`,
        actions: [{ id: 'toggle_sg', label: 'Toggle Spend Guard', type: 'postpone' }]
      };
    } else {
      greetingMessage = {
        timestamp: new Date().toISOString(),
        role: 'assistant',
        agent: 'Finance Strategist',
        content: `Welcome back, ${store.user.name}! Your finances are looking steady today. How can I help?`
      };
    }

    if (greetingMessage) {
      setMessages([greetingMessage]);
    }
    setIsLoaded(true);
  }, []);

  // Persist messages
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('coach_messages', JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setInterimTranscript("");
          transcriptRef.current = "";
        };

        rec.onend = () => {
          setIsListening(false);
          const finalPrompt = transcriptRef.current.trim();
          if (finalPrompt) {
            sendMessage(finalPrompt);
            transcriptRef.current = "";
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptText;
            } else {
              interim += transcriptText;
            }
          }
          if (final) {
            setInput(prev => {
              const base = prev.trim();
              const updated = base ? `${base} ${final}` : final;
              transcriptRef.current = updated;
              return updated;
            });
            setInterimTranscript("");
          } else if (interim) {
            setInterimTranscript(interim);
          }
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

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
            proposal: { type: 'create_pocket', name: fnCall.args.name, target: fnCall.args.target, current: deposit, icon: '💰', mode, riskLevel }
          };
        }
        case 'addFundsToPocket': {
          const pocket = store.savingsPockets.find(p => p.name.toLowerCase().includes(fnCall.args.pocketName.toLowerCase()));
          if (!pocket) return { success: false, message: `I couldn't find a pocket named "${fnCall.args.pocketName}". Try listing your pockets first!` };
          store.addFundsToPocket(pocket.id, fnCall.args.amount);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
          return {
            success: true,
            message: `Successfully deposited RM ${fnCall.args.amount.toFixed(2)} into your ${pocket.name}!`,
            redirect: { label: 'Go to Savings', href: '/savings' },
            proposal: { type: 'add_funds', pocketId: pocket.id, pocketName: pocket.name, amount: fnCall.args.amount, icon: pocket.icon }
          };
        }
        case 'addTransaction': {
          const { title, amount, category } = fnCall.args;
          
          useStore.setState((s) => ({
            transactions: [
              {
                id: Math.random().toString(),
                title,
                amount: -Math.abs(amount), // Transactions are negative
                date: new Date().toISOString(),
                category: category || 'Other',
                type: 'expense',
                isSubscription: false
              },
              ...s.transactions
            ],
            user: {
              ...s.user,
              currentBalance: s.user.currentBalance - Math.abs(amount)
            }
          }));

          return {
            success: true,
            message: `Recorded your expense of RM ${amount.toFixed(2)} for ${title}. Your balance has been updated.`,
          };
        }
        case 'toggleSpendGuard': {
          const shouldEnable = fnCall.args.enable;
          if (shouldEnable !== store.isSpendGuardActive) store.toggleSpendGuard();
          useStore.setState({ pet: { ...useStore.getState().pet, animation: shouldEnable ? "happy" : "idle" } });
          return { success: true, message: shouldEnable ? 'Spend Guard is now ON.' : 'Spend Guard is now OFF.' };
        }
        default: return { success: false, message: `Unknown function: ${fnCall.name}` };
      }
    } catch (error: any) {
      useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
      return { success: false, message: `Action blocked: ${error.message}` };
    }
  };

  const logChat = (agentId: string, message: string, response: string, functionCalled?: string) => {
    fetch('/api/chat/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: user.name, agent_id: agentId, message, response, function_called: functionCalled || null }),
    }).catch(() => {});
  };

  const buildAIContext = () => {
    const store = useStore.getState();
    const spending = analyzeSpending(store.transactions);
    const topCategories = spending.slice(0, 3).map(s => `${s.category} (RM ${s.total})`).join(", ");
    const billStatus = analyzeBills(store.bills);
    const billCoverage = checkBillCoverage(store.user.currentBalance, billStatus);
    const urgentBills = billStatus.filter(b => b.status === 'urgent').length;
    
    // Sprint 5: Subscriptions & DTI
    const subscriptions = detectSubscriptions(store.transactions);
    const monthlyIncome = store.user.monthlyIncome; 
    const totalMonthlyBills = store.bills.reduce((sum, b) => sum + b.amount, 0);
    const dtiRatio = Math.round((totalMonthlyBills / monthlyIncome) * 100);

    return {
      balance: store.user.currentBalance,
      safeDailySpend: store.safeDailySpend,
      nextGenScore: store.nextGenScore,
      isSpendGuardActive: store.isSpendGuardActive,
      savingsPockets: store.savingsPockets.map(p => ({ name: p.name, current: p.current, target: p.target })),
      recentSpending: topCategories || "No recent spending",
      urgentBillsCount: urgentBills,
      canCoverUpcomingBills: billCoverage.canCover,
      subscriptionsDetected: subscriptions.length > 0 ? subscriptions : "None",
      dtiRatio: `${dtiRatio}% (Income: RM ${monthlyIncome})`,
    };
  };

  const handleAction = async (action: ChatAction) => {
    haptic.light();
    if (action.type === 'follow_up') {
      // Clear the actions from the previous message so they disappear when clicked
      setMessages(prev => prev.map(m => ({ ...m, actions: undefined })));
      sendMessage(action.label);
      return;
    }

    if (isExecuting) return;
    setIsExecuting(true);

    if (action.type !== 'simulate_affordability') {
      setMessages(prev => [
        ...prev.map(m => ({ ...m, actions: undefined })),
        { timestamp: new Date().toISOString(), role: 'user', content: action.label }
      ]);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    let responseText = "";
    let redirect: { href: string; label: string } | undefined;
    let proposal: any = undefined;

    switch (action.type) {
      case 'create_pocket':
        try {
          const store = useStore.getState();
          const depositVal = parseFloat(store.saveDeposit) || 0;
          addSavingsPocket({
            id: Math.random().toString(36).substring(2, 11),
            name: action.payload.name,
            target: action.payload.target,
            current: depositVal,
            icon: action.payload.icon || '💰',
            mode: action.payload.mode || 'savings',
            riskLevel: action.payload.riskLevel
          });
          setMessages(prev => {
            const next = [...prev];
            let lastIdx = -1;
            for (let k = next.length - 1; k >= 0; k--) {
              if (next[k].proposal?.type === 'create_pocket') {
                next[k].proposal = { ...next[k].proposal, current: depositVal };
                lastIdx = k;
                break;
              }
            }
            if (lastIdx > -1) next.splice(lastIdx, 1);
            return next;
          });
          responseText = `Awesome! I've created the ${action.payload.name} pocket for you.`;
          setUndoToast({
            message: "Pocket created",
            onUndo: () => {
              useStore.setState(s => ({ savingsPockets: s.savingsPockets.slice(0, -1) }));
              setUndoToast(null);
            }
          });
          setTimeout(() => setUndoToast(null), 4000);
          store.setSaveTarget(""); store.setSaveDeposit("");
          redirect = { label: "View Pockets", href: "/savings" };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'add_funds':
        try {
          const oldState = useStore.getState();
          const todayStr = new Date().toDateString();
          const todayExpenses = oldState.transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr).reduce((sum, t) => sum + t.amount, 0);
          const oldBalance = oldState.user.currentBalance;
          const oldQuota = oldState.initialSafeDaily - todayExpenses;
          const oldSafeDaily = oldState.safeDailySpend;

          useStore.getState().addFundsToPocket(action.payload.pocketId, action.payload.amount);
          const newState = useStore.getState();
          const newSafeDaily = newState.calculateDailyLimitForBalance(newState.user.currentBalance);
          const newQuota = newState.initialSafeDaily - todayExpenses;

          responseText = `I've moved RM ${amt.toFixed(2)} to ${action.payload.pocketName}. You're making great progress!`;
        setUndoToast({
          message: `Added RM ${amt.toFixed(2)}`,
          onUndo: () => {
             // Reverse the transaction and pocket addition
             useStore.setState(s => {
               const pIdx = s.savingsPockets.findIndex(p => p.id === action.payload.pocketId);
               if (pIdx > -1) {
                 const newPockets = [...s.savingsPockets];
                 newPockets[pIdx].current -= amt;
                 return {
                   user: { ...s.user, currentBalance: s.user.currentBalance + amt },
                   savingsPockets: newPockets
                 };
               }
               return s;
             });
             setUndoToast(null);
          }
        });
        setTimeout(() => setUndoToast(null), 4000);
          proposal = { type: 'deposit_summary', amount: action.payload.amount, before: { balance: oldBalance, quota: oldQuota, safeDaily: oldSafeDaily }, after: { balance: newState.user.currentBalance, quota: newQuota, safeDaily: newSafeDaily } };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
          redirect = { label: "Go to Savings", href: "/savings" };

          setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Savings Sentinel', content: responseText, proposal, redirect }]);
          setIsExecuting(true);

          setTimeout(() => {
            const pocket = useStore.getState().savingsPockets.find(p => p.id === action.payload.pocketId);
            if (!pocket) { setIsExecuting(false); return; }
            const remaining = pocket.target - pocket.current;
            if (remaining <= 0) {
              setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: `Incredible! You've successfully hit your target!` }]);
              setIsExecuting(false); return;
            }
            
            const store = useStore.getState();
            const projection = calculateSavingsVelocity(pocket.id, store.transactions, pocket.current, pocket.target);
            
            let daily = remaining / 90; // Fallback
            let date = new Date(); date.setDate(date.getDate() + 90);
            
            if (projection.avgDailySavings > 0 && projection.projectedDate) {
              daily = projection.avgDailySavings;
              date = projection.projectedDate;
            }
            
            const weekly = daily * 7;
            const monthly = daily * 30;
            
            setMessages(prev => [...prev, {
              role: 'assistant',
              agent: 'Finance Strategist',
              content: projection.avgDailySavings > 0 ? `Based on your recent savings pace, here is your projection.` : `Great job! I've calculated a structured plan.`,
              proposal: { type: 'strategist_goal_planner', daily, weekly, monthly, targetDate: date.toLocaleDateString('en-MY'), pocketName: pocket.name, remaining, basedOnHistory: projection.avgDailySavings > 0 }
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
        responseText = "Understood. I've moved this suggestion to the backlog.";
        break;
      case 'prioritize_emergency':
        responseText = "Smart move. Prioritizing your Emergency Fund will boost your NextGen Score.";
        redirect = { label: "Go to Savings", href: "/savings" };
        break;
      case 'transfer':
        try {
          const oldState = useStore.getState();
          const parsedAmount = parseFloat(action.payload.amount) || 0;
          
          if (parsedAmount > 500 && !action.payload.otpConfirmed) {
            responseText = `For your security, transfers over RM 500.00 require an OTP confirmation.`;
            proposal = { type: 'otp_verification', amount: parsedAmount, recipient: action.payload.recipient };
            useStore.setState({ pet: { ...useStore.getState().pet, animation: "think" } });
            break; // Stop and wait for OTP action
          }

          const nextSafeDaily = oldState.calculateDailyLimitForBalance(oldState.user.currentBalance - parsedAmount);

          if (nextSafeDaily < 10.0) throw new Error(`Transfer blocked. Safe daily spending would fall below RM 10.00.`);

          addTransaction({
            id: `txn-${Date.now()}`,
            title: `Transfer to ${action.payload.recipient}`,
            amount: parsedAmount,
            category: 'Transfer',
            date: new Date().toISOString(),
            type: 'expense',
            confidence: 1.0
          });
          responseText = `Transfer complete. RM ${parsedAmount.toFixed(2)} sent to ${action.payload.recipient}.`;
          redirect = { label: "View Transactions", href: "/transactions" };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'simulate_affordability':
        const store = useStore.getState();
        const item = store.affordItem || "this item";
        const priceVal = store.affordPrice;

        setMessages(prev => {
          const next = [...prev];
          for (let k = next.length - 1; k >= 0; k--) {
            if (next[k].proposal?.type === 'affordability') {
              next[k].proposal = { ...next[k].proposal, item, price: priceVal };
              break;
            }
          }
          return [...next.map(m => ({ ...m, actions: undefined })), { timestamp: new Date().toISOString(), role: 'user', content: `Checking if I can afford ${item} for RM ${priceVal}` }];
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        const p = parseFloat(priceVal);
        const impact = p / 14;
        const newDailySpend = safeDailySpend - impact;
        let recommendation = "Safe";
        if (newDailySpend < 5) recommendation = "Avoid";
        else if (newDailySpend < 12) recommendation = "Caution";

        const budgetLimit = user.currentBalance * 0.3;
        const isRisky = recommendation === "Avoid" || recommendation === "Caution";
        
        let adviceSummary = "";
        if (recommendation === "Avoid") adviceSummary = `At RM ${p.toLocaleString()}, this is well above the safe threshold.`;
        else if (recommendation === "Caution") adviceSummary = `This is within reach, but will tighten your budget.`;
        else adviceSummary = `Great news — this fits comfortably within your budget.`;

        const analysisResult = { item, price: p, impact: impact.toFixed(2), newDailySpend: Math.max(0, newDailySpend).toFixed(2), recommendation, debtRiskImpact: (p / 20).toFixed(0), adviceSummary };

        setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Commitment Shield', content: isRisky ? `This exceeds your safety threshold.` : `Looks good!`, proposal: { type: 'affordability_result', ...analysisResult } }]);

        if (isRisky) {
          try {
            const altRes = await fetch('/api/chat/alternatives', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ item, budgetLimit })
            });
            const altData = await altRes.json();
            let alternatives = altData.alternatives || [];
            
            // Fix image paths
            alternatives = alternatives.map((alt: any) => ({
              ...alt,
              image: alt.image.startsWith('/') ? `${basePath}${alt.image}` : alt.image
            }));

            store.setSelectedPlatform(null);
            setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: alternatives.length > 0 ? `I've sourced alternatives that fit your budget:` : `Hold off on this purchase.`, proposal: alternatives.length > 0 ? { type: 'strategist_alternative', alternatives, budgetLimit: budgetLimit.toFixed(0) } : undefined }]);
            haptic.success();
          } catch (e) {
             setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: `Hold off on this purchase.` }]);
          }
        } else {
          haptic.success();
        }
        store.setAffordItem(""); store.setAffordPrice(""); setIsExecuting(false);
        return;
    }
    setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: action.type === 'transfer' ? 'Finance Strategist' : 'Savings Sentinel', content: responseText, redirect, proposal }]);
    haptic.success();
    setIsExecuting(false);
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSubmit = (overrideText || input).trim();
    if (!textToSubmit || isThinking) return;

    haptic.light();
    
    const lower = textToSubmit.toLowerCase();

    // 1.1c Fast-path rule override for deterministic commands
    if (lower === "what's my balance?" || lower === "balance" || lower.includes("baki")) {
      setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }]);
      if (!overrideText) setInput("");
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant', agent: 'Finance Strategist',
          content: `Your current balance is RM ${user.currentBalance.toFixed(2)}.`,
          structured: { headline: "Balance Update", status: "good", insight: "You are on track.", metric: { label: "Balance", value: `RM ${user.currentBalance.toFixed(2)}`, trend: "flat" } }
        }]);
      }, 500);
      return;
    }
    
    if (lower.includes("spend guard on")) {
      useStore.getState().toggleSpendGuard();
      setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Commitment Shield', content: "Spend Guard is now ON." }]);
      setUndoToast({
        message: "Spend Guard turned ON",
        onUndo: () => {
          useStore.getState().toggleSpendGuard();
          setUndoToast(null);
        }
      });
      setTimeout(() => setUndoToast(null), 4000);
      if (!overrideText) setInput("");
      return;
    }

    if (lower.includes("show my pockets") || lower.includes("list pockets")) {
      setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Savings Sentinel', content: `You have ${savingsPockets.length} pockets:`, proposal: { type: 'list_pockets' } }]);
      if (!overrideText) setInput("");
      return;
    }

    setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }]);
    if (!overrideText) setInput("");
    setIsThinking(true);
    useStore.setState({ pet: { ...useStore.getState().pet, animation: "think" } });

    try {
      // 1.1b Classify intent
      const classifyRes = await fetch('/api/chat/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSubmit })
      });
      const classifyData = await classifyRes.json();
      const intent = classifyData.intent || 'general_finance';

      // 1.2b Pass history (last 5 messages)
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Agent mapping based on intent
      let agentId = 'finance';
      let agentName = 'Finance Strategist';
      let taskType: string | null = null;
      let nextAnim = "idle";

      if (intent === 'savings') { agentId = 'save'; agentName = 'Savings Sentinel'; taskType = 'create_pocket'; nextAnim = "happy"; }
      else if (intent === 'debt' || intent === 'bills') { agentId = 'debt'; agentName = 'Commitment Shield'; taskType = 'affordability'; nextAnim = "blink"; }
      else if (intent === 'invest') { agentId = 'invest'; agentName = 'Growth Guru'; nextAnim = "excited"; }
      else if (intent === 'transfer') { agentId = 'finance'; agentName = 'Finance Strategist'; taskType = 'transfer'; nextAnim = "think"; }

      setActiveAgent(agentName);
      const responses: Message[] = [];

      // Clean up previous unsubmitted proposals of the same task type
      if (taskType) {
        setMessages(prev => {
          let baseMessages = [...prev];
          const unsubmittedIndices = new Set<number>();
          baseMessages.forEach((msg, idx) => {
            if (msg.proposal?.type === taskType && (msg.actions || !msg.proposal?.item)) {
              unsubmittedIndices.add(idx);
              if (idx > 0 && baseMessages[idx - 1].role === 'user') unsubmittedIndices.add(idx - 1);
            }
          });
          return baseMessages.filter((_, idx) => !unsubmittedIndices.has(idx));
        });
      }

      if (intent === 'transfer') {
        const transferDetails = await parseTransferIntent(textToSubmit);
        
        if (transferDetails.recipient && transferDetails.amount) {
          const isUnknownBank = transferDetails.bank === 'Unknown Bank';
          responses.push({
            role: 'assistant', agent: 'Finance Strategist', 
            content: isUnknownBank ? "I couldn't find this recipient in your contacts. Please verify before sending:" : "I've prepared a transfer proposal:",
            proposal: { 
              name: `Transfer to ${transferDetails.recipient}`, 
              type: 'transfer', 
              amount: transferDetails.amount, 
              recipient: transferDetails.recipient, 
              bank: transferDetails.bank, 
              icon: '💸' 
            },
            actions: [
              { id: 'approve', label: 'Approve & Send', type: 'transfer', payload: { amount: transferDetails.amount, recipient: transferDetails.recipient } }, 
              { id: 'postpone', label: 'Decline', type: 'postpone' }
            ]
          });
        } else {
           responses.push({
            role: 'assistant', agent: 'Finance Strategist', 
            content: "Who would you like to transfer to, and how much?",
          });
        }
      } else {
        // Fast path for spending breakdown
        if (textToSubmit.includes("spend") && textToSubmit.includes("breakdown") || textToSubmit.includes("category")) {
          const spending = analyzeSpending(useStore.getState().transactions);
          responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: `Here is your 30-day spending breakdown:`, proposal: { type: 'spending_breakdown', spending } });
          setMessages(prev => [...prev, ...responses]);
          setIsThinking(false);
          setActiveAgent(null);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: nextAnim } });
          return;
        }

        // Fast path for bills
        if (textToSubmit.includes("bill") && textToSubmit.includes("due")) {
          const billStatus = analyzeBills(useStore.getState().bills);
          responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: 'Commitment Shield', content: `Here are your upcoming bills:`, proposal: { type: 'bill_timeline', bills: billStatus } });
          setMessages(prev => [...prev, ...responses]);
          setIsThinking(false);
          setActiveAgent(null);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: 'blink' } });
          return;
        }

        const res = await fetchWithRetry('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSubmit, agentId, context: buildAIContext(), history })
        });
        const data = await res.json();
        
        if (data.fallback) {
           // Rule-based fallback if API has an error
           responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: agentName, content: `Your balance is RM ${user.currentBalance.toFixed(2)} and your safe daily spend is RM ${safeDailySpend.toFixed(2)}. (Offline mode)` });
        } else if (data.functionCall) {
          const result = executeGeminiFunctionCall(data.functionCall);
          responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: agentName, content: result.message, redirect: result.redirect, proposal: result.proposal });
          logChat(agentId, textToSubmit, result.message, data.functionCall.name);
        } else {
          let aiActions: ChatAction[] = [];
          if (data.structured?.followUps?.length) {
            aiActions = data.structured.followUps.map((q: string, i: number) => ({
              id: `followup_${i}_${Date.now()}`,
              label: q,
              type: 'follow_up'
            }));
          }
          responses.push({ 
            timestamp: new Date().toISOString(), 
            role: 'assistant', 
            agent: agentName, 
            content: data.reply || data.structured?.headline || "Got it.", 
            structured: data.structured, 
            isFallbackModel: data.isFallbackModel,
            actions: aiActions.length > 0 ? aiActions : undefined
          });
        }
      }

      setMessages(prev => [...prev, ...responses]);
      setIsThinking(false);
      setActiveAgent(null);
      useStore.setState({ pet: { ...useStore.getState().pet, animation: nextAnim } });
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        timestamp: new Date().toISOString(), role: 'assistant', 
        agent: 'Finance Strategist', 
        content: `Your balance is RM ${user.currentBalance.toFixed(2)} and your safe daily spend is RM ${safeDailySpend.toFixed(2)}. (Offline fallback)`,
        actions: [{ id: 'retry', label: 'Retry API', type: 'postpone' }]
      }]);
      setIsThinking(false);
      setActiveAgent(null);
      useStore.setState({ pet: { ...useStore.getState().pet, animation: 'idle' } });
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('coach_messages');
    hasGreetedRef.current = false;
    window.location.reload(); // Quick reset to trigger greeting again
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isThinking,
    activeAgent,
    isExecuting,
    undoToast,
    setUndoToast,
    isListening,
    interimTranscript,
    toggleListening,
    handleAction,
    sendMessage,
    clearChat
  };
}
