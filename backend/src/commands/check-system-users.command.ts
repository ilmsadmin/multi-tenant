import { Command } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { MigrationService } from '../modules/auth/services/migration.service';

@Injectable()
export class CheckSystemUsersCommand {
  private readonly logger = new Logger(CheckSystemUsersCommand.name);

  constructor(private readonly migrationService: MigrationService) {}

  @Command({
    command: 'check:system-users',
    describe: 'Kiểm tra và cập nhật cấu trúc bảng system_users',
  })
  async execute(): Promise<void> {
    try {
      this.logger.log('Bắt đầu kiểm tra cấu trúc bảng system_users...');
      
      await this.migrationService.checkSystemUsersTable();
      
      this.logger.log('Hoàn tất kiểm tra và cập nhật cấu trúc bảng system_users.');
    } catch (error) {
      this.logger.error(`Lỗi khi kiểm tra cấu trúc bảng system_users: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
