import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../users/enums/role.enum.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { RevokedToken } from './entities/revoked-token.entity.js';
import { TwoFactorService } from './two-factor.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;

  const usersService = {
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    create: vi.fn(),
  };
  const jwtService = { signAsync: vi.fn() };
  const twoFactorService = { isCodeValid: vi.fn() };
  const revokedTokensRepository = { save: vi.fn(), existsBy: vi.fn() };

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'ana@example.com',
      password: passwordHash,
      role: Role.USER,
      twoFAEnabled: false,
      twoFASecret: null,
      ...overrides,
    }) as User;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('password123', 4);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    jwtService.signAsync.mockResolvedValue('signed.jwt.token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: TwoFactorService, useValue: twoFactorService },
        {
          provide: getRepositoryToken(RevokedToken),
          useValue: revokedTokensRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('guarda la contraseña como hash y devuelve solo id, email y rol', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation(
        (data: Pick<User, 'email' | 'password'>) =>
          Promise.resolve({ id: 'new-id', role: Role.USER, ...data }),
      );

      const result = await service.register({
        email: 'ana@example.com',
        password: 'password123',
      });

      const saved = usersService.create.mock.calls[0][0] as Pick<
        User,
        'email' | 'password'
      >;
      expect(saved.password).not.toBe('password123');
      expect(await bcrypt.compare('password123', saved.password)).toBe(true);
      expect(result).toEqual({
        id: 'new-id',
        email: 'ana@example.com',
        role: Role.USER,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('lanza ConflictException si el email ya existe', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({ email: 'ana@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('devuelve un accessToken firmado con un jti único', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(buildUser());

      const result = await service.login({
        email: 'ana@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'signed.jwt.token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', email: 'ana@example.com', role: Role.USER },
        { jwtid: expect.any(String) },
      );
    });

    it('rechaza una contraseña incorrecta', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(buildUser());

      await expect(
        service.login({ email: 'ana@example.com', password: 'incorrecta1' }),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('usa el mismo mensaje cuando el email no existe', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nadie@example.com', password: 'password123' }),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
    });

    describe('con 2FA activo', () => {
      beforeEach(() => {
        usersService.findByEmailWithPassword.mockResolvedValue(
          buildUser({ twoFAEnabled: true, twoFASecret: 'SECRET' }),
        );
      });

      it('exige el código si no se envía', async () => {
        await expect(
          service.login({ email: 'ana@example.com', password: 'password123' }),
        ).rejects.toThrow(new UnauthorizedException('Se requiere el código 2FA'));
      });

      it('rechaza un código incorrecto', async () => {
        twoFactorService.isCodeValid.mockResolvedValue(false);

        await expect(
          service.login({
            email: 'ana@example.com',
            password: 'password123',
            totpCode: '000000',
          }),
        ).rejects.toThrow(new UnauthorizedException('Código 2FA inválido'));
        expect(twoFactorService.isCodeValid).toHaveBeenCalledWith(
          'SECRET',
          '000000',
        );
      });

      it('devuelve el token con un código correcto', async () => {
        twoFactorService.isCodeValid.mockResolvedValue(true);

        const result = await service.login({
          email: 'ana@example.com',
          password: 'password123',
          totpCode: '123456',
        });

        expect(result).toEqual({ accessToken: 'signed.jwt.token' });
      });
    });

    it('ignora totpCode si el usuario no tiene 2FA activo', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(buildUser());

      await service.login({
        email: 'ana@example.com',
        password: 'password123',
        totpCode: '123456',
      });

      expect(twoFactorService.isCodeValid).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('guarda el jti con la fecha de expiración del token', async () => {
      const exp = 1_900_000_000;

      await service.logout({
        id: 'user-1',
        email: 'ana@example.com',
        role: Role.USER,
        jti: 'jti-123',
        exp,
      });

      expect(revokedTokensRepository.save).toHaveBeenCalledWith({
        jti: 'jti-123',
        expiresAt: new Date(exp * 1000),
      });
    });
  });

  describe('isTokenRevoked', () => {
    it('consulta si el jti está en la lista de revocados', async () => {
      revokedTokensRepository.existsBy.mockResolvedValue(true);

      await expect(service.isTokenRevoked('jti-123')).resolves.toBe(true);
      expect(revokedTokensRepository.existsBy).toHaveBeenCalledWith({
        jti: 'jti-123',
      });
    });
  });
});
