import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({ 
    description: 'Danh sách ID của các quyền cần gán cho vai trò',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];

  @ApiPropertyOptional({ 
    description: 'Thay thế hoàn toàn danh sách quyền hiện tại thay vì thêm vào',
    example: true,
    default: false
  })
  @IsOptional()
  replace?: boolean;
}
