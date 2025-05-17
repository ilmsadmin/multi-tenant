// tenant.module.ts
import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { TenantModule as TenantModuleEntity } from './entities/tenant-module.entity';
import { TenantSchemaMiddleware } from './middleware/tenant-schema.middleware';
import { json } from 'express';

/**
 * Module quản lý tenant trong hệ thống multi-tenant
 * 
 * Module này cung cấp:
 * - CRUD operations cho tenant
 * - Middleware để động chọn schema dựa vào tenant
 * - Service để quản lý và tạo schema cho tenant mới
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantModuleEntity]),
  ],
  controllers: [TenantController],
  providers: [
    TenantService,
  ],
  exports: [TenantService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Đảm bảo body-parser đã chạy trước tenant middleware
    // để có thể đọc tenantId từ body request
    consumer
      .apply(json())
      .forRoutes('*');
      
    consumer
      .apply(TenantSchemaMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
