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
  }  async validate(req: Request, username: string, password: string): Promise<any> {
    this.logger.debug(`LocalStrategy.validate called with username: ${username}`);
    this.logger.debug(`Password received (first 3 chars): ${password.substring(0, 3)}...`);
    
    // Lấy tenant_id từ request
    const tenantId = req.headers['x-tenant-id'] ? parseInt(req.headers['x-tenant-id'] as string, 10) : null;
    this.logger.debug(`Tenant ID from request headers: ${tenantId}`);
    
    if (!tenantId) {
      this.logger.error('Tenant ID missing from request headers');
      throw new UnauthorizedException('Tenant không hợp lệ');
    }

    // Log all request headers for debugging
    this.logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
    
    // Check if tenant is attached to request
    this.logger.debug(`Tenant in request: ${(req as any).tenant ? JSON.stringify({
      id: (req as any).tenant.id,
      name: (req as any).tenant.name,
      schema_name: (req as any).tenant.schema_name
    }) : 'Not found'}`);
      try {
      this.logger.debug(`Calling authService.validateUser with tenantId: ${tenantId}, username: ${username}, password: [MASKED]`);
      this.logger.debug(`[CRITICAL DEBUG] Validating user credentials`);
      const user = await this.authService.validateUser(tenantId, username, password);
      this.logger.debug(`Authentication result for ${username}: ${user ? 'Success' : 'Failed'}`);
      
      if (!user) {
        this.logger.debug(`[CRITICAL DEBUG] User validation failed for username: ${username}`);
        this.logger.debug('User validation failed - username or password incorrect');
        throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      
      this.logger.debug(`Authentication successful for user: ${JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles ? user.roles.map(r => r.name) : []
      })}`);
      
      this.logger.debug(`[CRITICAL DEBUG] Adding tenantId ${tenantId} to user object: ${JSON.stringify(user)}`);
      const result = { ...user, tenantId };
      this.logger.debug(`[CRITICAL DEBUG] Final user object: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error during authentication: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }
}
