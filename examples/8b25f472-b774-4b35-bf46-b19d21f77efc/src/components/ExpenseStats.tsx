import React from 'react';
import { Expense } from '../types.ts';
import { categories } from '../data/categories.ts';
import { PieChart, Wallet } from 'lucide-react';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByCategory = categories.map(category => ({
    ...category,
    total: expenses
      .filter(expense => expense.category === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="text-blue-500" />
          <h3 className="text-lg font-semibold">总支出</h3>
        </div>
        <p className="text-3xl font-bold text-blue-600">¥{totalExpenses.toFixed(2)}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="text-blue-500" />
          <h3 className="text-lg font-semibold">分类统计</h3>
        </div>
        <div className="space-y-2">
          {expensesByCategory
            .filter(cat => cat.total > 0)
            .sort((a, b) => b.total - a.total)
            .map(category => (
              <div key={category.id} className="flex items-center justify-between">
                <span className="text-gray-600">{category.name}</span>
                <span className="font-medium">¥{category.total.toFixed(2)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}