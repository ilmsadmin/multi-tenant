import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import { SystemAuthController } from './controllers/system-auth.controller';
import { TenantAuthController } from './controllers/tenant-auth.controller';
import { UserAuthController } from './controllers/user-auth.controller';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserModule } from '../users/user.module';
import { RedisModule } from '../redis/redis.module';
import { MongoDBModule } from '../mongodb/mongodb.module';
import { AuthMiddlewareModule } from './middleware/middleware.module';

@Module({  imports: [
    UserModule,
    RedisModule,
    MongoDBModule,
    AuthMiddlewareModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'supersecretkey',
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1d'
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    SystemAuthController,
    TenantAuthController,
    UserAuthController
  ],  providers: [
    AuthService, 
    JwtStrategy, 
    LocalStrategy,
    JwtService, // Add JwtService explicitly as a provider
    JwtAuthGuard, // Thêm JwtAuthGuard vào providers trực tiếp để có thể export
    RolesGuard,   // Thêm RolesGuard vào providers trực tiếp để có thể export
    PermissionsGuard, // Thêm PermissionsGuard vào providers trực tiếp để có thể export
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },  ],
  exports: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
