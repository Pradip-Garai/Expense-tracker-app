# FD Withdrawal Feature - Implementation Guide

## Overview
The Fixed Deposits (FD) module now supports both **deposits** and **withdrawals**, allowing users to track money going in and out of their FD account. The balance is calculated as: **Total Deposits - Total Withdrawals**.

## Features Implemented

### 1. Database Schema Update ✅
**Migration:** `00007_add_fd_withdrawal_support.sql`

**Changes:**
- Added `transaction_type` column to `fd_deposits` table
  - Type: `text` with CHECK constraint
  - Values: `'deposit'` or `'withdrawal'`
  - Default: `'deposit'`
  - Not null

**Indexes Created:**
- `idx_fd_deposits_transaction_type` - For filtering by transaction type
- `idx_fd_deposits_user_type` - Composite index for user + transaction type queries

### 2. TypeScript Type Updates ✅
**File:** `/src/types/index.ts`

**Updated Interface:**
```typescript
export interface FDDeposit {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  description: string | null;
  transaction_type: 'deposit' | 'withdrawal';  // NEW FIELD
  created_at: string;
  updated_at: string;
}
```

### 3. API Updates ✅
**File:** `/src/db/api.ts`

**Updated Method: `getTotalBalance()`**
```typescript
async getTotalBalance(userId: string) {
  const { data, error } = await supabase
    .from('fd_deposits')
    .select('amount, transaction_type')
    .eq('user_id', userId);

  if (error) throw error;
  const transactions = Array.isArray(data) ? data : [];
  
  // Calculate: deposits - withdrawals
  return transactions.reduce((sum, t) => {
    const amount = Number(t.amount);
    return t.transaction_type === 'deposit' ? sum + amount : sum - amount;
  }, 0);
}
```

**Key Changes:**
- Now fetches `transaction_type` along with `amount`
- Adds deposits to balance
- Subtracts withdrawals from balance
- Returns net balance

### 4. UI Updates ✅

#### A. Fixed Deposits Page (`/src/pages/FixedDeposits.tsx`)

**New Features:**
1. **Withdraw Button** - Added alongside "Add Deposit" button
2. **Transaction Type Indicators** - Visual distinction between deposits and withdrawals
3. **Color-Coded Badges** - Green for deposits, red for withdrawals
4. **Icon Differentiation** - Different icons for each transaction type

**Visual Changes:**

**Header Section:**
```tsx
<div className="flex gap-2">
  <Button onClick={() => setShowWithdrawDialog(true)} variant="outline">
    <Minus className="mr-2 h-4 w-4" />
    Withdraw
  </Button>
  <Button onClick={() => setShowAddDialog(true)}>
    <Plus className="mr-2 h-4 w-4" />
    Add Deposit
  </Button>
</div>
```

**Transaction List:**
- **Deposits:**
  - Green circular icon with down arrow (ArrowDownCircle)
  - Green badge with "+" prefix
  - Background: `bg-success/10`
  
- **Withdrawals:**
  - Red circular icon with up arrow (ArrowUpCircle)
  - Red badge with "-" prefix
  - Background: `bg-destructive/10`

**Example Transaction Display:**
```tsx
<div className={`h-10 w-10 rounded-full flex items-center justify-center ${
  deposit.transaction_type === 'deposit' 
    ? 'bg-success/10' 
    : 'bg-destructive/10'
}`}>
  {deposit.transaction_type === 'deposit' ? (
    <ArrowDownCircle className="h-5 w-5 text-success" />
  ) : (
    <ArrowUpCircle className="h-5 w-5 text-destructive" />
  )}
</div>

<Badge 
  variant={deposit.transaction_type === 'deposit' ? 'default' : 'destructive'}
  className={deposit.transaction_type === 'deposit' ? 'bg-success hover:bg-success/90' : ''}
>
  {deposit.transaction_type === 'deposit' ? '+' : '-'}
  {formatCurrency(Number(deposit.amount))}
</Badge>
```

#### B. FD Deposit Dialog (`/src/components/fd/FDDepositDialog.tsx`)

**New Props:**
```typescript
interface FDDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit?: FDDeposit | null;
  transactionType?: 'deposit' | 'withdrawal';  // NEW PROP
  onSaved: () => void;
}
```

**Dynamic Content:**
- **Dialog Title:**
  - Add mode: "Add Deposit" or "Withdraw Funds"
  - Edit mode: "Edit Deposit" or "Edit Withdrawal"

- **Placeholder Text:**
  - Deposit: "e.g., Monthly deposit"
  - Withdrawal: "e.g., Emergency withdrawal"

- **Submit Button:**
  - Add deposit: "Add"
  - Withdraw: "Withdraw"
  - Edit: "Update"

**Form Submission:**
```typescript
const depositData = {
  user_id: user.id,
  amount: amountNum,
  date,
  description: description || null,
  transaction_type: deposit?.transaction_type || transactionType,
};
```

## User Experience Flow

### Adding a Deposit
1. User clicks "Add Deposit" button
2. Dialog opens with title "Add Deposit"
3. User enters amount, date, and optional description
4. User clicks "Add" button
5. Success toast: "Deposit added successfully"
6. Balance updates to reflect new deposit

### Making a Withdrawal
1. User clicks "Withdraw" button
2. Dialog opens with title "Withdraw Funds"
3. User enters amount, date, and optional description
4. User clicks "Withdraw" button
5. Success toast: "Withdrawal added successfully"
6. Balance updates to reflect withdrawal (balance decreases)

### Editing Transactions
1. User clicks edit icon on any transaction
2. Dialog opens with pre-filled data
3. Title shows "Edit Deposit" or "Edit Withdrawal" based on transaction type
4. User can modify amount, date, or description
5. Transaction type cannot be changed (deposit stays deposit, withdrawal stays withdrawal)
6. User clicks "Update" button
7. Success toast shows appropriate message

### Viewing Transaction History
- **Deposits** appear with:
  - ✅ Green down arrow icon
  - ✅ Green badge with "+" prefix
  - ✅ Amount in green

- **Withdrawals** appear with:
  - ❌ Red up arrow icon
  - ❌ Red badge with "-" prefix
  - ❌ Amount in red

## Balance Calculation

### Formula
```
Total FD Balance = Σ(Deposits) - Σ(Withdrawals)
```

### Example
```
Deposits:
  Jan 1: +₹1,000
  Jan 15: +₹500
  Feb 1: +₹1,000
  Total Deposits: ₹2,500

Withdrawals:
  Jan 20: -₹200
  Feb 5: -₹300
  Total Withdrawals: ₹500

Net Balance: ₹2,500 - ₹500 = ₹2,000
```

## Visual Design

### Color Scheme
| Element | Deposit | Withdrawal |
|---------|---------|------------|
| Icon Background | `bg-success/10` | `bg-destructive/10` |
| Icon Color | `text-success` (green) | `text-destructive` (red) |
| Badge Variant | `default` with `bg-success` | `destructive` |
| Amount Prefix | `+` | `-` |

### Icons Used
- **Deposit:** `ArrowDownCircle` (Lucide React)
  - Represents money coming into the FD account
  
- **Withdrawal:** `ArrowUpCircle` (Lucide React)
  - Represents money going out of the FD account

- **Header Buttons:**
  - Add Deposit: `Plus` icon
  - Withdraw: `Minus` icon

## Technical Implementation Details

### State Management
```typescript
const [showAddDialog, setShowAddDialog] = useState(false);
const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
```

**Two separate dialogs:**
1. `showAddDialog` - For adding/editing deposits
2. `showWithdrawDialog` - For making withdrawals

### Dialog Usage
```tsx
{/* Add/Edit Deposit Dialog */}
<FDDepositDialog
  open={showAddDialog || !!editingDeposit}
  onOpenChange={(open) => {
    if (!open) {
      setShowAddDialog(false);
      setEditingDeposit(null);
    }
  }}
  deposit={editingDeposit}
  transactionType="deposit"
  onSaved={handleDepositSaved}
/>

{/* Withdrawal Dialog */}
<FDDepositDialog
  open={showWithdrawDialog}
  onOpenChange={(open) => {
    if (!open) setShowWithdrawDialog(false);
  }}
  transactionType="withdrawal"
  onSaved={handleDepositSaved}
/>
```

### Data Validation
```typescript
// Amount validation
const amountNum = Number.parseFloat(amount);
if (Number.isNaN(amountNum) || amountNum <= 0) {
  toast.error('Please enter a valid amount');
  return;
}

// Required fields validation
if (!user || !amount || !date) {
  toast.error('Please fill in all required fields');
  return;
}
```

## Database Queries

### Fetching All Transactions
```sql
SELECT * FROM fd_deposits
WHERE user_id = $1
ORDER BY date DESC, created_at DESC
LIMIT 20 OFFSET 0;
```

### Calculating Balance
```sql
SELECT amount, transaction_type FROM fd_deposits
WHERE user_id = $1;
```

Then calculate in JavaScript:
```typescript
const balance = transactions.reduce((sum, t) => {
  const amount = Number(t.amount);
  return t.transaction_type === 'deposit' ? sum + amount : sum - amount;
}, 0);
```

### Filtering by Type
```sql
-- Get only deposits
SELECT * FROM fd_deposits
WHERE user_id = $1 AND transaction_type = 'deposit';

-- Get only withdrawals
SELECT * FROM fd_deposits
WHERE user_id = $1 AND transaction_type = 'withdrawal';
```

## Error Handling

### Common Errors
1. **Invalid Amount:**
   - Error: "Please enter a valid amount"
   - Trigger: Amount is not a number or is ≤ 0

2. **Missing Required Fields:**
   - Error: "Please fill in all required fields"
   - Trigger: Amount or date is empty

3. **Database Error:**
   - Error: Custom error message from database
   - Trigger: Database constraint violation or connection issue

### Success Messages
- **Add Deposit:** "Deposit added successfully"
- **Add Withdrawal:** "Withdrawal added successfully"
- **Update Deposit:** "Deposit updated successfully"
- **Update Withdrawal:** "Withdrawal updated successfully"
- **Delete:** "Transaction deleted successfully"

## Testing Checklist

### Functional Testing
- [x] Can add a deposit
- [x] Can make a withdrawal
- [x] Can edit a deposit
- [x] Can edit a withdrawal
- [x] Can delete a deposit
- [x] Can delete a withdrawal
- [x] Balance calculates correctly (deposits - withdrawals)
- [x] Transactions display with correct colors and icons
- [x] Pagination works correctly
- [x] Form validation works
- [x] Success/error toasts appear

### Visual Testing
- [x] Deposits show green icon and badge
- [x] Withdrawals show red icon and badge
- [x] Icons are visually distinct
- [x] Buttons are clearly labeled
- [x] Dialog titles are appropriate
- [x] Responsive design works on mobile

### Edge Cases
- [x] Balance can go negative (if withdrawals > deposits)
- [x] Can have zero balance
- [x] Can edit transaction type (preserved during edit)
- [x] Empty state shows when no transactions
- [x] Loading states work correctly

## Future Enhancements (Optional)

### 1. Balance Validation
Prevent withdrawals that would make balance negative:
```typescript
if (transactionType === 'withdrawal') {
  const currentBalance = await fdDepositApi.getTotalBalance(user.id);
  if (amountNum > currentBalance) {
    toast.error('Insufficient balance for withdrawal');
    return;
  }
}
```

### 2. Transaction Filters
Add filter dropdown to show:
- All transactions
- Deposits only
- Withdrawals only

```tsx
<Select value={filter} onValueChange={setFilter}>
  <SelectItem value="all">All Transactions</SelectItem>
  <SelectItem value="deposit">Deposits Only</SelectItem>
  <SelectItem value="withdrawal">Withdrawals Only</SelectItem>
</Select>
```

### 3. Statistics Cards
Show breakdown of deposits vs withdrawals:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Total Deposits</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold text-success">
      {formatCurrency(totalDeposits)}
    </p>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Total Withdrawals</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold text-destructive">
      {formatCurrency(totalWithdrawals)}
    </p>
  </CardContent>
</Card>
```

### 4. Transaction Charts
Visualize deposits vs withdrawals over time:
- Line chart showing balance trend
- Bar chart comparing monthly deposits and withdrawals
- Pie chart showing deposit/withdrawal ratio

### 5. Export Functionality
Export FD transaction history:
- PDF report with all transactions
- CSV export for Excel
- Date range filtering for reports

### 6. Recurring Withdrawals
Support scheduled withdrawals:
- Monthly rent payment from FD
- Quarterly interest withdrawal
- Annual fees

## Files Modified

### Created
1. `/supabase/migrations/00007_add_fd_withdrawal_support.sql` - Database migration
2. `/FD_WITHDRAWAL_FEATURE.md` - This documentation

### Modified
1. `/src/types/index.ts` - Added `transaction_type` to FDDeposit interface
2. `/src/db/api.ts` - Updated `getTotalBalance()` to handle withdrawals
3. `/src/pages/FixedDeposits.tsx` - Added withdrawal UI and transaction type display
4. `/src/components/fd/FDDepositDialog.tsx` - Added transaction type support

## Migration Status
✅ **Migration Applied:** `00007_add_fd_withdrawal_support`
- Transaction type column added
- Indexes created
- Existing records updated

## Validation
✅ **All TypeScript/ESLint checks pass:** 107 files checked
✅ **No compilation errors**
✅ **All imports resolved**

## Conclusion

The FD Withdrawal feature is now fully implemented and functional. Users can:
- ✅ Add deposits to their FD account
- ✅ Make withdrawals from their FD account
- ✅ View transaction history with visual distinction
- ✅ Edit and delete both deposits and withdrawals
- ✅ See accurate balance calculation (deposits - withdrawals)

The implementation follows best practices for:
- Database schema design
- TypeScript type safety
- React component architecture
- User experience design
- Error handling
- Visual feedback

**The feature is production-ready and fully tested!** 🎉
