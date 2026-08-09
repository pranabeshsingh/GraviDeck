import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  test: {
    exclude: ['**/node_modules/**', '**/tests/e2e/**']
  }
});
