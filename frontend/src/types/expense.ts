import { Category } from './category';

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'OTHER';

export interface Expense {
  id: number;
  category: Category;
  amount: string;
  description: string;
  expense_date: string;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  category_id: number;
  amount: string;
  description?: string;
  expense_date: string;
  payment_method?: PaymentMethod;
}

export interface ExpenseFilters {
  page?: number;
  page_size?: number;
  category?: number;
  start_date?: string;
  end_date?: string;
  month?: string;
  payment_method?: PaymentMethod;
  min_amount?: string;
  max_amount?: string;
  search?: string;
  ordering?: string;
}
