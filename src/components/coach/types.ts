import { LucideIcon } from "lucide-react";

export interface Companion {
  id: string;
  name: string;
  tierRequired: string;
  label: string;
}

export interface Agent {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface ChatAction {
  id: string;
  label: string;
  type: 'create_pocket' | 'postpone' | 'prioritize_emergency' | 'transfer' | 'simulate_affordability' | 'add_funds' | 'follow_up';
  payload?: any;
}

export interface StructuredResponse {
  headline: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  insight: string;
  lesson?: string;
  metric?: { label: string; value: string; trend: 'up' | 'down' | 'flat' } | null;
  action?: string | null;
  actionType?: 'toggle_spend_guard' | 'go_savings' | 'go_bills' | 'go_transfer' | null;
  followUps?: string[];
}

export interface CreatePocketProposal {
  type: 'create_pocket';
  name: string;
  target: number;
  current: number;
  icon: string;
  mode: 'savings' | 'growth';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AddFundsProposal {
  type: 'add_funds';
  pocketId: string;
  pocketName: string;
  amount: number;
  icon: string;
}

export interface TransferProposal {
  type: 'transfer';
  name?: string;
  recipient: string;
  amount: number;
  bank?: string;
  icon?: string;
}

export interface AffordabilityProposal {
  type: 'affordability';
  item?: string;
  price?: string;
}

export interface AffordabilityResultProposal {
  type: 'affordability_result';
  item: string;
  price: number;
  impact: string;
  newDailySpend: string;
  recommendation: string;
  debtRiskImpact: string;
  adviceSummary: string;
}

export interface StrategistAlternativeProposal {
  type: 'strategist_alternative';
  alternatives: any[];
  budgetLimit: string;
}

export interface DepositSummaryProposal {
  type: 'deposit_summary';
  amount: number;
  before: { balance: number; quota: number; safeDaily: number };
  after: { balance: number; quota: number; safeDaily: number };
}

export interface StrategistGoalPlannerProposal {
  type: 'strategist_goal_planner';
  daily: number;
  weekly: number;
  monthly: number;
  targetDate: string;
  pocketName: string;
  remaining: number;
  basedOnHistory: boolean;
}

export interface SpendingBreakdownProposal {
  type: 'spending_breakdown';
  spending: any[];
}

export interface BillTimelineProposal {
  type: 'bill_timeline';
  bills: any[];
}

export interface OtpVerificationProposal {
  type: 'otp_verification';
  amount: number;
  recipient: string;
}

export interface ListPocketsProposal {
  type: 'list_pockets';
}

export type ProposalType = 
  | CreatePocketProposal 
  | AddFundsProposal 
  | TransferProposal 
  | AffordabilityProposal 
  | AffordabilityResultProposal 
  | StrategistAlternativeProposal 
  | DepositSummaryProposal 
  | StrategistGoalPlannerProposal 
  | SpendingBreakdownProposal 
  | BillTimelineProposal 
  | OtpVerificationProposal 
  | ListPocketsProposal;

export interface Message {
  role: 'user' | 'assistant';
  agent?: string;
  content: string;
  structured?: StructuredResponse;
  actions?: ChatAction[];
  proposal?: any;
  redirect?: { label: string; href: string };
  isFallbackModel?: boolean;
  timestamp: string;
}
