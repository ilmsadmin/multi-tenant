import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, disconnect } from 'mongoose';
import { SystemLogService } from '../src/modules/mongodb/services/system-log.service';
import { ActivityLogService } from '../src/modules/mongodb/services/activity-log.service';
import { MongodbModule } from '../src/modules/mongodb/mongodb.module';
import { MongooseConfigService } from '../src/config/mongodb.config';

describe('MongoDB Integration', () => {
  let moduleRef: TestingModule;
  let mongoMemoryServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let systemLogService: SystemLogService;
  let activityLogService: ActivityLogService;

  beforeAll(async () => {
    // Start in-memory MongoDB server for testing
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    
    // Connect to the in-memory database
    mongoConnection = (await connect(mongoUri)).connection;
    
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: () => ({
            uri: mongoUri,
          }),
        }),
        MongodbModule,
      ],
    }).compile();

    systemLogService = moduleRef.get<SystemLogService>(SystemLogService);
    activityLogService = moduleRef.get<ActivityLogService>(ActivityLogService);
  });

  afterAll(async () => {
    // Clean up resources
    if (mongoConnection) {
      await mongoConnection.close();
    }
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    await disconnect();
  });

  describe('SystemLogService', () => {
    it('should create a system log entry', async () => {
      const logData = {
        action: 'TEST_ACTION',
        source: 'TEST_SYSTEM',
        description: 'This is a test system log',
        level: 'info',
        metadata: { test: true },
      };

      const log = await systemLogService.createLog(logData);
      
      expect(log).toBeDefined();
      expect(log.action).toBe(logData.action);
      expect(log.source).toBe(logData.source);
      expect(log.description).toBe(logData.description);
      expect(log.level).toBe(logData.level);
      expect(log.metadata).toEqual(logData.metadata);
      expect(log.timestamp).toBeDefined();
    });

    it('should retrieve system logs', async () => {
      // Create a few logs first
      await systemLogService.createLog({
        action: 'RETRIEVE_TEST_1',
        source: 'TEST_SYSTEM',
        description: 'Test log 1',
        level: 'info',
      });
      
      await systemLogService.createLog({
        action: 'RETRIEVE_TEST_2',
        source: 'TEST_SYSTEM',
        description: 'Test log 2',
        level: 'warning',
      });

      // Retrieve logs with filter
      const logs = await systemLogService.findLogs({
        source: 'TEST_SYSTEM',
        action: { $regex: 'RETRIEVE_TEST' },
      });
      
      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(2);
      
      // Check that logs are in correct order (most recent first)
      expect(logs[0].timestamp.getTime()).toBeGreaterThanOrEqual(logs[1].timestamp.getTime());
    });
  });

  describe('ActivityLogService', () => {
    it('should create a tenant activity log entry', async () => {
      const logData = {
        tenantId: 1,
        userId: 123,
        username: 'testuser',
        action: 'LOGIN',
        resource: 'auth',
        description: 'User logged in',
        metadata: { ip: '127.0.0.1' },
      };

      const log = await activityLogService.createLog(logData);
      
      expect(log).toBeDefined();
      expect(log.tenantId).toBe(logData.tenantId);
      expect(log.userId).toBe(logData.userId);
      expect(log.username).toBe(logData.username);
      expect(log.action).toBe(logData.action);
      expect(log.resource).toBe(logData.resource);
      expect(log.description).toBe(logData.description);
      expect(log.metadata).toEqual(logData.metadata);
      expect(log.timestamp).toBeDefined();
    });

    it('should retrieve activity logs for a specific tenant', async () => {
      // Create logs for different tenants
      await activityLogService.createLog({
        tenantId: 1,
        userId: 123,
        username: 'tenant1user',
        action: 'CREATE',
        resource: 'user',
        description: 'Created user for tenant 1',
      });
      
      await activityLogService.createLog({
        tenantId: 2,
        userId: 456,
        username: 'tenant2user',
        action: 'CREATE',
        resource: 'user',
        description: 'Created user for tenant 2',
      });

      // Retrieve logs for tenant 1
      const logs = await activityLogService.findLogs({
        tenantId: 1,
      });
      
      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      
      // All logs should be for tenant 1
      logs.forEach(log => {
        expect(log.tenantId).toBe(1);
      });
    });
  });
});
