export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
};