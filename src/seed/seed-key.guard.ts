import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';

// Protege POST /seed: exige el header x-seed-key igual a SEED_KEY.
// Si SEED_KEY no está configurada, el seed queda deshabilitado.
@Injectable()
export class SeedKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('SEED_KEY');
    if (!expected) {
      throw new ForbiddenException('El seed está deshabilitado (falta SEED_KEY)');
    }

    const { headers } = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const provided = headers['x-seed-key'];
    if (typeof provided !== 'string' || !this.safeEqual(provided, expected)) {
      throw new ForbiddenException('Llave de seed inválida');
    }
    return true;
  }

  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}
