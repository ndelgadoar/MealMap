import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlanEntry } from './entities/meal-plan-entry.entity.js';
import { MealPlan } from './entities/meal-plan.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan, MealPlanEntry])],
  exports: [TypeOrmModule],
})
export class MealPlanModule {}
