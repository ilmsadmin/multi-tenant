import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Tên của vai trò', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả vai trò', example: 'Quản trị viên có toàn quyền truy cập' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Quyền hạn của vai trò', 
    example: { 
      crm: ['read', 'write', 'delete'], 
      hrm: ['read'] 
    } 
  })
  @IsObject()
  @IsOptional()
  permissions?: Record<string, any>;
}
