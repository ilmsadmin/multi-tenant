# Quản lý Vai trò và Phân quyền API

API cho việc quản lý vai trò và quyền hạn trong hệ thống multi-tenant.

## Tổng quan

Module này cung cấp API CRUD cho vai trò và quyền, cùng với khả năng gán quyền cho từng vai trò. Mỗi tenant có cơ sở dữ liệu riêng (schema) cho vai trò và quyền của họ.

## Endpoints

### Quản lý Vai trò (Roles)

#### Tạo vai trò mới
- **POST** `/api/tenant-data/roles`
- Tạo một vai trò mới trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "name": "Admin",
    "description": "Quản trị viên hệ thống",
    "permissions": {
      "user": ["read", "create", "update", "delete"],
      "role": ["read", "create", "update", "delete"]
    }
  }
  ```

#### Lấy danh sách vai trò
- **GET** `/api/tenant-data/roles`
- Lấy danh sách tất cả vai trò trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Query Parameters:
  - `page`: Số trang (bắt đầu từ 1)
  - `limit`: Số lượng mục trên mỗi trang
  - `search`: Tìm kiếm theo tên hoặc mô tả vai trò

#### Lấy thông tin vai trò theo ID
- **GET** `/api/tenant-data/roles/{id}`
- Lấy chi tiết về một vai trò cụ thể
- Header bắt buộc: `x-tenant-id: <tenant_id>`

#### Cập nhật vai trò
- **PATCH** `/api/tenant-data/roles/{id}`
- Cập nhật thông tin của vai trò
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "name": "Super Admin",
    "description": "Quản trị viên cấp cao",
    "permissions": {
      "user": ["read", "create", "update", "delete"],
      "role": ["read", "create", "update", "delete"],
      "system": ["configure"]
    }
  }
  ```

#### Xóa vai trò
- **DELETE** `/api/tenant-data/roles/{id}`
- Xóa vai trò khỏi hệ thống
- Header bắt buộc: `x-tenant-id: <tenant_id>`

### Quản lý Quyền (Permissions)

#### Tạo quyền mới
- **POST** `/api/tenant-data/permissions`
- Tạo một quyền mới trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "name": "Xem người dùng",
    "key": "user.read",
    "description": "Cho phép xem danh sách người dùng",
    "module": "user",
    "type": "action"
  }
  ```

#### Lấy danh sách quyền
- **GET** `/api/tenant-data/permissions`
- Lấy danh sách tất cả quyền trong tenant
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Query Parameters:
  - `page`: Số trang (bắt đầu từ 1)
  - `limit`: Số lượng mục trên mỗi trang
  - `search`: Tìm kiếm theo tên, key hoặc mô tả
  - `module`: Lọc theo module

#### Lấy danh sách modules
- **GET** `/api/tenant-data/permissions/modules`
- Lấy danh sách tất cả các module có quyền
- Header bắt buộc: `x-tenant-id: <tenant_id>`

#### Lấy danh sách quyền theo module
- **GET** `/api/tenant-data/permissions/by-module/{module}`
- Lấy danh sách quyền của một module cụ thể
- Header bắt buộc: `x-tenant-id: <tenant_id>`

#### Lấy thông tin quyền theo ID
- **GET** `/api/tenant-data/permissions/{id}`
- Lấy chi tiết về một quyền cụ thể
- Header bắt buộc: `x-tenant-id: <tenant_id>`

#### Cập nhật quyền
- **PATCH** `/api/tenant-data/permissions/{id}`
- Cập nhật thông tin của quyền
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "name": "Xem chi tiết người dùng",
    "description": "Cho phép xem thông tin chi tiết của người dùng",
    "type": "action"
  }
  ```

#### Xóa quyền
- **DELETE** `/api/tenant-data/permissions/{id}`
- Xóa quyền khỏi hệ thống
- Header bắt buộc: `x-tenant-id: <tenant_id>`

### Quản lý Phân quyền

#### Gán quyền cho vai trò
- **POST** `/api/tenant-data/roles/{id}/permissions`
- Gán quyền cho một vai trò
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "permissionIds": [1, 2, 3],
    "replace": false
  }
  ```
  - `permissionIds`: Danh sách ID của các quyền cần gán
  - `replace`: Nếu `true`, sẽ thay thế toàn bộ quyền hiện tại. Nếu `false`, sẽ thêm vào danh sách quyền hiện có.

#### Xóa quyền khỏi vai trò
- **DELETE** `/api/tenant-data/roles/{id}/permissions`
- Xóa quyền khỏi vai trò
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "permissionIds": [1, 2, 3]
  }
  ```

#### Lấy danh sách quyền của vai trò
- **GET** `/api/tenant-data/roles/{id}/permissions`
- Lấy danh sách tất cả quyền được gán cho vai trò
- Header bắt buộc: `x-tenant-id: <tenant_id>`

## Cấu trúc cơ sở dữ liệu

### Bảng `roles`
- `id`: ID của vai trò
- `name`: Tên vai trò
- `description`: Mô tả vai trò
- `permissions`: Cấu trúc JSON lưu trữ quyền hạn (để tương thích với code cũ)
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

### Bảng `permissions`
- `id`: ID của quyền
- `name`: Tên quyền
- `key`: Khóa định danh của quyền (dùng trong code), ví dụ: `user.create`
- `description`: Mô tả quyền
- `module`: Module mà quyền này thuộc về
- `type`: Loại quyền (mặc định: `action`)
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

### Bảng `role_permissions` (junction table)
- `role_id`: ID của vai trò
- `permission_id`: ID của quyền

## Hướng dẫn sử dụng

### Kiểm tra API
Chạy script test để kiểm tra API:
```powershell
./test-role-permission-api.ps1
```

### Áp dụng migration
Để áp dụng migration cho tất cả tenant:
```bash
node migrations/apply-permissions-migration.js
```
