/*
# Add FD Withdrawal Support

## Changes
1. Add transaction_type column to fd_deposits table
   - Type: text with CHECK constraint
   - Values: 'deposit' or 'withdrawal'
   - Default: 'deposit'
   - Not null

2. Update existing records to have 'deposit' type

3. Add index for transaction_type queries

## Notes
- Existing deposits will be marked as 'deposit' type
- Withdrawals will reduce the FD balance
- Both deposits and withdrawals are tracked in the same table
*/

-- Add transaction_type column
ALTER TABLE fd_deposits 
ADD COLUMN IF NOT EXISTS transaction_type text NOT NULL DEFAULT 'deposit' 
CHECK (transaction_type IN ('deposit', 'withdrawal'));

-- Update existing records (if any) to be deposits
UPDATE fd_deposits SET transaction_type = 'deposit' WHERE transaction_type IS NULL;

-- Add index for transaction_type queries
CREATE INDEX IF NOT EXISTS idx_fd_deposits_transaction_type ON fd_deposits(transaction_type);

-- Add composite index for user_id and transaction_type
CREATE INDEX IF NOT EXISTS idx_fd_deposits_user_type ON fd_deposits(user_id, transaction_type);
