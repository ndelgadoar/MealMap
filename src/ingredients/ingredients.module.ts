import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  exports: [TypeOrmModule],
})
export class IngredientsModule {}
