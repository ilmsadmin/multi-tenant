// Type definitions for MongoDB services
export interface LogEntry {
  id?: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface SystemLogEntry extends LogEntry {
  user_id?: string | number;
  action: string;
  resource?: string;
  ip_address?: string;
}

export interface ActivityLogEntry extends LogEntry {
  tenant_id: string | number;
  user_id: string | number;
  module: string;
  action: string;
  resource_id?: string | number;
  resource_type?: string;
  details?: Record<string, any>;
}

export interface AuditLogEntry extends ActivityLogEntry {
  previous_state?: Record<string, any>;
  current_state?: Record<string, any>;
  changes?: Record<string, { from: any; to: any }>;
}

export interface TenantConfigEntry {
  tenant_id: string | number;
  module_id: string | number;
  config: Record<string, any>;
  updated_at: Date;
}
