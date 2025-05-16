import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public, Roles, Permissions, CurrentUser } from '../index';
import { UserService } from '../../users/services/user.service';

@ApiTags('Examples')
@Controller('examples')
@ApiBearerAuth()
export class AuthExampleController {
  constructor(private readonly userService: UserService) {}

  /**
   * Route không cần xác thực (public)
   */
  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Endpoint công khai không cần xác thực' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu công khai' })
  getPublicData() {
    return { message: 'Đây là dữ liệu công khai, ai cũng có thể truy cập' };
  }

  /**
   * Route yêu cầu đăng nhập nhưng không cần quyền đặc biệt
   */
  @Get('authenticated')
  @ApiOperation({ summary: 'Endpoint yêu cầu xác thực' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu cho người dùng đã xác thực' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  getAuthenticatedData(@CurrentUser() user) {
    return { 
      message: 'Bạn đã đăng nhập thành công!', 
      user: {
        id: user.userId,
        username: user.username,
        tenantId: user.tenantId
      }
    };
  }

  /**
   * Route yêu cầu vai trò admin
   */
  @Roles('admin')
  @Get('admin-only')
  @ApiOperation({ summary: 'Endpoint chỉ dành cho admin' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu cho admin' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền truy cập' })
  getAdminData() {
    return { message: 'Bạn là admin, được phép truy cập dữ liệu này' };
  }

  /**
   * Route yêu cầu quyền đọc người dùng
   */
  @Permissions('user.read')
  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách người dùng (yêu cầu quyền user.read)' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền truy cập' })
  async getUsers(@CurrentUser('tenantId') tenantId: number) {
    const result = await this.userService.findAll();
    return result;
  }

  /**
   * Route yêu cầu quyền xóa người dùng
   */
  @Permissions('user.delete')
  @Delete('users/:id')
  @ApiOperation({ summary: 'Xóa người dùng (yêu cầu quyền user.delete)' })
  @ApiResponse({ status: 204, description: 'Người dùng đã được xóa' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền truy cập' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user
  ) {
    // Kiểm tra thêm logic bảo mật (ví dụ: không thể tự xóa tài khoản của mình)
    if (id === user.userId) {
      return { error: 'Không thể xóa tài khoản của chính mình!' };
    }
    
    await this.userService.remove(id);
    return { message: 'Đã xóa người dùng thành công' };
  }

  /**
   * Route kết hợp nhiều điều kiện phân quyền
   */
  @Roles('admin', 'manager')
  @Permissions('role.create', 'role.update')
  @Post('complex-permission')
  @ApiOperation({ summary: 'Endpoint với nhiều điều kiện phân quyền' })
  @ApiResponse({ status: 200, description: 'Hoạt động thành công' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền truy cập' })
  complexPermissionExample() {
    return { 
      message: 'Bạn đã truy cập thành công endpoint yêu cầu vai trò admin/manager VÀ quyền role.create VÀ role.update' 
    };
  }
}
