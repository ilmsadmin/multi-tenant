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
  ) {}  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`Processing request path: ${req.path}, method: ${req.method}`);
    this.logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
    this.logger.debug(`Query params: ${JSON.stringify(req.query)}`);
    this.logger.debug(`Body: ${JSON.stringify(req.body)}`);

    // Nếu đường dẫn là từ API hệ thống thì không cần xử lý tenant
    if (this.isSystemRoute(req.path)) {
      this.logger.debug(`Skipping tenant middleware for system route: ${req.path}`);
      return next();
    }

    let tenant: Tenant | null = null;

    // Thứ tự ưu tiên: 
    // 1. x-tenant-id header
    // 2. tenant_id query param
    // 3. tenant_id từ body (nếu có)
    // 4. schema_name từ query param hoặc URL
    // 5. domain từ hostname
    const tenantIdHeader = req.headers['x-tenant-id'] as string; 
    const tenantIdQuery = req.query.tenant_id as string;
    const tenantIdBody = req.body?.tenantId;
    const schemaNameQuery = req.query.schema as string;
    const schemaNamePath = this.extractSchemaFromPath(req.path);
    
    const tenantId = tenantIdHeader || tenantIdQuery || tenantIdBody;
    const schemaName = schemaNameQuery || schemaNamePath;
    const tenantDomain = this.extractDomain(req);
    
    this.logger.log(`[TENANT DEBUG] Request path: ${req.path}, method: ${req.method}`);
    this.logger.log(`[TENANT DEBUG] Tenant ID from header: ${tenantIdHeader || 'not provided'}`);
    this.logger.log(`[TENANT DEBUG] Tenant ID from query: ${tenantIdQuery || 'not provided'}`);
    this.logger.log(`[TENANT DEBUG] Tenant ID from body: ${tenantIdBody || 'not provided'}`);
    this.logger.log(`[TENANT DEBUG] Schema name from query: ${schemaNameQuery || 'not provided'}`);
    this.logger.log(`[TENANT DEBUG] Schema name from path: ${schemaNamePath || 'not provided'}`);
    this.logger.log(`[TENANT DEBUG] Final Tenant ID used: ${tenantId || 'not provided'}`);
    this.logger.log(`[TENANT DEBUG] Final Schema name used: ${schemaName || 'not provided'}`);
    this.logger.debug(`Tenant identification - ID: ${tenantId || 'not provided'}, Schema: ${schemaName || 'not provided'}, Domain: ${tenantDomain || 'not provided'}`);

    try {
      if (tenantId) {
        // Tìm tenant theo ID
        this.logger.debug(`Attempting to find tenant by ID: ${tenantId}`);
        tenant = await this.tenantService.findOne(parseInt(tenantId, 10));
      } else if (schemaName) {
        // Tìm tenant theo schema name
        this.logger.debug(`Attempting to find tenant by schema name: ${schemaName}`);
        tenant = await this.tenantService.findBySchemaName(schemaName);
      } else if (tenantDomain) {
        // Tìm tenant theo domain
        this.logger.debug(`Attempting to find tenant by domain: ${tenantDomain}`);
        tenant = await this.tenantService.findByDomain(tenantDomain);
      }      if (tenant) {
        this.logger.log(`[TENANT DEBUG] Found tenant ${tenant.id} (${tenant.name}) with schema ${tenant.schema_name}`);
      } else {
        this.logger.log(`[TENANT DEBUG] Tenant lookup failed - Could not find tenant with ID: ${tenantId}`);
      }

      if (!tenant) {
        // Nếu không tìm thấy tenant, đối với API tenant thì chạy trong schema public
        if (req.path.startsWith('/api/tenants')) {
          this.logger.debug(`Setting schema to public for tenant API without tenant context`);
          await this.dataSource.query(`SET search_path TO public`);
          return next();
        }
        
        this.logger.warn(`Tenant not found - Returning 400 Bad Request`);
        return res.status(400).json({ 
          statusCode: 400,
          message: 'Tenant không tồn tại hoặc không được xác định',
          error: 'Bad Request'
        });
      }

      // Kiểm tra trạng thái của tenant
      if (tenant.status !== 'active') {
        this.logger.warn(`Tenant "${tenant.name}" is not active, status: ${tenant.status} - Returning 403 Forbidden`);
        return res.status(403).json({ 
          statusCode: 403,
          message: `Tenant "${tenant.name}" hiện đang ${tenant.status === 'suspended' ? 'bị tạm ngưng' : 'không hoạt động'}`,
          error: 'Forbidden'
        });
      }

      // Chuyển schema cho request hiện tại
      this.logger.debug(`Attempting to set search_path to "${tenant.schema_name}" for tenant "${tenant.name}" (ID: ${tenant.id})`);
      await this.dataSource.query(`SET search_path TO "${tenant.schema_name}",public`);

      // Verify the schema was changed correctly
      const currentSchema = await this.dataSource.query(`SHOW search_path`);
      this.logger.debug(`Current search_path after change: ${JSON.stringify(currentSchema)}`);
      
      // Get current database name
      const dbNameResult = await this.dataSource.query(`SELECT current_database()`);
      this.logger.debug(`Current database: ${JSON.stringify(dbNameResult)}`);
      
      // Check if tables exist in the schema
      const tablesResult = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = split_part(current_setting('search_path'), ',', 1)
      `);
      this.logger.debug(`Tables in schema ${tenant.schema_name}: ${JSON.stringify(tablesResult.map(t => t.table_name))}`);

      // Lưu thông tin tenant vào request để sử dụng trong các middleware/controller sau
      (req as any).tenant = tenant;

      this.logger.debug(`Successfully switched to schema "${tenant.schema_name}" for tenant "${tenant.name}"`);
      next();
    } catch (error) {
      this.logger.error(`Error in tenant middleware: ${error.message}`, error.stack);
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

  private extractSchemaFromPath(path: string): string | null {
    // Tìm schema từ path pattern /tenants/check/:schema
    const checkSchemaPattern = /\/tenants\/check\/([^\/]+)/;
    const match = path.match(checkSchemaPattern);
    
    if (match && match[1]) {
      return match[1];
    }

    return null;
  }
}
