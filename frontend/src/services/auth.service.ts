import api from './api';
import { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_id');
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
