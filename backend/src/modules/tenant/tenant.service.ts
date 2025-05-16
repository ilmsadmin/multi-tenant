// tenant.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, Like } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantModule } from './entities/tenant-module.entity';
import { CreateTenantDto, TenantStatus } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ModuleStatus, TenantModuleActivationDto } from './dto/tenant-module-activation.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantModule)
    private tenantModuleRepository: Repository<TenantModule>,
    private dataSource: DataSource,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Chuẩn hóa schema name để tránh các ký tự đặc biệt
    const schemaName = `tenant_${createTenantDto.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Kiểm tra xem schema name đã tồn tại chưa
    const existingSchema = await this.findBySchemaName(schemaName);
    if (existingSchema) {
      throw new ConflictException(`Schema '${schemaName}' đã tồn tại`);
    }

    // Kiểm tra domain nếu có
    if (createTenantDto.domain) {
      const existingDomain = await this.findByDomain(createTenantDto.domain);
      if (existingDomain) {
        throw new ConflictException(`Domain '${createTenantDto.domain}' đã được sử dụng`);
      }
    }
    
    // Tạo tenant mới
    const tenant = this.tenantRepository.create({
      name: createTenantDto.name,
      domain: createTenantDto.domain,
      schema_name: schemaName,
      package_id: createTenantDto.package_id,
      status: createTenantDto.status || TenantStatus.ACTIVE,
      description: createTenantDto.description,
    });

    // Bắt đầu transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lưu tenant vào database
      const savedTenant = await this.tenantRepository.save(tenant);

      // Tạo schema và các bảng cần thiết
      await this.createTenantSchema(schemaName);

      // Commit transaction
      await queryRunner.commitTransaction();
      return savedTenant;
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Không thể tạo tenant: ${error.message}`);
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(options?: {
    search?: string;
    status?: TenantStatus;
    skip?: number;
    take?: number;
  }): Promise<{ data: Tenant[]; total: number }> {
    const { search, status, skip = 0, take = 10 } = options || {};
    
    const where: FindOptionsWhere<Tenant> = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.tenantRepository.findAndCount({
      where,
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }
  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ 
      where: { id },
      relations: ['modules'],
    });
    
    if (!tenant) {
      throw new NotFoundException(`Tenant với ID ${id} không tồn tại`);
    }
    
    return tenant;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { domain } });
  }

  async findBySchemaName(schemaName: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { schema_name: schemaName } });
  }

  async remove(id: number): Promise<void> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant với ID ${id} không tồn tại`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Xóa schema của tenant
      await this.dropTenantSchema(tenant.schema_name);
      
      // Xóa tenant từ database
      await this.tenantRepository.delete(id);
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Không thể xóa tenant: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant với ID ${id} không tồn tại`);
    }

    // Kiểm tra domain nếu có thay đổi
    if (updateTenantDto.domain && updateTenantDto.domain !== tenant.domain) {
      const existingDomain = await this.findByDomain(updateTenantDto.domain);
      if (existingDomain && existingDomain.id !== id) {
        throw new ConflictException(`Domain '${updateTenantDto.domain}' đã được sử dụng`);
      }
    }

    // Update các trường có thể thay đổi
    Object.assign(tenant, {
      ...(updateTenantDto.name && { name: updateTenantDto.name }),
      ...(updateTenantDto.domain && { domain: updateTenantDto.domain }),
      ...(updateTenantDto.package_id && { package_id: updateTenantDto.package_id }),
      ...(updateTenantDto.status && { status: updateTenantDto.status }),
      ...(updateTenantDto.description !== undefined && { description: updateTenantDto.description }),
    });

    return this.tenantRepository.save(tenant);
  }

  async changeStatus(id: number, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant với ID ${id} không tồn tại`);
    }

    tenant.status = status;
    return this.tenantRepository.save(tenant);
  }

  async activateModule(tenantId: number, activationDto: TenantModuleActivationDto): Promise<TenantModule> {
    // Kiểm tra tenant tồn tại
    const tenant = await this.findOne(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant với ID ${tenantId} không tồn tại`);
    }

    // Kiểm tra xem đã có mapping giữa tenant và module chưa
    let tenantModule = await this.tenantModuleRepository.findOne({
      where: {
        tenant_id: tenantId,
        module_id: activationDto.module_id,
      },
    });

    if (tenantModule) {
      // Cập nhật mapping hiện tại
      tenantModule.status = activationDto.status;
      
      // Cập nhật settings nếu có
      if (activationDto.settings) {
        tenantModule.settings = activationDto.settings;
      }
    } else {
      // Tạo mapping mới
      tenantModule = this.tenantModuleRepository.create({
        tenant_id: tenantId,
        module_id: activationDto.module_id,
        status: activationDto.status,
        settings: activationDto.settings || {},
      });
    }

    return this.tenantModuleRepository.save(tenantModule);
  }

  async getTenantModules(tenantId: number): Promise<TenantModule[]> {
    // Kiểm tra tenant tồn tại
    const tenant = await this.findOne(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant với ID ${tenantId} không tồn tại`);
    }

    // Lấy danh sách modules của tenant
    return this.tenantModuleRepository.find({
      where: { tenant_id: tenantId },
      order: { id: 'ASC' },
    });
  }

  async getTenantModule(tenantId: number, moduleId: number): Promise<TenantModule> {
    // Kiểm tra tenant tồn tại
    await this.findOne(tenantId);

    // Lấy thông tin module của tenant
    const tenantModule = await this.tenantModuleRepository.findOne({
      where: {
        tenant_id: tenantId,
        module_id: moduleId,
      },
    });

    if (!tenantModule) {
      throw new NotFoundException(`Module với ID ${moduleId} chưa được gán cho Tenant với ID ${tenantId}`);
    }

    return tenantModule;
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    // Sử dụng raw query để tạo schema và các bảng
    await this.dataSource.query(`SELECT create_tenant_schema($1)`, [schemaName]);
  }

  private async dropTenantSchema(schemaName: string): Promise<void> {
    // Xóa schema
    await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  }
}
