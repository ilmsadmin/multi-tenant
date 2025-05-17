// Type definitions for Users module
export interface User {
  id: number | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  status: 'active' | 'inactive' | 'suspended';
  tenantId?: number | string;
  roles?: Role[];
  lastLogin?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: number | string;
  name: string;
  description?: string;
  permissions: string[] | Record<string, string[]>;
  created_at: Date;
  updated_at: Date;
}

export interface SystemUser {
  id: number | string;
  username: string;
  email: string;
  role: string;
  passwordHash?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateParams {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  status?: 'active' | 'inactive';
  roleIds?: (number | string)[];
}

export interface UserUpdateParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: 'active' | 'inactive' | 'suspended';
  roleIds?: (number | string)[];
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface RoleCreateParams {
  name: string;
  description?: string;
  permissions: string[] | Record<string, string[]>;
}

export interface RoleUpdateParams {
  name?: string;
  description?: string;
  permissions?: string[] | Record<string, string[]>;
}
