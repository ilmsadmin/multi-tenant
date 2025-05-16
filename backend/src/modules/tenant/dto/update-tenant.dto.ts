import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto, TenantStatus } from './create-tenant.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiPropertyOptional({ description: 'Tên mới của tenant' })
  name?: string;

  @ApiPropertyOptional({ description: 'Domain mới của tenant' })
  domain?: string;

  @ApiPropertyOptional({ description: 'ID của gói dịch vụ mới' })
  package_id?: number;
  @ApiPropertyOptional({ 
    description: 'Trạng thái mới của tenant',
    enum: TenantStatus,
    example: TenantStatus.ACTIVE
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiPropertyOptional({ description: 'Mô tả mới về tenant' })
  description?: string;
}
