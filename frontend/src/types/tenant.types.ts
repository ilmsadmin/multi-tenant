export interface Tenant {
  id: number;
  name: string;
  domain: string;
  schema_name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  package_id: number;
  package_name?: string;
}

export interface CreateTenantRequest {
  name: string;
  domain: string;
  package_id: number;
  status: 'active' | 'inactive';
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  package_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
}
