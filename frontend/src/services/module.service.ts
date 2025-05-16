import api from './api';
import { 
  Module, 
  TenantModule,
  CreateModuleRequest, 
  UpdateModuleRequest,
  TenantModuleActivationRequest
} from '../types/module.types';

export const moduleService = {
  getAllModules: async (): Promise<Module[]> => {
    const response = await api.get<Module[]>('/modules');
    return response.data;
  },

  getModuleById: async (id: number): Promise<Module> => {
    const response = await api.get<Module>(`/modules/${id}`);
    return response.data;
  },

  createModule: async (moduleData: CreateModuleRequest): Promise<Module> => {
    const response = await api.post<Module>('/modules', moduleData);
    return response.data;
  },

  updateModule: async (id: number, moduleData: UpdateModuleRequest): Promise<Module> => {
    const response = await api.patch<Module>(`/modules/${id}`, moduleData);
    return response.data;
  },

  deleteModule: async (id: number): Promise<void> => {
    await api.delete(`/modules/${id}`);
  },

  // Tenant module activation
  getTenantModules: async (tenantId: number): Promise<TenantModule[]> => {
    const response = await api.get<TenantModule[]>(`/tenants/${tenantId}/modules`);
    return response.data;
  },

  activateModuleForTenant: async (data: TenantModuleActivationRequest): Promise<TenantModule> => {
    const response = await api.post<TenantModule>(`/tenants/${data.tenant_id}/modules`, data);
    return response.data;
  },

  updateTenantModuleStatus: async (tenantId: number, moduleId: number, status: 'active' | 'inactive'): Promise<TenantModule> => {
    const response = await api.patch<TenantModule>(`/tenants/${tenantId}/modules/${moduleId}`, { status });
    return response.data;
  }
};
