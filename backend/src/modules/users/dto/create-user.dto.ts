import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export class CreateUserDto {
  @ApiProperty({ description: 'Tên đăng nhập của người dùng', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email của người dùng', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng', example: 'StrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Tên của người dùng', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Họ của người dùng', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ 
    description: 'Trạng thái của người dùng', 
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    example: UserStatus.ACTIVE
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus = UserStatus.ACTIVE;
  
  @ApiPropertyOptional({ 
    description: 'ID của các vai trò được gán cho người dùng', 
    type: [Number],
    example: [1, 2]
  })
  @IsOptional()
  roleIds?: number[];
}
