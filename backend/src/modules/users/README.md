# User Management API

API cho việc quản lý người dùng và vai trò trong một tenant.

## Tổng quan

Module này cung cấp API CRUD cho người dùng và vai trò trong phạm vi của một tenant. Mỗi tenant có cơ sở dữ liệu riêng (schema) cho người dùng của họ.

## Endpoints

### User Endpoints

#### Tạo người dùng mới
- **POST** `/api/tenant-data/users`
- Tạo một người dùng mới trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "StrongPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "roleIds": [1, 2]
  }
  ```

#### Lấy danh sách người dùng
- **GET** `/api/tenant-data/users`
- Trả về danh sách phân trang của tất cả người dùng trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Tham số truy vấn:
  - `search`: Tìm kiếm theo username, email, firstName, lastName
  - `status`: Lọc theo trạng thái (active, inactive, suspended, deleted)
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng mục trên mỗi trang (mặc định: 10, tối đa: 100)

#### Lấy thông tin người dùng theo ID
- **GET** `/api/tenant-data/users/:id`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Trả về thông tin chi tiết của một người dùng

#### Lấy thông tin người dùng theo username
- **GET** `/api/tenant-data/users/username/:username`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Trả về thông tin chi tiết của một người dùng dựa trên username

#### Cập nhật thông tin người dùng
- **PATCH** `/api/tenant-data/users/:id`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Cập nhật thông tin của một người dùng
- Body Request:
  ```json
  {
    "email": "new.email@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "status": "inactive",
    "roleIds": [2, 3]
  }
  ```

#### Đổi mật khẩu
- **POST** `/api/tenant-data/users/:id/change-password`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```

#### Xóa người dùng
- **DELETE** `/api/tenant-data/users/:id`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Xóa một người dùng khỏi tenant

### Role Endpoints

#### Tạo vai trò mới
- **POST** `/api/tenant-data/roles`
- Tạo một vai trò mới trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "name": "admin",
    "description": "Administrator with full access",
    "permissions": {
      "users": ["view", "create", "update", "delete"],
      "roles": ["view", "create", "update", "delete"]
    }
  }
  ```

#### Lấy danh sách vai trò
- **GET** `/api/tenant-data/roles`
- Trả về danh sách phân trang của tất cả vai trò trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Tham số truy vấn:
  - `search`: Tìm kiếm theo tên hoặc mô tả
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng mục trên mỗi trang (mặc định: 10, tối đa: 100)

#### Lấy thông tin vai trò theo ID
- **GET** `/api/tenant-data/roles/:id`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Trả về thông tin chi tiết của một vai trò

#### Cập nhật thông tin vai trò
- **PATCH** `/api/tenant-data/roles/:id`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Cập nhật thông tin của một vai trò
- Body Request:
  ```json
  {
    "description": "Updated role description",
    "permissions": {
      "users": ["view", "create"],
      "roles": ["view"]
    }
  }
  ```

#### Xóa vai trò
- **DELETE** `/api/tenant-data/roles/:id`
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Xóa một vai trò khỏi tenant

## Cấu trúc dữ liệu

### User Entity
```typescript
{
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: Role[];
}
```

### Role Entity
```typescript
{
  id: number;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Ví dụ sử dụng

### Tạo người dùng mới
```http
POST /api/tenant-data/users
x-tenant-id: 1
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "roleIds": [1]
}
```

### Truy vấn người dùng
```http
GET /api/tenant-data/users?search=john&status=active&page=1&limit=10
x-tenant-id: 1
```
