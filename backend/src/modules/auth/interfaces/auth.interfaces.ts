/**
 * Các interface của mô hình xác thực đa cấp
 */

/**
 * Đối tượng User trong request sau khi xác thực
 */
export interface AuthUser {
  userId: string | number;
  username: string;
  level: AuthLevel;
  tenantId?: string | number;
  tenantName?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Cấp độ xác thực
 */
export type AuthLevel = 'system' | 'tenant' | 'user';

/**
 * Kết quả đăng nhập thành công
 */
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

/**
 * Payload trong JWT token
 */
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

/**
 * Session data được lưu trong Redis
 */
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

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}
