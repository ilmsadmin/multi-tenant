import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Tên của quyền', example: 'Create User' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Khóa định danh của quyền (dùng trong code)', 
    example: 'user.create' 
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả về quyền', 
    example: 'Cho phép tạo người dùng mới trong hệ thống' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Module mà quyền này thuộc về', 
    example: 'user' 
  })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiPropertyOptional({ 
    description: 'Loại quyền', 
    example: 'action', 
    default: 'action'
  })
  @IsString()
  @IsOptional()
  type?: string;
}
