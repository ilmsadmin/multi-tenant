import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Module } from '../entities/module.entity';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';

export interface ModuleQueryParams {
  search?: string;
  skip?: number;
  take?: number;
}

export interface PaginatedModules {
  data: Module[];
  total: number;
  skip: number;
  take: number;
}

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    // Check if module with same name already exists
    const existingModule = await this.moduleRepository.findOne({
      where: { name: createModuleDto.name },
    });

    if (existingModule) {
      throw new ConflictException(`Module with name '${createModuleDto.name}' already exists`);
    }

    const newModule = this.moduleRepository.create(createModuleDto);
    return this.moduleRepository.save(newModule);
  }

  async findAll(queryParams: ModuleQueryParams = {}): Promise<PaginatedModules> {
    const { search, skip = 0, take = 10 } = queryParams;
    
    const where: FindOptionsWhere<Module> = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.moduleRepository.findAndCount({
      where,
      skip,
      take,
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
      skip,
      take,
    };
  }

  async findOne(id: number): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }
  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const moduleToUpdate = await this.findOne(id);
    
    // Check for name conflict if name is being updated
    if (updateModuleDto.name && updateModuleDto.name !== moduleToUpdate.name) {
      const existingModule = await this.moduleRepository.findOne({
        where: { name: updateModuleDto.name },
      });
      
      if (existingModule) {
        throw new ConflictException(`Module with name '${updateModuleDto.name}' already exists`);
      }
    }
    
    // Apply updates
    Object.assign(moduleToUpdate, updateModuleDto);
    
    return this.moduleRepository.save(moduleToUpdate);
  }

  async remove(id: number): Promise<void> {
    // First check if the module exists
    await this.findOne(id);
    
    // Then delete it
    await this.moduleRepository.delete(id);
  }
  
  async findByName(name: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { name } });
    if (!module) {
      throw new NotFoundException(`Module with name '${name}' not found`);
    }
    return module;
  }
}
