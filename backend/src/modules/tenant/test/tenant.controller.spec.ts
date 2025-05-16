import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from '../tenant.controller';
import { TenantService } from '../tenant.service';
import { CreateTenantDto, TenantStatus } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TenantController', () => {
  let controller: TenantController;
  let service: TenantService;

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

  // Mock service
  const mockTenantService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    changeStatus: jest.fn(),
    findByDomain: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    controller = module.get<TenantController>(TenantController);
    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'New Tenant',
        domain: 'new-tenant',
      };

      mockTenantService.create.mockResolvedValue({
        id: 2,
        ...createTenantDto,
        schema_name: 'tenant_new_tenant',
        status: TenantStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await controller.create(createTenantDto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createTenantDto.name);
      expect(service.create).toHaveBeenCalledWith(createTenantDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of tenants', async () => {
      mockTenantService.findAll.mockResolvedValue({
        data: [mockTenant],
        total: 1,
      });

      const result = await controller.findAll('test', TenantStatus.ACTIVE, 1, 10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(service.findAll).toHaveBeenCalledWith({
        search: 'test',
        status: TenantStatus.ACTIVE,
        skip: 0,
        take: 10,
      });
    });

    it('should throw an error if limit is too high', async () => {
      await expect(controller.findAll('test', TenantStatus.ACTIVE, 1, 101)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      mockTenantService.findOne.mockResolvedValue(mockTenant);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockTenant);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: 'Updated Tenant',
      };

      mockTenantService.update.mockResolvedValue({
        ...mockTenant,
        ...updateTenantDto,
      });

      const result = await controller.update(1, updateTenantDto);
      expect(result.name).toBe(updateTenantDto.name);
      expect(service.update).toHaveBeenCalledWith(1, updateTenantDto);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a tenant', async () => {
      mockTenantService.changeStatus.mockResolvedValue({
        ...mockTenant,
        status: TenantStatus.INACTIVE,
      });

      const result = await controller.updateStatus(1, TenantStatus.INACTIVE);
      expect(result.status).toBe(TenantStatus.INACTIVE);
      expect(service.changeStatus).toHaveBeenCalledWith(1, TenantStatus.INACTIVE);
    });

    it('should throw an error if the status is invalid', async () => {
      await expect(controller.updateStatus(1, 'invalid' as TenantStatus)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tenant', async () => {
      mockTenantService.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('findByDomain', () => {
    it('should return a tenant by domain', async () => {
      mockTenantService.findByDomain.mockResolvedValue(mockTenant);

      const result = await controller.findByDomain('test-tenant');
      expect(result).toEqual(mockTenant);
      expect(service.findByDomain).toHaveBeenCalledWith('test-tenant');
    });
  });
});
