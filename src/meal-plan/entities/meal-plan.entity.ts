import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('meal_plans')
@Unique(['userId', 'weekStartDate'])
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Fecha (sin hora) en formato YYYY-MM-DD del primer día de la semana
  @Column({ type: 'date' })
  weekStartDate: string;

  @CreateDateColumn()
  createdAt: Date;
}
