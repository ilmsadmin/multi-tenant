import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';

@Controller('tenant-data/permissions')
@ApiTags('Permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo quyền mới trong tenant' })
  @ApiResponse({ status: 201, description: 'Quyền đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Tên hoặc key quyền đã tồn tại' })
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả quyền trong tenant' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (bắt đầu từ 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mục trên mỗi trang', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên, key hoặc mô tả', type: String })
  @ApiQuery({ name: 'module', required: false, description: 'Lọc theo module', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách quyền' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('module') module?: string,
  ) {
    return this.permissionService.findAll(page, limit, search, module);
  }

  @Get('modules')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các module có quyền' })
  @ApiResponse({ status: 200, description: 'Danh sách modules' })
  getModules() {
    return this.permissionService.getModules();
  }

  @Get('by-module/:module')
  @ApiOperation({ summary: 'Lấy danh sách quyền theo module' })
  @ApiParam({ name: 'module', description: 'Tên module' })
  @ApiResponse({ status: 200, description: 'Danh sách quyền của module' })
  findByModule(@Param('module') module: string): Promise<Permission[]> {
    return this.permissionService.findByModule(module);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin quyền theo ID' })
  @ApiParam({ name: 'id', description: 'ID của quyền' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin của quyền' })
  @ApiResponse({ status: 404, description: 'Quyền không tồn tại' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin quyền' })
  @ApiParam({ name: 'id', description: 'ID của quyền' })
  @ApiResponse({ status: 200, description: 'Quyền đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Quyền không tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quyền' })
  @ApiParam({ name: 'id', description: 'ID của quyền' })
  @ApiResponse({ status: 204, description: 'Quyền đã được xóa' })
  @ApiResponse({ status: 404, description: 'Quyền không tồn tại' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.permissionService.remove(id);
  }
}
