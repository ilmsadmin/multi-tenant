import { Controller, Post, UseGuards, Request, Body, Get, HttpCode, HttpStatus, UnauthorizedException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'ID của tenant',
    required: true,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công và trả về access token' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không chính xác' })
  async login(@Request() req) {
    this.logger.debug(`[CRITICAL DEBUG] AuthController.login called`);
    this.logger.debug(`Login endpoint called for user: ${req.user?.username || 'unknown'}, tenant: ${req.user?.tenantId || 'unknown'}`);
    
    // Verify the authentication was successful and user data is available
    if (!req.user) {
      this.logger.error(`[CRITICAL DEBUG] AuthController.login - No user object in request`);
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }
    
    if (!req.user.tenantId) {
      this.logger.error(`[CRITICAL DEBUG] AuthController.login - No tenantId in user object: ${JSON.stringify(req.user)}`);
      throw new UnauthorizedException('Tenant ID không hợp lệ');
    }
    
    // Log the entire user object from the request
    this.logger.debug(`[CRITICAL DEBUG] User object from request: ${JSON.stringify(req.user)}`);
    this.logger.debug(`User object from request: ${JSON.stringify(req.user)}`);
    
    try {
      this.logger.debug(`[CRITICAL DEBUG] Calling authService.login with tenantId: ${req.user.tenantId}`);
      const result = await this.authService.login(req.user.tenantId, req.user);
      this.logger.debug(`[CRITICAL DEBUG] Login successful for user: ${req.user.username}`);
      this.logger.debug(`Login successful for user: ${req.user.username}`);
      return result;
    } catch (error) {
      this.logger.error(`[CRITICAL DEBUG] Login error: ${error.message}`);
      this.logger.error(`Login error: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin profile của người dùng hiện tại' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'ID của tenant',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Trả về thông tin profile người dùng' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  getProfile(@Request() req) {
    return {
      id: req.user.userId,
      username: req.user.username,
      tenantId: req.user.tenantId,
      roles: req.user.roles,
      permissions: req.user.permissions,
    };
  }  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'ID của tenant',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async logout(@Request() req) {
    this.logger.debug(`Logout requested for user: ${req.user.username}`);
    
    try {
      // Gọi service để đăng xuất
      await this.authService.logout(req.user.userId, req.user.level, req.user.tenantId);
        // Ghi log hoạt động
      await this.authService.logActivity(
        req.user.tenantId,
        req.user.userId,
        'logout',
        'auth',
        undefined,
        { 
          username: req.user.username,
          timestamp: new Date(),
          ip_address: req.ip || req.connection.remoteAddress || 'unknown',
          user_agent: req.headers['user-agent'] || 'unknown'
        }
      );
      
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token đã được làm mới' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    // Mặc định là level 'user' nếu không có thông tin khác
    return this.authService.refreshToken(refreshTokenDto.token, 'user');
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'ID của tenant',
    required: true,
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được thay đổi' })
  @ApiResponse({ status: 400, description: 'Mật khẩu cũ không chính xác' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(
      req.user.tenantId,
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    return { message: 'Mật khẩu đã được thay đổi' };
  }
}
