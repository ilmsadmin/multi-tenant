import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({
    description: 'The name of the module',
    example: 'CRM',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'A description of the module functionality',
    example: 'Customer Relationship Management module for handling customer data',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The version of the module',
    example: '1.0.0',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  version?: string;
}
