import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity.js';
import { MealType } from '../enums/meal-type.enum.js';
import { MealPlan } from './meal-plan.entity.js';

@Entity('meal_plan_entries')
@Check('"dayOfWeek" BETWEEN 1 AND 7')
export class MealPlanEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mealPlanId: string;

  // Al borrar el plan se borran sus entradas
  @ManyToOne(() => MealPlan, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mealPlanId' })
  mealPlan: MealPlan;

  @Column()
  recipeId: string;

  // No se puede borrar una receta que esté asignada en algún plan
  @ManyToOne(() => Recipe, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  // 1 = lunes ... 7 = domingo
  @Column({ type: 'smallint' })
  dayOfWeek: number;

  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;
}
