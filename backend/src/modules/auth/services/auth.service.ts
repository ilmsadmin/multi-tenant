import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../users/services/user.service';
import { RedisService } from '../../redis/services/redis.service';
import { SystemLogService } from '../../mongodb/services/system-log.service';
import { ActivityLogService } from '../../mongodb/services/activity-log.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly systemLogService: SystemLogService,
    private readonly activityLogService: ActivityLogService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}
  
  /**
   * Xác thực người dùng dựa trên username và password
   */  async validateUser(tenantId: number, username: string, password: string): Promise<any> {
    try {
      this.logger.debug(`[CRITICAL DEBUG] AuthService.validateUser start: username=${username}, tenantId=${tenantId}`);
      this.logger.debug(`Attempting to validate user: ${username}, tenantId: ${tenantId}`);
      
      if (!username) {
        this.logger.error(`[CRITICAL DEBUG] Missing username`);
        throw new UnauthorizedException(this.getAuthenticationErrorMessage('missing_username'));
      }
      
      if (!password) {
        this.logger.error(`[CRITICAL DEBUG] Missing password`);
        throw new UnauthorizedException(this.getAuthenticationErrorMessage('missing_password'));
      }
      
      try {
        // First check if user exists
        const user = await this.userService.findByUsername(username);
        
        if (!user) {
          this.logger.debug(`[CRITICAL DEBUG] User not found: ${username}`);
          throw new UnauthorizedException(this.getAuthenticationErrorMessage('user_not_found'));
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
          throw new UnauthorizedException(this.getAuthenticationErrorMessage('invalid_credentials'));
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
        throw new UnauthorizedException(this.getAuthenticationErrorMessage('invalid_credentials'));
      } catch (userError) {
        this.logger.error(`[CRITICAL DEBUG] Error finding user: ${userError.message}`);
        this.logger.error(`Error stack: ${userError.stack}`);
        if (userError instanceof UnauthorizedException) {
          throw userError;
        }
        throw new UnauthorizedException(this.getAuthenticationErrorMessage('user_not_found'));
      }    } catch (error) {
      this.logger.error(`[CRITICAL DEBUG] Validation error: ${error.message}`);
      this.logger.error(`Lỗi xác thực: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(this.getAuthenticationErrorMessage('default'));
    }
  }
  
  /**
   * Đăng nhập người dùng và tạo JWT token
   */
  async login(tenantId: number, user: User) {
    try {
      this.logger.debug(`[CRITICAL DEBUG] AuthService.login started: tenantId=${tenantId}, userId=${user.id}`);
      this.logger.debug(`Login attempt for user: ${user.username}, tenantId: ${tenantId}`);
      
      try {
        // Update last login time
        await this.userService.updateLastLogin(user.id, {
          lastLoginAt: new Date(),
        });
        
        this.logger.debug(`Updated last login time for user ${user.id}`);
      } catch (updateError) {
        // If updating last login fails, we still want to proceed with login
        this.logger.error(`Failed to update last login time: ${updateError.message}`);
      }
      
      // Tạo JWT payload
      const payload = {
        sub: user.id,
        username: user.username,
        level: 'user',
        tenantId,
        roles: user.roles?.map(role => role.name) || [],
        permissions: this.flattenPermissions(user.roles || []),
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
          level: 'user',
          tenantId,
          type: 'refresh_token',
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-supersecretkey',
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      );
      
      this.logger.debug(`[CRITICAL DEBUG] JWT token created successfully`);
      
      try {
        // Lưu thông tin session vào Redis
        await this.redisService.storeSession({
          userId: user.id,
          username: user.username,
          tenantId,
          level: 'user',
          token,
          roles: user.roles?.map(role => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions?.map(p => p.name) || []
          })) || [],
          permissions: this.flattenPermissions(user.roles || [])
        });
        this.logger.debug(`Session stored in Redis for user ${user.id}`);
      } catch (redisError) {
        // If Redis fails, we still want to return the token
        this.logger.error(`Failed to store session in Redis: ${redisError.message}`);
      }
      
      try {
        // Ghi log đăng nhập vào SystemLog (legacy)
        await this.systemLogService.log({
          action: 'login',
          user_id: user.id.toString(),
          details: {
            username: user.username,
            tenant_id: tenantId,
            roles: user.roles?.map(r => r.name) || [],
          },
        });
        
        // Ghi log đăng nhập vào ActivityLog
        await this.activityLogService.log({
          user_id: user.id.toString(),
          tenant_id: String(tenantId),
          action: 'login',
          entity: 'auth',
          entity_id: null,
          changes: {
            timestamp: new Date(),
            roles: user.roles?.map(r => r.name) || [],
          },
        });
        
        this.logger.debug(`Login activity logged for user ${user.id}`);
      } catch (logError) {
        // If logging fails, we still want to return the token
        this.logger.error(`Failed to log login activity: ${logError.message}`);
      }
      
      return {
        id: user.id,
        username: user.username,
        roles: user.roles?.map(r => r.name) || [],
        token,
        refreshToken,
        tenantId
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }
  /**
   * Đăng xuất người dùng
   */
  async logout(userId: string | number, level: string, tenantId?: string | number): Promise<{ success: boolean }> {
    try {
      this.logger.debug(`Logout attempt for user ${userId}, tenant ${tenantId || 'system'}, level ${level}`);
      
      // Xóa session từ Redis sử dụng phương thức cải tiến
      try {
        await this.redisService.invalidateSession(String(userId), level, tenantId);
        this.logger.debug(`Session successfully invalidated for user ${userId}`);
      } catch (redisError) {
        this.logger.error(`Error invalidating session: ${redisError.message}`);
        // Continue with logout process even if session invalidation fails
      }
      
      // Ghi log đăng xuất
      if (level === 'system') {
        try {
          await this.systemLogService.log({
            action: 'system_logout',
            user_id: String(userId),
            details: {
              level,
            },
          });
        } catch (logError) {
          this.logger.error(`Error logging system logout: ${logError.message}`);
        }
      } else {
        try {
          await this.activityLogService.log({
            user_id: String(userId),
            tenant_id: String(tenantId),
            action: `${level}_logout`,            entity: 'auth',
            entity_id: null,            changes: {
              timestamp: new Date(),
              level
            },
          });
        } catch (logError) {
          this.logger.error(`Error logging user logout: ${logError.message}`);
        }
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      return { success: false };
    }
  }
    /**
   * Làm mới token
   */
  async refreshToken(refreshToken: string, level: string, tenantId?: string | number): Promise<any> {
    try {
      this.logger.debug(`Refresh token attempt for level ${level}, tenant ${tenantId || 'system'}`);
      
      // Verify refresh token
      let payload: any;      try {
        payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-supersecretkey',
        });
      } catch (error) {
        this.logger.error(`Invalid refresh token: ${error.message}`);
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Token không hợp lệ. Vui lòng đăng nhập lại.');
        } else {
          throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
        }
      }
      
      if (payload.level !== level) {
        throw new UnauthorizedException('Quyền truy cập của token không hợp lệ. Token không thuộc cấp độ truy cập yêu cầu.');
      }
      
      if (payload.type !== 'refresh_token') {
        throw new UnauthorizedException('Loại token không hợp lệ. Vui lòng sử dụng refresh token để làm mới phiên đăng nhập.');
      }
      
      if (tenantId && String(payload.tenantId) !== String(tenantId)) {
        throw new UnauthorizedException('Token này không thuộc tenant hiện tại. Vui lòng đăng nhập lại với tenant đúng.');
      }
      
      // Check if session exists in Redis
      let sessionKey;
      if (level === 'system') {
        sessionKey = `system:${payload.sub}`;
      } else {
        sessionKey = `${payload.sub}`;
      }
      
      let session;
      try {
        session = await this.redisService.getSession(sessionKey);
      } catch (error) {
        this.logger.warn(`Failed to get session from Redis: ${error.message}. Proceeding without session validation.`);
        // Continue without session validation as a fallback
      }
      
      // Create new access token
      const newPayload = {
        sub: payload.sub,
        username: payload.username,
        level: payload.level,
        tenantId: payload.tenantId,
        roles: payload.roles,
        permissions: payload.permissions,
        type: 'access_token',
      };
      
      const token = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_SECRET') || 'supersecretkey',
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1d',
      });
      
      // Create new refresh token
      const newRefreshToken = this.jwtService.sign(
        {
          sub: payload.sub,
          username: payload.username,
          level: payload.level,
          tenantId: payload.tenantId,
          type: 'refresh_token',
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-supersecretkey',
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      );
      
      return {
        token,
        refreshToken: newRefreshToken,
      };    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Đã xảy ra lỗi khi làm mới token, vui lòng đăng nhập lại');
    }
  }
    /**
   * Đăng nhập hệ thống với quyền admin
   */
  async systemLogin(username: string, password: string) {
    try {      this.logger.debug(`System login attempt for username: ${username}`);
      
      if (!username) {
        throw new UnauthorizedException('Tên đăng nhập không được để trống cho đăng nhập hệ thống.');
      }
      
      if (!password) {
        throw new UnauthorizedException('Mật khẩu không được để trống cho đăng nhập hệ thống.');
      }
      
      const user = await this.validateSystemUser(username, password);
      if (!user) {
        throw new UnauthorizedException('Thông tin đăng nhập hệ thống không chính xác hoặc tài khoản không tồn tại. Vui lòng kiểm tra thông tin đăng nhập.');
      }
      
      // Tạo JWT payload
      const payload = {
        sub: user.id,
        username: user.username,
        level: 'system',
        roles: user.roles || ['system_admin'],
        permissions: user.permissions || [],
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
      
      try {
        // Lưu thông tin session vào Redis
        await this.redisService.storeSystemSession({
          userId: user.id,
          username: user.username,
          level: 'system',
          token,
          roles: user.roles || ['system_admin'],
          permissions: user.permissions || []
        });
      } catch (redisError) {
        this.logger.error(`Failed to store system session in Redis: ${redisError.message}`);
      }
      
      try {
        // Ghi log đăng nhập vào SystemLog
        await this.systemLogService.log({
          action: 'system_login',
          user_id: user.id,
          details: {
            username: user.username,
            roles: user.roles || ['system_admin'],
          },
        });
      } catch (logError) {
        this.logger.error(`Failed to log system login: ${logError.message}`);
      }
      
      return {
        id: user.id,
        username: user.username,
        roles: user.roles || ['system_admin'],
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
   * Đăng nhập với quyền admin của tenant
   */
  async tenantAdminLogin(tenantId: string, username: string, password: string) {
    try {
      this.logger.log(`[AUTH SERVICE] Tenant admin login attempt - Tenant ID: ${tenantId}, Username: ${username}`);
      
      if (!tenantId) {
        this.logger.error(`[AUTH SERVICE] Missing tenantId for login attempt`);
        throw new BadRequestException('Tenant ID không được cung cấp');
      }
      
      try {
        // Kiểm tra trước xem tenant có tồn tại không
        const numericTenantId = parseInt(tenantId, 10);
        if (isNaN(numericTenantId)) {
          this.logger.error(`[AUTH SERVICE] Invalid tenant ID format: ${tenantId}`);
          throw new BadRequestException('Tenant ID không hợp lệ');
        }
      } catch (error) {
        this.logger.error(`[AUTH SERVICE] Error checking tenant: ${error.message}`);
        throw error;
      }
      
      this.logger.debug(`Tenant admin login attempt: tenant=${tenantId}, username=${username}`);      
      const user = await this.validateUser(Number(tenantId), username, password);
      if (!user) {
        throw new UnauthorizedException('Thông tin đăng nhập không chính xác hoặc tài khoản không tồn tại');
      }
      
      // Kiểm tra xem người dùng có quyền admin không
      const isAdmin = user.roles?.some(role => 
        role.name === 'tenant_admin' || 
        role.name === 'admin' ||
        role.permissions?.some(p => p.name === 'tenant.admin')
      );
      
      if (!isAdmin) {
        throw new UnauthorizedException('Tài khoản không có quyền quản trị cho tenant này');
      }
      
      // Tạo JWT payload
      const payload = {
        sub: user.id,
        username: user.username,
        level: 'tenant_admin',
        tenantId: Number(tenantId),
        roles: user.roles?.map(role => role.name) || [],
        permissions: this.flattenPermissions(user.roles || []),
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
          level: 'tenant_admin',
          tenantId: Number(tenantId),
          type: 'refresh_token',
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-supersecretkey',
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      );
      
      try {
        // Lưu thông tin session vào Redis
        await this.redisService.storeSession({
          userId: user.id,
          username: user.username,
          tenantId: Number(tenantId),
          level: 'tenant_admin',
          token,
          roles: user.roles?.map(role => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions?.map(p => p.name) || []
          })) || [],
          permissions: this.flattenPermissions(user.roles || [])
        });
      } catch (redisError) {
        this.logger.error(`Failed to store tenant admin session in Redis: ${redisError.message}`);
      }
      
      try {
        // Ghi log đăng nhập
        await this.activityLogService.log({
          user_id: user.id,
          tenant_id: tenantId,
          action: 'tenant_admin_login',
          entity: 'auth',
          entity_id: null,
          changes: {
            timestamp: new Date(),
            roles: user.roles?.map(r => r.name) || [],
          },
        });
      } catch (logError) {
        this.logger.error(`Failed to log tenant admin login: ${logError.message}`);
      }
      
      return {
        id: user.id,
        username: user.username,
        tenantId: Number(tenantId),
        roles: user.roles?.map(r => r.name) || [],
        permissions: this.flattenPermissions(user.roles || []),
        isTenantAdmin: true,
        token,
        refreshToken
      };
    } catch (error) {
      this.logger.error(`Tenant admin login error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Đăng nhập người dùng thông thường của tenant
   */
  async userLogin(tenantId: number, username: string, password: string) {
    try {
      this.logger.debug(`User login attempt: tenant=${tenantId}, username=${username}`);
        // Xác thực người dùng
      const user = await this.validateUser(tenantId, username, password);
      if (!user) {
        throw new UnauthorizedException('Thông tin đăng nhập không chính xác hoặc tài khoản không tồn tại');
      }
      
      // Kiểm tra xem người dùng có thuộc về tenant hiện tại không
      if (user.tenantId !== tenantId) {
        throw new UnauthorizedException('Tài khoản này không thuộc về tenant hiện tại');
      }
      
      // Gọi hàm đăng nhập chung
      return this.login(tenantId, user);
    } catch (error) {
      this.logger.error(`User login error: ${error.message}`);
      throw error;
    }
  }
    /**
   * Xác thực người dùng hệ thống
   */
  private async validateSystemUser(username: string, password: string): Promise<any> {
    console.log('=====================================================================');
    console.log('VALIDATE SYSTEM USER');
    console.log('=====================================================================');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
    try {      // Truy vấn thông tin admin hệ thống trực tiếp từ database
      console.log('Querying database for system user...');
      const systemUser = await this.dataSource.query(
        `SELECT * FROM system_users WHERE username = $1`,
        [username]
      );
      
      console.log('Query result:', systemUser ? `Found ${systemUser.length} users` : 'No result');      
      if (!systemUser || systemUser.length === 0) {
        console.log(`System user not found: ${username}`);
        throw new UnauthorizedException('Tài khoản hệ thống không tồn tại. Vui lòng kiểm tra tên đăng nhập.');
      }
      
      const user = systemUser[0];
      console.log('User found:', {
        id: user.id,
        username: user.username,
        hasPassword: !!user.password,
        hasPasswordHash: !!user.password_hash,
        status: user.status
      });
        // Kiểm tra trạng thái tài khoản
      if (user.status !== 'active') {
        this.logger.debug(`System user account is not active: ${username}, status: ${user.status}`);
        // Provide more specific error based on account status
        if (user.status === 'disabled' || user.status === 'inactive') {
          throw new UnauthorizedException('Tài khoản hệ thống đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
        } else if (user.status === 'pending') {
          throw new UnauthorizedException('Tài khoản hệ thống đang chờ kích hoạt. Vui lòng liên hệ quản trị viên.');
        } else if (user.status === 'locked') {
          throw new UnauthorizedException('Tài khoản hệ thống đã bị khóa. Vui lòng liên hệ quản trị viên để mở khóa.');
        } else {
          throw new UnauthorizedException(`Tài khoản hệ thống không ở trạng thái hoạt động (${user.status}). Vui lòng liên hệ quản trị viên.`);
        }
      }
        // Kiểm tra mật khẩu
      this.logger.debug(`Checking password for system user: ${username}`);
      this.logger.debug(`Password field in DB: ${user.password ? 'EXISTS' : 'NULL'}, Password hash field in DB: ${user.password_hash ? 'EXISTS' : 'NULL'}`);
      
      // Kiểm tra cả trường password và password_hash vì có thể sử dụng một trong hai
      let isPasswordMatch = false;
      
      if (user.password) {
        this.logger.debug(`Comparing with password field (length: ${user.password.length})`);
        isPasswordMatch = await bcrypt.compare(password, user.password);
        this.logger.debug(`Password field comparison result: ${isPasswordMatch}`);
      } 
      
      if (!isPasswordMatch && user.password_hash) {
        this.logger.debug(`Comparing with password_hash field (length: ${user.password_hash.length})`);
        isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        this.logger.debug(`Password_hash field comparison result: ${isPasswordMatch}`);
      }        if (!isPasswordMatch) {
        this.logger.debug(`System user password doesn't match: ${username}`);
        throw new UnauthorizedException('Mật khẩu không chính xác cho tài khoản hệ thống. Vui lòng kiểm tra và thử lại.');
      }
      
      // Chuyển đổi tên cột từ snake_case sang camelCase
      return {
        id: user.id,
        username: user.username,
        roles: user.roles ? JSON.parse(user.roles) : ['system_admin'],
        permissions: user.permissions ? JSON.parse(user.permissions) : [],
      };    } catch (error) {
      this.logger.error(`Error validating system user: ${error.message}`);
      // Re-throw specific unauthorized exceptions
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Provide a generic error for other exceptions
      throw new UnauthorizedException('Lỗi xảy ra khi xác thực tài khoản hệ thống. Vui lòng thử lại sau.');
    }
  }
  
  /**
   * Làm phẳng danh sách quyền từ các vai trò
   */
  private flattenPermissions(roles: any[]): string[] {
    if (!roles || roles.length === 0) {
      return [];
    }
    
    try {
      const permissionSet = new Set<string>();
      
      roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => {
            permissionSet.add(permission.name);
          });
        }
        
        // Permissions format: { "module1": ["read", "write"], "module2": ["read"] }
        if (role.permissionObject) {
          Object.entries(role.permissionObject).forEach(([module, actions]) => {
            (actions as string[]).forEach(action => {
              permissionSet.add(`${module}.${action}`);
            });
          });
        }
      });
      
      return Array.from(permissionSet);
    } catch (error) {
      this.logger.error(`Error flattening permissions: ${error.message}`);
      return [];
    }
  }

  /**
   * Đổi mật khẩu người dùng
   */
  async changePassword(tenantId: string | number, userId: string | number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      this.logger.debug(`Password change attempt for user ${userId} in tenant ${tenantId}`);
      
      // Chuyển đổi kiểu dữ liệu nếu cần
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      // Gọi userService để thay đổi mật khẩu
      await this.userService.changePassword(numericUserId, currentPassword, newPassword);
      
      try {
        // Ghi log thay đổi mật khẩu
        await this.activityLogService.create({
          tenant_id: String(tenantId),
          user_id: String(userId),
          action: 'change_password',
          entity: 'user',
          entity_id: String(userId),
          details: {
            timestamp: new Date(),
          }
        });
      } catch (logError) {
        // Nếu ghi log thất bại, chỉ ghi lại lỗi và tiếp tục
        this.logger.error(`Failed to log password change: ${logError.message}`);
      }
    } catch (error) {
      this.logger.error(`Password change error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Ghi log hoạt động
   */
  async logActivity(tenantId: string | number, userId: string | number, action: string, entity: string, entityId?: string, details?: any): Promise<void> {
    try {
      await this.activityLogService.create({
        tenant_id: String(tenantId),
        user_id: String(userId),
        action,
        entity,
        entity_id: entityId,
        details
      });
    } catch (error) {
      this.logger.error(`Activity logging error: ${error.message}`);
    }
  }
  
  /**
   * Detailed error message for specific authentication failures
   */
  getAuthenticationErrorMessage(error: string): string {
    switch (error) {
      case 'user_not_found':
        return 'Tài khoản không tồn tại. Vui lòng kiểm tra tên đăng nhập.';
      case 'tenant_not_found':
        return 'Tenant không tồn tại hoặc không hợp lệ. Vui lòng kiểm tra thông tin tenant.';
      case 'invalid_credentials':
        return 'Mật khẩu không chính xác. Vui lòng kiểm tra lại mật khẩu.';
      case 'account_disabled':
        return 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
      case 'password_expired':
        return 'Mật khẩu đã hết hạn. Vui lòng đổi mật khẩu.';
      case 'missing_password':
        return 'Mật khẩu không được cung cấp. Vui lòng nhập mật khẩu.';
      case 'missing_username':
        return 'Tên đăng nhập không được cung cấp. Vui lòng nhập tên đăng nhập.';
      case 'session_expired':
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      default:
        return 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
    }
  }
}