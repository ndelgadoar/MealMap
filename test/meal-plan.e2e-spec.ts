import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { MealPlanEntry } from '../src/meal-plan/entities/meal-plan-entry.entity.js';
import { MealPlan } from '../src/meal-plan/entities/meal-plan.entity.js';
import { MealType } from '../src/meal-plan/enums/meal-type.enum.js';
import { Recipe } from '../src/recipes/entities/recipe.entity.js';
import { User } from '../src/users/entities/user.entity.js';
import { createTestApp } from './support/test-app.js';

interface PlanDay {
  dayOfWeek: number;
  meals: { mealType: MealType; recipe: { id: string; name: string } }[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

describe('Plan semanal y macros (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const http = () => request(app.getHttpServer());

  const password = 'password123';
  const goals = { dailyCalories: 2000, dailyProtein: 150, dailyCarbs: 200, dailyFat: 67 };

  let anaToken: string;
  let anaId: string;
  let betoToken: string; // usuario sin metas ni plan
  let adminToken: string;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  const registerAndLogin = async (email: string) => {
    const created = await http().post('/auth/register').send({ email, password }).expect(201);
    const login = await http().post('/auth/login').send({ email, password }).expect(200);
    return { id: created.body.id as string, token: login.body.accessToken as string };
  };

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());

    // Catálogo real: categorías, ingredientes, recetas y admin
    await http().post('/seed').set('x-seed-key', process.env.SEED_KEY as string).expect(201);

    ({ id: anaId, token: anaToken } = await registerAndLogin('ana@example.com'));
    ({ token: betoToken } = await registerAndLogin('beto@example.com'));

    const adminLogin = await http()
      .post('/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
      .expect(200);
    adminToken = adminLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /users/me/macros', () => {
    it('responde 401 sin token', async () => {
      await http().patch('/users/me/macros').send(goals).expect(401);
    });

    it('guarda las metas y las devuelve', async () => {
      const res = await http()
        .patch('/users/me/macros')
        .set(auth(anaToken))
        .send(goals)
        .expect(200);

      expect(res.body).toEqual(goals);

      const stored = await dataSource.getRepository(User).findOneByOrFail({ id: anaId });
      expect(stored).toMatchObject(goals);
    });

    it('permite actualizar una sola meta y conserva las demás', async () => {
      const res = await http()
        .patch('/users/me/macros')
        .set(auth(anaToken))
        .send({ dailyProtein: 160 })
        .expect(200);

      expect(res.body).toEqual({ ...goals, dailyProtein: 160 });

      // Se deja como estaba para el resto de las pruebas
      await http().patch('/users/me/macros').set(auth(anaToken)).send(goals).expect(200);
    });

    it('con un body vacío responde 200 y no cambia nada', async () => {
      const res = await http().patch('/users/me/macros').set(auth(anaToken)).send({}).expect(200);

      expect(res.body).toEqual(goals);
    });

    it.each([
      ['calorías por debajo del mínimo', { dailyCalories: 100 }],
      ['calorías por encima del máximo', { dailyCalories: 50000 }],
      ['proteína negativa', { dailyProtein: -5 }],
      ['carbohidratos que no son número', { dailyCarbs: 'muchos' }],
      ['grasas con decimales', { dailyFat: 60.5 }],
      ['intento de cambiar el rol', { role: 'ADMIN' }],
    ])('responde 400 con %s', async (_caso, body) => {
      await http().patch('/users/me/macros').set(auth(anaToken)).send(body).expect(400);
    });

    it('solo modifica al usuario autenticado', async () => {
      const beto = await http()
        .patch('/users/me/macros')
        .set(auth(betoToken))
        .send({ dailyCalories: 1500 })
        .expect(200);

      expect(beto.body.dailyCalories).toBe(1500);
      const ana = await http().patch('/users/me/macros').set(auth(anaToken)).send({}).expect(200);
      expect(ana.body.dailyCalories).toBe(2000);

      // Beto vuelve a quedar sin metas
      await dataSource.getRepository(User).update({ email: 'beto@example.com' }, { dailyCalories: null });
    });
  });

  describe('Rutas protegidas de /meal-plan', () => {
    it.each([
      ['POST', '/meal-plan/generate'],
      ['GET', '/meal-plan'],
      ['GET', '/meal-plan/shopping-list'],
    ])('%s %s responde 401 sin token', async (method, path) => {
      await http()[method === 'POST' ? 'post' : 'get'](path).expect(401);
    });

    it.each([
      ['POST', '/meal-plan/generate'],
      ['GET', '/meal-plan'],
      ['GET', '/meal-plan/shopping-list'],
    ])('%s %s responde 403 para un admin (es solo para usuarios)', async (method, path) => {
      await http()
        [method === 'POST' ? 'post' : 'get'](path)
        .set(auth(adminToken))
        .expect(403);
    });
  });

  describe('Antes de generar un plan', () => {
    it('GET /meal-plan responde 404', async () => {
      const res = await http().get('/meal-plan').set(auth(anaToken)).expect(404);

      expect(res.body.message).toContain('POST /meal-plan/generate');
    });

    it('GET /meal-plan/shopping-list responde 404', async () => {
      await http().get('/meal-plan/shopping-list').set(auth(anaToken)).expect(404);
    });

    it('POST /meal-plan/generate responde 400 si el usuario no configuró sus metas', async () => {
      const res = await http().post('/meal-plan/generate').set(auth(betoToken)).expect(400);

      expect(res.body.message).toContain('PATCH /users/me/macros');
      expect(await dataSource.getRepository(MealPlan).count()).toBe(0);
    });
  });

  describe('POST /meal-plan/generate', () => {
    let plan: { id: string; weekStartDate: string; days: PlanDay[] };

    beforeAll(async () => {
      const res = await http().post('/meal-plan/generate').set(auth(anaToken)).expect(201);
      plan = res.body;
    });

    it('crea un plan de 7 días con 4 comidas cada uno, en orden', () => {
      expect(plan.days.map((d) => d.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      for (const day of plan.days) {
        expect(day.meals.map((m) => m.mealType)).toEqual([
          MealType.BREAKFAST,
          MealType.LUNCH,
          MealType.DINNER,
          MealType.SNACK,
        ]);
      }
    });

    it('la semana empieza un lunes', () => {
      expect(plan.weekStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${plan.weekStartDate}T00:00:00Z`).getUTCDay()).toBe(1);
    });

    it('usa recetas de Desayuno en el desayuno y de Snack en el snack', async () => {
      const all = await dataSource.getRepository(Recipe).find({ relations: { category: true } });
      const categoryOf = new Map(all.map((r) => [r.id, r.category.name]));

      for (const day of plan.days) {
        for (const meal of day.meals) {
          const category = categoryOf.get(meal.recipe.id);
          if (meal.mealType === MealType.BREAKFAST) expect(category).toBe('Desayuno');
          else if (meal.mealType === MealType.SNACK) expect(category).toBe('Snack');
          else expect(['Desayuno', 'Snack']).not.toContain(category);
        }
      }
    });

    it('no repite una receta dentro del mismo día', () => {
      for (const day of plan.days) {
        const ids = day.meals.map((m) => m.recipe.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('cada día queda cerca de la meta de calorías (±15 %)', () => {
      for (const day of plan.days) {
        const deviation = Math.abs(day.totals.calories - goals.dailyCalories) / goals.dailyCalories;
        expect(deviation).toBeLessThanOrEqual(0.15);
      }
    });

    it('guarda en la base 1 plan con 28 entradas', async () => {
      expect(await dataSource.getRepository(MealPlan).countBy({ userId: anaId })).toBe(1);
      expect(await dataSource.getRepository(MealPlanEntry).countBy({ mealPlanId: plan.id })).toBe(28);
    });

    it('al generar de nuevo reemplaza el plan en lugar de duplicarlo', async () => {
      const again = await http().post('/meal-plan/generate').set(auth(anaToken)).expect(201);

      expect(again.body.id).not.toBe(plan.id);
      expect(await dataSource.getRepository(MealPlan).countBy({ userId: anaId })).toBe(1);
      expect(await dataSource.getRepository(MealPlanEntry).count()).toBe(28);
    });

    it('usa las metas actuales: con menos calorías el plan baja', async () => {
      await http()
        .patch('/users/me/macros')
        .set(auth(anaToken))
        .send({ dailyCalories: 1500, dailyProtein: 110, dailyCarbs: 150, dailyFat: 50 })
        .expect(200);

      const res = await http().post('/meal-plan/generate').set(auth(anaToken)).expect(201);
      const average =
        (res.body.days as PlanDay[]).reduce((sum, d) => sum + d.totals.calories, 0) / 7;

      expect(average).toBeGreaterThan(1350);
      expect(average).toBeLessThan(1650);

      // Se deja con las metas originales para las pruebas siguientes
      await http().patch('/users/me/macros').set(auth(anaToken)).send(goals).expect(200);
      await http().post('/meal-plan/generate').set(auth(anaToken)).expect(201);
    });
  });

  describe('GET /meal-plan', () => {
    it('devuelve el plan de la semana actual', async () => {
      const res = await http().get('/meal-plan').set(auth(anaToken)).expect(200);

      expect(res.body.days).toHaveLength(7);
      expect(res.body.days[0].meals).toHaveLength(4);
      expect(res.body.days[0].totals.calories).toBeGreaterThan(0);
    });

    it('es igual a lo que devolvió generate', async () => {
      const generated = await http().post('/meal-plan/generate').set(auth(anaToken)).expect(201);
      const current = await http().get('/meal-plan').set(auth(anaToken)).expect(200);

      expect(current.body).toEqual(generated.body);
    });

    it('cada usuario ve solo su plan', async () => {
      await http().get('/meal-plan').set(auth(betoToken)).expect(404);
    });
  });

  describe('GET /meal-plan/shopping-list', () => {
    it('devuelve ítems con cantidad entera, unidad y texto legible, ordenados por nombre', async () => {
      const res = await http().get('/meal-plan/shopping-list').set(auth(anaToken)).expect(200);

      const items = res.body.items as { name: string; quantity: number; unit: string; label: string }[];
      expect(res.body.weekStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(items.length).toBeGreaterThan(10);
      for (const item of items) {
        expect(Number.isInteger(item.quantity)).toBe(true);
        expect(item.quantity).toBeGreaterThan(0);
        expect(['g', 'ml', 'unidad']).toContain(item.unit);
        expect(item.label).toContain(item.name.toLowerCase());
      }
      const names = items.map((i) => i.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
    });

    it('coincide con una suma independiente hecha en SQL (receta ÷ porciones, redondeada hacia arriba)', async () => {
      const res = await http().get('/meal-plan/shopping-list').set(auth(anaToken)).expect(200);
      const items = res.body.items as { name: string; unit: string; quantity: number }[];

      const expected: { name: string; unit: string; quantity: string }[] = await dataSource.query(
        `SELECT i.name, ri.unit,
                CEIL(ROUND(SUM(ri.quantity / r."servingSize")::numeric, 6)) AS quantity
           FROM meal_plan_entries e
           JOIN meal_plans p ON p.id = e."mealPlanId"
           JOIN recipes r ON r.id = e."recipeId"
           JOIN recipe_ingredients ri ON ri."recipeId" = r.id
           JOIN ingredients i ON i.id = ri."ingredientId"
          WHERE p."userId" = $1
          GROUP BY i.name, ri.unit`,
        [anaId],
      );

      const key = (name: string, unit: string) => `${name}|${unit}`;
      expect(items).toHaveLength(expected.length);
      const byKey = new Map(items.map((i) => [key(i.name, i.unit), i.quantity]));
      for (const row of expected) {
        expect(byKey.get(key(row.name, row.unit))).toBe(Number(row.quantity));
      }
    });

    it('cada usuario ve solo su lista', async () => {
      await http().get('/meal-plan/shopping-list').set(auth(betoToken)).expect(404);
    });
  });
});
