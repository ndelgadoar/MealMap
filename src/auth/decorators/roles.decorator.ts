import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum.js';

export const ROLES_KEY = 'roles';

// Uso: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(Role.ADMIN)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
