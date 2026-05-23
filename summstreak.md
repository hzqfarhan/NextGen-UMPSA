# ⚡ NextGen Saving Streak System

The **NextGen Saving Streak System** is a core gamification engine designed to reward positive financial habits in youth. It incentivizes staying within daily limits and saving consistently through interactive milestones, streak levels, streak shields, and tiered rewards.

---

## 🧭 Core Concept & Rules

The streak system revolves around the **Safe Daily Spend Limit** ($S_{limit}$).
- **The Daily Rule**: A user maintaining their spending at or below their calculated daily quota gets a **+1 day streak** at the end of the day.
- **Overspending Penalty**: If the user's spending exceeds their daily quota, their streak immediately **resets to 0**, unless protected by a shield.
- **Streak Shield**: A consumable defensive item that protects the streak from a single overspending event.

---

## 🛠️ Architecture & State Management

The entire streak system is built inside a unified, persisted store using **Zustand** (`src/store/useStore.ts`) with custom actions and local storage persistence.

### 1. State Variables
```typescript
interface NextGenState {
  currentStreak: number;          // Current consecutive days within budget
  highestStreak: number;          // Historical record high streak
  membershipTier: 'Bronze' | 'Silver' | 'Gold'; // Dynamically updated tier
  streakShieldActive: boolean;    // Flag indicating active streak shield
  lastCalculatedDate: string;     // Prevents double-processing on same calendar date
}
```

### 2. Tier Progression Milestones
The system evaluates the user's current streak count to assign a membership level:
- **Bronze Budgeter (Novice)**: `0 - 6 Days`
- **Silver Saver (Pro)**: `7 - 29 Days`
- **Gold Guardian (Legend)**: `30+ Days`

---

## ⚙️ Core Logic Implementation

### 1. Simulating a Next Day (`simulateNextDay()`)
When the user advances the timeline, the system compares daily transactions against the daily limit to determine the streak outcome:

```typescript
// Fetch expenses logged on the simulated day
const todayExpenses = state.transactions
  .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
  .reduce((sum, t) => sum + t.amount, 0);

const limit = state.safeDailySpend;
let streakUpdated = state.currentStreak;
let shieldActive = state.streakShieldActive;

if (todayExpenses <= limit) {
  // SUCCESS: Streak Increments
  streakUpdated += 1;
  petMessage = `Awesome! You stayed under your Safe Daily Spend limit. Your saving streak is now ${streakUpdated} days! 🔥`;
} else {
  // FAILURE: Overspent
  if (shieldActive) {
    // Protected by Streak Shield
    shieldActive = false; // Consumes the shield
    petMessage = `You overspent today, but your Streak Shield protected your streak of ${streakUpdated} days! 🛡️`;
  } else {
    // Streak Resets
    streakUpdated = 0;
    petMessage = `Oh no! You overspent today. Your streak has reset to 0. 😿`;
  }
}
```

### 2. Consuming & Buying a Shield (`activateStreakShield()`)
Users can purchase or earn **Streak Shields** to safeguard their streaks:
- Sets `streakShieldActive: true`.
- Instantly notifies the user via the virtual pet companion.

---

## 🎨 Visual Design & UI Features

The streak system is highly visible on the dashboard, making it an engaging and core mechanic of the experience:

### 1. Dynamic Streak GIF Mascot Glow
A dynamic streak tracker in `Dashboard.tsx` features a hot-spot streak animation (`/assets/API-streak.gif`) that changes color and aura intensity depending on the current milestone using Tailwind CSS filters:
- **Bronze (Streak < 7)**: Vibrant Orange aura
  ```css
  filter: hue-rotate(15deg) saturate(2.5) drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))
  ```
- **Silver (Streak 7 - 29)**: Futuristic Blue aura
  ```css
  filter: hue-rotate(200deg) saturate(2.2) drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))
  ```
- **Gold (Streak 30+)**: Celestial Purple & Bright Gold spark aura
  ```css
  filter: hue-rotate(280deg) saturate(2.5) brightness(1.1) drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))
  ```

### 2. Dashboard Integration
- **Badge Indicators**: Displays `🛡️ Shield Active` when protected, and shows corresponding tier levels (`🥉 Novice`, `🥈 Pro`, `🏆 Legend`).
- **Interactive Simulations**: Features the **"Simulate Next Day"** button to advance the timeline instantly and test habit rules.

---

## 🎁 Tier Rewards & Yield Boost Integration

Unlocked milestones provide tangible financial gains inside the app's banking ecosystem:
1. **Silver Saver Perks**:
   - Accesses high-yield mock investment channels like **Be U Awfar Nest**.
   - Merchant perk discounts.
2. **Gold Guardian Perks**:
   - **Boosted Savings Returns**: Unlocks a **+0.5% interest yield boost** on growth pockets (`simulateGrowth()` automatically appends this return premium if `membershipTier === 'Gold'`).
   - Special merchant rewards.
