import { api } from './api';
import { Category, CategoryInput } from '../types/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/categories/');
    return response.data;
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get<Category>(`/api/categories/${id}/`);
    return response.data;
  },

  async createCategory(data: CategoryInput): Promise<Category> {
    const response = await api.post<Category>('/api/categories/', data);
    return response.data;
  },

  async updateCategory(id: number, data: Partial<CategoryInput>): Promise<Category> {
    const response = await api.patch<Category>(`/api/categories/${id}/`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/categories/${id}/`);
  },
};
