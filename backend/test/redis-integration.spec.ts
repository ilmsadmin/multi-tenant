import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from '../src/modules/redis/services/redis.service';
import { RedisModule } from '../src/modules/redis/redis.module';

describe('Redis Integration', () => {
  let moduleRef: TestingModule;
  let redisService: RedisService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        RedisModule,
      ],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    // Clean up resources
    await redisService.closeConnection();
  });

  it('should successfully connect to Redis', async () => {
    const ping = await redisService.ping();
    expect(ping).toBe('PONG');
  });

  describe('Cache Operations', () => {
    it('should set and get a string value', async () => {
      const key = 'test:string';
      const value = 'test-value';
      
      await redisService.set(key, value);
      const result = await redisService.get(key);
      
      expect(result).toBe(value);
    });

    it('should set and get an object value', async () => {
      const key = 'test:object';
      const value = { test: true, num: 123 };
      
      await redisService.set(key, JSON.stringify(value));
      const result = await redisService.get(key);
      
      expect(JSON.parse(result)).toEqual(value);
    });

    it('should set a key with expiration', async () => {
      const key = 'test:expire';
      const value = 'this will expire soon';
      const expireSecs = 1; // 1 second
      
      await redisService.set(key, value, expireSecs);
      
      // Value should exist initially
      let result = await redisService.get(key);
      expect(result).toBe(value);
      
      // Wait for key to expire
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Key should no longer exist
      result = await redisService.get(key);
      expect(result).toBeNull();
    });

    it('should delete a key', async () => {
      const key = 'test:delete';
      const value = 'this will be deleted';
      
      await redisService.set(key, value);
      
      // Confirm value exists
      let result = await redisService.get(key);
      expect(result).toBe(value);
      
      // Delete the key
      await redisService.del(key);
      
      // Confirm value no longer exists
      result = await redisService.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Hash Operations', () => {
    const hashKey = 'test:hash';
    
    beforeEach(async () => {
      // Clean up hash before each test
      await redisService.del(hashKey);
    });
    
    it('should set and get hash fields', async () => {
      await redisService.hset(hashKey, 'field1', 'value1');
      await redisService.hset(hashKey, 'field2', 'value2');
      
      const field1 = await redisService.hget(hashKey, 'field1');
      const field2 = await redisService.hget(hashKey, 'field2');
      
      expect(field1).toBe('value1');
      expect(field2).toBe('value2');
    });
    
    it('should get all hash fields', async () => {
      await redisService.hset(hashKey, 'field1', 'value1');
      await redisService.hset(hashKey, 'field2', 'value2');
      
      const allFields = await redisService.hgetall(hashKey);
      
      expect(allFields).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });
    
    it('should delete hash fields', async () => {
      await redisService.hset(hashKey, 'field1', 'value1');
      await redisService.hset(hashKey, 'field2', 'value2');
      
      await redisService.hdel(hashKey, 'field1');
      
      const field1 = await redisService.hget(hashKey, 'field1');
      const field2 = await redisService.hget(hashKey, 'field2');
      
      expect(field1).toBeNull();
      expect(field2).toBe('value2');
    });
  });

  describe('Cache Performance', () => {
    it('should handle multiple sequential operations efficiently', async () => {
      const keys = Array(100).fill(0).map((_, i) => `perf:key:${i}`);
      
      // Measure time to set 100 keys
      const startSet = Date.now();
      await Promise.all(keys.map((key, i) => redisService.set(key, `value-${i}`)));
      const endSet = Date.now();
      
      // Measure time to get 100 keys
      const startGet = Date.now();
      await Promise.all(keys.map(key => redisService.get(key)));
      const endGet = Date.now();
      
      // Clean up
      await Promise.all(keys.map(key => redisService.del(key)));
      
      // Performance assertions - adjust based on your performance requirements
      expect(endSet - startSet).toBeLessThan(1000); // Setting 100 keys should take less than 1 second
      expect(endGet - startGet).toBeLessThan(1000); // Getting 100 keys should take less than 1 second
    });
  });

  describe('Session Management', () => {
    it('should store and retrieve session data', async () => {
      const sessionId = 'test-session-id';
      const sessionData = {
        userId: 123,
        username: 'testuser',
        role: 'admin',
        tenantId: 1,
        permissions: ['read', 'write'],
      };
      
      // Store session
      await redisService.set(`session:${sessionId}`, JSON.stringify(sessionData), 3600); // 1 hour expiry
      
      // Retrieve session
      const storedData = await redisService.get(`session:${sessionId}`);
      
      expect(JSON.parse(storedData)).toEqual(sessionData);
    });
  });
});
