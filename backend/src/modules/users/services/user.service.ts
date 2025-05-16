import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, roleIds, ...rest } = createUserDto;

    // Kiểm tra xem username đã tồn tại chưa
    const existingUsername = await this.userRepository.findOne({ where: { username } });
    if (existingUsername) {
      throw new ConflictException(`User với username "${username}" đã tồn tại`);
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException(`User với email "${email}" đã tồn tại`);
    }

    // Mã hóa mật khẩu
    const passwordHash = await this.hashPassword(password);

    // Tạo instance mới của User
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      ...rest,
    });

    // Nếu có roleIds, gán roles cho user
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Một hoặc nhiều vai trò không tồn tại');
      }
      user.roles = roles;
    }

    // Lưu user vào database
    return this.userRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      queryBuilder.where(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Lọc theo trạng thái nếu có
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Tính toán skip và take dựa trên page và limit
    const skip = (page - 1) * limit;
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.id', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
    
    return user;
  }  async findByUsername(username: string): Promise<User | null> {
    this.logger.debug(`[CRITICAL DEBUG] UserService.findByUsername called with: ${username}`);
    this.logger.debug(`Finding user by username: ${username}`);
    
    try {
      // Query to check the current schema
      const schemaResult = await this.dataSource.query('SHOW search_path');
      this.logger.debug(`[CRITICAL DEBUG] Current search_path: ${JSON.stringify(schemaResult)}`);
      this.logger.debug(`Current search_path: ${JSON.stringify(schemaResult)}`);
      
      // Get tables in the current schema
      const tablesResult = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = split_part(current_setting('search_path'), ',', 1)
      `);
      this.logger.debug(`[CRITICAL DEBUG] Tables in current schema: ${JSON.stringify(tablesResult)}`);
      this.logger.debug(`Tables in current schema: ${JSON.stringify(tablesResult)}`);
      
      // Query to find the user
      const user = await this.userRepository.findOne({
        where: { username },
        relations: ['roles'],
      });
      
      this.logger.debug(`[CRITICAL DEBUG] User search result: ${user ? 'Found' : 'Not found'}`);
      this.logger.debug(`User found: ${user ? 'Yes' : 'No'}`);
      
      if (user) {
        this.logger.debug(`[CRITICAL DEBUG] User details: ${JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash ? 'HASH_EXISTS' : 'NULL',
          roles: user.roles ? user.roles.map(r => r.name) : []
        })}`);
        
        this.logger.debug(`User details: ${JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash ? user.passwordHash.substring(0, 10) + '...' : 'NULL',
          roles: user.roles ? user.roles.map(r => r.name) : []
        })}`);
      }
      
      if (!user) {
        this.logger.warn(`[CRITICAL DEBUG] User with username ${username} not found in database`);
        this.logger.error(`User with username ${username} not found`);
        return null; // Return null instead of throwing exception for auth flow
      }
      
      return user;
    } catch (error) {
      this.logger.error(`[CRITICAL DEBUG] Database error in findByUsername: ${error.message}`);
      this.logger.error(`Error in findByUsername: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      return null; // Return null instead of propagating the error for auth flow
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, password, roleIds, ...rest } = updateUserDto;
    
    // Kiểm tra xem user có tồn tại không
    const user = await this.findOne(id);
    
    // Kiểm tra xem email đã tồn tại chưa (nếu email được cập nhật)
    if (email && email !== user.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email } });
      if (existingEmail) {
        throw new ConflictException(`User với email "${email}" đã tồn tại`);
      }
    }
    
    // Cập nhật thông tin cơ bản
    const updatedUser = { ...user, ...rest };
    if (email) updatedUser.email = email;
    
    // Mã hóa mật khẩu mới nếu có
    if (password) {
      updatedUser.passwordHash = await this.hashPassword(password);
    }
    
    // Cập nhật roles nếu có
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Một hoặc nhiều vai trò không tồn tại');
      }
      updatedUser.roles = roles;
    }
    
    // Lưu thay đổi vào database
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
    
    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }
    
    // Mã hóa mật khẩu mới
    user.passwordHash = await this.hashPassword(newPassword);
    
    // Lưu vào database
    await this.userRepository.save(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
