# Cải thiện thông báo lỗi xác thực trong hệ thống Multi-tenant

## Tổng quan

Tài liệu này mô tả các cải tiến được thực hiện để nâng cao chất lượng thông báo lỗi xác thực trong hệ thống Multi-tenant. Những cải tiến này giúp người dùng hiểu rõ hơn về nguyên nhân lỗi khi đăng nhập và các vấn đề liên quan đến xác thực.

## Vấn đề

Hệ thống trước đây có một số hạn chế trong việc xử lý và hiển thị thông báo lỗi xác thực:

1. **Thông báo lỗi chung chung**: Các thông báo như "Thông tin đăng nhập không hợp lệ" không cung cấp đủ thông tin để người dùng hiểu được vấn đề cụ thể.

2. **Không phân biệt các loại lỗi**: Hệ thống không phân biệt rõ ràng giữa các tình huống lỗi khác nhau như tài khoản không tồn tại, mật khẩu sai, tenant không tồn tại, token hết hạn, v.v.

3. **Lỗi khi Redis không khả dụng**: Người dùng nhập đúng thông tin đăng nhập nhưng vẫn nhận lỗi 401 khi Redis không hoạt động.

## Giải pháp

### 1. Tạo cơ chế thông báo lỗi chi tiết

Đã thêm phương thức `getAuthenticationErrorMessage` vào `auth.service.ts` để cung cấp thông báo lỗi cụ thể cho từng tình huống:

```typescript
getAuthenticationErrorMessage(error: string): string {
  switch (error) {
    case 'user_not_found':
      return 'Tài khoản không tồn tại. Vui lòng kiểm tra tên đăng nhập.';
    case 'tenant_not_found':
      return 'Tenant không tồn tại hoặc không hợp lệ. Vui lòng kiểm tra thông tin tenant.';
    case 'invalid_credentials':
      return 'Mật khẩu không chính xác. Vui lòng kiểm tra lại mật khẩu.';
    case 'account_disabled':
      return 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
    case 'password_expired':
      return 'Mật khẩu đã hết hạn. Vui lòng đổi mật khẩu.';
    case 'missing_password':
      return 'Mật khẩu không được cung cấp. Vui lòng nhập mật khẩu.';
    case 'missing_username':
      return 'Tên đăng nhập không được cung cấp. Vui lòng nhập tên đăng nhập.';
    case 'session_expired':
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    default:
      return 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
  }
}
```

### 2. Cải thiện xử lý lỗi trong JWT Strategy

Đã cập nhật chiến lược JWT để xử lý tốt hơn các vấn đề với Redis và cung cấp thông báo lỗi cụ thể cho các tình huống token khác nhau:

```typescript
// Phân biệt các loại lỗi token khác nhau
if (error.name === 'TokenExpiredError') {
  throw new UnauthorizedException('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
} else if (error.name === 'JsonWebTokenError') {
  throw new UnauthorizedException('Token không hợp lệ. Vui lòng đăng nhập lại.');
} else if (error.name === 'NotBeforeError') {
  throw new UnauthorizedException('Token chưa có hiệu lực. Vui lòng thử lại sau.');
}
```

Đặc biệt quan trọng, đã thêm xử lý fallback khi Redis không hoạt động:

```typescript
catch (err) {
  if (err instanceof UnauthorizedException) {
    throw err;
  }
  this.logger.warn(`Error checking session: ${err.message}. Falling back to basic validation.`);
  // Continue with validation regardless of Redis errors
}
```

### 3. Thông báo lỗi cụ thể cho vấn đề tenant

Đã cải thiện thông báo lỗi khi tenant ID không được cung cấp hoặc không hợp lệ:

```typescript
if (!tenantId) {
  this.logger.error('Tenant ID missing from request headers');
  throw new UnauthorizedException('Không tìm thấy Tenant ID. Vui lòng đảm bảo tiêu đề x-tenant-id được cung cấp.');
}
```

### 4. Thông báo lỗi chi tiết cho đăng nhập hệ thống

Đã cải thiện thông báo lỗi cho quá trình đăng nhập system:

```typescript
if (!username) {
  throw new UnauthorizedException('Tên đăng nhập không được để trống cho đăng nhập hệ thống.');
}

if (!password) {
  throw new UnauthorizedException('Mật khẩu không được để trống cho đăng nhập hệ thống.');
}
```

## Lợi ích

1. **Trải nghiệm người dùng tốt hơn**: Người dùng nhận được thông báo lỗi rõ ràng và cụ thể, giúp họ hiểu vấn đề và có biện pháp khắc phục phù hợp.

2. **Giảm số lượng yêu cầu hỗ trợ**: Với thông báo lỗi chi tiết, người dùng có thể tự khắc phục nhiều vấn đề mà không cần liên hệ bộ phận hỗ trợ.

3. **Hệ thống ổn định hơn**: Việc xử lý lỗi Redis giúp hệ thống vẫn hoạt động ngay cả khi có vấn đề với dịch vụ Redis.

4. **Dễ dàng gỡ lỗi**: Các thông báo lỗi chi tiết giúp nhà phát triển dễ dàng xác định và sửa chữa vấn đề.

## Các tình huống lỗi được xử lý

Hệ thống giờ đây xử lý tốt hơn các tình huống lỗi sau:

1. Tài khoản không tồn tại
2. Mật khẩu không chính xác
3. Tenant không tồn tại hoặc không hợp lệ
4. Thiếu thông tin đăng nhập (username/password)
5. Token đã hết hạn
6. Token không hợp lệ
7. Token chưa có hiệu lực
8. Phiên đăng nhập đã hết hạn hoặc bị vô hiệu hóa
9. Redis không khả dụng
10. Thiếu thông tin tenant trong token

## Kết luận

Những cải tiến này đã giúp hệ thống xác thực trở nên mạnh mẽ và thân thiện với người dùng hơn. Việc cung cấp thông báo lỗi cụ thể và chi tiết là một phần quan trọng trong việc nâng cao trải nghiệm người dùng và tăng cường bảo mật cho hệ thống.
