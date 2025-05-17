import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@ApiTags('Xác thực hệ thống')
@Controller('auth/system')
export class SystemAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hệ thống (System Admin)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.systemLogin(loginDto.username, loginDto.password);
  }
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới token' })
  @ApiResponse({ status: 200, description: 'Token mới được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.token, 'system');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ' })
  @ApiResponse({ status: 200, description: 'Thông tin hồ sơ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(@Req() req: any) {
    const { userId, level } = req.user;
    return this.authService.logout(userId, 'system', level);
  }
}
