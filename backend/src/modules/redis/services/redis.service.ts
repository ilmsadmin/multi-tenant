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

  // Phương thức mới để cập nhật session
  async updateSession<T>(key: string, partialData: Partial<T>): Promise<void> {
    const sessionKey = this.createSessionKey(key);
    const existingData = await this.get<T>(sessionKey);

    if (existingData) {
      const updatedData = { ...existingData, ...partialData };
      await this.set(sessionKey, updatedData);
    }
  }
  // Store session data (explicit method for auth service)
  async storeSession(sessionData: any, ttlInSeconds: number = 3600): Promise<void> {
    if (!sessionData || !sessionData.userId) {
      throw new Error('Invalid session data: userId is required');
    }
    
    // Create session key based on userId
    const sessionKey = this.createSessionKey(sessionData.userId.toString());
    
    // Add lastActivity timestamp and metadata for better tracking
    const dataWithTimestamp = {
      ...sessionData,
      lastActivity: new Date(),
      sessionType: sessionData.level || 'user',
      tenantInfo: sessionData.tenantId ? { 
        id: sessionData.tenantId 
      } : undefined
    };
    
    await this.set(sessionKey, dataWithTimestamp, ttlInSeconds);
    
    // If session is for a tenant-specific user, also store a tenant reference
    if (sessionData.tenantId && sessionData.level !== 'system') {
      const tenantRefKey = `tenant:${sessionData.tenantId}:users:${sessionData.userId}`;
      await this.set(tenantRefKey, { sessionKey }, ttlInSeconds);
    }
  }
  // Store system level session
  async storeSystemSession(sessionData: any, ttlInSeconds: number = 3600): Promise<void> {
    if (!sessionData || !sessionData.userId) {
      throw new Error('Invalid session data: userId is required');
    }
    
    // For system sessions, use a special prefix
    const sessionKey = `system:${sessionData.userId}`;
    
    // Add lastActivity timestamp and session type for better tracking
    const dataWithTimestamp = {
      ...sessionData,
      lastActivity: new Date(),
      sessionType: 'system'
    };
    
    await this.set(sessionKey, dataWithTimestamp, ttlInSeconds);
  }

  // Create session with specific TTL for security
  async createSession<T>(key: string, data: T, ttlInSeconds: number = 3600): Promise<void> {
    const sessionKey = this.createSessionKey(key);
    await this.set(sessionKey, data, ttlInSeconds);
  }
  // Method to invalidate user session
  async invalidateSession(key: string, level: string = 'user', tenantId?: string | number): Promise<void> {
    if (level === 'system') {
      // For system users, use the system prefix directly
      await this.del(`system:${key}`);
    } else {
      // For tenant and normal users, use the session key pattern
      const sessionKey = this.createSessionKey(key);
      await this.del(sessionKey);
      
      // If tenant ID is provided, also remove tenant reference
      if (tenantId) {
        const tenantRefKey = `tenant:${tenantId}:users:${key}`;
        await this.del(tenantRefKey);
      }
    }
  }

  // Phương thức mới để lưu session với thông tin tenant name
  async storeSessionWithTenantInfo<T extends { tenantId?: any; tenantName?: string }>(
    userId: string,
    sessionData: T,
    ttl: number = 3600
  ): Promise<void> {
    const sessionKey = this.createSessionKey(userId);
    
    // Đảm bảo có đủ thông tin tenant nếu có tenantId
    if (sessionData.tenantId && !sessionData.tenantName) {
      try {
        // Tìm kiếm thông tin tenant từ database nếu cần
        // Code này giả định có một cách để lấy tên tenant từ ID
        // sessionData.tenantName = await this.getTenantNameById(sessionData.tenantId);
        console.log('Warning: Tenant name not provided for session with tenantId:', sessionData.tenantId);
      } catch (error) {
        console.error('Error getting tenant name:', error);
      }
    }
    
    await this.set(sessionKey, sessionData, ttl);
  }

  // Get all active sessions for a tenant
  async getTenantActiveSessions(tenantId: string | number): Promise<string[]> {
    try {
      // This is a simplified implementation
      // In a real Redis implementation, you would use pattern matching like KEYS or SCAN
      // For demonstration, we're assuming we have a way to find all keys matching a pattern
      const pattern = `tenant:${tenantId}:users:*`;
      
      // This is a placeholder - actual implementation would depend on the Redis client
      // and would use commands like KEYS or SCAN with pattern matching
      console.log(`Getting active sessions for tenant: ${tenantId} with pattern ${pattern}`);
      
      // Return a dummy result
      return [];
    } catch (error) {
      console.error(`Failed to get active sessions for tenant ${tenantId}:`, error);
      return [];
    }
  }
}
