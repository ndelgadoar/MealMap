import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './support/test-app.js';

describe('Roles (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // El admin sale del seed; el usuario normal se registra por la API
    await http().post('/seed').set('x-seed-key', process.env.SEED_KEY as string).expect(201);
    const admin = await http()
      .post('/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
      .expect(200);
    adminToken = admin.body.accessToken;

    const credentials = { email: 'user@example.com', password: 'password123' };
    await http().post('/auth/register').send(credentials).expect(201);
    const user = await http().post('/auth/login').send(credentials).expect(200);
    userToken = user.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('sin token responde 401', async () => {
    await http().get('/_probe/admin').expect(401);
  });

  it('un USER recibe 403 en una ruta de ADMIN', async () => {
    await http().get('/_probe/admin').set('Authorization', `Bearer ${userToken}`).expect(403);
  });

  it('un ADMIN accede a una ruta de ADMIN', async () => {
    await http().get('/_probe/admin').set('Authorization', `Bearer ${adminToken}`).expect(200);
  });

  it('una ruta sin @Roles() admite a cualquier usuario autenticado', async () => {
    await http().get('/_probe/any').set('Authorization', `Bearer ${userToken}`).expect(200);
    await http().get('/_probe/any').set('Authorization', `Bearer ${adminToken}`).expect(200);
  });
});
