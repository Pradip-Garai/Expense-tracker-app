import { supabase } from './supabase';
import type {
  Profile,
  Category,
  Transaction,
  Budget,
  Goal,
  FDDeposit,
  TransactionWithCategory,
  BudgetWithCategory,
  TransactionFilters,
} from '@/types';

// Profile API
export const profileApi = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// Category API
export const categoryApi = {
  async getCategories(userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .order('name', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getCategoriesByType(userId: string, type: 'income' | 'expense') {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .eq('type', type)
      .order('name', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'is_system'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, is_system: false })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Transaction API
export const transactionApi = {
  async getTransactions(userId: string, filters?: TransactionFilters, page = 1, limit = 20) {
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId);

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    if (filters?.minAmount !== undefined) {
      query = query.gte('amount', filters.minAmount);
    }
    if (filters?.maxAmount !== undefined) {
      query = query.lte('amount', filters.maxAmount);
    }
    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    const { data, error } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getRecentTransactions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getTransaction(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select('*, category:categories(*)')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const transactions = Array.isArray(data) ? data : [];
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    };
  },

  async getCategoryExpenses(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('category_id, amount, category:categories(name, color)')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

// Budget API
export const budgetApi = {
  async getBudgets(userId: string, year: number, month: number) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent'>) {
    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, spent: 0 })
      .select('*, category:categories(*)')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateBudget(id: string, updates: Partial<Budget>) {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteBudget(id: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateBudgetSpent(userId: string, categoryId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    const spent = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

    const { error } = await supabase
      .from('budgets')
      .update({ spent })
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('year', year)
      .eq('month', month);

    if (error) throw error;
  },
};

// Goal API
export const goalApi = {
  async getGoals(userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'saved_amount' | 'is_completed'>) {
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, saved_amount: 0, is_completed: false })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateGoal(id: string, updates: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// FD Deposit API
export const fdDepositApi = {
  async getDeposits(userId: string, page = 1, limit = 20) {
    const { data, error } = await supabase
      .from('fd_deposits')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getTotalBalance(userId: string) {
    const { data, error } = await supabase
      .from('fd_deposits')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;
    const deposits = Array.isArray(data) ? data : [];
    return deposits.reduce((sum, d) => sum + Number(d.amount), 0);
  },

  async createDeposit(deposit: Omit<FDDeposit, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('fd_deposits')
      .insert(deposit)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateDeposit(id: string, updates: Partial<FDDeposit>) {
    const { data, error } = await supabase
      .from('fd_deposits')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteDeposit(id: string) {
    const { error } = await supabase
      .from('fd_deposits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
