import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface.js';
import { MacrosResponseDto } from './dto/macros-response.dto.js';
import { UpdateMacrosDto } from './dto/update-macros.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/macros')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar mis metas diarias de macros',
    description:
      'Actualización parcial: solo se cambian las metas que se envíen. Las cuatro metas deben estar configuradas para poder generar el plan semanal.',
  })
  @ApiOkResponse({ type: MacrosResponseDto, description: 'Las 4 metas resultantes (null las que aún no se configuran)' })
  @ApiBadRequestResponse({ description: 'Valor fuera de rango, no entero o campo desconocido' })
  @ApiUnauthorizedResponse({ description: 'Falta el token, es inválido, expiró o la sesión fue cerrada' })
  updateMacros(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMacrosDto,
  ) {
    return this.usersService.updateMacros(user.id, dto);
  }
}
