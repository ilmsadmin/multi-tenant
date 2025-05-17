import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AUTH_LEVEL_KEY } from '../decorators/auth-level.decorator';
import { AuthLevel } from '../interfaces/auth.interfaces';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // Kiểm tra nếu route được đánh dấu là public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    // Tiếp tục xác thực JWT
    return super.canActivate(context);
  }
  handleRequest(err, user, info, context) {
    // Nếu có lỗi hoặc không có user thì ném lỗi UnauthorizedException
    if (err || !user) {
      throw err || new UnauthorizedException('Vui lòng đăng nhập');
    }
    
    // Kiểm tra cấp độ truy cập (system, tenant, user)
    const requiredLevel = this.reflector.get<AuthLevel>(AUTH_LEVEL_KEY, context.getHandler());
    if (requiredLevel && user.level !== requiredLevel) {
      // Kiểm tra cấp độ cao hơn (system > tenant > user)
      // System có thể truy cập tất cả các cấp
      if (user.level === 'system') {
        return user;
      }
      
      // Tenant admin có thể truy cập cấp tenant và user
      if (user.level === 'tenant' && requiredLevel === 'user') {
        return user;
      }
      
      this.logger.warn(`Access denied: ${user.username} (${user.level}) tried to access ${requiredLevel} level endpoint`);
      throw new UnauthorizedException(`Bạn không có quyền truy cập vào tài nguyên cấp ${requiredLevel}`);
    }
    return user;
  }
}
