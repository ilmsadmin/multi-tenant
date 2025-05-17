import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }
    async validate(req: Request, username: string, password: string): Promise<any> {
    this.logger.debug(`LocalStrategy.validate called with username: ${username}`);
    
    // Lấy tenant_id từ request
    const tenantId = req.headers['x-tenant-id'] ? parseInt(req.headers['x-tenant-id'] as string, 10) : null;
    this.logger.debug(`Tenant ID from request headers: ${tenantId}`);      if (!tenantId) {
      this.logger.error('Tenant ID missing from request headers');
      throw new UnauthorizedException('Không tìm thấy Tenant ID. Vui lòng đảm bảo tiêu đề x-tenant-id được cung cấp.');
    }

    try {
      this.logger.debug(`Calling authService.validateUser with tenantId: ${tenantId}, username: ${username}`);
      const user = await this.authService.validateUser(tenantId, username, password);
      
      if (!user) {
        this.logger.debug(`User validation failed for username: ${username}`);
        // More specific error message for failed login attempts
        throw new UnauthorizedException('Đăng nhập thất bại. Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
      
      this.logger.debug(`Authentication successful for user: ${JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles ? user.roles.map(r => r.name) : []
      })}`);
      
      return { ...user, tenantId };
    } catch (error) {
      this.logger.error(`Error during authentication: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }
}
