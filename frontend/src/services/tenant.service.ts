import api from './api';
import { 
  Tenant, 
  CreateTenantRequest, 
  UpdateTenantRequest 
} from '../types/tenant.types';

export const tenantService = {
  getAllTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<Tenant[]>('/tenants');
    return response.data;
  },

  getTenantById: async (id: number): Promise<Tenant> => {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  createTenant: async (tenant: CreateTenantRequest): Promise<Tenant> => {
    const response = await api.post<Tenant>('/tenants', tenant);
    return response.data;
  },

  updateTenant: async (id: number, tenant: UpdateTenantRequest): Promise<Tenant> => {
    const response = await api.patch<Tenant>(`/tenants/${id}`, tenant);
    return response.data;
  },

  deleteTenant: async (id: number): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  }
};
