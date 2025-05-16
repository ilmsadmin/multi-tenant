import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModuleConfigDocument = ModuleConfig & Document;

@Schema({ timestamps: true, collection: 'module_configs' })
export class ModuleConfig {
  @Prop({ type: String, required: true })
  tenant_id: string;

  @Prop({ type: String, required: true })
  module_id: string;

  @Prop({ type: Object, required: true })
  config: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
}

export const ModuleConfigSchema = SchemaFactory.createForClass(ModuleConfig);
