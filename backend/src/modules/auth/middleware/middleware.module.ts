import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../redis/redis.module';
import { AuthLevelMiddleware } from './auth-level.middleware';
import { PermissionCheckMiddleware } from './permission-check.middleware';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    RedisModule
  ],
  providers: [
    AuthLevelMiddleware,
    PermissionCheckMiddleware
  ],
  exports: [
    AuthLevelMiddleware,
    PermissionCheckMiddleware
  ]
})
export class AuthMiddlewareModule {}
