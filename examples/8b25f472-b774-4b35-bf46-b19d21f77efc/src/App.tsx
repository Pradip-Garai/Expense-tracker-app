import React, { useState, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm.tsx';
import { ExpenseList } from './components/ExpenseList.tsx';
import { ExpenseStats } from './components/ExpenseStats.tsx';
import { Expense } from './types.ts';
import { Wallet } from 'lucide-react';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Wallet className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">个人记账工具</h1>
        </div>

        <ExpenseStats expenses={expenses} />
        <ExpenseForm onAddExpense={handleAddExpense} />
        <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
      </div>
    </div>
  );
}

export default App;