import { config } from 'dotenv';

// Carga .env (si existe) para tomar host, puerto y credenciales de PostgreSQL
config({ quiet: true });

// Valores por defecto para entornos sin .env (por ejemplo, CI)
process.env.DB_HOST ??= 'localhost';
process.env.DB_PORT ??= '5432';
process.env.DB_USER ??= 'mealmap';
process.env.DB_PASSWORD ??= 'mealmap_dev';

// Valores forzados: las pruebas NUNCA deben tocar la base de datos de desarrollo,
// porque cada archivo borra y recrea el esquema.
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'mealmap_test';
process.env.JWT_SECRET = 'e2e-test-secret';
process.env.JWT_EXPIRES_IN_SECONDS = '3600';
process.env.SEED_KEY = 'e2e-seed-key';
process.env.ADMIN_EMAIL = 'admin-e2e@mealmap.test';
process.env.ADMIN_PASSWORD = 'Admin-E2E-12345';
