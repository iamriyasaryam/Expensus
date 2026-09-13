import { Expense } from './expense';

export interface DashboardSummary {
  total_spending_all_time: string;
  total_spending_month: string;
  total_spending_today: string;
  expense_count_month: number;
}

export interface CategoryBreakdownItem {
  category_id: number;
  category_name: string;
  icon: string;
  color: string;
  total_amount: string;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  total: string;
}

export interface DashboardData {
  selected_month: string;
  summary: DashboardSummary;
  category_breakdown: CategoryBreakdownItem[];
  monthly_trend: MonthlyTrendItem[];
  recent_expenses: Expense[];
}
