import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // select: false -> no se devuelve en las consultas a menos que se pida explícitamente
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'varchar', nullable: true, select: false })
  twoFASecret: string | null;

  @Column({ default: false })
  twoFAEnabled: boolean;

  // Metas diarias de macros (null hasta que el usuario las configure)
  @Column({ type: 'int', nullable: true })
  dailyCalories: number | null;

  @Column({ type: 'int', nullable: true })
  dailyProtein: number | null;

  @Column({ type: 'int', nullable: true })
  dailyCarbs: number | null;

  @Column({ type: 'int', nullable: true })
  dailyFat: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
