import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../src/modules/tenant/entities/tenant.entity';
import { TenantStatus } from '../src/modules/tenant/dto/create-tenant.dto';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let testTenant: Tenant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    // Wait for app to initialize
    await app.init();
    
    // Get repositories
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    
    // Create a test tenant
    testTenant = await tenantRepository.save({
      name: 'Auth Test Tenant',
      domain: 'auth-test',
      schema_name: 'auth_test',
      status: TenantStatus.ACTIVE,
    });
    
    // Set up user repository for the tenant schema
    await dataSource.query(`SET search_path TO auth_test`);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await userRepository.save({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      status: 'active',
    });
    
    // Reset search path
    await dataSource.query(`SET search_path TO public`);
  });

  afterAll(async () => {
    // Clean up
    if (testTenant) {
      // Drop the tenant schema
      await dataSource.query(`DROP SCHEMA IF EXISTS ${testTenant.schema_name} CASCADE`);
      // Delete the tenant
      await tenantRepository.delete(testTenant.id);
    }
    
    await app.close();
  });

  describe('/api/auth/login (POST)', () => {
    it('should authenticate a user and return a JWT token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Tenant-ID', String(testTenant.id))
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.username).toBe('testuser');
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Tenant-ID', String(testTenant.id))
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should fail without tenant ID', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(400);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get auth token
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Tenant-ID', String(testTenant.id))
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      authToken = response.body.access_token;
    });

    it('should return the user profile when authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('X-Tenant-ID', String(testTenant.id))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username');
          expect(res.body.username).toBe('testuser');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
          // Should not contain password
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('X-Tenant-ID', String(testTenant.id))
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/logout (POST)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get auth token
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Tenant-ID', String(testTenant.id))
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      authToken = response.body.access_token;
    });

    it('should successfully log out the user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('X-Tenant-ID', String(testTenant.id))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Logout successful');
        });
    });

    it('should prevent using the token after logout', async () => {
      // First logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('X-Tenant-ID', String(testTenant.id))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Then try to access protected route
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('X-Tenant-ID', String(testTenant.id))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });
});
