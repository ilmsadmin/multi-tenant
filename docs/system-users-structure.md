# System Users Structure and Authentication Guide

## Cấu trúc bảng `system_users`

Bảng `system_users` lưu trữ thông tin người dùng hệ thống cấp cao nhất, có quyền quản lý toàn bộ hệ thống multi-tenant.

### Cấu trúc hiện tại

```sql
CREATE TABLE IF NOT EXISTS public.system_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- Note: This is the hashed password
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cấu trúc đề xuất (bổ sung thêm `status`)

```sql
CREATE TABLE IF NOT EXISTS public.system_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Vấn đề xác thực hiện tại

Hiện có một số vấn đề trong quá trình xác thực người dùng hệ thống:

1. **Tên cột không nhất quán**: Mã nguồn đang tìm kiếm cột `password_hash` nhưng bảng thực tế sử dụng cột `password`.

2. **Thiếu kiểm tra status**: Mã nguồn có kiểm tra trạng thái tài khoản nhưng cột `status` có thể không tồn tại.

3. **Xử lý schema không đúng**: TenantSchemaMiddleware đang cố gắng tìm tenant khi gọi API xác thực hệ thống.

## Giải pháp

### 1. Script kiểm tra và cập nhật cấu trúc bảng

Chúng tôi đã tạo script `check-system-users.ts` để kiểm tra và cập nhật cấu trúc bảng:

```typescript
// Chạy script: npm run check-system-users
// Script sẽ:
// - Kiểm tra xem bảng system_users đã tồn tại chưa
// - Thêm cột status nếu chưa có
// - Đổi tên cột password_hash thành password nếu cần
// - Tạo người dùng admin mặc định nếu chưa có
```
}
```
