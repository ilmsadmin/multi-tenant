// Type definitions for Packages
export interface Package {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  features?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface PackageCreateParams {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
  features?: Record<string, any>;
}

export interface PackageUpdateParams {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  features?: Record<string, any>;
}

export interface PackageSearchParams {
  search?: string;
  status?: 'active' | 'inactive';
  skip?: number;
  take?: number;
}
