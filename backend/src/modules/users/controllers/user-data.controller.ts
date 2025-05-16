import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UserDataService } from '../services/user-data.service';
import { LoggingService } from '../services/logging.service';
import { CreateUserDataDto, UpdateUserDataDto, QueryUserDataDto } from '../dto/user-data.dto';
import { UserData } from '../entities/user-data.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Request } from 'express';

@Controller('tenant-data/user-data')
@ApiTags('User Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserDataController {
  constructor(
    private readonly userDataService: UserDataService,
    private readonly loggingService: LoggingService
  ) {}
  @Post()
  @ApiOperation({ summary: 'Tạo dữ liệu mới cho người dùng' })
  @ApiResponse({ status: 201, description: 'Dữ liệu đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Permissions('userdata.create')
  async create(@Body() createUserDataDto: CreateUserDataDto, @Req() request: Request): Promise<UserData> {
    const userData = await this.userDataService.create(createUserDataDto);
    
    // Ghi log
    await this.loggingService.logActivity(
      request['tenantId'],
      request['user'].userId,
      'create',
      'userData',
      userData.id,
      {
        category: userData.category,
        key: userData.key,
      },
      request
    );
    
    return userData;
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách dữ liệu người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách dữ liệu người dùng' })
  @Permissions('userdata.read')
  findAll(@Query() query: QueryUserDataDto): Promise<UserData[]> {
    return this.userDataService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của dữ liệu người dùng' })
  @ApiParam({ name: 'id', description: 'ID của dữ liệu người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin dữ liệu người dùng' })
  @ApiResponse({ status: 404, description: 'Dữ liệu không tồn tại' })
  @Permissions('userdata.read')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserData> {
    return this.userDataService.findOne(id);
  }

  @Get('user/:userId/category/:category')
  @ApiOperation({ summary: 'Lấy dữ liệu người dùng theo userId và category' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiParam({ name: 'category', description: 'Danh mục dữ liệu' })
  @ApiResponse({ status: 200, description: 'Danh sách dữ liệu theo danh mục' })
  @Permissions('userdata.read')
  findByUserIdAndCategory(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('category') category: string,
  ): Promise<UserData[]> {
    return this.userDataService.findByUserIdAndCategory(userId, category);
  }

  @Get('user/:userId/key/:key')
  @ApiOperation({ summary: 'Lấy dữ liệu người dùng theo userId và key' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiParam({ name: 'key', description: 'Khóa dữ liệu' })
  @ApiResponse({ status: 200, description: 'Thông tin dữ liệu người dùng' })
  @ApiResponse({ status: 404, description: 'Dữ liệu không tồn tại' })
  @Permissions('userdata.read')
  findByUserIdAndKey(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('key') key: string,
  ): Promise<UserData> {
    return this.userDataService.findByUserIdAndKey(userId, key);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật dữ liệu người dùng' })
  @ApiParam({ name: 'id', description: 'ID của dữ liệu người dùng' })
  @ApiResponse({ status: 200, description: 'Dữ liệu đã được cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Dữ liệu không tồn tại' })
  @Permissions('userdata.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDataDto: UpdateUserDataDto,
    @Req() request: Request,
  ): Promise<UserData> {
    const userData = await this.userDataService.update(id, updateUserDataDto);
    
    // Ghi log
    await this.loggingService.logActivity(
      request['tenantId'],
      request['user'].userId,
      'update',
      'userData',
      id,
      {
        category: userData.category,
        key: userData.key,
        changes: updateUserDataDto,
      },
      request
    );
    
    return userData;
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa dữ liệu người dùng' })
  @ApiParam({ name: 'id', description: 'ID của dữ liệu người dùng' })
  @ApiResponse({ status: 200, description: 'Dữ liệu đã được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Dữ liệu không tồn tại' })
  @Permissions('userdata.delete')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request): Promise<void> {
    // Lấy thông tin dữ liệu trước khi xóa để ghi log
    const userData = await this.userDataService.findOne(id);
    
    await this.userDataService.remove(id);
    
    // Ghi log
    await this.loggingService.logActivity(
      request['tenantId'],
      request['user'].userId,
      'delete',
      'userData',
      id,
      {
        category: userData.category,
        key: userData.key,
      },
      request
    );
  }
}
