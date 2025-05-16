import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { Role } from '../entities/role.entity';

@Controller('tenant-data/roles')
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo vai trò mới trong tenant' })
  @ApiResponse({ status: 201, description: 'Vai trò đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Tên vai trò đã tồn tại' })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả vai trò trong tenant' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (bắt đầu từ 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mục trên mỗi trang', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên hoặc mô tả vai trò', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách vai trò' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.roleService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin vai trò theo ID' })
  @ApiParam({ name: 'id', description: 'ID của vai trò' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin của vai trò' })
  @ApiResponse({ status: 404, description: 'Vai trò không tồn tại' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò' })
  @ApiResponse({ status: 200, description: 'Vai trò đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Vai trò không tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò' })
  @ApiResponse({ status: 204, description: 'Vai trò đã được xóa' })
  @ApiResponse({ status: 404, description: 'Vai trò không tồn tại' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Gán quyền cho vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò' })
  @ApiResponse({ status: 200, description: 'Quyền đã được gán cho vai trò' })
  @ApiResponse({ status: 404, description: 'Vai trò hoặc quyền không tồn tại' })
  assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(id, assignPermissionsDto);
  }

  @Delete(':id/permissions')
  @ApiOperation({ summary: 'Xóa quyền khỏi vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò' })
  @ApiResponse({ status: 200, description: 'Quyền đã được xóa khỏi vai trò' })
  @ApiResponse({ status: 404, description: 'Vai trò không tồn tại' })
  removePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() removePermissionsDto: { permissionIds: number[] },
  ) {
    return this.roleService.removePermissions(id, removePermissionsDto.permissionIds);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Lấy danh sách quyền của vai trò' })
  @ApiParam({ name: 'id', description: 'ID của vai trò' })
  @ApiResponse({ status: 200, description: 'Danh sách quyền' })
  @ApiResponse({ status: 404, description: 'Vai trò không tồn tại' })
  getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getRolePermissions(id);
  }
}
