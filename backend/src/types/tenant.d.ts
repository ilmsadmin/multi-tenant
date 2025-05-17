// Type definitions for Tenant module
export interface Tenant {
  id: number;
  name: string;
  domain?: string;
  schema_name: string;
  package_id?: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  description?: string;
  created_at: Date;
  updated_at: Date;
  modules?: TenantModule[];
}

export interface TenantModule {
  id: number;
  tenant_id: number;
  module_id: number;
  status: 'active' | 'inactive';
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface TenantCreateParams {
  name: string;
  domain?: string;
  package_id?: number;
  status?: 'active' | 'inactive' | 'pending';
  description?: string;
}

export interface TenantUpdateParams {
  name?: string;
  domain?: string;
  package_id?: number;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  description?: string;
}

export interface TenantModuleActivationParams {
  module_id: number;
  status: 'active' | 'inactive';
  settings?: Record<string, any>;
}

export interface TenantSearchParams {
  search?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  skip?: number;
  take?: number;
}
