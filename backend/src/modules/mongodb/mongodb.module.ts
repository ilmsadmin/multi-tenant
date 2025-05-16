import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SystemLog, SystemLogSchema } from './schemas/system-log.schema';
import { ModuleConfig, ModuleConfigSchema } from './schemas/module-config.schema';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';

import { SystemLogService } from './services/system-log.service';
import { ModuleConfigService } from './services/module-config.service';
import { ActivityLogService } from './services/activity-log.service';
import { MongoDBController } from './mongodb.controller';
import { ActivityLogController } from './controllers/activity-log.controller';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongodb.uri'),
        dbName: configService.get('mongodb.dbName'),
        ...configService.get('mongodb.options'),
      }),
    }),    MongooseModule.forFeature([
      { name: SystemLog.name, schema: SystemLogSchema },
      { name: ModuleConfig.name, schema: ModuleConfigSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),  ],
  controllers: [MongoDBController, ActivityLogController],
  providers: [SystemLogService, ModuleConfigService, ActivityLogService],
  exports: [SystemLogService, ModuleConfigService, ActivityLogService],
})
export class MongoDBModule {}
