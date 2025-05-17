// Global types used across the application
import { AuthLevel } from './modules/auth/interfaces/auth.interfaces';

export interface BaseUser {
  id: string | number;
  username: string;
  email?: string;
  level: AuthLevel;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string | number;
    username: string;
    level: AuthLevel;
    tenantId?: string | number;
    tenantName?: string;
    roles?: string[];
    permissions?: string[];
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
