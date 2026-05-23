# BeU NextGen — System Architecture

> **BeU by Bank Islam × UMPSA | Hackathon X Fintech Forward 2026**  
> Theme: *"Future of Money: Reimagine Finance with AI"*

---

## 1. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, routing, API routes, PWA manifest |
| Language | TypeScript | Type safety across all components |
| UI Runtime | React 18 | Component state and rendering |
| Styling | Tailwind CSS | Utility-first design with BeU Pulse design system |
| Animation | Framer Motion | Micro-animations, page transitions, Voice UI |
| State Management | Zustand | Global financial state, user wallet, session |
| Charts | Recharts | Spending insights and score visualizations |
| AI Model | Google Gemini 3.1 Flash Lite | Multi-agent financial coaching (via REST API) |
| Database | PostgreSQL (IPONESERVER — NovaCloud) | Persistent user, savings, transfers, bills records |
| Icons | Lucide React | Interface iconography |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser / PWA)                        │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Dashboard   │  │  Coach (AI)  │  │  Bills/Save  │  ...pages    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┴──────────────────┘                       │
│                           │                                          │
│                    ┌──────▼──────┐                                   │
│                    │  Zustand    │  ← Global financial state         │
│                    │  useStore   │    (wallet, score, bills, pockets)│
│                    └──────┬──────┘                                   │
│                           │                                          │
│                    ┌──────▼──────┐                                   │
│                    │StoreSyncHandler│ ← Auto-syncs to DB on change  │
│                    └─────────────┘                                   │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────────────────┐
│                     NEXT.JS API ROUTES (Server)                      │
│                                                                      │
│  POST /api/chat         → Gemini AI multi-agent coaching             │
│  GET/POST /api/user     → Sync user financial state to PostgreSQL    │
│  GET/POST /api/savings  → CRUD savings pockets                       │
│  GET/POST /api/transfers→ CRUD transaction records                   │
│  GET/POST /api/bills    → CRUD smart bill lock commitments           │
│  GET /api/diagnostics   → Health check (DB + Gemini latency)         │
│  POST /api/sync         → Bulk state sync trigger                    │
└──────────────┬────────────────────────────┬──────────────────────────┘
               │                            │
    ┌──────────▼──────────┐      ┌──────────▼──────────┐
    │   Google Gemini AI  │      │  PostgreSQL Database │
    │  (REST API, Flash)  │      │  IPONESERVER         │
    │                     │      │  (NovaCloud)         │
    │  4 Agent Personas:  │      │  Tables:             │
    │  • Finance Strategist│      │  • users             │
    │  • Savings Sentinel │      │  • savings           │
    │  • Commitment Shield│      │  • transfers         │
    │  • Growth Guru      │      │  • bills             │
    └─────────────────────┘      │  • chat_logs         │
                                 └─────────────────────┘
```

---

## 3. Page Routes (`src/app/`)

| Route | Component | Description |
|---|---|---|
| `/` | `Landing.tsx` | Splash / onboarding entry |
| `/setup` | Setup flow | User profile, allowance, commitments setup |
| `/dashboard` | `Dashboard.tsx` | Main wallet view, Safe Daily Spend, NextGen Score |
| `/coach` | `Coach.tsx` | AI multi-agent coaching chat (126KB — primary AI interface) |
| `/bills` | `Bills.tsx` | Smart Bill Lock management |
| `/savings` | `Savings.tsx` | Savings Hub with goal pockets |
| `/transfer` | `Transfer.tsx` | AI-assisted money transfer with ML match |
| `/scan` | `Scanner.tsx` | Pay Scanner — AI spend risk evaluation |
| `/cards` | `Cards.tsx` | Cards Hub overview |
| `/transactions` | `Transactions.tsx` | Full transaction history |
| `/reports` | `Reports.tsx` | Spending insights and Recharts visualizations |
| `/agents` | AgentCommandCenter | AI Agent council status overview |
| `/settings` | `Settings.tsx` | User settings and profile |
| `/diagnostics` | Diagnostics page | System health monitor (DB + AI latency + ERD map) |

---

## 4. API Routes (`src/app/api/`)

### `POST /api/chat`
Multi-agent Gemini AI coaching endpoint.

**Flow:**
1. Off-topic server guard (keyword check — no API call)
2. Build user financial context string
3. Call Gemini with structured JSON schema prompt
4. Parse structured JSON → return `{ structured, fallback }` OR fallback to `{ reply }`
5. Function call handling (createSavingsPocket, addFundsToPocket, toggleSpendGuard)

**Agent personas:**
| Agent ID | Name | Domain |
|---|---|---|
| `finance` | Finance Strategist | Daily spend, budget, score overview |
| `save` | Savings Sentinel | Goals, pockets, expense cutting |
| `debt` | Commitment Shield | Bills, BNPL, loans |
| `invest` | Growth Guru | ASB, unit trusts, growth planning |

### `GET/POST /api/user`
Reads/writes user financial state to `users` PostgreSQL table.

### `GET/POST /api/savings`
CRUD for savings pockets (`savings` table).

### `GET/POST /api/transfers`
CRUD for transaction records (`transfers` table).

### `GET/POST /api/bills`
CRUD for Smart Bill Lock commitments (`bills` table).

### `GET /api/diagnostics`
Returns DB connection latency, table existence checks, and Gemini API latency.

### `POST /api/sync`
Bulk sync trigger — pushes full Zustand state snapshot to PostgreSQL.

---

## 5. State Management (`src/store/useStore.ts`)

Single Zustand store. Key state slices:

```typescript
{
  // User & Wallet
  user: { name, currentBalance, isSpendGuardActive, ... },
  
  // AI Financial Metrics
  safeDailySpend: number,         // computed: balance / days remaining
  initialSafeDaily: number,
  nextGenScore: number,           // 0–100 financial health score
  
  // Financial Data
  transactions: Transaction[],
  bills: Bill[],
  savingsPockets: SavingsPocket[],
  
  // AI & Companion
  pet: { animation, message },
  selectedCompanion: string,       // 'uteh' | 'zuko' | 'oreo' | ...
  
  // Gamification
  currentStreak: number,
  membershipTier: 'Novice' | 'Pro' | 'Legend',
  streakShieldActive: boolean,
  awfarDrawTickets: number,
  
  // Settings
  language: 'en' | 'ms',
}
```

**Auto-sync:** `StoreSyncHandler` component watches state changes and pushes diffs to PostgreSQL via `/api/sync` and individual API routes.

---

## 6. AI Response Architecture

```
User Message
     │
     ▼
sendMessage() in Coach.tsx
     │
     ├─ triggerFinance? ──────────────── POST /api/chat { agentId: 'finance' }
     ├─ triggerSave?    ──────────────── POST /api/chat { agentId: 'save' }
     ├─ triggerGrowth?  ──────────────── POST /api/chat { agentId: 'invest' }
     ├─ triggerDebt?    ──────────────── Local affordability card
     └─ else            ──────────────── POST /api/chat { agentId: 'finance' }
     
     ▼
API Route (/api/chat)
     │
     ├─ Off-topic guard → instant structured rejection
     ├─ Build context (balance, score, pockets, guard status)
     ├─ Call Gemini with structured JSON schema prompt
     └─ Return { structured } or { functionCall } or { reply }
     
     ▼
Coach.tsx renders:
     ├─ m.structured → StructuredMessageBubble (card with headline/insight/metric/CTA)
     ├─ m.functionCall → executeGeminiFunctionCall() → action + card
     └─ m.content → plain text bubble (fallback)
```

---

## 7. Database Schema

```sql
-- Primary entity — all tables reference this
users (
  user_name VARCHAR PRIMARY KEY,
  balance   NUMERIC,
  resilience_score INTEGER,
  streak    INTEGER,
  state_data JSONB,
  updated_at TIMESTAMP
)

-- 1:N from users
savings    (id, user_name FK, name, target_amount, current_amount, icon, mode, risk_level, ...)
transfers  (id, user_name FK, title, amount, type, category, confidence, date, ...)
bills      (id, user_name FK, name, category, amount, due_day, next_due_date, is_locked, status, ...)
chat_logs  (id SERIAL, user_name FK, agent_id, message, response, function_called, timestamp)
```

---

## 8. Companion System

6 unlockable AI companions with tier gating:

| ID | Name | Tier Required |
|---|---|---|
| uteh | Uteh | Novice (all) |
| zuko | Zuko | Pro |
| oreo | Oreo | Pro |
| oyen | Oyen | Legend |
| yunn | Yunn | Legend |
| lico | Lico | Legend |

Companion animations: `idle`, `walk`, `happy`, `excited`, `think`, `blink`

---

## 9. PWA Configuration

- `manifest.ts` defines PWA name, icons, theme colour, display mode
- `globals.css` includes viewport-safe PWA styling
- Installable on iOS/Android from browser
- Offline-capable UI (state persisted in Zustand)

---

## 10. AI Tools Used

| Tool | Purpose |
|---|---|
| Google Gemini 3.1 Flash Lite | AI financial coaching, structured JSON responses, function calling |
| Antigravity (AI coding assistant) | Architecture design, component implementation, DB schema, API routes |

---

*Last updated: May 2026 | BeU NextGen × UMPSA Hackathon*
