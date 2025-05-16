import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
