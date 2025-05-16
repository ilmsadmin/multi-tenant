import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './services/redis.service';
import { RedisController } from './redis.controller';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('redis.host'),
        port: configService.get<number>('redis.port'),
        ttl: configService.get<number>('redis.ttl'),
      }),
      isGlobal: true,
    }),
  ],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
