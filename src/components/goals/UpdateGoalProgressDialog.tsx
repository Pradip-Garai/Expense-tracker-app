import { useState, useEffect } from 'react';
import { goalApi } from '@/db/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Goal } from '@/types';
import { formatCurrency } from '@/utils/format';

interface UpdateGoalProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onUpdated: () => void;
}

export default function UpdateGoalProgressDialog({
  open,
  onOpenChange,
  goal,
  onUpdated,
}: UpdateGoalProgressDialogProps) {
  const [savedAmount, setSavedAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && goal) {
      setSavedAmount(goal.saved_amount.toString());
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal || !savedAmount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = Number.parseFloat(savedAmount);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const isCompleted = amount >= Number(goal.target_amount);
      await goalApi.updateGoal(goal.id, {
        saved_amount: amount,
        is_completed: isCompleted,
      });

      toast.success(isCompleted ? 'Goal completed! 🎉' : 'Progress updated successfully');
      onUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Goal Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="font-medium">{goal.title}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">{formatCurrency(Number(goal.saved_amount))}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target:</span>
              <span className="font-medium">{formatCurrency(Number(goal.target_amount))}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savedAmount">New Saved Amount (₹) *</Label>
            <Input
              id="savedAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
