export interface SpendingAnalysis {
  category: string;
  total: number;
  percentage: number;
  dailyAvg: number;
}

export function analyzeSpending(transactions: any[], days: number = 30): SpendingAnalysis[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recentExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    new Date(t.date) >= cutoff
  );

  const totalSpent = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  
  if (totalSpent === 0) return [];

  const categoryMap: Record<string, number> = {};
  recentExpenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  return Object.keys(categoryMap)
    .map(category => ({
      category,
      total: categoryMap[category],
      percentage: Math.round((categoryMap[category] / totalSpent) * 100),
      dailyAvg: categoryMap[category] / days
    }))
    .sort((a, b) => b.total - a.total);
}

export function detectSubscriptions(transactions: any[]): { name: string; amount: number; frequency: string }[] {
  // Simple heuristic: same title, same amount, occurring more than once in 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  
  const recent = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= cutoff);
  const groups: Record<string, any[]> = {};
  
  recent.forEach(t => {
    const key = `${t.title.trim().toLowerCase()}_${t.amount}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  
  const subscriptions: { name: string; amount: number; frequency: string }[] = [];
  
  Object.values(groups).forEach(group => {
    if (group.length >= 2) {
      // Possible subscription
      subscriptions.push({
        name: group[0].title,
        amount: Math.abs(group[0].amount),
        frequency: group.length >= 3 ? 'Monthly' : 'Recurring'
      });
    }
  });
  
  return subscriptions;
}
