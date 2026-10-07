import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller.js';
import { SeedKeyGuard } from './seed-key.guard.js';
import { SeedService } from './seed.service.js';

@Module({
  controllers: [SeedController],
  providers: [SeedService, SeedKeyGuard],
})
export class SeedModule {}
