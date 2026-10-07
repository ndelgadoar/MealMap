import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface.js';
import { UpdateMacrosDto } from './dto/update-macros.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/macros')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateMacros(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMacrosDto,
  ) {
    return this.usersService.updateMacros(user.id, dto);
  }
}
