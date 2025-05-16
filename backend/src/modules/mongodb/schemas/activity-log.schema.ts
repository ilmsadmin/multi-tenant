import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true, collection: 'activity_logs' })
export class ActivityLog {
  @Prop({ type: String, required: true })
  tenant_id: string;

  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: String, required: true })
  entity: string;

  @Prop({ type: String, required: false })
  entity_id: string;

  @Prop({ type: Object, required: true })
  details: Record<string, any>;

  @Prop({ type: String, required: false })
  ip_address: string;

  @Prop({ type: String, required: false })
  user_agent: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

// Tạo index để tối ưu truy vấn
ActivityLogSchema.index({ tenant_id: 1, timestamp: -1 });
ActivityLogSchema.index({ user_id: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });
ActivityLogSchema.index({ entity: 1, entity_id: 1 });
