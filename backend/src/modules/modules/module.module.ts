import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from './entities/module.entity';
import { ModuleService } from './services/module.service';
import { ModuleController } from './controllers/module.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])],
  providers: [ModuleService],
  controllers: [ModuleController],
  exports: [ModuleService]
})
export class ModuleModule {}
