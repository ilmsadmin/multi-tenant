import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Tên schema của tenant', example: 'default_tenant' })
  @IsString()
  @IsOptional()
  schemaName?: string;
}
