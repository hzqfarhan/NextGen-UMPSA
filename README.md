# BeU NextGen

> **Be U by Bank Islam × UMPSA | Hackathon X Fintech Forward 2026**  
> Theme: *"Future of Money: Reimagine Finance with AI"*

AI-powered financial companion for youth money habits.

---

## Problem Statement

Students and young adults see one balance number and mentally guess what is safe to spend. That hides rent, bills, transport, food, savings goals, and end-of-month pressure inside the same number — causing overspending, missed commitments, and financial anxiety.

## Our Solution

BeU NextGen separates money into **what the user has**, **what must be protected**, and **what can be safely spent**. The NextGen AI Council turns risky money moments into quick, understandable decisions with a local Malaysian voice and practical next steps.

> Core question: *"Can I afford this right now without hurting my future self?"*

---

## Key Features

| Feature | Description |
|---|---|
| **Safe Daily Spend** | Computed safe budget per day based on balance, bills, and days remaining |
| **Smart Bill Lock** | Auto-protects recurring commitments — rent, phone, PTPTN, subscriptions |
| **NextGen Score** | 0–100 financial health score updated in real-time |
| **NextGen AI Council** | 4 Gemini-powered AI agents — Finance Strategist, Savings Sentinel, Commitment Shield, Growth Guru |
| **Structured AI Responses** | AI returns a JSON card (headline, status, insight, metric, CTA) instead of long paragraphs |
| **AI Topic Guard** | Off-topic messages are rejected instantly without calling the AI model |
| **Savings Hub** | Goal-based savings pockets with progress tracking and AI coaching |
| **Transfer with AI Match** | AI-suggested transfers with 95%+ confidence matching from transaction history |
| **Pay Scanner** | QR-style spend risk evaluator with Impulse Negotiator |
| **Roast & Toast Engine** | Malay dialect AI feedback on spending habits |
| **NextGen Companion** | 6 unlockable animated companions (Uteh, Zuko, Oreo, Oyen, Yunn, Lico) |
| **Membership Tiers** | Novice → Pro → Legend with unlockable features and companions |
| **Streak & Rewards** | Daily streak tracking, Streak Shield, AWFAR draw tickets |
| **Diagnostics Panel** | Real-time system health — DB latency, Gemini API status, ERD schema map |
| **Voice Assistant** | Speech-to-text financial queries with animated orb UI |
| **PWA Ready** | Installable on iOS/Android, manifest configured |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Runtime | React 18 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| AI Model | Google Gemini 3.1 Flash Lite |
| Database | PostgreSQL (Neon Cloud) |

---

## Architecture

See [`docs/system_architecture.md`](docs/system_architecture.md) for the full system architecture including data flow, API routes, database schema, and AI agent routing.

**Quick overview:**

```
Browser (PWA)
  └─ Zustand global state (wallet, score, bills, pockets)
       └─ StoreSyncHandler → syncs to PostgreSQL on state change
            └─ Next.js API Routes (/api/chat, /api/user, /api/savings, /api/transfers, /api/bills)
                 ├─ Google Gemini AI (structured JSON responses, function calling)
                 └─ PostgreSQL Database (users, savings, transfers, bills, chat_logs)
```

### Pages

| Route | Description |
|---|---|
| `/dashboard` | Main wallet, Safe Daily Spend, NextGen Score |
| `/coach` | AI Council chat with structured response cards |
| `/bills` | Smart Bill Lock management |
| `/savings` | Savings Hub with goal pockets |
| `/transfer` | AI-assisted money transfer |
| `/scan` | Pay Scanner — spend risk evaluation |
| `/reports` | Spending insights and charts |
| `/diagnostics` | System health monitor |
| `/settings` | User settings |

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:2221`.

### Environment Variables

```bash
# Required for AI coaching
GEMINI_API_KEY=your_key_here

# Required for persistent database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Optional
GEMINI_MODEL=gemini-3.1-flash-lite
NEXT_PUBLIC_BASE_PATH=
```

---

## Database Setup

Run DDL in order:

```sql
-- 1. users
-- 2. savings
-- 3. transfers
-- 4. bills
-- 5. chat_logs
```

See `/docs/system_architecture.md` for full schema.

---

## Demo Flow

1. Complete onboarding — set allowance, next allowance date, and commitments.
2. Open Dashboard — see Total Balance, Protected Commitments, Spendable Balance, Safe Daily Spend, and NextGen Score.
3. Visit Smart Bill Lock — confirm commitments are auto-protected.
4. Open AI Coach — ask "What is my Safe Daily Spend?" — see structured AI card response.
5. Try Pay Scanner — choose a risky demo purchase and watch Impulse Negotiator activate.
6. Visit Savings Hub — add funds to a goal pocket.
7. Try Transfer — use AI-suggested match for a recent contact.
8. Visit Diagnostics — verify DB connection, Gemini latency, and view the ERD Schema Map.

---

## AI Tools Used

| Tool | Usage |
|---|---|
| **Google Gemini 3.1 Flash Lite** | All AI coaching, structured JSON financial responses, function calling (createSavingsPocket, addFundsToPocket, toggleSpendGuard) |
| **Antigravity** | System architecture, component implementation, database schema, API routes, agent routing logic |

> All AI-generated code has been reviewed, tested, and understood by the team. We can walk through any part during Q&A.

---

## Libraries & Credits

| Library | Version | Purpose |
|---|---|---|
| `next` | 14 | App Router, PWA manifest, SSR |
| `react` | 18 | Component rendering |
| `zustand` | latest | Global financial state management |
| `framer-motion` | latest | Animations and transitions |
| `recharts` | latest | Spending and score charts |
| `lucide-react` | latest | Interface icons |
| `tailwindcss` | latest | Utility-first styling |
| `@google/generative-ai` | latest | Gemini AI integration |
| `pg` / `postgres` | latest | PostgreSQL client |

---

## Team / Acknowledgements

BeU NextGen is a hackathon prototype for youth financial wellness built for the **BeU by Bank Islam × UMPSA Hackathon X Fintech Forward 2026**.

> This system uses a live PostgreSQL database for persistence but does not connect to real bank accounts. All balance and transaction data is for demonstration purposes.
