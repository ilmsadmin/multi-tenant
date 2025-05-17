import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Kiểm tra và cập nhật cấu trúc bảng system_users
   */
  async checkSystemUsersTable(): Promise<void> {
    this.logger.log('Kiểm tra cấu trúc bảng system_users...');

    // Kiểm tra cấu trúc bảng
    const tableInfo = await this.dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'system_users';
    `);

    // Ghi log cấu trúc bảng hiện tại
    this.logger.log('Cấu trúc bảng system_users hiện tại:');
    tableInfo.forEach(column => {
      this.logger.log(`- ${column.column_name}: ${column.data_type}`);
    });

    // Kiểm tra các trường password
    const hasPasswordField = tableInfo.some(col => col.column_name === 'password');
    const hasPasswordHashField = tableInfo.some(col => col.column_name === 'password_hash');
    
    this.logger.log(`Có trường 'password': ${hasPasswordField}`);
    this.logger.log(`Có trường 'password_hash': ${hasPasswordHashField}`);
    
    // Nếu có password_hash nhưng không có password, đổi tên cột
    if (hasPasswordHashField && !hasPasswordField) {
      this.logger.log('Đổi tên cột password_hash thành password...');
      await this.dataSource.query(`
        ALTER TABLE system_users
        RENAME COLUMN password_hash TO password;
      `);
      this.logger.log('Đổi tên cột thành công');
    }
    // Nếu có cả hai trường, cần quyết định giữ trường nào
    else if (hasPasswordHashField && hasPasswordField) {
      this.logger.log('Tồn tại cả hai trường password và password_hash. Vui lòng kiểm tra mã ứng dụng của bạn.');
    }
    // Nếu chỉ có trường password, không cần thay đổi
    else if (hasPasswordField) {
      this.logger.log('Trường password đã tồn tại, không cần thay đổi');
    }
    // Nếu không có trường nào, thêm trường password
    else {
      this.logger.log('Thêm trường password vào bảng system_users...');
      await this.dataSource.query(`
        ALTER TABLE system_users
        ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
      `);
      this.logger.log('Thêm trường password thành công');
    }

    // Kiểm tra các trường status
    const hasStatusField = tableInfo.some(col => col.column_name === 'status');
    
    if (!hasStatusField) {
      this.logger.log('Thêm trường status vào bảng system_users...');
      await this.dataSource.query(`
        ALTER TABLE system_users
        ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';
      `);
      this.logger.log('Thêm trường status thành công');
    }

    // Kiểm tra user admin có tồn tại không
    const adminUser = await this.dataSource.query(
      `SELECT * FROM system_users WHERE username = 'admin'`
    );

    if (adminUser.length === 0) {
      this.logger.log('Tạo user admin mặc định...');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      await this.dataSource.query(`
        INSERT INTO system_users (username, email, password, role, status)
        VALUES ('admin', 'admin@example.com', $1, 'super_admin', 'active')
      `, [hashedPassword]);
      this.logger.log('Tạo user admin thành công');
    } else {
      this.logger.log('User admin đã tồn tại');
    }

    this.logger.log('Hoàn tất kiểm tra cấu trúc bảng system_users.');
  }

  /**
   * Kiểm tra và cập nhật mật khẩu cho người dùng hệ thống
   */
  async updateSystemUserPassword(username: string, newPassword: string): Promise<void> {
    this.logger.log(`Cập nhật mật khẩu cho user hệ thống: ${username}`);
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Kiểm tra user tồn tại
    const user = await this.dataSource.query(
      `SELECT * FROM system_users WHERE username = $1`,
      [username]
    );
    
    if (user.length === 0) {
      this.logger.error(`User ${username} không tồn tại`);
      throw new Error(`User ${username} không tồn tại`);
    }
    
    // Cập nhật mật khẩu
    await this.dataSource.query(
      `UPDATE system_users SET password = $1 WHERE username = $2`,
      [hashedPassword, username]
    );
    
    this.logger.log(`Cập nhật mật khẩu thành công cho user: ${username}`);
  }
}
