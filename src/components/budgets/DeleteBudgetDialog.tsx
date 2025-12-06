import { useState } from 'react';
import { budgetApi } from '@/db/api';
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
import type { BudgetWithCategory } from '@/types';
import { formatCurrency } from '@/utils/format';

interface DeleteBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetWithCategory | null;
  onDeleted: () => void;
}

export default function DeleteBudgetDialog({
  open,
  onOpenChange,
  budget,
  onDeleted,
}: DeleteBudgetDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!budget) return;

    setLoading(true);
    try {
      await budgetApi.deleteBudget(budget.id);
      toast.success('Budget deleted successfully');
      onDeleted();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this budget?
            {budget && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <span>{budget.category.icon}</span>
                  <span>{budget.category.name}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Budget: {formatCurrency(Number(budget.amount))}
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
