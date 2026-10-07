import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeIngredient } from './entities/recipe-ingredient.entity.js';
import { Recipe } from './entities/recipe.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeIngredient])],
  exports: [TypeOrmModule],
})
export class RecipesModule {}
