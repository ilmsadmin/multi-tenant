import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Email của người dùng', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu của người dùng', example: 'NewStrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

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
    example: UserStatus.ACTIVE
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
  
  @ApiPropertyOptional({ 
    description: 'ID của các vai trò được gán cho người dùng', 
    type: [Number],
    example: [1, 2]
  })
  @IsOptional()
  roleIds?: number[];

  @ApiPropertyOptional({ 
    description: 'Thời gian đăng nhập cuối', 
    type: Date
  })
  @IsOptional()
  lastLogin?: Date;
}
