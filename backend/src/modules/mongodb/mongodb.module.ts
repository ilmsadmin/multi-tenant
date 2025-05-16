import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SystemLog, SystemLogSchema } from './schemas/system-log.schema';
import { ModuleConfig, ModuleConfigSchema } from './schemas/module-config.schema';

import { SystemLogService } from './services/system-log.service';
import { ModuleConfigService } from './services/module-config.service';
import { MongoDBController } from './mongodb.controller';

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
    }),
    MongooseModule.forFeature([
      { name: SystemLog.name, schema: SystemLogSchema },
      { name: ModuleConfig.name, schema: ModuleConfigSchema },
    ]),
  ],
  controllers: [MongoDBController],
  providers: [SystemLogService, ModuleConfigService],
  exports: [SystemLogService, ModuleConfigService],
})
export class MongoDBModule {}
