import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cacheManager.get<T>(key);
    return value === null ? undefined : value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
  async reset(): Promise<void> {
    // Reset function doesn't exist in newer cache-manager versions
    // We can implement a workaround if needed in the future
    console.warn('Reset method is not available in the current cache manager');
  }
  // Tạo tenant-specific key cho cache
  createTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  // Các phương thức với tenant context
  async getTenantValue<T>(tenantId: string, key: string): Promise<T | undefined> {
    return this.get<T>(this.createTenantKey(tenantId, key));
  }

  async setTenantValue<T>(tenantId: string, key: string, value: T, ttl?: number): Promise<void> {
    await this.set(this.createTenantKey(tenantId, key), value, ttl);
  }

  async delTenantValue(tenantId: string, key: string): Promise<void> {
    await this.del(this.createTenantKey(tenantId, key));
  }

  // Tạo session key cho user sessions
  createSessionKey(userId: string): string {
    return `session:${userId}`;
  }

  // Các phương thức quản lý session
  async getSession<T>(userId: string): Promise<T | undefined> {
    return this.get<T>(this.createSessionKey(userId));
  }

  async setSession<T>(userId: string, sessionData: T, ttl: number = 3600): Promise<void> {
    await this.set(this.createSessionKey(userId), sessionData, ttl);
  }

  async delSession(userId: string): Promise<void> {
    await this.del(this.createSessionKey(userId));
  }
}
