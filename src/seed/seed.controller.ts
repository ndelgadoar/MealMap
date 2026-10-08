import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SeedKeyGuard } from './seed-key.guard.js';
import { SeedService } from './seed.service.js';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @UseGuards(SeedKeyGuard)
  @ApiHeader({
    name: 'x-seed-key',
    description: 'Debe coincidir con SEED_KEY del .env',
    required: true,
  })
  @ApiOperation({
    summary: 'Cargar los datos iniciales',
    description:
      'Crea las categorías, los ingredientes, las recetas (con sus ingredientes y macros por porción) y el usuario admin. Es idempotente: solo crea lo que no existe y nunca sobrescribe datos.',
  })
  @ApiCreatedResponse({
    description: 'Resumen de lo creado y de lo que ya existía',
    schema: {
      example: {
        categories: { created: 5, skipped: 0 },
        ingredients: { created: 77, skipped: 0 },
        recipes: { created: 81, skipped: 0 },
        admin: { created: 1, skipped: 0 },
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Falta el header x-seed-key, la llave es incorrecta o SEED_KEY no está configurada (seed deshabilitado)' })
  run() {
    return this.seedService.run();
  }
}
