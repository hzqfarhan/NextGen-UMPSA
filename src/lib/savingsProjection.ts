export interface SavingsProjection {
  pocketId: string;
  avgDailySavings: number;
  projectedDaysRemaining: number | null;
  projectedDate: Date | null;
}

export function calculateSavingsVelocity(pocketId: string, transactions: any[], current: number, target: number): SavingsProjection {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const recentSavings = transactions.filter(t => 
    t.type === 'saving' && 
    t.pocketId === pocketId &&
    new Date(t.date) >= cutoff
  );

  const totalSaved30Days = recentSavings.reduce((sum, t) => sum + t.amount, 0);
  const avgDailySavings = totalSaved30Days / 30;

  const remaining = target - current;
  
  if (remaining <= 0) {
    return { pocketId, avgDailySavings, projectedDaysRemaining: 0, projectedDate: new Date() };
  }

  if (avgDailySavings <= 0) {
    return { pocketId, avgDailySavings, projectedDaysRemaining: null, projectedDate: null };
  }

  const projectedDaysRemaining = Math.ceil(remaining / avgDailySavings);
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + projectedDaysRemaining);

  return { pocketId, avgDailySavings, projectedDaysRemaining, projectedDate };
}
