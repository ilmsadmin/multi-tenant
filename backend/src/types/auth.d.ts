// Type definitions for Auth module
export type AuthLevel = 'system' | 'tenant' | 'user';

export interface AuthUser {
  userId: string | number;
  username: string;
  level: AuthLevel;
  tenantId?: string | number;
  tenantName?: string;
  roles?: string[];
  permissions?: string[];
}

export interface JwtPayload {
  sub: string | number; // User ID
  username: string;
  level: AuthLevel;
  tenantId?: string | number;
  tenantName?: string;
  roles?: string[];
  permissions?: string[];
  type?: string; // Token type (access_token, refresh_token)
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface SessionData {
  userId: string | number;
  username: string;
  level: AuthLevel;
  tenantId?: string | number;
  tenantName?: string;
  roles?: Array<{
    id: string | number;
    name: string;
  }>;
  permissions?: string[];
  lastActivity: Date;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string | number;
    username: string;
    email?: string;
    roles?: string[];
    level: AuthLevel;
  };
  tenant?: {
    id: string | number;
    name?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
