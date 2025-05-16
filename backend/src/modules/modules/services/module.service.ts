import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../entities/module.entity';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    const newModule = this.moduleRepository.create(createModuleDto);
    return this.moduleRepository.save(newModule);
  }

  async findAll(): Promise<Module[]> {
    return this.moduleRepository.find();
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
    
    // Apply updates
    Object.assign(moduleToUpdate, updateModuleDto);
    
    return this.moduleRepository.save(moduleToUpdate);
  }

  async remove(id: number): Promise<void> {
    const result = await this.moduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
  }
}
