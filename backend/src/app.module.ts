import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './modules/tenant/tenant.module';
import { PackageModule } from './modules/packages/package.module';
import { ModuleModule } from './modules/modules/module.module';
import { MongoDBModule } from './modules/mongodb/mongodb.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantSchemaMiddleware } from './modules/tenant/middleware/tenant-schema.middleware';
import { AuthLevelMiddleware } from './modules/auth/middleware/auth-level.middleware';
import { PermissionCheckMiddleware } from './modules/auth/middleware/permission-check.middleware';
import { AuthMiddlewareModule } from './modules/auth/middleware/middleware.module';

import databaseConfig from './config/database.config';
import mongodbConfig from './config/mongodb.config';
import redisConfig from './config/redis.config';

@Module({  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, mongodbConfig, redisConfig],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'supersecretkey',
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1d'
        },
      }),
      global: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        ssl: configService.get('database.ssl'),
        logging: ['error'],
        retryAttempts: 5,
        retryDelay: 3000,
        extra: {
          trustServerCertificate: true,
        },
      }),
    }),    TenantModule,
    PackageModule,
    ModuleModule,    MongoDBModule,
    RedisModule,
    UserModule,
    AuthModule,
    AuthMiddlewareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {  configure(consumer: MiddlewareConsumer) {
    // Áp dụng Tenant Schema middleware
    consumer
      .apply(TenantSchemaMiddleware)
      .forRoutes('api/tenant-data/*');
      // Áp dụng Authentication Level middleware cho tất cả các API được bảo vệ
    consumer
      .apply(AuthLevelMiddleware)
      .exclude(
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/tenant-login', method: RequestMethod.POST },
        { path: 'api/auth/system-login', method: RequestMethod.POST },
        { path: 'api/auth/refresh-token', method: RequestMethod.POST },
        'api/health',
        'api/public/*',
        'api/tenants/check/*', // Cho phép kiểm tra tenant mà không cần xác thực
      )
      .forRoutes('api/*');
      // Áp dụng Permission Check middleware sau khi xác thực
    consumer
      .apply(PermissionCheckMiddleware)
      .exclude(
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/tenant-login', method: RequestMethod.POST },
        { path: 'api/auth/system-login', method: RequestMethod.POST },
        { path: 'api/auth/refresh-token', method: RequestMethod.POST },
        'api/auth/logout',
        'api/health',
        'api/public/*',
        'api/tenants/check/*', // Cho phép kiểm tra tenant mà không cần xác thực
      )
      .forRoutes('api/*');
  }
}
