import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemLogDocument = SystemLog & Document;

@Schema({ timestamps: true, collection: 'system_logs' })
export class SystemLog {
  @Prop({ type: String, required: false })
  tenant_id: string;

  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: Object, required: true })
  details: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);
