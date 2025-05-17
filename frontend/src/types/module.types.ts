export interface Module {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TenantModule {
  id: number;
  tenant_id: number;
  schema_name?: string;
  module_id: number;
  module_name?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateModuleRequest {
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface UpdateModuleRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface TenantModuleActivationRequest {
  schema_name: string;
  module_id: number;
  status: 'active' | 'inactive';
}
