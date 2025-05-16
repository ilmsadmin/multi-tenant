import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SystemLogService } from './services/system-log.service';
import { ModuleConfigService } from './services/module-config.service';

@Controller('mongo')
export class MongoDBController {
  constructor(
    private readonly systemLogService: SystemLogService,
    private readonly moduleConfigService: ModuleConfigService,
  ) {}

  @Post('logs')
  async createLog(@Body() logData: any) {
    return this.systemLogService.create(logData);
  }

  @Get('logs')
  async getAllLogs() {
    return this.systemLogService.findAll();
  }

  @Get('logs/tenant/:tenantId')
  async getTenantLogs(@Param('tenantId') tenantId: string) {
    return this.systemLogService.findByTenant(tenantId);
  }

  @Post('configs')
  async setConfig(@Body() body: { tenant_id: string; module_id: string; config: any }) {
    const { tenant_id, module_id, config } = body;
    return this.moduleConfigService.upsert(tenant_id, module_id, config);
  }

  @Get('configs/tenant/:tenantId')
  async getTenantConfigs(@Param('tenantId') tenantId: string) {
    return this.moduleConfigService.findByTenant(tenantId);
  }
}
