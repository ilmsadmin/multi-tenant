import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu không yêu cầu quyền cụ thể, cho phép truy cập
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }
    
    // Cấp System luôn có tất cả quyền
    if (user.level === 'system') {
      return true;
    }
    
    // Kiểm tra xem người dùng có danh sách quyền không
    if (!Array.isArray(user.permissions)) {
      return false;
    }
    
    // Kiểm tra xem người dùng có tất cả các quyền cần thiết không
    return requiredPermissions.every(permission => user.permissions.includes(permission));
  }
}
