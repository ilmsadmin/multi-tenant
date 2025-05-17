import api from './api';
import { TenantLoginRequest, TenantLoginResponse } from '../types/tenantAuth.types';

export const tenantAuthService = {
  login: async (credentials: TenantLoginRequest): Promise<TenantLoginResponse> => {
    const response = await api.post<TenantLoginResponse>(`/auth/tenant/login`, {
      username: credentials.username,
      password: credentials.password,
      schemaName: credentials.schemaName
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      const schemaName = localStorage.getItem('schema_name');
      if (schemaName) {
        await api.post(`/auth/tenant/logout`);
      }
    } catch (error) {
      console.error('Tenant logout error:', error);
    } finally {
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_user');
      localStorage.removeItem('schema_name');
    }
  },
  getCurrentUser: async (): Promise<any> => {
    const schemaName = localStorage.getItem('schema_name');
    const response = await api.get(`/auth/tenant/profile`);
    return response.data;
  },
};
