import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { PackageService } from '../services/package.service';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packageService.create(createPackageDto);
  }

  @Get()
  findAll() {
    return this.packageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packageService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.packageService.remove(+id);
  }
}
