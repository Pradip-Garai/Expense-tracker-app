import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { goalApi } from '@/db/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Goal } from '@/types';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onSaved: () => void;
}

export default function GoalDialog({ open, onOpenChange, goal, onSaved }: GoalDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (goal) {
        setTitle(goal.title);
        setTargetAmount(goal.target_amount.toString());
        setDeadline(goal.deadline || '');
      } else {
        resetForm();
      }
    }
  }, [open, goal]);

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setDeadline('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !title || !targetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = Number.parseFloat(targetAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        user_id: user.id,
        title,
        target_amount: amount,
        deadline: deadline || null,
      };

      if (goal) {
        await goalApi.updateGoal(goal.id, goalData);
        toast.success('Goal updated successfully');
      } else {
        await goalApi.createGoal(goalData);
        toast.success('Goal created successfully');
      }

      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Emergency Fund, Vacation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (₹) *</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : goal ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
