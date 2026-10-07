import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { AdminProbeController } from './admin-probe.controller.js';

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
}

// Levanta la app completa contra mealmap_test y deja el esquema vacío
export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [AdminProbeController],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();

  const dataSource = app.get(DataSource);
  await dataSource.synchronize(true); // borra y recrea todas las tablas
  return { app, dataSource };
}
