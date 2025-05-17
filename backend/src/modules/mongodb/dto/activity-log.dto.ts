import { IsNotEmpty, IsString, IsObject, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityLogDto {
  @ApiProperty({ description: 'ID của tenant' })
  @IsString()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ description: 'ID của người dùng' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Loại hành động (login, create, update, delete, v.v.)' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Đối tượng/module bị tác động (user, role, userData, v.v.)' })
  @IsString()
  @IsNotEmpty()
  entity: string;

  @ApiPropertyOptional({ description: 'ID của đối tượng bị tác động' })
  @IsOptional()
  @IsString()
  entity_id?: string;
  @ApiProperty({ description: 'Chi tiết về hành động' })
  @IsObject()
  @IsNotEmpty()
  details: Record<string, any>;
  
  @ApiPropertyOptional({ description: 'Thay đổi dữ liệu' })
  @IsOptional()
  @IsObject()
  changes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Địa chỉ IP của người dùng' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'Thông tin về trình duyệt/thiết bị' })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiPropertyOptional({ description: 'Thời gian hành động' })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}

export class QueryActivityLogDto {
  @ApiPropertyOptional({ description: 'ID của tenant' })
  @IsOptional()
  @IsString()
  tenant_id?: string;

  @ApiPropertyOptional({ description: 'ID của người dùng' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Loại hành động' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Đối tượng/module bị tác động' })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({ description: 'ID của đối tượng bị tác động' })
  @IsOptional()
  @IsString()
  entity_id?: string;

  @ApiPropertyOptional({ description: 'Từ ngày (ISO format)' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'Đến ngày (ISO format)' })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
