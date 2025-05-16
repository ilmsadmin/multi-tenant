import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name } = createRoleDto;

    // Kiểm tra xem tên vai trò đã tồn tại chưa
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new ConflictException(`Vai trò với tên "${name}" đã tồn tại`);
    }

    // Tạo instance mới của Role
    const role = this.roleRepository.create(createRoleDto);

    // Lưu role vào database
    return this.roleRepository.save(role);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ items: Role[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryBuilder.where(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Tính toán skip và take dựa trên page và limit
    const skip = (page - 1) * limit;
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('role.id', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ 
      where: { id },
      relations: ['permissionEntities'] 
    });
    
    if (!role) {
      throw new NotFoundException(`Vai trò với ID ${id} không tồn tại`);
    }
    
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name } = updateRoleDto;
    
    // Kiểm tra xem vai trò có tồn tại không
    const role = await this.findOne(id);
    
    // Kiểm tra xem tên vai trò đã tồn tại chưa (nếu tên được cập nhật)
    if (name && name !== role.name) {
      const existingRole = await this.roleRepository.findOne({ where: { name } });
      if (existingRole) {
        throw new ConflictException(`Vai trò với tên "${name}" đã tồn tại`);
      }
    }
    
    // Cập nhật thông tin
    const updatedRole = { ...role, ...updateRoleDto };
    
    // Lưu thay đổi vào database
    return this.roleRepository.save(updatedRole);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
  
  /**
   * Gán quyền cho vai trò
   */
  async assignPermissions(roleId: number, assignPermissionsDto: AssignPermissionsDto): Promise<Role> {
    const { permissionIds, replace = false } = assignPermissionsDto;
    
    const role = await this.findOne(roleId);
    
    // Kiểm tra xem các quyền có tồn tại không
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
    
    if (permissions.length !== permissionIds.length) {
      const foundIds = permissions.map(p => p.id);
      const missingIds = permissionIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Không tìm thấy quyền với ID: ${missingIds.join(', ')}`);
    }
    
    // Cập nhật danh sách quyền
    if (replace) {
      role.permissionEntities = permissions;
    } else {
      // Thêm các quyền mới không trùng lặp
      const existingIds = role.permissionEntities.map(p => p.id);
      const newPermissions = permissions.filter(p => !existingIds.includes(p.id));
      role.permissionEntities = [...role.permissionEntities, ...newPermissions];
    }
    
    // Cập nhật permissions JSON để tương thích với code cũ
    role.permissions = this.convertPermissionsToJson(role.permissionEntities);
    
    // Lưu thay đổi
    return this.roleRepository.save(role);
  }
  
  /**
   * Xóa quyền khỏi vai trò
   */
  async removePermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findOne(roleId);
    
    // Lọc ra các quyền không bị xóa
    role.permissionEntities = role.permissionEntities.filter(
      permission => !permissionIds.includes(permission.id)
    );
    
    // Cập nhật permissions JSON để tương thích với code cũ
    role.permissions = this.convertPermissionsToJson(role.permissionEntities);
    
    // Lưu thay đổi
    return this.roleRepository.save(role);
  }
  
  /**
   * Lấy danh sách quyền của vai trò
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await this.findOne(roleId);
    return role.permissionEntities;
  }
  
  /**
   * Chuyển đổi danh sách quyền thành định dạng JSON
   * phù hợp với định dạng hiện tại của role.permissions
   */
  private convertPermissionsToJson(permissions: Permission[]): Record<string, any> {
    const result: Record<string, string[]> = {};
    
    for (const permission of permissions) {
      const { module, key } = permission;
      if (!result[module]) {
        result[module] = [];
      }
      
      // Chỉ lấy phần sau của key (ví dụ: 'user.create' -> 'create')
      const action = key.split('.').pop();
      if (action && !result[module].includes(action)) {
        result[module].push(action);
      }
    }
    
    return result;
  }
}
