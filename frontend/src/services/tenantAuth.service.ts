import api from './api';
import { TenantLoginRequest, TenantLoginResponse } from '../types/tenantAuth.types';

export const tenantAuthService = {
  login: async (credentials: TenantLoginRequest): Promise<TenantLoginResponse> => {
    const response = await api.post<TenantLoginResponse>('/tenant/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    localStorage.removeItem('tenant_id');
  },

  getCurrentUser: async (): Promise<any> => {
    const tenantId = localStorage.getItem('tenant_id');
    const response = await api.get(`/tenant/${tenantId}/auth/profile`);
    return response.data;
  },
};
