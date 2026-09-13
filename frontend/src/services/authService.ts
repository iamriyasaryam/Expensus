import { api } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  User,
} from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login/', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/api/auth/register/', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await api.post('/api/auth/logout/', { refresh });
      } catch (err) {
        // Ignore errors during logout request
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/auth/me/');
    return response.data;
  },

  async updateProfile(data: { first_name?: string; last_name?: string }): Promise<User> {
    const response = await api.patch<User>('/api/auth/me/', data);
    return response.data;
  },

  async changePassword(data: { old_password: string; new_password: string; new_password2: string }): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/api/auth/change-password/', data);
    return response.data;
  },
};
