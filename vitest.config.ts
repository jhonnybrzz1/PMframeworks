import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['server/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
});
