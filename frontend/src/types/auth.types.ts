export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  tenantId?: number;  // Add tenantId property
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
  schemaName: string;  // Sử dụng tên schema thay vì ID
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface TokenVerify {
  token: string;
}

export interface TokenRefresh {
  refreshToken: string;
}
