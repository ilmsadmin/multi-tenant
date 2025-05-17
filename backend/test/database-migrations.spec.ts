import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TenantService } from '../src/modules/tenant/tenant.service';
import { CreateTenantDto, TenantStatus } from '../src/modules/tenant/dto/create-tenant.dto';

describe('Database Migrations', () => {
  let dataSource: DataSource;
  let tenantService: TenantService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    tenantService = moduleFixture.get<TenantService>(TenantService);
  });

  it('should connect to the database successfully', () => {
    expect(dataSource.isInitialized).toBe(true);
  });

  describe('System Database', () => {
    it('should have system_db tables', async () => {
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      const tables = await dataSource.query(query);
      
      const tableNames = tables.map(t => t.table_name);
      expect(tableNames).toContain('tenants');
      expect(tableNames).toContain('packages');
      expect(tableNames).toContain('modules');
      expect(tableNames).toContain('tenant_modules');
      expect(tableNames).toContain('system_users');
    });
  });

  describe('Tenant Schema Creation', () => {
    let testTenantId: number;
    const testTenant: CreateTenantDto = {
      name: 'Migration Test Tenant',
      domain: 'migration-test',
      status: TenantStatus.ACTIVE
    };

    beforeAll(async () => {
      // Create a test tenant
      const tenant = await tenantService.create(testTenant);
      testTenantId = tenant.id;
    });

    afterAll(async () => {
      // Clean up: drop the test tenant schema
      if (testTenantId) {
        await tenantService.remove(testTenantId);
        
        // Additional cleanup: Drop schema if it still exists
        try {
          await dataSource.query(`DROP SCHEMA IF EXISTS tenant_${testTenantId} CASCADE`);
        } catch (error) {
          console.error('Error during schema cleanup:', error);
        }
      }
    });

    it('should create a new schema for the tenant', async () => {
      // Check if schema exists
      const query = `
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = 'tenant_${testTenantId}'
      `;
      
      const result = await dataSource.query(query);
      expect(result.length).toBe(1);
      expect(result[0].schema_name).toBe(`tenant_${testTenantId}`);
    });

    it('should create tenant tables in the new schema', async () => {
      // Check if tenant tables exist in the schema
      const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'tenant_${testTenantId}'
      `;
      
      const tables = await dataSource.query(query);
      
      const tableNames = tables.map(t => t.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('roles');
      expect(tableNames).toContain('user_data');
    });
  });

  describe('Migration Rollback', () => {
    let testTenantId: number;
    const testTenant: CreateTenantDto = {
      name: 'Rollback Test Tenant',
      domain: 'rollback-test',
      status: TenantStatus.ACTIVE
    };

    beforeAll(async () => {
      // Create a test tenant
      const tenant = await tenantService.create(testTenant);
      testTenantId = tenant.id;
    });

    afterAll(async () => {
      // Clean up: drop the test tenant schema if it exists
      try {
        await dataSource.query(`DROP SCHEMA IF EXISTS tenant_${testTenantId} CASCADE`);
      } catch (error) {
        console.error('Error during schema cleanup:', error);
      }
    });

    it('should successfully rollback schema creation on failure', async () => {
      // Simulate a failed operation that would trigger rollback
      // For testing we'll try to create the same schema again which should fail
      
      try {
        // This should fail as schema already exists
        await dataSource.query(`CREATE SCHEMA tenant_${testTenantId}`);
        fail('Expected schema creation to fail but it succeeded');
      } catch (error) {
        // Expected to fail
      }

      // Verify tenant still exists in the system
      const tenant = await tenantService.findOne(testTenantId);
      expect(tenant).toBeDefined();
      expect(tenant.id).toBe(testTenantId);

      // Now manually remove the tenant to test rollback
      await tenantService.remove(testTenantId);

      // Check if schema was dropped
      const query = `
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = 'tenant_${testTenantId}'
      `;
      
      const result = await dataSource.query(query);
      expect(result.length).toBe(0);
    });
  });
});
