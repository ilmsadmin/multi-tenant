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
  getTenantModules: async (schemaName: string): Promise<TenantModule[]> => {
    const response = await api.get<TenantModule[]>(`/tenants/${schemaName}/modules`);
    return response.data;
  },
  activateModuleForTenant: async (data: TenantModuleActivationRequest): Promise<TenantModule> => {
    const response = await api.post<TenantModule>(`/tenants/${data.schema_name}/modules`, data);
    return response.data;
  },
  updateTenantModuleStatus: async (schemaName: string, moduleId: number, status: 'active' | 'inactive'): Promise<TenantModule> => {
    const response = await api.patch<TenantModule>(`/tenants/${schemaName}/modules/${moduleId}`, { status });
    return response.data;
  }
};
