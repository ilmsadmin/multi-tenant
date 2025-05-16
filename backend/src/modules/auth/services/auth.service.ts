import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../users/services/user.service';
import { RedisService } from '../../redis/services/redis.service';
import { SystemLogService } from '../../mongodb/services/system-log.service';
import { ActivityLogService } from '../../mongodb/services/activity-log.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly systemLogService: SystemLogService,
    public readonly activityLogService: ActivityLogService,
  ) {}/**
   * Xác thực người dùng dựa trên username và password
   */  async validateUser(tenantId: number, username: string, password: string): Promise<any> {
    try {
      this.logger.debug(`[CRITICAL DEBUG] AuthService.validateUser start: username=${username}, tenantId=${tenantId}`);
      this.logger.debug(`Attempting to validate user: ${username}, tenantId: ${tenantId}`);
      
      if (!username || !password) {
        this.logger.error(`[CRITICAL DEBUG] Missing username or password`);
        return null;
      }
      
      try {
        // First check if user exists
        const user = await this.userService.findByUsername(username);
        
        if (!user) {
          this.logger.debug(`[CRITICAL DEBUG] User not found: ${username}`);
          return null;
        }
        
        this.logger.debug(`[CRITICAL DEBUG] User found: id=${user.id}, username="${user.username}"`);
        this.logger.debug(`User found: ${JSON.stringify({
          id: user.id,
          username: user.username,
          passwordHash: user.passwordHash && user.passwordHash.length > 10 ? user.passwordHash.substring(0, 10) + '...' : 'INVALID_HASH',
          roles: user.roles ? user.roles.map(r => r.name) : []
        })}`);
        
        if (!user.passwordHash) {
          this.logger.error(`[CRITICAL DEBUG] Password hash is missing for user: ${username}`);
          return null;
        }
        
        // Kiểm tra mật khẩu
        this.logger.debug(`[CRITICAL DEBUG] Comparing passwords - Hash in DB: ${user.passwordHash.substring(0, 10)}...`);
        this.logger.debug(`Comparing password "${password}" with hash: ${user.passwordHash.substring(0, 10)}...`);
        
        const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
        this.logger.debug(`[CRITICAL DEBUG] Password match result: ${isPasswordMatch}`);
        this.logger.debug(`Password match result: ${isPasswordMatch}`);
        
        if (isPasswordMatch) {
          const { passwordHash, ...result } = user;
          this.logger.debug(`[CRITICAL DEBUG] Authentication successful, returning user data: ${JSON.stringify({
            id: result.id,
            username: result.username,
            roles: result.roles ? result.roles.map(r => r.name) : []
          })}`);
          return result;
        }
        
        this.logger.debug(`[CRITICAL DEBUG] Password doesn't match, authentication failed`);
        this.logger.debug(`Password doesn't match, authentication failed`);
        return null;
      } catch (userError) {
        this.logger.error(`[CRITICAL DEBUG] Error finding user: ${userError.message}`);
        this.logger.error(`Error stack: ${userError.stack}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`[CRITICAL DEBUG] Validation error: ${error.message}`);
      this.logger.error(`Lỗi xác thực: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return null;
    }
  }  /**
   * Đăng nhập người dùng và tạo JWT token
   */
  async login(tenantId: number, user: User) {
    this.logger.debug(`[CRITICAL DEBUG] AuthService.login started: tenantId=${tenantId}, userId=${user.id}`);
    
    try {
      // Cập nhật thời gian đăng nhập cuối
      this.logger.debug(`[CRITICAL DEBUG] Updating last login time for user ${user.id}`);
      
      try {
        const updatedUser = await this.userService.update(user.id, {
          lastLogin: new Date(),
        });
        this.logger.debug(`[CRITICAL DEBUG] Last login time updated successfully`);
      } catch (updateError) {
        // If updating last login fails, we still want to proceed with login
        this.logger.error(`[CRITICAL DEBUG] Error updating last login: ${updateError.message}`);
      }

      // Tạo payload cho JWT
      this.logger.debug(`[CRITICAL DEBUG] Creating JWT payload`);
      const payload = {
        sub: user.id,
        username: user.username,
        tenantId,
        roles: user.roles?.map(role => role.name) || [],
        permissions: this.flattenPermissions(user.roles || []),
      };
      
      this.logger.debug(`[CRITICAL DEBUG] JWT payload created: ${JSON.stringify({
        sub: payload.sub,
        username: payload.username,
        tenantId: payload.tenantId,
        roles: payload.roles,
        permissionsCount: payload.permissions?.length || 0
      })}`);

      // Tạo token
      this.logger.debug(`[CRITICAL DEBUG] Signing JWT token`);
      const token = this.jwtService.sign(payload);
      this.logger.debug(`[CRITICAL DEBUG] JWT token created successfully`);

      try {
        // Lưu thông tin session vào Redis
        this.logger.debug(`[CRITICAL DEBUG] Saving session to Redis: ${tenantId}:${user.id}`);
        await this.redisService.setSession(`${tenantId}:${user.id}`, {
          userId: user.id,
          username: user.username,
          tenantId,
          roles: user.roles?.map(role => ({
            id: role.id,
            name: role.name,
          })) || [],
          lastActivity: new Date(),
        });
        this.logger.debug(`[CRITICAL DEBUG] Session saved to Redis successfully`);
      } catch (redisError) {
        // If Redis fails, we still want to return the token
        this.logger.error(`[CRITICAL DEBUG] Error saving session to Redis: ${redisError.message}`);
      }      try {
        // Ghi log đăng nhập vào SystemLog (legacy)
        this.logger.debug(`[CRITICAL DEBUG] Logging login action to MongoDB`);
        await this.systemLogService.create({
          action: 'login',
          user_id: user.id.toString(),
          tenant_id: tenantId.toString(),
          details: {
            username: user.username,
            ip: 'unknown', // Trong thực tế, lấy từ request
          },
          timestamp: new Date(),
        });
        
        // Ghi log hoạt động chi tiết
        await this.activityLogService.create({
          tenant_id: tenantId.toString(),
          user_id: user.id.toString(),
          action: 'login',
          entity: 'auth',
          details: {
            username: user.username,
            roles: user.roles?.map(role => role.name) || [],
            timestamp: new Date(),
          },
          timestamp: new Date(),
        });
        
        this.logger.debug(`[CRITICAL DEBUG] Login action logged to MongoDB successfully`);
      } catch (logError) {
        // If logging fails, we still want to return the token
        this.logger.error(`[CRITICAL DEBUG] Error logging to MongoDB: ${logError.message}`);
      }

      // Return success response
      this.logger.debug(`[CRITICAL DEBUG] Login completed successfully for user ${user.username}`);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
        },
      };
    } catch (error) {
      this.logger.error(`[CRITICAL DEBUG] Error in login process: ${error.message}`);
      this.logger.error(`[CRITICAL DEBUG] Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Đăng xuất người dùng
   */
  async logout(tenantId: number, userId: number): Promise<void> {
    // Xóa session
    await this.redisService.delSession(`${tenantId}:${userId}`);

    // Ghi log đăng xuất
    await this.systemLogService.create({
      action: 'logout',
      user_id: userId.toString(),
      tenant_id: tenantId.toString(),
      timestamp: new Date(),
    });
  }

  /**
   * Làm phẳng cấu trúc permissions từ nhiều roles
   */
  private flattenPermissions(roles: any[]): string[] {
    const permissionSet = new Set<string>();
    
    // Duyệt qua từng vai trò
    for (const role of roles) {
      // Kiểm tra nếu vai trò có permissions
      if (role.permissions) {
        // Duyệt qua từng module trong permissions
        Object.entries(role.permissions).forEach(([module, actions]) => {
          // Thêm các quyền vào Set để loại bỏ trùng lặp
          if (Array.isArray(actions)) {
            actions.forEach(action => {
              permissionSet.add(`${module}.${action}`);
            });
          }
        });
      }

      // Nếu vai trò có permissionEntities (từ relation)
      if (role.permissionEntities && Array.isArray(role.permissionEntities)) {
        role.permissionEntities.forEach(permission => {
          permissionSet.add(permission.key);
        });
      }
    }
    
    return Array.from(permissionSet);
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(tenantId: number, userId: number, currentPassword: string, newPassword: string): Promise<void> {
    await this.userService.changePassword(userId, currentPassword, newPassword);
    
    // Ghi log đổi mật khẩu
    await this.systemLogService.create({
      action: 'change_password',
      user_id: userId.toString(),
      tenant_id: tenantId.toString(),
      timestamp: new Date(),
    });
  }

  /**
   * Tạo JWT token cho người dùng
   */
  generateToken(user: any, tenantId: number): string {
    const payload = {
      sub: user.id,
      username: user.username,
      tenantId,
      roles: user.roles.map(role => role.name),
      permissions: this.flattenPermissions(user.roles),
    };
    
    return this.jwtService.sign(payload);
  }

  /**
   * Refresh token
   */
  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      // Verify the token
      const decoded = this.jwtService.verify(token);
      
      // Get user from database to ensure they still exist and have correct roles
      const user = await this.userService.findOne(decoded.sub);
      
      // Generate a new token
      const newToken = this.generateToken(user, decoded.tenantId);
      
      return { access_token: newToken };
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
