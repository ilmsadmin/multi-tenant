export interface TenantUser {
  id: number;
  username: string;
  email: string;
  role: string;
  tenant_id: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TenantAuthState {
  user: TenantUser | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TenantLoginRequest {
  tenantId: string;
  username: string;
  password: string;
}

export interface TenantLoginResponse {
  user: TenantUser;
  access_token: string;
}
