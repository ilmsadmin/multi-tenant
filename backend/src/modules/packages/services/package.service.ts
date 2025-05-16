import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../entities/package.entity';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const newPackage = this.packageRepository.create(createPackageDto);
    return this.packageRepository.save(newPackage);
  }

  async findAll(): Promise<Package[]> {
    return this.packageRepository.find();
  }

  async findOne(id: number): Promise<Package> {
    const packageEntity = await this.packageRepository.findOne({ where: { id } });
    if (!packageEntity) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    return packageEntity;
  }

  async update(id: number, updatePackageDto: UpdatePackageDto): Promise<Package> {
    const packageToUpdate = await this.findOne(id);
    
    // Apply updates
    Object.assign(packageToUpdate, updatePackageDto);
    
    return this.packageRepository.save(packageToUpdate);
  }

  async remove(id: number): Promise<void> {
    const result = await this.packageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
  }
}
