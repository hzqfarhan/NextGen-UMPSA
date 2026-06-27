export interface BillStatus {
  bill: any;
  daysUntilDue: number;
  status: 'urgent' | 'upcoming' | 'safe';
}

export function analyzeBills(bills: any[]): BillStatus[] {
  const today = new Date();
  
  return bills.map(bill => {
    // Assuming bill.dueDate is ISO string or we can use a standard approach
    // If bill uses a "day of month" format, we calculate next occurrence
    let dueDate = new Date(bill.dueDate);
    
    // Fallback if dueDate is just a day number
    if (isNaN(dueDate.getTime()) && typeof bill.dueDate === 'number') {
      dueDate = new Date();
      dueDate.setDate(bill.dueDate);
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
    } else if (isNaN(dueDate.getTime())) {
      // safe fallback
      dueDate = new Date();
      dueDate.setDate(today.getDate() + 15);
    }

    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status: 'urgent' | 'upcoming' | 'safe' = 'safe';
    if (diffDays <= 3) status = 'urgent';
    else if (diffDays <= 7) status = 'upcoming';

    return { bill, daysUntilDue: diffDays, status };
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export function checkBillCoverage(balance: number, bills: BillStatus[]): { canCover: boolean, amountNeeded: number, deficit: number } {
  const upcomingBills = bills.filter(b => b.status === 'urgent' || b.status === 'upcoming');
  const amountNeeded = upcomingBills.reduce((sum, b) => sum + (b.bill.amount || 0), 0);
  
  return {
    canCover: balance >= amountNeeded,
    amountNeeded,
    deficit: amountNeeded > balance ? amountNeeded - balance : 0
  };
}
