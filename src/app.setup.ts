import { INestApplication, ValidationPipe } from '@nestjs/common';

// Configuración compartida por main.ts y las pruebas de integración
export function configureApp(app: INestApplication): void {
  // Valida los DTOs y descarta campos que no estén declarados en ellos
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}
