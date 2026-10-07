import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserIngredient } from './entities/user-ingredient.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserIngredient])],
  exports: [TypeOrmModule],
})
export class FridgeModule {}
