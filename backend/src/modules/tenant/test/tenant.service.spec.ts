import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from '../tenant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateTenantDto, TenantStatus } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;
  let repository: Repository<Tenant>;
  let dataSource: DataSource;

  // Mock data
  const mockTenant = {
    id: 1,
    name: 'Test Tenant',
    domain: 'test-tenant',
    schema_name: 'tenant_test_tenant',
    status: TenantStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Mock repository
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  // Mock DataSource
  const mockDataSource = {
    query: jest.fn(),
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tenant successfully', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'New Tenant',
        domain: 'new-tenant',
      };

      // Mock repository responses
      mockRepository.findOne.mockResolvedValue(null); // No existing schema or domain
      mockRepository.create.mockReturnValue({
        ...createTenantDto,
        schema_name: 'tenant_new_tenant',
        status: TenantStatus.ACTIVE,
      });
      mockRepository.save.mockResolvedValue({
        id: 2,
        ...createTenantDto,
        schema_name: 'tenant_new_tenant',
        status: TenantStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.create(createTenantDto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createTenantDto.name);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockDataSource.query).toHaveBeenCalled();
    });

    it('should throw ConflictException if schema name already exists', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Tenant',
        domain: 'test-tenant',
      };

      // Mock existing schema
      mockRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.create(createTenantDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if domain already exists', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Different Name',
        domain: 'test-tenant', // Same domain as existing tenant
      };

      // First call returns null (no schema), second call returns existing tenant (for domain check)
      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockTenant);

      await expect(service.create(createTenantDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of tenants', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockTenant], 1]);

      const result = await service.findAll({
        search: 'test',
        status: TenantStatus.ACTIVE,
        skip: 0,
        take: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['modules'],
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tenant successfully', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: 'Updated Tenant',
      };

      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.save.mockResolvedValue({
        ...mockTenant,
        ...updateTenantDto,
      });

      const result = await service.update(1, updateTenantDto);
      expect(result.name).toBe(updateTenantDto.name);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated domain already exists', async () => {
      const updateTenantDto: UpdateTenantDto = {
        domain: 'existing-domain',
      };

      // First call returns tenant to update, second call returns existing tenant with the domain
      mockRepository.findOne.mockResolvedValueOnce(mockTenant).mockResolvedValueOnce({
        id: 2,
        domain: 'existing-domain',
      });

      await expect(service.update(1, updateTenantDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a tenant successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(mockDataSource.query).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeStatus', () => {
    it('should change tenant status successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.save.mockResolvedValue({
        ...mockTenant,
        status: TenantStatus.INACTIVE,
      });

      const result = await service.changeStatus(1, TenantStatus.INACTIVE);
      expect(result.status).toBe(TenantStatus.INACTIVE);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.changeStatus(999, TenantStatus.INACTIVE)).rejects.toThrow(NotFoundException);
    });
  });
});
