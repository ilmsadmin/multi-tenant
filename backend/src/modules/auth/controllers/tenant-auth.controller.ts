import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@ApiTags('Xác thực tenant')
@Controller('auth/tenant')
export class TenantAuthController {
  private readonly logger = new Logger(TenantAuthController.name);
  
  constructor(private readonly authService: AuthService) {}
  @Post(':tenantId/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập tenant (Admin)' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  async login(
    @Param('tenantId') tenantId: string,
    @Body() loginDto: LoginDto,
  ) {
    this.logger.log(`[AUTH DEBUG] Tenant login attempt - Tenant ID: ${tenantId}, Username: ${loginDto.username}`);
    this.logger.log(`[AUTH DEBUG] Login body: ${JSON.stringify(loginDto)}`);
    try {
      const result = await this.authService.tenantAdminLogin(tenantId, loginDto.username, loginDto.password);
      this.logger.log(`[AUTH DEBUG] Login successful for tenant ${tenantId}, user ${loginDto.username}`);
      return result;
    } catch (error) {
      this.logger.error(`[AUTH DEBUG] Login failed for tenant ${tenantId}, user ${loginDto.username}: ${error.message}`);
      throw error;
    }
  }

  @Post(':tenantId/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới token' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Token mới được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })  async refreshToken(
    @Param('tenantId') tenantId: string,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(refreshTokenDto.token, 'tenant', tenantId);
  }

  @Get(':tenantId/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Thông tin hồ sơ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Post(':tenantId/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })  async logout(
    @Param('tenantId') tenantId: string,
    @Req() req: any,
  ) {
    const { userId, level } = req.user;
    return this.authService.logout(userId, 'tenant', tenantId);
  }
}
