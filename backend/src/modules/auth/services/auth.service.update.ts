// Partial update for auth.service.ts
// This file shows how to modify the auth.service.ts to use SystemUserService instead of direct database queries

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SystemUserService } from './system-user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly systemUserService: SystemUserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // ... other injected services
  ) {}
  
  // ... other service methods
  
  /**
   * Đăng nhập hệ thống với quyền admin
   */
  async systemLogin(username: string, password: string) {
    try {
      this.logger.debug(`System login attempt for username: ${username}`);
      
      // Sử dụng SystemUserService để xác thực người dùng hệ thống
      const user = await this.validateSystemUser(username, password);
      if (!user) {
        throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
      }
      
      // Tạo JWT payload
      const payload = {        sub: user.id,
        username: user.username,
        level: 'system',
        roles: user.role ? [user.role] : ['system_admin'],  // Chuyển đổi role thành mảng
        permissions: [],  // Không có permissions trong bảng system_users
        type: 'access_token',
      };
      
      // Tạo access token
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET') || 'supersecretkey',
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1d',
      });
      
      // Tạo refresh token
      const refreshToken = this.jwtService.sign(
        { 
          sub: user.id,
          username: user.username,
          level: 'system',
          type: 'refresh_token',
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-supersecretkey',
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      );
      
      // ... lưu session và ghi log
        return {
        id: user.id,
        username: user.username,
        roles: user.role ? [user.role] : ['system_admin'],
        isSystemAdmin: true,
        token,
        refreshToken
      };
    } catch (error) {
      this.logger.error(`System login error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Xác thực người dùng hệ thống
   */
  private async validateSystemUser(username: string, password: string): Promise<any> {
    this.logger.debug(`Validating system user: ${username}`);
    
    try {
      // Sử dụng SystemUserService để tìm người dùng
      const user = await this.systemUserService.findByUsername(username);
      
      if (!user) {
        this.logger.debug(`System user not found: ${username}`);
        return null;
      }
      
      // Kiểm tra trạng thái tài khoản nếu có trường status
      if (user.status && user.status !== 'active') {
        this.logger.debug(`System user account is not active: ${username}`);
        return null;
      }
      
      // Kiểm tra mật khẩu sử dụng SystemUserService
      const isPasswordMatch = await this.systemUserService.verifyPassword(username, password);
      
      if (!isPasswordMatch) {
        this.logger.debug(`System user password doesn't match: ${username}`);
        return null;
      }
      
      // Trả về đối tượng người dùng không bao gồm mật khẩu
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating system user: ${error.message}`);
      return null;
    }
  }
  
  // ... other methods
}
