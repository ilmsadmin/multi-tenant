import api from './api';
import { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log(`[Auth Service] Login attempt - Username: ${credentials.username}, Tenant Name: ${credentials.schemaName}`);
    
    try {
      // System admin login endpoint
      const response = await api.post<LoginResponse>(`/auth/system/login`, {
        username: credentials.username,
        password: credentials.password,
        schemaName: credentials.schemaName
      });
      
      // Store tokens properly - note we use access_token as per LoginResponse type
      localStorage.setItem('token', response.data.access_token);
      // Remove tenant_token to prevent redirect conflicts
      localStorage.removeItem('tenant_token');
      localStorage.setItem('schema_name', credentials.schemaName);
      console.log(`[Auth Service] Login successful - Token received and schema_name saved: ${credentials.schemaName}`);
      
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Login failed:', error);
      throw error;
    }
  },  logout: async (): Promise<void> => {
    try {
      // Use the correct system admin logout endpoint
      await api.post(`/auth/system/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear only system admin related storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Keep tenant_id as it might be needed for other operations
    }
  },
  getCurrentUser: async (): Promise<any> => {
    // Use system admin profile endpoint
    const response = await api.get(`/auth/system/profile`);
    return response.data;
  },
};
