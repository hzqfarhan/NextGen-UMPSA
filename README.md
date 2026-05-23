# BeU NextGen

AI-powered financial companion for youth money habits.

## Overview

BeU NextGen is a light-mode-first financial wellness app that helps youth spend smarter, save better, and understand money before it becomes a problem.

It is built around one practical question:

> Can I afford this right now without hurting my future self?

## Problem Statement

Students and young adults often see one balance number, then mentally guess what is safe to spend. That hides rent, bills, transport, food, savings goals, and end-of-month pressure inside the same number.

## Our Solution

BeU NextGen separates money into what the user has, what must be protected, and what can be safely spent. The NextGen AI Council then turns risky moments into quick, understandable decisions with local Malaysian youth voice and practical next steps.

## Key Features

- Smart Bill Lock
- Safe Daily Spend
- NextGen Score
- NextGen AI Council
- Malay Dialect Roast & Toast Engine
- Impulse Negotiator
- Future-Me Visualizer
- NextGen Companion
- Savings Missions
- Squad Goals

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Recharts
- lucide-react

## Architecture

- `src/app` contains App Router pages, metadata, manifest, and setup flow.
- `src/components` contains the dashboard, Smart Bill Lock, Cards Hub, Transfer, Pay Scanner, Insights, Savings Missions, and NextGen AI Council UI.
- `src/store/useStore.ts` contains the simulated wallet, financial state, protected commitments, Safe Daily Spend, NextGen Score, bills, savings, and companion mood state.
- `src/lib` contains financial helpers, bill templates, translations, and shared utilities.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:2222`.

## Environment Variables

No required environment variables are needed for the local demo. Optional:

```bash
NEXT_PUBLIC_BASE_PATH=
```

## Demo Flow

1. Complete onboarding with allowance, next allowance date, commitments, and a savings goal.
2. Open the NextGen Command Center to compare Total Balance, Protected Commitments, Spendable Balance, Safe Daily Spend, and NextGen Score.
3. Visit Smart Bill Lock and confirm rent, phone, transport, or PTPTN-related commitments are protected.
4. Use Pay Scanner and choose a risky demo purchase.
5. Watch the NextGen AI Council evaluate risk, show the Impulse Negotiator, generate a local Roast & Toast message, and preview Future-Me impact.
6. Move the purchase into a Cooling-Off Pocket or pay anyway for demo contrast.
7. Add funds to a Savings Mission and watch the companion celebrate progress.

## Libraries & Credits

No new libraries were added during the BeU NextGen migration.

Existing libraries:

- `next` — application framework — https://nextjs.org — used for the App Router PWA structure.
- `react` — UI runtime — https://react.dev — used for component state and rendering.
- `zustand` — local app state — https://zustand-demo.pmnd.rs — used for simulated wallet, commitments, and savings data.
- `framer-motion` — animation — https://www.framer.com/motion — used for polished transitions and demo interactions.
- `recharts` — charts — https://recharts.org — used for spending and score insights.
- `lucide-react` — icons — https://lucide.dev — used for interface iconography.
- `tailwindcss` — styling — https://tailwindcss.com — used for BeU Pulse UI styling.

## Team / Acknowledgements

BeU NextGen is a standalone hackathon-ready prototype for youth financial wellness. It uses simulated data only and does not connect to real bank accounts.
