import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/support/global-setup.ts'],
    setupFiles: ['./test/support/setup-env.ts'],
    // Todos los archivos comparten la misma base de datos: se ejecutan en serie
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
