import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/services/redis.service';
import { AuthLevel } from '../interfaces/auth.interfaces';

/**
 * Middleware để kiểm tra quyền truy cập dựa trên level (System, Tenant, User)
 */
@Injectable()
export class AuthLevelMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthLevelMiddleware.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Lấy token từ header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const token = authHeader.substring(7);
      
      // Giải mã token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET') || 'supersecretkey',
      });

      // Kiểm tra level required trong route
      const requiredLevel = req.path.split('/')[1]; // Lấy segment đầu tiên sau "/"
      
      // Kiểm tra quyền truy cập dựa trên cấp độ
      if (requiredLevel === 'system' && payload.level !== 'system') {
        this.logger.warn(`Access denied: ${payload.username} (${payload.level}) tried to access system endpoint`);
        throw new UnauthorizedException('Không có quyền truy cập API hệ thống');
      }
      
      if (requiredLevel === 'tenant' && !['system', 'tenant'].includes(payload.level)) {
        this.logger.warn(`Access denied: ${payload.username} (${payload.level}) tried to access tenant endpoint`);
        throw new UnauthorizedException('Không có quyền truy cập API quản lý tenant');
      }
      
      // Kiểm tra session
      const sessionKey = `${payload.tenantId || 'system'}:${payload.sub}:${payload.level}`;
      const session = await this.redisService.getSession(sessionKey);
      
      if (!session) {
        this.logger.warn(`Invalid session for ${payload.username}`);
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc hết hạn');
      }
      
      // Cập nhật thời gian hoạt động cuối
      await this.redisService.updateSession(sessionKey, { lastActivity: new Date() });
      
      // Gắn thông tin user vào request
      req.user = {
        userId: payload.sub,
        username: payload.username,
        level: payload.level,
        tenantId: payload.tenantId,
        roles: payload.roles,
        permissions: payload.permissions,
      };
      
      next();
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      throw new UnauthorizedException('Không thể xác thực người dùng');
    }
  }
}
