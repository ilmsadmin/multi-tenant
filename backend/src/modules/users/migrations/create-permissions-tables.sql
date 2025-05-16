// filepath: d:\www\multi-tenant\backend\src\modules\users\migrations\create-permissions-tables.sql
-- This migration script should be run on each tenant schema to add permissions management capabilities

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  type VARCHAR(50) DEFAULT 'action',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for role-permission many-to-many relationship
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_type ON permissions(type);

-- Insert some basic permissions for demonstration
INSERT INTO permissions (name, key, description, module) VALUES
('Xem người dùng', 'user.read', 'Cho phép xem danh sách người dùng', 'user'),
('Tạo người dùng', 'user.create', 'Cho phép tạo người dùng mới', 'user'),
('Cập nhật người dùng', 'user.update', 'Cho phép cập nhật thông tin người dùng', 'user'),
('Xóa người dùng', 'user.delete', 'Cho phép xóa người dùng', 'user'),
('Xem vai trò', 'role.read', 'Cho phép xem danh sách vai trò', 'role'),
('Tạo vai trò', 'role.create', 'Cho phép tạo vai trò mới', 'role'),
('Cập nhật vai trò', 'role.update', 'Cho phép cập nhật thông tin vai trò', 'role'),
('Xóa vai trò', 'role.delete', 'Cho phép xóa vai trò', 'role'),
('Gán quyền cho vai trò', 'role.assign_permissions', 'Cho phép gán quyền cho vai trò', 'role')
ON CONFLICT (key) DO NOTHING;
