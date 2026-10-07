import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/enums/role.enum.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  let guard: RolesGuard;

  const contextWith = (user?: { role: Role }) =>
    ({
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    vi.resetAllMocks();
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite el acceso si la ruta no define @Roles()', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextWith({ role: Role.USER }))).toBe(true);
  });

  it('permite el acceso si @Roles() está vacío', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(contextWith({ role: Role.USER }))).toBe(true);
  });

  it('permite al usuario cuyo rol está en la lista', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(contextWith({ role: Role.ADMIN }))).toBe(true);
  });

  it('permite si el rol coincide con cualquiera de varios', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.USER]);

    expect(guard.canActivate(contextWith({ role: Role.USER }))).toBe(true);
  });

  it('niega al usuario cuyo rol no está en la lista', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(contextWith({ role: Role.USER }))).toBe(false);
  });

  it('niega si no hay usuario en la petición (falla cerrado)', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(contextWith(undefined))).toBe(false);
  });
});
