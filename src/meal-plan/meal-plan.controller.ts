import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface.js';
import { Role } from '../users/enums/role.enum.js';
import {
  ShoppingListResponse,
  WeeklyPlanResponse,
} from './dto/meal-plan-response.dto.js';
import { MealPlanService } from './meal-plan.service.js';

const NO_PLAN_THIS_WEEK =
  'El usuario no tiene un plan para la semana actual (se crea con POST /meal-plan/generate)';

@ApiTags('Meal plan')
@Controller('meal-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Falta el token, es inválido, expiró o la sesión fue cerrada' })
@ApiForbiddenResponse({ description: 'Solo los usuarios con rol USER pueden usar el plan semanal' })
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generar el plan semanal',
    description:
      'Arma un plan de 7 días con 4 comidas por día (desayuno, almuerzo, cena y snack) que se acerca a las metas de macros del usuario, con 1 porción por comida. Si ya había un plan para la semana actual (de lunes a domingo), lo reemplaza.',
  })
  @ApiCreatedResponse({ type: WeeklyPlanResponse, description: 'Plan generado, con los totales de macros de cada día' })
  @ApiBadRequestResponse({
    description:
      'El usuario no tiene configuradas las 4 metas de macros (se configuran con PATCH /users/me/macros) o el catálogo no tiene recetas',
  })
  generate(@CurrentUser() user: AuthenticatedUser) {
    return this.mealPlanService.generate(user.id);
  }

  @Get('shopping-list')
  @ApiOperation({
    summary: 'Lista de compras de la semana',
    description:
      'Suma los ingredientes de las recetas del plan actual (1 porción por comida; las cantidades de cada receta se dividen entre sus porciones) y las redondea hacia arriba al entero. Incluye un texto listo para mostrar, por ejemplo "1,06 kg de pechuga de pollo".',
  })
  @ApiOkResponse({ type: ShoppingListResponse })
  @ApiNotFoundResponse({ description: NO_PLAN_THIS_WEEK })
  getShoppingList(@CurrentUser() user: AuthenticatedUser) {
    return this.mealPlanService.getShoppingList(user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Ver el plan de la semana actual',
    description: 'Devuelve los 7 días con sus comidas en orden y los totales de macros de cada día.',
  })
  @ApiOkResponse({ type: WeeklyPlanResponse })
  @ApiNotFoundResponse({ description: NO_PLAN_THIS_WEEK })
  getCurrentPlan(@CurrentUser() user: AuthenticatedUser) {
    return this.mealPlanService.getCurrentPlan(user.id);
  }
}
