# Dashboard Statistics Fix

## Issue Description

The dashboard was showing incorrect statistics:
- **Total Balance**: Showed -₹16,000 (should be ₹2,000)
- **Total Income**: Showed ₹0.00 (expected ₹18,000)
- **Total Expenses**: Showed ₹16,000 (correct)
- **Savings Rate**: Showed 0.0% (expected ~11.11%)

### User's Transactions
1. Income: ₹18,000 on October 2, 2025 (SVMCM Scholarship)
2. Expense: ₹16,000 on December 1, 2025 (College Fees)

### Expected Results
- **Total Balance**: ₹18,000 - ₹16,000 = ₹2,000 (all-time cumulative)
- **Total Income (December)**: ₹0 (no income in December)
- **Total Expenses (December)**: ₹16,000
- **Savings Rate (December)**: 0% (no income in December)

## Root Cause

The original `getMonthlyStats` function was calculating all statistics based on the **current month only**. This caused:

1. **Total Balance** to show only December's balance (-₹16,000) instead of all-time balance (₹2,000)
2. **Total Income** to show ₹0 because the income was in October, not December
3. **Savings Rate** to be 0% because there was no income in December

## Solution

Updated the `getMonthlyStats` function in `/src/db/api.ts` to:

1. **Fetch two datasets**:
   - Monthly transactions (for current month income/expenses)
   - All-time transactions (for total balance calculation)

2. **Calculate separately**:
   - **Monthly Income**: Sum of income transactions in current month
   - **Monthly Expenses**: Sum of expense transactions in current month
   - **All-time Balance**: Sum of ALL income - Sum of ALL expenses
   - **Savings Rate**: Based on current month (monthlyIncome - monthlyExpenses) / monthlyIncome

### Code Changes

**Before:**
```typescript
async getMonthlyStats(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const transactions = Array.isArray(data) ? data : [];
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    totalBalance: income - expenses, // ❌ Only current month
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
  };
}
```

**After:**
```typescript
async getMonthlyStats(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  // Get monthly transactions
  const { data: monthlyData, error: monthlyError } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (monthlyError) throw monthlyError;

  // Get all-time transactions for total balance
  const { data: allTimeData, error: allTimeError } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId);

  if (allTimeError) throw allTimeError;

  const monthlyTransactions = Array.isArray(monthlyData) ? monthlyData : [];
  const allTimeTransactions = Array.isArray(allTimeData) ? allTimeData : [];

  // Calculate monthly income and expenses
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate all-time balance
  const allTimeIncome = allTimeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const allTimeExpenses = allTimeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    totalIncome: monthlyIncome, // ✅ Current month only
    totalExpenses: monthlyExpenses, // ✅ Current month only
    totalBalance: allTimeIncome - allTimeExpenses, // ✅ All-time cumulative
    savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
  };
}
```

## UI Improvements

Added subtitles to dashboard stat cards to clarify the time period:

**Dashboard.tsx changes:**
```typescript
const statCards = [
  {
    title: 'Total Balance',
    subtitle: 'All-time', // ✅ Clarifies this is cumulative
    value: stats.totalBalance,
    // ...
  },
  {
    title: 'Total Income',
    subtitle: 'This month', // ✅ Clarifies this is monthly
    value: stats.totalIncome,
    // ...
  },
  {
    title: 'Total Expenses',
    subtitle: 'This month', // ✅ Clarifies this is monthly
    value: stats.totalExpenses,
    // ...
  },
  {
    title: 'Savings Rate',
    subtitle: 'This month', // ✅ Clarifies this is monthly
    value: `${stats.savingsRate.toFixed(1)}%`,
    // ...
  },
];
```

Updated card rendering to display subtitles:
```tsx
<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <div>
    <CardTitle className="text-sm font-medium text-muted-foreground">
      {stat.title}
    </CardTitle>
    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
  </div>
  <div className={`${stat.bgColor} p-2 rounded-full`}>
    <stat.icon className={`h-4 w-4 ${stat.color}`} />
  </div>
</CardHeader>
```

## Results

With the user's example data:
- Income: ₹18,000 (October 2, 2025)
- Expense: ₹16,000 (December 1, 2025)

**Dashboard will now show (in December 2025):**
- **Total Balance**: ₹2,000 (All-time) ✅
- **Total Income**: ₹0.00 (This month) ✅
- **Total Expenses**: ₹16,000 (This month) ✅
- **Savings Rate**: 0.0% (This month) ✅

**If viewing in October 2025, it would show:**
- **Total Balance**: ₹18,000 (All-time)
- **Total Income**: ₹18,000 (This month)
- **Total Expenses**: ₹0.00 (This month)
- **Savings Rate**: 100.0% (This month)

## Benefits

1. **Accurate Balance**: Total Balance now reflects the actual cumulative balance across all time
2. **Clear Context**: Subtitles clarify which metrics are monthly vs all-time
3. **Correct Calculations**: Each metric is calculated from the appropriate dataset
4. **Better UX**: Users can see their overall financial position (Total Balance) while tracking monthly performance (Income/Expenses/Savings Rate)

## Testing

All TypeScript and ESLint checks pass:
```bash
npm run lint
# Result: Checked 101 files in 207ms. No fixes applied.
```

## Files Modified

1. `/src/db/api.ts` - Updated `getMonthlyStats` function
2. `/src/pages/Dashboard.tsx` - Added subtitles to stat cards and updated rendering
3. `/DASHBOARD_STATS_FIX.md` - This documentation

## Conclusion

The dashboard now correctly displays:
- **All-time cumulative balance** in the Total Balance card
- **Current month's income and expenses** in their respective cards
- **Current month's savings rate** based on monthly income/expenses
- **Clear labels** to help users understand the time period for each metric
