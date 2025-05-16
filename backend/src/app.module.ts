import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './modules/tenant/tenant.module';
import { PackageModule } from './modules/packages/package.module';
import { ModuleModule } from './modules/modules/module.module';
import { MongoDBModule } from './modules/mongodb/mongodb.module';
import { RedisModule } from './modules/redis/redis.module';
import { TenantSchemaMiddleware } from './modules/tenant/middleware/tenant-schema.middleware';

import databaseConfig from './config/database.config';
import mongodbConfig from './config/mongodb.config';
import redisConfig from './config/redis.config';

@Module({  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, mongodbConfig, redisConfig],
    }),    TypeOrmModule.forRootAsync({
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
    }),
    TenantModule,
    PackageModule,
    ModuleModule,
    MongoDBModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Áp dụng middleware cho tất cả các route bắt đầu với /api/tenant-data
    consumer
      .apply(TenantSchemaMiddleware)
      .forRoutes('api/tenant-data/*');
  }
}
