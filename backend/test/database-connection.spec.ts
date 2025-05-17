import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Database Connection Optimization', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  it('should have a functioning connection to PostgreSQL', async () => {
    // Test basic connection
    expect(dataSource.isInitialized).toBe(true);
    
    // Test query execution
    const result = await dataSource.query('SELECT 1 as value');
    expect(result[0].value).toBe(1);
  });

  it('should have proper connection pool configuration', async () => {
    // Check connection pool settings
    const { options } = dataSource;
    
    // Ensure pool exists
    expect(options.pool).toBeDefined();
    
    if (options.pool) {
      // These values should match your production configuration
      expect(options.pool.max).toBeGreaterThanOrEqual(10);
      expect(options.pool.min).toBeGreaterThanOrEqual(1);
    }
  });

  it('should handle multiple simultaneous queries', async () => {
    // Create 10 simultaneous queries
    const promises = Array(10).fill(0).map(() => 
      dataSource.query('SELECT pg_sleep(0.1), NOW() as time')
    );
    
    // All should resolve without errors
    const results = await Promise.all(promises);
    expect(results.length).toBe(10);
    
    // Each result should have a time
    results.forEach(result => {
      expect(result[0].time).toBeDefined();
    });
  });

  it('should have proper timeout settings', async () => {
    // Test query timeout by checking connection options
    const { options } = dataSource;
    
    // Connection timeout should be set to a reasonable value
    expect(options.connectTimeoutMS).toBeDefined();
    
    if (options.connectTimeoutMS) {
      // Connection timeout should be between 2s and 30s
      expect(options.connectTimeoutMS).toBeGreaterThanOrEqual(2000);
      expect(options.connectTimeoutMS).toBeLessThanOrEqual(30000);
    }
  });
});
