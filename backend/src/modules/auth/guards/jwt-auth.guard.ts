import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
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

  handleRequest(err, user, info) {
    // Nếu có lỗi hoặc không có user thì ném lỗi UnauthorizedException
    if (err || !user) {
      throw err || new UnauthorizedException('Vui lòng đăng nhập');
    }
    return user;
  }
}
