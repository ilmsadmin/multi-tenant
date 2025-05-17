import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface SystemUser {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  status?: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class SystemUserService {
  private readonly logger = new Logger(SystemUserService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Tìm người dùng hệ thống theo tên đăng nhập
   */
  async findByUsername(username: string): Promise<SystemUser | null> {
    try {
      this.logger.debug(`[DEBUG AUTH] Finding system user by username: ${username}`);
      
      // Check if system_users table exists
      const tableExists = await this.checkTableExists('system_users');
      if (!tableExists) {
        this.logger.error(`[DEBUG AUTH] system_users table does not exist in the database`);
        return null;
      }
      
      // Log the query we're about to execute
      const query = `SELECT * FROM system_users WHERE username = $1`;
      this.logger.debug(`[DEBUG AUTH] Executing query: ${query} with params: [${username}]`);
      
      const users = await this.dataSource.query(query, [username]);

      // Log more details about the query results
      this.logger.debug(`[DEBUG AUTH] Query returned ${users ? users.length : 0} results`);
      
      if (!users || users.length === 0) {
        this.logger.warn(`[DEBUG AUTH] No system user found with username: ${username}`);
        return null;
      }

      this.logger.debug(`[DEBUG AUTH] System user found with details: ${JSON.stringify({
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role,
        status: users[0].status || 'not defined',
        passwordExists: !!users[0].password,
        passwordLength: users[0].password ? users[0].password.length : 0
      }, null, 2)}`);

      return users[0];
    } catch (error) {
      this.logger.error(`[DEBUG AUTH] Error finding system user by username: ${error.message}`);
      this.logger.error(`[DEBUG AUTH] Error stack: ${error.stack}`);
      return null;
    }
  }

  /**
   * Tìm người dùng hệ thống theo ID
   */
  async findById(id: number): Promise<SystemUser | null> {
    try {
      const users = await this.dataSource.query(
        `SELECT * FROM system_users WHERE id = $1`,
        [id]
      );

      if (!users || users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error) {
      this.logger.error(`Error finding system user by ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Tạo người dùng hệ thống mới
   */
  async create(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
    status?: string;
  }): Promise<SystemUser> {
    try {
      // Hash mật khẩu trước khi lưu vào cơ sở dữ liệu
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Kiểm tra xem bảng có trường status không
      const hasStatusField = await this.checkColumnExists('status');
      
      let query: string;
      let params: any[];
      
      if (hasStatusField) {
        query = `
          INSERT INTO system_users (username, email, password, role, status)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        params = [
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || 'admin',
          userData.status || 'active'
        ];
      } else {
        query = `
          INSERT INTO system_users (username, email, password, role)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        params = [
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || 'admin'
        ];
      }

      const result = await this.dataSource.query(query, params);
      return result[0];
    } catch (error) {
      this.logger.error(`Error creating system user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng hệ thống
   */
  async update(id: number, updateData: Partial<SystemUser>): Promise<SystemUser> {
    try {
      // Kiểm tra người dùng tồn tại
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng hệ thống với ID ${id}`);
      }

      // Tạo phần SET của câu lệnh SQL
      const sets: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // Xử lý mật khẩu nếu được cung cấp
      if (updateData.password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        sets.push(`password = $${paramIndex++}`);
        params.push(hashedPassword);
        delete updateData.password;
      }

      // Xử lý các trường còn lại
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          sets.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      });

      // Thêm updated_at
      sets.push(`updated_at = $${paramIndex++}`);
      params.push(new Date());

      // Thêm ID vào tham số cho WHERE
      params.push(id);

      const query = `
        UPDATE system_users
        SET ${sets.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.dataSource.query(query, params);
      return result[0];
    } catch (error) {
      this.logger.error(`Error updating system user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật mật khẩu người dùng hệ thống
   */
  async updatePassword(username: string, newPassword: string): Promise<void> {
    try {
      // Hash mật khẩu mới
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Cập nhật mật khẩu trong cơ sở dữ liệu
      await this.dataSource.query(
        `UPDATE system_users SET password = $1, updated_at = $2 WHERE username = $3`,
        [hashedPassword, new Date(), username]
      );

      this.logger.log(`Mật khẩu đã được cập nhật cho người dùng hệ thống: ${username}`);
    } catch (error) {
      this.logger.error(`Error updating system user password: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa người dùng hệ thống
   */
  async delete(id: number): Promise<void> {
    try {
      // Xóa người dùng khỏi cơ sở dữ liệu
      const result = await this.dataSource.query(
        `DELETE FROM system_users WHERE id = $1`,
        [id]
      );

      if (result[1] === 0) {
        throw new NotFoundException(`Không tìm thấy người dùng hệ thống với ID ${id}`);
      }

      this.logger.log(`Người dùng hệ thống với ID ${id} đã được xóa`);
    } catch (error) {
      this.logger.error(`Error deleting system user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kiểm tra mật khẩu
   */  
  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      this.logger.debug(`[DEBUG AUTH] Verifying password for system user: ${username}`);
      const user = await this.findByUsername(username);
      
      if (!user) {
        this.logger.warn(`[DEBUG AUTH] System user not found during password verification: ${username}`);
        return false;
      }

      this.logger.debug(`[DEBUG AUTH] System user found for password verification: ${JSON.stringify({
        id: user.id,
        username: user.username,
        passwordExists: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordFirstChars: user.password ? user.password.substring(0, 10) + '...' : 'N/A',
        status: user.status || 'not defined'
      })}`);

      if (!user.password) {
        this.logger.warn(`[DEBUG AUTH] System user ${username} has no password stored`);
        return false;
      }

      this.logger.debug(`[DEBUG AUTH] Comparing password: "${password}" with stored hash: "${user.password.substring(0, 10)}..."`);
      const isMatch = await bcrypt.compare(password, user.password);
      this.logger.debug(`[DEBUG AUTH] Password verification result for ${username}: ${isMatch}`);
      
      return isMatch;
    } catch (error) {
      this.logger.error(`[DEBUG AUTH] Error verifying system user password: ${error.message}`);
      this.logger.error(`[DEBUG AUTH] Error stack: ${error.stack}`);
      return false;
    }
  }

  /**
   * Kiểm tra xem một cột có tồn tại trong bảng system_users hay không
   */
  private async checkColumnExists(columnName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'system_users'
        AND column_name = $1
      `, [columnName]);

      return result.length > 0;
    } catch (error) {
      this.logger.error(`Error checking column existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a table exists in the database
   */
  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(`
        SELECT to_regclass('public.${tableName}') as table_exists;
      `);

      return !!result[0].table_exists;
    } catch (error) {
      this.logger.error(`Error checking table existence: ${error.message}`);
      return false;
    }
  }
}
