import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe])],
  exports: [TypeOrmModule],
})
export class RecipesModule {}
