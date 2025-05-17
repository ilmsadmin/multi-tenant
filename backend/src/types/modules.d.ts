// Type definitions for Modules
export interface Module {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface ModuleCreateParams {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
}

export interface ModuleUpdateParams {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface ModuleSearchParams {
  search?: string;
  status?: 'active' | 'inactive';
  skip?: number;
  take?: number;
}
