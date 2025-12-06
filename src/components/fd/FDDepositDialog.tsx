import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fdDepositApi } from '@/db/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { FDDeposit } from '@/types';

interface FDDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit?: FDDeposit | null;
  transactionType?: 'deposit' | 'withdrawal';
  onSaved: () => void;
}

export default function FDDepositDialog({ 
  open, 
  onOpenChange, 
  deposit, 
  transactionType = 'deposit',
  onSaved 
}: FDDepositDialogProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (deposit) {
        setAmount(deposit.amount.toString());
        setDate(deposit.date);
        setDescription(deposit.description || '');
      } else {
        resetForm();
      }
    }
  }, [open, deposit]);

  const resetForm = () => {
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !amount || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = Number.parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const depositData = {
        user_id: user.id,
        amount: amountNum,
        date,
        description: description || null,
        transaction_type: deposit?.transaction_type || transactionType,
      };

      if (deposit) {
        await fdDepositApi.updateDeposit(deposit.id, depositData);
        toast.success(`${deposit.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'} updated successfully`);
      } else {
        await fdDepositApi.createDeposit(depositData);
        toast.success(`${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} added successfully`);
      }

      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || `Failed to save ${transactionType}`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (deposit) {
      return deposit.transaction_type === 'deposit' ? 'Edit Deposit' : 'Edit Withdrawal';
    }
    return transactionType === 'deposit' ? 'Add Deposit' : 'Withdraw Funds';
  };

  const getPlaceholder = () => {
    if (deposit) {
      return deposit.transaction_type === 'deposit' ? 'e.g., Monthly deposit' : 'e.g., Emergency withdrawal';
    }
    return transactionType === 'deposit' ? 'e.g., Monthly deposit' : 'e.g., Emergency withdrawal';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder={getPlaceholder()}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : deposit ? 'Update' : transactionType === 'deposit' ? 'Add' : 'Withdraw'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
