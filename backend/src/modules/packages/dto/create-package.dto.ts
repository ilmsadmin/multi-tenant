import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ 
    description: 'Package name', 
    example: 'Premium Tier', 
    maxLength: 255 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Detailed description of the package', 
    example: 'Premium package with advanced features and priority support', 
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Package price', 
    example: 49.99, 
    required: false,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}