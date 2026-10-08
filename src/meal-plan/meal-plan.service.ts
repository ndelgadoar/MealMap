import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RecipeIngredient } from '../recipes/entities/recipe-ingredient.entity.js';
import { Recipe } from '../recipes/entities/recipe.entity.js';
import { UsersService } from '../users/users.service.js';
import {
  ShoppingListResponse,
  WeeklyPlanResponse,
} from './dto/meal-plan-response.dto.js';
import { MealPlanEntry } from './entities/meal-plan-entry.entity.js';
import { MealPlan } from './entities/meal-plan.entity.js';
import { MealType } from './enums/meal-type.enum.js';
import { generateWeeklyPlan, MacroGoals } from './meal-plan-generator.js';
import { buildShoppingList, ShoppingLine } from './shopping-list.js';
import { currentWeekStart } from './week.util.js';

const round1 = (n: number) => Math.round(n * 10) / 10;
// Orden en que se muestran las comidas de un día (orden de declaración del enum)
const MEAL_ORDER = Object.values(MealType);

@Injectable()
export class MealPlanService {
  constructor(
    @InjectRepository(MealPlan) private readonly plans: Repository<MealPlan>,
    @InjectRepository(MealPlanEntry)
    private readonly entries: Repository<MealPlanEntry>,
    @InjectRepository(Recipe) private readonly recipes: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredients: Repository<RecipeIngredient>,
    private readonly usersService: UsersService,
  ) {}

  // Genera el plan de la semana actual. Si ya había uno, lo reemplaza.
  async generate(userId: string): Promise<WeeklyPlanResponse> {
    const goals = await this.getGoals(userId);

    const recipes = await this.recipes.find({ relations: { category: true } });
    if (recipes.length === 0) {
      throw new BadRequestException(
        'No hay recetas en el catálogo para armar el plan',
      );
    }

    const meals = generateWeeklyPlan(
      recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category.name,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
      })),
      goals,
    );

    const weekStartDate = currentWeekStart();
    await this.plans.manager.transaction(async (manager) => {
      // Al borrar el plan viejo se borran sus entradas (ON DELETE CASCADE)
      await manager.delete(MealPlan, { userId, weekStartDate });
      const plan = await manager.save(
        manager.create(MealPlan, { userId, weekStartDate }),
      );
      await manager.save(
        meals.map((meal) =>
          manager.create(MealPlanEntry, { mealPlanId: plan.id, ...meal }),
        ),
      );
    });

    return this.getCurrentPlan(userId);
  }

  // Lista de compras de la semana: lo que aporta cada comida del plan (1 porción de cada receta),
  // sumado por ingrediente
  async getShoppingList(userId: string): Promise<ShoppingListResponse> {
    const plan = await this.findCurrentPlan(userId);

    const entries = await this.entries.find({
      where: { mealPlanId: plan.id },
      relations: { recipe: true },
    });
    const recipeIds = [...new Set(entries.map((entry) => entry.recipeId))];
    const recipeIngredients = await this.recipeIngredients.find({
      where: { recipeId: In(recipeIds) },
      relations: { ingredient: true },
    });

    const lines: ShoppingLine[] = entries.flatMap((entry) =>
      recipeIngredients
        .filter((ri) => ri.recipeId === entry.recipeId)
        .map((ri) => ({
          ingredientId: ri.ingredientId,
          name: ri.ingredient.name,
          unit: ri.unit,
          // La cantidad de la receta es para todas sus porciones; el plan usa una
          quantityPerServing: ri.quantity / entry.recipe.servingSize,
        })),
    );

    return {
      weekStartDate: plan.weekStartDate,
      items: buildShoppingList(lines),
    };
  }

  // Plan de la semana actual, agrupado por día y con los totales de macros de cada día
  async getCurrentPlan(userId: string): Promise<WeeklyPlanResponse> {
    const plan = await this.findCurrentPlan(userId);

    const entries = await this.entries.find({
      where: { mealPlanId: plan.id },
      relations: { recipe: true },
    });

    const days = Array.from({ length: 7 }, (_, index) => {
      const dayOfWeek = index + 1;
      const meals = entries
        .filter((entry) => entry.dayOfWeek === dayOfWeek)
        .sort(
          (a, b) =>
            MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType),
        )
        .map((entry) => ({
          mealType: entry.mealType,
          recipe: {
            id: entry.recipe.id,
            name: entry.recipe.name,
            prepTimeMinutes: entry.recipe.prepTimeMinutes,
            calories: entry.recipe.calories,
            protein: entry.recipe.protein,
            carbs: entry.recipe.carbs,
            fat: entry.recipe.fat,
          },
        }));

      const sum = (macro: keyof MacroGoals) =>
        round1(meals.reduce((total, meal) => total + meal.recipe[macro], 0));
      return {
        dayOfWeek,
        meals,
        totals: {
          calories: sum('calories'),
          protein: sum('protein'),
          carbs: sum('carbs'),
          fat: sum('fat'),
        },
      };
    });

    return { id: plan.id, weekStartDate: plan.weekStartDate, days };
  }

  private async findCurrentPlan(userId: string): Promise<MealPlan> {
    const plan = await this.plans.findOneBy({
      userId,
      weekStartDate: currentWeekStart(),
    });
    if (!plan) {
      throw new NotFoundException(
        'No tienes un plan para esta semana. Genera uno con POST /meal-plan/generate',
      );
    }
    return plan;
  }

  // Metas diarias del usuario; si falta alguna no se puede armar el plan
  private async getGoals(userId: string): Promise<MacroGoals> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { dailyCalories, dailyProtein, dailyCarbs, dailyFat } = user;
    if (
      dailyCalories == null ||
      dailyProtein == null ||
      dailyCarbs == null ||
      dailyFat == null
    ) {
      throw new BadRequestException(
        'Configura tus metas de calorías, proteína, carbohidratos y grasas con PATCH /users/me/macros antes de generar el plan',
      );
    }
    return {
      calories: dailyCalories,
      protein: dailyProtein,
      carbs: dailyCarbs,
      fat: dailyFat,
    };
  }
}
