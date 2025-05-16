import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RedisService } from './services/redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('cache')
  async setCache(@Body() body: { key: string; value: any; ttl?: number }) {
    const { key, value, ttl } = body;
    await this.redisService.set(key, value, ttl);
    return { success: true, message: 'Value cached successfully' };
  }

  @Get('cache/:key')
  async getCache(@Param('key') key: string) {
    const value = await this.redisService.get(key);
    if (value === undefined) {
      return { found: false };
    }
    return { found: true, value };
  }

  @Delete('cache/:key')
  async deleteCache(@Param('key') key: string) {
    await this.redisService.del(key);
    return { success: true, message: 'Cache deleted' };
  }

  @Post('tenant-cache')
  async setTenantCache(@Body() body: { tenantId: string; key: string; value: any; ttl?: number }) {
    const { tenantId, key, value, ttl } = body;
    await this.redisService.setTenantValue(tenantId, key, value, ttl);
    return { success: true, message: 'Tenant value cached successfully' };
  }

  @Get('tenant-cache/:tenantId/:key')
  async getTenantCache(@Param('tenantId') tenantId: string, @Param('key') key: string) {
    const value = await this.redisService.getTenantValue(tenantId, key);
    if (value === undefined) {
      return { found: false };
    }
    return { found: true, value };
  }

  @Post('session')
  async setSession(@Body() body: { userId: string; data: any; ttl?: number }) {
    const { userId, data, ttl } = body;
    await this.redisService.setSession(userId, data, ttl);
    return { success: true, message: 'Session saved successfully' };
  }

  @Get('session/:userId')
  async getSession(@Param('userId') userId: string) {
    const session = await this.redisService.getSession(userId);
    if (session === undefined) {
      return { found: false };
    }
    return { found: true, session };
  }

  @Delete('session/:userId')
  async deleteSession(@Param('userId') userId: string) {
    await this.redisService.delSession(userId);
    return { success: true, message: 'Session deleted' };
  }
}
