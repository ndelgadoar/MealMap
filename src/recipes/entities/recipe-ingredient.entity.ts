import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';
import { Unit } from '../enums/unit.enum.js';
import { Recipe } from './recipe.entity.js';

@Entity('recipe_ingredients')
@Unique(['recipeId', 'ingredientId'])
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipeId: string;

  // Al borrar la receta se borran sus ingredientes asociados
  @ManyToOne(() => Recipe, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @Column()
  ingredientId: string;

  // No se puede borrar un ingrediente que esté en uso en alguna receta
  @ManyToOne(() => Ingredient, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  // Cantidad para la receta completa
  @Column({ type: 'numeric', precision: 8, scale: 2, transformer: decimalTransformer })
  quantity: number;

  @Column({ type: 'enum', enum: Unit })
  unit: Unit;
}
