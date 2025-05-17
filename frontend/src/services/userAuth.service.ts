import api from './api';
import { UserLoginRequest, UserLoginResponse, UserProfile } from '../types/userAuth.types';

export const userAuthService = {  login: async (credentials: UserLoginRequest): Promise<UserLoginResponse> => {
    const response = await api.post<UserLoginResponse>(`/auth/user/${credentials.schemaName}/login`, {
      username: credentials.username,
      password: credentials.password
    });
    return response.data;
  },
  logout: async (): Promise<void> => {
    try {
      const schemaName = localStorage.getItem('user_schema_name');
      if (schemaName) {
        await api.post(`/auth/user/${schemaName}/logout`);
      }
    } catch (error) {
      console.error('User logout error:', error);
    } finally {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('user_schema_name');
    }
  },
  getProfile: async (): Promise<UserProfile> => {
    const schemaName = localStorage.getItem('user_schema_name');
    const response = await api.get(`/auth/user/${schemaName}/profile`);
    return response.data;
  },  updateProfile: async (userData: Partial<UserProfile>): Promise<UserProfile> => {
    const schemaName = localStorage.getItem('user_schema_name');
    const response = await api.put(`/auth/user/${schemaName}/profile`, userData);
    return response.data;
  },
  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const schemaName = localStorage.getItem('user_schema_name');
    await api.post(`/auth/user/${schemaName}/change-password`, data);
  },
  updatePreferences: async (preferences: any): Promise<void> => {
    const schemaName = localStorage.getItem('user_schema_name');
    await api.put(`/auth/user/${schemaName}/preferences`, { preferences });
  }
};
