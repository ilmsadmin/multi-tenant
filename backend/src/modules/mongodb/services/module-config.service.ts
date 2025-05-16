import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModuleConfig, ModuleConfigDocument } from '../schemas/module-config.schema';

@Injectable()
export class ModuleConfigService {
  constructor(
    @InjectModel(ModuleConfig.name)
    private readonly moduleConfigModel: Model<ModuleConfigDocument>,
  ) {}

  async upsert(tenantId: string, moduleId: string, config: Record<string, any>): Promise<ModuleConfigDocument> {
    return this.moduleConfigModel.findOneAndUpdate(
      { tenant_id: tenantId, module_id: moduleId },
      { $set: { config, updated_at: new Date() } },
      { upsert: true, new: true },
    ).exec();
  }

  async findByTenantAndModule(tenantId: string, moduleId: string): Promise<ModuleConfigDocument | null> {
    return this.moduleConfigModel.findOne({ tenant_id: tenantId, module_id: moduleId }).exec();
  }

  async findByTenant(tenantId: string): Promise<ModuleConfigDocument[]> {
    return this.moduleConfigModel.find({ tenant_id: tenantId }).exec();
  }

  async remove(tenantId: string, moduleId: string): Promise<boolean> {
    const result = await this.moduleConfigModel.deleteOne({ tenant_id: tenantId, module_id: moduleId }).exec();
    return result.deletedCount > 0;
  }
}
