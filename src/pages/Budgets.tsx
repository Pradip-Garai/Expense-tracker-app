import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { budgetApi, categoryApi } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getCurrentMonth, getCurrentYear, getMonthName } from '@/utils/format';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import type { BudgetWithCategory } from '@/types';
import BudgetDialog from '@/components/budgets/BudgetDialog';
import DeleteBudgetDialog from '@/components/budgets/DeleteBudgetDialog';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<BudgetWithCategory | null>(null);

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user, year, month]);

  const loadBudgets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await budgetApi.getBudgets(user.id, year, month);
      setBudgets(data);

      for (const budget of data) {
        await budgetApi.updateBudgetSpent(user.id, budget.category_id, year, month);
      }

      const updatedData = await budgetApi.getBudgets(user.id, year, month);
      setBudgets(updatedData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSaved = () => {
    loadBudgets();
    setShowAddDialog(false);
    setEditingBudget(null);
  };

  const handleBudgetDeleted = () => {
    loadBudgets();
    setDeletingBudget(null);
  };

  const years = Array.from({ length: 5 }, (_, i) => getCurrentYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 xl:p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage your spending limits</p>
          </div>
          <div className="flex gap-2">
            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-20 w-full bg-muted" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {overallProgress.toFixed(1)}% of budget used
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : budgets.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12 text-muted-foreground">
                <p>No budgets set for this period</p>
                <p className="text-sm mt-2">Click "Add Budget" to create your first budget</p>
              </CardContent>
            </Card>
          ) : (
            budgets.map((budget) => {
              const progress = budget.amount > 0 ? (Number(budget.spent) / Number(budget.amount)) * 100 : 0;
              const isOverBudget = progress > 100;
              const isNearLimit = progress > 80 && progress <= 100;

              return (
                <Card key={budget.id} className={isOverBudget ? 'border-destructive' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{budget.category.icon}</span>
                      <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeletingBudget(budget)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="text-xl font-bold">{formatCurrency(Number(budget.spent))}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-xl font-bold">{formatCurrency(Number(budget.amount))}</p>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-yellow-500' : ''}`}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% used</p>
                      {isOverBudget && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over Budget
                        </Badge>
                      )}
                      {isNearLimit && !isOverBudget && (
                        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                          <AlertTriangle className="h-3 w-3" />
                          Near Limit
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <BudgetDialog
        open={showAddDialog || !!editingBudget}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingBudget(null);
          }
        }}
        budget={editingBudget}
        year={year}
        month={month}
        onSaved={handleBudgetSaved}
      />

      <DeleteBudgetDialog
        open={!!deletingBudget}
        onOpenChange={(open) => {
          if (!open) setDeletingBudget(null);
        }}
        budget={deletingBudget}
        onDeleted={handleBudgetDeleted}
      />
    </div>
  );
}
