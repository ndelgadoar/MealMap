import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../src/auth/guards/roles.guard.js';
import { Roles } from '../../src/auth/decorators/roles.decorator.js';
import { Role } from '../../src/users/enums/role.enum.js';

// Rutas que existen SOLO en las pruebas, para ejercitar los guards con HTTP real
@Controller('_probe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProbeController {
  @Get('admin')
  @Roles(Role.ADMIN)
  adminOnly() {
    return { ok: true };
  }

  @Get('any')
  anyAuthenticated() {
    return { ok: true };
  }
}
