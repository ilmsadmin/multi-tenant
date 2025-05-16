import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, ParseIntPipe, ValidationPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PackageService } from '../services/package.service';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
import { Package } from '../entities/package.entity';

@ApiTags('packages')
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new package' })
  @ApiBody({ type: CreatePackageDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The package has been successfully created.', type: Package })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  create(@Body(new ValidationPipe({ transform: true })) createPackageDto: CreatePackageDto): Promise<Package> {
    return this.packageService.create(createPackageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all packages.', type: [Package] })
  @ApiQuery({ name: 'name', required: false, description: 'Filter packages by name' })
  findAll(@Query('name') name?: string): Promise<Package[]> {
    return this.packageService.findAll(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by id' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The package with the given ID.', type: Package })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Package not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Package> {
    return this.packageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiBody({ type: UpdatePackageDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'The package has been successfully updated.', type: Package })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Package not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(new ValidationPipe({ transform: true })) updatePackageDto: UpdatePackageDto
  ): Promise<Package> {
    return this.packageService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The package has been successfully removed.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Package not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.packageService.remove(id);
  }
}
