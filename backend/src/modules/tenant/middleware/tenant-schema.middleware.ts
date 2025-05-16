// middleware/tenant-schema.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../tenant.service';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantSchemaMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Lấy tenant_id từ header hoặc từ query params
    const tenantId = req.headers['x-tenant-id'] as string || req.query.tenant_id as string;

    if (!tenantId) {
      return next();
    }

    try {
      // Tìm tenant theo ID
      const tenant = await this.tenantService.findOne(parseInt(tenantId, 10));

      if (!tenant) {
        return res.status(400).json({ message: 'Tenant not found' });
      }

      // Chuyển schema cho request hiện tại
      await this.dataSource.query(`SET search_path TO ${tenant.schema_name},public`);

      // Lưu thông tin tenant vào request để sử dụng trong các middleware/controller sau
      (req as any).tenant = tenant;

      next();
    } catch (error) {
      console.error('Error in tenant middleware', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
