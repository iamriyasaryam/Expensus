import { api } from './api';
import { Expense, ExpenseInput, ExpenseFilters } from '../types/expense';
import { PaginatedResponse } from '../types/api';

export const expenseService = {
  async getExpenses(filters?: ExpenseFilters): Promise<PaginatedResponse<Expense>> {
    const response = await api.get<PaginatedResponse<Expense>>('/api/expenses/', {
      params: filters,
    });
    return response.data;
  },

  async getExpense(id: number): Promise<Expense> {
    const response = await api.get<Expense>(`/api/expenses/${id}/`);
    return response.data;
  },

  async createExpense(data: ExpenseInput): Promise<Expense> {
    const response = await api.post<Expense>('/api/expenses/', data);
    return response.data;
  },

  async updateExpense(id: number, data: Partial<ExpenseInput>): Promise<Expense> {
    const response = await api.patch<Expense>(`/api/expenses/${id}/`, data);
    return response.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/api/expenses/${id}/`);
  },
};
