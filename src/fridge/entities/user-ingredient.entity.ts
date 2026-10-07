import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';
import { User } from '../../users/entities/user.entity.js';

// Nevera virtual: ingredientes que el usuario tiene disponibles (sin cantidades)
@Entity('user_ingredients')
@Unique(['userId', 'ingredientId'])
export class UserIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  ingredientId: string;

  @ManyToOne(() => Ingredient, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
