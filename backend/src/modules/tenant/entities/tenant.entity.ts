// entities/tenant.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TenantModule } from './tenant-module.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true, nullable: true })
  domain: string;

  @Column({ length: 63, unique: true })
  schema_name: string;

  @Column({ nullable: true })
  package_id: number;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TenantModule, tenantModule => tenantModule.tenant)
  modules: TenantModule[];
}
