import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionApi } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '@/utils/format';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart';
import QuickAddTransaction from '@/components/dashboard/QuickAddTransaction';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      const data = await transactionApi.getMonthlyStats(user.id, currentYear, currentMonth);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Balance',
      subtitle: 'All-time',
      value: stats.totalBalance,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Income',
      subtitle: 'This month',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'text-income',
      bgColor: 'bg-income/10',
    },
    {
      title: 'Total Expenses',
      subtitle: 'This month',
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: 'text-expense',
      bgColor: 'bg-expense/10',
    },
    {
      title: 'Savings Rate',
      subtitle: 'This month',
      value: `${stats.savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'text-success',
      bgColor: 'bg-success/10',
      isPercentage: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 xl:p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your financial overview for this month.
            </p>
          </div>
          <Button onClick={() => navigate('/reports')} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-full`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.isPercentage ? stat.value : formatCurrency(Number(stat.value))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <MonthlyTrendChart />
            <RecentTransactions onTransactionChange={loadStats} />
          </div>
          <div>
            <QuickAddTransaction onTransactionAdded={loadStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
