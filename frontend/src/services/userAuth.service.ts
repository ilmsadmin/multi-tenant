import api from './api';
import { UserLoginRequest, UserLoginResponse, UserProfile } from '../types/userAuth.types';

export const userAuthService = {
  login: async (credentials: UserLoginRequest): Promise<UserLoginResponse> => {
    const response = await api.post<UserLoginResponse>(`/tenant/${credentials.tenantId}/auth/user/login`, {
      username: credentials.username,
      password: credentials.password
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_tenant_id');
  },

  getProfile: async (): Promise<UserProfile> => {
    const tenantId = localStorage.getItem('user_tenant_id');
    const response = await api.get(`/tenant/${tenantId}/auth/user/profile`);
    return response.data;
  },

  updateProfile: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    const tenantId = localStorage.getItem('user_tenant_id');
    const response = await api.put(`/tenant/${tenantId}/auth/user/profile`, userData);
    return response.data;
  },

  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const tenantId = localStorage.getItem('user_tenant_id');
    await api.put(`/tenant/${tenantId}/auth/user/password`, data);
  },

  updatePreferences: async (preferences: any): Promise<void> => {
    const tenantId = localStorage.getItem('user_tenant_id');
    await api.put(`/tenant/${tenantId}/auth/user/preferences`, { preferences });
  }
};
