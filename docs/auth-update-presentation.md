# Tổng quan cập nhật hệ thống xác thực đa người dùng

## Vấn đề

Hệ thống hiện tại của chúng ta đã triển khai xác thực cho ba loại người dùng:

1. **Quản trị viên hệ thống** - Lưu trong bảng `system_users`
2. **Quản trị viên tenant** - Lưu trong bảng `tenant.users` với vai trò admin
3. **Người dùng tenant** - Lưu trong bảng `tenant.users` với vai trò thông thường

Tuy nhiên, việc xử lý xác thực trên frontend chưa được đồng nhất, dẫn đến một số vấn đề:

- Xử lý token không nhất quán
- Xử lý lỗi 401 chưa chính xác
- Thiếu tài liệu chi tiết về luồng xác thực

## Giải pháp

1. **Chuẩn hóa việc lưu trữ token trên frontend**:
   - System Admin: `localStorage.token`, `localStorage.user`, `localStorage.schema_name`
   - Tenant Admin: `localStorage.tenant_token`, `localStorage.tenant_user`, `localStorage.schema_name`
   - Tenant User: `localStorage.user_token`, `localStorage.user_info`, `localStorage.user_schema_name`

2. **Chuẩn hóa API interceptor**:
   - Xác định đúng loại endpoint
   - Thêm token và schema name vào header phù hợp
   - Xử lý lỗi 401 đúng cách cho từng loại người dùng

3. **Tạo tài liệu chi tiết**:
   - Cấu trúc xác thực toàn diện
   - Sơ đồ luồng xác thực
   - Danh sách kiểm tra triển khai
   - Hướng dẫn xử lý API request/response

## Cập nhật đã thực hiện

1. **Cập nhật API interceptor**:
   - Thêm kiểm tra `url` tồn tại trước khi gọi `includes()`
   - Thêm schema name vào header thay vì chỉ log ra console
   - Cải thiện xử lý lỗi 401

2. **Tạo tài liệu mới**:
   - `docs/authentication-architecture.md`
   - `docs/auth-flow-diagram.md`
   - `docs/auth-implementation-checklist.md`
   - `docs/api-interceptor-guide.md`
   - `docs/auth-update-summary.md`

3. **Cập nhật README** để tham chiếu đến tài liệu mới

## Lợi ích

1. **Nhất quán**: Đảm bảo mọi thành viên trong nhóm hiểu và triển khai xác thực theo cùng một cách
2. **Dễ bảo trì**: Tài liệu rõ ràng giúp dễ dàng bảo trì và mở rộng hệ thống
3. **Giảm lỗi**: Xử lý xác thực đúng cách giúp giảm lỗi đăng nhập/đăng xuất
4. **Bảo mật tốt hơn**: Xử lý token và phiên làm việc đúng cách tăng tính bảo mật

## Kiểm tra và xác nhận

Sử dụng "Authentication Implementation Checklist" để kiểm tra và xác nhận rằng ứng dụng:
- Xử lý đúng các loại người dùng
- Lưu trữ token nhất quán
- Xử lý lỗi xác thực đúng cách
- Chuyển hướng đến trang đăng nhập phù hợp

## Hướng dẫn cho nhóm phát triển

1. Đọc "Authentication Architecture" để hiểu cấu trúc toàn diện
2. Sử dụng "Authentication Implementation Checklist" khi triển khai tính năng mới
3. Tham khảo "API Interceptor Guide" khi làm việc với API
4. Tuân thủ các quy tắc đặt tên và lưu trữ token
