import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecipeIngredient } from '../recipes/entities/recipe-ingredient.entity.js';
import { Recipe } from '../recipes/entities/recipe.entity.js';
import { Unit } from '../recipes/enums/unit.enum.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { MealPlanEntry } from './entities/meal-plan-entry.entity.js';
import { MealPlan } from './entities/meal-plan.entity.js';
import { MealType } from './enums/meal-type.enum.js';
import { MealPlanService } from './meal-plan.service.js';

// Miércoles 7 de octubre de 2026 -> la semana empieza el lunes 2026-10-05
const NOW = new Date('2026-10-07T17:00:00Z');
const WEEK_START = '2026-10-05';

describe('MealPlanService', () => {
  let service: MealPlanService;

  const manager = {
    delete: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const plans = {
    findOneBy: vi.fn(),
    manager: { transaction: vi.fn() },
  };
  const entries = { find: vi.fn() };
  const recipes = { find: vi.fn() };
  const recipeIngredients = { find: vi.fn() };
  const usersService = { findById: vi.fn() };

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 200,
      dailyFat: 67,
      ...overrides,
    }) as User;

  const buildRecipe = (id: string, category: string, calories: number): Recipe =>
    ({
      id,
      name: `Receta ${id}`,
      category: { name: category },
      prepTimeMinutes: 10,
      calories,
      protein: calories / 15,
      carbs: calories / 10,
      fat: calories / 30,
      servingSize: 1,
    }) as Recipe;

  const catalog = (): Recipe[] => [
    buildRecipe('b1', 'Desayuno', 450),
    buildRecipe('s1', 'Snack', 200),
    buildRecipe('m1', 'Rápido', 600),
    buildRecipe('m2', 'Vegetariano', 700),
  ];

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);

    // La transacción ejecuta el callback con un manager simulado
    plans.manager.transaction.mockImplementation(
      (callback: (m: typeof manager) => Promise<unknown>) => callback(manager),
    );
    manager.create.mockImplementation((_entity: unknown, data: object) => data);
    manager.save.mockImplementation((data: object | object[]) =>
      Array.isArray(data) ? data : { ...data, id: 'plan-1' },
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        MealPlanService,
        { provide: getRepositoryToken(MealPlan), useValue: plans },
        { provide: getRepositoryToken(MealPlanEntry), useValue: entries },
        { provide: getRepositoryToken(Recipe), useValue: recipes },
        {
          provide: getRepositoryToken(RecipeIngredient),
          useValue: recipeIngredients,
        },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = moduleRef.get(MealPlanService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generate', () => {
    it('lanza NotFound si el usuario no existe', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.generate('user-1')).rejects.toThrow(NotFoundException);
    });

    it.each(['dailyCalories', 'dailyProtein', 'dailyCarbs', 'dailyFat'] as const)(
      'lanza BadRequest si falta la meta %s',
      async (field) => {
        usersService.findById.mockResolvedValue(buildUser({ [field]: null }));

        await expect(service.generate('user-1')).rejects.toThrow(
          BadRequestException,
        );
        expect(recipes.find).not.toHaveBeenCalled();
      },
    );

    it('acepta una meta en 0 (no es lo mismo que no configurarla)', async () => {
      usersService.findById.mockResolvedValue(buildUser({ dailyFat: 0 }));
      recipes.find.mockResolvedValue(catalog());
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      entries.find.mockResolvedValue([]);

      await expect(service.generate('user-1')).resolves.toBeDefined();
    });

    it('lanza BadRequest si el catálogo no tiene recetas', async () => {
      usersService.findById.mockResolvedValue(buildUser());
      recipes.find.mockResolvedValue([]);

      await expect(service.generate('user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(plans.manager.transaction).not.toHaveBeenCalled();
    });

    it('reemplaza el plan de la semana y guarda 28 comidas', async () => {
      usersService.findById.mockResolvedValue(buildUser());
      recipes.find.mockResolvedValue(catalog());
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      entries.find.mockResolvedValue([]);

      const result = await service.generate('user-1');

      // Borra el plan anterior de esa semana antes de crear el nuevo
      expect(manager.delete).toHaveBeenCalledWith(MealPlan, {
        userId: 'user-1',
        weekStartDate: WEEK_START,
      });
      expect(manager.delete.mock.invocationCallOrder[0]).toBeLessThan(
        manager.save.mock.invocationCallOrder[0],
      );

      const savedEntries = manager.save.mock.calls[1][0] as {
        mealPlanId: string;
        dayOfWeek: number;
        mealType: MealType;
        recipeId: string;
      }[];
      expect(savedEntries).toHaveLength(28);
      expect(savedEntries.every((e) => e.mealPlanId === 'plan-1')).toBe(true);
      expect(result.id).toBe('plan-1');
    });

    it('usa las categorías para elegir recetas: Desayuno en el desayuno y Snack en el snack', async () => {
      usersService.findById.mockResolvedValue(buildUser());
      recipes.find.mockResolvedValue(catalog());
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      entries.find.mockResolvedValue([]);

      await service.generate('user-1');

      const savedEntries = manager.save.mock.calls[1][0] as {
        mealType: MealType;
        recipeId: string;
      }[];
      const idsOf = (type: MealType) =>
        new Set(savedEntries.filter((e) => e.mealType === type).map((e) => e.recipeId));
      expect(idsOf(MealType.BREAKFAST)).toEqual(new Set(['b1']));
      expect(idsOf(MealType.SNACK)).toEqual(new Set(['s1']));
    });
  });

  describe('getCurrentPlan', () => {
    it('lanza NotFound si no hay plan para la semana actual', async () => {
      plans.findOneBy.mockResolvedValue(null);

      await expect(service.getCurrentPlan('user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(plans.findOneBy).toHaveBeenCalledWith({
        userId: 'user-1',
        weekStartDate: WEEK_START,
      });
    });

    it('agrupa por día, ordena las comidas y suma los macros de cada día', async () => {
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      // Llegan desordenadas a propósito
      entries.find.mockResolvedValue([
        { dayOfWeek: 1, mealType: MealType.SNACK, recipe: buildRecipe('s1', 'Snack', 200) },
        { dayOfWeek: 1, mealType: MealType.BREAKFAST, recipe: buildRecipe('b1', 'Desayuno', 450) },
        { dayOfWeek: 3, mealType: MealType.LUNCH, recipe: buildRecipe('m1', 'Rápido', 600) },
      ]);

      const plan = await service.getCurrentPlan('user-1');

      expect(plan.weekStartDate).toBe(WEEK_START);
      expect(plan.days).toHaveLength(7);
      expect(plan.days.map((d) => d.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6, 7]);

      expect(plan.days[0].meals.map((m) => m.mealType)).toEqual([
        MealType.BREAKFAST,
        MealType.SNACK,
      ]);
      expect(plan.days[0].totals.calories).toBe(650);
      expect(plan.days[2].meals).toHaveLength(1);
    });

    it('los días sin comidas quedan vacíos y con totales en 0', async () => {
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      entries.find.mockResolvedValue([]);

      const plan = await service.getCurrentPlan('user-1');

      expect(plan.days[1].meals).toEqual([]);
      expect(plan.days[1].totals).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    });
  });

  describe('getShoppingList', () => {
    it('lanza NotFound si no hay plan para la semana actual', async () => {
      plans.findOneBy.mockResolvedValue(null);

      await expect(service.getShoppingList('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('divide la receta entre sus porciones y suma lo de todas las comidas', async () => {
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      // r1 rinde 4 porciones y sale dos veces en el plan; r2 rinde 1 porción
      entries.find.mockResolvedValue([
        { recipeId: 'r1', recipe: { servingSize: 4 } },
        { recipeId: 'r1', recipe: { servingSize: 4 } },
        { recipeId: 'r2', recipe: { servingSize: 1 } },
      ]);
      const arroz = { name: 'Arroz blanco' };
      recipeIngredients.find.mockResolvedValue([
        { recipeId: 'r1', ingredientId: 'i1', ingredient: arroz, unit: Unit.GRAMS, quantity: 600 },
        { recipeId: 'r2', ingredientId: 'i1', ingredient: arroz, unit: Unit.GRAMS, quantity: 100 },
        { recipeId: 'r2', ingredientId: 'i2', ingredient: { name: 'Huevo' }, unit: Unit.UNIT, quantity: 2 },
      ]);

      const { weekStartDate, items } = await service.getShoppingList('user-1');

      expect(weekStartDate).toBe(WEEK_START);
      // Arroz: 600/4 + 600/4 + 100 = 400 g
      expect(items.find((i) => i.name === 'Arroz blanco')).toMatchObject({
        quantity: 400,
        unit: Unit.GRAMS,
        label: '400 g de arroz blanco',
      });
      expect(items.find((i) => i.name === 'Huevo')).toMatchObject({
        quantity: 2,
        unit: Unit.UNIT,
      });
      expect(items).toHaveLength(2);
    });

    it('consulta los ingredientes una sola vez aunque se repitan recetas', async () => {
      plans.findOneBy.mockResolvedValue({ id: 'plan-1', weekStartDate: WEEK_START });
      entries.find.mockResolvedValue([
        { recipeId: 'r1', recipe: { servingSize: 1 } },
        { recipeId: 'r1', recipe: { servingSize: 1 } },
      ]);
      recipeIngredients.find.mockResolvedValue([]);

      const { items } = await service.getShoppingList('user-1');

      expect(recipeIngredients.find).toHaveBeenCalledTimes(1);
      expect(items).toEqual([]);
    });
  });
});
