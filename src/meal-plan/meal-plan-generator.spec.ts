import { MealType } from './enums/meal-type.enum.js';
import {
  generateWeeklyPlan,
  MacroGoals,
  PlanRecipe,
} from './meal-plan-generator.js';

// Receta con una distribución de macros típica (25 % proteína, 45 % carbos, 30 % grasa)
const buildRecipe = (
  id: string,
  category: string,
  calories: number,
): PlanRecipe => ({
  id,
  name: `Receta ${id}`,
  category,
  calories,
  protein: (calories * 0.25) / 4,
  carbs: (calories * 0.45) / 4,
  fat: (calories * 0.3) / 9,
});

// Catálogo de prueba con variedad de calorías por franja
const buildCatalog = (): PlanRecipe[] => [
  ...[300, 350, 400, 450, 500, 550, 600, 650].map((kcal) =>
    buildRecipe(`b${kcal}`, 'Desayuno', kcal),
  ),
  ...[150, 200, 250, 300, 350, 400, 450].map((kcal) =>
    buildRecipe(`s${kcal}`, 'Snack', kcal),
  ),
  ...[
    400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050,
  ].map((kcal, i) =>
    buildRecipe(`m${kcal}`, ['Alto en proteína', 'Vegetariano', 'Rápido'][i % 3], kcal),
  ),
];

const goals: MacroGoals = { calories: 2000, protein: 125, carbs: 225, fat: 67 };

describe('generateWeeklyPlan', () => {
  it('genera 28 comidas: 4 por cada uno de los 7 días', () => {
    const plan = generateWeeklyPlan(buildCatalog(), goals);

    expect(plan).toHaveLength(28);
    for (let day = 1; day <= 7; day++) {
      const meals = plan.filter((m) => m.dayOfWeek === day).map((m) => m.mealType);
      expect(meals).toEqual([
        MealType.BREAKFAST,
        MealType.LUNCH,
        MealType.DINNER,
        MealType.SNACK,
      ]);
    }
  });

  it('usa recetas de Desayuno solo en el desayuno y de Snack solo en el snack', () => {
    const catalog = buildCatalog();
    const categoryOf = (id: string) => catalog.find((r) => r.id === id)!.category;

    const plan = generateWeeklyPlan(catalog, goals);

    for (const meal of plan) {
      const category = categoryOf(meal.recipeId);
      if (meal.mealType === MealType.BREAKFAST) expect(category).toBe('Desayuno');
      else if (meal.mealType === MealType.SNACK) expect(category).toBe('Snack');
      else expect(['Desayuno', 'Snack']).not.toContain(category);
    }
  });

  it('no repite la misma receta dentro de un mismo día', () => {
    const plan = generateWeeklyPlan(buildCatalog(), goals);

    for (let day = 1; day <= 7; day++) {
      const ids = plan.filter((m) => m.dayOfWeek === day).map((m) => m.recipeId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('elige para el desayuno la receta que más se acerca a su parte de las metas', () => {
    // El desayuno le toca el 25 % de 2000 kcal = 500 kcal
    const plan = generateWeeklyPlan(buildCatalog(), goals);

    const firstBreakfast = plan.find(
      (m) => m.dayOfWeek === 1 && m.mealType === MealType.BREAKFAST,
    );
    expect(firstBreakfast?.recipeId).toBe('b500');
  });

  it('cada día queda cerca de la meta de calorías', () => {
    const catalog = buildCatalog();
    const plan = generateWeeklyPlan(catalog, goals);

    for (let day = 1; day <= 7; day++) {
      const total = plan
        .filter((m) => m.dayOfWeek === day)
        .reduce((sum, m) => sum + catalog.find((r) => r.id === m.recipeId)!.calories, 0);
      expect(Math.abs(total - goals.calories) / goals.calories).toBeLessThanOrEqual(0.1);
    }
  });

  it('con suficientes recetas no repite desayunos durante la semana', () => {
    const plan = generateWeeklyPlan(buildCatalog(), goals);

    const breakfasts = plan
      .filter((m) => m.mealType === MealType.BREAKFAST)
      .map((m) => m.recipeId);
    expect(new Set(breakfasts).size).toBe(7);
  });

  it('repite recetas cuando hay muy pocas, pero igual completa el plan', () => {
    const catalog = [
      buildRecipe('b1', 'Desayuno', 450),
      buildRecipe('s1', 'Snack', 200),
      buildRecipe('m1', 'Rápido', 600),
      buildRecipe('m2', 'Rápido', 700),
    ];

    const plan = generateWeeklyPlan(catalog, goals);

    expect(plan).toHaveLength(28);
  });

  it('usa todo el catálogo si una franja no tiene recetas (p. ej. sin snacks)', () => {
    const catalog = buildCatalog().filter((r) => r.category !== 'Snack');

    const plan = generateWeeklyPlan(catalog, goals);

    expect(plan).toHaveLength(28);
    expect(plan.filter((m) => m.mealType === MealType.SNACK)).toHaveLength(7);
  });

  it('es determinista: no depende del orden en que llegan las recetas', () => {
    const catalog = buildCatalog();

    const original = generateWeeklyPlan(catalog, goals);
    const reversed = generateWeeklyPlan([...catalog].reverse(), goals);

    expect(reversed).toEqual(original);
  });

  it('lanza error si no hay recetas', () => {
    expect(() => generateWeeklyPlan([], goals)).toThrow(
      'No hay recetas para generar el plan',
    );
  });

  it('no falla si una meta de macros es 0', () => {
    const plan = generateWeeklyPlan(buildCatalog(), { ...goals, fat: 0 });

    expect(plan).toHaveLength(28);
  });
});
