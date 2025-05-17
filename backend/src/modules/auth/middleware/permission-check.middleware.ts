import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthLevel } from '../interfaces/auth.interfaces';

/**
 * Middleware để kiểm tra quyền truy cập chi tiết dựa trên permissions
 */
@Injectable()
export class PermissionCheckMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PermissionCheckMiddleware.name);
  
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenException('Không tìm thấy thông tin người dùng');
      }
      
      const { method, path } = req;
      const requiredPermission = this.mapToPermission(method, path);
      
      if (!requiredPermission) {
        // Nếu không xác định được permission, cho phép
        return next();
      }
      
      // Trường hợp user là system admin luôn cho phép
      if (user.level === 'system' && user.roles?.includes('system_admin')) {
        return next();
      }
      
      // Trường hợp tài khoản tenant admin có quyền trong phạm vi tenant
      if (user.level === 'tenant' && 
          user.roles?.includes('tenant_admin') &&
          this.isTenantScopePermission(requiredPermission)) {
        return next();
      }
      
      // Kiểm tra quyền cụ thể
      const hasPermission = user.permissions?.includes(requiredPermission);
      
      if (!hasPermission) {
        this.logger.warn(`Permission denied: ${user.username} tried to access ${method} ${path} without ${requiredPermission} permission`);
        throw new ForbiddenException(`Không đủ quyền truy cập: ${requiredPermission}`);
      }
      
      next();
    } catch (error) {
      this.logger.error(`Permission check error: ${error.message}`);
      throw new ForbiddenException('Không đủ quyền truy cập');
    }
  }
  
  /**
   * Chuyển đổi HTTP method và path thành permission string
   */
  private mapToPermission(method: string, path: string): string | null {
    const segments = path.split('/').filter(s => s);
    if (segments.length < 2) return null;
    
    // Ví dụ: GET /users => users:read, POST /users => users:create
    const resource = segments[1];
    let action: string;
    
    switch (method.toUpperCase()) {
      case 'GET':
        action = 'read';
        break;
      case 'POST':
        action = 'create';
        break;
      case 'PUT':
      case 'PATCH':
        action = 'update';
        break;
      case 'DELETE':
        action = 'delete';
        break;
      default:
        action = 'access';
    }
    
    return `${resource}:${action}`;
  }
  
  /**
   * Kiểm tra xem permission có trong phạm vi tenant hay không
   */
  private isTenantScopePermission(permission: string): boolean {
    // Danh sách resource thuộc phạm vi tenant
    const tenantResources = ['users', 'roles', 'user_data', 'settings'];
    const resource = permission.split(':')[0];
    
    return tenantResources.includes(resource);
  }
}
