import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Public } from '../decorators/public.decorator';

@ApiTags('Xác thực hệ thống')
@Controller('auth/system')
export class SystemAuthController {
  constructor(private readonly authService: AuthService) {}  
    @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hệ thống (System Admin)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập hệ thống' })
  @ApiResponse({ status: 404, description: 'Tài khoản hệ thống không tồn tại' })
  async login(@Body() loginDto: LoginDto) {
    // Log full login attempt details
    console.log(`[DEBUG CONTROLLER] System login attempt - Input data:`, JSON.stringify({
      username: loginDto.username, 
      passwordProvided: loginDto.password ? 'Yes' : 'No',
      passwordLength: loginDto.password ? loginDto.password.length : 0,
      schemaName: loginDto.schemaName || 'not provided'
    }));
    
    try {
      console.log(`[DEBUG CONTROLLER] Calling authService.systemLogin with username: ${loginDto.username}`);
      // Pass both username and password to systemLogin
      const result = await this.authService.systemLogin(loginDto.username, loginDto.password);
      console.log(`[DEBUG CONTROLLER] System login successful for user: ${loginDto.username}, result:`, 
        result ? `Token provided: ${result.token ? 'Yes' : 'No'}` : 'No result');
      return result;
    } catch (error) {
      console.error(`[DEBUG CONTROLLER] System login failed for user ${loginDto.username}:`, error.message);
      console.error(`[DEBUG CONTROLLER] Error stack:`, error.stack);
      throw error;
    }  }

  @Public()
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
