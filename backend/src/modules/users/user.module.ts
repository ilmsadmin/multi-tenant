import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { UserDataController } from './controllers/user-data.controller';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { UserDataService } from './services/user-data.service';
import { LoggingService } from './services/logging.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserData } from './entities/user-data.entity';
import { MongoDBModule } from '../mongodb/mongodb.module';

/**
 * Module quản lý người dùng trong tenant
 * 
 * Module này cung cấp:
 * - CRUD operations cho người dùng trong tenant
 * - Quản lý vai trò và phân quyền
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, UserData]),
    MongoDBModule,
  ],  controllers: [UserController, RoleController, PermissionController, UserDataController],
  providers: [UserService, RoleService, PermissionService, UserDataService, LoggingService],
  exports: [UserService, RoleService, PermissionService, UserDataService, LoggingService],
})
export class UserModule {}
