import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedKeyGuard } from './seed-key.guard.js';
import { SeedService } from './seed.service.js';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @UseGuards(SeedKeyGuard)
  run() {
    return this.seedService.run();
  }
}
