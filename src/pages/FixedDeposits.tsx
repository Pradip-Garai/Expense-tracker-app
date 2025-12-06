import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fdDepositApi } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Minus, Edit, Trash2, Landmark, ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { FDDeposit } from '@/types';
import FDDepositDialog from '@/components/fd/FDDepositDialog';
import DeleteFDDepositDialog from '@/components/fd/DeleteFDDepositDialog';

export default function FixedDeposits() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<FDDeposit[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<FDDeposit | null>(null);
  const [deletingDeposit, setDeletingDeposit] = useState<FDDeposit | null>(null);

  useEffect(() => {
    if (user) {
      loadDeposits();
      loadTotalBalance();
    }
  }, [user, page]);

  const loadDeposits = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await fdDepositApi.getDeposits(user.id, page, 20);
      setDeposits(data);
    } catch (error) {
      console.error('Error loading deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalBalance = async () => {
    if (!user) return;

    try {
      const balance = await fdDepositApi.getTotalBalance(user.id);
      setTotalBalance(balance);
    } catch (error) {
      console.error('Error loading total balance:', error);
    }
  };

  const handleDepositSaved = () => {
    loadDeposits();
    loadTotalBalance();
    setShowAddDialog(false);
    setShowWithdrawDialog(false);
    setEditingDeposit(null);
  };

  const handleDepositDeleted = () => {
    loadDeposits();
    loadTotalBalance();
    setDeletingDeposit(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 xl:p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fixed Deposits</h1>
            <p className="text-muted-foreground mt-1">Track your daily FD deposits and balance</p>
          </div>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Total FD Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-12 w-48 bg-muted" />
            ) : (
              <p className="text-4xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deposit History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 bg-muted" />
                      <Skeleton className="h-3 w-32 bg-muted" />
                    </div>
                    <Skeleton className="h-6 w-24 bg-muted" />
                  </div>
                ))}
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No deposits yet</p>
                <p className="text-sm mt-2">Start by adding your first FD deposit</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
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
                          <div>
                            <p className="font-medium">
                              {deposit.description || (deposit.transaction_type === 'deposit' ? 'FD Deposit' : 'FD Withdrawal')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(deposit.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={deposit.transaction_type === 'deposit' ? 'default' : 'destructive'}
                          className={deposit.transaction_type === 'deposit' ? 'bg-success hover:bg-success/90' : ''}
                        >
                          {deposit.transaction_type === 'deposit' ? '+' : '-'}
                          {formatCurrency(Number(deposit.amount))}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingDeposit(deposit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingDeposit(deposit)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={deposits.length < 20}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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

      <FDDepositDialog
        open={showWithdrawDialog}
        onOpenChange={(open) => {
          if (!open) setShowWithdrawDialog(false);
        }}
        transactionType="withdrawal"
        onSaved={handleDepositSaved}
      />

      <DeleteFDDepositDialog
        open={!!deletingDeposit}
        onOpenChange={(open) => {
          if (!open) setDeletingDeposit(null);
        }}
        deposit={deletingDeposit}
        onDeleted={handleDepositDeleted}
      />
    </div>
  );
}
