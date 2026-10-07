import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Category } from '../src/categories/entities/category.entity.js';
import { Ingredient } from '../src/ingredients/entities/ingredient.entity.js';
import { RecipeIngredient } from '../src/recipes/entities/recipe-ingredient.entity.js';
import { Recipe } from '../src/recipes/entities/recipe.entity.js';
import { CATEGORIES } from '../src/seed/data/categories.data.js';
import { INGREDIENTS } from '../src/seed/data/ingredients.data.js';
import { RECIPES } from '../src/seed/data/recipes.data.js';
import { User } from '../src/users/entities/user.entity.js';
import { Role } from '../src/users/enums/role.enum.js';
import { createTestApp } from './support/test-app.js';

describe('Seed (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const http = () => request(app.getHttpServer());
  const seedKey = () => process.env.SEED_KEY as string;

  const linesInRecipes = RECIPES.reduce((sum, r) => sum + r.ingredients.length, 0);

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 403 sin llave o con una llave incorrecta', async () => {
    await http().post('/seed').expect(403);
    await http().post('/seed').set('x-seed-key', 'incorrecta').expect(403);
    expect(await dataSource.getRepository(Category).count()).toBe(0);
  });

  it('carga categorías, ingredientes, recetas y el admin', async () => {
    const res = await http().post('/seed').set('x-seed-key', seedKey()).expect(201);

    expect(res.body).toEqual({
      categories: { created: CATEGORIES.length, skipped: 0 },
      ingredients: { created: INGREDIENTS.length, skipped: 0 },
      recipes: { created: RECIPES.length, skipped: 0 },
      admin: { created: 1, skipped: 0 },
    });
    expect(await dataSource.getRepository(Category).count()).toBe(CATEGORIES.length);
    expect(await dataSource.getRepository(Ingredient).count()).toBe(INGREDIENTS.length);
    expect(await dataSource.getRepository(Recipe).count()).toBe(RECIPES.length);
    expect(await dataSource.getRepository(RecipeIngredient).count()).toBe(linesInRecipes);
  });

  it('crea el admin con rol ADMIN y la contraseña hasheada', async () => {
    const admin = await dataSource.getRepository(User).findOne({
      where: { email: process.env.ADMIN_EMAIL },
      select: { id: true, role: true, password: true },
    });

    expect(admin?.role).toBe(Role.ADMIN);
    expect(admin?.password).toMatch(/^\$2[aby]\$/);
    await http()
      .post('/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
      .expect(200);
  });

  it('calcula los macros por porción como números positivos', async () => {
    const recipe = await dataSource
      .getRepository(Recipe)
      .findOneByOrFail({ name: 'Pollo con arroz y brócoli' });

    // 400 g pollo + 150 g arroz + 200 g brócoli + 10 ml aceite + 5 g ajo, entre 2 porciones
    expect(typeof recipe.calories).toBe('number');
    expect(recipe.calories).toBeCloseTo(685.68, 1);
    expect(recipe.protein).toBeCloseTo(70.29, 1);
    expect(recipe.servingSize).toBe(2);
  });

  it('es idempotente: una segunda llamada no crea ni duplica nada', async () => {
    const res = await http().post('/seed').set('x-seed-key', seedKey()).expect(201);

    expect(res.body).toEqual({
      categories: { created: 0, skipped: CATEGORIES.length },
      ingredients: { created: 0, skipped: INGREDIENTS.length },
      recipes: { created: 0, skipped: RECIPES.length },
      admin: { created: 0, skipped: 1 },
    });
    expect(await dataSource.getRepository(Recipe).count()).toBe(RECIPES.length);
    expect(await dataSource.getRepository(User).count()).toBe(1);
  });

  it('queda deshabilitado (403) si no hay SEED_KEY configurada', async () => {
    const original = process.env.SEED_KEY;
    delete process.env.SEED_KEY;
    try {
      const res = await http().post('/seed').set('x-seed-key', 'cualquiera');
      expect(res.status).toBe(403);
    } finally {
      process.env.SEED_KEY = original;
    }
  });
});
