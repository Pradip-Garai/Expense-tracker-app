import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionApi } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCurrentYear } from '@/utils/format';

export default function MonthlyTrendChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChartData();
    }
  }, [user]);

  const loadChartData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const currentYear = getCurrentYear();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const yearlyData = await transactionApi.getYearlyTrend(user.id, currentYear);
      
      const data = months.map((month, index) => ({
        month,
        income: yearlyData[index + 1]?.income || 0,
        expenses: yearlyData[index + 1]?.expenses || 0,
      }));

      setChartData(data);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `₹${value.toFixed(2)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--income))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--income))' }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--expense))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--expense))' }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
