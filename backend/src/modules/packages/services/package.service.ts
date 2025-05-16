import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
    try {
      const newPackage = this.packageRepository.create(createPackageDto);
      return await this.packageRepository.save(newPackage);
    } catch (error) {
      throw new BadRequestException('Error creating package: ' + error.message);
    }
  }

  async findAll(name?: string): Promise<Package[]> {
    try {
      if (name) {
        return this.packageRepository.find({
          where: { name: Like(`%${name}%`) }
        });
      }
      return this.packageRepository.find();
    } catch (error) {
      throw new BadRequestException('Error fetching packages: ' + error.message);
    }
  }

  async findOne(id: number): Promise<Package> {
    try {
      const packageEntity = await this.packageRepository.findOne({ where: { id } });
      if (!packageEntity) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
      return packageEntity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching package: ' + error.message);
    }
  }

    async update(id: number, updatePackageDto: UpdatePackageDto): Promise<Package> {
    try {
      const packageToUpdate = await this.findOne(id);
      
      // Apply updates
      Object.assign(packageToUpdate, updatePackageDto);
      
      return await this.packageRepository.save(packageToUpdate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating package: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.packageRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting package: ' + error.message);
    }
  }
}
