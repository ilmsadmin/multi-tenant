import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { TenantModule } from '../tenant.module';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

describe('Tenant API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tenantRepository: Repository<Tenant>;
  let jwtService: JwtService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TenantModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    dataSource = moduleFixture.get<DataSource>(DataSource);
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    // Create admin token for authorized requests
    adminToken = jwtService.sign({
      sub: 1,
      username: 'admin',
      role: 'admin',
    });
    
    await app.init();
    
    // Clear test data
    await tenantRepository.clear();
  });

  afterAll(async () => {
    // Clean up data
    await tenantRepository.clear();
    await app.close();
  });

  describe('/api/tenants (POST)', () => {
    it('should create a new tenant', () => {
      return request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Tenant',
          domain: 'test-tenant',
          status: 'active'
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Tenant');
          expect(res.body.domain).toBe('test-tenant');
        });
    });

    it('should validate tenant data', () => {
      return request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',  // Invalid: empty name
          domain: 'test-tenant-2'
        })
        .expect(400);
    });
  });

  describe('/api/tenants (GET)', () => {
    beforeEach(async () => {
      // Create test tenants
      await tenantRepository.save([
        {
          name: 'Tenant 1',
          domain: 'tenant-1',
          schema_name: 'tenant_1',
          status: 'active',
        },
        {
          name: 'Tenant 2',
          domain: 'tenant-2',
          schema_name: 'tenant_2',
          status: 'active',
        }
      ]);
    });

    it('should return a list of tenants', () => {
      return request(app.getHttpServer())
        .get('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
        });
    });
  });

  describe('/api/tenants/:id (GET)', () => {
    let testTenant;

    beforeEach(async () => {
      // Create a test tenant
      testTenant = await tenantRepository.save({
        name: 'Get Tenant Test',
        domain: 'get-tenant-test',
        schema_name: 'tenant_get_test',
        status: 'active',
      });
    });

    it('should return a tenant by id', () => {
      return request(app.getHttpServer())
        .get(`/api/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(testTenant.id);
          expect(res.body.name).toBe(testTenant.name);
          expect(res.body.domain).toBe(testTenant.domain);
        });
    });

    it('should return 404 for non-existent tenant', () => {
      return request(app.getHttpServer())
        .get('/api/tenants/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/api/tenants/:id (PATCH)', () => {
    let testTenant;

    beforeEach(async () => {
      // Create a test tenant
      testTenant = await tenantRepository.save({
        name: 'Update Tenant Test',
        domain: 'update-tenant-test',
        schema_name: 'tenant_update_test',
        status: 'active',
      });
    });

    it('should update a tenant', () => {
      return request(app.getHttpServer())
        .patch(`/api/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Tenant Name',
          status: 'inactive'
        })
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(testTenant.id);
          expect(res.body.name).toBe('Updated Tenant Name');
          expect(res.body.status).toBe('inactive');
          expect(res.body.domain).toBe(testTenant.domain);
        });
    });
  });

  describe('/api/tenants/:id (DELETE)', () => {
    let testTenant;

    beforeEach(async () => {
      // Create a test tenant
      testTenant = await tenantRepository.save({
        name: 'Delete Tenant Test',
        domain: 'delete-tenant-test',
        schema_name: 'tenant_delete_test',
        status: 'active',
      });
    });

    it('should delete a tenant', () => {
      return request(app.getHttpServer())
        .delete(`/api/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
