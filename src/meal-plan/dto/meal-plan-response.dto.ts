import { ApiProperty } from '@nestjs/swagger';
import { Unit } from '../../recipes/enums/unit.enum.js';
import { MealType } from '../enums/meal-type.enum.js';

// Clases solo para documentar en Swagger la forma de las respuestas.
// El plugin de Swagger lee los comentarios: la primera línea es la descripción y @example el ejemplo.

export class MacroTotalsResponse {
  /**
   * Calorías (kcal)
   * @example 2026.1
   */
  calories: number;

  /**
   * Proteína (g)
   * @example 149.2
   */
  protein: number;

  /**
   * Carbohidratos (g)
   * @example 198.4
   */
  carbs: number;

  /**
   * Grasas (g)
   * @example 69.3
   */
  fat: number;
}

export class PlanRecipeResponse {
  /**
   * Id de la receta
   * @example 2d6ab013-ca11-4ca8-acfa-ee840c0a645f
   */
  id: string;

  /**
   * Nombre de la receta
   * @example "Huevos pericos con arepa"
   */
  name: string;

  /**
   * Tiempo de preparación en minutos
   * @example 12
   */
  prepTimeMinutes: number;

  /**
   * Calorías por porción (kcal)
   * @example 450.7
   */
  calories: number;

  /**
   * Proteína por porción (g)
   * @example 23.76
   */
  protein: number;

  /**
   * Carbohidratos por porción (g)
   * @example 41.56
   */
  carbs: number;

  /**
   * Grasas por porción (g)
   * @example 20.67
   */
  fat: number;
}

export class PlanMealResponse {
  @ApiProperty({ enum: MealType, example: MealType.BREAKFAST })
  mealType: MealType;

  recipe: PlanRecipeResponse;
}

export class PlanDayResponse {
  /**
   * 1 = lunes ... 7 = domingo
   * @example 1
   */
  dayOfWeek: number;

  /** Las 4 comidas del día, en orden: desayuno, almuerzo, cena y snack */
  meals: PlanMealResponse[];

  /** Suma de los macros de las 4 comidas del día */
  totals: MacroTotalsResponse;
}

export class WeeklyPlanResponse {
  /**
   * Id del plan
   * @example 475f7093-8f9f-4559-bc70-6c98c75baa59
   */
  id: string;

  /**
   * Lunes de la semana del plan
   * @example 2026-10-05
   */
  weekStartDate: string;

  days: PlanDayResponse[];
}

export class ShoppingItemResponse {
  /**
   * Id del ingrediente
   * @example 3262729e-49fe-4abd-9338-22d9ee8a9f38
   */
  ingredientId: string;

  /**
   * Nombre del ingrediente
   * @example "Pechuga de pollo"
   */
  name: string;

  /**
   * Cantidad total a comprar, redondeada hacia arriba al entero
   * @example 1054
   */
  quantity: number;

  @ApiProperty({ enum: Unit, example: Unit.GRAMS })
  unit: Unit;

  /**
   * Texto listo para mostrar
   * @example "1,06 kg de pechuga de pollo"
   */
  label: string;
}

export class ShoppingListResponse {
  /**
   * Lunes de la semana del plan
   * @example 2026-10-05
   */
  weekStartDate: string;

  /** Ingredientes ordenados alfabéticamente */
  items: ShoppingItemResponse[];
}
