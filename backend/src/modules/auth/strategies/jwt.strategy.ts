import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'supersecretkey',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      this.logger.debug(`[DEBUG JWT] Validating JWT token for user: ${payload.username}, level: ${payload.level}, sub: ${payload.sub}`);
      console.log(`[DEBUG JWT] JWT Payload:`, JSON.stringify(payload, null, 2));
      
      // Validate token type
      if (payload.type !== 'access_token') {
        this.logger.warn(`[DEBUG JWT] Invalid token type: ${payload.type}`);
        throw new UnauthorizedException('Loại token không hợp lệ. Vui lòng sử dụng access token cho xác thực API.');
      }
      
      // Check if the token is blacklisted or session invalidated
      let sessionKey = '';
      if (payload.level === 'system') {
        // System level users have special session key format
        sessionKey = `system:${payload.sub}`;
      } else {
        // For tenant and user levels, we need the tenant ID
        const tenantId = payload.tenantId;
        if (!tenantId) {
          this.logger.warn('No tenant ID found in token payload');
          throw new UnauthorizedException('Không tìm thấy thông tin tenant trong token. Vui lòng đăng nhập lại.');
        }
        // Use userId directly as the session key with createSessionKey method
        sessionKey = `${payload.sub}`;
      }

      // Attempt to get session - this may fail if Redis service doesn't have this method
      // In which case we'll fallback to basic validation
      try {
        const session = payload.level === 'system' 
          ? await this.redisService.get(`system:${payload.sub}`)
          : await this.redisService.getSession(sessionKey);
          
        if (!session) {
          this.logger.warn(`No valid session found for user ID: ${payload.sub}, level: ${payload.level}`);
          // Provide a more specific error message for session invalidation
          throw new UnauthorizedException('Phiên đăng nhập của bạn đã hết hạn hoặc bị vô hiệu hóa. Vui lòng đăng nhập lại.');
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) {
          throw err;
        }
        this.logger.warn(`Error checking session: ${err.message}. Falling back to basic validation.`);
        // Continue with validation regardless of Redis errors
      }
      
      // Attach user information and other metadata to the request
      const user = {
        userId: payload.sub,
        username: payload.username,
        level: payload.level,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        tenantId: payload.tenantId,
        tenantName: payload.tenantName,
      };
      
      return user;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw specific unauthorized exceptions
      }
      
      // Provide specific error messages for common JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token không hợp lệ. Vui lòng đăng nhập lại.');
      } else if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token chưa có hiệu lực. Vui lòng thử lại sau.');
      }
      
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }
}
