import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, key } = createPermissionDto;

    // Kiểm tra xem tên hoặc key đã tồn tại chưa
    const existingPermission = await this.permissionRepository.findOne({ 
      where: [{ name }, { key }] 
    });

    if (existingPermission) {
      if (existingPermission.name === name) {
        throw new ConflictException(`Quyền với tên "${name}" đã tồn tại`);
      }
      if (existingPermission.key === key) {
        throw new ConflictException(`Quyền với key "${key}" đã tồn tại`);
      }
    }

    // Tạo instance mới của Permission
    const permission = this.permissionRepository.create(createPermissionDto);

    // Lưu permission vào database
    return this.permissionRepository.save(permission);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    module?: string,
  ): Promise<{ items: Permission[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryBuilder.where(
        '(permission.name ILIKE :search OR permission.key ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Lọc theo module nếu có
    if (module) {
      queryBuilder.andWhere('permission.module = :module', { module });
    }

    // Tính toán skip và take dựa trên page và limit
    const skip = (page - 1) * limit;
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('permission.module', 'ASC')
      .addOrderBy('permission.name', 'ASC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException(`Quyền với ID ${id} không tồn tại`);
    }
    
    return permission;
  }

  async findByKey(key: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { key } });
    
    if (!permission) {
      throw new NotFoundException(`Quyền với key ${key} không tồn tại`);
    }
    
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const { name, key } = updatePermissionDto;
    
    // Kiểm tra xem quyền có tồn tại không
    const permission = await this.findOne(id);
    
    // Kiểm tra xem tên hoặc key đã tồn tại chưa (nếu được cập nhật)
    if (name && name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({ where: { name } });
      if (existingPermission) {
        throw new ConflictException(`Quyền với tên "${name}" đã tồn tại`);
      }
    }

    if (key && key !== permission.key) {
      const existingPermission = await this.permissionRepository.findOne({ where: { key } });
      if (existingPermission) {
        throw new ConflictException(`Quyền với key "${key}" đã tồn tại`);
      }
    }
    
    // Cập nhật thông tin
    const updatedPermission = { ...permission, ...updatePermissionDto };
    
    // Lưu thay đổi vào database
    return this.permissionRepository.save(updatedPermission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module },
      order: { name: 'ASC' },
    });
  }

  async getModules(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.module', 'module')
      .orderBy('module')
      .getRawMany();
    
    return result.map(item => item.module);
  }
}
