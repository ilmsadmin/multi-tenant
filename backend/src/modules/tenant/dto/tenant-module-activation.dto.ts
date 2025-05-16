import { IsNotEmpty, IsNumber, IsIn, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ModuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class TenantModuleActivationDto {
  @ApiProperty({
    description: 'ID của module cần kích hoạt/vô hiệu hóa',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  module_id: number;

  @ApiProperty({
    description: 'Trạng thái của module cho tenant',
    enum: ModuleStatus,
    example: 'active',
  })
  @IsIn(Object.values(ModuleStatus))
  @IsNotEmpty()
  status: ModuleStatus;

  @ApiProperty({
    description: 'Cài đặt tùy chỉnh cho module (tùy chọn)',
    required: false,
    example: { enableFeature1: true, maxUsers: 5 },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
