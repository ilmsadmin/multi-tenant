// tenant.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Chuẩn hóa schema name để tránh các ký tự đặc biệt
    const schemaName = `tenant_${createTenantDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Tạo tenant mới
    const tenant = this.tenantRepository.create({
      name: createTenantDto.name,
      domain: createTenantDto.domain,
      schema_name: schemaName,
      package_id: createTenantDto.package_id,
    });

    // Lưu tenant vào database
    const savedTenant = await this.tenantRepository.save(tenant);

    // Tạo schema và các bảng cần thiết
    await this.createTenantSchema(schemaName);

    return savedTenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }
  async findOne(id: number): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { domain } });
  }

  async findBySchemaName(schemaName: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { schema_name: schemaName } });
  }

  async remove(id: number): Promise<void> {
    const tenant = await this.findOne(id);
    if (tenant) {
      // Xóa schema của tenant
      await this.dropTenantSchema(tenant.schema_name);
      // Xóa tenant từ database
      await this.tenantRepository.delete(id);
    }
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    // Sử dụng raw query để tạo schema và các bảng
    await this.dataSource.query(`SELECT create_tenant_schema($1)`, [schemaName]);
  }

  private async dropTenantSchema(schemaName: string): Promise<void> {
    // Xóa schema
    await this.dataSource.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
  }
}
