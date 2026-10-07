import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeIngredient } from '../recipes/entities/recipe-ingredient.entity.js';
import { Recipe } from '../recipes/entities/recipe.entity.js';
import { UsersModule } from '../users/users.module.js';
import { MealPlanEntry } from './entities/meal-plan-entry.entity.js';
import { MealPlan } from './entities/meal-plan.entity.js';
import { MealPlanController } from './meal-plan.controller.js';
import { MealPlanService } from './meal-plan.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlan, MealPlanEntry, Recipe, RecipeIngredient]),
    UsersModule,
  ],
  controllers: [MealPlanController],
  providers: [MealPlanService],
  exports: [TypeOrmModule, MealPlanService],
})
export class MealPlanModule {}
