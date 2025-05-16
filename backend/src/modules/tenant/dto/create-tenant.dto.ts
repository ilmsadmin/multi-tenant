// dto/create-tenant.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tên của tenant',
    example: 'Công ty ABC',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'Tên tenant phải có độ dài từ 3 đến 100 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Domain của tenant (unique)',
    example: 'company-abc',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(3, 100, { message: 'Domain phải có độ dài từ 3 đến 100 ký tự' })
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, { 
    message: 'Domain chỉ được chứa chữ cái, số và dấu gạch ngang' 
  })
  domain?: string;

  @ApiPropertyOptional({
    description: 'ID của gói dịch vụ',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  package_id?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái của tenant',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
    example: TenantStatus.ACTIVE,
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus = TenantStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Mô tả về tenant',
    example: 'Công ty cung cấp dịch vụ phần mềm',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
