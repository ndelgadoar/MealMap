import { MealType } from './enums/meal-type.enum.js';

// Receta con los datos mínimos que necesita el algoritmo (macros por porción)
export interface PlanRecipe {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Metas diarias del usuario
export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PlannedMeal {
  dayOfWeek: number; // 1 = lunes ... 7 = domingo
  mealType: MealType;
  recipeId: string;
}

type Macro = keyof MacroGoals;

const MACROS: Macro[] = ['calories', 'protein', 'carbs', 'fat'];
const DAYS_IN_WEEK = 7;

// Las categorías del seed indican en qué franja encaja una receta;
// el resto de categorías (Alto en proteína, Vegetariano, Rápido...) sirve para almuerzo y cena.
const BREAKFAST_CATEGORY = 'Desayuno';
const SNACK_CATEGORY = 'Snack';

// Orden en que se llenan las comidas de un día y qué parte de las metas diarias le toca a cada una
const SLOTS: { mealType: MealType; share: number }[] = [
  { mealType: MealType.BREAKFAST, share: 0.25 },
  { mealType: MealType.LUNCH, share: 0.35 },
  { mealType: MealType.DINNER, share: 0.3 },
  { mealType: MealType.SNACK, share: 0.1 },
];

// Cuánto se "castiga" a una receta por cada vez que ya está en el plan de la semana.
// El error se suma sobre los 4 macros y cada uno se mide respecto a su meta diaria, así que
// 0.3 equivale a aceptar un desvío de ~7,5 % de las calorías diarias en una comida para no repetir.
const REPEAT_PENALTY = 0.3;

// Algoritmo voraz: recorre los 7 días y, para cada comida, elige la receta que más se acerca
// a lo que le falta al día por cubrir, procurando no repetir recetas.
// Es determinista: las mismas recetas y metas siempre generan el mismo plan.
export function generateWeeklyPlan(
  recipes: PlanRecipe[],
  goals: MacroGoals,
): PlannedMeal[] {
  if (recipes.length === 0) {
    throw new Error('No hay recetas para generar el plan');
  }

  // Orden estable para que el resultado no dependa del orden en que llegan las recetas
  const sorted = [...recipes].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
  const pools = buildPools(sorted);

  const timesUsed = new Map<string, number>();
  const plan: PlannedMeal[] = [];

  for (let dayOfWeek = 1; dayOfWeek <= DAYS_IN_WEEK; dayOfWeek++) {
    const consumed = emptyMacros();
    const usedToday = new Set<string>();

    SLOTS.forEach((slot, index) => {
      const target = slotTarget(goals, consumed, index);
      const pool = pools.get(slot.mealType)!;
      // No repetir receta el mismo día, salvo que no quede otra
      const notUsedToday = pool.filter((recipe) => !usedToday.has(recipe.id));
      const candidates = notUsedToday.length > 0 ? notUsedToday : pool;

      const best = pickBest(candidates, target, goals, timesUsed);

      plan.push({ dayOfWeek, mealType: slot.mealType, recipeId: best.id });
      usedToday.add(best.id);
      timesUsed.set(best.id, (timesUsed.get(best.id) ?? 0) + 1);
      for (const macro of MACROS) consumed[macro] += best[macro];
    });
  }

  return plan;
}

// Recetas candidatas para cada franja. Si una franja se queda sin recetas
// (p. ej. el admin borró los snacks), se usa todo el catálogo.
function buildPools(recipes: PlanRecipe[]): Map<MealType, PlanRecipe[]> {
  const breakfast = recipes.filter((r) => r.category === BREAKFAST_CATEGORY);
  const snack = recipes.filter((r) => r.category === SNACK_CATEGORY);
  const main = recipes.filter(
    (r) => r.category !== BREAKFAST_CATEGORY && r.category !== SNACK_CATEGORY,
  );
  const orAll = (pool: PlanRecipe[]) => (pool.length > 0 ? pool : recipes);

  return new Map([
    [MealType.BREAKFAST, orAll(breakfast)],
    [MealType.LUNCH, orAll(main)],
    [MealType.DINNER, orAll(main)],
    [MealType.SNACK, orAll(snack)],
  ]);
}

// Lo que le falta al día se reparte entre las comidas que quedan por llenar.
// Así, si una comida se pasa, las siguientes compensan.
function slotTarget(
  goals: MacroGoals,
  consumed: MacroGoals,
  slotIndex: number,
): MacroGoals {
  const remainingShare = SLOTS.slice(slotIndex).reduce(
    (sum, slot) => sum + slot.share,
    0,
  );
  const target = emptyMacros();
  for (const macro of MACROS) {
    const missing = Math.max(goals[macro] - consumed[macro], 0);
    target[macro] = (missing * SLOTS[slotIndex].share) / remainingShare;
  }
  return target;
}

function pickBest(
  candidates: PlanRecipe[],
  target: MacroGoals,
  goals: MacroGoals,
  timesUsed: Map<string, number>,
): PlanRecipe {
  let best = candidates[0];
  let bestScore = Infinity;

  for (const recipe of candidates) {
    let score = (timesUsed.get(recipe.id) ?? 0) * REPEAT_PENALTY;
    for (const macro of MACROS) {
      // Error relativo a la meta diaria, para que calorías y gramos pesen parecido
      score += Math.abs(recipe[macro] - target[macro]) / Math.max(goals[macro], 1);
    }
    if (score < bestScore) {
      best = recipe;
      bestScore = score;
    }
  }
  return best;
}

function emptyMacros(): MacroGoals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}
