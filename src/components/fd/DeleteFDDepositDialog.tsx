import { useState } from 'react';
import { fdDepositApi } from '@/db/api';
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
import type { FDDeposit } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface DeleteFDDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: FDDeposit | null;
  onDeleted: () => void;
}

export default function DeleteFDDepositDialog({
  open,
  onOpenChange,
  deposit,
  onDeleted,
}: DeleteFDDepositDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deposit) return;

    setLoading(true);
    try {
      await fdDepositApi.deleteDeposit(deposit.id);
      toast.success('Deposit deleted successfully');
      onDeleted();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this deposit?
            {deposit && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{deposit.description || 'FD Deposit'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(Number(deposit.amount))} • {formatDate(deposit.date)}
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
