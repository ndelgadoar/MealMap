import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { generate, generateSecret } from 'otplib';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { TwoFactorService } from './two-factor.service.js';

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  const usersService = {
    findByIdWithTwoFASecret: vi.fn(),
    saveTwoFASecret: vi.fn(),
    activateTwoFA: vi.fn(),
  };

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'ana@example.com',
      twoFAEnabled: false,
      twoFASecret: null,
      ...overrides,
    }) as User;

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = moduleRef.get(TwoFactorService);
  });

  describe('enable', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(null);

      await expect(service.enable('user-1')).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el 2FA ya está activo', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(
        buildUser({ twoFAEnabled: true }),
      );

      await expect(service.enable('user-1')).rejects.toThrow(ConflictException);
      expect(usersService.saveTwoFASecret).not.toHaveBeenCalled();
    });

    it('guarda un secreto nuevo y devuelve el QR sin activar el 2FA', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(buildUser());

      const result = await service.enable('user-1');

      expect(usersService.saveTwoFASecret).toHaveBeenCalledWith(
        'user-1',
        result.secret,
      );
      expect(usersService.activateTwoFA).not.toHaveBeenCalled();
      expect(result.otpauthUrl).toMatch(/^otpauth:\/\/totp\/MealMap:ana%40example\.com/);
      expect(result.otpauthUrl).toContain(`secret=${result.secret}`);
      expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('verifyAndActivate', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(null);

      await expect(
        service.verifyAndActivate('user-1', '123456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el 2FA ya está activo', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(
        buildUser({ twoFAEnabled: true, twoFASecret: generateSecret() }),
      );

      await expect(
        service.verifyAndActivate('user-1', '123456'),
      ).rejects.toThrow(ConflictException);
    });

    it('pide llamar primero a enable si no hay secreto generado', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(buildUser());

      await expect(
        service.verifyAndActivate('user-1', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.activateTwoFA).not.toHaveBeenCalled();
    });

    it('rechaza un código incorrecto y no activa el 2FA', async () => {
      usersService.findByIdWithTwoFASecret.mockResolvedValue(
        buildUser({ twoFASecret: generateSecret() }),
      );

      await expect(
        service.verifyAndActivate('user-1', '000000'),
      ).rejects.toThrow(new BadRequestException('Código inválido'));
      expect(usersService.activateTwoFA).not.toHaveBeenCalled();
    });

    it('activa el 2FA con un código correcto', async () => {
      const secret = generateSecret();
      usersService.findByIdWithTwoFASecret.mockResolvedValue(
        buildUser({ twoFASecret: secret }),
      );

      await service.verifyAndActivate('user-1', await generate({ secret }));

      expect(usersService.activateTwoFA).toHaveBeenCalledWith('user-1');
    });
  });

  describe('isCodeValid', () => {
    it('acepta el código actual y rechaza uno incorrecto', async () => {
      const secret = generateSecret();

      await expect(
        service.isCodeValid(secret, await generate({ secret })),
      ).resolves.toBe(true);
      await expect(service.isCodeValid(secret, '000000')).resolves.toBe(false);
    });
  });
});
