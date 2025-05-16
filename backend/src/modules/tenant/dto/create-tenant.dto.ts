// dto/create-tenant.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsNumber()
  @IsOptional()
  package_id?: number;
}
