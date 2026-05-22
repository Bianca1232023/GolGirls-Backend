import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.js', 'src/__tests__/e2e/**/*.e2e.test.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['src/__tests__/e2e/setup.js'],
  },
});
