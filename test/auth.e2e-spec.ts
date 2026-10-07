import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generate } from 'otplib';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity.js';
import { Role } from '../src/users/enums/role.enum.js';
import { createTestApp } from './support/test-app.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const http = () => request(app.getHttpServer());

  const credentials = { email: 'ana@example.com', password: 'password123' };

  const login = (body: Record<string, string> = credentials) =>
    http().post('/auth/login').send(body);
  const tokenOf = async () => (await login()).body.accessToken as string;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('crea el usuario con rol USER y sin exponer la contraseña', async () => {
      const res = await http()
        .post('/auth/register')
        .send({ email: 'Ana@Example.com ', password: credentials.password })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.any(String),
        email: 'ana@example.com',
        role: Role.USER,
      });

      const stored = await dataSource.getRepository(User).findOne({
        where: { email: 'ana@example.com' },
        select: { id: true, password: true },
      });
      expect(stored?.password).toMatch(/^\$2[aby]\$/);
      expect(stored?.password).not.toBe(credentials.password);
    });

    it('responde 409 si el email ya existe (sin distinguir mayúsculas)', async () => {
      await http()
        .post('/auth/register')
        .send({ email: 'ANA@example.com', password: 'otraClave123' })
        .expect(409);
    });

    it.each([
      ['email inválido', { email: 'no-es-email', password: 'password123' }],
      ['contraseña corta', { email: 'b@example.com', password: '123' }],
      ['faltan campos', {}],
      ['intento de asignar rol', { email: 'c@example.com', password: 'password123', role: 'ADMIN' }],
    ])('responde 400 con %s', async (_caso, body) => {
      await http().post('/auth/register').send(body).expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('devuelve un accessToken JWT', async () => {
      const res = await login();

      expect(res.status).toBe(200);
      expect(res.body.accessToken.split('.')).toHaveLength(3);
    });

    it('acepta el email en otro formato de mayúsculas', async () => {
      const res = await login({ email: 'ANA@example.com', password: credentials.password });

      expect(res.status).toBe(200);
    });

    it('responde 401 con el mismo mensaje si falla la contraseña o el email', async () => {
      const badPassword = await login({ email: credentials.email, password: 'incorrecta1' });
      const badEmail = await login({ email: 'nadie@example.com', password: credentials.password });

      expect(badPassword.status).toBe(401);
      expect(badEmail.status).toBe(401);
      expect(badPassword.body.message).toBe('Credenciales inválidas');
      expect(badEmail.body.message).toBe(badPassword.body.message);
    });
  });

  describe('POST /auth/logout y validez del token', () => {
    it('responde 401 sin token', async () => {
      await http().post('/auth/logout').expect(401);
    });

    it('responde 401 con un token mal formado', async () => {
      await http().post('/auth/logout').set('Authorization', 'Bearer no.es.jwt').expect(401);
    });

    it('responde 401 con un token expirado', async () => {
      const jwt = app.get(JwtService);
      const expired = await jwt.signAsync(
        { sub: 'x', email: credentials.email, role: Role.USER },
        { jwtid: 'expired-jti', expiresIn: -10 },
      );

      await http().post('/auth/logout').set('Authorization', `Bearer ${expired}`).expect(401);
    });

    it('cierra la sesión: el token deja de ser válido', async () => {
      const token = await tokenOf();

      await http().post('/auth/logout').set('Authorization', `Bearer ${token}`).expect(204);

      const reuse = await http().post('/auth/logout').set('Authorization', `Bearer ${token}`);
      expect(reuse.status).toBe(401);
      expect(reuse.body.message).toBe('Sesión cerrada');
    });

    it('un login posterior genera un token nuevo que sí funciona', async () => {
      const token = await tokenOf();

      await http().post('/auth/logout').set('Authorization', `Bearer ${token}`).expect(204);
    });
  });

  describe('2FA', () => {
    let token: string;
    let secret: string;

    beforeAll(async () => {
      token = await tokenOf();
    });

    const auth = () => ({ Authorization: `Bearer ${token}` });

    it('enable y verify exigen estar autenticado', async () => {
      await http().post('/auth/2fa/enable').expect(401);
      await http().post('/auth/2fa/verify').send({ code: '123456' }).expect(401);
    });

    it('verify falla si antes no se llamó a enable', async () => {
      await http().post('/auth/2fa/verify').set(auth()).send({ code: '123456' }).expect(400);
    });

    it('enable devuelve el QR y el secreto sin activar el 2FA', async () => {
      const res = await http().post('/auth/2fa/enable').set(auth()).expect(201);

      secret = res.body.secret;
      expect(secret).toEqual(expect.any(String));
      expect(res.body.otpauthUrl).toContain('otpauth://totp/MealMap:ana%40example.com');
      expect(res.body.qrCode).toMatch(/^data:image\/png;base64,/);

      // Aún sin activar: el login no pide código
      expect((await login()).status).toBe(200);
    });

    it('verify rechaza un código incorrecto o con formato inválido', async () => {
      await http().post('/auth/2fa/verify').set(auth()).send({ code: '000000' }).expect(400);
      await http().post('/auth/2fa/verify').set(auth()).send({ code: '12' }).expect(400);
    });

    it('verify con el código correcto activa el 2FA', async () => {
      const code = await generate({ secret });

      const res = await http().post('/auth/2fa/verify').set(auth()).send({ code }).expect(200);

      expect(res.body).toEqual({ message: '2FA activado' });
      const user = await dataSource.getRepository(User).findOneByOrFail({ email: credentials.email });
      expect(user.twoFAEnabled).toBe(true);
    });

    it('enable ya no se puede repetir con el 2FA activo', async () => {
      await http().post('/auth/2fa/enable').set(auth()).expect(409);
    });

    it('el login exige un código válido', async () => {
      const missing = await login();
      expect(missing.status).toBe(401);
      expect(missing.body.message).toBe('Se requiere el código 2FA');

      const wrong = await login({ ...credentials, totpCode: '000000' });
      expect(wrong.status).toBe(401);
      expect(wrong.body.message).toBe('Código 2FA inválido');

      const ok = await login({ ...credentials, totpCode: await generate({ secret }) });
      expect(ok.status).toBe(200);
      expect(ok.body.accessToken).toEqual(expect.any(String));
    });
  });
});
