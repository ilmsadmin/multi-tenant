import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { PackageService } from './services/package.service';
import { PackageController } from './controllers/package.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Package])],
  providers: [PackageService],
  controllers: [PackageController],
  exports: [PackageService] // Export if other modules need to use PackageService
})
export class PackageModule {}
