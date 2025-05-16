# Authentication and Authorization API

API cho việc xác thực và phân quyền trong hệ thống multi-tenant.

## Tổng quan

Module này cung cấp cơ chế xác thực JWT (JSON Web Token) và phân quyền dựa trên vai trò và quyền hạn cụ thể. Hệ thống hỗ trợ đăng nhập, đăng xuất, làm mới token, đổi mật khẩu và kiểm tra quyền truy cập.

## Cách hoạt động

1. **Xác thực (Authentication)**: Người dùng đăng nhập với username và password, hệ thống trả về JWT token.
2. **Ủy quyền (Authorization)**: Sử dụng JWT token và các Guards để kiểm tra quyền truy cập:
   - **RolesGuard**: Kiểm tra vai trò của người dùng
   - **PermissionsGuard**: Kiểm tra quyền cụ thể của người dùng

## Endpoints

### Đăng nhập
- **POST** `/api/auth/login`
- Đăng nhập vào hệ thống và lấy JWT token
- Header bắt buộc: `x-tenant-id: <tenant_id>`
- Body Request:
  ```json
  {
    "username": "admin_user",
    "password": "Password123!"
  }
  ```
- Response:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin_user",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": [
        {
          "id": 1,
          "name": "admin"
        }
      ]
    }
  }
  ```

### Lấy thông tin profile
- **GET** `/api/auth/profile`
- Lấy thông tin profile của người dùng đã đăng nhập
- Header bắt buộc: 
  - `x-tenant-id: <tenant_id>`
  - `Authorization: Bearer <token>`
- Response:
  ```json
  {
    "id": 1,
    "username": "admin_user",
    "tenantId": 1,
    "roles": ["admin"],
    "permissions": ["users.read", "users.create", "roles.read"]
  }
  ```

### Đăng xuất
- **POST** `/api/auth/logout`
- Đăng xuất khỏi hệ thống
- Header bắt buộc: 
  - `x-tenant-id: <tenant_id>`
  - `Authorization: Bearer <token>`
- Response:
  ```json
  {
    "message": "Đăng xuất thành công"
  }
  ```

### Đổi mật khẩu
- **POST** `/api/auth/change-password`
- Đổi mật khẩu của người dùng đã đăng nhập
- Header bắt buộc: 
  - `x-tenant-id: <tenant_id>`
  - `Authorization: Bearer <token>`
- Body Request:
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewPassword123!"
  }
  ```
- Response:
  ```json
  {
    "message": "Mật khẩu đã được thay đổi"
  }
  ```

### Làm mới token
- **POST** `/api/auth/refresh-token`
- Lấy token mới từ token cũ
- Body Request:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- Response:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

## Guards và Decorators

### Guards

1. **JwtAuthGuard**: Kiểm tra token JWT hợp lệ
2. **RolesGuard**: Kiểm tra vai trò của người dùng
3. **PermissionsGuard**: Kiểm tra quyền hạn cụ thể của người dùng

### Decorators

1. **@Public()**: Đánh dấu route không cần xác thực
2. **@Roles(...roles)**: Yêu cầu người dùng có vai trò cụ thể
3. **@Permissions(...permissions)**: Yêu cầu người dùng có quyền cụ thể
4. **@CurrentUser()**: Lấy thông tin người dùng hiện tại trong controller

### Sử dụng decorators

```typescript
// Đánh dấu không cần xác thực
@Public()
@Get('public-route')
getPublicData() {
  return { message: 'Public data' };
}

// Yêu cầu người dùng có vai trò 'admin'
@Roles('admin')
@Get('admin-data')
getAdminData() {
  return { message: 'Admin data' };
}

// Yêu cầu người dùng có quyền 'users.read'
@Permissions('users.read')
@Get('users')
getUsers() {
  return this.userService.findAll();
}

// Lấy thông tin người dùng hiện tại
@Get('me')
getMe(@CurrentUser() user) {
  return user;
}

// Lấy chỉ một phần thông tin người dùng
@Get('my-id')
getMyId(@CurrentUser('userId') userId: number) {
  return { userId };
}
```

## Cài đặt và Cấu hình

### Biến môi trường

Thêm các biến sau vào file `.env`:

```
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
```

### Tích hợp

Module Auth đã được tích hợp với:
1. **Redis**: Để lưu trữ và quản lý session
2. **MongoDB**: Để ghi log các hoạt động xác thực
3. **User Module**: Để xác thực người dùng và quản lý quyền

## Test API

Để test API xác thực, chạy script:

```bash
./test-auth-api.ps1
```

## Bảo mật

- Token JWT có thời hạn sử dụng (mặc định: 1 ngày)
- Session được lưu trong Redis có thể thiết lập thời gian hết hạn
- Các tác vụ quan trọng như đổi mật khẩu đều được ghi log
- Hỗ trợ vô hiệu hóa token thông qua đăng xuất (xóa session)
