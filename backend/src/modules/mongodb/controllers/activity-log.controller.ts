import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogService } from '../services/activity-log.service';
import { CreateActivityLogDto, QueryActivityLogDto } from '../dto/activity-log.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('activity-logs')
@ApiTags('Activity Logs')
@ApiBearerAuth()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo log hoạt động mới' })
  @ApiResponse({ status: 201, description: 'Log hoạt động đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.create(createActivityLogDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs.read')
  @ApiOperation({ summary: 'Lấy danh sách log hoạt động' })
  @ApiResponse({ status: 200, description: 'Danh sách log hoạt động' })
  async findAll(@Query() query: QueryActivityLogDto) {
    return this.activityLogService.findAll(query);
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs.read')
  @ApiOperation({ summary: 'Lấy log hoạt động theo tenant' })
  @ApiParam({ name: 'tenantId', description: 'ID của tenant' })
  @ApiResponse({ status: 200, description: 'Danh sách log hoạt động của tenant' })
  async findByTenant(@Param('tenantId') tenantId: string) {
    return this.activityLogService.findByTenant(tenantId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs.read')
  @ApiOperation({ summary: 'Lấy log hoạt động theo người dùng' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách log hoạt động của người dùng' })
  async findByUser(@Param('userId') userId: string) {
    return this.activityLogService.findByUser(userId);
  }

  @Get('action/:action')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs.read')
  @ApiOperation({ summary: 'Lấy log hoạt động theo loại hành động' })
  @ApiParam({ name: 'action', description: 'Loại hành động (login, create, update, delete, v.v.)' })
  @ApiResponse({ status: 200, description: 'Danh sách log hoạt động theo loại hành động' })
  async findByAction(@Param('action') action: string) {
    return this.activityLogService.findByAction(action);
  }

  @Get('entity/:entity')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('logs.read')
  @ApiOperation({ summary: 'Lấy log hoạt động theo entity' })
  @ApiParam({ name: 'entity', description: 'Loại entity (user, role, userData, v.v.)' })
  @ApiResponse({ status: 200, description: 'Danh sách log hoạt động theo entity' })
  async findByEntity(@Param('entity') entity: string, @Query('entityId') entityId?: string) {
    return this.activityLogService.findByEntity(entity, entityId);
  }
}
