// tenant.controller.ts
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
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
  DefaultValuePipe,
  BadRequestException
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, TenantStatus } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantModuleActivationDto, ModuleStatus } from './dto/tenant-module-activation.dto';
import { Tenant } from './entities/tenant.entity';
import { TenantModule } from './entities/tenant-module.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody, 
  ApiBearerAuth
} from '@nestjs/swagger';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Tạo tenant mới' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tenant đã được tạo thành công.', type: Tenant })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Domain hoặc schema đã tồn tại.' })
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tenant' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên' })
  @ApiQuery({ name: 'status', required: false, enum: TenantStatus, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang, mặc định là 1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số item trên một trang, mặc định là 10, tối đa 100' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách tenant' })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: TenantStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit không được vượt quá 100');
    }
    
    const skip = (page - 1) * limit;
    const { data, total } = await this.tenantService.findAll({
      search,
      status,
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Thông tin của tenant', type: Tenant })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant không tồn tại' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Tenant> {
    const tenant = await this.tenantService.findOne(id);
    // Service đã xử lý NotFoundException nếu không tìm thấy tenant
    return tenant;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant cần xóa' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Tenant đã được xóa thành công' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant không tồn tại' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tenantService.remove(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Cập nhật thông tin của một tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant cần cập nhật' })
  @ApiBody({ type: UpdateTenantDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tenant đã được cập nhật thành công', type: Tenant })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant không tồn tại' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateTenantDto: UpdateTenantDto
  ): Promise<Tenant> {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Cập nhật trạng thái của một tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant cần cập nhật trạng thái' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(TenantStatus),
          description: 'Trạng thái mới của tenant',
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trạng thái của tenant đã được cập nhật thành công', type: Tenant })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant không tồn tại' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Trạng thái không hợp lệ' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TenantStatus,
  ): Promise<Tenant> {
    if (!Object.values(TenantStatus).includes(status)) {
      throw new BadRequestException(`Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${Object.values(TenantStatus).join(', ')}`);
    }
    return this.tenantService.changeStatus(id, status);
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Tìm tenant theo domain' })
  @ApiParam({ name: 'domain', description: 'Domain của tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Thông tin của tenant', type: Tenant })  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant không tồn tại' })
  async findByDomain(@Param('domain') domain: string): Promise<Tenant | null> {
    return this.tenantService.findByDomain(domain);
  }

  @Post(':id/modules')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Kích hoạt/vô hiệu hóa module cho tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant' })
  @ApiBody({ type: () => TenantModuleActivationDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Module đã được cập nhật trạng thái thành công' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant hoặc module không tồn tại' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
  async activateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() activationDto: TenantModuleActivationDto
  ) {
    return this.tenantService.activateModule(id, activationDto);
  }

  @Get(':id/modules')
  @ApiOperation({ summary: 'Lấy danh sách modules của tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách modules của tenant' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant không tồn tại' })
  async getTenantModules(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.getTenantModules(id);
  }

  @Get(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một module của tenant' })
  @ApiParam({ name: 'id', description: 'ID của tenant' })
  @ApiParam({ name: 'moduleId', description: 'ID của module' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Thông tin chi tiết của module cho tenant' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tenant hoặc module không tồn tại' })
  async getTenantModule(
    @Param('id', ParseIntPipe) id: number,
    @Param('moduleId', ParseIntPipe) moduleId: number
  ) {
    return this.tenantService.getTenantModule(id, moduleId);
  }
}
