import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('packages')
export class Package {
  @ApiProperty({ description: 'The unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Package name', example: 'Basic Tier' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Detailed description of the package', example: 'Basic package with standard features', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Package price', example: 19.99, nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiProperty({ description: 'Creation date and time' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update date and time' })
  @UpdateDateColumn()
  updated_at: Date;
}