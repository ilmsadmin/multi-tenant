import { IsNotEmpty, IsString, IsObject, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDataDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Danh mục dữ liệu (ví dụ: preferences, transactions, history)' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Khóa dữ liệu' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Giá trị dữ liệu' })
  @IsObject()
  @IsNotEmpty()
  value: Record<string, any>;

  @ApiPropertyOptional({ description: 'Trạng thái của dữ liệu', enum: ['active', 'archived', 'pending'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Metadata bổ sung' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateUserDataDto {
  @ApiPropertyOptional({ description: 'Danh mục dữ liệu (ví dụ: preferences, transactions, history)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Khóa dữ liệu' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ description: 'Giá trị dữ liệu' })
  @IsObject()
  @IsOptional()
  value?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Trạng thái của dữ liệu', enum: ['active', 'archived', 'pending'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Metadata bổ sung' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class QueryUserDataDto {
  @ApiPropertyOptional({ description: 'ID của người dùng' })
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({ description: 'Danh mục dữ liệu' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Khóa dữ liệu' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Trạng thái của dữ liệu' })
  @IsOptional()
  @IsString()
  status?: string;
}
