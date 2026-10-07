import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
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
  run() {
    return this.seedService.run();
  }
}
