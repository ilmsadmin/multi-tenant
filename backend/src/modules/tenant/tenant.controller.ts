// tenant.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  findAll(): Promise<Tenant[]> {
    return this.tenantService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Tenant | null> {
    return this.tenantService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.tenantService.remove(+id);
  }
}
