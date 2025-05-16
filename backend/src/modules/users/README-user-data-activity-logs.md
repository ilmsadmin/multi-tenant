# API Dữ liệu Giao dịch Người dùng và Log Hoạt động

## Giới thiệu

Module này cung cấp các API để:
1. Lưu trữ và quản lý dữ liệu giao dịch của người dùng (`user_data`)
2. Ghi log hoạt động chi tiết của người dùng trong hệ thống

## Cài đặt

Để cài đặt và chạy module này:

1. Chạy migration để tạo bảng `user_data`:
```bash
npm run migrations:run
```

2. Khởi động server:
```bash
npm run start:dev
```

## API Dữ liệu Giao dịch Người dùng

### Cấu trúc dữ liệu

- `user_id`: ID của người dùng
- `category`: Danh mục dữ liệu (ví dụ: preferences, transactions, history)
- `key`: Khóa dữ liệu
- `value`: Giá trị dữ liệu (JSON)
- `status`: Trạng thái của dữ liệu (active, archived, pending)
- `metadata`: Metadata bổ sung (JSON)

### Endpoints

#### 1. Tạo dữ liệu giao dịch mới
- **Endpoint**: `POST /api/tenant-data/user-data`
- **Quyền yêu cầu**: `userdata.create`
- **Mô tả**: Tạo dữ liệu giao dịch mới cho người dùng

#### 2. Lấy danh sách dữ liệu giao dịch
- **Endpoint**: `GET /api/tenant-data/user-data`
- **Quyền yêu cầu**: `userdata.read`
- **Mô tả**: Lấy danh sách dữ liệu giao dịch của người dùng
- **Query params**:
  - `userId`: Lọc theo ID người dùng
  - `category`: Lọc theo danh mục
  - `key`: Lọc theo khóa
  - `status`: Lọc theo trạng thái

#### 3. Lấy dữ liệu giao dịch theo ID
- **Endpoint**: `GET /api/tenant-data/user-data/:id`
- **Quyền yêu cầu**: `userdata.read`
- **Mô tả**: Lấy thông tin chi tiết của dữ liệu giao dịch theo ID

#### 4. Lấy dữ liệu giao dịch theo userId và category
- **Endpoint**: `GET /api/tenant-data/user-data/user/:userId/category/:category`
- **Quyền yêu cầu**: `userdata.read`
- **Mô tả**: Lấy danh sách dữ liệu giao dịch của người dùng theo danh mục

#### 5. Lấy dữ liệu giao dịch theo userId và key
- **Endpoint**: `GET /api/tenant-data/user-data/user/:userId/key/:key`
- **Quyền yêu cầu**: `userdata.read`
- **Mô tả**: Lấy dữ liệu giao dịch của người dùng theo khóa

#### 6. Cập nhật dữ liệu giao dịch
- **Endpoint**: `PATCH /api/tenant-data/user-data/:id`
- **Quyền yêu cầu**: `userdata.update`
- **Mô tả**: Cập nhật dữ liệu giao dịch

#### 7. Xóa dữ liệu giao dịch
- **Endpoint**: `DELETE /api/tenant-data/user-data/:id`
- **Quyền yêu cầu**: `userdata.delete`
- **Mô tả**: Xóa dữ liệu giao dịch

## API Log Hoạt động

### Cấu trúc dữ liệu

- `tenant_id`: ID của tenant
- `user_id`: ID của người dùng
- `action`: Loại hành động (login, create, update, delete, v.v.)
- `entity`: Đối tượng/module bị tác động (user, role, userData, v.v.)
- `entity_id`: ID của đối tượng bị tác động
- `details`: Chi tiết về hành động (JSON)
- `ip_address`: Địa chỉ IP của người dùng
- `user_agent`: Thông tin về trình duyệt/thiết bị
- `timestamp`: Thời gian hành động

### Endpoints

#### 1. Tạo log hoạt động mới
- **Endpoint**: `POST /api/activity-logs`
- **Mô tả**: Tạo log hoạt động mới

#### 2. Lấy danh sách log hoạt động
- **Endpoint**: `GET /api/activity-logs`
- **Quyền yêu cầu**: `logs.read`
- **Mô tả**: Lấy danh sách log hoạt động
- **Query params**:
  - `tenant_id`: Lọc theo tenant
  - `user_id`: Lọc theo người dùng
  - `action`: Lọc theo loại hành động
  - `entity`: Lọc theo loại đối tượng
  - `entity_id`: Lọc theo ID đối tượng
  - `from_date`: Lọc từ ngày
  - `to_date`: Lọc đến ngày

#### 3. Lấy log hoạt động theo tenant
- **Endpoint**: `GET /api/activity-logs/tenant/:tenantId`
- **Quyền yêu cầu**: `logs.read`
- **Mô tả**: Lấy log hoạt động theo tenant

#### 4. Lấy log hoạt động theo người dùng
- **Endpoint**: `GET /api/activity-logs/user/:userId`
- **Quyền yêu cầu**: `logs.read`
- **Mô tả**: Lấy log hoạt động theo người dùng

#### 5. Lấy log hoạt động theo loại hành động
- **Endpoint**: `GET /api/activity-logs/action/:action`
- **Quyền yêu cầu**: `logs.read`
- **Mô tả**: Lấy log hoạt động theo loại hành động

#### 6. Lấy log hoạt động theo entity
- **Endpoint**: `GET /api/activity-logs/entity/:entity`
- **Quyền yêu cầu**: `logs.read`
- **Mô tả**: Lấy log hoạt động theo entity
- **Query params**:
  - `entityId`: Lọc theo ID của entity

## Cách sử dụng Logging Service

Để ghi log hoạt động trong code, sử dụng LoggingService:

```typescript
// Inject LoggingService
constructor(private readonly loggingService: LoggingService) {}

// Ghi log hoạt động
await this.loggingService.logActivity(
  tenantId,          // ID của tenant
  userId,            // ID của người dùng
  'create',          // Loại hành động
  'userData',        // Đối tượng bị tác động
  entityId,          // ID của đối tượng bị tác động
  { key: 'value' },  // Chi tiết về hành động
  request            // Request object để lấy IP và User-Agent
);
```
