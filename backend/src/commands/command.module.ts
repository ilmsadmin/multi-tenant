import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CheckSystemUsersCommand } from './check-system-users.command';
import { MigrationService } from '../modules/auth/services/migration.service';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host', 'localhost'),
        port: configService.get('database.port', 5432),
        username: configService.get('database.username', 'postgres'),
        password: configService.get('database.password', 'postgres'),
        database: configService.get('database.name', 'system_db'),
        entities: [],
        synchronize: false,
      }),
    }),
  ],
  providers: [MigrationService, CheckSystemUsersCommand],
})
export class CommandModule {}
