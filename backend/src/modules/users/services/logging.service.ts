import { Injectable } from '@nestjs/common';
import { ActivityLogService } from '../../mongodb/services/activity-log.service';
import { CreateActivityLogDto } from '../../mongodb/dto/activity-log.dto';
import { Request } from 'express';

@Injectable()
export class LoggingService {
  constructor(private readonly activityLogService: ActivityLogService) {}

  /**
   * Ghi log hoạt động của người dùng
   * @param tenantId ID của tenant
   * @param userId ID của người dùng
   * @param action Loại hành động (login, create, update, delete, v.v.)
   * @param entity Đối tượng bị tác động (user, role, userData, v.v.)
   * @param entityId ID của đối tượng bị tác động (optional)
   * @param details Chi tiết về hành động
   * @param request Request object (optional) để lấy thông tin IP và User-Agent
   */
  async logActivity(
    tenantId: string | number,
    userId: string | number,
    action: string,
    entity: string,
    entityId: string | number | null,
    details: Record<string, any>,
    request?: Request,
  ): Promise<void> {
    // Chuẩn hóa các tham số
    const tenant_id = tenantId.toString();
    const user_id = userId.toString();
    const entity_id = entityId ? entityId.toString() : undefined;

    // Tạo log data
    const logData: CreateActivityLogDto = {
      tenant_id,
      user_id,
      action,
      entity,
      entity_id,
      details,
      timestamp: new Date(),
    };

    // Nếu có request object, thêm thông tin IP và User-Agent
    if (request) {
      logData.ip_address = this.getClientIp(request);
      logData.user_agent = request.headers['user-agent'];
    }

    // Lưu log
    await this.activityLogService.create(logData);
  }

  /**
   * Lấy địa chỉ IP của client
   * @param request Request object
   * @returns IP address
   */
  private getClientIp(request: Request): string {
    // Xử lý trường hợp sử dụng proxy
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor) 
        ? xForwardedFor[0] 
        : xForwardedFor.split(',')[0];
      return ips.trim();
    }
    
    return request.ip || request.connection.remoteAddress || 'unknown';
  }
}
