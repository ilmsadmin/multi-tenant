import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus, ParseIntPipe, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Controller('tenant-data/users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới trong tenant' })
  @ApiResponse({ status: 201, description: 'Người dùng đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Email hoặc username đã tồn tại' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng trong tenant' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (bắt đầu từ 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mục trên mỗi trang', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên người dùng hoặc email', type: String })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái người dùng', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.userService.findAll(page, limit, search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin của người dùng' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo username' })
  @ApiParam({ name: 'username', description: 'Username của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin của người dùng' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  async findByUsername(@Param('username') username: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`Người dùng với username ${username} không tồn tại`);
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Người dùng đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 204, description: 'Người dùng đã được xóa' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }

  @Post(':id/change-password')
  @ApiOperation({ summary: 'Thay đổi mật khẩu của người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được thay đổi' })
  @ApiResponse({ status: 400, description: 'Mật khẩu hiện tại không chính xác' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    return this.userService.changePassword(id, body.currentPassword, body.newPassword);
  }
}
