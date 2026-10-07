import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../users/enums/role.enum.js';
import { AuthService } from '../auth.service.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  const authService = { isTokenRevoked: vi.fn() };
  const config = { getOrThrow: vi.fn().mockReturnValue('test-secret') };
  let strategy: JwtStrategy;

  const payload: JwtPayload = {
    sub: 'user-1',
    email: 'ana@example.com',
    role: Role.ADMIN,
    jti: 'jti-123',
    exp: 1_900_000_000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new JwtStrategy(
      config as unknown as ConfigService,
      authService as unknown as AuthService,
    );
  });

  it('lee el secreto desde JWT_SECRET', () => {
    expect(config.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('convierte el payload en el usuario autenticado', async () => {
    authService.isTokenRevoked.mockResolvedValue(false);

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 'user-1',
      email: 'ana@example.com',
      role: Role.ADMIN,
      jti: 'jti-123',
      exp: 1_900_000_000,
    });
    expect(authService.isTokenRevoked).toHaveBeenCalledWith('jti-123');
  });

  it('rechaza un token revocado por logout', async () => {
    authService.isTokenRevoked.mockResolvedValue(true);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
