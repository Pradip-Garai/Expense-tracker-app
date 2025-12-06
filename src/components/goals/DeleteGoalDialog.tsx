import { useState } from 'react';
import { goalApi } from '@/db/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Goal } from '@/types';
import { formatCurrency } from '@/utils/format';

interface DeleteGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onDeleted: () => void;
}

export default function DeleteGoalDialog({ open, onOpenChange, goal, onDeleted }: DeleteGoalDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!goal) return;

    setLoading(true);
    try {
      await goalApi.deleteGoal(goal.id);
      toast.success('Goal deleted successfully');
      onDeleted();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this goal?
            {goal && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{goal.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Target: {formatCurrency(Number(goal.target_amount))} • Saved: {formatCurrency(Number(goal.saved_amount))}
                </p>
              </div>
            )}
            <p className="mt-4">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
