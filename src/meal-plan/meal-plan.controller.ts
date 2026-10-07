import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface.js';
import { Role } from '../users/enums/role.enum.js';
import { MealPlanService } from './meal-plan.service.js';

@ApiTags('Meal plan')
@Controller('meal-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@ApiBearerAuth()
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post('generate')
  @ApiOperation({
    summary:
      'Genera el plan de 7 días (4 comidas por día) según las metas de macros. Reemplaza el plan de la semana si ya existía.',
  })
  generate(@CurrentUser() user: AuthenticatedUser) {
    return this.mealPlanService.generate(user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Ver el plan de la semana actual, con los totales de macros de cada día',
  })
  getCurrentPlan(@CurrentUser() user: AuthenticatedUser) {
    return this.mealPlanService.getCurrentPlan(user.id);
  }
}
