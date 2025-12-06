import { useState } from 'react';
import { transactionApi } from '@/db/api';
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
import type { TransactionWithCategory } from '@/types';
import { formatCurrency } from '@/utils/format';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionWithCategory | null;
  onDeleted: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  transaction,
  onDeleted,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!transaction) return;

    setLoading(true);
    try {
      await transactionApi.deleteTransaction(transaction.id);
      toast.success('Transaction deleted successfully');
      onDeleted();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction?
            {transaction && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(transaction.amount)} • {transaction.category.name}
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
