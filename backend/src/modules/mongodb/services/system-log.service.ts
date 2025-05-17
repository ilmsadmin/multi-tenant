import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemLog, SystemLogDocument } from '../schemas/system-log.schema';

@Injectable()
export class SystemLogService {
  constructor(
    @InjectModel(SystemLog.name)
    private readonly systemLogModel: Model<SystemLogDocument>,
  ) {}

  async create(logData: Partial<SystemLog>): Promise<SystemLogDocument> {
    const newLog = new this.systemLogModel(logData);
    return newLog.save();
  }

  async findByTenant(tenantId: string): Promise<SystemLogDocument[]> {
    return this.systemLogModel.find({ tenant_id: tenantId }).sort({ timestamp: -1 }).exec();
  }

  async findByUser(userId: string): Promise<SystemLogDocument[]> {
    return this.systemLogModel.find({ user_id: userId }).sort({ timestamp: -1 }).exec();
  }

  async findSystemLogs(): Promise<SystemLogDocument[]> {
    return this.systemLogModel.find({ tenant_id: null }).sort({ timestamp: -1 }).exec();
  }
  async findAll(): Promise<SystemLogDocument[]> {
    return this.systemLogModel.find().sort({ timestamp: -1 }).exec();
  }
  
  // Bổ sung phương thức log để tương thích với AuthService
  async log(logData: any): Promise<SystemLogDocument> {
    return this.create({
      action: logData.action,
      user_id: logData.user_id,
      details: logData.details,
      timestamp: new Date(),
      tenant_id: logData.tenant_id || null
    });
  }
}
