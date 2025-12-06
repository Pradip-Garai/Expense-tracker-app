import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { goalApi } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Edit, Trash2, Target, CheckCircle2 } from 'lucide-react';
import type { Goal } from '@/types';
import GoalDialog from '@/components/goals/GoalDialog';
import DeleteGoalDialog from '@/components/goals/DeleteGoalDialog';
import UpdateGoalProgressDialog from '@/components/goals/UpdateGoalProgressDialog';

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [updatingGoal, setUpdatingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await goalApi.getGoals(user.id);
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSaved = () => {
    loadGoals();
    setShowAddDialog(false);
    setEditingGoal(null);
  };

  const handleGoalDeleted = () => {
    loadGoals();
    setDeletingGoal(null);
  };

  const handleProgressUpdated = () => {
    loadGoals();
    setUpdatingGoal(null);
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 xl:p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground mt-1">Track your progress towards financial goals</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
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
              ) : activeGoals.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active goals</p>
                    <p className="text-sm mt-2">Click "Add Goal" to create your first savings goal</p>
                  </CardContent>
                </Card>
              ) : (
                activeGoals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (Number(goal.saved_amount) / Number(goal.target_amount)) * 100 : 0;
                  const remaining = Number(goal.target_amount) - Number(goal.saved_amount);
                  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();

                  return (
                    <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.deadline && (
                            <p className={`text-sm mt-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                              Due: {formatDate(goal.deadline)}
                              {isOverdue && ' (Overdue)'}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeletingGoal(goal)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Saved</p>
                            <p className="text-xl font-bold">{formatCurrency(Number(goal.saved_amount))}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Target</p>
                            <p className="text-xl font-bold">{formatCurrency(Number(goal.target_amount))}</p>
                          </div>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% complete</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(remaining)} remaining
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setUpdatingGoal(goal)}
                        >
                          Update Progress
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Completed Goals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="border-success/50">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {goal.title}
                          <Badge variant="default" className="bg-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeletingGoal(goal)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Achieved</p>
                          <p className="text-xl font-bold">{formatCurrency(Number(goal.saved_amount))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Target</p>
                          <p className="text-xl font-bold">{formatCurrency(Number(goal.target_amount))}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <GoalDialog
        open={showAddDialog || !!editingGoal}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingGoal(null);
          }
        }}
        goal={editingGoal}
        onSaved={handleGoalSaved}
      />

      <DeleteGoalDialog
        open={!!deletingGoal}
        onOpenChange={(open) => {
          if (!open) setDeletingGoal(null);
        }}
        goal={deletingGoal}
        onDeleted={handleGoalDeleted}
      />

      <UpdateGoalProgressDialog
        open={!!updatingGoal}
        onOpenChange={(open) => {
          if (!open) setUpdatingGoal(null);
        }}
        goal={updatingGoal}
        onUpdated={handleProgressUpdated}
      />
    </div>
  );
}
