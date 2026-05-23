# BeU NextGen: Project Description & Product Specification

BeU NextGen is an AI-powered financial wellness platform designed for university students and young adults in Malaysia. Built on top of the Next.js App Router framework, it helps youth spend smarter, save better, and understand money through gamification and localized AI-driven coaching.

---

## 1. Executive Summary & Value Proposition

| Dimension | Details |
| :--- | :--- |
| **Project Name** | **BeU NextGen** |
| **Core Question** | *"Can I afford this right now without hurting my future self?"* |
| **Target Audience** | Malaysian university students and young adults (Gen Z). |
| **Core Problem** | Traditional finance apps present a single total balance. This hides upcoming bills, commitments, and savings goals, leading to mental guesswork and end-of-month financial stress. |
| **The Solution** | BeU NextGen separates money into what the user has, what must be protected (commitments), and what can be safely spent. It leverages gamified streaks, product-linked tiers, and localized AI coaches to build sustainable money habits. |

---

## 2. Core Feature & Mechanics Matrix

This table summarizes the core features of the system, including the current features and the newly proposed gamification additions.

| Feature Area | Component Name | Description & Mechanics | Strategic/Hackathon Value |
| :--- | :--- | :--- | :--- |
| **Financial Guardrails** | **Safe Daily Spend** | Dynamically calculates the exact spendable limit per day based on allowance, days remaining in the cycle, and locked commitments. | Replaces mental budget guesswork with a clear, active daily limit. |
| | **Smart Bill Lock** | Allows users to lock their critical recurring expenses (rent, PTPTN, phone, transport) in automated, protected envelopes. | Protects users from accidentally spending money reserved for essential bills. |
| | **NextGen Score** | A weighted health indicator ($50\%$ Cashflow, $30\%$ Debt/Commitment Health, $20\%$ Savings Progress) that tracks overall financial safety. | Evaluates financial health in real-time instead of just looking at raw balance. |
| **Gamified Discipline (New)** | **TikTok-Style Streaks** | A "Save-Not-Spend" engine. Stays under the *Safe Daily Spend* limit = $+1$ streak day. Overspending resets the streak to 0. | Boosts UI/UX Polish and gamification scores by aligning with daily youth social patterns. |
| | **Visual Dashboard Cues** | Pulsing fire emoji (`🔥 X Days`) next to the cashflow tracker. The BeU Pet companion reacts dynamically (happy on streaks, sad/angry on breakage). | Maximizes evaluation points for intuitive, user-centered UI/UX and micro-animations. |
| | **Zus Coffee-Style Tiers** | A 3-tiered reward system based on streak milestones (Bronze, Silver, Gold) tracked in the global Zustand state. | Demonstrates technical implementation depth beyond superficial mockups. |

---

## 3. Bank Islam Campaign & Real-World Product Integration

To address the **Business Model & Viability (15%)** and **Track Alignment (10%)** hackathon criteria, the system maps user loyalty tiers directly to real-world Bank Islam campaigns and transition strategies.

| Tier Level | Tier Milestone | Actual Bank Islam Product Integration | App Execution & Simulated Rewards |
| :--- | :--- | :--- | :--- |
| **1. Bronze Budgeter** | **Base Level**<br>*(0–6 Day Streak)* | Baseline access to the **4 AI Council Agents** | Default entry level. Standard interaction with savings and expense analysis tools (*Savings Sentinel, Debt Shield, Growth Guru, Finance Strategist*). |
| **2. Silver Saver** | **Maintain 7-Day Streak** | **Be U Awfar Account** & *"Nest"* Savings Pockets | Triggers automated prompts to move daily unspent capital into an *Awfar Nest*. Links to Bank Islam’s **RM15 Million Draw** (Porsche Taycan / BMW i4 prizes) and unlocks localized merchant partner rewards (e.g., **RM5 OFF Grab** or **10% OFF Koppiku**). |
| **3. Gold Guardian** | **Maintain 30-Day Streak** | **Be U Term Deposit-i (TD-i)** / **MaxCash 2026 Campaign** | Unlocks simulated access to the premium **BeU MaxCash Hybrid Engine**. Calculates optimization metrics for placing RM1,000 of idle cash into fixed returns and applies a premium compound rate modifier (boosting from $6.5\%$ to $7.0\%$ p.a.) to Growth Starter pockets. |

---

## 4. Viral Social Campaign: `#MisiBIMBTransition`

Given Bank Islam's transition of Be U into the main BIMB Mobile app by **July 31, 2026**, this feature addresses user retention and customer acquisition during this migration.

| Campaign Component | Operational Action Workflow | Business & Structural Value |
| :--- | :--- | :--- |
| **The Macro Hook** | Capture the major event of Be U app decommissioning on July 31, 2026, transitioning users smoothly to the main BIMB Mobile app. | Proves Business Model & Viability by actively retaining youth users through the real-world platform transition phase. |
| **The Trend Theme** | **"Graduation From Broke"** / **`#MisiBIMBTransition`** Challenge (Inspired by the real Be U Savings Streak `#MisiPuasaRaya` challenge). | Speaks directly to the judges' focus on localized, youth-centered social challenges. |
| **"Share My Roast" Button** | Placed in the **Pay Scanner** (`/scan`) and **AI Coach** (`/coach`) panels. Exports a hilariously savage Malay/Manglish financial de-influencing roast. | Converts witty, localized app content into an organic, loop-based viral customer acquisition tool. |
| **Canvas Generation** | Programmatically compiles a mobile-friendly graphic containing the current BeU Pet asset, the custom AI roast text, user streak data, and an application download QR code. | Leverages the hosting environment to dynamically serve real-time download targets. |
| **The Virality Incentive** | Sharing the generated "Financial Passport" graphic grants the user a **24-hour "Streak Shield"** (protects streak from breaking for one day) + a simulated **RM10 Referral Bonus** loop. | Matches Bank Islam’s real-world referral strategy to create realistic customer retention loops. |

---

## 5. Technical Blueprint & Product Requirements Document (PRD)

### 5.1 Functional Requirements (FR)

| Requirement ID | Technical Module | Functional Specification (What It Must Do) |
| :--- | :--- | :--- |
| **SR-1.1** | **Streak Tracking** | Must monitor daily discretionary transaction inputs against the calculated *Safe Daily Spend* threshold. |
| **SR-1.2** | **Increment Logic** | At 11:59 PM (simulated), if total daily expenditure $\le$ *Safe Daily Spend*, the global state variable `currentStreak` increments by $+1$. |
| **SR-1.3** | **Reset Logic** | If daily spend exceeds *Safe Daily Spend*, `currentStreak` drops to 0. Updates pet companion state to sad or angry. |
| **SR-1.4** | **Streak Shield** | Provides an interface once a week to consume a "Streak Shield" earned via social media sharing to prevent status decay. |
| **SR-2.1** | **Tier Computation** | Evaluates user loyalty tiers dynamically (`Bronze` $\to$ `Silver` $\to$ `Gold`) inside the state engine backend whenever store states update. |
| **SR-3.1** | **Roast Export** | Renders a high-visibility canvas export action button immediately after the local dialect generation sequence completes in the AI Coach or Scanner. |
| **SR-3.2** | **Referral Loop** | QR code targets must accept inbound parameters during onboarding (`/setup`), triggering a dual credit configuration hook (simulating the RM10 reward). |

### 5.2 Technical & Data Requirements

| Layer | System Target | Implementation Specification (How It Works Under the Hood) |
| :--- | :--- | :--- |
| **Zustand State** | **`useStore.ts` Extension** | Extend global TypeScript interfaces to track: `currentStreak: number`, `highestStreak: number`, `lastCalculatedDate: string` (to avoid double-calculation), `membershipTier: 'Bronze' \| 'Silver' \| 'Gold'`, `streakShieldActive: boolean`, `awfarDrawTickets: number`, and `isBimbMigrated: boolean`. |
| **Data Sync** | **Local & Cloud Sync** | Support persistent local state sync (via Zustand middleware) and define a mock sync schema (`POST /api/user/sync`) to commit streak datasets. |
| **Security Layer** | **API Key Orchestration** | Ensure sensitive keys (`GEMINI_API_KEY`) are accessed via server-side routing endpoints/proxies rather than exposed in client-side bundles. |

### 5.3 UI/UX & Visual Requirements

| UI Element | Animation Framework | Visual Specification |
| :--- | :--- | :--- |
| **Streak Tracker** | **Tailwind CSS / Framer Motion** | Highly visible, pulsing fire emoji component directly embedded inside the main interactive command dashboard view (`🔥 X Days`). |
| **Tier Status Change** | **Framer Motion** | Fullscreen, celebratory card flip animation detailing the unlocked Bank Islam product integrations when user graduates to a new tier. |
| **BeU Pet Reactions** | **Framer Motion / CSS Sprites** | Intercepts state changes immediately: triggers excited/cheering animation loops on successful daily closures, and think states when computing yields. |

---

## 6. Pitch Positioning Strategy for Judges

Wafi, Akmal, Paan, and Ibad can present the gamified expansion during evaluation using this positioning framework:

| Pitch Angle | What Traditional Teams Will Say | What BeU NextGen Proves to Bank Islam Executives |
| :--- | :--- | :--- |
| **User Retention** | *"We built an app to teach students how to save money through generic data charts."* | *"Our streak engine turns the stressful July 31st app migration phase into a gamified milestone loop, moving youth user balances data-ready directly into BIMB Mobile before the shutdown deadline."* |
| **Product Value** | *"We show links to basic financial products that users can read about."* | *"We seamlessly cross-sell high-value institutional ecosystems (Be U Awfar Nest prize draws & Term Deposit-i accounts) by making asset locks a direct perk of gamified lifestyle achievements."* |
