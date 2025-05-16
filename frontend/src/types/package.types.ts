export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreatePackageRequest {
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive';
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  billing_cycle?: 'monthly' | 'yearly';
  status?: 'active' | 'inactive';
}
