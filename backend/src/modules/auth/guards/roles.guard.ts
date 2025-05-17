import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu không yêu cầu vai trò cụ thể, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Kiểm tra xem user có thông tin roles
    if (!user || !Array.isArray(user.roles)) {
      return false;
    }

    // Cho phép người dùng cấp system truy cập vào mọi role
    if (user.level === 'system') {
      return true;
    }
    
    // Kiểm tra xem user có vai trò được yêu cầu không
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
