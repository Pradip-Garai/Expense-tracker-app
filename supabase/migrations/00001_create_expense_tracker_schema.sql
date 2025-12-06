/*
# Expense Tracker Database Schema

## Overview
This migration creates the complete database structure for the Expense Tracker application,
including tables for user profiles, transactions, categories, budgets, goals, and fixed deposits.

## Tables Created

### 1. profiles
Stores extended user profile information
- `id` (uuid, primary key, references auth.users)
- `name` (text, not null)
- `email` (text, unique, not null)
- `avatar_url` (text, nullable)
- `currency` (text, default: 'INR')
- `monthly_budget` (numeric, default: 0)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### 2. categories
Stores transaction categories with icons and colors
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, nullable for system categories)
- `name` (text, not null)
- `icon` (text, not null)
- `color` (text, not null)
- `type` (text, 'income' or 'expense')
- `is_system` (boolean, default: false)
- `created_at` (timestamptz, default: now())

### 3. transactions
Stores all income and expense transactions
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, not null)
- `amount` (numeric, not null)
- `description` (text, not null)
- `category_id` (uuid, references categories, not null)
- `type` (text, 'income' or 'expense')
- `date` (date, not null)
- `payment_method` (text, nullable)
- `is_recurring` (boolean, default: false)
- `recurring_frequency` (text, nullable)
- `receipt_url` (text, nullable)
- `tags` (text[], default: '{}')
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### 4. budgets
Stores monthly budget allocations per category
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, not null)
- `category_id` (uuid, references categories, not null)
- `amount` (numeric, not null)
- `month` (integer, not null)
- `year` (integer, not null)
- `spent` (numeric, default: 0)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### 5. goals
Stores savings goals
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, not null)
- `title` (text, not null)
- `target_amount` (numeric, not null)
- `saved_amount` (numeric, default: 0)
- `deadline` (date, nullable)
- `is_completed` (boolean, default: false)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### 6. fd_deposits
Stores fixed deposit records
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, not null)
- `amount` (numeric, not null)
- `date` (date, not null)
- `description` (text, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

## Security
- RLS enabled on all tables
- Users can only access their own data
- System categories are readable by all authenticated users
- Policies created for SELECT, INSERT, UPDATE, DELETE operations

## Indexes
- Created indexes on user_id for all tables for query performance
- Created indexes on date fields for transaction queries
- Created composite index on (user_id, month, year) for budgets

## Functions
- `update_updated_at_column()` - Trigger function to auto-update updated_at timestamp
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  currency text DEFAULT 'INR' NOT NULL,
  monthly_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  date date NOT NULL,
  payment_method text,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly')),
  receipt_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000),
  spent numeric DEFAULT 0 CHECK (spent >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  saved_amount numeric DEFAULT 0 CHECK (saved_amount >= 0),
  deadline date,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fd_deposits table
CREATE TABLE IF NOT EXISTS fd_deposits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year ON budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_fd_deposits_user_id ON fd_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_fd_deposits_date ON fd_deposits(date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fd_deposits_updated_at BEFORE UPDATE ON fd_deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_deposits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own and system categories" ON categories
  FOR SELECT USING (user_id = auth.uid() OR is_system = true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (user_id = auth.uid());

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (user_id = auth.uid());

-- FD Deposits policies
CREATE POLICY "Users can view own fd_deposits" ON fd_deposits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own fd_deposits" ON fd_deposits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own fd_deposits" ON fd_deposits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own fd_deposits" ON fd_deposits
  FOR DELETE USING (user_id = auth.uid());

-- Insert default system categories
INSERT INTO categories (name, icon, color, type, is_system) VALUES
  ('Salary', '💰', '#4CAF50', 'income', true),
  ('Freelance', '💼', '#66BB6A', 'income', true),
  ('Investment', '📈', '#81C784', 'income', true),
  ('Other Income', '💵', '#A5D6A7', 'income', true),
  ('Food & Dining', '🍔', '#F44336', 'expense', true),
  ('Transportation', '🚗', '#E91E63', 'expense', true),
  ('Shopping', '🛍️', '#9C27B0', 'expense', true),
  ('Healthcare', '🏥', '#673AB7', 'expense', true),
  ('Entertainment', '🎬', '#3F51B5', 'expense', true),
  ('Bills & Utilities', '💡', '#2196F3', 'expense', true),
  ('Education', '📚', '#00BCD4', 'expense', true),
  ('Rent', '🏠', '#009688', 'expense', true),
  ('Insurance', '🛡️', '#4CAF50', 'expense', true),
  ('Other Expense', '📝', '#8BC34A', 'expense', true)
ON CONFLICT DO NOTHING;
