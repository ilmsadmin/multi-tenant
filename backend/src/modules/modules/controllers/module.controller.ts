import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpStatus, 
  HttpCode, 
  Query, 
  ValidationPipe 
} from '@nestjs/common';
import { ModuleService, ModuleQueryParams } from '../services/module.service';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const queryParams: ModuleQueryParams = {
      search,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    };
    return this.moduleService.findAll(queryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(+id, updateModuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.moduleService.remove(+id);
  }
  
  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.moduleService.findByName(name);
  }
}
