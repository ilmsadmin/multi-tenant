// Type definitions for Redis service
import { AuthLevel } from '../modules/auth/interfaces/auth.interfaces';

export interface RedisSessionData {
  userId: string | number;
  username: string;
  level: AuthLevel;
  tenantId?: string | number;
  tenantName?: string;
  roles?: Array<{ id: string | number; name: string }>;
  permissions?: string[];
  lastActivity: Date;
}

export interface SystemSessionData {
  userId: string | number;
  username: string;
  role: string;
  level: 'system';
  lastActivity: Date;
}

export interface TenantCacheData {
  id: string | number;
  name: string;
  domain?: string;
  schema_name: string;
  status: 'active' | 'inactive' | 'suspended';
  package_id?: string | number;
}
