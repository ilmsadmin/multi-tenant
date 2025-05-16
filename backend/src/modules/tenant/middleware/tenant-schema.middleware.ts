// middleware/tenant-schema.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../tenant.service';
import { DataSource } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantSchemaMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantSchemaMiddleware.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Nếu đường dẫn là từ API hệ thống thì không cần xử lý tenant
    if (this.isSystemRoute(req.path)) {
      return next();
    }

    let tenant: Tenant | null = null;

    // Thứ tự ưu tiên: 
    // 1. x-tenant-id header
    // 2. tenant_id query param
    // 3. domain từ hostname
    const tenantId = req.headers['x-tenant-id'] as string || req.query.tenant_id as string;
    const tenantDomain = this.extractDomain(req);

    try {
      if (tenantId) {
        // Tìm tenant theo ID
        tenant = await this.tenantService.findOne(parseInt(tenantId, 10));
      } else if (tenantDomain) {
        // Tìm tenant theo domain
        tenant = await this.tenantService.findByDomain(tenantDomain);
      }

      if (!tenant) {
        // Nếu không tìm thấy tenant, đối với API tenant thì chạy trong schema public
        if (req.path.startsWith('/api/tenants')) {
          await this.dataSource.query(`SET search_path TO public`);
          return next();
        }
        
        return res.status(400).json({ 
          statusCode: 400,
          message: 'Tenant không tồn tại hoặc không được xác định',
          error: 'Bad Request'
        });
      }

      // Kiểm tra trạng thái của tenant
      if (tenant.status !== 'active') {
        return res.status(403).json({ 
          statusCode: 403,
          message: `Tenant "${tenant.name}" hiện đang ${tenant.status === 'suspended' ? 'bị tạm ngưng' : 'không hoạt động'}`,
          error: 'Forbidden'
        });
      }

      // Chuyển schema cho request hiện tại
      await this.dataSource.query(`SET search_path TO "${tenant.schema_name}",public`);

      // Lưu thông tin tenant vào request để sử dụng trong các middleware/controller sau
      (req as any).tenant = tenant;

      this.logger.debug(`Đã chuyển sang schema "${tenant.schema_name}" cho tenant "${tenant.name}"`);
      
      next();
    } catch (error) {
      this.logger.error(`Lỗi trong tenant middleware: ${error.message}`, error.stack);
      return res.status(500).json({ 
        statusCode: 500,
        message: 'Lỗi server khi xử lý tenant',
        error: 'Internal Server Error'
      });
    }
  }

  private isSystemRoute(path: string): boolean {
    // Các route quản lý hệ thống không cần tenant schema
    return path.startsWith('/api/docs') || 
           path === '/api/health' || 
           path.startsWith('/api/system');
  }

  private extractDomain(req: Request): string | null {
    const host = req.hostname || req.headers.host?.split(':')[0];
    
    if (!host) {
      return null;
    }

    // Nếu sử dụng subdomain như tenant.example.com
    if (host.includes('.') && !host.endsWith('localhost')) {
      const parts = host.split('.');
      if (parts.length >= 3) {
        // Trường hợp tenant.example.com
        return parts[0];
      }
    }

    return null;
  }
}
