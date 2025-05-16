import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from '../schemas/activity-log.schema';
import { CreateActivityLogDto, QueryActivityLogDto } from '../dto/activity-log.dto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async create(logData: CreateActivityLogDto): Promise<ActivityLogDocument> {
    const newLog = new this.activityLogModel({
      ...logData,
      timestamp: logData.timestamp || new Date(),
    });
    return newLog.save();
  }

  async findAll(query: QueryActivityLogDto): Promise<ActivityLogDocument[]> {
    const filter: any = {};

    if (query.tenant_id) {
      filter.tenant_id = query.tenant_id;
    }

    if (query.user_id) {
      filter.user_id = query.user_id;
    }

    if (query.action) {
      filter.action = query.action;
    }

    if (query.entity) {
      filter.entity = query.entity;
    }

    if (query.entity_id) {
      filter.entity_id = query.entity_id;
    }

    if (query.from_date || query.to_date) {
      filter.timestamp = {};

      if (query.from_date) {
        filter.timestamp.$gte = new Date(query.from_date);
      }

      if (query.to_date) {
        filter.timestamp.$lte = new Date(query.to_date);
      }
    }

    return this.activityLogModel.find(filter).sort({ timestamp: -1 }).exec();
  }

  async findByTenant(tenantId: string): Promise<ActivityLogDocument[]> {
    return this.activityLogModel.find({ tenant_id: tenantId }).sort({ timestamp: -1 }).exec();
  }

  async findByUser(userId: string): Promise<ActivityLogDocument[]> {
    return this.activityLogModel.find({ user_id: userId }).sort({ timestamp: -1 }).exec();
  }

  async findByAction(action: string): Promise<ActivityLogDocument[]> {
    return this.activityLogModel.find({ action }).sort({ timestamp: -1 }).exec();
  }

  async findByEntity(entity: string, entityId?: string): Promise<ActivityLogDocument[]> {
    const filter: any = { entity };
    
    if (entityId) {
      filter.entity_id = entityId;
    }
    
    return this.activityLogModel.find(filter).sort({ timestamp: -1 }).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ActivityLogDocument[]> {
    return this.activityLogModel.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ timestamp: -1 }).exec();
  }
}
