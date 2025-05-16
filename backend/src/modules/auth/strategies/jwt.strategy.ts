import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '../../users/services/user.service';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
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
    const sessionKey = `${payload.tenantId}:${payload.sub}`;
    const session = await this.redisService.getSession(sessionKey);

    // Kiểm tra xem session có tồn tại không
    if (!session) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    try {
      // Lấy thông tin user từ database
      const user = await this.userService.findOne(payload.sub);
      
      // Kiểm tra trạng thái tài khoản
      if (user.status !== 'active') {
        throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
      }

      // Cập nhật thời gian hoạt động cuối
      await this.redisService.setSession(sessionKey, {
        ...session,
        lastActivity: new Date(),
      });

      // Trả về thông tin user và tenant cho các guards
      return {
        userId: payload.sub,
        username: payload.username,
        tenantId: payload.tenantId,
        roles: payload.roles,
        permissions: payload.permissions,
      };
    } catch (error) {
      throw new UnauthorizedException('Không thể xác thực tài khoản');
    }
  }
}
