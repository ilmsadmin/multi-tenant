# Thiết Kế Cơ Sở Dữ Liệu cho Hệ Thống Multi-Tenant

## 1. Tổng Quan

Hệ thống **multi-tenant** được thiết kế với 3 tầng phân quyền:
- **System Level**: Quản lý toàn bộ hệ thống, bao gồm tenant, gói dịch vụ, và module.
- **Tenant Level**: Quản lý người dùng và quyền trong phạm vi một tenant.
- **User Level**: Người dùng cuối sử dụng dịch vụ.

**Mô hình Multi-Tenant**:
- **Schema-per-Tenant** trong **PostgreSQL**: Mỗi tenant có schema riêng (`tenant_<id>`) để cách ly dữ liệu.
- **System Database**: Một cơ sở dữ liệu chung (`system_db`) lưu thông tin tenant, gói dịch vụ, và module.
- **MongoDB**: Lưu dữ liệu phi quan hệ (log, cấu hình module).
- **Redis**: Cache và quản lý session (không liên quan trực tiếp đến thiết kế database).

**Nguyên tắc**:
- Đảm bảo **data isolation** giữa các tenant.
- Tối ưu hóa truy vấn với index và phân vùng nếu cần.
- Hỗ trợ mở rộng (scale) bằng cách tách schema hoặc database khi số tenant tăng.

## 2. Thiết Kế Chi Tiết

### 2.1. System Database (system_db)

Cơ sở dữ liệu này lưu thông tin toàn hệ thống, bao gồm tenant, gói dịch vụ, module, và quyền ở cấp System.

#### Bảng và Cấu Trúc

1. **tenants** (Thông tin tenant)
   ```sql
   CREATE TABLE tenants (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(255) NOT NULL,
       package_id UUID NOT NULL,
       status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, deleted
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (package_id) REFERENCES packages(id)
   );
   ```
   - **Mô tả**: Lưu thông tin tenant.
   - **Index**: `CREATE INDEX idx_tenants_name ON tenants(name);`
   - **Mối quan hệ**: Liên kết với `packages` qua `package_id`.

2. **packages** (Gói dịch vụ)
   ```sql
   CREATE TABLE packages (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(100) NOT NULL, -- Basic, Pro, Enterprise
       description TEXT,
       max_users INTEGER NOT NULL, -- Số user tối đa
       max_storage BIGINT NOT NULL, -- Dung lượng (bytes)
       price DECIMAL(10, 2) NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```
   - **Mô tả**: Định nghĩa các gói dịch vụ.
   - **Index**: `CREATE INDEX idx_packages_name ON packages(name);`

3. **modules** (Danh sách module)
   ```sql
   CREATE TABLE modules (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(100) NOT NULL, -- CRM, HRM, Analytics
       description TEXT,
       is_active BOOLEAN NOT NULL DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```
   - **Mô tả**: Lưu danh sách module có sẵn trong hệ thống.
   - **Index**: `CREATE INDEX idx_modules_name ON modules(name);`

4. **tenant_modules** (Module được bật cho tenant)
   ```sql
   CREATE TABLE tenant_modules (
       tenant_id UUID NOT NULL,
       module_id UUID NOT NULL,
       is_enabled BOOLEAN NOT NULL DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (tenant_id, module_id),
       FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
       FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
   );
   ```
   - **Mô tả**: Liên kết tenant với module được bật.
   - **Index**: `CREATE INDEX idx_tenant_modules_tenant_id ON tenant_modules(tenant_id);`

5. **system_users** (Người dùng cấp System)
   ```sql
   CREATE TABLE system_users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       username VARCHAR(100) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL, -- Mã hóa bằng bcrypt
       email VARCHAR(255) NOT NULL UNIQUE,
       role VARCHAR(50) NOT NULL, -- system_admin, system_manager
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```
   - **Mô tả**: Lưu thông tin System Admin/Manager.
   - **Index**: `CREATE INDEX idx_system_users_email ON system_users(email);`

#### Mối Quan Hệ
- `tenants` -> `packages` (1:N): Một tenant chỉ thuộc một gói dịch vụ.
- `tenants` -> `tenant_modules` (1:N): Một tenant có thể bật nhiều module.
- `modules` -> `tenant_modules` (1:N): Một module có thể được bật cho nhiều tenant.

### 2.2. Tenant Database (Schema-per-Tenant)

Mỗi tenant có một schema riêng trong PostgreSQL, ví dụ: `tenant_123e4567-e89b-12d3-a456-426614174000`. Các schema này có cấu trúc bảng giống nhau.

#### Bảng và Cấu Trúc

1. **users** (Người dùng trong tenant)
   ```sql
   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       username VARCHAR(100) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL, -- Mã hóa bằng bcrypt
       email VARCHAR(255) NOT NULL UNIQUE,
       role_id UUID NOT NULL,
       status ascended_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (role_id) REFERENCES roles(id)
   );
   ```
   - **Mô tả**: Lưu thông tin user trong tenant.
   - **Index**: `CREATE INDEX idx_users_email ON users(email);`

2. **roles** (Vai trò trong tenant)
   ```sql
   CREATE TABLE roles (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(100) NOT NULL, -- admin, manager, staff, user
       permissions JSONB NOT NULL, -- Quyền: { "crm": ["read", "write"], "hrm": ["read"] }
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```
   - **Mô tả**: Lưu vai trò và quyền chi tiết (dùng JSONB để linh hoạt).
   - **Index**: `CREATE INDEX idx_roles_name ON roles(name);`

3. **user_data** (Dữ liệu người dùng cuối)
   ```sql
   CREATE TABLE user_data (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL,
       module_id UUID NOT NULL,
       data JSONB NOT NULL, -- Dữ liệu tùy thuộc module, ví dụ: { "ticket_id": "123", "status": "open" }
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (module_id) REFERENCES system_db.modules(id)
   );
   ```
   - **Mô tả**: Lưu dữ liệu giao dịch của user theo module.
   - **Index**: `CREATE INDEX idx_user_data_user_id ON user_data(user_id);`

#### Mối Quan Hệ
- `users` -> `roles` (N:1): Một user thuộc một vai trò.
- `user_data` -> `users` (N:1): Một user có nhiều dữ liệu giao dịch.
- `user_data` -> `system_db.modules` (N:1): Dữ liệu liên kết với module từ System DB.

#### Tạo Schema Tự Động
Khi tạo tenant mới, chạy script SQL:
```sql
CREATE SCHEMA tenant_<tenant_id>;
SET search_path TO tenant_<tenant_id>;
-- Tạo bảng users, roles, user_data
```

### 2.3. MongoDB

MongoDB được sử dụng để lưu dữ liệu phi quan hệ.

#### Collection

1. **system_logs** (Log hoạt động hệ thống)
   ```javascript
   {
       _id: ObjectId,
       tenant_id: UUID, // Optional, null cho log cấp System
       user_id: UUID,  // System user hoặc tenant user
       action: String, // create_tenant, update_user, etc.
       details: Object, // { module: "CRM", data: {...} }
       timestamp: ISODate
   }
   ```
   - **Mô tả**: Lưu audit log (System và Tenant).
   - **Index**: `{ tenant_id: 1 }, { timestamp: -1 }`

2. **module_configs** (Cấu hình module tùy chỉnh)
   ```javascript
   {
       _id: ObjectId,
       tenant_id: UUID,
       module_id: UUID,
       config: Object, // { theme: "dark", settings: {...} }
       updated_at: ISODate
   }
   ```
   - **Mô tả**: Lưu cấu hình module của tenant.
   - **Index**: `{ tenant_id: 1, module_id: 1 }`

## 3. Tối Ưu Hóa và Mở Rộng

### 3.1. Tối Ưu Hóa Truy Vấn
- **PostgreSQL**:
  - Index trên các cột thường truy vấn (`name`, `email`, `tenant_id`).
  - Partitioning schema nếu số tenant lớn (>10,000).
  - Sử dụng **connection pooling** (PgBouncer).
- **MongoDB**:
  - Index trên `tenant_id` và `timestamp` để tăng tốc truy vấn log.
  - Sharding nếu khối lượng log lớn.

### 3.2. Cách Ly Dữ Liệu
- **Schema-per-Tenant** đảm bảo dữ liệu tenant được cách ly.
- API kiểm tra `tenant_id` trong mỗi request để tránh truy cập sai schema.
- System DB và Tenant schema tách biệt để tránh xung đột.

### 3.3. Mở Rộng
- **Database-per-Tenant**: Chuyển sang mỗi tenant một database riêng nếu cần.
- **Replication**: Sử dụng PostgreSQL streaming replication để đảm bảo HA.
- **MongoDB Cluster**: Sharding và replica set cho dữ liệu lớn.

## 4. Quy Trình Vận Hành

1. **Khởi tạo System DB**:
   - Tạo `system_db` và các bảng (`tenants`, `packages`, `modules`, `tenant_modules`, `system_users`).
   - Thêm System Admin mặc định.

2. **Tạo Tenant**:
   - System Admin gọi API để tạo tenant.
   - Tạo schema `tenant_<id>` và các bảng (`users`, `roles`, `user_data`).
   - Thêm bản ghi vào `tenants` và `tenant_modules`.

3. **Quản lý Dữ Liệu**:
   - Tenant Admin tạo user và gán vai trò trong schema của tenant.
   - User tạo dữ liệu giao dịch, lưu vào `user_data` hoặc MongoDB.

4. **Log và Monitoring**:
   - Mọi hành động được ghi vào `system_logs` (MongoDB).
   - Sử dụng **ELK Stack** để phân tích log.

## 5. Ví Dụ Truy Vấn

**Tạo tenant**:
```sql
INSERT INTO system_db.tenants (id, name, package_id) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Tenant A', '456e7890-e89b-12d3-a456-426614174000');

CREATE SCHEMA tenant_123e4567_e89b_12d3_a456_426614174000;
SET search_path TO tenant_123e4567_e89b_12d3_a456_426614174000;
-- Tạo bảng users, roles, user_data
```

**Lấy module của tenant**:
```sql
SELECT m.name 
FROM system_db.tenant_modules tm 
JOIN system_db.modules m ON tm.module_id = m.id 
WHERE tm.tenant_id = '123e4567-e89b-12d3-a456-426614174000' AND tm.is_enabled = true;
```

**Lưu log vào MongoDB**:
```javascript
db.system_logs.insertOne({
    tenant_id: "123e4567-e89b-12d3-a456-426614174000",
    user_id: "789e0123-e89b-12d3-a456-426614174000",
    action: "create_user",
    details: { module: "CRM", username: "john_doe" },
    timestamp: new Date()
});
```

## 6. Lưu Ý

- **Backup**: Sử dụng **pg_dump** cho PostgreSQL và **mongodump** cho MongoDB để sao lưu định kỳ.
- **Security**: Mã hóa password bằng **bcrypt** và sử dụng SSL cho kết nối database.
- **Scalability**: Theo dõi số lượng schema trong PostgreSQL, chuyển sang Database-per-Tenant nếu cần.

## 7. Tài Liệu Tham Khảo

- NestJS: https://docs.nestjs.com
- React: https://reactjs.org
- PostgreSQL Multi-Tenancy: https://www.postgresql.org/docs/current/ddl-schemas.html
- MongoDB: https://www.mongodb.com/docs
- Docker: https://docs.docker.com/compose/